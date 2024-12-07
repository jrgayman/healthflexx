-- Add hearts_count to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS hearts_count INTEGER DEFAULT 0;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_posts_hearts_count ON posts(hearts_count);

-- Create hearts table
CREATE TABLE IF NOT EXISTS post_hearts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT NOT NULL,
  session_id TEXT NOT NULL,
  UNIQUE(post_id, ip_address, session_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_post_hearts_post_id ON post_hearts(post_id);
CREATE INDEX IF NOT EXISTS idx_post_hearts_ip_session ON post_hearts(ip_address, session_id);

-- Create function to increment hearts
CREATE OR REPLACE FUNCTION increment_post_hearts(post_id UUID)
RETURNS INTEGER AS $$
BEGIN
    UPDATE posts 
    SET hearts_count = COALESCE(hearts_count, 0) + 1
    WHERE id = post_id;
    
    RETURN (SELECT hearts_count FROM posts WHERE id = post_id);
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_post_hearts(UUID) TO postgres, authenticated, anon;