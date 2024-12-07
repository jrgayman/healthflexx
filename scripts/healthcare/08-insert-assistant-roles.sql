-- Insert Assistant roles
WITH assistant_role AS (
  SELECT id FROM healthcare_primary_roles WHERE name = 'Assistant'
)
INSERT INTO healthcare_specific_roles (name, primary_role_id, description) 
VALUES
  ('Medical Assistant', (SELECT id FROM assistant_role), 
   'Performs clinical and administrative tasks under supervision'),
  ('Physician Assistant', (SELECT id FROM assistant_role), 
   'Diagnoses illnesses and develops treatment plans'),
  ('Nursing Assistant', (SELECT id FROM assistant_role), 
   'Provides basic patient care under nursing supervision'),
  ('Physical Therapy Assistant', (SELECT id FROM assistant_role), 
   'Assists physical therapists in patient treatment'),
  ('Pharmacy Assistant', (SELECT id FROM assistant_role), 
   'Assists pharmacists in preparing and distributing medications')
ON CONFLICT (name, primary_role_id) DO UPDATE 
SET description = EXCLUDED.description;