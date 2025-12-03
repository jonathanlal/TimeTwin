alter table public.profiles
  add column if not exists timezone text default 'UTC',
  add column if not exists updated_at timestamptz default now(),
  add column if not exists is_public boolean default true,
  add column if not exists capture_panel_mode text
    check (capture_panel_mode in ('expanded','collapsed','hidden'))
    default 'expanded';

update public.profiles
set
  is_public = coalesce(is_public, privacy = 'public'),
  capture_panel_mode = coalesce(capture_panel_mode, 'expanded'),
  timezone = coalesce(timezone, 'UTC'),
  updated_at = coalesce(updated_at, now());

create or replace function public.sync_privacy_is_public()
returns trigger
language plpgsql
as 
begin
  if NEW.is_public is not null then
    NEW.privacy := case when NEW.is_public then 'public' else 'private' end;
  elsif NEW.privacy is not null then
    NEW.is_public := (NEW.privacy = 'public');
  end if;
  return NEW;
end;
;

create or replace function public.touch_profiles_updated_at()
returns trigger
language plpgsql
as 
begin
  NEW.updated_at := now();
  return NEW;
end;
;

drop trigger if exists sync_privacy_is_public on public.profiles;
create trigger sync_privacy_is_public
  before insert or update on public.profiles
  for each row execute function public.sync_privacy_is_public();

drop trigger if exists touch_profiles_updated_at on public.profiles;
create trigger touch_profiles_updated_at
  before update on public.profiles
  for each row execute function public.touch_profiles_updated_at();

