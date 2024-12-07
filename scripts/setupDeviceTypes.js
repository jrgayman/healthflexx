import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabaseUrl = 'https://pmmkfrohclzpwpnbtajc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbWtmcm9oY2x6cHdwbmJ0YWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4MTM4MDYsImV4cCI6MjA0NjM4OTgwNn0.2m8L21ploy11YBpO3Wf0Qv7uZ243oIqA2PP9DuaR0As';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDeviceTypes() {
  try {
    console.log('Setting up device types...');

    // Read SQL file
    const sqlFile = await fs.readFile(
      path.join(__dirname, 'setup-device-types.sql'),
      'utf8'
    );

    // Execute SQL
    const { error } = await supabase.rpc('exec_sql', {
      sql: sqlFile
    });

    if (error) throw error;
    console.log('Device types setup completed successfully!');
    return true;
  } catch (error) {
    console.error('Error setting up device types:', error);
    return false;
  }
}

setupDeviceTypes()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));