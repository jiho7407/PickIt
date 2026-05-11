-- Vote auto-close: dilemmas become "closed" 72 hours (3 days) after creation.
--
-- Decisions:
--   1. Add `closes_at timestamptz` with default `now() + interval '3 days'`,
--      mirroring the existing `followup_due_at` pattern.
--   2. Backfill `closes_at = created_at + interval '3 days'` for existing rows.
--   3. Extend the `dilemmas_status_check` allow-list with `'closed'` and grant
--      anon/authenticated SELECT visibility on closed rows so users who hold a
--      link or appear in "my votes" can still view the result page.
--   4. Refresh `dilemma_vote_summaries` so closed dilemmas keep aggregating
--      vote counts (closed rows must still display results).
--   5. Index `closes_at` for the auto-expire RPC.

alter table public.dilemmas
  add column closes_at timestamptz;

update public.dilemmas
  set closes_at = created_at + interval '3 days'
  where closes_at is null;

alter table public.dilemmas
  alter column closes_at set not null,
  alter column closes_at set default (now() + interval '3 days');

alter table public.dilemmas
  drop constraint dilemmas_status_check;

alter table public.dilemmas
  add constraint dilemmas_status_check check (
    status in (
      'draft',
      'open',
      'closed',
      'decided',
      'followup_due',
      'followed_up',
      'archived'
    )
  );

create index dilemmas_open_closes_at_idx
  on public.dilemmas (closes_at)
  where status = 'open';

drop policy "public dilemmas are readable" on public.dilemmas;

create policy "public dilemmas are readable"
on public.dilemmas
for select
to anon, authenticated
using (status in ('open', 'closed', 'decided', 'followup_due', 'followed_up'));

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
where d.status in ('open', 'closed', 'decided', 'followup_due', 'followed_up')
group by d.id;

revoke all on public.dilemma_vote_summaries from public, anon, authenticated;
grant select on public.dilemma_vote_summaries to anon, authenticated;
