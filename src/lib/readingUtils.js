export function formatReadingValue(reading, type) {
  if (!reading) return '-';

  switch (type) {
    case 'BP':
      if (reading.systolic_value && reading.diastolic_value) {
        return `${reading.systolic_value}/${reading.diastolic_value} mmHg`;
      }
      return '-';
    case 'HR':
      return reading.numeric_value ? `${reading.numeric_value} bpm` : '-';
    case 'TEMP':
      return reading.numeric_value ? `${reading.numeric_value}°F` : '-';
    case 'SPO2':
      return reading.numeric_value ? `${reading.numeric_value}%` : '-';
    case 'WT':
      return reading.numeric_value ? `${reading.numeric_value} lb` : '-';
    case 'BG':
      return reading.numeric_value ? `${reading.numeric_value} mg/dL` : '-';
    case 'OTO':
    case 'STETH':
    case 'EKG':
    case 'MEDIA':
      return reading.file_path ? 'View' : '-';
    case 'NOTE':
      return reading.text_value ? 'View' : '-';
    default:
      return '-';
  }
}

export function formatBloodPressure(systolic, diastolic) {
  if (!systolic || !diastolic) return '-';
  return `${systolic}/${diastolic}`;
}

export function getBloodPressureColor(systolic, diastolic) {
  if (!systolic || !diastolic) return 'text-gray-500';
  
  // Normal: Systolic < 120 and Diastolic < 80
  if (systolic < 120 && diastolic < 80) {
    return 'text-green-600';
  }
  
  // Elevated: Systolic 120-129 and Diastolic < 80
  if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
    return 'text-yellow-600';
  }
  
  // Stage 1: Systolic 130-139 or Diastolic 80-89
  if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
    return 'text-orange-600';
  }
  
  // Stage 2: Systolic >= 140 or Diastolic >= 90
  if (systolic >= 140 || diastolic >= 90) {
    return 'text-red-600';
  }
  
  return 'text-gray-900';
}

export function getReadingColor(reading, type) {
  if (!reading?.numeric_value) return 'text-gray-500';
  
  const value = reading.numeric_value;
  const { normal_min, normal_max, critical_low, critical_high } = reading.reading_types || {};
  
  if (critical_low !== null && value <= critical_low) return 'text-red-600';
  if (critical_high !== null && value >= critical_high) return 'text-red-600';
  if (normal_min !== null && normal_max !== null) {
    if (value >= normal_min && value <= normal_max) return 'text-green-600';
    if (value < normal_min) return 'text-orange-600';
    if (value > normal_max) return 'text-orange-600';
  }
  
  return 'text-gray-900';
}

export function formatStatValue(value, type) {
  if (typeof value !== 'number') return '-';
  return value.toFixed(1);
}