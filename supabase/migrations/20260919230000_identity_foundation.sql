-- Additive repair of the existing foundation; never rewrite applied migrations.
begin;

-- Creation needs a narrowly granted definer: invoker cannot insert through RLS.
alter function public.create_organization(text) security definer;
alter function public.create_organization(text) set search_path = '';
alter function public.current_person_id() set search_path = '';
alter function public.is_organization_member(uuid) set search_path = '';
alter function public.is_organization_admin(uuid) set search_path = '';
alter function public.current_person_organizations() set search_path = '';
alter function public.handle_new_auth_user() set search_path = '';
alter function public.set_updated_at() set search_path = '';

insert into public.persons(auth_user_id, first_name, last_name)
select id, nullif(btrim(raw_user_meta_data->>'first_name'), ''),
 nullif(btrim(raw_user_meta_data->>'last_name'), '') from auth.users
on conflict (auth_user_id) do nothing;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

-- Selection is request-scoped, never a global mutable database/session preference.
-- RLS rechecks membership even when a browser replays a stale or forged selection.
create function public.active_organization_id() returns uuid
language plpgsql stable security definer set search_path = '' as $$
declare selected uuid;
begin
  begin
    selected := (nullif(current_setting('request.headers', true), '')::jsonb ->> 'x-organization-id')::uuid;
  exception when invalid_text_representation then return null;
  end;
  if public.is_organization_member(selected) then return selected; end if;
  return null;
end $$;

create function private.require_admin(target uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  -- Serializes admin mutations and last-admin checks for this organization.
  perform 1 from public.organizations where id = target for update;
  if target is distinct from public.active_organization_id()
     or not public.is_organization_admin(target) then
    raise exception 'Organization administrator required' using errcode = '42501';
  end if;
end $$;

-- No general-purpose membership writes or identity reassignment through REST.
revoke all on public.persons, public.organizations, public.organization_memberships from public, anon, authenticated;
grant select on public.persons, public.organizations, public.organization_memberships to authenticated;
grant update(first_name, last_name) on public.persons to authenticated;
grant update(name) on public.organizations to authenticated;

drop policy organizations_select_member on public.organizations;
create policy organizations_select_active on public.organizations for select to authenticated
using (id = (select public.active_organization_id()));
drop policy organizations_update_admin on public.organizations;
create policy organizations_update_active_admin on public.organizations for update to authenticated
using (id = (select public.active_organization_id()) and public.is_organization_admin(id))
with check (id = (select public.active_organization_id()) and public.is_organization_admin(id));
drop policy memberships_select_member on public.organization_memberships;
create policy memberships_select_active on public.organization_memberships for select to authenticated
using (organization_id = (select public.active_organization_id()));
drop policy memberships_update_admin on public.organization_memberships;
drop policy memberships_delete_admin on public.organization_memberships;

create table public.organization_invitations (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references public.organizations(id) on delete cascade,
 email text not null check (email = lower(btrim(email)) and char_length(email) between 3 and 254),
 membership_type public.organization_membership_type not null,
 is_admin boolean not null default false,
 token_hash bytea not null unique,
 created_by uuid not null references public.persons(id),
 created_at timestamptz not null default now(),
 expires_at timestamptz not null default now() + interval '7 days',
 accepted_at timestamptz,
 revoked_at timestamptz
);
create index organization_invitations_org_idx on public.organization_invitations(organization_id);
alter table public.organization_invitations enable row level security;
revoke all on public.organization_invitations from public, anon, authenticated;

create function public.create_organization_invitation(
 p_organization_id uuid, p_email text,
 p_membership_type public.organization_membership_type, p_is_admin boolean default false
) returns table(invitation_id uuid, token text)
language plpgsql security definer set search_path = '' as $$
declare secret text; invitation uuid;
begin
 perform private.require_admin(p_organization_id);
 if p_email is null or btrim(p_email) !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
   raise exception 'Invalid email' using errcode = '22023';
 end if;
 secret := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
 insert into public.organization_invitations(organization_id, email, membership_type, is_admin, token_hash, created_by)
 values (p_organization_id, lower(btrim(p_email)), p_membership_type, p_is_admin,
 sha256(convert_to(secret, 'UTF8')), public.current_person_id()) returning id into invitation;
 return query select invitation, secret;
end $$;

create function public.accept_organization_invitation(p_token text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare invitation public.organization_invitations; person uuid; verified_email text;
begin
 person := public.current_person_id();
 select lower(email) into verified_email from auth.users
 where id = auth.uid() and email_confirmed_at is not null;
 if person is null or verified_email is null then
  raise exception 'Confirmed email required' using errcode = '42501';
 end if;
 select * into invitation from public.organization_invitations
 where token_hash = sha256(convert_to(p_token, 'UTF8')) for update;
 if invitation.id is null or invitation.email <> verified_email
    or invitation.accepted_at is not null or invitation.revoked_at is not null
    or invitation.expires_at <= now() then
  raise exception 'Invalid or unavailable invitation' using errcode = '22023';
 end if;
 -- Existing membership is never overwritten or escalated by accepting an invite.
 insert into public.organization_memberships(person_id, organization_id, membership_type, is_admin)
 values (person, invitation.organization_id, invitation.membership_type, invitation.is_admin);
 update public.organization_invitations set accepted_at = now() where id = invitation.id;
 return invitation.organization_id;
end $$;

create function public.revoke_organization_invitation(p_organization_id uuid, p_invitation_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
 perform private.require_admin(p_organization_id);
 update public.organization_invitations set revoked_at = now()
 where id = p_invitation_id and organization_id = p_organization_id and accepted_at is null;
end $$;

create function public.change_organization_membership(
 p_organization_id uuid, p_membership_id uuid,
 p_membership_type public.organization_membership_type, p_is_admin boolean,
 p_remove boolean default false
) returns void language plpgsql security definer set search_path = '' as $$
declare existing public.organization_memberships;
begin
 perform private.require_admin(p_organization_id);
 select * into existing from public.organization_memberships
 where id = p_membership_id and organization_id = p_organization_id for update;
 if existing.id is null then raise exception 'Membership not found' using errcode = '22023'; end if;
 if existing.is_admin and (p_remove or not p_is_admin) and
   (select count(*) from public.organization_memberships where organization_id = p_organization_id and is_admin) <= 1 then
   raise exception 'Organization requires at least one administrator' using errcode = '23514';
 end if;
 if p_remove then
   delete from public.organization_memberships where id = existing.id;
 else
   update public.organization_memberships set membership_type = p_membership_type, is_admin = p_is_admin
   where id = existing.id;
 end if;
end $$;

-- Supabase default privileges may already grant anon/authenticated execution.
revoke all on function public.current_person_id(), public.is_organization_member(uuid),
 public.is_organization_admin(uuid), public.current_person_organizations(),
 public.create_organization(text), public.active_organization_id(),
 public.create_organization_invitation(uuid,text,public.organization_membership_type,boolean),
 public.accept_organization_invitation(text), public.revoke_organization_invitation(uuid,uuid),
 public.change_organization_membership(uuid,uuid,public.organization_membership_type,boolean,boolean),
 public.handle_new_auth_user(), public.set_updated_at(), private.require_admin(uuid)
 from public, anon, authenticated;
grant execute on function public.current_person_id(), public.is_organization_member(uuid),
 public.is_organization_admin(uuid), public.current_person_organizations(),
 public.create_organization(text), public.active_organization_id(),
 public.create_organization_invitation(uuid,text,public.organization_membership_type,boolean),
 public.accept_organization_invitation(text), public.revoke_organization_invitation(uuid,uuid),
 public.change_organization_membership(uuid,uuid,public.organization_membership_type,boolean,boolean)
 to authenticated;
commit;
