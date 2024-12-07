-- First ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Update rooms table structure
ALTER TABLE rooms
ALTER COLUMN room_number SET NOT NULL,
ALTER COLUMN name DROP NOT NULL,
ALTER COLUMN floor DROP NOT NULL,
ALTER COLUMN capacity DROP NOT NULL;

-- Add building_id foreign key with cascade delete
ALTER TABLE rooms
DROP CONSTRAINT IF EXISTS rooms_building_id_fkey,
ADD CONSTRAINT rooms_building_id_fkey
FOREIGN KEY (building_id)
REFERENCES buildings(id)
ON DELETE CASCADE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_rooms_building ON rooms(building_id);
CREATE INDEX IF NOT EXISTS idx_rooms_room_number ON rooms(room_number);
CREATE INDEX IF NOT EXISTS idx_rooms_active ON rooms(active);

-- Create unique constraint for room numbers within a building
ALTER TABLE rooms
DROP CONSTRAINT IF EXISTS unique_room_number_per_building,
ADD CONSTRAINT unique_room_number_per_building
UNIQUE (building_id, room_number);