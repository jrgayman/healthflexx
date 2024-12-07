import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.PUBLIC_SUPABASE_ANON_KEY
);

async function setupLikesSchema() {
  try {
    // Add likes column and update schema
    const { error: schemaError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add likes column if it doesn't exist
        ALTER TABLE public.posts
        ADD COLUMN IF NOT EXISTS likes integer DEFAULT 0;

        -- Create index on likes for better performance
        CREATE INDEX IF NOT EXISTS idx_posts_likes ON posts(likes);

        -- Update any null likes to 0
        UPDATE posts SET likes = 0 WHERE likes IS NULL;
      `
    });

    if (schemaError) {
      throw schemaError;
    }

    console.log('Likes schema setup completed successfully');
    return true;
  } catch (error) {
    console.error('Error setting up likes schema:', error);
    return false;
  }
}

setupLikesSchema()
  .then(() => {
    console.log('Schema setup completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Schema setup failed:', error);
    process.exit(1);
  });