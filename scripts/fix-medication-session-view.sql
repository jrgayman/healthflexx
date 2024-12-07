-- First drop the existing view
DROP VIEW IF EXISTS medication_session_summary;

-- Recreate the view with the updated structure
CREATE VIEW medication_session_summary AS
SELECT 
  ms.id as session_id,
  ms.patient_id,
  ms.start_date,
  ms.end_date,
  ms.active,
  ms.created_at,
  ms.first_use_date,
  u.name as patient_name,
  COUNT(mtr.id) as total_doses,
  COUNT(CASE WHEN mtr.status = 'taken' THEN 1 END) as doses_taken,
  COUNT(CASE WHEN mtr.status = 'missed' THEN 1 END) as doses_missed,
  COUNT(CASE WHEN mtr.status = 'late' THEN 1 END) as doses_late,
  COUNT(CASE WHEN mtr.status = 'overtaken' THEN 1 END) as doses_overtaken,
  ROUND(
    CAST(COUNT(CASE WHEN mtr.status = 'taken' THEN 1 END) AS NUMERIC) / 
    NULLIF(COUNT(mtr.id), 0) * 100,
    2
  ) as adherence_rate
FROM medication_sessions ms
JOIN users u ON ms.patient_id = u.id
LEFT JOIN medication_tracking_records mtr ON ms.id = mtr.session_id
GROUP BY 
  ms.id,
  ms.patient_id,
  ms.start_date,
  ms.end_date,
  ms.active,
  ms.created_at,
  ms.first_use_date,
  u.name;

-- Grant permissions
GRANT SELECT ON medication_session_summary TO authenticated;