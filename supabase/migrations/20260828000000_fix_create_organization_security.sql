-- ============================================================
-- Encore OS
-- Fix Organization creation RPC security
-- ============================================================

create or replace function public.create_organization(
  p_organization_name text
)
returns table (
  organization_id uuid,
  organization_name text,
  membership_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_person uuid;
  new_organization_id uuid;
  new_membership_id uuid;
begin
  -- ----------------------------------------------------------
  -- Resolve current Person from authenticated Supabase user
  -- ----------------------------------------------------------

  current_person := public.current_person_id();

  if current_person is null then
    raise exception 'Current Person not found'
      using errcode = 'P0001';
  end if;

  -- ----------------------------------------------------------
  -- Validate organization name
  -- ----------------------------------------------------------

  if p_organization_name is null then
    raise exception 'Organization name cannot be empty'
      using errcode = 'P0001';
  end if;

  if char_length(btrim(p_organization_name)) = 0 then
    raise exception 'Organization name cannot be empty'
      using errcode = 'P0001';
  end if;

  if char_length(btrim(p_organization_name)) > 120 then
    raise exception 'Organization name cannot exceed 120 characters'
      using errcode = 'P0001';
  end if;

  -- ----------------------------------------------------------
  -- Create Organization
  -- ----------------------------------------------------------

  insert into public.organizations (
    name
  )
  values (
    btrim(p_organization_name)
  )
  returning id into new_organization_id;

  -- ----------------------------------------------------------
  -- Create creator Membership
  --
  -- Domain rule:
  -- Organization creator = Member + Admin
  -- ----------------------------------------------------------

  insert into public.organization_memberships (
    person_id,
    organization_id,
    membership_type,
    is_admin
  )
  values (
    current_person,
    new_organization_id,
    'member',
    true
  )
  returning id into new_membership_id;

  -- ----------------------------------------------------------
  -- Return created resources
  -- ----------------------------------------------------------

  return query
  select
    o.id,
    o.name,
    om.id
  from public.organizations o
  join public.organization_memberships om
    on om.organization_id = o.id
  where o.id = new_organization_id
    and om.id = new_membership_id;
end;
$$;

-- ------------------------------------------------------------
-- Execute permission
-- ------------------------------------------------------------

revoke all
on function public.create_organization(text)
from public;

grant execute
on function public.create_organization(text)
to authenticated;
