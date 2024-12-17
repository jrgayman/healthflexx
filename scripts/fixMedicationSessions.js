import { supabase } from '../lib/supabase';

async function fixMedicationSessions() {
  try {
    console.log('Fixing medication sessions...');

    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Update existing records to mark missed doses
        UPDATE medication_tracking_records
        SET status = 'missed'
        WHERE status = 'pending'
        AND (scheduled_date || ' ' || scheduled_time)::timestamp < NOW()
        AND session_id IN (
          SELECT id 
          FROM medication_sessions 
          WHERE active = true
        );

        -- Create function to automatically mark sessions as missed
        CREATE OR REPLACE FUNCTION auto_mark_missed()
        RETURNS trigger AS $$
        BEGIN
          IF NEW.status = 'pending' AND 
             (NEW.scheduled_date || ' ' || NEW.scheduled_time)::timestamp < NOW() THEN
            NEW.status := 'missed';
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Create trigger for auto-marking missed doses
        DROP TRIGGER IF EXISTS trigger_auto_mark_missed ON medication_tracking_records;
        CREATE TRIGGER trigger_auto_mark_missed
          BEFORE INSERT OR UPDATE ON medication_tracking_records
          FOR EACH ROW
          EXECUTE FUNCTION auto_mark_missed();
      `
    });

    if (error) throw error;
    console.log('Medication sessions fixed successfully!');
    return true;
  } catch (error) {
    console.error('Error fixing medication sessions:', error);
    return false;
  }
}

fixMedicationSessions()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));