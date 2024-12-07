-- Drop existing tables/triggers for clean slate
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TRIGGER IF EXISTS update_likes_count ON post_likes;
DROP FUNCTION IF EXISTS update_likes_count CASCADE;

-- Create post_likes table
CREATE TABLE post_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);

-- Ensure likes column exists in posts
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;

-- Create trigger function
CREATE OR REPLACE FUNCTION update_likes_count() 
RETURNS TRIGGER AS $$
BEGIN
  -- Update likes count in posts table
  UPDATE posts
  SET likes = (
    SELECT COUNT(*)
    FROM post_likes
    WHERE post_id = NEW.post_id
  )
  WHERE id = NEW.post_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_likes_count
AFTER INSERT ON post_likes
FOR EACH ROW
EXECUTE FUNCTION update_likes_count();