-- Update user constraints for roles
ALTER TABLE users
DROP CONSTRAINT IF EXISTS check_healthcare_role;

ALTER TABLE users
ADD CONSTRAINT check_healthcare_role
CHECK (
  (access_level IN ('Super Admin', 'Admin') AND role_id IS NULL) OR
  (access_level NOT IN ('Super Admin', 'Admin'))
);