-- Drop existing views first
DROP VIEW IF EXISTS device_details CASCADE;

-- Create storage bucket for device images if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('device-images', 'Device Images', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Add image URL columns if they don't exist
ALTER TABLE device_classifications
ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE device_types 
ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE devices
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create function to generate public URL
CREATE OR REPLACE FUNCTION generate_device_image_url(storage_path TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE 
    WHEN storage_path IS NULL THEN NULL
    ELSE 'https://pmmkfrohclzpwpnbtajc.supabase.co/storage/v1/object/public/device-images/' || storage_path
  END;
END;
$$ LANGUAGE plpgsql;

-- Recreate device details view with proper image URLs
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
  COALESCE(d.image_url, generate_device_image_url(d.storage_path)) as image_url,
  dt.name as device_type,
  COALESCE(dt.image_url, generate_device_image_url(dt.storage_path)) as type_image_url,
  dc.name as classification,
  COALESCE(dc.image_url, generate_device_image_url(dc.storage_path)) as classification_image_url,
  u.id as user_id,
  u.name as user_name,
  u.medical_record_number,
  hp.name as provider_name,
  c.name as organization_name,
  d.created_at
FROM devices d
JOIN device_types dt ON d.device_type_id = dt.id
JOIN device_classifications dc ON dt.classification_id = dc.id
LEFT JOIN users u ON d.user_id = u.id
LEFT JOIN healthcare_providers hp ON u.healthcare_provider_id = hp.id
LEFT JOIN companies c ON u.company_id = c.id;

-- Create storage policies
CREATE POLICY "Device Images Access"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'device-images');

-- Grant permissions
GRANT ALL ON device_details TO authenticated;
GRANT ALL ON device_details TO anon;