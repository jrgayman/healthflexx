-- Create view for roles hierarchy
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