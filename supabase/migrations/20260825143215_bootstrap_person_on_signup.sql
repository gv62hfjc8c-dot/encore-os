-- ============================================================
-- Encore OS
-- Bootstrap Person on Supabase Auth signup
-- ============================================================

-- ------------------------------------------------------------
-- Create Person for every new authenticated user
-- ------------------------------------------------------------

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.persons (
    auth_user_id,
    first_name,
    last_name
  )
  values (
    new.id,
    nullif(btrim(new.raw_user_meta_data ->> 'first_name'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'last_name'), '')
  )
  on conflict (auth_user_id) do nothing;

  return new;
end;
$$;

-- ------------------------------------------------------------
-- Trigger
-- ------------------------------------------------------------

drop trigger if exists on_auth_user_created
on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();