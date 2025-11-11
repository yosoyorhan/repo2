-- Fix auction constraint to allow both collection_id and product_id
-- This allows us to track which collection a product auction belongs to

-- Drop the old constraint
ALTER TABLE auctions DROP CONSTRAINT IF EXISTS auctions_check;

-- Add new constraint: at least product_id must exist (collection_id is optional for context)
ALTER TABLE auctions ADD CONSTRAINT auctions_product_required 
  CHECK (product_id IS NOT NULL);

-- Make collection_id optional but recommended for tracking
COMMENT ON COLUMN auctions.collection_id IS 'Optional: tracks which collection this product belongs to during the stream';
COMMENT ON COLUMN auctions.product_id IS 'Required: the specific product being auctioned';
