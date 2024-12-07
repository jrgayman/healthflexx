import { supabase } from './config/supabase.js';

async function updateUserSchema() {
  try {
    console.log('Updating user schema...');

    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add new columns to users table
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS is_patient BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS is_medical_staff BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS medical_record_number TEXT UNIQUE,
        ADD COLUMN IF NOT EXISTS date_of_birth DATE,
        ADD COLUMN IF NOT EXISTS gender TEXT,
        ADD COLUMN IF NOT EXISTS primary_physician TEXT,
        ADD COLUMN IF NOT EXISTS emergency_contact TEXT,
        ADD COLUMN IF NOT EXISTS emergency_phone TEXT,
        ADD COLUMN IF NOT EXISTS insurance_provider TEXT,
        ADD COLUMN IF NOT EXISTS insurance_id TEXT,
        ADD COLUMN IF NOT EXISTS room_id UUID REFERENCES rooms(id) ON DELETE SET NULL;

        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_users_is_patient ON users(is_patient);
        CREATE INDEX IF NOT EXISTS idx_users_is_medical_staff ON users(is_medical_staff);
        CREATE INDEX IF NOT EXISTS idx_users_medical_record_number ON users(medical_record_number);
        CREATE INDEX IF NOT EXISTS idx_users_room_id ON users(room_id);

        -- Create sequence for MRNs
        CREATE SEQUENCE IF NOT EXISTS users_mrn_seq START 1;

        -- Create MRN generation function
        CREATE OR REPLACE FUNCTION generate_mrn()
        RETURNS TEXT AS $$
        BEGIN
          RETURN 'MRN' || LPAD(NEXTVAL('users_mrn_seq')::TEXT, 6, '0');
        END;
        $$ LANGUAGE plpgsql;

        -- Create patient creation function
        CREATE OR REPLACE FUNCTION handle_patient_creation()
        RETURNS TRIGGER AS $$
        BEGIN
          IF NEW.is_patient AND NEW.medical_record_number IS NULL THEN
            NEW.medical_record_number := generate_mrn();
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Create patient creation trigger
        DROP TRIGGER IF EXISTS trigger_handle_patient_creation ON users;
        CREATE TRIGGER trigger_handle_patient_creation
        BEFORE INSERT OR UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION handle_patient_creation();

        -- Drop existing views
        DROP VIEW IF EXISTS room_occupancy_details CASCADE;
        DROP VIEW IF EXISTS patient_details CASCADE;

        -- Create room occupancy view
        CREATE VIEW room_occupancy_details AS
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
        LEFT JOIN users u ON r.id = u.room_id AND u.is_patient = true
        GROUP BY r.id, r.room_number, r.name, r.floor, r.capacity, r.current_occupancy, b.name;

        -- Create patient details view
        CREATE VIEW patient_details AS
        SELECT 
          u.id,
          u.name,
          u.email,
          u.phone,
          u.medical_record_number,
          u.date_of_birth,
          u.gender,
          u.primary_physician,
          u.emergency_contact,
          u.emergency_phone,
          u.insurance_provider,
          u.insurance_id,
          u.room_id,
          u.healthcare_provider_id,
          u.company_id,
          u.role_id,
          u.access_level,
          u.avatar_url,
          u.is_patient,
          u.is_medical_staff,
          c.name as company_name,
          hp.name as healthcare_provider_name,
          sr.name as role_name,
          pr.name as primary_role,
          b.name as building_name,
          r.room_number,
          r.floor
        FROM users u
        LEFT JOIN companies c ON u.company_id = c.id
        LEFT JOIN healthcare_providers hp ON u.healthcare_provider_id = hp.id
        LEFT JOIN healthcare_specific_roles sr ON u.role_id = sr.id
        LEFT JOIN healthcare_primary_roles pr ON sr.primary_role_id = pr.id
        LEFT JOIN rooms r ON u.room_id = r.id
        LEFT JOIN buildings b ON r.building_id = b.id
        WHERE u.is_patient = true;

        -- Migrate existing patient data
        UPDATE users u
        SET 
          is_patient = true,
          medical_record_number = p.medical_record_number,
          date_of_birth = p.date_of_birth,
          gender = p.gender,
          primary_physician = p.primary_physician,
          emergency_contact = p.emergency_contact,
          emergency_phone = p.emergency_phone,
          insurance_provider = p.insurance_provider,
          insurance_id = p.insurance_id,
          room_id = p.room_id
        FROM patients p
        WHERE p.user_id = u.id;

        -- Update medical staff flag
        UPDATE users u
        SET is_medical_staff = true
        FROM healthcare_specific_roles sr
        JOIN healthcare_primary_roles pr ON sr.primary_role_id = pr.id
        WHERE u.role_id = sr.id
        AND pr.name IN ('Physician', 'Nurse', 'Assistant');

        -- Drop old patients table
        DROP TABLE IF EXISTS patients CASCADE;

        -- Update room occupancy counts
        UPDATE rooms r
        SET current_occupancy = (
          SELECT COUNT(*)
          FROM users u
          WHERE u.room_id = r.id
          AND u.is_patient = true
        );

        -- Make only room number required
        ALTER TABLE rooms
        ALTER COLUMN name DROP NOT NULL,
        ALTER COLUMN floor DROP NOT NULL,
        ALTER COLUMN capacity DROP NOT NULL;
      `
    });

    if (error) throw error;
    console.log('User schema updated successfully!');
    return true;
  } catch (error) {
    console.error('Error updating schema:', error);
    return false;
  }
}

updateUserSchema()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));