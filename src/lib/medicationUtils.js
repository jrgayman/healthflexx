import axios from 'axios';

export async function fetchFDAMedications(searchTerm = '') {
  try {
    const response = await axios.get(
      `https://api.fda.gov/drug/ndc.json?search=${encodeURIComponent(searchTerm)}&limit=100`
    );
    return response.data.results;
  } catch (error) {
    console.error('Error fetching FDA medications:', error);
    throw error;
  }
}

export function formatMedicationFrequency(frequency) {
  const frequencies = {
    'qd': 'Once daily',
    'bid': 'Twice daily',
    'tid': 'Three times daily',
    'qid': 'Four times daily',
    'q4h': 'Every 4 hours',
    'q6h': 'Every 6 hours',
    'q8h': 'Every 8 hours',
    'q12h': 'Every 12 hours',
    'qhs': 'At bedtime',
    'prn': 'As needed'
  };
  return frequencies[frequency.toLowerCase()] || frequency;
}

export function formatMedicationDosage(dosage, unit) {
  if (!dosage) return '-';
  return `${dosage}${unit ? ` ${unit}` : ''}`;
}