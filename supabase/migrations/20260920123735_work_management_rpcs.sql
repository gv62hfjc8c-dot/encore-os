-- ============================================================
-- Encore OS
-- Work management RPCs
--
-- All Work mutations are exposed through narrow SECURITY
-- DEFINER functions. Direct table writes remain unavailable.
-- ============================================================

begin;

-- ============================================================
-- REQUIRE WORK MANAGER
-- ============================================================

create function private.require_work_manager(
  target_work_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.can_manage_work(target_work_id) is not true then
    raise exception 'Work manager required'
      using errcode = '42501';
  end if;
end;
$$;


-- ============================================================
-- UPDATE WORK
-- ============================================================

create function public.update_work(
  p_work_id uuid,
  p_title text,
  p_work_type text,
  p_status text,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_timezone text,
  p_organizer_person_id uuid default null,
  p_organizer_organization_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_work_manager(p_work_id);

  if p_title is null
     or char_length(btrim(p_title)) = 0
     or char_length(btrim(p_title)) > 160 then
    raise exception 'Invalid Work title'
      using errcode = '22023';
  end if;

  if p_work_type is null
     or char_length(btrim(p_work_type)) = 0
     or char_length(btrim(p_work_type)) > 64 then
    raise exception 'Invalid Work type'
      using errcode = '22023';
  end if;

  if p_status not in (
    'draft',
    'scheduled',
    'completed',
    'cancelled'
  ) then
    raise exception 'Invalid Work status'
      using errcode = '22023';
  end if;

  if p_starts_at is null
     or p_ends_at is null
     or p_ends_at <= p_starts_at then
    raise exception 'Invalid Work time window'
      using errcode = '22023';
  end if;

  if p_timezone is null
     or not exists (
       select 1
       from pg_catalog.pg_timezone_names tz
       where tz.name = btrim(p_timezone)
     ) then
    raise exception 'Invalid IANA timezone'
      using errcode = '22023';
  end if;

  if num_nonnulls(
    p_organizer_person_id,
    p_organizer_organization_id
  ) > 1 then
    raise exception 'Work can have only one organizer'
      using errcode = '22023';
  end if;

  update public.works
  set
    title = btrim(p_title),
    work_type = lower(btrim(p_work_type)),
    status = p_status,
    starts_at = p_starts_at,
    ends_at = p_ends_at,
    timezone = btrim(p_timezone),
    organizer_person_id = p_organizer_person_id,
    organizer_organization_id = p_organizer_organization_id
  where id = p_work_id;

  if not found then
    raise exception 'Work not found'
      using errcode = '22023';
  end if;
end;
$$;


-- ============================================================
-- PARTICIPANTS
--
-- Any existing global Person can participate, independently
-- of Organization membership.
-- ============================================================

create function public.add_work_participant(
  p_work_id uuid,
  p_person_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_participation_id uuid;
begin
  perform private.require_work_manager(p_work_id);

  if not exists (
    select 1
    from public.persons p
    where p.id = p_person_id
  ) then
    raise exception 'Person not found'
      using errcode = '22023';
  end if;

  insert into public.work_participations(
    work_id,
    person_id
  )
  values (
    p_work_id,
    p_person_id
  )
  returning id into new_participation_id;

  return new_participation_id;
end;
$$;


create function public.remove_work_participant(
  p_work_id uuid,
  p_work_participation_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_work_manager(p_work_id);

  delete from public.work_participations
  where id = p_work_participation_id
    and work_id = p_work_id;

  if not found then
    raise exception 'Work Participation not found'
      using errcode = '22023';
  end if;
end;
$$;


-- ============================================================
-- PARTICIPATION FUNCTIONS
-- ============================================================

create function public.add_work_participation_function(
  p_work_id uuid,
  p_work_participation_id uuid,
  p_function_name text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_function_id uuid;
begin
  perform private.require_work_manager(p_work_id);

  if not exists (
    select 1
    from public.work_participations wp
    where wp.id = p_work_participation_id
      and wp.work_id = p_work_id
  ) then
    raise exception 'Work Participation not found'
      using errcode = '22023';
  end if;

  if p_function_name is null
     or char_length(btrim(p_function_name)) = 0
     or char_length(btrim(p_function_name)) > 120 then
    raise exception 'Invalid Work function'
      using errcode = '22023';
  end if;

  insert into public.work_participation_functions(
    work_participation_id,
    function_name
  )
  values (
    p_work_participation_id,
    btrim(p_function_name)
  )
  returning id into new_function_id;

  return new_function_id;
end;
$$;


create function public.remove_work_participation_function(
  p_work_id uuid,
  p_work_participation_id uuid,
  p_function_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_work_manager(p_work_id);

  if not exists (
    select 1
    from public.work_participations wp
    where wp.id = p_work_participation_id
      and wp.work_id = p_work_id
  ) then
    raise exception 'Work Participation not found'
      using errcode = '22023';
  end if;

  delete from public.work_participation_functions
  where id = p_function_id
    and work_participation_id = p_work_participation_id;

  if not found then
    raise exception 'Work function not found'
      using errcode = '22023';
  end if;
end;
$$;


-- ============================================================
-- WORK BLOCKS
-- ============================================================

create function public.create_work_block(
  p_work_id uuid,
  p_block_type text,
  p_label text,
  p_starts_at timestamptz,
  p_ends_at timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_block_id uuid;
begin
  perform private.require_work_manager(p_work_id);

  if p_block_type is null
     or char_length(btrim(p_block_type)) = 0
     or char_length(btrim(p_block_type)) > 64 then
    raise exception 'Invalid Work Block type'
      using errcode = '22023';
  end if;

  if p_label is null
     or char_length(btrim(p_label)) = 0
     or char_length(btrim(p_label)) > 160 then
    raise exception 'Invalid Work Block label'
      using errcode = '22023';
  end if;

  if p_starts_at is null
     or p_ends_at is null
     or p_ends_at <= p_starts_at then
    raise exception 'Invalid Work Block time window'
      using errcode = '22023';
  end if;

  insert into public.work_blocks(
    work_id,
    block_type,
    label,
    starts_at,
    ends_at
  )
  values (
    p_work_id,
    lower(btrim(p_block_type)),
    btrim(p_label),
    p_starts_at,
    p_ends_at
  )
  returning id into new_block_id;

  return new_block_id;
end;
$$;


create function public.update_work_block(
  p_work_id uuid,
  p_work_block_id uuid,
  p_block_type text,
  p_label text,
  p_starts_at timestamptz,
  p_ends_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_work_manager(p_work_id);

  if p_block_type is null
     or char_length(btrim(p_block_type)) = 0
     or char_length(btrim(p_block_type)) > 64 then
    raise exception 'Invalid Work Block type'
      using errcode = '22023';
  end if;

  if p_label is null
     or char_length(btrim(p_label)) = 0
     or char_length(btrim(p_label)) > 160 then
    raise exception 'Invalid Work Block label'
      using errcode = '22023';
  end if;

  if p_starts_at is null
     or p_ends_at is null
     or p_ends_at <= p_starts_at then
    raise exception 'Invalid Work Block time window'
      using errcode = '22023';
  end if;

  update public.work_blocks
  set
    block_type = lower(btrim(p_block_type)),
    label = btrim(p_label),
    starts_at = p_starts_at,
    ends_at = p_ends_at
  where id = p_work_block_id
    and work_id = p_work_id;

  if not found then
    raise exception 'Work Block not found'
      using errcode = '22023';
  end if;
end;
$$;


create function public.delete_work_block(
  p_work_id uuid,
  p_work_block_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_work_manager(p_work_id);

  delete from public.work_blocks
  where id = p_work_block_id
    and work_id = p_work_id;

  if not found then
    raise exception 'Work Block not found'
      using errcode = '22023';
  end if;
end;
$$;


-- ============================================================
-- BLOCK ASSIGNMENTS
-- ============================================================

create function public.assign_work_participant_to_block(
  p_work_id uuid,
  p_work_block_id uuid,
  p_work_participation_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_work_manager(p_work_id);

  if not exists (
    select 1
    from public.work_blocks wb
    where wb.id = p_work_block_id
      and wb.work_id = p_work_id
  ) then
    raise exception 'Work Block not found'
      using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.work_participations wp
    where wp.id = p_work_participation_id
      and wp.work_id = p_work_id
  ) then
    raise exception 'Work Participation not found'
      using errcode = '22023';
  end if;

  insert into public.work_block_participations(
    work_id,
    work_block_id,
    work_participation_id
  )
  values (
    p_work_id,
    p_work_block_id,
    p_work_participation_id
  );
end;
$$;


create function public.unassign_work_participant_from_block(
  p_work_id uuid,
  p_work_block_id uuid,
  p_work_participation_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_work_manager(p_work_id);

  delete from public.work_block_participations
  where work_id = p_work_id
    and work_block_id = p_work_block_id
    and work_participation_id = p_work_participation_id;

  if not found then
    raise exception 'Work Block assignment not found'
      using errcode = '22023';
  end if;
end;
$$;


-- ============================================================
-- PRIVILEGES
-- ============================================================

revoke all
on function private.require_work_manager(uuid),

   public.update_work(
     uuid,
     text,
     text,
     text,
     timestamptz,
     timestamptz,
     text,
     uuid,
     uuid
   ),

   public.add_work_participant(uuid, uuid),
   public.remove_work_participant(uuid, uuid),

   public.add_work_participation_function(uuid, uuid, text),
   public.remove_work_participation_function(uuid, uuid, uuid),

   public.create_work_block(
     uuid,
     text,
     text,
     timestamptz,
     timestamptz
   ),

   public.update_work_block(
     uuid,
     uuid,
     text,
     text,
     timestamptz,
     timestamptz
   ),

   public.delete_work_block(uuid, uuid),

   public.assign_work_participant_to_block(uuid, uuid, uuid),
   public.unassign_work_participant_from_block(uuid, uuid, uuid)

from public, anon, authenticated;


grant execute
on function

   public.update_work(
     uuid,
     text,
     text,
     text,
     timestamptz,
     timestamptz,
     text,
     uuid,
     uuid
   ),

   public.add_work_participant(uuid, uuid),
   public.remove_work_participant(uuid, uuid),

   public.add_work_participation_function(uuid, uuid, text),
   public.remove_work_participation_function(uuid, uuid, uuid),

   public.create_work_block(
     uuid,
     text,
     text,
     timestamptz,
     timestamptz
   ),

   public.update_work_block(
     uuid,
     uuid,
     text,
     text,
     timestamptz,
     timestamptz
   ),

   public.delete_work_block(uuid, uuid),

   public.assign_work_participant_to_block(uuid, uuid, uuid),
   public.unassign_work_participant_from_block(uuid, uuid, uuid)

to authenticated;

commit;