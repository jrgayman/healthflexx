import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pmmkfrohclzpwpnbtajc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbWtmcm9oY2x6cHdwbmJ0YWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4MTM4MDYsImV4cCI6MjA0NjM4OTgwNn0.2m8L21ploy11YBpO3Wf0Qv7uZ243oIqA2PP9DuaR0As';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createContentCategories() {
  try {
    // Create content_categories table
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create content_categories table
        CREATE TABLE IF NOT EXISTS content_categories (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          icon TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          CONSTRAINT unique_category_name UNIQUE (name)
        );
      `
    });

    if (tableError) throw tableError;

    // Define the categories
    const categories = [
      {
        name: 'Food & Cooking',
        description: 'Recipes, cooking tips, and nutritional guidance',
        icon: '🍳'
      },
      {
        name: 'Fitness & Exercise',
        description: 'Workout routines and physical fitness guides',
        icon: '💪'
      },
      {
        name: 'Health Imagery Training (HIT)',
        description: 'Mental wellness and visualization techniques',
        icon: '🧘'
      },
      {
        name: 'Daily HealthFlexx Insights',
        description: 'Daily health tips and wellness insights',
        icon: '✨'
      }
    ];

    // Insert the categories
    const { error: insertError } = await supabase
      .from('content_categories')
      .upsert(categories, {
        onConflict: 'name',
        ignoreDuplicates: false
      });

    if (insertError) throw insertError;

    // Verify the data was inserted
    const { data, error: selectError } = await supabase
      .from('content_categories')
      .select('*')
      .order('name');

    if (selectError) throw selectError;

    console.log('Content categories created successfully:');
    console.log(data);
    
    return true;
  } catch (error) {
    console.error('Error creating content categories:', error);
    return false;
  }
}

createContentCategories()
  .then(() => {
    console.log('Setup completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Setup failed:', error);
    process.exit(1);
  });