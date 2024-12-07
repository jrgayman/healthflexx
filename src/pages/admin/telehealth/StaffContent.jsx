import React, { useEffect } from 'react';
import StaffMemberHeader from '../../../components/telehealth/StaffMemberHeader';
import StaffList from '../../../components/telehealth/StaffList';
import PatientQueue from '../../../components/telehealth/PatientQueue';
import StaffFilters from '../../../components/telehealth/StaffFilters';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import useTelehealthStore from '../../../stores/telehealthStore';

export default function StaffContent() {
  const { 
    loading,
    filters,
    setFilter,
    fetchStaff,
    updateStaffStatus,
    getFilteredStaff,
    getWaitingPatients,
    handleQuickChat
  } = useTelehealthStore();

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const filteredStaff = getFilteredStaff();
  const avaSmith = filteredStaff.find(member => member.name === 'Ava Smith');
  const waitingPatients = getWaitingPatients();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {avaSmith && (
        <StaffMemberHeader 
          member={avaSmith} 
          onStatusChange={updateStaffStatus}
        />
      )}

      <div className="mb-8">
        <PatientQueue 
          patients={waitingPatients.map(patient => ({
            ...patient,
            onQuickChat: () => handleQuickChat(patient.id)
          }))}
        />
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Staff Members</h2>
        <StaffFilters
          searchTerm={filters.search}
          onSearchChange={(value) => setFilter('search', value)}
          roleFilter={filters.role}
          onRoleChange={(value) => setFilter('role', value)}
          statusFilter={filters.status}
          onStatusChange={(value) => setFilter('status', value)}
        />
      </div>

      {loading ? (
        <LoadingSpinner message="Loading clinic staff..." />
      ) : (
        <StaffList 
          staff={filteredStaff.filter(member => member.id !== avaSmith?.id)}
          onStatusChange={updateStaffStatus}
        />
      )}
    </div>
  );
}