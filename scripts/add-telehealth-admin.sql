-- Add Telehealth Clinic Administrator to healthcare_roles_primary
INSERT INTO healthcare_roles_primary (name, description)
VALUES ('Telehealth Clinic Administrator', 'Manages telehealth operations and virtual care services')
ON CONFLICT (name) DO UPDATE 
SET description = EXCLUDED.description;