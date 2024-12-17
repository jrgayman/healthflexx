jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import PatientHeader from '../../components/patients/PatientHeader';
import PatientTabs from '../../components/patients/PatientTabs';
import PatientVitals from '../../components/patients/PatientVitals';
import PatientMedications from '../../components/patients/PatientMedications';
import PatientDevices from '../../components/patients/PatientDevices';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function PatientDetail() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('vitals');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPatientData();
    }
  }, [id]);

  async function fetchPatientData() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          healthcare_providers (
            id,
            name
          ),
          companies (
            id,
            name
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setPatient(data);
    } catch (error) {
      console.error('Error fetching patient:', error);
      toast.error('Failed to load patient data');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading patient data..." />;
  }

  if (!patient) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Patient Not Found</h1>
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'vitals':
        return <PatientVitals patientId={id} />;
      case 'medications':
        return <PatientMedications patientId={id} />;
      case 'devices':
        return <PatientDevices patientId={id} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link 
          to="/admin/patients"
          className="text-primary hover:text-primary-dark inline-flex items-center mb-4"
        >
          ← Back to Patients
        </Link>
        <PatientHeader patient={patient} onUpdate={fetchPatientData} />
      </div>

      <PatientTabs activeTab={activeTab} onTabChange={setActiveTab} />
      {renderTabContent()}
    </div>
  );
}