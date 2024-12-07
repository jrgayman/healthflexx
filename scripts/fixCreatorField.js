import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://pmmkfrohclzpwpnbtajc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbWtmcm9oY2x6cHdwbmJ0YWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4MTM4MDYsImV4cCI6MjA0NjM4OTgwNn0.2m8L21ploy11YBpO3Wf0Qv7uZ243oIqA2PP9DuaR0As'
);

async function fixCreatorField() {
  try {
    // Add creator column and update schema
    const { error: schemaError } = await supabase
      .from('posts')
      .alter('creator', { type: 'text' });

    if (schemaError) {
      throw schemaError;
    }

    // Set default creator for existing posts
    const { error: updateError } = await supabase
      .from('posts')
      .update({ creator: 'James Carter' })
      .is('creator', null);

    if (updateError) {
      throw updateError;
    }

    console.log('Creator field fixed successfully');
    return true;
  } catch (error) {
    console.error('Error fixing creator field:', error);
    return false;
  }
}

fixCreatorField()
  .then(() => {
    console.log('Creator field fix completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Creator field fix failed:', error);
    process.exit(1);
  });