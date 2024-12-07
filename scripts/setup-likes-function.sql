-- Create function to increment likes
CREATE OR REPLACE FUNCTION increment_post_likes(post_id UUID)
RETURNS TABLE (likes INTEGER) AS $$
BEGIN
  UPDATE posts 
  SET likes = COALESCE(likes, 0) + 1
  WHERE id = post_id;
  
  RETURN QUERY
  SELECT likes FROM posts WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION increment_post_likes(UUID) TO authenticated, anon;