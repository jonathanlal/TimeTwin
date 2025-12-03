alter table public.captures
  add column if not exists note text,
  add column if not exists mood text
    check (mood in ('excited', 'happy', 'neutral', 'thoughtful', 'grateful', 'hopeful'));

drop function if exists public.record_capture(text, text);

create or replace function public.record_capture(p_note text default null, p_mood text default null)
returns json
language plpgsql
security definer
as $$
declare
  now_ts timestamptz := now();
  hh int := extract(hour from now_ts);
  mm int := extract(minute from now_ts);
  diff int := extract(second from now_ts)::int;
  minute_window timestamptz := public.utc_trunc_minute(now_ts);
  new_row public.captures;
begin
  if hh <> mm then
    return json_build_object(
      'success', false,
      'message', 'Window closed: Time must match HH:MM pattern',
      'capture_id', null
    );
  end if;

  if exists (
    select 1
    from public.captures
    where user_id = auth.uid()
      and minute_ts = minute_window
  ) then
    return json_build_object(
      'success', false,
      'message', 'Already captured this minute window',
      'capture_id', null
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

  return json_build_object(
    'success', true,
    'message', format('Captured with %s second offset', diff),
    'capture_id', new_row.id
  );
exception
  when others then
    return json_build_object(
      'success', false,
      'message', 'An error occurred while saving: ' || SQLERRM,
      'capture_id', null
    );
end;
$$;
