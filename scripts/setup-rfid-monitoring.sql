-- First ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create RFID tags table
CREATE TABLE IF NOT EXISTS rfid_tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tag_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES users(id),
  status TEXT CHECK (status IN ('dry', 'wet', 'no_detection')) DEFAULT 'no_detection',
  last_changed TIMESTAMPTZ DEFAULT NOW(),
  last_scanned TIMESTAMPTZ DEFAULT NOW(),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RFID readings table for history
CREATE TABLE IF NOT EXISTS rfid_readings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tag_id UUID REFERENCES rfid_tags(id),
  room_id UUID REFERENCES rooms(id),
  status TEXT NOT NULL CHECK (status IN ('dry', 'wet', 'no_detection')),
  scanned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_rfid_tags_user ON rfid_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_rfid_tags_status ON rfid_tags(status);
CREATE INDEX IF NOT EXISTS idx_rfid_tags_active ON rfid_tags(active);
CREATE INDEX IF NOT EXISTS idx_rfid_readings_tag ON rfid_readings(tag_id);
CREATE INDEX IF NOT EXISTS idx_rfid_readings_room ON rfid_readings(room_id);
CREATE INDEX IF NOT EXISTS idx_rfid_readings_time ON rfid_readings(scanned_at);

-- Create function to update tag status
CREATE OR REPLACE FUNCTION update_tag_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update last_changed only if status changed
  IF NEW.status != OLD.status THEN
    NEW.last_changed = NOW();
  END IF;
  
  -- Always update last_scanned and updated_at
  NEW.last_scanned = NOW();
  NEW.updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for tag status updates
DROP TRIGGER IF EXISTS trigger_update_tag_status ON rfid_tags;
CREATE TRIGGER trigger_update_tag_status
  BEFORE UPDATE OF status ON rfid_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_tag_status();

-- Create view for room status with RFID data
CREATE OR REPLACE VIEW room_status_with_rfid AS
SELECT 
  r.id as room_id,
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
GRANT ALL ON rfid_tags TO authenticated;
GRANT ALL ON rfid_tags TO anon;
GRANT ALL ON rfid_readings TO authenticated;
GRANT ALL ON rfid_readings TO anon;
GRANT ALL ON room_status_with_rfid TO authenticated;
GRANT ALL ON room_status_with_rfid TO anon;