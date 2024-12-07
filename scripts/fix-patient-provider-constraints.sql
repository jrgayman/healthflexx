-- Add constraint to ensure patients belong to the correct provider
ALTER TABLE patients
DROP CONSTRAINT IF EXISTS check_patient_provider,
ADD CONSTRAINT check_patient_provider
CHECK (
  (room_id IS NULL) OR
  (
    room_id IN (
      SELECT r.id 
      FROM rooms r 
      JOIN buildings b ON r.building_id = b.id 
      WHERE b.healthcare_provider_id = healthcare_provider_id
    )
  )
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_patients_provider_room 
ON patients(healthcare_provider_id, room_id);