-- Fix auction constraint to allow both collection_id and product_id
-- This allows us to track which collection a product auction belongs to

-- Drop the old constraint (if exists)
DO $$ 
BEGIN
    ALTER TABLE auctions DROP CONSTRAINT IF EXISTS auctions_check;
EXCEPTION WHEN undefined_object THEN 
    NULL;
END $$;

-- Drop existing product constraint (if exists)
DO $$ 
BEGIN
    ALTER TABLE auctions DROP CONSTRAINT IF EXISTS auctions_product_required;
EXCEPTION WHEN undefined_object THEN 
    NULL;
END $$;

-- Add new constraint: at least product_id must exist (collection_id is optional for context)
DO $$ 
BEGIN
    ALTER TABLE auctions ADD CONSTRAINT auctions_product_required 
      CHECK (product_id IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN 
    NULL;
END $$;

-- Make collection_id optional but recommended for tracking
COMMENT ON COLUMN auctions.collection_id IS 'Optional: tracks which collection this product belongs to during the stream';
COMMENT ON COLUMN auctions.product_id IS 'Required: the specific product being auctioned';
