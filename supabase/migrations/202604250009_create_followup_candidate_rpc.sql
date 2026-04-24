drop function if exists public.get_followup_candidates(timestamptz);

create index if not exists dilemmas_author_followup_due_at_candidates_idx
on public.dilemmas (author_id, followup_due_at)
where status in ('open', 'decided', 'followup_due');

create or replace function public.get_followup_candidates(
  now_ts timestamptz default now()
)
returns table (
  dilemma_id uuid,
  title text,
  product_name text,
  price int,
  followup_due_at timestamptz,
  days_overdue int,
  total_count int
)
language sql
stable
as $$
  select
    d.id as dilemma_id,
    d.title,
    d.product_name,
    d.price,
    d.followup_due_at,
    floor(extract(epoch from (now_ts - d.followup_due_at)) / 86400)::int as days_overdue,
    coalesce(s.total_count, 0)::int as total_count
  from public.dilemmas as d
  left join public.dilemma_vote_summaries as s
    on s.dilemma_id = d.id
  where d.author_id = auth.uid()
    and d.followup_due_at <= now_ts
    and d.status in ('open', 'decided', 'followup_due')
    and not exists (
      select 1
      from public.followups as f
      where f.dilemma_id = d.id
    )
  order by d.followup_due_at asc;
$$;

revoke all on function public.get_followup_candidates(timestamptz) from public, anon, authenticated;
grant execute on function public.get_followup_candidates(timestamptz) to authenticated;
