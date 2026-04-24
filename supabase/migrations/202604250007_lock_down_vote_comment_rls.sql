drop policy if exists "public votes are readable"
on public.votes;

drop policy if exists "anonymous vote-linked comments can be created"
on public.comments;

create policy "authenticated users can read their own votes"
on public.votes
for select
to authenticated
using (voter_id = auth.uid());
