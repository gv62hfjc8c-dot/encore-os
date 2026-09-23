-- ============================================================
-- Encore OS
-- Work foundation
--
-- Work is an autonomous shared operational commitment.
-- It is not owned by a Person or Organization.
--
-- A Person creates it and initially manages it.
-- Persons participate independently of Organization membership.
-- ============================================================

begin;

-- ============================================================
-- WORKS
-- ============================================================

create table public.works (
  id uuid primary key default gen_random_uuid(),

  created_by uuid not null
    references public.persons(id),

  title text not null,
  work_type text not null,

  status text not null default 'draft',

  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null,

  organizer_person_id uuid
    references public.persons(id),

  organizer_organization_id uuid
    references public.organizations(id),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint works_title_valid
    check (
      char_length(btrim(title)) between 1 and 160
    ),

  constraint works_type_valid
    check (
      work_type = lower(btrim(work_type))
      and char_length(work_type) between 1 and 64
    ),

  constraint works_status_valid
    check (
      status in (
        'draft',
        'scheduled',
        'completed',
        'cancelled'
      )
    ),

  constraint works_time_valid
    check (
      ends_at > starts_at
    ),

  constraint works_timezone_valid
    check (
      timezone = btrim(timezone)
      and char_length(timezone) between 1 and 64
    ),

  constraint works_single_organizer
    check (
      num_nonnulls(
        organizer_person_id,
        organizer_organization_id
      ) <= 1
    )
);

create index works_created_by_idx
  on public.works(created_by);

create index works_time_idx
  on public.works(starts_at, ends_at);

create index works_organizer_person_idx
  on public.works(organizer_person_id)
  where organizer_person_id is not null;

create index works_organizer_organization_idx
  on public.works(organizer_organization_id)
  where organizer_organization_id is not null;


-- ============================================================
-- WORK PARTICIPATIONS
--
-- Participation is independent from Organization membership.
-- Any Person may participate in a Work.
-- ============================================================

create table public.work_participations (
  id uuid primary key default gen_random_uuid(),

  work_id uuid not null
    references public.works(id)
    on delete cascade,

  person_id uuid not null
    references public.persons(id),

  created_at timestamptz not null default now(),

  constraint work_participations_person_unique
    unique (work_id, person_id),

  unique (id, work_id)
);

create index work_participations_work_idx
  on public.work_participations(work_id);

create index work_participations_person_idx
  on public.work_participations(person_id);


-- ============================================================
-- PARTICIPATION FUNCTIONS
-- ============================================================

create table public.work_participation_functions (
  id uuid primary key default gen_random_uuid(),

  work_participation_id uuid not null
    references public.work_participations(id)
    on delete cascade,

  function_name text not null,

  created_at timestamptz not null default now(),

  constraint work_participation_functions_name_valid
    check (
      char_length(btrim(function_name)) between 1 and 120
    )
);

create unique index work_participation_functions_unique_idx
  on public.work_participation_functions(
    work_participation_id,
    lower(btrim(function_name))
  );

create index work_participation_functions_participation_idx
  on public.work_participation_functions(work_participation_id);


-- ============================================================
-- WORK BLOCKS
-- ============================================================

create table public.work_blocks (
  id uuid primary key default gen_random_uuid(),

  work_id uuid not null
    references public.works(id)
    on delete cascade,

  block_type text not null,
  label text not null,

  starts_at timestamptz not null,
  ends_at timestamptz not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint work_blocks_type_valid
    check (
      block_type = lower(btrim(block_type))
      and char_length(block_type) between 1 and 64
    ),

  constraint work_blocks_label_valid
    check (
      char_length(btrim(label)) between 1 and 160
    ),

  constraint work_blocks_time_valid
    check (
      ends_at > starts_at
    ),

  unique (id, work_id)
);

create index work_blocks_work_idx
  on public.work_blocks(work_id);

create index work_blocks_work_time_idx
  on public.work_blocks(work_id, starts_at, ends_at);


-- ============================================================
-- WORK BLOCK PARTICIPATIONS
-- ============================================================

create table public.work_block_participations (
  work_id uuid not null,

  work_block_id uuid not null,

  work_participation_id uuid not null,

  created_at timestamptz not null default now(),

  primary key (
    work_block_id,
    work_participation_id
  ),

  foreign key (work_block_id, work_id)
    references public.work_blocks(id, work_id)
    on delete cascade,

  foreign key (work_participation_id, work_id)
    references public.work_participations(id, work_id)
    on delete cascade
);

create index work_block_participations_work_idx
  on public.work_block_participations(work_id);

create index work_block_participations_participation_idx
  on public.work_block_participations(work_participation_id);


-- ============================================================
-- TEMPORAL INTEGRITY
-- ============================================================

create function private.validate_work_block_window()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  parent_start timestamptz;
  parent_end timestamptz;
begin
  select
    w.starts_at,
    w.ends_at
  into
    parent_start,
    parent_end
  from public.works w
  where w.id = new.work_id;

  if parent_start is null then
    raise exception 'Work not found'
      using errcode = '23503';
  end if;

  if new.starts_at < parent_start
     or new.ends_at > parent_end then
    raise exception 'Work block must remain inside Work time window'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger work_blocks_validate_window
before insert or update of work_id, starts_at, ends_at
on public.work_blocks
for each row
execute function private.validate_work_block_window();


create function private.validate_work_window()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if exists (
    select 1
    from public.work_blocks wb
    where wb.work_id = new.id
      and (
        wb.starts_at < new.starts_at
        or wb.ends_at > new.ends_at
      )
  ) then
    raise exception 'Work time window cannot exclude existing Work blocks'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger works_validate_window
before update of starts_at, ends_at
on public.works
for each row
execute function private.validate_work_window();


-- ============================================================
-- TIMEZONE INTEGRITY
-- ============================================================

create function private.validate_work_timezone()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_timezone_names tz
    where tz.name = new.timezone
  ) then
    raise exception 'Invalid IANA timezone'
      using errcode = '22023';
  end if;

  return new;
end;
$$;

create trigger works_validate_timezone
before insert or update of timezone
on public.works
for each row
execute function private.validate_work_timezone();


-- ============================================================
-- UPDATED_AT
-- ============================================================

create trigger works_set_updated_at
before update
on public.works
for each row
execute function public.set_updated_at();

create trigger work_blocks_set_updated_at
before update
on public.work_blocks
for each row
execute function public.set_updated_at();


-- ============================================================
-- AUTHORIZATION
--
-- Organization context is used only to authorize Work creation.
-- After creation, Work authorization is Work-scoped.
-- ============================================================

create function public.can_create_work(
  authorizing_organization_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    authorizing_organization_id = public.active_organization_id()
    and exists (
      select 1
      from public.organization_memberships om
      where om.organization_id = authorizing_organization_id
        and om.person_id = public.current_person_id()
        and (
          om.is_admin
          or om.membership_type::text = 'freelancer'
        )
    ),
    false
  );
$$;


create function public.can_manage_work(
  target_work_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.works w
    where w.id = target_work_id
      and w.created_by = public.current_person_id()
  );
$$;


create function public.is_work_participant(
  target_work_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.work_participations wp
    where wp.work_id = target_work_id
      and wp.person_id = public.current_person_id()
  );
$$;


create function public.can_view_work(
  target_work_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    public.can_manage_work(target_work_id)
    or public.is_work_participant(target_work_id);
$$;


-- ============================================================
-- CREATE WORK
--
-- authorizing_organization_id proves that the current Person
-- may create a Work. It is deliberately NOT stored on Work.
-- ============================================================

create function public.create_work(
  p_authorizing_organization_id uuid,
  p_title text,
  p_work_type text,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_timezone text,
  p_organizer_person_id uuid default null,
  p_organizer_organization_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_person uuid;
  new_work_id uuid;
begin
  current_person := public.current_person_id();

  if current_person is null then
    raise exception 'Current Person not found'
      using errcode = '42501';
  end if;

  if public.can_create_work(p_authorizing_organization_id) is not true then
    raise exception 'Work creation not allowed'
      using errcode = '42501';
  end if;

  if p_title is null
     or char_length(btrim(p_title)) = 0 then
    raise exception 'Work title cannot be empty'
      using errcode = '22023';
  end if;

  if p_work_type is null
     or char_length(btrim(p_work_type)) = 0 then
    raise exception 'Work type cannot be empty'
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

  insert into public.works (
    created_by,
    title,
    work_type,
    status,
    starts_at,
    ends_at,
    timezone,
    organizer_person_id,
    organizer_organization_id
  )
  values (
    current_person,
    btrim(p_title),
    lower(btrim(p_work_type)),
    'draft',
    p_starts_at,
    p_ends_at,
    btrim(p_timezone),
    p_organizer_person_id,
    p_organizer_organization_id
  )
  returning id into new_work_id;

  return new_work_id;
end;
$$;


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.works
  enable row level security;

alter table public.work_participations
  enable row level security;

alter table public.work_participation_functions
  enable row level security;

alter table public.work_blocks
  enable row level security;

alter table public.work_block_participations
  enable row level security;


create policy works_select_authorized
on public.works
for select
to authenticated
using (
  public.can_view_work(id)
);


create policy work_participations_select_authorized
on public.work_participations
for select
to authenticated
using (
  public.can_view_work(work_id)
);


create policy work_participation_functions_select_authorized
on public.work_participation_functions
for select
to authenticated
using (
  exists (
    select 1
    from public.work_participations wp
    where wp.id = work_participation_id
      and public.can_view_work(wp.work_id)
  )
);


create policy work_blocks_select_authorized
on public.work_blocks
for select
to authenticated
using (
  public.can_view_work(work_id)
);


create policy work_block_participations_select_authorized
on public.work_block_participations
for select
to authenticated
using (
  public.can_view_work(work_id)
);


-- ============================================================
-- TABLE PRIVILEGES
-- ============================================================

revoke all
on public.works,
   public.work_participations,
   public.work_participation_functions,
   public.work_blocks,
   public.work_block_participations
from public, anon, authenticated;

grant select
on public.works,
   public.work_participations,
   public.work_participation_functions,
   public.work_blocks,
   public.work_block_participations
to authenticated;


-- ============================================================
-- FUNCTION PRIVILEGES
-- ============================================================

revoke all
on function public.can_create_work(uuid),
   public.can_manage_work(uuid),
   public.is_work_participant(uuid),
   public.can_view_work(uuid),
   public.create_work(
     uuid,
     text,
     text,
     timestamptz,
     timestamptz,
     text,
     uuid,
     uuid
   ),
   private.validate_work_block_window(),
   private.validate_work_window(),
   private.validate_work_timezone()
from public, anon, authenticated;


grant execute
on function public.can_create_work(uuid),
   public.can_manage_work(uuid),
   public.is_work_participant(uuid),
   public.can_view_work(uuid),
   public.create_work(
     uuid,
     text,
     text,
     timestamptz,
     timestamptz,
     text,
     uuid,
     uuid
   )
to authenticated;

commit;