import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pmmkfrohclzpwpnbtajc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbWtmcm9oY2x6cHdwbmJ0YWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4MTM4MDYsImV4cCI6MjA0NjM4OTgwNn0.2m8L21ploy11YBpO3Wf0Qv7uZ243oIqA2PP9DuaR0As';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDatabaseStructure() {
  try {
    console.log('Starting database structure fixes...');

    // Step 1: Drop existing triggers and functions
    await supabase.rpc('exec_sql', {
      sql: `
        DROP TRIGGER IF EXISTS trigger_cleanup_post_image ON posts;
        DROP TRIGGER IF EXISTS cleanup_orphaned_images ON posts;
        DROP TRIGGER IF EXISTS trigger_cleanup_unused_images ON posts;
        DROP FUNCTION IF EXISTS cleanup_post_image() CASCADE;
        DROP FUNCTION IF EXISTS delete_orphaned_images() CASCADE;
        DROP FUNCTION IF EXISTS cleanup_unused_images() CASCADE;
      `
    });

    console.log('✓ Removed old triggers and functions');

    // Step 2: Drop constraints and clean up columns
    await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE posts
        DROP CONSTRAINT IF EXISTS check_image_source,
        DROP CONSTRAINT IF EXISTS posts_image_id_fkey,
        DROP CONSTRAINT IF EXISTS check_valid_type;

        ALTER TABLE posts
        DROP COLUMN IF EXISTS image_id CASCADE,
        DROP COLUMN IF EXISTS image_url CASCADE;
      `
    });

    console.log('✓ Cleaned up old columns and constraints');

    // Step 3: Set up storage_path
    await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE posts
        DROP COLUMN IF EXISTS storage_path CASCADE;

        ALTER TABLE posts
        ADD COLUMN storage_path TEXT;

        CREATE INDEX IF NOT EXISTS idx_posts_storage_path ON posts(storage_path);
      `
    });

    console.log('✓ Added storage_path column');

    // Step 4: Configure type column
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

    console.log('✓ Configured type column');

    // Step 5: Clean up storage paths
    await supabase.rpc('exec_sql', {
      sql: `
        UPDATE posts
        SET storage_path = NULL
        WHERE storage_path = '';
      `
    });

    console.log('✓ Cleaned up storage paths');

    // Step 6: Create new cleanup function and trigger
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION cleanup_post_image()
        RETURNS TRIGGER AS $$
        BEGIN
          IF (TG_OP = 'UPDATE' AND OLD.storage_path IS DISTINCT FROM NEW.storage_path) OR 
             (TG_OP = 'DELETE' AND OLD.storage_path IS NOT NULL) THEN
            -- Storage cleanup handled by application
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

    console.log('✓ Created cleanup trigger');

    // Step 7: Drop old images table
    await supabase.rpc('exec_sql', {
      sql: `DROP TABLE IF EXISTS images CASCADE;`
    });

    console.log('✓ Removed old images table');

    console.log('Database structure updated successfully!');
    return true;
  } catch (error) {
    console.error('Error updating database:', error);
    return false;
  }
}

fixDatabaseStructure()
  .then(() => {
    console.log('Database update completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Database update failed:', error);
    process.exit(1);
  });