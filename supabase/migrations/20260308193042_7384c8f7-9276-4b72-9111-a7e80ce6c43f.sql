
-- Storage policies for training-scripts bucket
CREATE POLICY "Users upload own scripts"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'training-scripts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users read own scripts"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'training-scripts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users delete own scripts"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'training-scripts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policies for avatars bucket
CREATE POLICY "Anyone can read avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "Users upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
