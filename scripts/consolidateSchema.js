import { supabase } from './config/supabase.js';

async function consolidateSchema() {
  try {
    console.log('Starting schema consolidation...');

    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- First ensure we have the UUID extension
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        -- Add Patient to primary roles if not exists
        INSERT INTO healthcare_primary_roles (name, description)
        VALUES ('Patient', 'Healthcare recipients and medical care patients')
        ON CONFLICT (name) DO UPDATE 
        SET description = EXCLUDED.description;

        -- Create user_roles junction table for multiple roles
        CREATE TABLE IF NOT EXISTS user_roles (
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          role_id UUID REFERENCES healthcare_specific_roles(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          PRIMARY KEY (user_id, role_id)
        );

        -- Create indexes for better query performance
        CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role_id);

        -- Drop existing views
        DROP VIEW IF EXISTS room_occupancy_details CASCADE;
        DROP VIEW IF EXISTS patient_details CASCADE;

        -- Create room occupancy view
        CREATE OR REPLACE VIEW room_occupancy_details AS
        SELECT 
          r.id as room_id,
          r.room_number,
          r.name as room_name,
          r.floor,
          r.capacity,
          r.current_occupancy,
          b.name as building_name,
          COUNT(u.id) as actual_occupancy,
          ARRAY_AGG(
            CASE 
              WHEN u.id IS NOT NULL 
              THEN jsonb_build_object(
                'id', u.id,
                'name', u.name,
                'medical_record_number', u.medical_record_number
              )
              ELSE NULL 
            END
          ) FILTER (WHERE u.id IS NOT NULL) as users
        FROM rooms r
        LEFT JOIN buildings b ON r.building_id = b.id
        LEFT JOIN users u ON r.id = u.room_id
        GROUP BY r.id, r.room_number, r.name, r.floor, r.capacity, r.current_occupancy, b.name;

        -- Create user details view with multiple roles
        CREATE OR REPLACE VIEW user_details AS
        SELECT 
          u.id,
          u.name,
          u.email,
          u.phone,
          u.access_level,
          u.avatar_url,
          u.company_id,
          c.name as company_name,
          u.healthcare_provider_id,
          hp.name as provider_name,
          ARRAY_AGG(
            jsonb_build_object(
              'id', sr.id,
              'name', sr.name,
              'primary_role', pr.name
            )
          ) FILTER (WHERE sr.id IS NOT NULL) as roles
        FROM users u
        LEFT JOIN companies c ON u.company_id = c.id
        LEFT JOIN healthcare_providers hp ON u.healthcare_provider_id = hp.id
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        LEFT JOIN healthcare_specific_roles sr ON ur.role_id = sr.id
        LEFT JOIN healthcare_primary_roles pr ON sr.primary_role_id = pr.id
        GROUP BY 
          u.id, 
          u.name, 
          u.email, 
          u.phone, 
          u.access_level, 
          u.avatar_url,
          u.company_id,
          c.name,
          u.healthcare_provider_id,
          hp.name;

        -- Make only room number required
        ALTER TABLE rooms
        ALTER COLUMN name DROP NOT NULL,
        ALTER COLUMN floor DROP NOT NULL,
        ALTER COLUMN capacity DROP NOT NULL;
      `
    });

    if (error) throw error;
    console.log('Schema consolidated successfully!');
    return true;
  } catch (error) {
    console.error('Error consolidating schema:', error);
    return false;
  }
}

consolidateSchema()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));