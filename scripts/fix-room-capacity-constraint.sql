-- First, drop the invalid constraint if it exists
ALTER TABLE users
DROP CONSTRAINT IF EXISTS check_room_capacity;

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
DROP TRIGGER IF EXISTS trigger_check_room_capacity ON users;
CREATE TRIGGER trigger_check_room_capacity
BEFORE INSERT OR UPDATE OF room_id ON users
FOR EACH ROW
EXECUTE FUNCTION check_room_capacity();

-- Update room occupancy function to maintain accurate counts
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

-- Recreate trigger for room occupancy tracking
DROP TRIGGER IF EXISTS trigger_update_room_occupancy ON users;
CREATE TRIGGER trigger_update_room_occupancy
AFTER UPDATE OF room_id ON users
FOR EACH ROW
EXECUTE FUNCTION update_room_occupancy();

-- Fix any inconsistencies in current occupancy counts
UPDATE rooms r
SET current_occupancy = (
  SELECT COUNT(*)
  FROM users u
  WHERE u.room_id = r.id
  AND u.user_type = 'Patient'
);