import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pmmkfrohclzpwpnbtajc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbWtmcm9oY2x6cHdwbmJ0YWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4MTM4MDYsImV4cCI6MjA0NjM4OTgwNn0.2m8L21ploy11YBpO3Wf0Qv7uZ243oIqA2PP9DuaR0As';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    // Create tables
    const { error: tablesError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Enable UUID extension
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        -- Create categories table first
        CREATE TABLE IF NOT EXISTS categories (
          id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
          slug TEXT UNIQUE NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          icon TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Insert default categories
        INSERT INTO categories (slug, title, description, icon) 
        VALUES 
          ('food-cooking', 'Food & Cooking', 'Discover healthy recipes and cooking tips', '🍳'),
          ('fitness-exercise', 'Fitness & Exercise', 'Workout routines and exercise guides', '💪'),
          ('hit', 'Health Imagery Training', 'Mental wellness and visualization techniques', '🧘'),
          ('daily-insights', 'Daily HealthFlexx Insights', 'Daily tips and health insights', '✨')
        ON CONFLICT (slug) DO UPDATE 
        SET 
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          icon = EXCLUDED.icon;

        -- Create posts table with category foreign key
        CREATE TABLE IF NOT EXISTS posts (
          id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
          title TEXT NOT NULL,
          content TEXT,
          category_id uuid REFERENCES categories(id),
          excerpt TEXT,
          slug TEXT UNIQUE NOT NULL,
          featured BOOLEAN DEFAULT false,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          CONSTRAINT fk_category
            FOREIGN KEY(category_id) 
            REFERENCES categories(id)
            ON DELETE RESTRICT
        );

        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category_id);
        CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
        CREATE INDEX IF NOT EXISTS idx_posts_featured ON posts(featured);
      `
    });

    if (tablesError) {
      throw tablesError;
    }

    console.log('Database tables created successfully');
    return true;
  } catch (error) {
    console.error('Error setting up database:', error);
    return false;
  }
}

setupDatabase()
  .then(() => {
    console.log('Database setup completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Database setup failed:', error);
    process.exit(1);
  });