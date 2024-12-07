import { supabase } from '../src/lib/supabase';

async function setupHealthcareRoles() {
  try {
    // Execute the SQL commands
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create healthcare roles tables
        CREATE TABLE IF NOT EXISTS healthcare_primary_roles (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          description TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS healthcare_specific_roles (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          name TEXT NOT NULL,
          primary_role_id UUID NOT NULL REFERENCES healthcare_primary_roles(id),
          description TEXT,
          qualifications TEXT,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(name, primary_role_id)
        );

        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_healthcare_specific_roles_primary_role 
        ON healthcare_specific_roles(primary_role_id);

        CREATE INDEX IF NOT EXISTS idx_healthcare_specific_roles_active 
        ON healthcare_specific_roles(active);

        -- Insert primary roles
        INSERT INTO healthcare_primary_roles (name, description) 
        VALUES 
          ('Administrator', 'Healthcare administration and management roles'),
          ('Physician', 'Medical doctors and specialists'),
          ('Nurse', 'Nursing and patient care professionals'),
          ('Assistant', 'Supporting medical and administrative staff'),
          ('Other', 'Additional healthcare roles')
        ON CONFLICT (name) DO UPDATE 
        SET description = EXCLUDED.description;

        -- Insert specific roles
        WITH roles AS (
          SELECT id, name FROM healthcare_primary_roles
        )
        INSERT INTO healthcare_specific_roles (name, primary_role_id, description) 
        VALUES
          -- Administrator roles
          ('Medical Administrator', (SELECT id FROM roles WHERE name = 'Administrator'), 
           'Manages operations, staff, and budgets in healthcare settings'),
          ('Medical Receptionist', (SELECT id FROM roles WHERE name = 'Administrator'), 
           'Schedules appointments, handles inquiries, and greets patients'),
          ('Billing Specialist', (SELECT id FROM roles WHERE name = 'Administrator'), 
           'Manages medical billing and insurance claims'),
          
          -- Physician roles
          ('General Practitioner', (SELECT id FROM roles WHERE name = 'Physician'), 
           'Provides primary care for a wide range of medical issues'),
          ('Specialist', (SELECT id FROM roles WHERE name = 'Physician'), 
           'Focuses on a specific medical field'),
          ('Surgeon', (SELECT id FROM roles WHERE name = 'Physician'), 
           'Performs surgical operations'),
          
          -- Nurse roles
          ('Registered Nurse', (SELECT id FROM roles WHERE name = 'Nurse'), 
           'Provides patient care, administers medications, and assists in treatments'),
          ('Nurse Practitioner', (SELECT id FROM roles WHERE name = 'Nurse'), 
           'Advanced practice nurse who can diagnose and treat patients'),
          ('Clinical Nurse Specialist', (SELECT id FROM roles WHERE name = 'Nurse'), 
           'Expert in specialized areas of nursing'),
          
          -- Assistant roles
          ('Medical Assistant', (SELECT id FROM roles WHERE name = 'Assistant'), 
           'Performs clinical and administrative tasks under supervision'),
          ('Physician Assistant', (SELECT id FROM roles WHERE name = 'Assistant'), 
           'Diagnoses illnesses and develops treatment plans'),
          ('Nursing Assistant', (SELECT id FROM roles WHERE name = 'Assistant'), 
           'Provides basic patient care under nursing supervision'),
          
          -- Other roles
          ('Physical Therapist', (SELECT id FROM roles WHERE name = 'Other'), 
           'Helps patients recover mobility and manage pain'),
          ('Pharmacist', (SELECT id FROM roles WHERE name = 'Other'), 
           'Prepares and dispenses medications'),
          ('Social Worker', (SELECT id FROM roles WHERE name = 'Other'), 
           'Supports patients with emotional and social challenges')
        ON CONFLICT (name, primary_role_id) DO UPDATE 
        SET description = EXCLUDED.description;

        -- Create view for easy querying
        CREATE OR REPLACE VIEW healthcare_roles_view AS
        SELECT 
          sr.id,
          sr.name as role_name,
          pr.name as primary_role,
          sr.description,
          sr.qualifications,
          sr.active,
          sr.created_at,
          sr.updated_at
        FROM healthcare_specific_roles sr
        JOIN healthcare_primary_roles pr ON sr.primary_role_id = pr.id
        ORDER BY pr.name, sr.name;
      `
    });

    if (error) throw error;
    console.log('Healthcare roles setup completed successfully!');
    return true;
  } catch (error) {
    console.error('Error setting up healthcare roles:', error);
    return false;
  }
}

setupHealthcareRoles()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));