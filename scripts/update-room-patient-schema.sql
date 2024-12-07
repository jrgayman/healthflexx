-- First ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add room relationship to users table if not exists
ALTER TABLE users
ADD COLUMN IF NOT EXISTS room_id UUID REFERENCES rooms(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_room_id ON users(room_id);

-- Add constraint to ensure only patients can be assigned to rooms
ALTER TABLE users
DROP CONSTRAINT IF EXISTS check_room_assignment;

ALTER TABLE users
ADD CONSTRAINT check_room_assignment
CHECK (
  (user_type = 'Patient' AND room_id IS NOT NULL) OR
  (user_type != 'Patient' AND room_id IS NULL) OR
  (room_id IS NULL)
);

-- Add room occupancy tracking to rooms table
ALTER TABLE rooms
ADD COLUMN IF NOT EXISTS current_occupancy INTEGER DEFAULT 0;

-- Create function to update room occupancy
CREATE OR REPLACE FUNCTION update_room_occupancy()
RETURNS TRIGGER AS $$
BEGIN
  -- If room assignment is changing
  IF OLD.room_id IS DISTINCT FROM NEW.room_id THEN
    -- Decrement old room's occupancy if exists
    IF OLD.room_id IS NOT NULL THEN
      UPDATE rooms 
      SET current_occupancy = current_occupancy - 1
      WHERE id = OLD.room_id;
    END IF;
    
    -- Increment new room's occupancy if exists
    IF NEW.room_id IS NOT NULL THEN
      UPDATE rooms 
      SET current_occupancy = current_occupancy + 1
      WHERE id = NEW.room_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for room occupancy tracking
DROP TRIGGER IF EXISTS trigger_update_room_occupancy ON users;
CREATE TRIGGER trigger_update_room_occupancy
AFTER UPDATE OF room_id ON users
FOR EACH ROW
EXECUTE FUNCTION update_room_occupancy();

-- Create view for room occupancy details
CREATE OR REPLACE VIEW room_occupancy_details AS
SELECT 
  r.id as room_id,
  r.room_number,
  r.name as room_name,
  r.floor,
  r.capacity,
  r.current_occupancy,
  b.name as building_name,
  COUNT(u.id) as actual_occupancy,
  ARRAY_AGG(
    CASE 
      WHEN u.id IS NOT NULL 
      THEN jsonb_build_object(
        'id', u.id,
        'name', u.name,
        'medical_record_number', u.medical_record_number
      )
      ELSE NULL 
    END
  ) FILTER (WHERE u.id IS NOT NULL) as patients
FROM rooms r
LEFT JOIN buildings b ON r.building_id = b.id
LEFT JOIN users u ON r.id = u.room_id AND u.user_type = 'Patient'
GROUP BY r.id, r.room_number, r.name, r.floor, r.capacity, r.current_occupancy, b.name;

-- Add constraint to prevent exceeding room capacity
ALTER TABLE users
DROP CONSTRAINT IF EXISTS check_room_capacity;

ALTER TABLE users
ADD CONSTRAINT check_room_capacity
CHECK (
  room_id IS NULL OR
  (
    SELECT current_occupancy <= capacity 
    FROM rooms 
    WHERE id = room_id
  )
);

-- Fix any inconsistencies in current occupancy counts
UPDATE rooms r
SET current_occupancy = (
  SELECT COUNT(*)
  FROM users u
  WHERE u.room_id = r.id
  AND u.user_type = 'Patient'
);