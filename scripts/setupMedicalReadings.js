import { supabase } from './config/supabase.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function setupMedicalReadings() {
  try {
    console.log('Setting up medical readings system...');

    // Read SQL files
    const medicalReadingsSQL = await fs.readFile(
      path.join(__dirname, 'setup-medical-readings.sql'),
      'utf8'
    );

    // Execute SQL commands
    const { error: readingsError } = await supabase.rpc('exec_sql', {
      sql: medicalReadingsSQL
    });

    if (readingsError) throw readingsError;
    console.log('✓ Created medical readings tables');

    // Create storage bucket for medical files
    const { error: storageError } = await supabase.storage.createBucket('medical-files', {
      public: false,
      allowedMimeTypes: [
        'image/*',
        'audio/*',
        'application/pdf',
        'video/*'
      ],
      fileSizeLimit: 52428800 // 50MB
    });

    if (storageError && !storageError.message.includes('already exists')) {
      throw storageError;
    }
    console.log('✓ Created medical files storage bucket');

    // Set up storage policies
    const { error: policyError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Enable RLS on storage.objects
        ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

        -- Create policy for medical files access
        CREATE POLICY "Medical Files Access"
        ON storage.objects FOR ALL
        TO authenticated
        USING (bucket_id = 'medical-files');
      `
    });

    if (policyError) throw policyError;
    console.log('✓ Created storage policies');

    console.log('Medical readings system setup completed successfully!');
    return true;
  } catch (error) {
    console.error('Error setting up medical readings:', error);
    return false;
  }
}

setupMedicalReadings()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));