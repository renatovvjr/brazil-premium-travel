begin;

create or replace function public.workspace_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.workspace_is_admin() from public;
grant execute on function public.workspace_is_admin() to authenticated;

drop policy if exists profiles_admin_read on public.profiles;
create policy profiles_admin_read on public.profiles
for select to authenticated using (public.workspace_is_admin());
create policy workspace_profile_role_audit_admin_read on public.workspace_profile_role_audit
for select to authenticated using (public.workspace_is_admin());
grant select on public.workspace_profile_role_audit to authenticated;

alter table public.workspace_products enable row level security;
alter table public.workspace_departures enable row level security;
alter table public.workspace_offers enable row level security;
alter table public.crm_customers enable row level security;
alter table public.crm_customer_contact_points enable row level security;
alter table public.workspace_agency_partners enable row level security;
alter table public.workspace_form_submissions enable row level security;
alter table public.workspace_idempotency_keys enable row level security;
alter table public.workspace_email_outbox_events enable row level security;
alter table public.crm_leads enable row level security;
alter table public.crm_lead_status_history enable row level security;
alter table public.crm_interactions enable row level security;
alter table public.crm_marketing_consent_events enable row level security;
alter table public.crm_marketing_suppressions enable row level security;
alter table public.workspace_audit_log enable row level security;
alter table public.workspace_bookings enable row level security;
alter table public.workspace_booking_passengers enable row level security;
alter table public.workspace_payments enable row level security;
alter table public.workspace_refunds enable row level security;
alter table public.workspace_agency_commissions enable row level security;
alter table public.workspace_payment_audit enable row level security;
alter table public.workspace_refund_audit enable row level security;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'workspace_products', 'workspace_departures', 'workspace_offers',
    'crm_customers', 'crm_customer_contact_points', 'workspace_agency_partners',
    'crm_leads', 'crm_marketing_suppressions',
    'workspace_bookings', 'workspace_booking_passengers', 'workspace_agency_commissions'
  ]
  loop
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.workspace_is_admin()) with check (public.workspace_is_admin())',
      table_name || '_admin_all', table_name
    );
  end loop;

  foreach table_name in array array[
    'workspace_idempotency_keys', 'crm_lead_status_history', 'workspace_audit_log',
    'workspace_payment_audit', 'workspace_refund_audit', 'workspace_payments', 'workspace_refunds',
    'workspace_form_submissions', 'workspace_email_outbox_events'
  ]
  loop
    execute format(
      'create policy %I on public.%I for select to authenticated using (public.workspace_is_admin())',
      table_name || '_admin_read', table_name
    );
  end loop;

  foreach table_name in array array['crm_interactions', 'crm_marketing_consent_events']
  loop
    execute format(
      'create policy %I on public.%I for select to authenticated using (public.workspace_is_admin())',
      table_name || '_admin_read', table_name
    );
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (public.workspace_is_admin())',
      table_name || '_admin_append', table_name
    );
  end loop;
end;
$$;

grant select, insert, update on
  public.workspace_products, public.workspace_departures, public.workspace_offers,
  public.crm_customers, public.crm_customer_contact_points, public.workspace_agency_partners,
  public.crm_leads, public.crm_marketing_suppressions,
  public.workspace_bookings, public.workspace_booking_passengers, public.workspace_agency_commissions
to authenticated;

grant select on
  public.workspace_idempotency_keys, public.crm_lead_status_history, public.workspace_audit_log,
  public.workspace_payment_audit, public.workspace_refund_audit,
  public.workspace_booking_financial_summary, public.workspace_payments, public.workspace_refunds,
  public.workspace_form_submissions, public.workspace_email_outbox_events
to authenticated;

grant select, insert on public.crm_interactions, public.crm_marketing_consent_events to authenticated;

create or replace function public.workspace_intake_submit(
  p_form_type text,
  p_product_code text,
  p_payload jsonb,
  p_attribution jsonb,
  p_idempotency_key text,
  p_request_hash text,
  p_ip_hash text,
  p_user_agent text,
  p_environment text default 'staging'
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_key_hash text := encode(digest(p_idempotency_key, 'sha256'), 'hex');
  v_existing public.workspace_idempotency_keys%rowtype;
  v_product_id uuid;
  v_departure_id uuid;
  v_customer_id uuid;
  v_submission_id uuid;
  v_submission_reference text;
  v_lead_id uuid;
  v_agency_partner_id uuid;
  v_email text := lower(trim(p_payload->>'email'));
  v_phone text := trim(coalesce(p_payload->>'phoneNormalized', ''));
  v_result jsonb;
begin
  if p_environment not in ('local', 'staging', 'production') then
    raise exception 'invalid_environment';
  end if;
  if p_form_type not in ('carnaval_enquiry', 'signature_application', 'whatsapp_consultation') then
    raise exception 'invalid_form_type';
  end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' or v_email = '' then
    raise exception 'invalid_payload';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('workspace-intake:' || v_key_hash, 0));

  select * into v_existing
  from public.workspace_idempotency_keys
  where scope = 'workspace-intake' and key_hash = v_key_hash and expires_at > now();

  if found then
    if v_existing.request_hash <> p_request_hash then
      raise exception 'idempotency_conflict';
    end if;
    return coalesce(v_existing.response_body, '{}'::jsonb) || jsonb_build_object('replayed', true);
  end if;

  if p_ip_hash is not null and (
    select count(*) from public.workspace_form_submissions
    where ip_hash = p_ip_hash and received_at > now() - interval '10 minutes'
  ) >= 5 then
    raise exception 'rate_limit_exceeded';
  end if;

  select id into v_product_id
  from public.workspace_products
  where code = p_product_code and status = 'active';
  if v_product_id is null then raise exception 'product_not_available'; end if;

  select id into v_departure_id
  from public.workspace_departures
  where product_id = v_product_id and status in ('planning', 'open')
  order by starts_on nulls last
  limit 1;

  select id into v_agency_partner_id
  from public.workspace_agency_partners
  where code = nullif(p_attribution->>'agency', '') and status = 'active';

  select customer_id into v_customer_id
  from public.crm_customer_contact_points
  where kind = 'email' and normalized_value = v_email and active
  limit 1;

  if v_customer_id is null then
    insert into public.crm_customers(display_name, country_of_residence, city)
    values (p_payload->>'fullName', nullif(p_payload->>'countryOfResidence', ''), nullif(p_payload->>'city', ''))
    returning id into v_customer_id;

    insert into public.crm_customer_contact_points(customer_id, kind, value, normalized_value, is_primary)
    values (v_customer_id, 'email', p_payload->>'email', v_email, true);
  end if;

  if v_phone <> '' then
    insert into public.crm_customer_contact_points(customer_id, kind, value, normalized_value, is_primary)
    values (v_customer_id, 'phone', p_payload->>'phone', v_phone, true)
    on conflict do nothing;
  end if;

  insert into public.workspace_form_submissions(
    form_type, product_id, departure_id, customer_id, payload, attribution,
    ip_hash, user_agent, environment, retention_until
  ) values (
    p_form_type, v_product_id, v_departure_id, v_customer_id, p_payload,
    coalesce(p_attribution, '{}'::jsonb), p_ip_hash, left(p_user_agent, 500), p_environment,
    current_date + interval '7 years'
  ) returning id, reference into v_submission_id, v_submission_reference;

  insert into public.crm_leads(
    customer_id, product_id, departure_id, submission_id, agency_partner_id, source, campaign
  ) values (
    v_customer_id, v_product_id, v_departure_id, v_submission_id, v_agency_partner_id,
    coalesce(nullif(p_attribution->>'source', ''), p_form_type),
    nullif(p_attribution->>'campaign', '')
  ) returning id into v_lead_id;

  insert into public.crm_lead_status_history(lead_id, to_status, reason)
  values (v_lead_id, 'new', 'Secure form submission');

  insert into public.workspace_email_outbox_events(submission_id, template_key, recipient_kind, deduplication_key)
  values
    (v_submission_id, p_form_type, 'team', v_submission_id::text || ':team'),
    (v_submission_id, p_form_type, 'customer', v_submission_id::text || ':customer');

  v_result := jsonb_build_object('submissionReference', v_submission_reference, 'replayed', false);
  insert into public.workspace_idempotency_keys(
    scope, key_hash, request_hash, submission_id, response_status, response_body, expires_at
  ) values (
    'workspace-intake', v_key_hash, p_request_hash, v_submission_id, 201, v_result, now() + interval '24 hours'
  );

  return v_result;
end;
$$;

revoke all on function public.workspace_intake_submit(text, text, jsonb, jsonb, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.workspace_intake_submit(text, text, jsonb, jsonb, text, text, text, text, text) to service_role;

create or replace function public.workspace_change_lead_status(p_lead_id uuid, p_status text, p_reason text default null)
returns public.crm_leads
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_before text;
  v_result public.crm_leads;
begin
  if not public.workspace_is_admin() then raise exception 'access_denied'; end if;
  if p_status not in ('new', 'contacted', 'qualified', 'proposal_sent', 'booked', 'lost') then raise exception 'invalid_status'; end if;
  select status into v_before from public.crm_leads where id = p_lead_id for update;
  update public.crm_leads set status = p_status, lost_reason = case when p_status = 'lost' then p_reason else null end
  where id = p_lead_id returning * into v_result;
  if v_result.id is null then raise exception 'lead_not_found'; end if;
  return v_result;
end;
$$;

create or replace function public.workspace_audit_lead_status()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if old.status is distinct from new.status then
    insert into public.crm_lead_status_history(lead_id, from_status, to_status, reason, changed_by)
    values (new.id, old.status, new.status, new.lost_reason, auth.uid());
  end if;
  return new;
end;
$$;

create trigger crm_leads_status_audit
after update of status on public.crm_leads
for each row execute function public.workspace_audit_lead_status();

create or replace function public.workspace_record_manual_payment(
  p_booking_id uuid, p_reference text, p_amount_minor bigint, p_method text,
  p_due_on date default null, p_confirm_received boolean default false, p_note text default null
)
returns public.workspace_payments
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_booking public.workspace_bookings; v_result public.workspace_payments;
begin
  if not public.workspace_is_admin() then raise exception 'access_denied'; end if;
  select * into v_booking from public.workspace_bookings where id = p_booking_id for update;
  if v_booking.id is null then raise exception 'booking_not_found'; end if;
  insert into public.workspace_payments(
    booking_id, reference, amount_minor, currency, status, payment_method, source,
    due_on, received_at, note, created_by
  ) values (
    p_booking_id, p_reference, p_amount_minor, v_booking.currency,
    case when p_confirm_received then 'manual_confirmed' else 'pending' end,
    p_method, 'manual', p_due_on, case when p_confirm_received then now() end, p_note, auth.uid()
  ) returning * into v_result;
  return v_result;
end;
$$;

create or replace function public.workspace_record_refund(
  p_booking_id uuid, p_reference text, p_amount_minor bigint, p_reason text,
  p_payment_id uuid default null, p_completed boolean default false, p_note text default null
)
returns public.workspace_refunds
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_booking public.workspace_bookings; v_available bigint; v_result public.workspace_refunds;
begin
  if not public.workspace_is_admin() then raise exception 'access_denied'; end if;
  select * into v_booking from public.workspace_bookings where id = p_booking_id for update;
  if v_booking.id is null then raise exception 'booking_not_found'; end if;
  if p_payment_id is not null and not exists (
    select 1 from public.workspace_payments where id = p_payment_id and booking_id = p_booking_id
  ) then raise exception 'payment_booking_mismatch'; end if;
  select net_received_minor into v_available from public.workspace_booking_financial_summary where booking_id = p_booking_id;
  if p_completed and p_amount_minor > greatest(v_available, 0) then raise exception 'refund_exceeds_net_received'; end if;
  insert into public.workspace_refunds(
    booking_id, payment_id, reference, amount_minor, currency, status, reason,
    completed_at, note, created_by
  ) values (
    p_booking_id, p_payment_id, p_reference, p_amount_minor, v_booking.currency,
    case when p_completed then 'completed' else 'requested' end,
    p_reason, case when p_completed then now() end, p_note, auth.uid()
  ) returning * into v_result;
  return v_result;
end;
$$;

grant execute on function public.workspace_change_lead_status(uuid, text, text) to authenticated;
grant execute on function public.workspace_record_manual_payment(uuid, text, bigint, text, date, boolean, text) to authenticated;
grant execute on function public.workspace_record_refund(uuid, text, bigint, text, uuid, boolean, text) to authenticated;

create view public.workspace_commercial_kpis
with (security_invoker = true)
as
select
  p.id as product_id,
  p.code as product_code,
  p.name as product_name,
  count(distinct l.id)::bigint as lead_count,
  count(distinct l.id) filter (where l.status = 'booked')::bigint as booked_lead_count,
  (select count(*) from public.workspace_bookings booking where booking.product_id = p.id)::bigint as booking_count,
  coalesce((select sum(booking.agreed_price_minor) from public.workspace_bookings booking where booking.product_id = p.id and booking.status <> 'cancelled'), 0)::bigint as booked_revenue_minor
from public.workspace_products p
left join public.crm_leads l on l.product_id = p.id
group by p.id, p.code, p.name;

grant select on public.workspace_commercial_kpis to authenticated;

commit;
