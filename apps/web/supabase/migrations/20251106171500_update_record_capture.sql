drop function if exists public.record_capture(text, text);

create or replace function public.record_capture(p_note text default null, p_mood text default null)
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
    raise exception 'Window closed: Time must match HH:MM pattern';
  end if;

  insert into public.captures (user_id, server_ts, diff_seconds, note, mood)
  values (auth.uid(), now_ts, diff, p_note, p_mood)
  returning * into new_row;

  insert into public.daily_stats (user_id, day, captures_count, best_diff)
  values (auth.uid(), now_ts::date, 1, diff)
  on conflict (user_id, day) do update
    set captures_count = public.daily_stats.captures_count + 1,
        best_diff = least(coalesce(public.daily_stats.best_diff, 60), excluded.best_diff);

  return new_row;
end;
$$;
