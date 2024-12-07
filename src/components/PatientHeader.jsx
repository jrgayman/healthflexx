import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import NotificationPreferences from './medications/NotificationPreferences';
import FamilyContacts from './medications/FamilyContacts';
import toast from 'react-hot-toast';

export default function PatientHeader({ patient }) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    phone: patient?.phone || '',
    email: patient?.email || ''
  });

  if (!patient) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('users')
        .update({
          phone: contactInfo.phone,
          email: contactInfo.email
        })
        .eq('id', patient.id);

      if (error) throw error;
      toast.success('Contact information updated');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating contact info:', error);
      toast.error('Failed to update contact information');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-4 mb-6">
        <img
          src={patient.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}&background=random`}
          alt=""
          className="h-16 w-16 rounded-full"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}&background=random`;
          }}
        />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
              <p className="text-gray-600">
                MRN: {patient.medical_record_number} | Provider: {patient.healthcare_providers?.name || 'Unassigned'}
              </p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-primary hover:text-primary-dark"
            >
              {isEditing ? 'Cancel' : 'Edit Contact Info'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-2 text-sm text-gray-600">
              {(patient.phone || patient.email) && (
                <div className="flex gap-4">
                  {patient.phone && (
                    <div>
                      <span className="font-medium">Phone:</span> {patient.phone}
                    </div>
                  )}
                  {patient.email && (
                    <div>
                      <span className="font-medium">Email:</span> {patient.email}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <NotificationPreferences patientId={patient.id} />
        <FamilyContacts patientId={patient.id} />
      </div>
    </div>
  );
}