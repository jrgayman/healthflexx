import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.PUBLIC_SUPABASE_ANON_KEY
);

async function fixWritersSchema() {
  try {
    // Create writers table and update posts table
    const { error: schemaError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Drop existing writer_id from posts if it exists
        ALTER TABLE IF EXISTS public.posts
        DROP COLUMN IF EXISTS writer_id;

        -- Drop writers table if it exists
        DROP TABLE IF EXISTS public.writers;

        -- Create writers table
        CREATE TABLE public.writers (
          id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
          name text NOT NULL UNIQUE,
          bio text,
          avatar_url text,
          created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
        );

        -- Add writer_id to posts
        ALTER TABLE public.posts
        ADD COLUMN writer_id uuid REFERENCES public.writers(id);

        -- Create index on writer_id
        CREATE INDEX IF NOT EXISTS idx_posts_writer_id ON public.posts(writer_id);
      `
    });

    if (schemaError) {
      throw schemaError;
    }

    // Insert writers
    const writers = [
      { name: 'James Carter' },
      { name: 'Emily Johnson' },
      { name: 'Carlos Martinez' },
      { name: 'Ava Smith' },
      { name: 'Michael Brown' },
      { name: 'Sophia Davis' },
      { name: 'Liam Thompson' },
      { name: 'Olivia Harris' },
      { name: 'Ethan Robinson' },
      { name: 'Chloe Jackson' }
    ];

    const { error: insertError } = await supabase
      .from('writers')
      .insert(writers);

    if (insertError) {
      throw insertError;
    }

    // Get James Carter's ID
    const { data: jamesCarter, error: writerError } = await supabase
      .from('writers')
      .select('id')
      .eq('name', 'James Carter')
      .single();

    if (writerError || !jamesCarter) {
      throw new Error('Could not find James Carter');
    }

    // Set James Carter as default writer for all posts
    const { error: updateError } = await supabase
      .from('posts')
      .update({ writer_id: jamesCarter.id })
      .is('writer_id', null);

    if (updateError) {
      throw updateError;
    }

    console.log('Writers schema fixed successfully');
    return true;
  } catch (error) {
    console.error('Error fixing writers schema:', error);
    return false;
  }
}

fixWritersSchema()
  .then(() => {
    console.log('Schema fix completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Schema fix failed:', error);
    process.exit(1);
  });