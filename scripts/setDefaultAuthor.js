import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.PUBLIC_SUPABASE_ANON_KEY
);

async function setDefaultAuthor() {
  try {
    // First, get James Carter's ID
    const { data: author, error: authorError } = await supabase
      .from('authors')
      .select('id')
      .eq('name', 'James Carter')
      .single();

    if (authorError || !author) {
      throw new Error('Could not find James Carter in authors table');
    }

    // Update all posts to have James Carter as the author
    const { error: updateError } = await supabase
      .from('posts')
      .update({ author_id: author.id })
      .is('author_id', null);

    if (updateError) {
      throw updateError;
    }

    console.log('Successfully set James Carter as default author');
    return true;
  } catch (error) {
    console.error('Error setting default author:', error);
    return false;
  }
}

setDefaultAuthor()
  .then(() => {
    console.log('Default author update completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Failed to set default author:', error);
    process.exit(1);
  });