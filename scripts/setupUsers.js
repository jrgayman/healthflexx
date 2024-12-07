import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.PUBLIC_SUPABASE_ANON_KEY
);

const defaultPassword = 'Healthflexx#1';

async function setupUsers() {
  try {
    // Hash the default password
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    // List of users to add
    const users = [
      {
        name: 'John Gayman',
        email: 'john.gayman@healthflexx.com'
      },
      {
        name: 'James Carter',
        email: 'james.carter@healthflexx.com'
      },
      {
        name: 'Emily Johnson',
        email: 'emily.johnson@healthflexx.com'
      },
      {
        name: 'Carlos Martinez',
        email: 'carlos.martinez@healthflexx.com'
      },
      {
        name: 'Ava Smith',
        email: 'ava.smith@healthflexx.com'
      },
      {
        name: 'Michael Brown',
        email: 'michael.brown@healthflexx.com'
      },
      {
        name: 'Sophia Davis',
        email: 'sophia.davis@healthflexx.com'
      },
      {
        name: 'Liam Thompson',
        email: 'liam.thompson@healthflexx.com'
      },
      {
        name: 'Olivia Harris',
        email: 'olivia.harris@healthflexx.com'
      },
      {
        name: 'Ethan Robinson',
        email: 'ethan.robinson@healthflexx.com'
      },
      {
        name: 'Chloe Jackson',
        email: 'chloe.jackson@healthflexx.com'
      }
    ];

    // Insert or update users
    for (const user of users) {
      const { error: upsertError } = await supabase
        .from('users')
        .upsert({
          ...user,
          password_hash: passwordHash,
          access_level: 'Super Admin',
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

setupUsers()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));