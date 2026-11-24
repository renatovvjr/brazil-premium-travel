begin;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'agent',
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists role text not null default 'agent';
alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.profiles'::regclass and conname = 'profiles_role_check'
  ) then
    alter table public.profiles
      add constraint profiles_role_check check (role in ('admin', 'agent'));
  end if;
end;
$$;

create table public.workspace_profile_role_audit (
  id bigint generated always as identity primary key,
  profile_id uuid not null references public.profiles(id),
  previous_role text,
  new_role text not null,
  changed_by uuid,
  changed_at timestamptz not null default now()
);

create or replace function public.workspace_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles(id, role, display_name)
  values (new.id, 'agent', coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email, ''), '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.workspace_profiles_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.workspace_audit_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if old.role is distinct from new.role then
    insert into public.workspace_profile_role_audit(profile_id, previous_role, new_role, changed_by)
    values (new.id, old.role, new.role, auth.uid());
  end if;
  return new;
end;
$$;

drop trigger if exists workspace_on_auth_user_created on auth.users;
create trigger workspace_on_auth_user_created
after insert on auth.users
for each row execute function public.workspace_handle_new_user();

drop trigger if exists workspace_profiles_updated_at on public.profiles;
create trigger workspace_profiles_updated_at
before update on public.profiles
for each row execute function public.workspace_profiles_set_updated_at();

drop trigger if exists workspace_profiles_role_audit on public.profiles;
create trigger workspace_profiles_role_audit
after update of role on public.profiles
for each row execute function public.workspace_audit_profile_role();

insert into public.profiles(id, role, display_name)
select id, 'agent', coalesce(raw_user_meta_data->>'full_name', split_part(coalesce(email, ''), '@', 1))
from auth.users
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.workspace_profile_role_audit enable row level security;

drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles
for select to authenticated using (id = auth.uid());

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
revoke all on public.workspace_profile_role_audit from anon, authenticated;

revoke all on function public.workspace_handle_new_user() from public, anon, authenticated;
revoke all on function public.workspace_audit_profile_role() from public, anon, authenticated;

commit;
