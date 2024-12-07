import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pmmkfrohclzpwpnbtajc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbWtmcm9oY2x6cHdwbmJ0YWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4MTM4MDYsImV4cCI6MjA0NjM4OTgwNn0.2m8L21ploy11YBpO3Wf0Qv7uZ243oIqA2PP9DuaR0As';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixContentLoading() {
  try {
    console.log('Starting final content loading fixes...');

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

        -- Ensure all posts have a valid category link
        WITH category_mapping AS (
          SELECT id, slug FROM content_categories
        )
        UPDATE posts p
        SET content_category_link = (
          SELECT id FROM content_categories WHERE slug = 'food-cooking' LIMIT 1
        )
        WHERE content_category_link IS NULL;

        -- Update specific app post
        UPDATE posts
        SET 
          type = 'app',
          app_store_url = 'https://apps.apple.com/app/healthflexx',
          play_store_url = 'https://play.google.com/store/apps/details?id=com.healthflexx',
          content_category_link = (
            SELECT id FROM content_categories WHERE slug = 'food-cooking' LIMIT 1
          )
        WHERE id = 'cb4ab61c-0f97-494d-951e-837ee4a8c105';
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
        type,
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
    console.error('Error fixing content loading:', error);
    return false;
  }
}

fixContentLoading()
  .then(() => {
    console.log('Content loading fixed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Failed to fix content loading:', error);
    process.exit(1);
  });