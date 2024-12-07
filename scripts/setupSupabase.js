import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.PUBLIC_SUPABASE_ANON_KEY
);

// SQL to create the tables
const setupSQL = `
-- Create posts table if it doesn't exist
create table if not exists public.posts (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text not null unique,
  content text,
  excerpt text,
  category text not null,
  type text not null check (type in ('article', 'video', 'app', 'weblink')),
  image_url text,
  video_url text,
  app_url text,
  web_url text,
  featured boolean default false,
  active boolean default true,
  likes integer default 0,
  duration text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create categories table if it doesn't exist
create table if not exists public.categories (
  id text primary key,
  title text not null,
  description text,
  icon text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert default categories if they don't exist
insert into public.categories (id, title, description, icon)
values 
  ('food-cooking', 'Food & Cooking', 'Discover healthy recipes and cooking tips', '🍳'),
  ('fitness-exercise', 'Fitness & Exercise', 'Workout routines and exercise guides', '💪'),
  ('hit', 'Health Imagery Training', 'Mental wellness and visualization techniques', '🧘'),
  ('daily-insights', 'Daily HealthFlexx Insights', 'Daily tips and health insights', '✨')
on conflict (id) do nothing;

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger if it doesn't exist
drop trigger if exists handle_posts_updated_at on public.posts;
create trigger handle_posts_updated_at
  before update on public.posts
  for each row
  execute function public.handle_updated_at();
`;

async function setupDatabase() {
  try {
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql: setupSQL });
    
    if (error) {
      console.error('Error setting up database:', error);
      return;
    }

    console.log('Database setup completed successfully!');

    // Add the test article
    const { error: articleError } = await supabase
      .from('posts')
      .insert([{
        title: "Top 10 Low-Sugar Fruits for a Healthier Diet",
        slug: "top-10-low-sugar-fruits-for-healthier-diet",
        content: `Incorporating fruits into your diet is essential for obtaining vital nutrients...`,
        excerpt: "Discover the top 10 fruits that are naturally low in sugar but packed with nutrients.",
        category: "food-cooking",
        type: "article",
        image_url: "https://images.unsplash.com/photo-1610832958506-aa56368176cf",
        featured: true,
        active: true,
        likes: 0
      }]);

    if (articleError) {
      console.error('Error adding test article:', articleError);
    } else {
      console.log('Test article added successfully!');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

setupDatabase();