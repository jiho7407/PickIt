-- Allow a single vote to carry multiple comments. The original schema enforced
-- one comment per vote via a unique constraint on comments.vote_id, which
-- prevented voters from leaving more than one comment after voting.
alter table public.comments
  drop constraint if exists comments_vote_id_key;

create index if not exists comments_vote_id_idx
  on public.comments (vote_id);

-- Voters can change their existing vote (e.g., switching from buy to skip).
create policy "authenticated users can update their own votes"
on public.votes
for update
to authenticated
using (voter_id = auth.uid())
with check (
  voter_id = auth.uid()
  and anonymous_session_id is null
);

create policy "anonymous sessions can update their votes"
on public.votes
for update
to anon, authenticated
using (
  voter_id is null
  and anonymous_session_id is not null
)
with check (
  voter_id is null
  and anonymous_session_id is not null
);
