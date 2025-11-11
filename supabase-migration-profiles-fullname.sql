-- Add full_name column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Update existing profiles to have full_name same as username
UPDATE profiles SET full_name = username WHERE full_name IS NULL;

-- Create storage policies for product-images bucket
-- Allow authenticated users to upload their own images
CREATE POLICY "Users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access to product images
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Allow users to update their own images
CREATE POLICY "Users can update their product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own images
CREATE POLICY "Users can delete their product images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);
