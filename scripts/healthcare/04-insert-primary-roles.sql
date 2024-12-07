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