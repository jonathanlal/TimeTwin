create or replace function public.is_twin_time()
returns boolean
language sql
stable
as $$
  select extract(hour from now()) = extract(minute from now());
$$;
