-- Update the foreign key constraint to cascade null on delete
ALTER TABLE posts 
DROP CONSTRAINT IF EXISTS posts_image_id_fkey,
ADD CONSTRAINT posts_image_id_fkey 
  FOREIGN KEY (image_id) 
  REFERENCES images(id)
  ON DELETE SET NULL;