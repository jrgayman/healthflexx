-- Add total_likes column to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS total_likes INTEGER DEFAULT 0;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_posts_total_likes ON posts(total_likes);

-- Update existing total_likes counts
UPDATE posts p
SET total_likes = (
  SELECT COUNT(*)
  FROM post_likes pl
  WHERE pl.post_id = p.id
);

-- Create or replace trigger function
CREATE OR REPLACE FUNCTION update_total_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts 
    SET total_likes = (
      SELECT COUNT(*) 
      FROM post_likes 
      WHERE post_id = NEW.post_id
    )
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts 
    SET total_likes = (
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
DROP TRIGGER IF EXISTS trigger_update_total_likes ON post_likes;
CREATE TRIGGER trigger_update_total_likes
AFTER INSERT OR DELETE ON post_likes
FOR EACH ROW
EXECUTE FUNCTION update_total_likes_count();