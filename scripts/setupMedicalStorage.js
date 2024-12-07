import { supabase } from '../lib/supabase';

async function setupMedicalStorage() {
  try {
    console.log('Setting up medical storage...');

    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Drop existing policies
        DROP POLICY IF EXISTS "Public Medical Files Access" ON storage.objects;
        DROP POLICY IF EXISTS "Medical Files Access" ON storage.objects;
        DROP POLICY IF EXISTS "Medical Readings Access" ON medical_readings;

        -- Create medical-files storage bucket
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('medical-files', 'Medical Files', true)
        ON CONFLICT (id) DO UPDATE
        SET public = true;

        -- Disable RLS temporarily
        ALTER TABLE medical_readings DISABLE ROW LEVEL SECURITY;
        ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

        -- Grant full access to medical readings table
        GRANT ALL ON medical_readings TO authenticated;
        GRANT ALL ON medical_readings TO anon;
        GRANT ALL ON reading_types TO authenticated;
        GRANT ALL ON reading_types TO anon;

        -- Grant storage access
        GRANT ALL ON SCHEMA storage TO authenticated;
        GRANT ALL ON SCHEMA storage TO anon;
        GRANT ALL ON storage.objects TO authenticated;
        GRANT ALL ON storage.objects TO anon;
        GRANT ALL ON storage.buckets TO authenticated;
        GRANT ALL ON storage.buckets TO anon;

        -- Reset sequences ownership
        ALTER SEQUENCE IF EXISTS medical_readings_id_seq OWNER TO postgres;
        ALTER SEQUENCE IF EXISTS reading_types_id_seq OWNER TO postgres;
      `
    });

    if (error) throw error;
    console.log('Medical storage setup completed successfully!');
    return true;
  } catch (error) {
    console.error('Error setting up medical storage:', error);
    return false;
  }
}

setupMedicalStorage()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));