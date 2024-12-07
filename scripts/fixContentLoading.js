import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pmmkfrohclzpwpnbtajc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbWtmcm9oY2x6cHdwbmJ0YWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4MTM4MDYsImV4cCI6MjA0NjM4OTgwNn0.2m8L21ploy11YBpO3Wf0Qv7uZ243oIqA2PP9DuaR0As';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixContentLoading() {
  try {
    console.log('Starting content loading fixes...');

    // First, fix category slugs
    const { error: categoryError } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE content_categories
        SET slug = CASE 
          WHEN name = 'Food & Cooking' THEN 'food-cooking'
          WHEN name = 'Fitness & Exercise' THEN 'fitness-exercise'
          WHEN name = 'Health Imagery Training (HIT)' THEN 'health-imagery-training'
          WHEN name = 'Daily HealthFlexx Insights' THEN 'daily-insights'
          ELSE LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\\s-]', ''), '\\s+', '-', 'g'))
        END
        WHERE slug IS NULL OR slug = '';
      `
    });

    if (categoryError) throw categoryError;
    console.log('✓ Fixed category slugs');

    // Get Food & Cooking category and update app post
    const { data: category, error: getCategoryError } = await supabase
      .from('content_categories')
      .select('id')
      .eq('slug', 'food-cooking')
      .single();

    if (getCategoryError) throw getCategoryError;
    if (!category) throw new Error('Food & Cooking category not found');

    const { error: updateError } = await supabase
      .from('posts')
      .update({
        content_category_link: category.id,
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

    if (updateError) throw updateError;
    console.log('✓ Updated app content');

    // Verify the update
    const { data: post, error: verifyError } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        type,
        content_categories (
          name,
          slug
        ),
        app_store_url,
        play_store_url,
        content
      `)
      .eq('id', 'cb4ab61c-0f97-494d-951e-837ee4a8c105')
      .single();

    if (verifyError) throw verifyError;
    console.log('✓ Verified update:', post);

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