import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import PatientHeader from '../../components/PatientHeader';
import AddMedicationModal from '../../components/medications/AddMedicationModal';
import AddDeviceModal from '../../components/medications/AddDeviceModal';
import ReadingFilters from '../../components/ReadingFilters';
import ReadingsGrid from '../../components/readings/ReadingsGrid';
import toast from 'react-hot-toast';

export default function Patient() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [medications, setMedications] = useState([]);
  const [devices, setDevices] = useState([]);
  const [readings, setReadings] = useState([]);
  const [readingTypes, setReadingTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('vitals');
  const [isAddingMedication, setIsAddingMedication] = useState(false);
  const [isAddingDevice, setIsAddingDevice] = useState(false);
  const [readingTypeFilter, setReadingTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('month');

  useEffect(() => {
    if (id) {
      fetchPatientData();
      fetchReadingTypes();
    }
  }, [id]);

  useEffect(() => {
    if (id && activeSection === 'vitals') {
      fetchReadings();
    }
  }, [id, readingTypeFilter, dateFilter, activeSection]);

  async function fetchPatientData() {
    try {
      // Fetch patient details
      const { data: patientData, error: patientError } = await supabase
        .from('users')
        .select(`
          *,
          healthcare_providers (
            id,
            name
          ),
          patient_medications (
            id,
            medication_id,
            medications (
              id,
              brand_name,
              generic_name
            )
          )
        `)
        .eq('id', id)
        .single();

      if (patientError) throw patientError;
      setPatient(patientData);

      // Fetch patient's medications
      const { data: medData, error: medError } = await supabase
        .from('patient_medications')
        .select(`
          *,
          medications (
            id,
            brand_name,
            generic_name
          )
        `)
        .eq('user_id', id)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (medError) throw medError;
      setMedications(medData || []);

      // Fetch patient's devices
      const { data: deviceData, error: deviceError } = await supabase
        .from('devices')
        .select(`
          *,
          device_types (
            id,
            name,
            classification_id,
            device_classifications (
              id,
              name
            )
          )
        `)
        .eq('user_id', id)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (deviceError) throw deviceError;
      setDevices(deviceData || []);
    } catch (error) {
      console.error('Error fetching patient data:', error);
      toast.error('Failed to load patient data');
    } finally {
      setLoading(false);
    }
  }

  async function fetchReadingTypes() {
    try {
      const { data, error } = await supabase
        .from('reading_types')
        .select('*')
        .order('name');

      if (error) throw error;
      setReadingTypes(data || []);
    } catch (error) {
      console.error('Error fetching reading types:', error);
      toast.error('Failed to load reading types');
    }
  }

  async function fetchReadings() {
    try {
      let query = supabase
        .from('medical_readings')
        .select(`
          *,
          reading_types (
            id,
            name,
            code,
            unit,
            value_type,
            icon,
            normal_min,
            normal_max,
            critical_low,
            critical_high
          )
        `)
        .eq('user_id', id)
        .order('reading_date', { ascending: false });

      if (readingTypeFilter) {
        query = query.eq('reading_type_id', readingTypeFilter);
      }

      // Apply date filter
      const now = new Date();
      let startDate = new Date();

      switch (dateFilter) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        query = query.gte('reading_date', startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      setReadings(data || []);
    } catch (error) {
      console.error('Error fetching readings:', error);
      toast.error('Failed to load readings');
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading patient data...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Patient Not Found</h1>
          <p className="text-gray-600 mb-8">The patient you're looking for doesn't exist.</p>
          <Link
            to="/admin/patients"
            className="text-primary hover:text-primary-dark"
          >
            ← Back to Patients
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-start mb-8">
        <div className="flex-1">
          <PatientHeader patient={patient} />
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setIsAddingMedication(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark flex items-center"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            Add Medication
          </button>
          <button
            onClick={() => setIsAddingDevice(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark flex items-center"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            Add Device
          </button>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveSection('vitals')}
          className={`px-4 py-2 rounded-lg ${
            activeSection === 'vitals'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Vitals
        </button>
        <button
          onClick={() => setActiveSection('medications')}
          className={`px-4 py-2 rounded-lg ${
            activeSection === 'medications'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Medications
        </button>
        <button
          onClick={() => setActiveSection('devices')}
          className={`px-4 py-2 rounded-lg ${
            activeSection === 'devices'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Devices
        </button>
        <button
          onClick={() => setActiveSection('staff')}
          className={`px-4 py-2 rounded-lg ${
            activeSection === 'staff'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Medical Staff
        </button>
        <button
          onClick={() => setActiveSection('contacts')}
          className={`px-4 py-2 rounded-lg ${
            activeSection === 'contacts'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Contacts
        </button>
      </div>

      {/* Vitals Section */}
      {activeSection === 'vitals' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Medical Readings</h2>
          <ReadingFilters
            readingTypeFilter={readingTypeFilter}
            onReadingTypeChange={setReadingTypeFilter}
            dateFilter={dateFilter}
            onDateChange={setDateFilter}
            readingTypes={readingTypes}
          />
          <ReadingsGrid 
            readings={readings}
            readingTypes={readingTypes}
          />
        </div>
      )}

      {/* Medications Section */}
      {activeSection === 'medications' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Medications</h2>
          {medications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medication</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dosage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {medications.map((med) => (
                    <tr key={med.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {med.medications.brand_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {med.medications.generic_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{med.dosage}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{med.frequency}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(med.start_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {med.end_date ? new Date(med.end_date).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center">No medications assigned yet.</p>
          )}
        </div>
      )}

      {/* Devices Section */}
      {activeSection === 'devices' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Assigned Devices</h2>
          {devices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serial Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">MAC Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {devices.map((device) => (
                    <tr key={device.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {device.device_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {device.device_types?.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {device.device_types?.device_classifications?.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {device.serial_number || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {device.mac_address || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {device.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center">No devices assigned yet.</p>
          )}
        </div>
      )}

      {/* Medical Staff Section */}
      {activeSection === 'staff' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Medical Staff</h2>
          <p className="text-gray-500 text-center">Medical staff assignments coming soon.</p>
        </div>
      )}

      {/* Contacts Section */}
      {activeSection === 'contacts' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Emergency Contacts</h2>
          <p className="text-gray-500 text-center">Contact management coming soon.</p>
        </div>
      )}

      {/* Modals */}
      <AddMedicationModal
        isOpen={isAddingMedication}
        onClose={() => setIsAddingMedication(false)}
        patientId={id}
        onMedicationAdded={fetchPatientData}
      />

      <AddDeviceModal
        isOpen={isAddingDevice}
        onClose={() => setIsAddingDevice(false)}
        patientId={id}
        onDeviceAdded={fetchPatientData}
      />
    </div>
  );
}