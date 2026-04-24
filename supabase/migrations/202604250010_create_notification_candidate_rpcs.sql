create or replace function public.vote_result_notification_threshold()
returns int
language sql
immutable
as $$
  select 10;
$$;

revoke all on function public.vote_result_notification_threshold() from public, anon, authenticated;
grant execute on function public.vote_result_notification_threshold() to authenticated;

create or replace function public.get_my_notification_candidates()
returns table (
  kind text,
  dilemma_id uuid,
  author_id uuid
)
language sql
stable
as $$
  select
    'result'::text as kind,
    d.id as dilemma_id,
    d.author_id
  from public.dilemmas as d
  join public.dilemma_vote_summaries as s
    on s.dilemma_id = d.id
  where d.author_id = auth.uid()
    and d.status = 'open'
    and s.total_count >= public.vote_result_notification_threshold()

  union all

  select
    'followup'::text as kind,
    d.id as dilemma_id,
    d.author_id
  from public.dilemmas as d
  where d.author_id = auth.uid()
    and d.followup_due_at <= now()
    and d.status in ('open', 'decided', 'followup_due')
    and not exists (
      select 1
      from public.followups as f
      where f.dilemma_id = d.id
    );
$$;

create or replace function public.get_operator_notification_candidates()
returns table (
  kind text,
  dilemma_id uuid,
  author_id uuid
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.profiles as p
    where p.id = auth.uid()
      and p.role = 'operator'
  ) then
    raise exception 'operator role required'
      using errcode = '42501';
  end if;

  return query
  select
    'result'::text as kind,
    d.id as dilemma_id,
    d.author_id
  from public.dilemmas as d
  join public.dilemma_vote_summaries as s
    on s.dilemma_id = d.id
  where d.status = 'open'
    and s.total_count >= public.vote_result_notification_threshold()

  union all

  select
    'followup'::text as kind,
    d.id as dilemma_id,
    d.author_id
  from public.dilemmas as d
  where d.followup_due_at <= now()
    and d.status in ('open', 'decided', 'followup_due')
    and not exists (
      select 1
      from public.followups as f
      where f.dilemma_id = d.id
    );
end;
$$;

revoke all on function public.get_my_notification_candidates() from public, anon, authenticated;
revoke all on function public.get_operator_notification_candidates() from public, anon, authenticated;
grant execute on function public.get_my_notification_candidates() to authenticated;
grant execute on function public.get_operator_notification_candidates() to authenticated;
