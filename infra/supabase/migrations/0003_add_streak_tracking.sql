-- 0003_add_streak_tracking.sql
-- Add function to calculate user's current capture streak

-- Function to calculate current streak for a user
-- Returns the number of consecutive days (including today) with at least one capture
create or replace function public.get_user_streak(p_user_id uuid)
returns int
language plpgsql
security definer
as $$
declare
  streak_count int := 0;
  check_date date;
  has_capture boolean;
begin
  -- Start from today and work backwards
  check_date := current_date;

  loop
    -- Check if user has captures on this date
    select exists(
      select 1 from public.daily_stats
      where user_id = p_user_id
        and day = check_date
        and captures_count > 0
    ) into has_capture;

    -- If no captures on this date, streak is broken
    exit when not has_capture;

    -- Increment streak and check previous day
    streak_count := streak_count + 1;
    check_date := check_date - interval '1 day';

    -- Safety limit: don't go back more than 1000 days
    exit when streak_count >= 1000;
  end loop;

  return streak_count;
end;$$;

-- Function to get current user's streak (convenience wrapper)
create or replace function public.get_my_streak()
returns int
language sql
security definer
as $$
  select public.get_user_streak(auth.uid());
$$;

-- Add RLS policy for the function
grant execute on function public.get_user_streak(uuid) to authenticated;
grant execute on function public.get_my_streak() to authenticated;
