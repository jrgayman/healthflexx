-- First ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create primary roles table
CREATE TABLE IF NOT EXISTS healthcare_primary_roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create specific roles table
CREATE TABLE IF NOT EXISTS healthcare_specific_roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  primary_role_id UUID NOT NULL REFERENCES healthcare_primary_roles(id),
  description TEXT,
  qualifications TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, primary_role_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_healthcare_specific_roles_primary_role 
ON healthcare_specific_roles(primary_role_id);

CREATE INDEX IF NOT EXISTS idx_healthcare_specific_roles_active 
ON healthcare_specific_roles(active);

-- Insert primary roles
INSERT INTO healthcare_primary_roles (name, description) 
VALUES 
  ('Administrator', 'Healthcare administration and management roles'),
  ('Physician', 'Medical doctors and specialists'),
  ('Nurse', 'Nursing and patient care professionals'),
  ('Assistant', 'Supporting medical and administrative staff'),
  ('Other', 'Additional healthcare roles')
ON CONFLICT (name) DO UPDATE 
SET description = EXCLUDED.description;

-- Insert Administrator roles
WITH admin_role AS (
  SELECT id FROM healthcare_primary_roles WHERE name = 'Administrator'
)
INSERT INTO healthcare_specific_roles (name, primary_role_id, description) 
VALUES
  ('Medical Administrator', (SELECT id FROM admin_role), 
   'Manages operations, staff, and budgets in healthcare settings'),
  ('Medical Receptionist', (SELECT id FROM admin_role), 
   'Schedules appointments, handles inquiries, and greets patients'),
  ('Billing Specialist', (SELECT id FROM admin_role), 
   'Manages medical billing and insurance claims'),
  ('Medical Office Manager', (SELECT id FROM admin_role), 
   'Oversees daily operations of a medical practice or department'),
  ('Health Information Technician', (SELECT id FROM admin_role), 
   'Manages electronic health records and data'),
  ('Patient Access Representative', (SELECT id FROM admin_role), 
   'Assists patients with registration and access to services')
ON CONFLICT (name, primary_role_id) DO UPDATE 
SET description = EXCLUDED.description;

-- Insert Nurse roles
WITH nurse_role AS (
  SELECT id FROM healthcare_primary_roles WHERE name = 'Nurse'
)
INSERT INTO healthcare_specific_roles (name, primary_role_id, description) 
VALUES
  ('Registered Nurse (RN)', (SELECT id FROM nurse_role), 
   'Provides patient care, administers medications, and assists in treatments'),
  ('Licensed Practical Nurse (LPN)', (SELECT id FROM nurse_role), 
   'Provides basic nursing care under supervision of RNs or doctors'),
  ('Nurse Practitioner (NP)', (SELECT id FROM nurse_role), 
   'Advanced practice nurse who can diagnose, treat, and prescribe medications'),
  ('Clinical Nurse Specialist (CNS)', (SELECT id FROM nurse_role), 
   'Expert in specialized areas of nursing'),
  ('Certified Nurse Midwife (CNM)', (SELECT id FROM nurse_role), 
   'Specializes in obstetrics and gynecology'),
  ('Nurse Anesthetist (CRNA)', (SELECT id FROM nurse_role), 
   'Provides anesthesia during surgeries and procedures'),
  ('Nurse Educator', (SELECT id FROM nurse_role), 
   'Trains and mentors nursing students or practicing nurses')
ON CONFLICT (name, primary_role_id) DO UPDATE 
SET description = EXCLUDED.description;

-- Insert Physician roles
WITH physician_role AS (
  SELECT id FROM healthcare_primary_roles WHERE name = 'Physician'
)
INSERT INTO healthcare_specific_roles (name, primary_role_id, description) 
VALUES
  ('General Practitioner (GP)', (SELECT id FROM physician_role), 
   'Provides primary care for a wide range of medical issues'),
  ('Specialist Doctor', (SELECT id FROM physician_role), 
   'Focuses on a specific medical field'),
  ('Surgeon', (SELECT id FROM physician_role), 
   'Performs surgical operations'),
  ('Hospitalist', (SELECT id FROM physician_role), 
   'Specializes in caring for hospitalized patients'),
  ('Emergency Medicine Physician', (SELECT id FROM physician_role), 
   'Specializes in immediate care for acute injuries or illnesses'),
  ('Pediatrician', (SELECT id FROM physician_role), 
   'Specializes in medical care for children and adolescents')
ON CONFLICT (name, primary_role_id) DO UPDATE 
SET description = EXCLUDED.description;

-- Insert Assistant roles
WITH assistant_role AS (
  SELECT id FROM healthcare_primary_roles WHERE name = 'Assistant'
)
INSERT INTO healthcare_specific_roles (name, primary_role_id, description) 
VALUES
  ('Physician Assistant (PA)', (SELECT id FROM assistant_role), 
   'Diagnoses illnesses, develops treatment plans, and may prescribe medications'),
  ('Medical Assistant (MA)', (SELECT id FROM assistant_role), 
   'Performs clinical and administrative tasks under physician supervision'),
  ('Physical Therapist Assistant', (SELECT id FROM assistant_role), 
   'Assists physical therapists in patient treatment'),
  ('Occupational Therapy Assistant', (SELECT id FROM assistant_role), 
   'Helps patients regain skills for daily living'),
  ('Pharmacy Assistant', (SELECT id FROM assistant_role), 
   'Assists pharmacists in preparing and distributing medications')
ON CONFLICT (name, primary_role_id) DO UPDATE 
SET description = EXCLUDED.description;

-- Insert Other roles
WITH other_role AS (
  SELECT id FROM healthcare_primary_roles WHERE name = 'Other'
)
INSERT INTO healthcare_specific_roles (name, primary_role_id, description) 
VALUES
  ('Physical Therapist', (SELECT id FROM other_role), 
   'Helps patients recover mobility and manage pain through therapy'),
  ('Occupational Therapist', (SELECT id FROM other_role), 
   'Assists patients in regaining skills for daily living'),
  ('Respiratory Therapist', (SELECT id FROM other_role), 
   'Treats patients with breathing or cardiopulmonary disorders'),
  ('Dietitian/Nutritionist', (SELECT id FROM other_role), 
   'Provides dietary advice and plans to improve health'),
  ('Pharmacist', (SELECT id FROM other_role), 
   'Prepares and dispenses medications, counsels patients on their use'),
  ('Psychologist', (SELECT id FROM other_role), 
   'Provides therapy and assessments for mental health disorders'),
  ('Social Worker', (SELECT id FROM other_role), 
   'Supports patients and families with emotional, social, or financial challenges')
ON CONFLICT (name, primary_role_id) DO UPDATE 
SET description = EXCLUDED.description;

-- Create view for easy querying of roles with their categories
CREATE OR REPLACE VIEW healthcare_roles_view AS
SELECT 
  sr.id,
  sr.name as role_name,
  pr.name as primary_role,
  sr.description,
  sr.qualifications,
  sr.active,
  sr.created_at,
  sr.updated_at
FROM healthcare_specific_roles sr
JOIN healthcare_primary_roles pr ON sr.primary_role_id = pr.id
ORDER BY pr.name, sr.name;