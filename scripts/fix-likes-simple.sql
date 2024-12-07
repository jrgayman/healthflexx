-- Drop existing function if it exists
DROP FUNCTION IF EXISTS increment_post_likes(UUID);

-- Create simple increment function
CREATE OR REPLACE FUNCTION increment_post_likes(post_id UUID)
RETURNS INTEGER AS $$
DECLARE
    new_likes INTEGER;
BEGIN
    -- Simple increment of likes column
    UPDATE posts 
    SET likes = COALESCE(likes, 0) + 1
    WHERE id = post_id
    RETURNING likes INTO new_likes;
    
    RETURN new_likes;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to all necessary roles
GRANT EXECUTE ON FUNCTION increment_post_likes(UUID) TO postgres, authenticated, anon;