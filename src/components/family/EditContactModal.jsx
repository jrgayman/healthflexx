import React, { useState } from 'react';

export default function EditContactModal({ contact, onSave, onClose }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    first_name: contact.first_name,
    last_name: contact.last_name,
    email: contact.email || '',
    phone: contact.phone || '',
    notify_by_email: contact.notify_by_email,
    notify_by_phone: contact.notify_by_phone,
    active: contact.active
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSave(formData);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Edit Contact</h2>
          <button
            onClick={onClose}
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
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>

          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.notify_by_email}
                onChange={(e) => setFormData(prev => ({ ...prev, notify_by_email: e.target.checked }))}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-700">Notify by Email</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.notify_by_phone}
                onChange={(e) => setFormData(prev => ({ ...prev, notify_by_phone: e.target.checked }))}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-700">Notify by Phone</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-700">Active</span>
            </label>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}