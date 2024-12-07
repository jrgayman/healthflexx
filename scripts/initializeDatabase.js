import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.PUBLIC_SUPABASE_ANON_KEY
);

async function initializeDatabase() {
  try {
    // Create posts table
    const { error: postsError } = await supabase.rpc('create_table_if_not_exists', {
      table_sql: `
        CREATE TABLE IF NOT EXISTS posts (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          title TEXT NOT NULL,
          slug TEXT NOT NULL UNIQUE,
          content TEXT,
          excerpt TEXT,
          category TEXT NOT NULL,
          type TEXT NOT NULL,
          image_url TEXT,
          video_url TEXT,
          featured BOOLEAN DEFAULT false,
          active BOOLEAN DEFAULT true,
          likes INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
        CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(type);
        CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
      `
    });

    if (postsError) {
      throw postsError;
    }

    console.log('Database tables created successfully!');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}

initializeDatabase();