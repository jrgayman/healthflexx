import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.PUBLIC_SUPABASE_ANON_KEY
);

async function setupLikesSystem() {
  try {
    console.log('Setting up likes system...');

    const { error: setupError } = await supabase.rpc('exec_sql', {
      sql: `
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
        CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);

        -- Ensure posts table has likes column
        ALTER TABLE posts 
        ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;

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
      `
    });

    if (setupError) {
      throw setupError;
    }

    console.log('Likes system setup completed successfully!');
    return true;
  } catch (error) {
    console.error('Error setting up likes system:', error);
    return false;
  }
}

setupLikesSystem()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));