import { supabase } from '../src/lib/supabase';

async function setupDefaultCompany() {
  try {
    // Create default healthcare provider
    const { data: provider, error: providerError } = await supabase
      .from('healthcare_providers')
      .insert([{
        name: 'HealthFlexx Inc.',
        contact_email: 'admin@healthflexxinc.com',
        contact_phone: '1-800-HEALTH1',
        website: 'https://healthflexxinc.com',
        active: true
      }])
      .select()
      .single();

    if (providerError) throw providerError;

    // Create default company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert([{
        name: 'HealthFlexx General',
        industry: 'Healthcare',
        contact_email: 'support@healthflexxinc.com',
        contact_phone: '1-800-HEALTH2',
        website: 'https://healthflexxinc.com',
        healthcare_provider_id: provider.id,
        active: true
      }])
      .select()
      .single();

    if (companyError) throw companyError;

    // Update users without a company to use the default
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        company_id: company.id,
        healthcare_provider_id: provider.id 
      })
      .is('company_id', null);

    if (updateError) throw updateError;

    console.log('Default company setup completed successfully!');
    return true;
  } catch (error) {
    console.error('Error setting up default company:', error);
    return false;
  }
}

setupDefaultCompany()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));