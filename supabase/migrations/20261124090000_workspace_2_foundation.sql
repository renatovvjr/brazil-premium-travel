begin;

create extension if not exists pgcrypto;

create or replace function public.workspace_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.workspace_products (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[a-z0-9-]+$'),
  name text not null,
  category text not null check (category in ('signature', 'carnaval', 'custom')),
  status text not null default 'active' check (status in ('draft', 'active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_departures (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.workspace_products(id),
  code text not null unique,
  starts_on date,
  ends_on date,
  capacity integer check (capacity is null or capacity > 0),
  status text not null default 'planning' check (status in ('planning', 'open', 'closed', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on is null or starts_on is null or ends_on >= starts_on)
);

create table public.workspace_offers (
  id uuid primary key default gen_random_uuid(),
  departure_id uuid not null references public.workspace_departures(id),
  code text not null unique,
  currency char(3) not null default 'AUD' check (currency = upper(currency)),
  price_minor bigint not null check (price_minor >= 0),
  pricing_basis text not null,
  valid_from timestamptz,
  valid_until timestamptz,
  status text not null default 'active' check (status in ('draft', 'active', 'expired', 'withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (valid_until is null or valid_from is null or valid_until > valid_from)
);

create table public.crm_customers (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  country_of_residence text,
  city text,
  lifecycle_status text not null default 'lead' check (lifecycle_status in ('lead', 'customer', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.crm_customer_contact_points (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.crm_customers(id),
  kind text not null check (kind in ('email', 'phone')),
  value text not null,
  normalized_value text not null,
  is_primary boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  retired_at timestamptz
);

create unique index crm_contact_points_active_identity_uidx
  on public.crm_customer_contact_points(kind, normalized_value)
  where active;
create index crm_contact_points_customer_idx on public.crm_customer_contact_points(customer_id);

create table public.workspace_agency_partners (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  legal_name text not null,
  trading_name text,
  contact_name text,
  contact_email text,
  default_commission_bps integer not null default 0 check (default_commission_bps between 0 and 10000),
  status text not null default 'active' check (status in ('prospect', 'active', 'suspended', 'inactive')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_form_submissions (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('ENQ-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))),
  form_type text not null check (form_type in ('carnaval_enquiry', 'signature_application', 'whatsapp_consultation')),
  schema_version integer not null default 1,
  product_id uuid not null references public.workspace_products(id),
  departure_id uuid references public.workspace_departures(id),
  customer_id uuid references public.crm_customers(id),
  payload jsonb not null,
  attribution jsonb not null default '{}'::jsonb,
  ip_hash text,
  user_agent text,
  environment text not null default 'staging' check (environment in ('local', 'staging', 'production')),
  received_at timestamptz not null default now(),
  retention_until date,
  check (jsonb_typeof(payload) = 'object'),
  check (jsonb_typeof(attribution) = 'object')
);

create index workspace_form_submissions_received_idx on public.workspace_form_submissions(received_at desc);
create index workspace_form_submissions_product_idx on public.workspace_form_submissions(product_id, received_at desc);
create index workspace_form_submissions_customer_idx on public.workspace_form_submissions(customer_id);
create index workspace_form_submissions_attribution_gin on public.workspace_form_submissions using gin(attribution);

create table public.workspace_idempotency_keys (
  id uuid primary key default gen_random_uuid(),
  scope text not null,
  key_hash text not null,
  request_hash text not null,
  submission_id uuid references public.workspace_form_submissions(id),
  response_status integer,
  response_body jsonb,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  unique(scope, key_hash)
);

create index workspace_idempotency_expiry_idx on public.workspace_idempotency_keys(expires_at);

create table public.workspace_email_outbox_events (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid references public.workspace_form_submissions(id),
  template_key text not null,
  recipient_kind text not null check (recipient_kind in ('team', 'customer')),
  deduplication_key text not null unique,
  status text not null default 'pending' check (status in ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  next_attempt_at timestamptz not null default now(),
  provider_message_id text,
  last_error_code text,
  locked_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index workspace_outbox_pending_idx
  on public.workspace_email_outbox_events(next_attempt_at, created_at)
  where status in ('pending', 'failed');

create table public.crm_leads (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.crm_customers(id),
  product_id uuid not null references public.workspace_products(id),
  departure_id uuid references public.workspace_departures(id),
  submission_id uuid references public.workspace_form_submissions(id),
  agency_partner_id uuid references public.workspace_agency_partners(id),
  source text,
  campaign text,
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'proposal_sent', 'booked', 'lost')),
  assigned_admin_id uuid,
  follow_up_at timestamptz,
  lost_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index crm_leads_pipeline_idx on public.crm_leads(status, follow_up_at, created_at desc);
create index crm_leads_customer_idx on public.crm_leads(customer_id, created_at desc);
create index crm_leads_product_idx on public.crm_leads(product_id, created_at desc);

create table public.crm_lead_status_history (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.crm_leads(id),
  from_status text,
  to_status text not null,
  reason text,
  changed_by uuid,
  changed_at timestamptz not null default now()
);

create table public.crm_interactions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.crm_customers(id),
  lead_id uuid references public.crm_leads(id),
  interaction_type text not null check (interaction_type in ('note', 'email', 'phone', 'whatsapp', 'meeting', 'system')),
  occurred_at timestamptz not null default now(),
  summary text not null,
  created_by uuid,
  created_at timestamptz not null default now()
);

create index crm_interactions_customer_idx on public.crm_interactions(customer_id, occurred_at desc);
create index crm_interactions_lead_idx on public.crm_interactions(lead_id, occurred_at desc);

create table public.crm_marketing_consent_events (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.crm_customers(id),
  channel text not null check (channel in ('email', 'sms', 'whatsapp')),
  action text not null check (action in ('granted', 'withdrawn')),
  lawful_basis text,
  source text not null,
  evidence jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  recorded_by uuid,
  check (jsonb_typeof(evidence) = 'object')
);

create index crm_consent_customer_idx on public.crm_marketing_consent_events(customer_id, channel, occurred_at desc);

create table public.crm_marketing_suppressions (
  id uuid primary key default gen_random_uuid(),
  contact_kind text not null check (contact_kind in ('email', 'phone')),
  normalized_value text not null,
  reason text not null,
  created_at timestamptz not null default now(),
  lifted_at timestamptz,
  unique(contact_kind, normalized_value)
);

create table public.workspace_audit_log (
  id bigint generated always as identity primary key,
  table_name text not null,
  record_id uuid,
  action text not null,
  actor_id uuid,
  before_state jsonb,
  after_state jsonb,
  occurred_at timestamptz not null default now()
);

create index workspace_audit_record_idx on public.workspace_audit_log(table_name, record_id, occurred_at desc);

create trigger workspace_products_updated_at before update on public.workspace_products for each row execute function public.workspace_set_updated_at();
create trigger workspace_departures_updated_at before update on public.workspace_departures for each row execute function public.workspace_set_updated_at();
create trigger workspace_offers_updated_at before update on public.workspace_offers for each row execute function public.workspace_set_updated_at();
create trigger crm_customers_updated_at before update on public.crm_customers for each row execute function public.workspace_set_updated_at();
create trigger workspace_agencies_updated_at before update on public.workspace_agency_partners for each row execute function public.workspace_set_updated_at();
create trigger workspace_outbox_updated_at before update on public.workspace_email_outbox_events for each row execute function public.workspace_set_updated_at();
create trigger crm_leads_updated_at before update on public.crm_leads for each row execute function public.workspace_set_updated_at();

commit;
