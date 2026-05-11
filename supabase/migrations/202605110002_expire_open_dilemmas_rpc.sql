-- Idempotent auto-close RPC. The web app calls this from feed/detail server
-- loaders to lazily flip overdue 'open' dilemmas to 'closed'. Running it
-- multiple times is safe; only rows that crossed `closes_at` are updated.

create or replace function public.expire_open_dilemmas()
returns void
language sql
security definer
set search_path = public
as $$
  update public.dilemmas
     set status = 'closed'
   where status = 'open'
     and closes_at <= now();
$$;

revoke all on function public.expire_open_dilemmas() from public;
grant execute on function public.expire_open_dilemmas() to anon, authenticated;
