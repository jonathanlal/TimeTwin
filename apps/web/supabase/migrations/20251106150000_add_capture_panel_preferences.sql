alter table public.profiles
  add column if not exists capture_panel_mode text
  check (capture_panel_mode in ('expanded','collapsed','hidden'))
  default 'expanded';

update public.profiles
set capture_panel_mode = 'expanded'
where capture_panel_mode is null;
