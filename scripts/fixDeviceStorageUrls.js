import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pmmkfrohclzpwpnbtajc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbWtmcm9oY2x6cHdwbmJ0YWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4MTM4MDYsImV4cCI6MjA0NjM4OTgwNn0.2m8L21ploy11YBpO3Wf0Qv7uZ243oIqA2PP9DuaR0As';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDeviceStorageUrls() {
  try {
    console.log('Fixing device storage URLs...');

    // Create storage bucket for device images
    const { error: bucketError } = await supabase.storage.createBucket('device-images', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    });

    if (bucketError && !bucketError.message.includes('already exists')) {
      throw bucketError;
    }

    // Execute SQL for view and function setup
    const { error: sqlError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Drop existing views first
        DROP VIEW IF EXISTS device_details CASCADE;

        -- Create function to generate public URL
        CREATE OR REPLACE FUNCTION generate_device_image_url(storage_path TEXT)
        RETURNS TEXT AS $$
        BEGIN
          RETURN CASE 
            WHEN storage_path IS NULL THEN NULL
            ELSE 'https://pmmkfrohclzpwpnbtajc.supabase.co/storage/v1/object/public/device-images/' || storage_path
          END;
        END;
        $$ LANGUAGE plpgsql;

        -- Recreate device details view with proper image URLs
        CREATE OR REPLACE VIEW device_details AS
        SELECT 
          d.id,
          d.device_name,
          d.manufacturer,
          d.model,
          d.serial_number,
          d.mac_address,
          d.notes,
          d.active,
          COALESCE(d.image_url, generate_device_image_url(d.storage_path)) as image_url,
          dt.name as device_type,
          COALESCE(dt.image_url, generate_device_image_url(dt.storage_path)) as type_image_url,
          dc.name as classification,
          COALESCE(dc.image_url, generate_device_image_url(dc.storage_path)) as classification_image_url,
          u.id as user_id,
          u.name as user_name,
          u.medical_record_number,
          hp.name as provider_name,
          c.name as organization_name,
          d.created_at
        FROM devices d
        JOIN device_types dt ON d.device_type_id = dt.id
        JOIN device_classifications dc ON dt.classification_id = dc.id
        LEFT JOIN users u ON d.user_id = u.id
        LEFT JOIN healthcare_providers hp ON u.healthcare_provider_id = hp.id
        LEFT JOIN companies c ON u.company_id = c.id;

        -- Grant permissions
        GRANT ALL ON device_details TO authenticated;
        GRANT ALL ON device_details TO anon;
      `
    });

    if (sqlError) throw sqlError;

    // Set up storage policies
    const { error: policyError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Enable RLS on storage.objects
        ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

        -- Create policy for device images access
        CREATE POLICY "Device Images Access"
        ON storage.objects FOR ALL
        TO authenticated
        USING (bucket_id = 'device-images');
      `
    });

    if (policyError) throw policyError;

    console.log('Device storage URLs fixed successfully!');
    return true;
  } catch (error) {
    console.error('Error fixing device storage URLs:', error);
    return false;
  }
}

fixDeviceStorageUrls()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));