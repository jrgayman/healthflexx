import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.PUBLIC_SUPABASE_ANON_KEY
);

async function verifyAuthors() {
  try {
    // First, check if authors exist
    const { data: existingAuthors, error: checkError } = await supabase
      .from('authors')
      .select('*');

    if (checkError) {
      throw checkError;
    }

    console.log('Current authors in database:', existingAuthors?.length || 0);
    existingAuthors?.forEach(author => {
      console.log(`- ${author.name}`);
    });

    // If no authors exist, insert them
    if (!existingAuthors || existingAuthors.length === 0) {
      const authors = [
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

      const { data: insertedAuthors, error: insertError } = await supabase
        .from('authors')
        .insert(authors)
        .select();

      if (insertError) {
        throw insertError;
      }

      console.log('\nInserted new authors:', insertedAuthors.length);
      insertedAuthors.forEach(author => {
        console.log(`- ${author.name}`);
      });
    }

    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

verifyAuthors()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));