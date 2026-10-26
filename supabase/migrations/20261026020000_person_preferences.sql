-- T04: Global Person preferences independent of Organization context.
begin;

create table public.person_preferences (
  person_id uuid primary key references public.persons(id) on delete cascade,
  theme text not null default 'dark' check (theme in ('dark', 'light')),
  reduce_motion boolean not null default false,
  updated_at timestamptz not null default now()
);
create trigger person_preferences_updated_at
  before update on public.person_preferences
  for each row execute function public.set_updated_at();

alter table public.person_preferences enable row level security;

create policy person_preferences_select_self
  on public.person_preferences for select to authenticated
  using (person_id = (select public.current_person_id()));
create policy person_preferences_insert_self
  on public.person_preferences for insert to authenticated
  with check (person_id = (select public.current_person_id()));
create policy person_preferences_update_self
  on public.person_preferences for update to authenticated
  using (person_id = (select public.current_person_id()))
  with check (person_id = (select public.current_person_id()));

revoke all on public.person_preferences from public, anon, authenticated;
grant select, insert(person_id,theme,reduce_motion), update(theme,reduce_motion)
  on public.person_preferences to authenticated;

commit;
