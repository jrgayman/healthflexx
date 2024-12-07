-- Step 1: Rename the table
ALTER TABLE healthcare_roles 
RENAME TO healthcare_roles_secondary;

-- Create index for the renamed table
CREATE INDEX IF NOT EXISTS idx_healthcare_roles_secondary_active 
ON healthcare_roles_secondary(active);