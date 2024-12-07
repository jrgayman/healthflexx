import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pmmkfrohclzpwpnbtajc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbWtmcm9oY2x6cHdwbmJ0YWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4MTM4MDYsImV4cCI6MjA0NjM4OTgwNn0.2m8L21ploy11YBpO3Wf0Qv7uZ243oIqA2PP9DuaR0As';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixContentRelationships() {
  try {
    console.log('Starting content relationship fixes...');

    // First, fix content category slugs
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

        -- Get category IDs and update posts
        WITH category_ids AS (
          SELECT 
            id,
            CASE 
              WHEN slug = 'food-cooking' THEN 1
              WHEN slug = 'fitness-exercise' THEN 2
              WHEN slug = 'health-imagery-training' THEN 3
              WHEN slug = 'daily-insights' THEN 4
            END as category_order
          FROM content_categories
          WHERE slug IN ('food-cooking', 'fitness-exercise', 'health-imagery-training', 'daily-insights')
        )
        UPDATE posts p
        SET content_category_link = (
          SELECT id 
          FROM category_ids 
          ORDER BY category_order 
          LIMIT 1
        )
        WHERE content_category_link IS NULL;
      `
    });

    if (categoryError) throw categoryError;
    console.log('✓ Fixed category relationships');

    // Update app content
    const { error: appError } = await supabase
      .from('posts')
      .update({
        type: 'app',
        app_store_url: 'https://apps.apple.com/app/healthflexx',
        play_store_url: 'https://play.google.com/store/apps/details?id=com.healthflexx',
        content: `# HealthFlexx Mobile App

Experience the power of HealthFlexx on your mobile device! Our comprehensive health and wellness app brings all the features you love right to your fingertips.

## Key Features

- Personalized workout plans
- Nutrition tracking and meal planning
- Health metrics monitoring
- Guided meditation sessions
- Progress tracking and analytics
- Community support and sharing

Download now and start your wellness journey with HealthFlexx!`
      })
      .eq('id', 'cb4ab61c-0f97-494d-951e-837ee4a8c105');

    if (appError) throw appError;
    console.log('✓ Updated app content');

    // Verify the relationships
    const { data: relationships, error: verifyError } = await supabase
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
    console.log(`Found ${relationships?.length || 0} active posts`);

    return true;
  } catch (error) {
    console.error('Error fixing content relationships:', error);
    return false;
  }
}

fixContentRelationships()
  .then(() => {
    console.log('Content relationships fixed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Failed to fix content relationships:', error);
    process.exit(1);
  });