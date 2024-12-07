import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pmmkfrohclzpwpnbtajc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbWtmcm9oY2x6cHdwbmJ0YWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4MTM4MDYsImV4cCI6MjA0NjM4OTgwNn0.2m8L21ploy11YBpO3Wf0Qv7uZ243oIqA2PP9DuaR0As';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDeviceView() {
  try {
    console.log('Fixing device details view...');

    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Drop existing view
        DROP VIEW IF EXISTS device_details;

        -- Recreate view with proper image handling
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
          d.image_url,
          dt.name as device_type,
          dt.image_url as type_image_url,
          dc.name as classification,
          dc.image_url as classification_image_url,
          u.id as user_id,
          u.name as user_name,
          u.medical_record_number,
          hp.name as provider_name,
          c.name as organization_name
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

    if (error) throw error;
    console.log('Device details view fixed successfully!');
    return true;
  } catch (error) {
    console.error('Error fixing device details view:', error);
    return false;
  }
}

fixDeviceView()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));