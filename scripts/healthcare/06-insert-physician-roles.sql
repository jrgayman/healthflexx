-- Insert Physician roles
WITH physician_role AS (
  SELECT id FROM healthcare_primary_roles WHERE name = 'Physician'
)
INSERT INTO healthcare_specific_roles (name, primary_role_id, description) 
VALUES
  ('General Practitioner', (SELECT id FROM physician_role), 
   'Provides primary care for a wide range of medical issues'),
  ('Specialist', (SELECT id FROM physician_role), 
   'Focuses on a specific medical field'),
  ('Surgeon', (SELECT id FROM physician_role), 
   'Performs surgical operations'),
  ('Hospitalist', (SELECT id FROM physician_role), 
   'Specializes in caring for hospitalized patients'),
  ('Emergency Medicine Physician', (SELECT id FROM physician_role), 
   'Specializes in immediate care for acute injuries or illnesses')
ON CONFLICT (name, primary_role_id) DO UPDATE 
SET description = EXCLUDED.description;