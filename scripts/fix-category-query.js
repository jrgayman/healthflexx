import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pmmkfrohclzpwpnbtajc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbWtmcm9oY2x6cHdwbmJ0YWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4MTM4MDYsImV4cCI6MjA0NjM4OTgwNn0.2m8L21ploy11YBpO3Wf0Qv7uZ243oIqA2PP9DuaR0As';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixCategoryQuery() {
  try {
    // First, ensure all categories have proper slugs
    const { error: categoryError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Update content_categories slugs
        UPDATE content_categories
        SET slug = CASE 
          WHEN name = 'Food & Cooking' THEN 'food-cooking'
          WHEN name = 'Fitness & Exercise' THEN 'fitness-exercise'
          WHEN name = 'Health Imagery Training (HIT)' THEN 'health-imagery-training'
          WHEN name = 'Daily HealthFlexx Insights' THEN 'daily-insights'
          ELSE LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\\s-]', ''), '\\s+', '-', 'g'))
        END
        WHERE slug IS NULL OR slug = '';

        -- Update posts to link with categories
        WITH category_mapping AS (
          SELECT id, slug FROM content_categories
        )
        UPDATE posts p
        SET content_category_link = cm.id
        FROM category_mapping cm
        WHERE p.content_category_link IS NULL
        AND EXISTS (
          SELECT 1 FROM content_categories 
          WHERE id = cm.id 
          AND slug = 'food-cooking'
        )
        RETURNING p.id, p.title, cm.slug;
      `
    });

    if (categoryError) throw categoryError;
    console.log('✓ Fixed category relationships');

    // Verify the relationships
    const { data: posts, error: verifyError } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        content_categories (
          id,
          name,
          slug
        )
      `)
      .eq('active', true);

    if (verifyError) throw verifyError;
    console.log('✓ Verified relationships');
    console.log(`Found ${posts?.length || 0} active posts`);

    return true;
  } catch (error) {
    console.error('Error fixing category query:', error);
    return false;
  }
}

fixCategoryQuery()
  .then(() => {
    console.log('Category query fixed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Failed to fix category query:', error);
    process.exit(1);
  });