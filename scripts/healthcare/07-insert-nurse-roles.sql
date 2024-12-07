-- Insert Nurse roles
WITH nurse_role AS (
  SELECT id FROM healthcare_primary_roles WHERE name = 'Nurse'
)
INSERT INTO healthcare_specific_roles (name, primary_role_id, description) 
VALUES
  ('Registered Nurse (RN)', (SELECT id FROM nurse_role), 
   'Provides patient care, administers medications, and assists in treatments'),
  ('Licensed Practical Nurse (LPN)', (SELECT id FROM nurse_role), 
   'Provides basic nursing care under supervision'),
  ('Nurse Practitioner (NP)', (SELECT id FROM nurse_role), 
   'Advanced practice nurse who can diagnose and treat patients'),
  ('Clinical Nurse Specialist', (SELECT id FROM nurse_role), 
   'Expert in specialized areas of nursing'),
  ('Nurse Anesthetist (CRNA)', (SELECT id FROM nurse_role), 
   'Provides anesthesia during surgeries and procedures')
ON CONFLICT (name, primary_role_id) DO UPDATE 
SET description = EXCLUDED.description;