-- FunounByFatima Storage Setup
-- Run this SQL in your Supabase SQL Editor

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow public read access to product images
CREATE POLICY "Public read access for product images" ON storage.objects 
FOR SELECT USING (bucket_id = 'product-images');

-- Policy to allow authenticated users to upload product images
CREATE POLICY "Authenticated users can upload product images" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Policy to allow authenticated users to update product images
CREATE POLICY "Authenticated users can update product images" ON storage.objects 
FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Policy to allow authenticated users to delete product images
CREATE POLICY "Authenticated users can delete product images" ON storage.objects 
FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Alternative: Allow anonymous uploads (less secure but simpler for testing)
-- Uncomment these if you want to allow uploads without authentication

-- CREATE POLICY "Allow anonymous upload to product images" ON storage.objects 
-- FOR INSERT WITH CHECK (bucket_id = 'product-images');

-- CREATE POLICY "Allow anonymous update to product images" ON storage.objects 
-- FOR UPDATE USING (bucket_id = 'product-images');

-- CREATE POLICY "Allow anonymous delete to product images" ON storage.objects 
-- FOR DELETE USING (bucket_id = 'product-images');

-- Custom orders reference images bucket (custom-orders)
-- Create this bucket in Storage dashboard and set it to public before applying policies.

DROP POLICY IF EXISTS "Public read access for custom order images" ON storage.objects;
CREATE POLICY "Public read access for custom order images" ON storage.objects
FOR SELECT USING (bucket_id = 'custom-orders');

DROP POLICY IF EXISTS "Allow anonymous upload to custom order images" ON storage.objects;
CREATE POLICY "Allow anonymous upload to custom order images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'custom-orders');
