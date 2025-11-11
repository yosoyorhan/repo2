-- Create follows table for user follow system
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Ensure user can't follow themselves
  CONSTRAINT no_self_follow CHECK (follower_id != following_id),
  
  -- Ensure unique follow relationships
  CONSTRAINT unique_follow UNIQUE (follower_id, following_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_created_at ON follows(created_at DESC);

-- Enable Row Level Security
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for follows table

-- Anyone can view follows
CREATE POLICY "Anyone can view follows"
  ON follows FOR SELECT
  USING (true);

-- Users can create follows (follow someone)
CREATE POLICY "Users can follow others"
  ON follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

-- Users can delete their own follows (unfollow)
CREATE POLICY "Users can unfollow"
  ON follows FOR DELETE
  USING (auth.uid() = follower_id);

-- Create a function to get follower count
CREATE OR REPLACE FUNCTION get_follower_count(user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM follows
  WHERE following_id = user_id;
$$ LANGUAGE SQL STABLE;

-- Create a function to get following count
CREATE OR REPLACE FUNCTION get_following_count(user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM follows
  WHERE follower_id = user_id;
$$ LANGUAGE SQL STABLE;

-- Create a function to check if user A follows user B
CREATE OR REPLACE FUNCTION is_following(follower UUID, following UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM follows
    WHERE follower_id = follower AND following_id = following
  );
$$ LANGUAGE SQL STABLE;

-- Add follower/following counts to profiles view (optional, for optimization)
-- You can query these using the functions above or create a materialized view

COMMENT ON TABLE follows IS 'User follow relationships';
COMMENT ON COLUMN follows.follower_id IS 'The user who is following';
COMMENT ON COLUMN follows.following_id IS 'The user being followed';
