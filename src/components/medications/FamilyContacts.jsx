import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function FamilyContacts({ patientId }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, [patientId]);

  async function fetchContacts() {
    try {
      const { data, error } = await supabase
        .from('family_contacts')
        .select('*')
        .eq('user_id', patientId)
        .eq('active', true)
        .order('created_at');

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
    setSaving(true);

    try {
      const formData = new FormData(e.target);
      const contactData = {
        user_id: patientId,
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
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
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
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="space-y-4">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Family Contacts</h3>
        <button
          onClick={() => {
            setSelectedContact(null);
            setIsModalOpen(true);
          }}
          className="bg-primary text-white px-3 py-1 rounded-lg hover:bg-primary-dark text-sm"
        >
          Add Contact
        </button>
      </div>

      {contacts.length > 0 ? (
        <div className="space-y-4">
          {contacts.map(contact => (
            <div key={contact.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {contact.first_name} {contact.last_name}
                  </h4>
                  <div className="text-sm text-gray-500 space-y-1">
                    {contact.phone && <div>{contact.phone}</div>}
                    {contact.email && <div>{contact.email}</div>}
                  </div>
                  <div className="mt-2 space-x-4 text-sm">
                    {contact.notify_by_phone && (
                      <span className="text-primary">Phone Notifications</span>
                    )}
                    {contact.notify_by_email && (
                      <span className="text-primary">Email Notifications</span>
                    )}
                  </div>
                </div>
                <div className="space-x-2">
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
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">No family contacts added yet.</p>
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
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={selectedContact?.phone}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
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

              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="notify_by_phone"
                    defaultChecked={selectedContact?.notify_by_phone}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700">Notify by Phone</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="notify_by_email"
                    defaultChecked={selectedContact?.notify_by_email}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700">Notify by Email</span>
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
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark disabled:opacity-50"
                >
                  {saving ? 'Saving...' : (selectedContact ? 'Update Contact' : 'Add Contact')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}