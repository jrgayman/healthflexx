import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pmmkfrohclzpwpnbtajc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbWtmcm9oY2x6cHdwbmJ0YWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4MTM4MDYsImV4cCI6MjA0NjM4OTgwNn0.2m8L21ploy11YBpO3Wf0Qv7uZ243oIqA2PP9DuaR0As';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateCategories() {
  try {
    // First, create the categories table if it doesn't exist
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create categories table
        CREATE TABLE IF NOT EXISTS categories (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          icon TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Add unique constraint on title
        ALTER TABLE categories ADD CONSTRAINT unique_category_title UNIQUE (title);
      `
    });

    if (tableError) throw tableError;

    // Insert or update the categories
    const categories = [
      {
        title: 'Food & Cooking',
        description: 'Discover healthy recipes and cooking tips',
        icon: '🍳'
      },
      {
        title: 'Fitness & Exercise',
        description: 'Workout routines and exercise guides',
        icon: '💪'
      },
      {
        title: 'Health Imagery Training',
        description: 'Mental wellness and visualization techniques',
        icon: '🧘'
      },
      {
        title: 'Daily Insights',
        description: 'Daily tips and health insights',
        icon: '✨'
      }
    ];

    // Insert categories
    const { error: insertError } = await supabase
      .from('categories')
      .upsert(categories, {
        onConflict: 'title',
        ignoreDuplicates: false
      });

    if (insertError) throw insertError;

    console.log('Categories updated successfully');
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