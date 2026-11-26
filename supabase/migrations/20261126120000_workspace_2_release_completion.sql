begin;

alter table public.workspace_agency_partners
  add column contact_phone text,
  add column country text;

alter table public.workspace_marketing_campaigns
  add column email_subject text,
  add column email_body text;

insert into public.workspace_products(code, name, category)
values ('all-inclusive', 'Curated Brazil All-Inclusive', 'signature')
on conflict (code) do nothing;

-- The booking command captures the amount and agency rate. Administrators may
-- reconcile commission status without changing either historical value.
revoke insert, update, delete on public.workspace_agency_commissions from public, anon, authenticated;
grant update (status, paid_at) on public.workspace_agency_commissions to authenticated;

create trigger workspace_agency_commissions_audit
after update on public.workspace_agency_commissions
for each row execute function public.workspace_audit_booking_row();

alter table public.workspace_email_outbox_events
  add column booking_email_payload jsonb;

create function public.workspace_confirm_booking_and_notify(p_booking_id uuid, p_notify boolean)
returns public.workspace_bookings
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  booking public.workspace_bookings;
  destination text;
  customer_name text;
begin
  if not public.workspace_is_admin() then raise exception 'access_denied'; end if;
  booking := public.workspace_confirm_booking(p_booking_id);
  if p_notify then
    select value into destination from public.crm_customer_contact_points
    where customer_id = booking.customer_id and kind = 'email' and active
    order by is_primary desc, created_at, id limit 1;
    if destination is null then raise exception 'booking_email_missing'; end if;
    select display_name into customer_name from public.crm_customers where id = booking.customer_id;
    insert into public.workspace_email_outbox_events (
      template_key, recipient_kind, deduplication_key, booking_email_payload
    ) values (
      'booking_confirmation', 'customer', booking.id::text || ':booking_confirmation',
      jsonb_build_object('email', destination, 'fullName', customer_name, 'reference', booking.reference)
    ) on conflict (deduplication_key) do nothing;
  end if;
  return booking;
end;
$$;

revoke all on function public.workspace_confirm_booking_and_notify(uuid, boolean) from public, anon, authenticated;
grant execute on function public.workspace_confirm_booking_and_notify(uuid, boolean) to authenticated;

create or replace function public.workspace_claim_outbox(p_limit integer default 10)
returns table(event_id uuid, submission_id uuid, template_key text, recipient_kind text, payload jsonb)
language sql
security definer
set search_path = public, pg_temp
as $$
  with claimed as (
    select event.id
    from public.workspace_email_outbox_events event
    where (
      (event.status in ('pending', 'failed') and event.next_attempt_at <= now())
      or (event.status = 'processing' and event.locked_at < now() - interval '15 minutes')
    )
    and event.attempt_count < 5
    order by event.created_at
    for update skip locked
    limit least(greatest(p_limit, 1), 25)
  ), updated as (
    update public.workspace_email_outbox_events event
    set status = 'processing', locked_at = now(), attempt_count = attempt_count + 1
    from claimed
    where event.id = claimed.id
    returning event.*
  )
  select updated.id, updated.submission_id, updated.template_key, updated.recipient_kind,
    coalesce(updated.booking_email_payload, submission.payload)
  from updated
  left join public.workspace_form_submissions submission on submission.id = updated.submission_id;
$$;

-- Serialize enquiries for the same normalized email so concurrent submissions
-- cannot create competing customer records.
create function public.workspace_submit_enquiry(
  p_form_type text, p_product_code text, p_payload jsonb, p_attribution jsonb,
  p_idempotency_key text, p_request_hash text, p_ip_hash text, p_user_agent text, p_environment text
)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  perform pg_advisory_xact_lock(hashtextextended('workspace-contact:' || lower(trim(p_payload->>'email')), 0));
  return public.workspace_intake_submit(
    p_form_type, p_product_code, p_payload, p_attribution,
    p_idempotency_key, p_request_hash, p_ip_hash, p_user_agent, p_environment
  );
end;
$$;

revoke all on function public.workspace_submit_enquiry(text, text, jsonb, jsonb, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.workspace_submit_enquiry(text, text, jsonb, jsonb, text, text, text, text, text) to service_role;

commit;
