-- Add likes column to posts if it doesn't exist
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;

-- Create index on likes column
CREATE INDEX IF NOT EXISTS idx_posts_likes ON posts(likes);

-- Create function to increment likes
CREATE OR REPLACE FUNCTION increment_likes(post_id UUID)
RETURNS TABLE (likes INTEGER) AS $$
BEGIN
  RETURN QUERY
  UPDATE posts 
  SET likes = likes + 1
  WHERE id = post_id
  RETURNING likes;
END;
$$ LANGUAGE plpgsql;