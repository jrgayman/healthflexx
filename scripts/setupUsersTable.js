import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.PUBLIC_SUPABASE_ANON_KEY
);

const defaultPassword = 'Healthflexx#1';

async function setupUsersTable() {
  try {
    console.log('Creating users table...');

    // Create users table
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create users table if it doesn't exist
        CREATE TABLE IF NOT EXISTS users (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          phone TEXT,
          access_level TEXT DEFAULT 'Reader',
          avatar_url TEXT,
          login_count INTEGER DEFAULT 0,
          last_login TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_access_level ON users(access_level);
      `
    });

    if (tableError) {
      throw tableError;
    }

    console.log('Users table created successfully');

    // Hash the default password
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    // List of users to add
    const users = [
      {
        name: 'John Gayman',
        email: 'john.gayman@healthflexx.com',
        access_level: 'Super Admin'
      },
      {
        name: 'James Carter',
        email: 'james.carter@healthflexx.com',
        access_level: 'Super Admin'
      },
      {
        name: 'Emily Johnson',
        email: 'emily.johnson@healthflexx.com',
        access_level: 'Super Admin'
      },
      {
        name: 'Carlos Martinez',
        email: 'carlos.martinez@healthflexx.com',
        access_level: 'Super Admin'
      },
      {
        name: 'Ava Smith',
        email: 'ava.smith@healthflexx.com',
        access_level: 'Super Admin'
      },
      {
        name: 'Michael Brown',
        email: 'michael.brown@healthflexx.com',
        access_level: 'Super Admin'
      },
      {
        name: 'Sophia Davis',
        email: 'sophia.davis@healthflexx.com',
        access_level: 'Super Admin'
      },
      {
        name: 'Liam Thompson',
        email: 'liam.thompson@healthflexx.com',
        access_level: 'Super Admin'
      },
      {
        name: 'Olivia Harris',
        email: 'olivia.harris@healthflexx.com',
        access_level: 'Super Admin'
      },
      {
        name: 'Ethan Robinson',
        email: 'ethan.robinson@healthflexx.com',
        access_level: 'Super Admin'
      },
      {
        name: 'Chloe Jackson',
        email: 'chloe.jackson@healthflexx.com',
        access_level: 'Super Admin'
      }
    ];

    console.log('Adding users...');

    // Insert or update users
    for (const user of users) {
      const { error: upsertError } = await supabase
        .from('users')
        .upsert({
          ...user,
          password_hash: passwordHash,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`
        }, {
          onConflict: 'email'
        });

      if (upsertError) {
        console.error(`Error adding user ${user.name}:`, upsertError);
      } else {
        console.log(`Successfully added/updated user: ${user.name}`);
      }
    }

    console.log('Users setup completed successfully!');
    return true;
  } catch (error) {
    console.error('Error setting up users:', error);
    return false;
  }
}

setupUsersTable()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));