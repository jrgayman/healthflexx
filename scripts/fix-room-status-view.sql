-- Drop existing view if it exists
DROP VIEW IF EXISTS room_status_with_rfid CASCADE;

-- Create or replace the room status view
CREATE OR REPLACE VIEW room_status_with_rfid AS
SELECT 
  r.id,
  r.building_id,
  r.room_number,
  r.name as room_name,
  r.floor,
  r.active,
  u.id as patient_id,
  u.name as patient_name,
  rt.id as tag_id,
  rt.status,
  rt.last_changed,
  rt.last_scanned
FROM rooms r
LEFT JOIN users u ON r.id = u.room_id
LEFT JOIN rfid_tags rt ON u.id = rt.user_id AND rt.active = true
WHERE r.active = true
ORDER BY r.floor, r.room_number;

-- Grant necessary permissions
GRANT ALL ON room_status_with_rfid TO authenticated;
GRANT ALL ON room_status_with_rfid TO anon;