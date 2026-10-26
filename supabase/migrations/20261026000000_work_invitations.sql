-- Encore OS — T01: consent-based Work access.
-- Existing direct Work participations are intentionally NOT grandfathered into visibility.
-- Until a valid invitation is accepted, only Work creators can read their Work.
begin;

alter table public.work_participations
  add column accepted_at timestamptz;

create or replace function public.is_work_participant(target_work_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.work_participations wp
    where wp.work_id = target_work_id
      and wp.person_id = public.current_person_id()
      and wp.accepted_at is not null
  );
$$;

-- No persistent Band team exists yet, so direct assignment cannot be authorized safely.
-- Keep the legacy signature temporarily, but remove execution rights and fail closed.
create or replace function public.add_work_participant(p_work_id uuid, p_person_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
begin
  raise exception 'Direct Work participation is disabled; use an accepted invitation'
    using errcode = '42501';
end;
$$;
revoke all on function public.add_work_participant(uuid,uuid)
  from public, anon, authenticated;

create table public.work_invitations (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references public.works(id) on delete cascade,
  email text not null
    check (email = lower(btrim(email)) and char_length(email) between 3 and 254),
  token_hash bytea not null unique,
  created_by uuid not null references public.persons(id),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days',
  accepted_at timestamptz,
  revoked_at timestamptz
);
create index work_invitations_work_idx on public.work_invitations(work_id);
alter table public.work_invitations enable row level security;
revoke all on public.work_invitations from public, anon, authenticated;

create function public.create_work_invitation(
  p_work_id uuid,
  p_email text
)
returns table(invitation_id uuid, token text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  secret text;
  new_invitation_id uuid;
begin
  perform private.require_work_manager(p_work_id);
  if p_email is null
    or btrim(p_email) !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or char_length(btrim(p_email)) > 254 then
    raise exception 'Invalid invitation email' using errcode = '22023';
  end if;
  secret := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  insert into public.work_invitations(work_id, email, token_hash, created_by)
  values (
    p_work_id,
    lower(btrim(p_email)),
    sha256(convert_to(secret, 'UTF8')),
    public.current_person_id()
  )
  returning id into new_invitation_id;
  return query select new_invitation_id, secret;
end;
$$;

create function public.accept_work_invitation(p_token text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  invitation public.work_invitations;
  current_person uuid;
  verified_email text;
begin
  current_person := public.current_person_id();
  select lower(btrim(u.email)) into verified_email
  from auth.users u
  where u.id = auth.uid() and u.email_confirmed_at is not null;
  if current_person is null or verified_email is null then
    raise exception 'Confirmed email required' using errcode = '42501';
  end if;
  if p_token is null or char_length(p_token) <> 64
     or p_token !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid or unavailable invitation' using errcode = '22023';
  end if;

  select * into invitation
  from public.work_invitations wi
  where wi.token_hash = sha256(convert_to(p_token, 'UTF8'))
  for update;
  if invitation.id is null or invitation.email <> verified_email
     or invitation.accepted_at is not null
     or invitation.revoked_at is not null
     or invitation.expires_at <= now() then
    raise exception 'Invalid or unavailable invitation' using errcode = '22023';
  end if;

  insert into public.work_participations(work_id, person_id, accepted_at)
  values(invitation.work_id, current_person, now())
  on conflict (work_id, person_id) do update set accepted_at = excluded.accepted_at;
  update public.work_invitations set accepted_at = now() where id = invitation.id;
  return invitation.work_id;
end;
$$;

create function public.revoke_work_invitation(
  p_work_id uuid,
  p_invitation_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_work_manager(p_work_id);
  update public.work_invitations
  set revoked_at = now()
  where id = p_invitation_id and work_id = p_work_id
    and accepted_at is null and revoked_at is null;
end;
$$;

revoke all
on function public.create_work_invitation(uuid, text),
   public.accept_work_invitation(text),
   public.revoke_work_invitation(uuid,uuid)
from public, anon, authenticated;

grant execute
on function public.create_work_invitation(uuid, text),
   public.accept_work_invitation(text),
   public.revoke_work_invitation(uuid,uuid)
to authenticated;

commit;
