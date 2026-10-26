-- T05: Personal notifications have a real, private persistence surface.
-- No public insert API: notifications will be produced by authorized business events.
begin;

create table public.person_notifications (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.persons(id) on delete cascade,
  kind text not null check (char_length(btrim(kind)) between 1 and 64),
  title text not null check (char_length(btrim(title)) between 1 and 160),
  body text,
  target_path text check (
    target_path is null or (
      left(target_path, 1) = '/'
      and left(target_path, 2) <> '//'
      and char_length(target_path) <= 512
    )
  ),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index person_notifications_recipient_idx
  on public.person_notifications(person_id, created_at desc);

alter table public.person_notifications enable row level security;

create policy person_notifications_select_self
  on public.person_notifications for select to authenticated
  using (person_id = (select public.current_person_id()));

create policy person_notifications_mark_read_self
  on public.person_notifications for update to authenticated
  using (person_id = (select public.current_person_id()))
  with check (person_id = (select public.current_person_id()));

revoke all on public.person_notifications from public, anon, authenticated;
grant select, update(read_at) on public.person_notifications to authenticated;

commit;
