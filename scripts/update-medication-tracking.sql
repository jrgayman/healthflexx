```sql
-- Add timezone support and first use tracking
ALTER TABLE medication_sessions
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York',
ADD COLUMN IF NOT EXISTS first_use_date DATE;

-- Add constraint for valid time slots
ALTER TABLE medication_tracking_records
ADD CONSTRAINT check_valid_time_slot
CHECK (scheduled_time IN ('08:00:00', '12:00:00', '16:00:00', '20:00:00'));

-- Create function to handle first medication
CREATE OR REPLACE FUNCTION handle_first_medication()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'taken' AND OLD.status = 'pending' THEN
    UPDATE medication_sessions
    SET first_use_date = NEW.scheduled_date
    WHERE id = NEW.session_id
    AND first_use_date IS NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for first medication
DROP TRIGGER IF EXISTS trigger_first_medication ON medication_tracking_records;
CREATE TRIGGER trigger_first_medication
AFTER UPDATE OF status ON medication_tracking_records
FOR EACH ROW
EXECUTE FUNCTION handle_first_medication();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_med_tracking_session_date_time 
ON medication_tracking_records(session_id, scheduled_date, scheduled_time);
```