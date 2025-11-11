-- =====================================================
-- Enhanced Auction Timer & Sales System Migration
-- Date: 2025-11-11
-- =====================================================

-- 1. Add timer fields to auctions table
ALTER TABLE auctions 
ADD COLUMN IF NOT EXISTS timer_seconds INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS timer_started_at TIMESTAMPTZ;

-- 2. Add winner tracking to auctions
ALTER TABLE auctions
ADD COLUMN IF NOT EXISTS winner_user_id UUID REFERENCES auth.users(id);

-- 3. Create sales table for completed transactions
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

-- 4. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_sales_seller ON sales(seller_id);
CREATE INDEX IF NOT EXISTS idx_sales_buyer ON sales(buyer_id);
CREATE INDEX IF NOT EXISTS idx_sales_product ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_sold_at ON sales(sold_at DESC);

-- 5. Add winner_user_id to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS winner_user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS is_sold BOOLEAN DEFAULT FALSE;

-- 6. Enable RLS on sales table
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- 7. Sales table policies
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
