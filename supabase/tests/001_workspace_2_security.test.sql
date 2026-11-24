begin;

do $$
declare
  relation_name text;
  policy_count integer;
begin
  foreach relation_name in array array[
    'workspace_products', 'crm_customers', 'crm_leads', 'workspace_bookings',
    'workspace_payments', 'workspace_refunds', 'workspace_agency_partners',
    'crm_customer_tags', 'crm_unsubscribe_tokens', 'workspace_marketing_campaigns',
    'workspace_proposals', 'workspace_booking_price_snapshots', 'profiles',
    'workspace_profile_role_audit'
  ]
  loop
    if not (select relrowsecurity from pg_class where oid = ('public.' || relation_name)::regclass) then
      raise exception 'RLS is not enabled on %', relation_name;
    end if;
    select count(*) into policy_count from pg_policies where schemaname = 'public' and tablename = relation_name;
    if policy_count = 0 then raise exception 'No RLS policy exists on %', relation_name; end if;
    if has_table_privilege('anon', 'public.' || relation_name, 'SELECT') then
      raise exception 'anon unexpectedly has SELECT on %', relation_name;
    end if;
  end loop;

  if has_function_privilege('anon', 'public.workspace_intake_submit(text,text,jsonb,jsonb,text,text,text,text,text)', 'EXECUTE') then
    raise exception 'anon unexpectedly can execute workspace_intake_submit';
  end if;
  if has_function_privilege('anon', 'public.workspace_consume_unsubscribe(text)', 'EXECUTE') then
    raise exception 'anon unexpectedly can execute workspace_consume_unsubscribe';
  end if;
end;
$$;

rollback;
