import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import SearchBar from '../../components/SearchBar';
import FilterDropdown from '../../components/FilterDropdown';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function MedicationAdherence() {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [patients, searchTerm, statusFilter]);

  async function fetchPatients() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
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
        .eq('is_patient', true)
        .order('name');

      if (error) throw error;
      setPatients(data || []);
      setFilteredPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  }

  function filterPatients() {
    let filtered = [...patients];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(patient => 
        patient.name?.toLowerCase().includes(search) ||
        patient.medical_record_number?.toLowerCase().includes(search)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(patient => {
        if (statusFilter === 'active') {
          return patient.patient_medications?.some(med => med.active);
        }
        return true;
      });
    }

    setFilteredPatients(filtered);
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Medication Adherence</h1>
      </div>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <SearchBar 
          onSearch={setSearchTerm} 
          placeholder="Search patients..."
        />
        <FilterDropdown
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'all', label: 'All Patients' },
            { value: 'active', label: 'With Active Medications' }
          ]}
        />
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">MRN</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medications</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <tr key={patient.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img
                        src={patient.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}&background=random`}
                        alt=""
                        className="h-10 w-10 rounded-full mr-3"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}&background=random`;
                        }}
                      />
                      <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{patient.medical_record_number}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {patient.patient_medications?.length || 0} medications
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/admin/patient/${patient.id}/adherence`}
                      className="text-primary hover:text-primary-dark"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}