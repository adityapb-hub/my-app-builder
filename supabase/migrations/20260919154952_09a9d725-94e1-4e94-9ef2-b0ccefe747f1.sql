create policy media_owner_insert on storage.objects for insert to authenticated
  with check (
    bucket_id = 'coop-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy media_owner_select on storage.objects for select to authenticated
  using (
    bucket_id = 'coop-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy media_owner_update on storage.objects for update to authenticated
  using (
    bucket_id = 'coop-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'coop-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy media_owner_delete on storage.objects for delete to authenticated
  using (
    bucket_id = 'coop-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );