begin;

create table if not exists public.workspace_legacy_crm_imports (
  id uuid primary key default gen_random_uuid(),
  source_table text not null check (source_table in ('leads', 'luxury_applications')),
  source_id text not null,
  customer_id uuid not null references public.crm_customers(id),
  lead_id uuid not null unique references public.crm_leads(id),
  source_created_at timestamptz,
  imported_at timestamptz not null default now(),
  unique(source_table, source_id)
);

create index if not exists workspace_legacy_crm_imports_customer_idx
  on public.workspace_legacy_crm_imports(customer_id, imported_at desc);

alter table public.workspace_legacy_crm_imports enable row level security;

drop policy if exists workspace_legacy_crm_imports_admin_read
on public.workspace_legacy_crm_imports;

create policy workspace_legacy_crm_imports_admin_read
on public.workspace_legacy_crm_imports
for select to authenticated
using (public.workspace_is_admin());

revoke all on public.workspace_legacy_crm_imports from anon, authenticated;
grant select on public.workspace_legacy_crm_imports to authenticated;

select pg_advisory_xact_lock(hashtext('workspace_legacy_crm_import_v1'));

do $$
declare
  source_row record;
  customer_id_value uuid;
  lead_id_value uuid;
  product_id_value uuid;
  normalized_email text;
  display_name_value text;
  created_at_value timestamptz;
begin
  select id into product_id_value
  from public.workspace_products
  where code = 'signature-journey';

  if product_id_value is null then
    raise exception 'signature-journey product is required for legacy CRM import';
  end if;

  for source_row in
    select * from public.leads order by id
  loop
    if exists (
      select 1 from public.workspace_legacy_crm_imports
      where source_table = 'leads' and source_id = source_row.id::text
    ) then
      continue;
    end if;

    normalized_email := nullif(lower(trim(source_row.email)), '');
    display_name_value := coalesce(
      nullif(trim(source_row.full_name), ''),
      nullif(trim(concat_ws(' ', source_row.first_name, source_row.last_name)), ''),
      nullif(split_part(coalesce(source_row.email, ''), '@', 1), ''),
      'Legacy contact'
    );
    created_at_value := coalesce(source_row.created_at, now());
    customer_id_value := null;

    if normalized_email is not null then
      select customer_id into customer_id_value
      from public.crm_customer_contact_points
      where kind = 'email' and normalized_value = normalized_email and active
      order by created_at, id
      limit 1;
    end if;

    if customer_id_value is null then
      insert into public.crm_customers(
        display_name, country_of_residence, city, created_at, updated_at
      ) values (
        display_name_value,
        nullif(trim(source_row.country_of_residence), ''),
        nullif(trim(source_row.city), ''),
        created_at_value,
        created_at_value
      ) returning id into customer_id_value;
    else
      update public.crm_customers
      set country_of_residence = coalesce(country_of_residence, nullif(trim(source_row.country_of_residence), '')),
          city = coalesce(city, nullif(trim(source_row.city), ''))
      where id = customer_id_value;
    end if;

    if normalized_email is not null then
      insert into public.crm_customer_contact_points(
        customer_id, kind, value, normalized_value, is_primary, created_at
      ) values (
        customer_id_value, 'email', source_row.email, normalized_email, true, created_at_value
      )
      on conflict (kind, normalized_value) where active do nothing;
    end if;

    insert into public.crm_leads(
      customer_id, product_id, source, campaign, status, created_at, updated_at
    ) values (
      customer_id_value,
      product_id_value,
      coalesce(nullif(trim(source_row.source), ''), 'legacy_leads'),
      nullif(trim(source_row.referral_source), ''),
      'new',
      created_at_value,
      created_at_value
    ) returning id into lead_id_value;

    insert into public.workspace_legacy_crm_imports(
      source_table, source_id, customer_id, lead_id, source_created_at
    ) values (
      'leads', source_row.id::text, customer_id_value, lead_id_value, created_at_value
    );

    insert into public.crm_lead_status_history(
      lead_id, to_status, reason, changed_at
    ) values (
      lead_id_value, 'new', 'Imported from public.leads:' || source_row.id::text, created_at_value
    );

    if nullif(trim(source_row.message), '') is not null then
      insert into public.crm_interactions(
        customer_id, lead_id, interaction_type, occurred_at, summary, created_at
      ) values (
        customer_id_value, lead_id_value, 'note', created_at_value,
        source_row.message, created_at_value
      );
    end if;
  end loop;
end;
$$;

do $$
declare
  source_row record;
  customer_id_value uuid;
  lead_id_value uuid;
  product_id_value uuid;
  normalized_email text;
  normalized_phone text;
  display_name_value text;
  created_at_value timestamptz;
  status_value text;
begin
  select id into product_id_value
  from public.workspace_products
  where code = 'signature-journey';

  if product_id_value is null then
    raise exception 'signature-journey product is required for legacy CRM import';
  end if;

  for source_row in
    select * from public.luxury_applications order by created_at, id
  loop
    if exists (
      select 1 from public.workspace_legacy_crm_imports
      where source_table = 'luxury_applications' and source_id = source_row.id::text
    ) then
      continue;
    end if;

    normalized_email := nullif(lower(trim(source_row.email)), '');
    normalized_phone := nullif(regexp_replace(coalesce(source_row.whatsapp, ''), '[^0-9+]', '', 'g'), '');
    display_name_value := coalesce(
      nullif(trim(source_row.full_name), ''),
      nullif(split_part(coalesce(source_row.email, ''), '@', 1), ''),
      'Legacy contact'
    );
    created_at_value := coalesce(source_row.submission_timestamp, source_row.created_at, now());
    status_value := case lower(trim(coalesce(source_row.status, '')))
      when 'contacted' then 'contacted'
      when 'qualified' then 'qualified'
      when 'proposal sent' then 'proposal_sent'
      when 'proposal_sent' then 'proposal_sent'
      when 'booked' then 'booked'
      when 'lost' then 'lost'
      else 'new'
    end;
    customer_id_value := null;

    if normalized_email is not null then
      select customer_id into customer_id_value
      from public.crm_customer_contact_points
      where kind = 'email' and normalized_value = normalized_email and active
      order by created_at, id
      limit 1;
    end if;

    if customer_id_value is null and normalized_phone is not null then
      select customer_id into customer_id_value
      from public.crm_customer_contact_points
      where kind = 'phone' and normalized_value = normalized_phone and active
      order by created_at, id
      limit 1;
    end if;

    if customer_id_value is null then
      insert into public.crm_customers(display_name, created_at, updated_at)
      values (display_name_value, created_at_value, created_at_value)
      returning id into customer_id_value;
    end if;

    if normalized_email is not null then
      insert into public.crm_customer_contact_points(
        customer_id, kind, value, normalized_value, is_primary, created_at
      ) values (
        customer_id_value, 'email', source_row.email, normalized_email, true, created_at_value
      )
      on conflict (kind, normalized_value) where active do nothing;
    end if;

    if normalized_phone is not null then
      insert into public.crm_customer_contact_points(
        customer_id, kind, value, normalized_value, is_primary, created_at
      ) values (
        customer_id_value, 'phone', source_row.whatsapp, normalized_phone,
        normalized_email is null, created_at_value
      )
      on conflict (kind, normalized_value) where active do nothing;
    end if;

    insert into public.crm_leads(
      customer_id, product_id, source, status, created_at, updated_at
    ) values (
      customer_id_value,
      product_id_value,
      coalesce(nullif(trim(source_row.source), ''), 'legacy_luxury_applications'),
      status_value,
      created_at_value,
      greatest(created_at_value, coalesce(source_row.contacted_at, created_at_value))
    ) returning id into lead_id_value;

    insert into public.workspace_legacy_crm_imports(
      source_table, source_id, customer_id, lead_id, source_created_at
    ) values (
      'luxury_applications', source_row.id::text, customer_id_value, lead_id_value, created_at_value
    );

    insert into public.crm_lead_status_history(
      lead_id, to_status, reason, changed_at
    ) values (
      lead_id_value, status_value,
      'Imported from public.luxury_applications:' || source_row.id::text,
      greatest(created_at_value, coalesce(source_row.contacted_at, created_at_value))
    );

    if nullif(trim(source_row.notes), '') is not null then
      insert into public.crm_interactions(
        customer_id, lead_id, interaction_type, occurred_at, summary, created_at
      ) values (
        customer_id_value, lead_id_value, 'note', created_at_value,
        source_row.notes, created_at_value
      );
    end if;

    if nullif(trim(source_row.dream_experience), '') is not null then
      insert into public.crm_interactions(
        customer_id, lead_id, interaction_type, occurred_at, summary, created_at
      ) values (
        customer_id_value, lead_id_value, 'note', created_at_value,
        'Legacy dream experience: ' || source_row.dream_experience, created_at_value
      );
    end if;

    if nullif(trim(source_row.assigned_to), '') is not null then
      insert into public.crm_interactions(
        customer_id, lead_id, interaction_type, occurred_at, summary, created_at
      ) values (
        customer_id_value, lead_id_value, 'system', created_at_value,
        'Legacy assignee: ' || source_row.assigned_to, created_at_value
      );
    end if;
  end loop;
end;
$$;

commit;
