create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  profile_nickname text;
begin
  profile_nickname := nullif(
    trim(
      coalesce(
        new.raw_user_meta_data ->> 'nickname',
        new.raw_user_meta_data ->> 'full_name',
        new.raw_user_meta_data ->> 'name',
        split_part(new.email, '@', 1),
        'PickIt user'
      )
    ),
    ''
  );

  if char_length(profile_nickname) < 2 then
    profile_nickname := 'PickIt user';
  end if;

  if char_length(profile_nickname) > 24 then
    profile_nickname := left(profile_nickname, 24);
  end if;

  insert into public.profiles (id, nickname, role)
  values (new.id, profile_nickname, 'user')
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();
