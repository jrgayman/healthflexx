-- First ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create medication sessions table
CREATE TABLE IF NOT EXISTS medication_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES users(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create medication session details table
CREATE TABLE IF NOT EXISTS medication_session_details (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES medication_sessions(id),
  medication_id UUID NOT NULL REFERENCES medications(id),
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  time_slots TIME[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create medication tracking records table
CREATE TABLE IF NOT EXISTS medication_tracking_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_detail_id UUID NOT NULL REFERENCES medication_session_details(id),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  taken_at TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('pending', 'taken', 'missed', 'late')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_med_sessions_patient ON medication_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_med_sessions_dates ON medication_sessions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_med_sessions_active ON medication_sessions(active);

CREATE INDEX IF NOT EXISTS idx_med_session_details_session ON medication_session_details(session_id);
CREATE INDEX IF NOT EXISTS idx_med_session_details_medication ON medication_session_details(medication_id);

CREATE INDEX IF NOT EXISTS idx_med_tracking_detail ON medication_tracking_records(session_detail_id);
CREATE INDEX IF NOT EXISTS idx_med_tracking_date ON medication_tracking_records(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_med_tracking_status ON medication_tracking_records(status);

-- Create view for session summary
CREATE OR REPLACE VIEW medication_session_summary AS
WITH tracking_stats AS (
  SELECT 
    msd.session_id,
    msd.medication_id,
    COUNT(mtr.id) as total_doses,
    COUNT(CASE WHEN mtr.status = 'taken' THEN 1 END) as doses_taken,
    COUNT(CASE WHEN mtr.status = 'missed' THEN 1 END) as doses_missed,
    COUNT(CASE WHEN mtr.status = 'late' THEN 1 END) as doses_late
  FROM medication_session_details msd
  LEFT JOIN medication_tracking_records mtr ON msd.id = mtr.session_detail_id
  GROUP BY msd.session_id, msd.medication_id
)
SELECT 
  ms.id as session_id,
  ms.patient_id,
  u.name as patient_name,
  ms.start_date,
  ms.end_date,
  ms.active,
  JSONB_AGG(
    JSONB_BUILD_OBJECT(
      'medication_id', m.id,
      'brand_name', m.brand_name,
      'generic_name', m.generic_name,
      'dosage', msd.dosage,
      'frequency', msd.frequency,
      'time_slots', msd.time_slots,
      'total_doses', COALESCE(ts.total_doses, 0),
      'doses_taken', COALESCE(ts.doses_taken, 0),
      'doses_missed', COALESCE(ts.doses_missed, 0),
      'doses_late', COALESCE(ts.doses_late, 0),
      'adherence_rate', CASE 
        WHEN COALESCE(ts.total_doses, 0) > 0 
        THEN ROUND(COALESCE(ts.doses_taken, 0)::NUMERIC / ts.total_doses * 100, 2)
        ELSE 0
      END
    )
  ) as medications
FROM medication_sessions ms
JOIN users u ON ms.patient_id = u.id
JOIN medication_session_details msd ON ms.id = msd.session_id
JOIN medications m ON msd.medication_id = m.id
LEFT JOIN tracking_stats ts ON ms.id = ts.session_id AND msd.medication_id = ts.medication_id
GROUP BY ms.id, ms.patient_id, u.name, ms.start_date, ms.end_date, ms.active;

-- Grant permissions
GRANT ALL ON medication_sessions TO authenticated;
GRANT ALL ON medication_session_details TO authenticated;
GRANT ALL ON medication_tracking_records TO authenticated;
GRANT ALL ON medication_session_summary TO authenticated;