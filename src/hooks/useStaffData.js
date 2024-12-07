import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function useStaffData() {
  const [clinicStaff, setClinicStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchClinicStaff() {
    try {
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
          queueCount: 2
        });
      }

      // Transform staff data
      const transformedStaff = telehealthStaff.map(member => ({
        id: member.id,
        name: member.name,
        email: member.email,
        avatar_url: member.avatar_url,
        role: member.user_roles?.[0]?.healthcare_roles_primary?.name || 'Staff Member',
        location: 'Main Clinic',
        meetingUrl: new URL(`/mymeetings/${member.id}`, 'https://healthflexxinc.com').toString(),
        primaryStatus: member.primaryStatus || 'Off Duty',
        secondaryStatus: member.secondaryStatus || '',
        queueCount: Math.floor(Math.random() * 5)
      }));

      setClinicStaff(transformedStaff);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Failed to load clinic staff');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClinicStaff();
  }, []);

  return {
    clinicStaff,
    loading,
    refreshStaff: fetchClinicStaff
  };
}