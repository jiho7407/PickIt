create or replace view public.dilemma_vote_summaries
with (security_invoker = false)
as
select
  d.id as dilemma_id,
  count(v.id) filter (where v.choice = 'buy')::int as buy_count,
  count(v.id) filter (where v.choice = 'skip')::int as skip_count,
  count(v.id) filter (where vo.position = 1)::int as option_a_count,
  count(v.id) filter (where vo.position = 2)::int as option_b_count,
  count(v.id)::int as total_count,
  case
    when count(v.id) = 0 then 0::numeric
    else round(
      (count(v.id) filter (where v.choice = 'buy'))::numeric * 100
        / count(v.id)::numeric,
      2
    )
  end as buy_ratio,
  case
    when count(v.id) = 0 then 0::numeric
    else round(
      (count(v.id) filter (where v.choice = 'skip'))::numeric * 100
        / count(v.id)::numeric,
      2
    )
  end as skip_ratio
from public.dilemmas as d
left join public.votes as v
  on v.dilemma_id = d.id
left join public.vote_options as vo
  on vo.id = v.option_id
where d.status in ('open', 'decided', 'followup_due', 'followed_up')
group by d.id;

revoke all on public.dilemma_vote_summaries from public, anon, authenticated;
grant select on public.dilemma_vote_summaries to anon, authenticated;
