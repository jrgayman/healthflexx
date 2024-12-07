import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pmmkfrohclzpwpnbtajc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbWtmcm9oY2x6cHdwbmJ0YWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4MTM4MDYsImV4cCI6MjA0NjM4OTgwNn0.2m8L21ploy11YBpO3Wf0Qv7uZ243oIqA2PP9DuaR0As';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupMedicationMonitoring() {
  try {
    console.log('Setting up medication monitoring system...');

    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- First ensure we have the UUID extension
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        -- Create medication monitoring devices table
        CREATE TABLE IF NOT EXISTS medication_monitoring_devices (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          device_name TEXT NOT NULL,
          serial_number TEXT NOT NULL UNIQUE,
          mac_address TEXT UNIQUE,
          manufacturer TEXT,
          model TEXT,
          firmware_version TEXT,
          active BOOLEAN DEFAULT true,
          user_id UUID REFERENCES users(id),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create patient medications table
        CREATE TABLE IF NOT EXISTS patient_medications (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(id),
          medication_id UUID NOT NULL REFERENCES medications(id),
          device_id UUID REFERENCES medication_monitoring_devices(id),
          dosage TEXT NOT NULL,
          frequency TEXT NOT NULL,
          start_date DATE NOT NULL,
          end_date DATE,
          instructions TEXT,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create medication adherence readings table
        CREATE TABLE IF NOT EXISTS medication_adherence_readings (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          device_id UUID NOT NULL REFERENCES medication_monitoring_devices(id),
          patient_medication_id UUID NOT NULL REFERENCES patient_medications(id),
          taken_at TIMESTAMPTZ NOT NULL,
          scheduled_for TIMESTAMPTZ NOT NULL,
          status TEXT NOT NULL CHECK (status IN ('taken', 'missed', 'late')),
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create indexes for better query performance
        CREATE INDEX IF NOT EXISTS idx_med_monitoring_devices_serial ON medication_monitoring_devices(serial_number);
        CREATE INDEX IF NOT EXISTS idx_med_monitoring_devices_mac ON medication_monitoring_devices(mac_address);
        CREATE INDEX IF NOT EXISTS idx_med_monitoring_devices_user ON medication_monitoring_devices(user_id);
        CREATE INDEX IF NOT EXISTS idx_med_monitoring_devices_active ON medication_monitoring_devices(active);

        CREATE INDEX IF NOT EXISTS idx_patient_medications_user ON patient_medications(user_id);
        CREATE INDEX IF NOT EXISTS idx_patient_medications_medication ON patient_medications(medication_id);
        CREATE INDEX IF NOT EXISTS idx_patient_medications_device ON patient_medications(device_id);
        CREATE INDEX IF NOT EXISTS idx_patient_medications_active ON patient_medications(active);

        CREATE INDEX IF NOT EXISTS idx_med_adherence_readings_device ON medication_adherence_readings(device_id);
        CREATE INDEX IF NOT EXISTS idx_med_adherence_readings_medication ON medication_adherence_readings(patient_medication_id);
        CREATE INDEX IF NOT EXISTS idx_med_adherence_readings_taken ON medication_adherence_readings(taken_at);
        CREATE INDEX IF NOT EXISTS idx_med_adherence_readings_scheduled ON medication_adherence_readings(scheduled_for);

        -- Create view for medication adherence summary
        CREATE OR REPLACE VIEW medication_adherence_summary AS
        SELECT 
          pm.id as prescription_id,
          u.id as user_id,
          u.name as patient_name,
          m.brand_name as medication_name,
          m.generic_name,
          pm.dosage,
          pm.frequency,
          mmd.manufacturer as device_manufacturer,
          mmd.serial_number as device_serial,
          COUNT(mar.id) as total_readings,
          SUM(CASE WHEN mar.status = 'taken' THEN 1 ELSE 0 END) as doses_taken,
          SUM(CASE WHEN mar.status = 'missed' THEN 1 ELSE 0 END) as doses_missed,
          SUM(CASE WHEN mar.status = 'late' THEN 1 ELSE 0 END) as doses_late,
          ROUND(
            (SUM(CASE WHEN mar.status = 'taken' THEN 1 ELSE 0 END)::NUMERIC / 
            NULLIF(COUNT(mar.id), 0)::NUMERIC * 100), 
            2
          ) as adherence_rate
        FROM patient_medications pm
        JOIN users u ON pm.user_id = u.id
        JOIN medications m ON pm.medication_id = m.id
        LEFT JOIN medication_monitoring_devices mmd ON pm.device_id = mmd.id
        LEFT JOIN medication_adherence_readings mar ON pm.id = mar.patient_medication_id
        WHERE pm.active = true
        GROUP BY 
          pm.id,
          u.id,
          u.name,
          m.brand_name,
          m.generic_name,
          pm.dosage,
          pm.frequency,
          mmd.manufacturer,
          mmd.serial_number;

        -- Grant necessary permissions
        GRANT ALL ON medication_monitoring_devices TO authenticated;
        GRANT ALL ON medication_monitoring_devices TO anon;
        GRANT ALL ON patient_medications TO authenticated;
        GRANT ALL ON patient_medications TO anon;
        GRANT ALL ON medication_adherence_readings TO authenticated;
        GRANT ALL ON medication_adherence_readings TO anon;
        GRANT ALL ON medication_adherence_summary TO authenticated;
        GRANT ALL ON medication_adherence_summary TO anon;
      `
    });

    if (error) throw error;
    console.log('Medication monitoring system setup completed successfully!');
    return true;
  } catch (error) {
    console.error('Error setting up medication monitoring:', error);
    return false;
  }
}

setupMedicationMonitoring()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));