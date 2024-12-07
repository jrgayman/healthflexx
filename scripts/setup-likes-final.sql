-- Drop existing tables and functions to ensure clean state
DROP TABLE IF EXISTS post_likes CASCADE;
DROP FUNCTION IF EXISTS update_post_likes_count CASCADE;

-- Create post_likes table
CREATE TABLE post_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_post_id
    FOREIGN KEY (post_id)
    REFERENCES posts(id)
    ON DELETE CASCADE
);

-- Create index for better performance
CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);

-- Ensure posts table has likes column and icon
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS like_icon TEXT DEFAULT '👍';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_likes ON posts(likes);

-- Create function to update likes count
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts 
    SET likes = (
      SELECT COUNT(*) 
      FROM post_likes 
      WHERE post_id = NEW.post_id
    )
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts 
    SET likes = (
      SELECT COUNT(*) 
      FROM post_likes 
      WHERE post_id = OLD.post_id
    )
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_post_likes_count ON post_likes;
CREATE TRIGGER trigger_update_post_likes_count
AFTER INSERT OR DELETE ON post_likes
FOR EACH ROW
EXECUTE FUNCTION update_post_likes_count();