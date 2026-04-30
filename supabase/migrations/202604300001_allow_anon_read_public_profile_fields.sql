-- Allow anonymous home browsing to render dilemma author labels and comment
-- author nicknames without exposing private profile columns to anon callers.
--
-- The home vote feed embeds `author:profiles!inner(nickname,life_stage)` and a
-- comment `author:profiles(nickname)` join. Without an anon SELECT policy on
-- `profiles`, those embeds resolve to null/empty for unauthenticated requests
-- and the entire dilemma row is filtered out by the !inner join, breaking the
-- "비로그인 사용자도 목록을 볼 수 있다" requirement.
--
-- Strategy:
--   1. Drop default table-wide SELECT for the anon role and re-grant only the
--      public-safe columns (id, nickname, life_stage). Postgres column-level
--      grants block any `?select=birth_year` style probe at the API edge.
--   2. Add an anon SELECT policy on profiles. The pre-existing policy
--      "profiles are readable by authenticated users" continues to give
--      logged-in users full access.

revoke select on public.profiles from anon;

grant select (id, nickname, life_stage) on public.profiles to anon;

create policy "profiles public fields are readable by anon"
on public.profiles
for select
to anon
using (true);
