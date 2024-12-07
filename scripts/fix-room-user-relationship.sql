-- First ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop dependent views and triggers first
DROP VIEW IF EXISTS patient_details CASCADE;
DROP TRIGGER IF EXISTS trigger_check_room_capacity ON users;
DROP TRIGGER IF EXISTS trigger_update_room_occupancy ON users;
DROP FUNCTION IF EXISTS check_room_capacity CASCADE;
DROP FUNCTION IF EXISTS update_room_occupancy CASCADE;

-- Drop existing constraints
ALTER TABLE users
DROP CONSTRAINT IF EXISTS users_room_id_fkey,
DROP CONSTRAINT IF EXISTS check_room_assignment;

-- Recreate the room_id column with proper foreign key relationship
ALTER TABLE users
DROP COLUMN IF EXISTS room_id CASCADE;

ALTER TABLE users
ADD COLUMN room_id UUID REFERENCES rooms(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_room_id ON users(room_id);

-- Add constraint to ensure only patients can be assigned to rooms
ALTER TABLE users
ADD CONSTRAINT check_room_assignment
CHECK (
  (user_type = 'Patient' AND room_id IS NOT NULL) OR
  (user_type != 'Patient' AND room_id IS NULL) OR
  (room_id IS NULL)
);

-- Create function to check room capacity
CREATE OR REPLACE FUNCTION check_room_capacity()
RETURNS TRIGGER AS $$
BEGIN
  -- Only check capacity when assigning a room
  IF NEW.room_id IS NOT NULL THEN
    -- Get current occupancy and capacity
    DECLARE
      room_capacity INTEGER;
      room_occupancy INTEGER;
    BEGIN
      SELECT capacity, current_occupancy 
      INTO room_capacity, room_occupancy
      FROM rooms 
      WHERE id = NEW.room_id;

      -- For new assignments
      IF OLD.room_id IS NULL OR OLD.room_id != NEW.room_id THEN
        IF room_occupancy >= room_capacity THEN
          RAISE EXCEPTION 'Room capacity exceeded';
        END IF;
      END IF;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for capacity check
CREATE TRIGGER trigger_check_room_capacity
BEFORE INSERT OR UPDATE OF room_id ON users
FOR EACH ROW
EXECUTE FUNCTION check_room_capacity();

-- Create function to update room occupancy
CREATE OR REPLACE FUNCTION update_room_occupancy()
RETURNS TRIGGER AS $$
BEGIN
  -- If room assignment is changing
  IF OLD.room_id IS DISTINCT FROM NEW.room_id THEN
    -- Only update counts for patient type users
    IF NEW.user_type = 'Patient' THEN
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
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for room occupancy tracking
CREATE TRIGGER trigger_update_room_occupancy
AFTER UPDATE OF room_id ON users
FOR EACH ROW
EXECUTE FUNCTION update_room_occupancy();

-- Recreate patient details view
CREATE OR REPLACE VIEW patient_details AS
SELECT 
  u.id,
  u.name,
  u.email,
  u.phone,
  u.date_of_birth,
  u.gender,
  u.medical_record_number,
  u.primary_physician,
  u.emergency_contact,
  u.emergency_phone,
  u.insurance_provider,
  u.insurance_id,
  b.name as building_name,
  r.room_number,
  r.floor
FROM users u
LEFT JOIN rooms r ON u.room_id = r.id
LEFT JOIN buildings b ON r.building_id = b.id
WHERE u.user_type = 'Patient';

-- Fix any inconsistencies in current occupancy counts
UPDATE rooms r
SET current_occupancy = (
  SELECT COUNT(*)
  FROM users u
  WHERE u.room_id = r.id
  AND u.user_type = 'Patient'
);