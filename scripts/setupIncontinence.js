import { supabase } from '../src/lib/supabase.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function setupIncontinence() {
  try {
    console.log('Setting up incontinence monitoring system...');

    // Read and execute SQL file
    const sqlFile = await fs.readFile(
      path.join(__dirname, 'setup-incontinence.sql'),
      'utf8'
    );

    const { error } = await supabase.rpc('exec_sql', {
      sql: sqlFile
    });

    if (error) throw error;
    console.log('✓ Created incontinence monitoring tables and views');

    console.log('Incontinence monitoring system setup completed successfully!');
    return true;
  } catch (error) {
    console.error('Error setting up incontinence monitoring:', error);
    return false;
  }
}

setupIncontinence()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));