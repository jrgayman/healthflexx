import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, Outlet } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import PatientHeader from '../../components/PatientHeader';
import PatientTabs from '../../components/PatientTabs';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function Patient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPatientData();
    }
  }, [id]);

  useEffect(() => {
    // Redirect to vitals tab by default
    if (patient && window.location.pathname === `/admin/patient/${id}`) {
      navigate(`/admin/patient/${id}/vitals`);
    }
  }, [patient, id, navigate]);

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
            to="/admin/rpm/patients"
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
      <div className="mb-8">
        <Link 
          to="/admin/rpm/patients"
          className="text-primary hover:text-primary-dark inline-flex items-center mb-4"
        >
          ← Back to Patients
        </Link>
        <PatientHeader patient={patient} />
      </div>

      <PatientTabs patientId={id} />

      {/* Pass patient data to child routes via Outlet context */}
      <Outlet context={{ patient }} />
    </div>
  );
}