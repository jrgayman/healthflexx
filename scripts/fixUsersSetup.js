import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.PUBLIC_SUPABASE_ANON_KEY
);

async function fixUsersSetup() {
  try {
    console.log('Starting users setup fix...');

    // Step 1: Drop and recreate users table
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: `
        DROP TABLE IF EXISTS users;
        
        CREATE TABLE users (
          id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
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

        CREATE INDEX idx_users_email ON users(email);
        CREATE INDEX idx_users_access_level ON users(access_level);
      `
    });

    if (dropError) {
      throw new Error(`Database setup error: ${dropError.message}`);
    }

    // Step 2: Hash default password
    const defaultPassword = 'Healthflexx#1';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    // Step 3: Insert users
    const users = [
      {
        name: 'John Gayman',
        email: 'john.gayman@healthflexxinc.com',
        phone: '555-0101',
        access_level: 'Super Admin'
      },
      {
        name: 'James Carter',
        email: 'james.carter@healthflexxinc.com',
        phone: '555-0102',
        access_level: 'Super Admin'
      },
      {
        name: 'Emily Johnson',
        email: 'emily.johnson@healthflexxinc.com',
        phone: '555-0103',
        access_level: 'Super Admin'
      },
      {
        name: 'Carlos Martinez',
        email: 'carlos.martinez@healthflexxinc.com',
        phone: '555-0104',
        access_level: 'Super Admin'
      },
      {
        name: 'Ava Smith',
        email: 'ava.smith@healthflexxinc.com',
        phone: '555-0105',
        access_level: 'Super Admin'
      },
      {
        name: 'Michael Brown',
        email: 'michael.brown@healthflexxinc.com',
        phone: '555-0106',
        access_level: 'Super Admin'
      },
      {
        name: 'Sophia Davis',
        email: 'sophia.davis@healthflexxinc.com',
        phone: '555-0107',
        access_level: 'Super Admin'
      },
      {
        name: 'Liam Thompson',
        email: 'liam.thompson@healthflexxinc.com',
        phone: '555-0108',
        access_level: 'Super Admin'
      },
      {
        name: 'Olivia Harris',
        email: 'olivia.harris@healthflexxinc.com',
        phone: '555-0109',
        access_level: 'Super Admin'
      },
      {
        name: 'Ethan Robinson',
        email: 'ethan.robinson@healthflexxinc.com',
        phone: '555-0110',
        access_level: 'Super Admin'
      },
      {
        name: 'Chloe Jackson',
        email: 'chloe.jackson@healthflexxinc.com',
        phone: '555-0111',
        access_level: 'Super Admin'
      }
    ];

    // Insert users
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

    console.log('\nSetup completed successfully!');
    console.log('\nYou can now log in with any of these emails:');
    console.log('Email: [firstname].[lastname]@healthflexxinc.com');
    console.log('Password: Healthflexx#1');
    
    return true;
  } catch (error) {
    console.error('Error in fixUsersSetup:', error);
    return false;
  }
}

fixUsersSetup()
  .then(success => {
    process.exit(success ? 0 : 1);
  });