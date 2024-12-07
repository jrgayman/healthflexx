```sql
-- Add indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_med_tracking_taken_at 
ON medication_tracking_records(taken_at);

CREATE INDEX IF NOT EXISTS idx_med_tracking_updated_at 
ON medication_tracking_records(updated_at);

-- Add constraint to ensure taken_at is set when status changes
ALTER TABLE medication_tracking_records
DROP CONSTRAINT IF EXISTS check_taken_at_status;

ALTER TABLE medication_tracking_records
ADD CONSTRAINT check_taken_at_status
CHECK (
  (status IN ('taken', 'late', 'overtaken') AND taken_at IS NOT NULL) OR
  (status IN ('pending', 'missed') AND taken_at IS NULL)
);

-- Create function to automatically set missed status
CREATE OR REPLACE FUNCTION update_missed_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update to missed if past scheduled time and still pending
  UPDATE medication_tracking_records
  SET status = 'missed',
      updated_at = NOW()
  WHERE status = 'pending'
  AND scheduled_date < CURRENT_DATE
  OR (
    scheduled_date = CURRENT_DATE 
    AND scheduled_time < CURRENT_TIME - INTERVAL '30 minutes'
  );
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run hourly
CREATE OR REPLACE FUNCTION create_missed_status_trigger()
RETURNS VOID AS $$
BEGIN
  SELECT cron.schedule(
    'update-missed-meds',
    '0 * * * *',  -- Every hour
    'SELECT update_missed_status()'
  );
END;
$$ LANGUAGE plpgsql;
```