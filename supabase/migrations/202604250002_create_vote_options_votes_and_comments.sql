create table public.anonymous_sessions (
  id uuid primary key default gen_random_uuid(),
  session_hash text not null unique,
  created_at timestamptz not null default now(),
  constraint anonymous_sessions_session_hash_length_check check (
    char_length(session_hash) between 32 and 256
  )
);

create table public.vote_options (
  id uuid primary key default gen_random_uuid(),
  dilemma_id uuid not null references public.dilemmas(id) on delete cascade,
  label text not null,
  image_path text,
  price int,
  position int not null,
  created_at timestamptz not null default now(),
  constraint vote_options_label_length_check check (
    char_length(label) between 1 and 80
  ),
  constraint vote_options_price_positive_check check (
    price is null or price > 0
  ),
  constraint vote_options_position_check check (position in (1, 2)),
  constraint vote_options_dilemma_id_position_key unique (dilemma_id, position)
);

create table public.votes (
  id uuid primary key default gen_random_uuid(),
  dilemma_id uuid not null references public.dilemmas(id) on delete cascade,
  option_id uuid references public.vote_options(id) on delete restrict,
  voter_id uuid references public.profiles(id) on delete cascade,
  anonymous_session_id uuid references public.anonymous_sessions(id) on delete cascade,
  choice text,
  created_at timestamptz not null default now(),
  constraint votes_choice_check check (choice is null or choice in ('buy', 'skip')),
  constraint votes_exactly_one_voter_check check (
    (voter_id is not null) <> (anonymous_session_id is not null)
  )
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  dilemma_id uuid not null references public.dilemmas(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  vote_id uuid not null unique references public.votes(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint comments_body_length_check check (
    char_length(body) between 1 and 200
  )
);

create unique index votes_dilemma_id_voter_id_key
on public.votes (dilemma_id, voter_id)
where voter_id is not null;

create unique index votes_dilemma_id_anonymous_session_id_key
on public.votes (dilemma_id, anonymous_session_id)
where anonymous_session_id is not null;

create index votes_dilemma_id_created_at_idx
on public.votes (dilemma_id, created_at desc);

create index vote_options_dilemma_id_position_idx
on public.vote_options (dilemma_id, position);

create index comments_dilemma_id_created_at_idx
on public.comments (dilemma_id, created_at desc);

create or replace function public.validate_vote()
returns trigger
language plpgsql
as $$
declare
  target_dilemma record;
  target_option record;
begin
  select id, author_id, vote_type
  into target_dilemma
  from public.dilemmas
  where id = new.dilemma_id;

  if not found then
    raise exception 'dilemma % does not exist', new.dilemma_id
      using errcode = 'foreign_key_violation';
  end if;

  if new.voter_id is not null and new.voter_id = target_dilemma.author_id then
    raise exception 'authors cannot vote on their own dilemmas'
      using errcode = 'check_violation';
  end if;

  if target_dilemma.vote_type = 'buy_skip' then
    if new.choice is null or new.option_id is not null then
      raise exception 'buy_skip votes require choice and no option'
        using errcode = 'check_violation';
    end if;
  elsif target_dilemma.vote_type = 'ab' then
    if new.choice is not null or new.option_id is null then
      raise exception 'ab votes require option and no choice'
        using errcode = 'check_violation';
    end if;

    select id, dilemma_id
    into target_option
    from public.vote_options
    where id = new.option_id;

    if not found or target_option.dilemma_id <> new.dilemma_id then
      raise exception 'vote option must belong to the same dilemma'
        using errcode = 'check_violation';
    end if;
  end if;

  return new;
end;
$$;

create trigger votes_validate_before_insert_update
before insert or update on public.votes
for each row
execute function public.validate_vote();

create or replace function public.validate_comment()
returns trigger
language plpgsql
as $$
declare
  target_vote record;
begin
  select id, dilemma_id, voter_id
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

  return new;
end;
$$;

create trigger comments_validate_before_insert_update
before insert or update on public.comments
for each row
execute function public.validate_comment();

alter table public.anonymous_sessions enable row level security;
alter table public.vote_options enable row level security;
alter table public.votes enable row level security;
alter table public.comments enable row level security;

create policy "anonymous sessions can be created"
on public.anonymous_sessions
for insert
to anon, authenticated
with check (true);

create policy "public vote options are readable"
on public.vote_options
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.dilemmas as d
    where d.id = vote_options.dilemma_id
      and d.status in ('open', 'decided', 'followup_due', 'followed_up')
  )
);

create policy "authors can create options for their dilemmas"
on public.vote_options
for insert
to authenticated
with check (
  exists (
    select 1
    from public.dilemmas as d
    where d.id = vote_options.dilemma_id
      and d.author_id = auth.uid()
      and d.vote_type = 'ab'
  )
);

create policy "public votes are readable"
on public.votes
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.dilemmas as d
    where d.id = votes.dilemma_id
      and d.status in ('open', 'decided', 'followup_due', 'followed_up')
  )
);

create policy "authenticated users can cast their own votes"
on public.votes
for insert
to authenticated
with check (
  voter_id = auth.uid()
  and anonymous_session_id is null
  and not exists (
    select 1
    from public.dilemmas as d
    where d.id = votes.dilemma_id
      and d.author_id = auth.uid()
  )
);

create policy "anonymous sessions can cast votes"
on public.votes
for insert
to anon, authenticated
with check (
  voter_id is null
  and anonymous_session_id is not null
  and (
    auth.uid() is null
    or not exists (
      select 1
      from public.dilemmas as d
      where d.id = votes.dilemma_id
        and d.author_id = auth.uid()
    )
  )
);

create policy "public comments are readable"
on public.comments
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.dilemmas as d
    where d.id = comments.dilemma_id
      and d.status in ('open', 'decided', 'followup_due', 'followed_up')
  )
);

create policy "authenticated users can create vote-linked comments"
on public.comments
for insert
to authenticated
with check (author_id = auth.uid());

create policy "anonymous vote-linked comments can be created"
on public.comments
for insert
to anon, authenticated
with check (
  author_id is null
  and exists (
    select 1
    from public.votes as v
    where v.id = comments.vote_id
      and v.dilemma_id = comments.dilemma_id
      and v.anonymous_session_id is not null
  )
);

create policy "authors can update their comments"
on public.comments
for update
to authenticated
using (author_id = auth.uid())
with check (author_id = auth.uid());

create policy "authors can delete their comments"
on public.comments
for delete
to authenticated
using (author_id = auth.uid());
