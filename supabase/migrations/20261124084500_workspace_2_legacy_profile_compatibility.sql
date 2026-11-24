begin;

create or replace function public.workspace_profiles_legacy_email_compat()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
begin
  if new.email is null then
    select coalesce(
      users.email,
      new.id::text || '@no-email.invalid'
    )
    into new.email
    from auth.users
    where users.id = new.id;
  end if;

  if new.email is null then
    raise exception 'profile_email_cannot_be_resolved';
  end if;

  return new;
end;
$$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'email'
      and is_nullable = 'NO'
  ) then
    drop trigger if exists workspace_profiles_legacy_email_compat on public.profiles;
    create trigger workspace_profiles_legacy_email_compat
    before insert on public.profiles
    for each row execute function public.workspace_profiles_legacy_email_compat();
  end if;
end;
$$;

revoke all on function public.workspace_profiles_legacy_email_compat() from public, anon, authenticated;

commit;
