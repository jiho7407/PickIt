create extension if not exists pgcrypto with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  birth_year int,
  gender text,
  life_stage text,
  role text not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_nickname_length_check check (
    char_length(nickname) between 2 and 24
  ),
  constraint profiles_role_check check (role in ('user', 'operator'))
);

create table public.dilemmas (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  product_name text not null,
  price int not null,
  category text not null,
  situation text not null,
  image_path text,
  vote_type text not null default 'buy_skip',
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  followup_due_at timestamptz not null default (now() + interval '7 days'),
  constraint dilemmas_title_length_check check (
    char_length(title) between 2 and 80
  ),
  constraint dilemmas_product_name_length_check check (
    char_length(product_name) between 1 and 80
  ),
  constraint dilemmas_price_positive_check check (price > 0),
  constraint dilemmas_category_length_check check (
    char_length(category) between 1 and 40
  ),
  constraint dilemmas_situation_length_check check (
    char_length(situation) between 10 and 1000
  ),
  constraint dilemmas_vote_type_check check (vote_type in ('buy_skip', 'ab')),
  constraint dilemmas_status_check check (
    status in (
      'draft',
      'open',
      'decided',
      'followup_due',
      'followed_up',
      'archived'
    )
  )
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger dilemmas_set_updated_at
before update on public.dilemmas
for each row
execute function public.set_updated_at();

create index dilemmas_status_created_at_idx
on public.dilemmas (status, created_at desc);

create index dilemmas_author_id_created_at_idx
on public.dilemmas (author_id, created_at desc);

create index dilemmas_category_created_at_idx
on public.dilemmas (category, created_at desc);

create index dilemmas_followup_due_at_active_idx
on public.dilemmas (followup_due_at)
where status in ('open', 'decided');

alter table public.profiles enable row level security;
alter table public.dilemmas enable row level security;

create policy "profiles are readable by authenticated users"
on public.profiles
for select
to authenticated
using (true);

create policy "users can insert their own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id and role = 'user');

create policy "users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (
  auth.uid() = id
  and role = (
    select p.role
    from public.profiles as p
    where p.id = auth.uid()
  )
);

create policy "public dilemmas are readable"
on public.dilemmas
for select
to anon, authenticated
using (status in ('open', 'decided', 'followup_due', 'followed_up'));

create policy "authenticated users can create their own dilemmas"
on public.dilemmas
for insert
to authenticated
with check (auth.uid() = author_id);

create policy "authors can update their own dilemmas"
on public.dilemmas
for update
to authenticated
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

create policy "authors can delete their own dilemmas"
on public.dilemmas
for delete
to authenticated
using (auth.uid() = author_id);
