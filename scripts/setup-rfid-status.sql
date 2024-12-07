-- Create RFID status table
CREATE TABLE IF NOT EXISTS rfid_status (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert status types
INSERT INTO rfid_status (code, name, color) 
VALUES 
  ('dry', 'No Wetness Detected', '#79B6B9'),
  ('wet', 'Wetness Detected', '#FF0000'),
  ('no_detection', 'No Sensor In Range', '#FF8C00')
ON CONFLICT (code) DO UPDATE 
SET 
  name = EXCLUDED.name,
  color = EXCLUDED.color;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_rfid_status_code ON rfid_status(code);