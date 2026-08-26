-- ============================================================
-- Encore OS
-- Organization Context Helpers
-- ============================================================

-- ------------------------------------------------------------
-- Organizations available to the current Person
-- ------------------------------------------------------------

create or replace function public.current_person_organizations()
returns table (
  organization_id uuid,
  organization_name text,
  membership_id uuid,
  membership_type public.organization_membership_type,
  is_admin boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    o.id,
    o.name,
    om.id,
    om.membership_type,
    om.is_admin
  from public.organization_memberships om
  join public.organizations o
    on o.id = om.organization_id
  where om.person_id = public.current_person_id()
  order by o.name, o.id;
$$;

-- ------------------------------------------------------------
-- Execute permission
-- ------------------------------------------------------------

revoke all
on function public.current_person_organizations()
from public;

grant execute
on function public.current_person_organizations()
to authenticated;