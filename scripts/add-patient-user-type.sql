-- First, ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add patient-specific fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'Reader',
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS medical_record_number TEXT,
ADD COLUMN IF NOT EXISTS primary_physician TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact TEXT,
ADD COLUMN IF NOT EXISTS emergency_phone TEXT,
ADD COLUMN IF NOT EXISTS insurance_provider TEXT,
ADD COLUMN IF NOT EXISTS insurance_id TEXT,
ADD COLUMN IF NOT EXISTS room_id UUID REFERENCES rooms(id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_medical_record_number ON users(medical_record_number);
CREATE INDEX IF NOT EXISTS idx_users_room_id ON users(room_id);

-- Add constraint to validate user types
ALTER TABLE users
DROP CONSTRAINT IF EXISTS check_valid_user_type;

ALTER TABLE users
ADD CONSTRAINT check_valid_user_type
CHECK (user_type IN ('Super Admin', 'Admin', 'Content Creator', 'Reader', 'Patient'));

-- Update access_level to match user_type for existing users
UPDATE users
SET user_type = access_level
WHERE user_type = 'Reader';

-- Create function to validate patient data
CREATE OR REPLACE FUNCTION validate_patient_data()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_type = 'Patient' THEN
    IF NEW.date_of_birth IS NULL THEN
      RAISE EXCEPTION 'Date of birth is required for patients';
    END IF;
    IF NEW.medical_record_number IS NULL THEN
      RAISE EXCEPTION 'Medical record number is required for patients';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for patient data validation
DROP TRIGGER IF EXISTS trigger_validate_patient_data ON users;
CREATE TRIGGER trigger_validate_patient_data
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION validate_patient_data();

-- Create unique constraint on medical record number
ALTER TABLE users
ADD CONSTRAINT unique_medical_record_number UNIQUE (medical_record_number);

-- Create view for patient information
CREATE OR REPLACE VIEW patient_details AS
SELECT 
  u.id,
  u.name,
  u.email,
  u.phone,
  u.date_of_birth,
  u.gender,
  u.medical_record_number,
  u.primary_physician,
  u.emergency_contact,
  u.emergency_phone,
  u.insurance_provider,
  u.insurance_id,
  b.name as building_name,
  r.room_number,
  r.floor
FROM users u
LEFT JOIN rooms r ON u.room_id = r.id
LEFT JOIN buildings b ON r.building_id = b.id
WHERE u.user_type = 'Patient';

-- Add sample patient (commented out for safety)
/*
INSERT INTO users (
  name,
  email,
  password_hash,
  phone,
  user_type,
  date_of_birth,
  gender,
  medical_record_number,
  primary_physician,
  emergency_contact,
  emergency_phone,
  insurance_provider,
  insurance_id
) VALUES (
  'John Doe',
  'john.doe@example.com',
  '$2a$10$XQtJ9.yqD7eFXDYWvj8kB.njc2FMqwcUvtXdgKRLVGTJbqOXHx3hy',
  '555-0123',
  'Patient',
  '1950-01-01',
  'Male',
  'MRN123456',
  'Dr. Jane Smith',
  'Jane Doe',
  '555-0124',
  'Health Insurance Co',
  'HIC987654321'
);
*/