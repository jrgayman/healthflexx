-- Create post_likes table with proper structure
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_post_id
    FOREIGN KEY (post_id)
    REFERENCES posts(id)
    ON DELETE CASCADE
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);

-- Ensure posts table has likes column
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_likes ON posts(likes);

-- Create function to increment likes
CREATE OR REPLACE FUNCTION increment_post_likes(post_id UUID)
RETURNS INTEGER AS $$
DECLARE
    new_likes INTEGER;
BEGIN
    -- Insert new like record
    INSERT INTO post_likes (post_id) VALUES ($1);
    
    -- Update and get new count
    UPDATE posts 
    SET likes = (
        SELECT COUNT(*) 
        FROM post_likes 
        WHERE post_id = $1
    )
    WHERE id = $1
    RETURNING likes INTO new_likes;
    
    RETURN new_likes;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_post_likes(UUID) TO authenticated, anon;