import React from 'react';
import { useOutletContext } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function PatientContacts() {
  const { patient } = useOutletContext();

  if (!patient) {
    return <LoadingSpinner message="Loading contacts..." />;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Emergency Contacts</h2>
      {/* Contact management content will go here */}
    </div>
  );
}