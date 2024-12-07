-- Ensure posts table has likes column
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;

-- Create simple increment function
CREATE OR REPLACE FUNCTION increment_post_likes(post_id UUID)
RETURNS INTEGER AS $$
DECLARE
    new_likes INTEGER;
BEGIN
    UPDATE posts 
    SET likes = COALESCE(likes, 0) + 1
    WHERE id = post_id
    RETURNING likes INTO new_likes;
    
    RETURN new_likes;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_post_likes(UUID) TO postgres, authenticated, anon;