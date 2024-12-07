import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.PUBLIC_SUPABASE_ANON_KEY
);

const defaultPassword = 'Healthflexx#1';

async function setupUsersDB() {
  try {
    console.log('Setting up users database...');

    // Step 1: Create users table with proper schema
    const { error: schemaError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Drop existing users table if it exists
        DROP TABLE IF EXISTS users;

        -- Create fresh users table
        CREATE TABLE users (
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
        CREATE INDEX idx_users_email ON users(email);
        CREATE INDEX idx_users_access_level ON users(access_level);
      `
    });

    if (schemaError) {
      throw new Error(`Schema Error: ${schemaError.message}`);
    }

    console.log('Users table created successfully');

    // Step 2: Hash the default password
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    // Step 3: Define initial users
    const users = [
      {
        name: 'John Gayman',
        email: 'john.gayman@healthflexx.com',
        phone: '555-0101',
        access_level: 'Super Admin'
      },
      {
        name: 'James Carter',
        email: 'james.carter@healthflexx.com',
        phone: '555-0102',
        access_level: 'Super Admin'
      },
      {
        name: 'Emily Johnson',
        email: 'emily.johnson@healthflexx.com',
        phone: '555-0103',
        access_level: 'Super Admin'
      },
      {
        name: 'Carlos Martinez',
        email: 'carlos.martinez@healthflexx.com',
        phone: '555-0104',
        access_level: 'Super Admin'
      },
      {
        name: 'Ava Smith',
        email: 'ava.smith@healthflexx.com',
        phone: '555-0105',
        access_level: 'Super Admin'
      },
      {
        name: 'Michael Brown',
        email: 'michael.brown@healthflexx.com',
        phone: '555-0106',
        access_level: 'Super Admin'
      },
      {
        name: 'Sophia Davis',
        email: 'sophia.davis@healthflexx.com',
        phone: '555-0107',
        access_level: 'Super Admin'
      },
      {
        name: 'Liam Thompson',
        email: 'liam.thompson@healthflexx.com',
        phone: '555-0108',
        access_level: 'Super Admin'
      },
      {
        name: 'Olivia Harris',
        email: 'olivia.harris@healthflexx.com',
        phone: '555-0109',
        access_level: 'Super Admin'
      },
      {
        name: 'Ethan Robinson',
        email: 'ethan.robinson@healthflexx.com',
        phone: '555-0110',
        access_level: 'Super Admin'
      },
      {
        name: 'Chloe Jackson',
        email: 'chloe.jackson@healthflexx.com',
        phone: '555-0111',
        access_level: 'Super Admin'
      }
    ];

    // Step 4: Insert all users
    for (const user of users) {
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          ...user,
          password_hash: passwordHash,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`
        });

      if (insertError) {
        console.error(`Error inserting user ${user.name}:`, insertError);
      } else {
        console.log(`Successfully added user: ${user.name}`);
      }
    }

    console.log('Database setup completed successfully!');
    return true;
  } catch (error) {
    console.error('Error setting up database:', error);
    return false;
  }
}

setupUsersDB()
  .then(() => {
    console.log('Setup process completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Setup process failed:', error);
    process.exit(1);
  });