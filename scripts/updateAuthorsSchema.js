import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.PUBLIC_SUPABASE_ANON_KEY
);

const defaultPassword = 'Healthflexx#1';

async function updateAuthorsSchema() {
  try {
    // Update schema with access_level
    const { error: schemaError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add new columns to authors table
        ALTER TABLE authors
        ADD COLUMN IF NOT EXISTS email text UNIQUE,
        ADD COLUMN IF NOT EXISTS phone text,
        ADD COLUMN IF NOT EXISTS password_hash text,
        ADD COLUMN IF NOT EXISTS access_level text DEFAULT 'Reader',
        ADD COLUMN IF NOT EXISTS bio text,
        ADD COLUMN IF NOT EXISTS avatar_url text,
        ADD COLUMN IF NOT EXISTS login_count integer DEFAULT 0,
        ADD COLUMN IF NOT EXISTS last_login timestamptz;

        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_authors_email ON authors(email);
        CREATE INDEX IF NOT EXISTS idx_authors_access_level ON authors(access_level);
      `
    });

    if (schemaError) {
      throw schemaError;
    }

    // Hash default password
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    // Update existing authors with email, password, and access levels
    const authors = [
      { 
        name: 'John Gayman',
        email: 'john.gayman@healthflexx.com',
        access_level: 'Super Admin',
        bio: 'Founder and CEO of HealthFlexx'
      },
      { 
        name: 'James Carter',
        email: 'james.carter@healthflexx.com',
        access_level: 'Super Admin',
        bio: 'Senior Health and Wellness Expert'
      },
      { 
        name: 'Emily Johnson',
        email: 'emily.johnson@healthflexx.com',
        access_level: 'Admin',
        bio: 'Certified Nutritionist and Content Manager'
      },
      { 
        name: 'Carlos Martinez',
        email: 'carlos.martinez@healthflexx.com',
        access_level: 'Content Creator',
        bio: 'Professional Fitness Trainer'
      },
      { 
        name: 'Ava Smith',
        email: 'ava.smith@healthflexx.com',
        access_level: 'Content Creator',
        bio: 'Wellness Coach and Nutrition Specialist'
      },
      { 
        name: 'Michael Brown',
        email: 'michael.brown@healthflexx.com',
        access_level: 'Admin',
        bio: 'Health Content Director'
      },
      { 
        name: 'Sophia Davis',
        email: 'sophia.davis@healthflexx.com',
        access_level: 'Content Creator',
        bio: 'Health and Lifestyle Writer'
      },
      { 
        name: 'Liam Thompson',
        email: 'liam.thompson@healthflexx.com',
        access_level: 'Content Creator',
        bio: 'Fitness Content Specialist'
      },
      { 
        name: 'Olivia Harris',
        email: 'olivia.harris@healthflexx.com',
        access_level: 'Content Creator',
        bio: 'Health and Wellness Writer'
      },
      { 
        name: 'Ethan Robinson',
        email: 'ethan.robinson@healthflexx.com',
        access_level: 'Content Creator',
        bio: 'Health Research Writer'
      },
      { 
        name: 'Chloe Jackson',
        email: 'chloe.jackson@healthflexx.com',
        access_level: 'Content Creator',
        bio: 'Wellness Content Creator'
      }
    ];

    for (const author of authors) {
      const { error: updateError } = await supabase
        .from('authors')
        .upsert({ 
          ...author,
          password_hash: passwordHash,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(author.name)}`,
          login_count: 0
        }, {
          onConflict: 'name'
        });

      if (updateError) {
        console.error(`Error updating ${author.name}:`, updateError);
      } else {
        console.log(`Successfully updated ${author.name}`);
      }
    }

    console.log('Authors schema and data updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating authors schema:', error);
    return false;
  }
}

updateAuthorsSchema()
  .then(() => {
    console.log('Schema update completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Schema update failed:', error);
    process.exit(1);
  });