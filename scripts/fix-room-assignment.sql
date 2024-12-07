-- Drop existing room-related constraints
ALTER TABLE users
DROP CONSTRAINT IF EXISTS check_room_assignment;

-- Add new room assignment constraint that checks for Patient role
ALTER TABLE users
ADD CONSTRAINT check_room_assignment
CHECK (
  room_id IS NULL OR
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN healthcare_roles hr ON ur.role_id = hr.id
    WHERE ur.user_id = users.id
    AND hr.name = 'Patient'
  )
);

-- Update room occupancy view to use user roles
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
  ) FILTER (WHERE u.id IS NOT NULL) as users
FROM rooms r
LEFT JOIN buildings b ON r.building_id = b.id
LEFT JOIN users u ON r.id = u.room_id
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN healthcare_roles hr ON ur.role_id = hr.id AND hr.name = 'Patient'
GROUP BY r.id, r.room_number, r.name, r.floor, r.capacity, r.current_occupancy, b.name;

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

-- Fix any inconsistencies in current occupancy counts
UPDATE rooms r
SET current_occupancy = (
  SELECT COUNT(*)
  FROM users u
  JOIN user_roles ur ON u.id = ur.user_id
  JOIN healthcare_roles hr ON ur.role_id = hr.id
  WHERE u.room_id = r.id
  AND hr.name = 'Patient'
);