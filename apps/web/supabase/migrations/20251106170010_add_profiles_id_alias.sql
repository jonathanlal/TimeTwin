alter table public.profiles
  add column if not exists id uuid generated always as (user_id) stored;

create unique index if not exists profiles_id_unique on public.profiles(id);
