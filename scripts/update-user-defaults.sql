-- Create function to set default company for new users
CREATE OR REPLACE FUNCTION set_user_defaults()
RETURNS TRIGGER AS $$
DECLARE
  default_company_id UUID;
  default_provider_id UUID;
BEGIN
  -- Get the default company and provider IDs
  SELECT c.id, c.healthcare_provider_id 
  INTO default_company_id, default_provider_id
  FROM companies c
  WHERE c.name = 'HealthFlexx General'
  LIMIT 1;

  -- Set defaults if not specified
  IF NEW.company_id IS NULL THEN
    NEW.company_id := default_company_id;
  END IF;

  IF NEW.healthcare_provider_id IS NULL THEN
    NEW.healthcare_provider_id := default_provider_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new users
DROP TRIGGER IF EXISTS trigger_set_user_defaults ON users;
CREATE TRIGGER trigger_set_user_defaults
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_user_defaults();

-- Update existing users without company or provider
WITH default_ids AS (
  SELECT c.id as company_id, c.healthcare_provider_id
  FROM companies c
  WHERE c.name = 'HealthFlexx General'
  LIMIT 1
)
UPDATE users u
SET 
  company_id = COALESCE(u.company_id, d.company_id),
  healthcare_provider_id = COALESCE(u.healthcare_provider_id, d.healthcare_provider_id)
FROM default_ids d
WHERE u.company_id IS NULL 
   OR u.healthcare_provider_id IS NULL;