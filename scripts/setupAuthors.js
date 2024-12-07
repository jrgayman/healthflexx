import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.PUBLIC_SUPABASE_ANON_KEY
);

async function setupAuthors() {
  try {
    // Step 1: Create the authors table
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create authors table
        CREATE TABLE IF NOT EXISTS authors (
          id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
          name text NOT NULL UNIQUE,
          created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
        );

        -- Add author_id to posts
        ALTER TABLE posts 
        ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES authors(id);
      `
    });

    if (tableError) {
      throw tableError;
    }

    // Step 2: Insert authors
    const authors = [
      'James Carter',
      'Emily Johnson',
      'Carlos Martinez',
      'Ava Smith',
      'Michael Brown',
      'Sophia Davis',
      'Liam Thompson',
      'Olivia Harris',
      'Ethan Robinson',
      'Chloe Jackson'
    ].map(name => ({ name }));

    const { error: insertError } = await supabase
      .from('authors')
      .upsert(authors, { 
        onConflict: 'name'
      });

    if (insertError) {
      throw insertError;
    }

    // Step 3: Get James Carter's ID
    const { data: jamesCarter, error: authorError } = await supabase
      .from('authors')
      .select('id')
      .eq('name', 'James Carter')
      .single();

    if (authorError || !jamesCarter) {
      throw new Error('Could not find James Carter');
    }

    // Step 4: Set James Carter as default author for all posts
    const { error: updateError } = await supabase
      .from('posts')
      .update({ author_id: jamesCarter.id })
      .is('author_id', null);

    if (updateError) {
      throw updateError;
    }

    console.log('Authors setup completed successfully');
    return true;
  } catch (error) {
    console.error('Error setting up authors:', error);
    return false;
  }
}

setupAuthors()
  .then(() => {
    console.log('Setup completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Setup failed:', error);
    process.exit(1);
  });