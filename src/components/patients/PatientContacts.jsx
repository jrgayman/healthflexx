import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../LoadingSpinner';
import toast from 'react-hot-toast';

export default function PatientContacts() {
  const { patient } = useOutletContext();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    if (patient?.id) {
      fetchContacts();
    }
  }, [patient]);

  async function fetchContacts() {
    try {
      const { data, error } = await supabase
        .from('family_contacts')
        .select()
        .eq('user_id', patient.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to load family contacts');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const contactData = {
        user_id: patient.id,
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        notify_by_phone: formData.get('notify_by_phone') === 'on',
        notify_by_email: formData.get('notify_by_email') === 'on',
        active: true
      };

      let error;
      if (selectedContact) {
        ({ error } = await supabase
          .from('family_contacts')
          .update(contactData)
          .eq('id', selectedContact.id));
      } else {
        ({ error } = await supabase
          .from('family_contacts')
          .insert([contactData]));
      }

      if (error) throw error;

      toast.success(selectedContact ? 'Contact updated' : 'Contact added');
      setIsModalOpen(false);
      setSelectedContact(null);
      fetchContacts();
    } catch (error) {
      console.error('Error saving contact:', error);
      toast.error('Failed to save contact');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to remove this contact?')) return;

    try {
      const { error } = await supabase
        .from('family_contacts')
        .update({ active: false })
        .eq('id', id);

      if (error) throw error;
      toast.success('Contact removed');
      fetchContacts();
    } catch (error) {
      console.error('Error removing contact:', error);
      toast.error('Failed to remove contact');
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading contacts..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Family Contacts</h2>
        <button
          onClick={() => {
            setSelectedContact(null);
            setIsModalOpen(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
        >
          Add Contact
        </button>
      </div>

      {contacts.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact Info</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notifications</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {contacts.map((contact) => (
                  <tr key={contact.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {contact.first_name} {contact.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{contact.email}</div>
                      <div className="text-sm text-gray-500">{contact.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {contact.notify_by_email && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Email
                          </span>
                        )}
                        {contact.notify_by_phone && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Phone
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-4">
                      <button
                        onClick={() => {
                          setSelectedContact(contact);
                          setIsModalOpen(true);
                        }}
                        className="text-primary hover:text-primary-dark"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(contact.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">No family contacts added yet.</p>
        </div>
      )}

      {/* Contact Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedContact ? 'Edit Contact' : 'Add Contact'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedContact(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    defaultValue={selectedContact?.first_name}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    defaultValue={selectedContact?.last_name}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={selectedContact?.email}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={selectedContact?.phone}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="notify_by_email"
                    defaultChecked={selectedContact?.notify_by_email}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700">Notify by Email</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="notify_by_phone"
                    defaultChecked={selectedContact?.notify_by_phone}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700">Notify by Phone</span>
                </label>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedContact(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark"
                >
                  {selectedContact ? 'Update Contact' : 'Add Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}