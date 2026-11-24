begin;

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
  v_key_hash text := encode(extensions.digest(p_idempotency_key, 'sha256'), 'hex');
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

commit;
