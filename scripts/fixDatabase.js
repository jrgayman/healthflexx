import { createClient } from '@supabase/supabase-js';
import { supabase } from '../src/lib/supabase';

async function fixDatabase() {
  try {
    console.log('Starting database fixes...');

    // Drop existing triggers and functions
    await supabase.rpc('exec_sql', {
      sql: `
        DROP TRIGGER IF EXISTS trigger_cleanup_post_image ON posts;
        DROP TRIGGER IF EXISTS cleanup_orphaned_images ON posts;
        DROP FUNCTION IF EXISTS cleanup_post_image() CASCADE;
        DROP FUNCTION IF EXISTS delete_orphaned_images() CASCADE;
      `
    });

    // Drop constraints and old columns
    await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE posts
        DROP CONSTRAINT IF EXISTS check_image_source,
        DROP CONSTRAINT IF EXISTS posts_image_id_fkey,
        DROP CONSTRAINT IF EXISTS check_valid_type;

        ALTER TABLE posts
        DROP COLUMN IF EXISTS image_id,
        DROP COLUMN IF EXISTS image_url;
      `
    });

    // Add storage_path column
    await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE posts
        DROP COLUMN IF EXISTS storage_path CASCADE;

        ALTER TABLE posts
        ADD COLUMN storage_path TEXT;

        CREATE INDEX idx_posts_storage_path ON posts(storage_path);
      `
    });

    // Add and configure type column
    await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'posts' AND column_name = 'type'
          ) THEN
            ALTER TABLE posts ADD COLUMN type TEXT DEFAULT 'article';
          END IF;
        END $$;

        UPDATE posts 
        SET type = 'article' 
        WHERE type IS NULL;

        ALTER TABLE posts 
        ALTER COLUMN type SET NOT NULL;

        ALTER TABLE posts
        ADD CONSTRAINT check_valid_type
        CHECK (type IN ('article', 'video', 'app', 'weblink'));
      `
    });

    // Clean up null values
    await supabase.rpc('exec_sql', {
      sql: `
        UPDATE posts
        SET storage_path = NULL
        WHERE storage_path = '';
      `
    });

    // Create new cleanup function and trigger
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION cleanup_post_image()
        RETURNS TRIGGER AS $$
        BEGIN
          IF (TG_OP = 'UPDATE' AND OLD.storage_path IS DISTINCT FROM NEW.storage_path) OR 
             (TG_OP = 'DELETE' AND OLD.storage_path IS NOT NULL) THEN
            NULL;
          END IF;
          
          IF TG_OP = 'DELETE' THEN
            RETURN OLD;
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER trigger_cleanup_post_image
        BEFORE UPDATE OR DELETE ON posts
        FOR EACH ROW
        EXECUTE FUNCTION cleanup_post_image();
      `
    });

    console.log('Database structure updated successfully!');
    return true;
  } catch (error) {
    console.error('Error updating database:', error);
    return false;
  }
}

fixDatabase()
  .then(() => {
    console.log('Database update completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Database update failed:', error);
    process.exit(1);
  });