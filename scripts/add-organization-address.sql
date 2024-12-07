-- Add address fields to organizations table
ALTER TABLE organizations
ADD COLUMN address TEXT,
ADD COLUMN city TEXT,
ADD COLUMN state TEXT,
ADD COLUMN zip TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_organizations_city ON organizations(city);
CREATE INDEX IF NOT EXISTS idx_organizations_state ON organizations(state);
CREATE INDEX IF NOT EXISTS idx_organizations_zip ON organizations(zip);