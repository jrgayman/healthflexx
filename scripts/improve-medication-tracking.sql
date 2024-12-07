-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_med_tracking_taken_at 
ON medication_tracking_records(taken_at);

CREATE INDEX IF NOT EXISTS idx_med_tracking_scheduled 
ON medication_tracking_records(scheduled_date, scheduled_time);

-- Add constraint to validate scheduled times
ALTER TABLE medication_tracking_records
ADD CONSTRAINT check_valid_scheduled_time
CHECK (
  scheduled_time IN ('08:00:00', '12:00:00', '16:00:00', '20:00:00')
);

-- Add function to validate taken_at timestamp
CREATE OR REPLACE FUNCTION validate_taken_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.taken_at IS NOT NULL THEN
    IF NEW.taken_at < (NEW.scheduled_date + NEW.scheduled_time::TIME)::TIMESTAMP THEN
      RAISE EXCEPTION 'Cannot take medication before scheduled time';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for taken_at validation
DROP TRIGGER IF EXISTS trigger_validate_taken_at ON medication_tracking_records;
CREATE TRIGGER trigger_validate_taken_at
BEFORE INSERT OR UPDATE OF taken_at ON medication_tracking_records
FOR EACH ROW
EXECUTE FUNCTION validate_taken_at();