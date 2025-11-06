-- 0004_add_analytics_functions.sql
-- Add functions for calculating user analytics and insights

-- Function to get user's capture accuracy statistics
create or replace function public.get_user_accuracy_stats(p_user_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  result json;
begin
  select json_build_object(
    'total_captures', count(*),
    'avg_accuracy', round(avg(diff_seconds)::numeric, 2),
    'best_accuracy', min(diff_seconds),
    'perfect_captures', count(*) filter (where diff_seconds <= 3),
    'great_captures', count(*) filter (where diff_seconds between 4 and 10),
    'good_captures', count(*) filter (where diff_seconds > 10)
  )
  into result
  from public.captures
  where user_id = p_user_id;

  return result;
end;$$;

-- Function to get user's time of day distribution
create or replace function public.get_user_time_distribution(p_user_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  result json;
begin
  select json_agg(
    json_build_object(
      'hour', label_str,
      'count', capture_count
    ) order by label_idx
  )
  into result
  from (
    select
      label_str,
      label_idx,
      count(*) as capture_count
    from public.captures
    where user_id = p_user_id
    group by label_str, label_idx
    having count(*) > 0
  ) subquery;

  return coalesce(result, '[]'::json);
end;$$;

-- Function to get user's mood distribution
create or replace function public.get_user_mood_distribution(p_user_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  result json;
begin
  select json_agg(
    json_build_object(
      'mood', mood,
      'count', capture_count
    )
  )
  into result
  from (
    select
      mood,
      count(*) as capture_count
    from public.captures
    where user_id = p_user_id
      and mood is not null
    group by mood
    order by capture_count desc
  ) subquery;

  return coalesce(result, '[]'::json);
end;$$;

-- Function to get user's recent activity (last 30 days)
create or replace function public.get_user_recent_activity(p_user_id uuid, p_days int default 30)
returns json
language plpgsql
security definer
as $$
declare
  result json;
begin
  select json_agg(
    json_build_object(
      'date', activity_date,
      'count', capture_count
    ) order by activity_date desc
  )
  into result
  from (
    select
      date(server_ts at time zone 'UTC') as activity_date,
      count(*) as capture_count
    from public.captures
    where user_id = p_user_id
      and server_ts >= (current_date - (p_days || ' days')::interval)
    group by date(server_ts at time zone 'UTC')
  ) subquery;

  return coalesce(result, '[]'::json);
end;$$;

-- Function to get comprehensive analytics for current user
create or replace function public.get_my_analytics()
returns json
language plpgsql
security definer
as $$
declare
  result json;
begin
  select json_build_object(
    'accuracy_stats', public.get_user_accuracy_stats(auth.uid()),
    'time_distribution', public.get_user_time_distribution(auth.uid()),
    'mood_distribution', public.get_user_mood_distribution(auth.uid()),
    'recent_activity', public.get_user_recent_activity(auth.uid(), 30)
  )
  into result;

  return result;
end;$$;

-- Grant execute permissions
grant execute on function public.get_user_accuracy_stats(uuid) to authenticated;
grant execute on function public.get_user_time_distribution(uuid) to authenticated;
grant execute on function public.get_user_mood_distribution(uuid) to authenticated;
grant execute on function public.get_user_recent_activity(uuid, int) to authenticated;
grant execute on function public.get_my_analytics() to authenticated;
