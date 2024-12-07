-- Drop and recreate companies table with optional fields
ALTER TABLE companies
ALTER COLUMN industry DROP NOT NULL,
ALTER COLUMN tax_id DROP NOT NULL,
ALTER COLUMN contact_email DROP NOT NULL,
ALTER COLUMN contact_phone DROP NOT NULL,
ALTER COLUMN website DROP NOT NULL,
ALTER COLUMN healthcare_provider_id DROP NOT NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_healthcare_provider ON companies(healthcare_provider_id);
CREATE INDEX IF NOT EXISTS idx_companies_active ON companies(active);