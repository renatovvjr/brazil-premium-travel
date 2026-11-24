begin;

create table public.workspace_marketing_campaigns (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[a-z0-9-]+$'),
  name text not null,
  channel text not null check (channel in ('email', 'search', 'social', 'partner', 'referral', 'other')),
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'completed', 'archived')),
  utm_source text,
  utm_medium text,
  utm_campaign text,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table public.workspace_proposals (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('PRP-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  lead_id uuid not null references public.crm_leads(id),
  product_id uuid not null references public.workspace_products(id),
  departure_id uuid references public.workspace_departures(id),
  offer_id uuid references public.workspace_offers(id),
  status text not null default 'draft' check (status in ('draft', 'sent', 'accepted', 'declined', 'expired', 'superseded')),
  currency char(3) not null default 'AUD' check (currency = upper(currency)),
  quoted_price_minor bigint not null check (quoted_price_minor >= 0),
  passenger_count integer not null check (passenger_count > 0),
  valid_until timestamptz,
  notes text,
  sent_at timestamptz,
  accepted_at timestamptz,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status <> 'sent' or sent_at is not null),
  check (status <> 'accepted' or accepted_at is not null)
);

create index workspace_proposals_lead_idx on public.workspace_proposals(lead_id, created_at desc);
create index workspace_proposals_status_idx on public.workspace_proposals(status, valid_until);

alter table public.crm_leads add column marketing_campaign_id uuid references public.workspace_marketing_campaigns(id);
alter table public.crm_leads add column utm_source text;
alter table public.crm_leads add column utm_medium text;
alter table public.crm_leads add column utm_term text;
alter table public.crm_leads add column utm_content text;
alter table public.crm_leads add column referrer text;
create index crm_leads_campaign_idx on public.crm_leads(marketing_campaign_id, created_at desc);
create index crm_leads_utm_idx on public.crm_leads(utm_source, utm_medium, campaign);

alter table public.workspace_bookings add column accepted_proposal_id uuid references public.workspace_proposals(id);

create table public.workspace_booking_price_snapshots (
  id bigint generated always as identity primary key,
  booking_id uuid not null references public.workspace_bookings(id),
  agreed_price_minor bigint not null check (agreed_price_minor >= 0),
  currency char(3) not null check (currency = upper(currency)),
  source text not null check (source in ('booking_created', 'proposal_accepted', 'manual_revision')),
  reason text,
  created_by uuid,
  created_at timestamptz not null default now()
);

create index workspace_price_snapshots_booking_idx
  on public.workspace_booking_price_snapshots(booking_id, created_at desc);

create or replace function public.workspace_apply_lead_attribution()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_attribution jsonb;
begin
  if new.submission_id is null then return new; end if;
  select attribution into v_attribution
  from public.workspace_form_submissions where id = new.submission_id;
  new.utm_source := nullif(v_attribution->>'source', '');
  new.utm_medium := nullif(v_attribution->>'medium', '');
  new.utm_term := nullif(v_attribution->>'term', '');
  new.utm_content := nullif(v_attribution->>'content', '');
  new.referrer := nullif(v_attribution->>'referrer', '');
  select id into new.marketing_campaign_id
  from public.workspace_marketing_campaigns
  where code = nullif(v_attribution->>'campaign', '')
     or utm_campaign = nullif(v_attribution->>'campaign', '')
  order by case when code = nullif(v_attribution->>'campaign', '') then 0 else 1 end
  limit 1;
  return new;
end;
$$;

create or replace function public.workspace_capture_booking_price()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.workspace_booking_price_snapshots(
      booking_id, agreed_price_minor, currency, source, reason, created_by
    ) values (
      new.id, new.agreed_price_minor, new.currency, 'booking_created', null, auth.uid()
    );
  elsif old.agreed_price_minor is distinct from new.agreed_price_minor
     or old.currency is distinct from new.currency
     or old.accepted_proposal_id is distinct from new.accepted_proposal_id then
    insert into public.workspace_booking_price_snapshots(
      booking_id, agreed_price_minor, currency, source, reason, created_by
    ) values (
      new.id, new.agreed_price_minor, new.currency,
      case when new.accepted_proposal_id is not null then 'proposal_accepted' else 'manual_revision' end,
      case when new.accepted_proposal_id is not null then 'Accepted proposal linked' else 'Agreed booking price changed' end,
      auth.uid()
    );
  end if;
  return new;
end;
$$;

create trigger crm_leads_apply_attribution
before insert on public.crm_leads
for each row execute function public.workspace_apply_lead_attribution();

create trigger workspace_bookings_price_snapshot_insert
after insert on public.workspace_bookings
for each row execute function public.workspace_capture_booking_price();

create trigger workspace_bookings_price_snapshot_update
after update of agreed_price_minor, currency, accepted_proposal_id on public.workspace_bookings
for each row execute function public.workspace_capture_booking_price();

create trigger workspace_campaigns_updated_at
before update on public.workspace_marketing_campaigns
for each row execute function public.workspace_set_updated_at();

create trigger workspace_proposals_updated_at
before update on public.workspace_proposals
for each row execute function public.workspace_set_updated_at();

alter table public.workspace_marketing_campaigns enable row level security;
alter table public.workspace_proposals enable row level security;
alter table public.workspace_booking_price_snapshots enable row level security;

create policy workspace_campaigns_admin_all on public.workspace_marketing_campaigns
for all to authenticated using (public.workspace_is_admin()) with check (public.workspace_is_admin());
create policy workspace_proposals_admin_all on public.workspace_proposals
for all to authenticated using (public.workspace_is_admin()) with check (public.workspace_is_admin());
create policy workspace_price_snapshots_admin_read on public.workspace_booking_price_snapshots
for select to authenticated using (public.workspace_is_admin());

grant select, insert, update on public.workspace_marketing_campaigns, public.workspace_proposals to authenticated;
grant select on public.workspace_booking_price_snapshots to authenticated;

revoke all on function public.workspace_apply_lead_attribution() from public, anon, authenticated;
revoke all on function public.workspace_capture_booking_price() from public, anon, authenticated;

commit;
