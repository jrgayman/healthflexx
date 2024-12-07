import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.PUBLIC_SUPABASE_ANON_KEY
);

async function setupUserAvatars() {
  try {
    // Create storage bucket for user avatars
    const { error: bucketError } = await supabase.storage.createBucket('user-avatars', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      fileSizeLimit: 2097152 // 2MB
    });

    if (bucketError && bucketError.message !== 'Bucket already exists') {
      throw bucketError;
    }

    // Update users table schema
    const { error: schemaError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add avatar_url column if it doesn't exist
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS avatar_url TEXT;

        -- Create index for better query performance
        CREATE INDEX IF NOT EXISTS idx_users_avatar_url ON users(avatar_url);

        -- Update existing users with default avatars
        UPDATE users
        SET avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || ENCODE(name::bytea, 'base64')
        WHERE avatar_url IS NULL;
      `
    });

    if (schemaError) {
      throw schemaError;
    }

    // Set up storage policies
    const { error: policyError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Enable RLS on storage.objects
        ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

        -- Create policy for public access to avatars
        CREATE POLICY "Public Avatar Access"
        ON storage.objects FOR ALL
        TO anon
        USING (bucket_id = 'user-avatars');
      `
    });

    if (policyError) {
      throw policyError;
    }

    console.log('User avatars setup completed successfully!');
    return true;
  } catch (error) {
    console.error('Error setting up user avatars:', error);
    return false;
  }
}

setupUserAvatars()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));