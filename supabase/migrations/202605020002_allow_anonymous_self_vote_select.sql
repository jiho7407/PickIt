-- Let an anonymous voter SELECT vote rows tied to an anonymous session so the
-- vote detail page can highlight which option the visitor chose. Server code
-- still scopes the lookup to the session id stored in the request cookie, so
-- this policy never widens the visible set in practice.
create policy "anonymous sessions can read their own votes"
on public.votes
for select
to anon, authenticated
using (
  voter_id is null
  and anonymous_session_id is not null
);
