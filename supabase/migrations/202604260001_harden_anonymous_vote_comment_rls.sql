drop policy if exists "anonymous sessions can be created"
on public.anonymous_sessions;

drop policy if exists "anonymous sessions can cast votes"
on public.votes;

drop policy if exists "anonymous vote-linked comments can be created"
on public.comments;

create policy "anonymous sessions can be created"
on public.anonymous_sessions
for insert
to anon
with check (true);

create policy "anonymous sessions can cast votes"
on public.votes
for insert
to anon
with check (
  voter_id is null
  and anonymous_session_id is not null
);

create policy "anonymous vote-linked comments can be created"
on public.comments
for insert
to anon
with check (author_id is null);

create policy "authors can read their own dilemmas"
on public.dilemmas
for select
to authenticated
using (author_id = auth.uid());

create or replace function public.validate_comment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_vote record;
begin
  select id, dilemma_id, voter_id, anonymous_session_id
  into target_vote
  from public.votes
  where id = new.vote_id;

  if not found then
    raise exception 'vote % does not exist', new.vote_id
      using errcode = 'foreign_key_violation';
  end if;

  if target_vote.dilemma_id <> new.dilemma_id then
    raise exception 'comment vote must belong to the same dilemma'
      using errcode = 'check_violation';
  end if;

  if new.author_id is not null and new.author_id <> target_vote.voter_id then
    raise exception 'comment author must match the linked vote voter'
      using errcode = 'check_violation';
  end if;

  if new.author_id is null and target_vote.anonymous_session_id is null then
    raise exception 'anonymous comment must be linked to an anonymous vote'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;
