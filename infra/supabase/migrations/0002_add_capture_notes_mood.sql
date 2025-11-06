-- 0002_add_capture_notes_mood.sql
-- Add note and mood tagging fields to captures table

alter table public.captures
  add column if not exists note text,
  add column if not exists mood text check (mood in ('excited', 'happy', 'neutral', 'thoughtful', 'grateful', 'hopeful'));

-- Update the record_capture function to accept optional note and mood parameters
create or replace function public.record_capture(
  p_note text default null,
  p_mood text default null
)
returns json
language plpgsql
security definer
as $$
declare
  now_ts timestamptz := now();
  hh int := extract(hour from now_ts);
  mm int := extract(minute from now_ts);
  diff int := extract(second from now_ts)::int;
  new_row public.captures;
  success boolean := false;
  msg text := '';
begin
  if hh <> mm then
    return json_build_object(
      'success', false,
      'message', 'Window closed: Time must match HH:MM pattern'
    );
  end if;

  -- Check if capture already exists for this minute window
  if exists (
    select 1 from public.captures
    where user_id = auth.uid()
      and minute_ts = date_trunc('minute', now_ts)
  ) then
    return json_build_object(
      'success', false,
      'message', 'Already captured this minute window'
    );
  end if;

  insert into public.captures (user_id, server_ts, diff_seconds, note, mood)
  values (auth.uid(), now_ts, diff, p_note, p_mood)
  returning * into new_row;

  insert into public.daily_stats (user_id, day, captures_count, best_diff)
  values (auth.uid(), now_ts::date, 1, diff)
  on conflict (user_id, day) do update
    set captures_count = public.daily_stats.captures_count + 1,
        best_diff = least(coalesce(public.daily_stats.best_diff, 60), excluded.best_diff);

  if diff <= 3 then
    success := true;
    msg := format('Perfect capture! Only %s seconds off 🎯', diff);
  elsif diff <= 10 then
    success := true;
    msg := format('Great catch! %s seconds off ⭐', diff);
  else
    success := false;
    msg := format('Captured at %s seconds. Try to get closer next time!', diff);
  end if;

  return json_build_object(
    'success', success,
    'message', msg,
    'capture', row_to_json(new_row)
  );
exception
  when unique_violation then
    return json_build_object(
      'success', false,
      'message', 'Already captured this minute window'
    );
  when others then
    return json_build_object(
      'success', false,
      'message', 'An error occurred: ' || SQLERRM
    );
end;$$;
