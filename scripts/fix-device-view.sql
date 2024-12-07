-- Drop existing view
DROP VIEW IF EXISTS device_details;

-- Recreate view with proper image handling
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
  d.image_url,
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
GRANT ALL ON device_details TO authenticated;
GRANT ALL ON device_details TO anon;