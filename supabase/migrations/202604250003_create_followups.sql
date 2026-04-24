create table public.followups (
  id uuid primary key default gen_random_uuid(),
  dilemma_id uuid not null unique references public.dilemmas(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  outcome text not null,
  saved_amount int not null default 0,
  satisfaction_score int,
  note text,
  responded_at timestamptz not null default now(),
  constraint followups_outcome_check check (outcome in ('bought', 'skipped')),
  constraint followups_saved_amount_non_negative_check check (saved_amount >= 0),
  constraint followups_satisfaction_score_check check (
    satisfaction_score is null or satisfaction_score between 1 and 5
  ),
  constraint followups_note_length_check check (
    note is null or char_length(note) <= 500
  )
);

create index followups_author_id_responded_at_idx
on public.followups (author_id, responded_at desc);

create or replace function public.prepare_followup()
returns trigger
language plpgsql
as $$
declare
  target_dilemma record;
begin
  select id, author_id, price
  into target_dilemma
  from public.dilemmas
  where id = new.dilemma_id;

  if not found then
    raise exception 'dilemma % does not exist', new.dilemma_id
      using errcode = 'foreign_key_violation';
  end if;

  if new.author_id <> target_dilemma.author_id then
    raise exception 'followup author must match dilemma author'
      using errcode = 'check_violation';
  end if;

  new.saved_amount = case
    when new.outcome = 'skipped' then target_dilemma.price
    else 0
  end;

  return new;
end;
$$;

create trigger followups_prepare_before_insert_update
before insert or update on public.followups
for each row
execute function public.prepare_followup();

create or replace function public.mark_dilemma_followed_up()
returns trigger
language plpgsql
as $$
begin
  update public.dilemmas
  set status = 'followed_up',
      updated_at = now()
  where id = new.dilemma_id;

  return new;
end;
$$;

create trigger followups_mark_dilemma_after_insert
after insert on public.followups
for each row
execute function public.mark_dilemma_followed_up();

create or replace function public.get_followup_candidates(
  p_now timestamptz default now()
)
returns table (
  dilemma_id uuid,
  title text,
  product_name text,
  price int,
  followup_due_at timestamptz
)
language sql
stable
as $$
  select d.id, d.title, d.product_name, d.price, d.followup_due_at
  from public.dilemmas as d
  where d.author_id = auth.uid()
    and d.followup_due_at <= p_now
    and d.status in ('open', 'decided', 'followup_due')
    and not exists (
      select 1
      from public.followups as f
      where f.dilemma_id = d.id
    )
  order by d.followup_due_at asc;
$$;

alter table public.followups enable row level security;

create policy "authors can read their followups"
on public.followups
for select
to authenticated
using (author_id = auth.uid());

create policy "authors can create their followups"
on public.followups
for insert
to authenticated
with check (author_id = auth.uid());

create policy "authors can update their followups"
on public.followups
for update
to authenticated
using (author_id = auth.uid())
with check (author_id = auth.uid());
