
-- 0001_init.sql
create table if not exists public.countries (
  code text primary key,
  name text not null
);

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  created_at timestamptz default now(),
  avatar_url text,
  country_code text references public.countries(code),
  tz text default 'UTC',
  privacy text check (privacy in ('public','private')) default 'public',
  constraint country_code_ck check (country_code ~ '^[A-Z]{2}$')
);

create table if not exists public.captures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  server_ts timestamptz not null default now(),
  minute_ts timestamptz generated always as (date_trunc('minute', server_ts)) stored,
  label_idx smallint generated always as (extract(hour from server_ts)::smallint) stored,
  label_str text generated always as (
    lpad((extract(hour from server_ts))::int::text,2,'0') || ':' ||
    lpad((extract(hour from server_ts))::int::text,2,'0')
  ) stored,
  diff_seconds int not null check (diff_seconds between 0 and 59),
  source text check (source in ('app','widget','web')) default 'app',
  device_model text,
  app_version text,
  legacy_id text,
  check (extract(minute from server_ts) = extract(hour from server_ts))
);

create table if not exists public.daily_stats (
  user_id uuid not null,
  day date not null,
  captures_count int default 0,
  best_diff int,
  primary key (user_id, day)
);

create index if not exists idx_captures_user_ts on public.captures(user_id, server_ts desc);
create index if not exists idx_captures_label on public.captures(label_idx);
create unique index if not exists uniq_capture_per_window on public.captures(user_id, minute_ts);

alter table public.profiles enable row level security;
alter table public.captures enable row level security;
alter table public.daily_stats enable row level security;

create policy read_public_profiles on public.profiles
  for select using (privacy = 'public' or auth.uid() = user_id);
create policy update_own_profile on public.profiles
  for update using (auth.uid() = user_id);
create policy insert_own_profile on public.profiles
  for insert with check (auth.uid() = user_id);

create policy select_captures_public_profiles on public.captures
  for select using (
    auth.uid() = user_id OR EXISTS (
      select 1 from public.profiles p
      where p.user_id = public.captures.user_id and p.privacy = 'public'
    )
  );
create policy insert_own_captures on public.captures
  for insert with check (auth.uid() = user_id);
create policy delete_own_captures on public.captures
  for delete using (auth.uid() = user_id);

-- RPC
create or replace function public.record_capture()
returns public.captures
language plpgsql
security definer
as $$
declare
  now_ts timestamptz := now();
  hh int := extract(hour from now_ts);
  mm int := extract(minute from now_ts);
  diff int := extract(second from now_ts)::int;
  new_row public.captures;
begin
  if hh <> mm then
    raise exception 'Window closed';
  end if;

  insert into public.captures (user_id, server_ts, diff_seconds)
  values (auth.uid(), now_ts, diff)
  returning * into new_row;

  insert into public.daily_stats (user_id, day, captures_count, best_diff)
  values (auth.uid(), now_ts::date, 1, diff)
  on conflict (user_id, day) do update
    set captures_count = public.daily_stats.captures_count + 1,
        best_diff = least(coalesce(public.daily_stats.best_diff, 60), excluded.best_diff);

  return new_row;
end;$$;

-- Views
create or replace view public.v_leaderboard_total as
select p.username,
       count(c.id) as captures,
       round(avg(c.diff_seconds),2) as avg_diff
from public.captures c
join public.profiles p on p.user_id = c.user_id
where p.privacy = 'public'
group by p.username
order by captures desc;

create or replace view public.v_country_stats as
select coalesce(cnt.name, p.country_code) as country,
       p.country_code,
       count(c.id) as captures,
       round(avg(c.diff_seconds),2) as avg_diff,
       count(distinct c.user_id) as users
from public.captures c
join public.profiles p on p.user_id = c.user_id
left join public.countries cnt on cnt.code = p.country_code
where p.privacy = 'public'
group by country, p.country_code
order by captures desc;
