import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = 'https://pmmkfrohclzpwpnbtajc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbWtmcm9oY2x6cHdwbmJ0YWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4MTM4MDYsImV4cCI6MjA0NjM4OTgwNn0.2m8L21ploy11YBpO3Wf0Qv7uZ243oIqA2PP9DuaR0As';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    // Execute the SQL commands
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- First ensure we have the UUID extension
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        -- Create reading types table
        DROP TABLE IF EXISTS medical_readings CASCADE;
        DROP TABLE IF EXISTS reading_types CASCADE;

        CREATE TABLE reading_types (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          code TEXT NOT NULL UNIQUE,
          unit TEXT,
          value_type TEXT NOT NULL CHECK (value_type IN ('numeric', 'text', 'image', 'audio', 'pdf', 'media')),
          description TEXT,
          icon TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create indexes
        CREATE INDEX idx_reading_types_code ON reading_types(code);

        -- Insert reading types
        INSERT INTO reading_types (
          name, code, unit, value_type, 
          description, icon
        ) VALUES 
          ('Blood Pressure Systolic', 'BPS', 'mmHg', 'numeric', 'Systolic blood pressure reading', '🫀'),
          ('Blood Pressure Diastolic', 'BPD', 'mmHg', 'numeric', 'Diastolic blood pressure reading', '🫀'),
          ('Heart Rate', 'HR', 'bpm', 'numeric', 'Heart rate in beats per minute', '💓'),
          ('Temperature', 'TEMP', '°F', 'numeric', 'Body temperature in Fahrenheit', '🌡️'),
          ('Blood Oxygen', 'SPO2', '%', 'numeric', 'Blood oxygen saturation level', '💨'),
          ('Weight', 'WT', 'lb', 'numeric', 'Body weight in pounds', '⚖️'),
          ('Blood Glucose', 'BG', 'mg/dL', 'numeric', 'Blood glucose level', '🩸'),
          ('Otoscope', 'OTO', NULL, 'image', 'Otoscope examination images', '👂'),
          ('Stethoscope', 'STETH', NULL, 'audio', 'Stethoscope audio recordings', '🔊'),
          ('EKG', 'EKG', NULL, 'pdf', 'Electrocardiogram readings', '💗'),
          ('Pic/Video', 'MEDIA', NULL, 'media', 'Medical pictures or videos', '📸'),
          ('Notes', 'NOTE', NULL, 'text', 'Clinical notes and observations', '📝')
        ON CONFLICT (code) DO UPDATE
        SET
          name = EXCLUDED.name,
          unit = EXCLUDED.unit,
          value_type = EXCLUDED.value_type,
          description = EXCLUDED.description,
          icon = EXCLUDED.icon;

        -- Create medical readings table
        CREATE TABLE medical_readings (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          reading_type_id UUID NOT NULL REFERENCES reading_types(id),
          reading_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          numeric_value DECIMAL,
          text_value TEXT,
          file_path TEXT,
          file_type TEXT,
          file_size INTEGER,
          file_name TEXT,
          notes TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          created_by UUID REFERENCES users(id)
        );

        -- Create indexes for better query performance
        CREATE INDEX idx_medical_readings_user ON medical_readings(user_id);
        CREATE INDEX idx_medical_readings_type ON medical_readings(reading_type_id);
        CREATE INDEX idx_medical_readings_date ON medical_readings(reading_date);
        CREATE INDEX idx_medical_readings_created_by ON medical_readings(created_by);

        -- Create simple view for readings
        CREATE OR REPLACE VIEW patient_readings AS
        SELECT 
          mr.*,
          rt.name as reading_name,
          rt.code as reading_code,
          rt.unit as reading_unit,
          rt.value_type,
          rt.icon as reading_icon,
          u.name as patient_name,
          u.medical_record_number
        FROM medical_readings mr
        JOIN reading_types rt ON mr.reading_type_id = rt.id
        JOIN users u ON mr.user_id = u.id
        ORDER BY mr.reading_date DESC;
      `
    });

    if (error) throw error;
    console.log('Database setup completed successfully!');
    return true;
  } catch (error) {
    console.error('Error setting up database:', error);
    return false;
  }
}

setupDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));