-- Drop existing view
DROP VIEW IF EXISTS device_details;

-- Add image URL columns if they don't exist
ALTER TABLE device_classifications
ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE device_types 
ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE devices
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create storage for device images if it doesn't exist
CREATE TABLE IF NOT EXISTS device_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  storage_path TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL,
  size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_device_images_storage_path ON device_images(storage_path);

-- Recreate device details view
CREATE OR REPLACE VIEW device_details AS
SELECT 
  d.id,
  d.device_name,
  d.manufacturer,
  d.model,
  d.serial_number,
  d.mac_address,
  d.notes,
  d.active,
  d.image_url as device_image_url,
  dt.name as device_type,
  dt.image_url as type_image_url,
  dc.name as classification,
  dc.image_url as classification_image_url,
  u.id as user_id,
  u.name as user_name,
  u.medical_record_number,
  hp.name as provider_name,
  c.name as organization_name
FROM devices d
JOIN device_types dt ON d.device_type_id = dt.id
JOIN device_classifications dc ON dt.classification_id = dc.id
LEFT JOIN users u ON d.user_id = u.id
LEFT JOIN healthcare_providers hp ON u.healthcare_provider_id = hp.id
LEFT JOIN companies c ON u.company_id = c.id;

-- Grant permissions
GRANT ALL ON device_images TO authenticated;
GRANT ALL ON device_images TO anon;
GRANT ALL ON device_details TO authenticated;
GRANT ALL ON device_details TO anon;