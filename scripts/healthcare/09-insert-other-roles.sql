-- Insert Other roles
WITH other_role AS (
  SELECT id FROM healthcare_primary_roles WHERE name = 'Other'
)
INSERT INTO healthcare_specific_roles (name, primary_role_id, description) 
VALUES
  ('Physical Therapist', (SELECT id FROM other_role), 
   'Helps patients recover mobility and manage pain'),
  ('Occupational Therapist', (SELECT id FROM other_role), 
   'Assists patients in regaining skills for daily living'),
  ('Speech Therapist', (SELECT id FROM other_role), 
   'Helps patients with speech and swallowing disorders'),
  ('Pharmacist', (SELECT id FROM other_role), 
   'Prepares and dispenses medications'),
  ('Social Worker', (SELECT id FROM other_role), 
   'Supports patients with emotional and social challenges'),
  ('Psychologist', (SELECT id FROM other_role), 
   'Provides therapy and mental health assessments'),
  ('Dietitian', (SELECT id FROM other_role), 
   'Provides dietary advice and nutritional counseling')
ON CONFLICT (name, primary_role_id) DO UPDATE 
SET description = EXCLUDED.description;