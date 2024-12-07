import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.PUBLIC_SUPABASE_ANON_KEY
);

async function setupDatabase() {
  console.log('Setting up database...');

  try {
    // Create authors table
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create authors table
        create table if not exists public.authors (
          id uuid default uuid_generate_v4() primary key,
          name text not null unique,
          bio text,
          avatar_url text,
          created_at timestamp with time zone default timezone('utc'::text, now()) not null
        );

        -- Add author_id to posts table if it doesn't exist
        do $$ 
        begin
          if not exists (
            select 1 from information_schema.columns 
            where table_name = 'posts' 
            and column_name = 'author_id'
          ) then
            alter table public.posts 
            add column author_id uuid references public.authors(id);
          end if;
        end $$;

        -- Create index on author_id
        create index if not exists idx_posts_author_id on posts(author_id);
      `
    });

    if (createTableError) {
      throw createTableError;
    }

    console.log('Database schema updated successfully');

    // Insert authors
    const authors = [
      {
        name: 'James Carter',
        bio: 'Health and wellness expert with over 10 years of experience in nutrition and fitness.',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James'
      },
      {
        name: 'Emily Johnson',
        bio: 'Certified nutritionist and cookbook author specializing in healthy meal planning.',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily'
      },
      {
        name: 'Carlos Martinez',
        bio: 'Professional fitness trainer and sports nutrition specialist.',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos'
      },
      {
        name: 'Ava Smith',
        bio: 'Mindfulness coach and meditation instructor with expertise in stress management.',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ava'
      },
      {
        name: 'Michael Brown',
        bio: 'Exercise physiologist and researcher in sports science.',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael'
      },
      {
        name: 'Sophia Davis',
        bio: 'Holistic health practitioner and wellness consultant.',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia'
      },
      {
        name: 'Liam Thompson',
        bio: 'Mental health advocate and certified wellness coach.',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam'
      },
      {
        name: 'Olivia Harris',
        bio: 'Registered dietitian specializing in plant-based nutrition.',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia'
      },
      {
        name: 'Ethan Robinson',
        bio: 'Personal trainer and lifestyle transformation coach.',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ethan'
      },
      {
        name: 'Chloe Jackson',
        bio: 'Yoga instructor and mindful movement specialist.',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chloe'
      }
    ];

    const { error: insertError } = await supabase
      .from('authors')
      .upsert(authors, {
        onConflict: 'name',
        ignoreDuplicates: false
      });

    if (insertError) {
      throw insertError;
    }

    console.log('Authors inserted successfully');
    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

setupDatabase()
  .then(() => {
    console.log('Setup completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Setup failed:', error);
    process.exit(1);
  });