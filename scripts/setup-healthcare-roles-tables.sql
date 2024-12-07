-- First ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create healthcare_roles_primary table
CREATE TABLE IF NOT EXISTS healthcare_roles_primary (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create healthcare_roles_secondary table
CREATE TABLE IF NOT EXISTS healthcare_roles_secondary (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  primary_role_id UUID NOT NULL REFERENCES healthcare_roles_primary(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, primary_role_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_healthcare_roles_secondary_primary_role 
ON healthcare_roles_secondary(primary_role_id);

CREATE INDEX IF NOT EXISTS idx_healthcare_roles_secondary_active 
ON healthcare_roles_secondary(active);

-- Insert primary roles
INSERT INTO healthcare_roles_primary (name, description) 
VALUES 
  ('Administrator', 'Healthcare administration and management roles'),
  ('Nurse', 'Nursing and patient care professionals'),
  ('Patient', 'Healthcare recipients and medical care patients'),
  ('Physician', 'Medical doctors and specialists')
ON CONFLICT (name) DO UPDATE 
SET description = EXCLUDED.description;

-- Insert secondary roles for Administrator
WITH admin_role AS (
  SELECT id FROM healthcare_roles_primary WHERE name = 'Administrator'
)
INSERT INTO healthcare_roles_secondary (name, primary_role_id, description) 
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

-- Insert secondary roles for Nurse
WITH nurse_role AS (
  SELECT id FROM healthcare_roles_primary WHERE name = 'Nurse'
)
INSERT INTO healthcare_roles_secondary (name, primary_role_id, description) 
VALUES
  ('Registered Nurse (RN)', (SELECT id FROM nurse_role), 
   'Provides patient care, administers medications, and assists in treatments'),
  ('Licensed Practical Nurse (LPN)', (SELECT id FROM nurse_role), 
   'Provides basic nursing care under supervision'),
  ('Nurse Practitioner (NP)', (SELECT id FROM nurse_role), 
   'Advanced practice nurse who can diagnose and treat patients'),
  ('Clinical Nurse Specialist', (SELECT id FROM nurse_role), 
   'Expert in specialized areas of nursing'),
  ('Certified Nurse Midwife', (SELECT id FROM nurse_role), 
   'Specializes in obstetrics and gynecology'),
  ('Nurse Anesthetist (CRNA)', (SELECT id FROM nurse_role), 
   'Provides anesthesia during surgeries and procedures'),
  ('Nurse Educator', (SELECT id FROM nurse_role), 
   'Trains and mentors nursing students or practicing nurses')
ON CONFLICT (name, primary_role_id) DO UPDATE 
SET description = EXCLUDED.description;

-- Insert secondary roles for Physician
WITH physician_role AS (
  SELECT id FROM healthcare_roles_primary WHERE name = 'Physician'
)
INSERT INTO healthcare_roles_secondary (name, primary_role_id, description) 
VALUES
  ('General Practitioner', (SELECT id FROM physician_role), 
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

-- Create view for easy querying of roles with their categories
CREATE OR REPLACE VIEW healthcare_roles_view AS
SELECT 
  sr.id,
  sr.name as role_name,
  pr.name as primary_role,
  sr.description,
  sr.active,
  sr.created_at,
  sr.updated_at
FROM healthcare_roles_secondary sr
JOIN healthcare_roles_primary pr ON sr.primary_role_id = pr.id
ORDER BY pr.name, sr.name;