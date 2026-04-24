insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values
  (
    'dilemma-images',
    'dilemma-images',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'vote-option-images',
    'vote-option-images',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "public image buckets are readable"
on storage.objects
for select
to anon, authenticated
using (bucket_id in ('dilemma-images', 'vote-option-images'));

create policy "authenticated users can upload images to their own folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id in ('dilemma-images', 'vote-option-images')
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "authenticated users can update images in their own folder"
on storage.objects
for update
to authenticated
using (
  bucket_id in ('dilemma-images', 'vote-option-images')
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id in ('dilemma-images', 'vote-option-images')
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "authenticated users can delete images in their own folder"
on storage.objects
for delete
to authenticated
using (
  bucket_id in ('dilemma-images', 'vote-option-images')
  and (storage.foldername(name))[1] = auth.uid()::text
);
