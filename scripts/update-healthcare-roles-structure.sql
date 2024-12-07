-- First ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing views that might reference the old structure
DROP VIEW IF EXISTS healthcare_roles_view CASCADE;
DROP VIEW IF EXISTS user_details CASCADE;

-- Drop existing tables to rebuild them
DROP TABLE IF EXISTS healthcare_specific_roles CASCADE;
DROP TABLE IF EXISTS healthcare_primary_roles CASCADE;

-- Create healthcare roles table without relationships
CREATE TABLE healthcare_roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_healthcare_roles_active ON healthcare_roles(active);

-- Insert roles
INSERT INTO healthcare_roles (name, description) VALUES 
  -- Administrative roles
  ('Medical Administrator', 'Manages operations, staff, and budgets in healthcare settings'),
  ('Medical Receptionist', 'Schedules appointments, handles inquiries, and greets patients'),
  ('Billing Specialist', 'Manages medical billing and insurance claims'),
  ('Medical Office Manager', 'Oversees daily operations of a medical practice or department'),
  ('Health Information Technician', 'Manages electronic health records and data'),
  ('Patient Access Representative', 'Assists patients with registration and access to services'),

  -- Nursing roles
  ('Registered Nurse (RN)', 'Provides patient care, administers medications, and assists in treatments'),
  ('Licensed Practical Nurse (LPN)', 'Provides basic nursing care under supervision'),
  ('Nurse Practitioner (NP)', 'Advanced practice nurse who can diagnose and treat patients'),
  ('Clinical Nurse Specialist', 'Expert in specialized areas of nursing'),
  ('Certified Nurse Midwife', 'Specializes in obstetrics and gynecology'),
  ('Nurse Anesthetist (CRNA)', 'Provides anesthesia during surgeries and procedures'),
  ('Nurse Educator', 'Trains and mentors nursing students or practicing nurses'),

  -- Physician roles
  ('General Practitioner', 'Provides primary care for a wide range of medical issues'),
  ('Specialist Doctor', 'Focuses on a specific medical field'),
  ('Surgeon', 'Performs surgical operations'),
  ('Hospitalist', 'Specializes in caring for hospitalized patients'),
  ('Emergency Medicine Physician', 'Specializes in immediate care for acute injuries or illnesses'),
  ('Pediatrician', 'Specializes in medical care for children and adolescents'),

  -- Allied Health roles
  ('Physician Assistant', 'Diagnoses illnesses, develops treatment plans'),
  ('Medical Assistant', 'Performs clinical and administrative tasks under supervision'),
  ('Physical Therapist', 'Helps patients recover mobility and manage pain'),
  ('Occupational Therapist', 'Assists patients in regaining skills for daily living'),
  ('Respiratory Therapist', 'Treats patients with breathing disorders'),
  ('Dietitian/Nutritionist', 'Provides dietary advice and plans'),
  ('Pharmacist', 'Prepares and dispenses medications'),
  ('Social Worker', 'Supports patients with emotional and social challenges'),
  ('Patient', 'Healthcare recipients and medical care patients')
ON CONFLICT (name) DO UPDATE 
SET description = EXCLUDED.description;

-- Create user_roles junction table
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES healthcare_roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role_id);

-- Update user details view to include roles
CREATE OR REPLACE VIEW user_details AS
SELECT 
  u.id,
  u.name,
  u.email,
  u.phone,
  u.access_level,
  u.avatar_url,
  u.company_id,
  c.name as company_name,
  u.healthcare_provider_id,
  hp.name as provider_name,
  ARRAY_AGG(
    jsonb_build_object(
      'id', hr.id,
      'name', hr.name,
      'description', hr.description
    )
  ) FILTER (WHERE hr.id IS NOT NULL) as roles
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
LEFT JOIN healthcare_providers hp ON u.healthcare_provider_id = hp.id
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN healthcare_roles hr ON ur.role_id = hr.id
GROUP BY 
  u.id, 
  u.name, 
  u.email, 
  u.phone, 
  u.access_level, 
  u.avatar_url,
  u.company_id,
  c.name,
  u.healthcare_provider_id,
  hp.name;