-- =====================================================
-- Supabase Database Migration
-- Date: 2025-11-11
-- Description: Add full_name, storage policies, auction timer, sales system
-- =====================================================

-- PART 1: Full name and Storage Policies
-- =====================================================

-- 1. Add full_name column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

-- 2. Update existing profiles with username as full_name
UPDATE profiles SET full_name = username WHERE full_name IS NULL;

-- 3. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their product images" ON storage.objects;

-- 4. Storage Policy: Users can upload their product images
CREATE POLICY "Users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. Storage Policy: Public can view product images
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- 6. Storage Policy: Users can update their product images
CREATE POLICY "Users can update their product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 7. Storage Policy: Users can delete their product images
CREATE POLICY "Users can delete their product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- PART 2: Enhanced Auction System with Timer
-- =====================================================

-- 8. Add is_system column to stream_messages for bid notifications
ALTER TABLE stream_messages
ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT FALSE;

-- 9. Add timer fields to auctions table
ALTER TABLE auctions 
ADD COLUMN IF NOT EXISTS timer_seconds INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS timer_started_at TIMESTAMPTZ;

-- 10. Add winner tracking to auctions
ALTER TABLE auctions
ADD COLUMN IF NOT EXISTS winner_user_id UUID REFERENCES auth.users(id);

-- 11. Add winner_user_id to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS winner_user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS is_sold BOOLEAN DEFAULT FALSE;

-- PART 3: Sales System & Bids Enhancement
-- =====================================================

-- 12. Update bids table to track incremental bids properly
ALTER TABLE bids 
ADD COLUMN IF NOT EXISTS increment DECIMAL(10,2);

-- 13. Update auctions to track current winner better
ALTER TABLE auctions
ADD COLUMN IF NOT EXISTS current_winner_username TEXT;

-- 14. Create sales table for completed transactions
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES auth.users(id),
  buyer_id UUID NOT NULL REFERENCES auth.users(id),
  product_id UUID NOT NULL REFERENCES products(id),
  auction_id UUID REFERENCES auctions(id),
  final_price DECIMAL(10,2) NOT NULL,
  sold_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_sales_seller ON sales(seller_id);
CREATE INDEX IF NOT EXISTS idx_sales_buyer ON sales(buyer_id);
CREATE INDEX IF NOT EXISTS idx_sales_product ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_sold_at ON sales(sold_at DESC);
CREATE INDEX IF NOT EXISTS idx_bids_auction ON bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_bids_user ON bids(user_id);

-- 16. Enable RLS on sales table
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- 17. Sales table policies
DROP POLICY IF EXISTS "Users can view their own sales" ON sales;
CREATE POLICY "Users can view their own sales"
ON sales FOR SELECT
TO authenticated
USING (seller_id = auth.uid() OR buyer_id = auth.uid());

DROP POLICY IF EXISTS "Users can view public sales" ON sales;
CREATE POLICY "Users can view public sales"
ON sales FOR SELECT
TO public
USING (true);

-- =====================================================
-- Migration Complete!
-- =====================================================
