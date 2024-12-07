-- Create reading statistics table
CREATE TABLE IF NOT EXISTS reading_statistics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reading_type_id UUID NOT NULL REFERENCES reading_types(id),
  time_range TEXT NOT NULL CHECK (time_range IN ('day', 'week', 'month', 'year')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  min_value DECIMAL,
  max_value DECIMAL,
  avg_value DECIMAL,
  reading_count INTEGER NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_reading_stats_user ON reading_statistics(user_id);
CREATE INDEX idx_reading_stats_type ON reading_statistics(reading_type_id);
CREATE INDEX idx_reading_stats_date ON reading_statistics(start_date, end_date);

-- Create function to calculate reading statistics
CREATE OR REPLACE FUNCTION calculate_reading_statistics(
  p_user_id UUID,
  p_reading_type_id UUID,
  p_time_range TEXT
)
RETURNS void AS $$
DECLARE
  v_start_date TIMESTAMPTZ;
  v_end_date TIMESTAMPTZ := NOW();
BEGIN
  -- Set start date based on time range
  CASE p_time_range
    WHEN 'day' THEN v_start_date := v_end_date - INTERVAL '1 day';
    WHEN 'week' THEN v_start_date := v_end_date - INTERVAL '1 week';
    WHEN 'month' THEN v_start_date := v_end_date - INTERVAL '1 month';
    WHEN 'year' THEN v_start_date := v_end_date - INTERVAL '1 year';
  END CASE;

  -- Insert or update statistics
  INSERT INTO reading_statistics (
    user_id,
    reading_type_id,
    time_range,
    start_date,
    end_date,
    min_value,
    max_value,
    avg_value,
    reading_count,
    updated_at
  )
  SELECT
    p_user_id,
    p_reading_type_id,
    p_time_range,
    v_start_date,
    v_end_date,
    MIN(numeric_value),
    MAX(numeric_value),
    AVG(numeric_value),
    COUNT(*),
    NOW()
  FROM medical_readings
  WHERE user_id = p_user_id
    AND reading_type_id = p_reading_type_id
    AND reading_date BETWEEN v_start_date AND v_end_date
    AND numeric_value IS NOT NULL
  ON CONFLICT (user_id, reading_type_id, time_range)
  DO UPDATE SET
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    min_value = EXCLUDED.min_value,
    max_value = EXCLUDED.max_value,
    avg_value = EXCLUDED.avg_value,
    reading_count = EXCLUDED.reading_count,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to update statistics after new readings
CREATE OR REPLACE FUNCTION update_reading_statistics()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process numeric readings
  IF NEW.numeric_value IS NOT NULL THEN
    -- Update statistics for all time ranges
    PERFORM calculate_reading_statistics(NEW.user_id, NEW.reading_type_id, 'day');
    PERFORM calculate_reading_statistics(NEW.user_id, NEW.reading_type_id, 'week');
    PERFORM calculate_reading_statistics(NEW.user_id, NEW.reading_type_id, 'month');
    PERFORM calculate_reading_statistics(NEW.user_id, NEW.reading_type_id, 'year');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update statistics
DROP TRIGGER IF EXISTS trigger_update_reading_statistics ON medical_readings;
CREATE TRIGGER trigger_update_reading_statistics
AFTER INSERT OR UPDATE ON medical_readings
FOR EACH ROW
EXECUTE FUNCTION update_reading_statistics();

-- Create view for easy access to latest statistics
CREATE OR REPLACE VIEW reading_statistics_view AS
SELECT
  rs.*,
  rt.name as reading_name,
  rt.code as reading_code,
  rt.unit as reading_unit,
  rt.icon as reading_icon,
  u.name as patient_name
FROM reading_statistics rs
JOIN reading_types rt ON rs.reading_type_id = rt.id
JOIN users u ON rs.user_id = u.id
WHERE rs.updated_at >= NOW() - INTERVAL '1 day'
ORDER BY rs.updated_at DESC;

-- Grant permissions
GRANT ALL ON reading_statistics TO authenticated;
GRANT ALL ON reading_statistics TO anon;