drop policy if exists "authenticated users can upload images to their own folder"
on storage.objects;

drop policy if exists "authenticated users can update images in their own folder"
on storage.objects;

drop policy if exists "authenticated users can delete images in their own folder"
on storage.objects;

create policy "authenticated users can upload images to their own folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id in ('dilemma-images', 'vote-option-images')
  and name ~ (
    '^'
    || auth.uid()::text
    || '/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$'
  )
);

create policy "authenticated users can update images in their own folder"
on storage.objects
for update
to authenticated
using (
  bucket_id in ('dilemma-images', 'vote-option-images')
  and name ~ (
    '^'
    || auth.uid()::text
    || '/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$'
  )
)
with check (
  bucket_id in ('dilemma-images', 'vote-option-images')
  and name ~ (
    '^'
    || auth.uid()::text
    || '/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$'
  )
);

create policy "authenticated users can delete images in their own folder"
on storage.objects
for delete
to authenticated
using (
  bucket_id in ('dilemma-images', 'vote-option-images')
  and name ~ (
    '^'
    || auth.uid()::text
    || '/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$'
  )
);
