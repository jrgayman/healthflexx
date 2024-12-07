-- First, drop existing constraints
ALTER TABLE rooms
DROP CONSTRAINT IF EXISTS check_room_capacity;

-- Fix any inconsistencies in occupancy counts
UPDATE rooms r
SET current_occupancy = (
  SELECT COUNT(*)
  FROM users u
  WHERE u.room_id = r.id
);

-- Set NULL capacity to a reasonable default based on current occupancy
UPDATE rooms
SET capacity = GREATEST(current_occupancy, 1)
WHERE capacity IS NULL;

-- Now add the constraint back
ALTER TABLE rooms
ADD CONSTRAINT check_room_capacity
CHECK (current_occupancy <= capacity);

-- Create or replace the room assignment function
CREATE OR REPLACE FUNCTION update_room_occupancy()
RETURNS TRIGGER AS $$
BEGIN
  -- If room assignment is changing
  IF OLD.room_id IS DISTINCT FROM NEW.room_id THEN
    -- Decrement old room's occupancy if exists
    IF OLD.room_id IS NOT NULL THEN
      UPDATE rooms 
      SET current_occupancy = GREATEST(0, current_occupancy - 1)
      WHERE id = OLD.room_id;
    END IF;
    
    -- Increment new room's occupancy if exists
    IF NEW.room_id IS NOT NULL THEN
      -- Check capacity before incrementing
      IF EXISTS (
        SELECT 1 FROM rooms 
        WHERE id = NEW.room_id 
        AND current_occupancy < capacity
      ) THEN
        UPDATE rooms 
        SET current_occupancy = current_occupancy + 1
        WHERE id = NEW.room_id;
      ELSE
        RAISE EXCEPTION 'Room capacity exceeded';
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
DROP TRIGGER IF EXISTS trigger_update_room_occupancy ON users;
CREATE TRIGGER trigger_update_room_occupancy
BEFORE UPDATE OF room_id ON users
FOR EACH ROW
EXECUTE FUNCTION update_room_occupancy();