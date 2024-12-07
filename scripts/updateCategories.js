import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pmmkfrohclzpwpnbtajc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbWtmcm9oY2x6cHdwbmJ0YWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4MTM4MDYsImV4cCI6MjA0NjM4OTgwNn0.2m8L21ploy11YBpO3Wf0Qv7uZ243oIqA2PP9DuaR0As';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateCategories() {
  try {
    console.log('Starting category updates...');

    // Update categories using RPC to execute SQL
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE content_categories
        SET 
          name = CASE 
            WHEN name = 'Food & Cooking' THEN 'Food and Cooking'
            WHEN name = 'Fitness & Exercise' THEN 'Fitness and Exercise'
            ELSE name
          END,
          slug = CASE
            WHEN slug = 'food-cooking' THEN 'food-and-cooking'
            WHEN slug = 'fitness-exercise' THEN 'fitness-and-exercise'
            ELSE slug
          END,
          description = CASE
            WHEN description LIKE '%&%' THEN REPLACE(description, '&', 'and')
            ELSE description
          END;
      `
    });

    if (error) throw error;
    console.log('Categories updated successfully');

    // Verify the updates
    const { data: categories, error: verifyError } = await supabase
      .from('content_categories')
      .select('name, slug, description')
      .order('name');

    if (verifyError) throw verifyError;
    console.log('Updated categories:', categories);

    return true;
  } catch (error) {
    console.error('Error updating categories:', error);
    return false;
  }
}

updateCategories()
  .then(() => {
    console.log('Update completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Update failed:', error);
    process.exit(1);
  });