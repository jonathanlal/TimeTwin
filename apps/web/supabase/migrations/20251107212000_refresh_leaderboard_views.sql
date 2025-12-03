drop view if exists public.v_leaderboard_total;
drop view if exists public.v_country_stats;

create or replace view public.v_leaderboard_total as
select
  p.user_id,
  p.username,
  p.country_code,
  count(c.id)::bigint as total_captures
from public.captures c
join public.profiles p on p.user_id = c.user_id
where p.privacy = 'public'
group by p.user_id, p.username, p.country_code;

create or replace view public.v_country_stats as
select
  p.country_code,
  coalesce(cnt.name, p.country_code) as country_name,
  count(c.id)::bigint as total_captures,
  count(distinct c.user_id)::bigint as user_count
from public.captures c
join public.profiles p on p.user_id = c.user_id
left join public.countries cnt on cnt.code = p.country_code
where p.privacy = 'public'
group by p.country_code, coalesce(cnt.name, p.country_code);
