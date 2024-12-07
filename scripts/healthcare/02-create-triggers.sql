-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for healthcare_specific_roles
DROP TRIGGER IF EXISTS trigger_healthcare_specific_roles_updated_at ON healthcare_specific_roles;
CREATE TRIGGER trigger_healthcare_specific_roles_updated_at
  BEFORE UPDATE ON healthcare_specific_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();