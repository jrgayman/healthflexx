import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pmmkfrohclzpwpnbtajc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbWtmcm9oY2x6cHdwbmJ0YWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4MTM4MDYsImV4cCI6MjA0NjM4OTgwNn0.2m8L21ploy11YBpO3Wf0Qv7uZ243oIqA2PP9DuaR0As';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updatePostsSchema() {
  try {
    // Add category_id column and foreign key constraint
    const { error: schemaError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add category_id column if it doesn't exist
        ALTER TABLE posts 
        ADD COLUMN IF NOT EXISTS category_id UUID;

        -- Add foreign key constraint
        ALTER TABLE posts 
        ADD CONSTRAINT fk_category_id 
        FOREIGN KEY (category_id) 
        REFERENCES content_categories(id)
        ON DELETE RESTRICT;

        -- Create index on category_id
        CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts(category_id);

        -- Update existing posts to link to appropriate categories
        WITH category_mapping AS (
          SELECT id, name FROM content_categories
        )
        UPDATE posts p
        SET category_id = cm.id
        FROM category_mapping cm
        WHERE 
          (p.category = 'food-cooking' AND cm.name = 'Food & Cooking')
          OR (p.category = 'fitness-exercise' AND cm.name = 'Fitness & Exercise')
          OR (p.category = 'hit' AND cm.name = 'Health Imagery Training (HIT)')
          OR (p.category = 'daily-insights' AND cm.name = 'Daily HealthFlexx Insights');
      `
    });

    if (schemaError) {
      throw schemaError;
    }

    console.log('Posts schema updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating posts schema:', error);
    return false;
  }
}

updatePostsSchema()
  .then(() => {
    console.log('Schema update completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Schema update failed:', error);
    process.exit(1);
  });