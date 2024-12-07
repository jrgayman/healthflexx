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
   'Manages electronic health records and data')
ON CONFLICT (name, primary_role_id) DO UPDATE 
SET description = EXCLUDED.description;