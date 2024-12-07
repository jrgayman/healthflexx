import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.PUBLIC_SUPABASE_ANON_KEY
);

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

async function insertAuthors() {
  console.log('Starting to insert authors...');

  try {
    const { data, error } = await supabase
      .from('authors')
      .upsert(authors, { 
        onConflict: 'name',
        ignoreDuplicates: false
      })
      .select();

    if (error) {
      throw error;
    }

    console.log('Successfully inserted/updated authors:', data.length);
    return true;
  } catch (error) {
    console.error('Error inserting authors:', error);
    return false;
  }
}

insertAuthors()
  .then(() => {
    console.log('Author insertion process completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Failed to insert authors:', error);
    process.exit(1);
  });