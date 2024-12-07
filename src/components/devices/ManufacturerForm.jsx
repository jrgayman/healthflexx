import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ManufacturerForm({ manufacturer = null, onSave, onCancel }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.target);
      const data = {
        name: formData.get('name'),
        website: formData.get('website'),
        contact_email: formData.get('contact_email'),
        contact_phone: formData.get('contact_phone'),
        active: formData.get('active') === 'on'
      };

      await onSave(data);
      toast.success(manufacturer ? 'Manufacturer updated!' : 'Manufacturer added!');
    } catch (error) {
      console.error('Error saving manufacturer:', error);
      toast.error('Failed to save manufacturer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          name="name"
          defaultValue={manufacturer?.name}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Website</label>
        <input
          type="url"
          name="website"
          defaultValue={manufacturer?.website}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Contact Email</label>
        <input
          type="email"
          name="contact_email"
          defaultValue={manufacturer?.contact_email}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
        <input
          type="tel"
          name="contact_phone"
          defaultValue={manufacturer?.contact_phone}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        />
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            name="active"
            defaultChecked={manufacturer?.active ?? true}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="ml-2 text-sm text-gray-700">Active</span>
        </label>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : (manufacturer ? 'Update' : 'Add')}
        </button>
      </div>
    </form>
  );
}