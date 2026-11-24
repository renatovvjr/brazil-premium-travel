begin;

create table public.workspace_bookings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('CBT-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  customer_id uuid not null references public.crm_customers(id),
  lead_id uuid references public.crm_leads(id),
  product_id uuid not null references public.workspace_products(id),
  departure_id uuid references public.workspace_departures(id),
  agency_partner_id uuid references public.workspace_agency_partners(id),
  status text not null default 'draft' check (status in ('draft', 'provisional', 'confirmed', 'cancelled', 'completed')),
  currency char(3) not null default 'AUD' check (currency = upper(currency)),
  agreed_price_minor bigint not null check (agreed_price_minor >= 0),
  passenger_count integer not null check (passenger_count > 0),
  booked_at timestamptz,
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  cancellation_reason text,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status <> 'cancelled' or (cancelled_at is not null and nullif(trim(cancellation_reason), '') is not null))
);

create index workspace_bookings_customer_idx on public.workspace_bookings(customer_id, created_at desc);
create index workspace_bookings_product_idx on public.workspace_bookings(product_id, status, created_at desc);
create unique index workspace_bookings_active_lead_uidx on public.workspace_bookings(lead_id)
  where lead_id is not null and status <> 'cancelled';

create table public.workspace_booking_passengers (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.workspace_bookings(id),
  customer_id uuid references public.crm_customers(id),
  display_name text not null,
  passenger_type text not null default 'adult' check (passenger_type in ('adult', 'child', 'infant')),
  is_lead_passenger boolean not null default false,
  created_at timestamptz not null default now()
);

create index workspace_passengers_booking_idx on public.workspace_booking_passengers(booking_id);

create table public.workspace_payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.workspace_bookings(id),
  reference text not null unique,
  amount_minor bigint not null check (amount_minor > 0),
  currency char(3) not null check (currency = upper(currency)),
  status text not null default 'pending' check (status in ('pending', 'manual_confirmed', 'processor_verified', 'voided')),
  payment_method text not null check (payment_method in ('bank_transfer', 'cash', 'card_processor', 'other')),
  source text not null default 'manual' check (source in ('manual', 'processor')),
  due_on date,
  received_at timestamptz,
  processor_reference text,
  note text,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (source <> 'processor' or processor_reference is not null),
  check (status <> 'processor_verified' or source = 'processor')
);

create index workspace_payments_booking_idx on public.workspace_payments(booking_id, status, created_at);

create table public.workspace_refunds (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.workspace_bookings(id),
  payment_id uuid references public.workspace_payments(id),
  reference text not null unique,
  amount_minor bigint not null check (amount_minor > 0),
  currency char(3) not null check (currency = upper(currency)),
  status text not null default 'requested' check (status in ('requested', 'approved', 'completed', 'rejected', 'cancelled')),
  reason text not null,
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  processor_reference text,
  note text,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status <> 'completed' or completed_at is not null)
);

create index workspace_refunds_booking_idx on public.workspace_refunds(booking_id, status, created_at);

create table public.workspace_agency_commissions (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.workspace_bookings(id),
  agency_partner_id uuid not null references public.workspace_agency_partners(id),
  commission_bps integer not null check (commission_bps between 0 and 10000),
  commissionable_amount_minor bigint not null check (commissionable_amount_minor >= 0),
  commission_amount_minor bigint generated always as ((commissionable_amount_minor * commission_bps) / 10000) stored,
  currency char(3) not null check (currency = upper(currency)),
  status text not null default 'estimated' check (status in ('estimated', 'approved', 'payable', 'paid', 'cancelled')),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_payment_audit (
  id bigint generated always as identity primary key,
  payment_id uuid not null,
  action text not null check (action in ('insert', 'update')),
  actor_id uuid,
  before_state jsonb,
  after_state jsonb not null,
  occurred_at timestamptz not null default now()
);

create table public.workspace_refund_audit (
  id bigint generated always as identity primary key,
  refund_id uuid not null,
  action text not null check (action in ('insert', 'update')),
  actor_id uuid,
  before_state jsonb,
  after_state jsonb not null,
  occurred_at timestamptz not null default now()
);

create or replace function public.workspace_audit_financial_row()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'financial_records_cannot_be_deleted';
  end if;

  if tg_table_name = 'workspace_payments' then
    insert into public.workspace_payment_audit(payment_id, action, actor_id, before_state, after_state)
    values (new.id, lower(tg_op), auth.uid(), case when tg_op = 'UPDATE' then to_jsonb(old) end, to_jsonb(new));
  elsif tg_table_name = 'workspace_refunds' then
    insert into public.workspace_refund_audit(refund_id, action, actor_id, before_state, after_state)
    values (new.id, lower(tg_op), auth.uid(), case when tg_op = 'UPDATE' then to_jsonb(old) end, to_jsonb(new));
  end if;
  return new;
end;
$$;

create trigger workspace_bookings_updated_at before update on public.workspace_bookings for each row execute function public.workspace_set_updated_at();
create trigger workspace_payments_updated_at before update on public.workspace_payments for each row execute function public.workspace_set_updated_at();
create trigger workspace_refunds_updated_at before update on public.workspace_refunds for each row execute function public.workspace_set_updated_at();
create trigger workspace_commissions_updated_at before update on public.workspace_agency_commissions for each row execute function public.workspace_set_updated_at();
create trigger workspace_payments_audit before insert or update or delete on public.workspace_payments for each row execute function public.workspace_audit_financial_row();
create trigger workspace_refunds_audit before insert or update or delete on public.workspace_refunds for each row execute function public.workspace_audit_financial_row();

create view public.workspace_booking_financial_summary
with (security_invoker = true)
as
select
  b.id as booking_id,
  b.reference,
  b.currency,
  b.agreed_price_minor,
  coalesce(p.payments_minor, 0)::bigint as payments_minor,
  coalesce(r.refunds_minor, 0)::bigint as refunds_minor,
  (coalesce(p.payments_minor, 0) - coalesce(r.refunds_minor, 0))::bigint as net_received_minor,
  greatest(b.agreed_price_minor - (coalesce(p.payments_minor, 0) - coalesce(r.refunds_minor, 0)), 0)::bigint as outstanding_minor,
  case
    when coalesce(p.payments_minor, 0) - coalesce(r.refunds_minor, 0) <= 0 then 'pending'
    when b.agreed_price_minor - (coalesce(p.payments_minor, 0) - coalesce(r.refunds_minor, 0)) <= 0 then 'paid'
    else 'partial'
  end as payment_state
from public.workspace_bookings b
left join lateral (
  select sum(amount_minor)::bigint as payments_minor
  from public.workspace_payments
  where booking_id = b.id and status in ('manual_confirmed', 'processor_verified')
) p on true
left join lateral (
  select sum(amount_minor)::bigint as refunds_minor
  from public.workspace_refunds
  where booking_id = b.id and status = 'completed'
) r on true;

commit;
