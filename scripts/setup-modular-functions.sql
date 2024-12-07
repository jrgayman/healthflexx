-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schema for utility functions
CREATE SCHEMA IF NOT EXISTS utils;

-- Create schema for business logic functions
CREATE SCHEMA IF NOT EXISTS business;

-- Create schema for audit functions
CREATE SCHEMA IF NOT EXISTS audit;

-- Utility function to generate slugs
CREATE OR REPLACE FUNCTION utils.generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        title,
        '[^a-zA-Z0-9\s-]',
        ''
      ),
      '\s+',
      '-'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Utility function to update timestamps
CREATE OR REPLACE FUNCTION utils.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Business logic function for post likes
CREATE OR REPLACE FUNCTION business.increment_post_likes(post_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_likes INTEGER;
BEGIN
  UPDATE posts 
  SET likes = COALESCE(likes, 0) + 1
  WHERE id = post_id
  RETURNING likes INTO new_likes;
  
  RETURN new_likes;
END;
$$ LANGUAGE plpgsql;

-- Business logic function for medication adherence
CREATE OR REPLACE FUNCTION business.calculate_adherence_rate(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  medication_id UUID,
  total_doses INTEGER,
  doses_taken INTEGER,
  adherence_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pm.medication_id,
    COUNT(mar.id) as total_doses,
    COUNT(CASE WHEN mar.status = 'taken' THEN 1 END) as doses_taken,
    ROUND(
      CAST(COUNT(CASE WHEN mar.status = 'taken' THEN 1 END) AS NUMERIC) / 
      NULLIF(COUNT(mar.id), 0) * 100,
      2
    ) as adherence_rate
  FROM patient_medications pm
  LEFT JOIN medication_adherence_records mar ON pm.id = mar.schedule_id
  WHERE pm.user_id = p_user_id
  AND mar.scheduled_date BETWEEN p_start_date AND p_end_date
  GROUP BY pm.medication_id;
END;
$$ LANGUAGE plpgsql;

-- Audit function to log changes
CREATE OR REPLACE FUNCTION audit.log_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit.change_log (
    table_name,
    record_id,
    action,
    old_data,
    new_data,
    changed_by
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    row_to_json(OLD),
    row_to_json(NEW),
    current_user
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit.change_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  changed_by TEXT NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_change_log_table ON audit.change_log(table_name);
CREATE INDEX IF NOT EXISTS idx_change_log_record ON audit.change_log(record_id);
CREATE INDEX IF NOT EXISTS idx_change_log_action ON audit.change_log(action);
CREATE INDEX IF NOT EXISTS idx_change_log_changed_at ON audit.change_log(changed_at);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA utils TO authenticated;
GRANT USAGE ON SCHEMA business TO authenticated;
GRANT USAGE ON SCHEMA audit TO authenticated;

GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA utils TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA business TO authenticated;
GRANT SELECT ON audit.change_log TO authenticated;