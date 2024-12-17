import React from 'react';
import { Link } from 'react-router-dom';

export default function FamilyContactsTable({ contacts, onEdit }) {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact Info</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notifications</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
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
                  <Link
                    to={`/admin/patient/${contact.users?.id}`}
                    className="text-sm text-primary hover:text-primary-dark"
                  >
                    <div>{contact.users?.name}</div>
                    <div className="text-xs text-gray-500">
                      {contact.users?.medical_record_number}
                    </div>
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {contact.users?.healthcare_providers?.name || '-'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {contact.users?.companies?.name || '-'}
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
                    {!contact.notify_by_email && !contact.notify_by_phone && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        None
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    contact.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {contact.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onEdit(contact)}
                    className="text-primary hover:text-primary-dark"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}