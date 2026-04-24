insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'jiho@example.com',
    crypt('password', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"nickname":"Jiho"}'
  )
on conflict (id) do nothing;

insert into public.profiles (id, nickname, birth_year, gender, life_stage)
values (
  '11111111-1111-4111-8111-111111111111',
  'Jiho',
  1996,
  'unspecified',
  'worker'
)
on conflict (id) do nothing;

insert into public.dilemmas (
  id,
  author_id,
  title,
  product_name,
  price,
  category,
  situation,
  vote_type,
  status
)
values (
  '22222222-2222-4222-8222-222222222222',
  '11111111-1111-4111-8111-111111111111',
  '겨울 코트를 지금 사도 될까요?',
  '울 블렌드 코트',
  148720,
  'fashion',
  '출근할 때 입을 따뜻한 코트가 필요하지만 이번 달 예산을 넘길까 봐 고민돼요.',
  'buy_skip',
  'open'
)
on conflict (id) do nothing;
