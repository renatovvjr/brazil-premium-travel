begin;

create table public.crm_customer_tags (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.crm_customers(id),
  tag text not null check (tag ~ '^[a-z0-9][a-z0-9-]{0,49}$'),
  active boolean not null default true,
  created_by uuid,
  created_at timestamptz not null default now(),
  retired_at timestamptz,
  unique(customer_id, tag)
);

create index crm_customer_tags_active_idx on public.crm_customer_tags(tag, customer_id) where active;

create table public.crm_unsubscribe_tokens (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.crm_customers(id),
  channel text not null check (channel in ('email', 'sms', 'whatsapp')),
  token_hash text not null unique check (length(token_hash) = 64),
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index crm_unsubscribe_tokens_expiry_idx on public.crm_unsubscribe_tokens(expires_at) where used_at is null;

create or replace function public.crm_apply_marketing_withdrawal()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_contact record;
begin
  if new.action <> 'withdrawn' then return new; end if;
  for v_contact in
    select kind, normalized_value
    from public.crm_customer_contact_points
    where customer_id = new.customer_id and active
      and ((new.channel = 'email' and kind = 'email') or (new.channel in ('sms', 'whatsapp') and kind = 'phone'))
  loop
    insert into public.crm_marketing_suppressions(contact_kind, normalized_value, reason)
    values (v_contact.kind, v_contact.normalized_value, 'Consent withdrawn via ' || new.source)
    on conflict (contact_kind, normalized_value) do update
      set reason = excluded.reason, lifted_at = null;
  end loop;
  return new;
end;
$$;

create trigger crm_marketing_withdrawal_suppression
after insert on public.crm_marketing_consent_events
for each row execute function public.crm_apply_marketing_withdrawal();

create or replace function public.workspace_consume_unsubscribe(p_token_hash text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_token public.crm_unsubscribe_tokens;
begin
  select * into v_token
  from public.crm_unsubscribe_tokens
  where token_hash = p_token_hash and used_at is null and expires_at > now()
  for update;
  if v_token.id is null then return false; end if;

  insert into public.crm_marketing_consent_events(customer_id, channel, action, source, evidence)
  values (v_token.customer_id, v_token.channel, 'withdrawn', 'public_unsubscribe', jsonb_build_object('token_id', v_token.id));
  update public.crm_unsubscribe_tokens set used_at = now() where id = v_token.id;
  return true;
end;
$$;

alter table public.crm_customer_tags enable row level security;
alter table public.crm_unsubscribe_tokens enable row level security;

create policy crm_customer_tags_admin_all on public.crm_customer_tags
for all to authenticated using (public.workspace_is_admin()) with check (public.workspace_is_admin());
create policy crm_unsubscribe_tokens_admin_read on public.crm_unsubscribe_tokens
for select to authenticated using (public.workspace_is_admin());

grant select, insert, update on public.crm_customer_tags to authenticated;
grant select on public.crm_unsubscribe_tokens to authenticated;

revoke all on function public.workspace_consume_unsubscribe(text) from public, anon, authenticated;
grant execute on function public.workspace_consume_unsubscribe(text) to service_role;

create view public.crm_marketing_eligibility
with (security_invoker = true)
as
select
  contact.customer_id,
  contact.id as contact_point_id,
  contact.kind as contact_kind,
  contact.value as contact_value,
  consent.action as latest_consent,
  exists (
    select 1 from public.crm_marketing_suppressions suppression
    where suppression.contact_kind = contact.kind
      and suppression.normalized_value = contact.normalized_value
      and suppression.lifted_at is null
  ) as suppressed,
  consent.action = 'granted' and not exists (
    select 1 from public.crm_marketing_suppressions suppression
    where suppression.contact_kind = contact.kind
      and suppression.normalized_value = contact.normalized_value
      and suppression.lifted_at is null
  ) as eligible
from public.crm_customer_contact_points contact
left join lateral (
  select event.action
  from public.crm_marketing_consent_events event
  where event.customer_id = contact.customer_id
    and ((contact.kind = 'email' and event.channel = 'email') or (contact.kind = 'phone' and event.channel in ('sms', 'whatsapp')))
  order by event.occurred_at desc, event.id desc
  limit 1
) consent on true
where contact.active;

grant select on public.crm_marketing_eligibility to authenticated;

commit;
