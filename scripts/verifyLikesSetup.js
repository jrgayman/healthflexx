import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.PUBLIC_SUPABASE_ANON_KEY
);

async function verifyLikesSetup() {
  try {
    // Check table structures and relationships
    const { error: verifyError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Check if post_likes table exists and its structure
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_name = 'post_likes'
        ORDER BY ordinal_position;

        -- Check if likes column exists in posts table
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_name = 'posts'
        AND column_name = 'likes';

        -- Check if indexes exist
        SELECT 
          schemaname,
          tablename,
          indexname,
          indexdef
        FROM pg_indexes
        WHERE tablename IN ('posts', 'post_likes')
        AND indexname IN ('idx_post_likes_post_id', 'idx_posts_likes');

        -- Check if trigger exists
        SELECT 
          trigger_name,
          event_manipulation,
          event_object_table,
          action_statement
        FROM information_schema.triggers
        WHERE event_object_table = 'post_likes'
        AND trigger_name = 'trigger_update_post_likes_count';

        -- Check if trigger function exists
        SELECT 
          proname,
          prosrc
        FROM pg_proc
        WHERE proname = 'update_post_likes_count';

        -- Sample some data to verify relationships
        SELECT 
          p.id as post_id,
          p.title,
          p.likes as total_likes,
          COUNT(pl.id) as actual_likes
        FROM posts p
        LEFT JOIN post_likes pl ON pl.post_id = p.id
        GROUP BY p.id, p.title, p.likes
        LIMIT 5;

        -- Check for any mismatches between posts.likes and actual count
        SELECT 
          p.id,
          p.title,
          p.likes as stored_count,
          COUNT(pl.id) as actual_count
        FROM posts p
        LEFT JOIN post_likes pl ON pl.post_id = p.id
        GROUP BY p.id, p.title, p.likes
        HAVING p.likes != COUNT(pl.id)
        LIMIT 5;
      `
    });

    if (verifyError) {
      throw verifyError;
    }

    console.log('Likes system verification completed successfully!');
    return true;
  } catch (error) {
    console.error('Error verifying likes system:', error);
    return false;
  }
}

verifyLikesSetup()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));