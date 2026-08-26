-- ============================================================
-- Encore OS
-- Identity, Organizations & Memberships
-- ============================================================

-- ------------------------------------------------------------
-- Extensions
-- ------------------------------------------------------------

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Enums
-- ------------------------------------------------------------

create type public.organization_membership_type as enum (
  'member',
  'freelancer'
);

-- ------------------------------------------------------------
-- Helper: updated_at
-- ------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ------------------------------------------------------------
-- Persons
-- ------------------------------------------------------------

create table public.persons (
  id uuid primary key default gen_random_uuid(),

  auth_user_id uuid not null unique
    references auth.users(id)
    on delete cascade,

  first_name text,
  last_name text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index persons_auth_user_id_idx
  on public.persons(auth_user_id);

create trigger persons_set_updated_at
before update on public.persons
for each row
execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Organizations
-- ------------------------------------------------------------

create table public.organizations (
  id uuid primary key default gen_random_uuid(),

  name text not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index organizations_name_idx
  on public.organizations(name);

create trigger organizations_set_updated_at
before update on public.organizations
for each row
execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Organization memberships
-- ------------------------------------------------------------

create table public.organization_memberships (
  id uuid primary key default gen_random_uuid(),

  person_id uuid not null
    references public.persons(id)
    on delete cascade,

  organization_id uuid not null
    references public.organizations(id)
    on delete cascade,

  membership_type public.organization_membership_type not null,

  is_admin boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint organization_memberships_person_organization_unique
    unique (person_id, organization_id)
);

create index organization_memberships_person_id_idx
  on public.organization_memberships(person_id);

create index organization_memberships_organization_id_idx
  on public.organization_memberships(organization_id);

create trigger organization_memberships_set_updated_at
before update on public.organization_memberships
for each row
execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Identity helpers
-- ------------------------------------------------------------

create or replace function public.current_person_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.id
  from public.persons p
  where p.auth_user_id = (select auth.uid())
  limit 1;
$$;

-- ------------------------------------------------------------
-- Organization membership helper
-- ------------------------------------------------------------

create or replace function public.is_organization_member(
  target_organization_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships om
    where om.organization_id = target_organization_id
      and om.person_id = public.current_person_id()
  );
$$;

-- ------------------------------------------------------------
-- Organization admin helper
-- ------------------------------------------------------------

create or replace function public.is_organization_admin(
  target_organization_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships om
    where om.organization_id = target_organization_id
      and om.person_id = public.current_person_id()
      and om.is_admin = true
  );
$$;

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------

alter table public.persons enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_memberships enable row level security;

-- ------------------------------------------------------------
-- Persons policies
-- ------------------------------------------------------------

create policy "persons_select_self"
on public.persons
for select
to authenticated
using (
  auth_user_id = (select auth.uid())
);

create policy "persons_update_self"
on public.persons
for update
to authenticated
using (
  auth_user_id = (select auth.uid())
)
with check (
  auth_user_id = (select auth.uid())
);

-- ------------------------------------------------------------
-- Organizations policies
-- ------------------------------------------------------------

create policy "organizations_select_member"
on public.organizations
for select
to authenticated
using (
  public.is_organization_member(id)
);

create policy "organizations_update_admin"
on public.organizations
for update
to authenticated
using (
  public.is_organization_admin(id)
)
with check (
  public.is_organization_admin(id)
);

-- ------------------------------------------------------------
-- Membership policies
-- ------------------------------------------------------------

create policy "memberships_select_member"
on public.organization_memberships
for select
to authenticated
using (
  person_id = public.current_person_id()
  or public.is_organization_member(organization_id)
);

create policy "memberships_update_admin"
on public.organization_memberships
for update
to authenticated
using (
  public.is_organization_admin(organization_id)
)
with check (
  public.is_organization_admin(organization_id)
);

create policy "memberships_delete_admin"
on public.organization_memberships
for delete
to authenticated
using (
  public.is_organization_admin(organization_id)
);