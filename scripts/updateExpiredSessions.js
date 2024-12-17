import { supabase } from '../lib/supabase';

async function updateExpiredSessions() {
  try {
    console.log('Updating expired medication sessions...');

    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create function to update expired sessions
        CREATE OR REPLACE FUNCTION update_expired_sessions()
        RETURNS void AS $$
        BEGIN
          -- Update records where scheduled time has passed and status is still pending
          UPDATE medication_tracking_records
          SET status = 'missed'
          WHERE status = 'pending'
          AND (scheduled_date || ' ' || scheduled_time)::timestamp < NOW()
          AND session_id IN (
            SELECT id 
            FROM medication_sessions 
            WHERE active = true
          );
        END;
        $$ LANGUAGE plpgsql;

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

        -- Run initial update
        SELECT update_expired_sessions();

        -- Create a scheduled function to periodically update expired sessions
        CREATE OR REPLACE FUNCTION schedule_expired_sessions_update()
        RETURNS void AS $$
        BEGIN
          PERFORM update_expired_sessions();
        END;
        $$ LANGUAGE plpgsql;

        -- Set up a cron job to run every 5 minutes (requires pg_cron extension)
        -- Note: This requires DBA privileges and pg_cron extension
        -- SELECT cron.schedule('*/5 * * * *', 'SELECT schedule_expired_sessions_update()');
      `
    });

    if (error) throw error;
    console.log('Successfully set up expired sessions handling');
    return true;
  } catch (error) {
    console.error('Error setting up expired sessions handling:', error);
    return false;
  }
}

updateExpiredSessions()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));