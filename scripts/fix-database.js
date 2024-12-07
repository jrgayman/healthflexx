import { supabase } from '../src/lib/supabase';

async function fixDatabase() {
  try {
    // Execute the SQL commands
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- First ensure we have the UUID extension
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        -- Create healthcare_providers table if it doesn't exist
        CREATE TABLE IF NOT EXISTS healthcare_providers (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          name TEXT NOT NULL,
          license_number TEXT,
          tax_id TEXT,
          contact_email TEXT,
          contact_phone TEXT,
          website TEXT,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create companies table if it doesn't exist
        CREATE TABLE IF NOT EXISTS companies (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          name TEXT NOT NULL,
          industry TEXT,
          tax_id TEXT,
          contact_email TEXT,
          contact_phone TEXT,
          website TEXT,
          healthcare_provider_id UUID REFERENCES healthcare_providers(id),
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Update users table with new relationships
        ALTER TABLE users
        DROP COLUMN IF EXISTS organization_id CASCADE;

        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS healthcare_provider_id UUID REFERENCES healthcare_providers(id),
        ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id),
        ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES healthcare_specific_roles(id);

        -- Create indexes for better query performance
        CREATE INDEX IF NOT EXISTS idx_companies_healthcare_provider ON companies(healthcare_provider_id);
        CREATE INDEX IF NOT EXISTS idx_users_healthcare_provider ON users(healthcare_provider_id);
        CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
        CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_id);

        -- Create updated_at trigger function
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Create triggers for updated_at
        DROP TRIGGER IF EXISTS trigger_companies_updated_at ON companies;
        CREATE TRIGGER trigger_companies_updated_at
          BEFORE UPDATE ON companies
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();

        DROP TRIGGER IF EXISTS trigger_healthcare_providers_updated_at ON healthcare_providers;
        CREATE TRIGGER trigger_healthcare_providers_updated_at
          BEFORE UPDATE ON healthcare_providers
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `
    });

    if (error) throw error;
    console.log('Database structure updated successfully!');
    return true;
  } catch (error) {
    console.error('Error updating database:', error);
    return false;
  }
}

fixDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));