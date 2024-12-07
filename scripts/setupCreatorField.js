import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.PUBLIC_SUPABASE_ANON_KEY
);

async function setupCreatorField() {
  try {
    // Add creator column and update schema
    const { error: schemaError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add creator column if it doesn't exist
        ALTER TABLE public.posts
        ADD COLUMN IF NOT EXISTS creator text;

        -- Create index on creator
        CREATE INDEX IF NOT EXISTS idx_posts_creator ON posts(creator);

        -- Set default creator for existing posts
        UPDATE posts 
        SET creator = 'James Carter'
        WHERE creator IS NULL;
      `
    });

    if (schemaError) {
      throw schemaError;
    }

    console.log('Creator field setup completed successfully');
    return true;
  } catch (error) {
    console.error('Error setting up creator field:', error);
    return false;
  }
}

setupCreatorField()
  .then(() => {
    console.log('Setup completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Setup failed:', error);
    process.exit(1);
  });