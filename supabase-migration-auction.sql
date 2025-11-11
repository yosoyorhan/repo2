-- Collections table: Groups of products for auction
CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Collection products junction table
CREATE TABLE IF NOT EXISTS collection_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  added_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(collection_id, product_id)
);

-- Auctions table: Live auctions during streams
CREATE TABLE IF NOT EXISTS auctions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id uuid NOT NULL REFERENCES streams(id) ON DELETE CASCADE,
  collection_id uuid REFERENCES collections(id) ON DELETE SET NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  starting_price numeric(12,2) NOT NULL DEFAULT 0,
  current_price numeric(12,2) NOT NULL DEFAULT 0,
  current_winner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended', 'cancelled')),
  started_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  ends_at timestamptz,
  ended_at timestamptz,
  CHECK ((collection_id IS NOT NULL AND product_id IS NULL) OR (collection_id IS NULL AND product_id IS NOT NULL))
);

-- Bids table: Individual bids on auctions
CREATE TABLE IF NOT EXISTS bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id uuid NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- Collections RLS Policies
CREATE POLICY "Collections are viewable by anyone" ON collections FOR SELECT USING (true);
CREATE POLICY "Users can create their own collections" ON collections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own collections" ON collections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own collections" ON collections FOR DELETE USING (auth.uid() = user_id);

-- Collection products RLS Policies
CREATE POLICY "Collection products are viewable by anyone" ON collection_products FOR SELECT USING (true);
CREATE POLICY "Collection owners can add products" ON collection_products FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM collections WHERE id = collection_id AND user_id = auth.uid()));
CREATE POLICY "Collection owners can remove products" ON collection_products FOR DELETE 
  USING (EXISTS (SELECT 1 FROM collections WHERE id = collection_id AND user_id = auth.uid()));

-- Auctions RLS Policies
CREATE POLICY "Auctions are viewable by anyone" ON auctions FOR SELECT USING (true);
CREATE POLICY "Stream owners can create auctions" ON auctions FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM streams WHERE id = stream_id AND user_id = auth.uid()));
CREATE POLICY "Stream owners can update their auctions" ON auctions FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM streams WHERE id = stream_id AND user_id = auth.uid()));

-- Bids RLS Policies
CREATE POLICY "Bids are viewable by anyone" ON bids FOR SELECT USING (true);
CREATE POLICY "Authenticated users can place bids" ON bids FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_products_collection_id ON collection_products(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_products_product_id ON collection_products(product_id);
CREATE INDEX IF NOT EXISTS idx_auctions_stream_id ON auctions(stream_id);
CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status);
CREATE INDEX IF NOT EXISTS idx_bids_auction_id ON bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_bids_user_id ON bids(user_id);

-- Function to update auction current price and winner
CREATE OR REPLACE FUNCTION update_auction_on_bid()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auctions
  SET current_price = NEW.amount,
      current_winner_id = NEW.user_id
  WHERE id = NEW.auction_id
    AND NEW.amount > current_price;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update auction when new bid is placed
DROP TRIGGER IF EXISTS update_auction_on_bid_trigger ON bids;
CREATE TRIGGER update_auction_on_bid_trigger
AFTER INSERT ON bids
FOR EACH ROW EXECUTE FUNCTION update_auction_on_bid();

-- Function to update collection updated_at
CREATE OR REPLACE FUNCTION update_collection_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE collections SET updated_at = timezone('utc'::text, now()) WHERE id = NEW.collection_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update collection timestamp when products added/removed
DROP TRIGGER IF EXISTS update_collection_timestamp_trigger ON collection_products;
CREATE TRIGGER update_collection_timestamp_trigger
AFTER INSERT OR DELETE ON collection_products
FOR EACH ROW EXECUTE FUNCTION update_collection_timestamp();
