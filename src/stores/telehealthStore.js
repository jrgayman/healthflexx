import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { subMinutes } from 'date-fns';

const MOCK_PATIENTS = [
  {
    id: 'p1',
    name: 'John Smith',
    mrn: 'MRN001',
    concern: 'Strep throat symptoms, fever and sore throat',
    joinedAt: subMinutes(new Date(), 15).toISOString(),
    avatar_url: null
  },
  {
    id: 'p2',
    name: 'Sarah Johnson',
    mrn: 'MRN002',
    concern: 'Persistent cough and congestion',
    joinedAt: subMinutes(new Date(), 8).toISOString(),
    avatar_url: null
  },
  {
    id: 'p3',
    name: 'Michael Brown',
    mrn: 'MRN003',
    concern: 'Possible ear infection, experiencing pain',
    joinedAt: subMinutes(new Date(), 3).toISOString(),
    avatar_url: null
  }
];

const useTelehealthStore = create((set, get) => ({
  staff: [],
  patients: MOCK_PATIENTS,
  loading: false,
  error: null,
  filters: {
    search: '',
    role: '',
    status: ''
  },

  setFilter: (key, value) => {
    set(state => ({
      filters: {
        ...state.filters,
        [key]: value
      }
    }));
  },

  fetchStaff: async () => {
    try {
      set({ loading: true });
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          user_roles (
            healthcare_roles_primary (
              id,
              name
            )
          )
        `)
        .order('name');

      if (error) throw error;

      // Filter to only include telehealth staff
      const telehealthStaff = data?.filter(member => 
        member.user_roles?.some(role => 
          ['Telehealth Operations Manager', 'Virtual Care Coordinator', 'Telehealth Technical Support']
            .includes(role.healthcare_roles_primary?.name)
        )
      ) || [];

      // Add Ava Smith if not present
      const avaSmith = telehealthStaff.find(member => member.name === 'Ava Smith');
      if (!avaSmith) {
        telehealthStaff.push({
          id: 'ava-smith',
          name: 'Ava Smith',
          email: 'ava.smith@healthflexxinc.com',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ava',
          role: 'Virtual Care Coordinator',
          location: 'Main Clinic',
          meetingUrl: 'https://healthflexxinc.com/mymeetings/ava-smith',
          primaryStatus: 'Available',
          secondaryStatus: 'Available not w/ Patient',
          queueCount: MOCK_PATIENTS.length
        });
      }

      set({ staff: telehealthStaff, error: null });
    } catch (error) {
      console.error('Error fetching staff:', error);
      set({ error: error.message });
      toast.error('Failed to load clinic staff');
    } finally {
      set({ loading: false });
    }
  },

  updateStaffStatus: async (memberId, status) => {
    try {
      set(state => ({
        staff: state.staff.map(member =>
          member.id === memberId
            ? { ...member, ...status }
            : member
        )
      }));
      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  },

  getFilteredStaff: () => {
    const { staff, filters } = get();
    let filtered = [...staff];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(member => 
        member.name?.toLowerCase().includes(search) ||
        member.email?.toLowerCase().includes(search) ||
        member.role?.toLowerCase().includes(search)
      );
    }

    if (filters.role) {
      filtered = filtered.filter(member => member.role === filters.role);
    }

    if (filters.status) {
      filtered = filtered.filter(member => member.primaryStatus === filters.status);
    }

    return filtered;
  },

  getWaitingPatients: () => {
    return get().patients;
  },

  handleQuickChat: (patientId) => {
    const patient = get().patients.find(p => p.id === patientId);
    if (patient) {
      toast.success(`Opening quick chat with ${patient.name}`);
      // Implement quick chat functionality
    }
  }
}));

export default useTelehealthStore;