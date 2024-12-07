-- Create hearts table
CREATE TABLE IF NOT EXISTS post_hearts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  session_id TEXT NOT NULL,
  UNIQUE(post_id, ip_address, session_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_post_hearts_post_id ON post_hearts(post_id);
CREATE INDEX IF NOT EXISTS idx_post_hearts_ip_session ON post_hearts(ip_address, session_id);

-- Add hearts count to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS hearts_count INTEGER DEFAULT 0;

-- Create index for hearts count
CREATE INDEX IF NOT EXISTS idx_posts_hearts_count ON posts(hearts_count);

-- Create trigger function to update hearts count
CREATE OR REPLACE FUNCTION update_post_hearts_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts 
    SET hearts_count = (
      SELECT COUNT(*) 
      FROM post_hearts 
      WHERE post_id = NEW.post_id
    )
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts 
    SET hearts_count = (
      SELECT COUNT(*) 
      FROM post_hearts 
      WHERE post_id = OLD.post_id
    )
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_post_hearts_count ON post_hearts;
CREATE TRIGGER trigger_update_post_hearts_count
AFTER INSERT OR DELETE ON post_hearts
FOR EACH ROW
EXECUTE FUNCTION update_post_hearts_count();