-- First ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add Telehealth Clinic Administrator to primary roles
INSERT INTO healthcare_primary_roles (name, description)
VALUES ('Telehealth Clinic Administrator', 'Manages telehealth operations and virtual care services')
ON CONFLICT (name) DO UPDATE 
SET description = EXCLUDED.description;

-- Add specific roles for Telehealth administration
WITH telehealth_role AS (
  SELECT id FROM healthcare_primary_roles WHERE name = 'Telehealth Clinic Administrator'
)
INSERT INTO healthcare_specific_roles (name, primary_role_id, description, active) 
VALUES
  ('Telehealth Operations Manager', (SELECT id FROM telehealth_role), 
   'Oversees daily telehealth operations and staff scheduling', true),
  ('Virtual Care Coordinator', (SELECT id FROM telehealth_role), 
   'Coordinates virtual appointments and patient care', true),
  ('Telehealth Technical Support', (SELECT id FROM telehealth_role), 
   'Provides technical support for virtual care sessions', true)
ON CONFLICT (name, primary_role_id) DO UPDATE 
SET description = EXCLUDED.description;

-- Update roles view to include new roles
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