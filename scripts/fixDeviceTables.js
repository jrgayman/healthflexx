import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabase = createClient(
  'https://pmmkfrohclzpwpnbtajc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbWtmcm9oY2x6cHdwbmJ0YWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4MTM4MDYsImV4cCI6MjA0NjM4OTgwNn0.2m8L21ploy11YBpO3Wf0Qv7uZ243oIqA2PP9DuaR0As'
);

async function fixDeviceTables() {
  try {
    console.log('Fixing device tables...');

    // Read SQL file
    const sqlFile = await fs.readFile(
      path.join(__dirname, 'fix-device-tables.sql'),
      'utf8'
    );

    // Execute SQL
    const { error } = await supabase.rpc('exec_sql', {
      sql: sqlFile
    });

    if (error) throw error;
    console.log('Device tables fixed successfully!');
    return true;
  } catch (error) {
    console.error('Error fixing device tables:', error);
    return false;
  }
}

fixDeviceTables()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));