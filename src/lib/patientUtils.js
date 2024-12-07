import { supabase } from './supabase';

export async function fetchPatients() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        phone,
        avatar_url,
        date_of_birth,
        medical_record_number,
        active,
        user_roles (
          healthcare_roles_primary (
            id,
            name
          )
        ),
        healthcare_providers (
          id,
          name
        ),
        rooms (
          id,
          room_number,
          buildings (
            id,
            name
          )
        )
      `)
      .order('name');

    if (error) throw error;

    // Filter to only include users with the Patient role
    const patients = data?.filter(user => 
      user.user_roles?.some(role => 
        role.healthcare_roles_primary?.name === 'Patient'
      )
    ) || [];

    return patients;
  } catch (error) {
    console.error('Error fetching patients:', error);
    throw error;
  }
}

export async function updatePatientStatus(userId, active) {
  try {
    const { error } = await supabase
      .from('users')
      .update({ active })
      .eq('id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating patient status:', error);
    throw error;
  }
}