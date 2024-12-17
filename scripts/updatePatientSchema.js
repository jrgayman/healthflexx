import { supabase } from '../lib/supabase';

async function updatePatientSchema() {
  try {
    console.log('Updating patient schema...');

    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add timezone and medication_times columns to users table if they don't exist
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York',
        ADD COLUMN IF NOT EXISTS medication_times JSONB DEFAULT '[
          {"id": "morning", "label": "Morning", "time": "08:00", "enabled": true},
          {"id": "noon", "label": "Noon", "time": "12:00", "enabled": true},
          {"id": "afternoon", "label": "Afternoon", "time": "16:00", "enabled": true},
          {"id": "evening", "label": "Evening", "time": "20:00", "enabled": true}
        ]'::jsonb;

        -- Create index for timezone lookup
        CREATE INDEX IF NOT EXISTS idx_users_timezone ON users(timezone);

        -- Create function to validate medication times JSON
        CREATE OR REPLACE FUNCTION validate_medication_times()
        RETURNS trigger AS $$
        BEGIN
          IF NEW.medication_times IS NOT NULL THEN
            -- Validate JSON structure
            IF NOT (
              jsonb_typeof(NEW.medication_times) = 'array' 
              AND jsonb_array_length(NEW.medication_times) > 0
            ) THEN
              RAISE EXCEPTION 'medication_times must be a non-empty array';
            END IF;

            -- Validate each time slot
            FOR i IN 0..jsonb_array_length(NEW.medication_times) - 1 LOOP
              IF NOT (
                (NEW.medication_times->i->>'id') IS NOT NULL
                AND (NEW.medication_times->i->>'label') IS NOT NULL
                AND (NEW.medication_times->i->>'time') IS NOT NULL
                AND (NEW.medication_times->i->>'enabled') IS NOT NULL
              ) THEN
                RAISE EXCEPTION 'Invalid medication time format';
              END IF;
            END LOOP;
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Create trigger for medication times validation
        DROP TRIGGER IF EXISTS validate_medication_times_trigger ON users;
        CREATE TRIGGER validate_medication_times_trigger
          BEFORE INSERT OR UPDATE OF medication_times ON users
          FOR EACH ROW
          EXECUTE FUNCTION validate_medication_times();

        -- Update existing sessions with timezone
        UPDATE medication_sessions ms
        SET timezone = u.timezone
        FROM users u
        WHERE ms.patient_id = u.id
        AND ms.timezone IS NULL;
      `
    });

    if (error) throw error;
    console.log('Patient schema updated successfully!');
    return true;
  } catch (error) {
    console.error('Error updating patient schema:', error);
    return false;
  }
}

updatePatientSchema()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));