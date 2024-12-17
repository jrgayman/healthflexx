import { supabase } from './supabase';

export async function setupWeightManagement() {
  try {
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- First ensure we have the UUID extension
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        -- Drop existing views and tables to ensure clean slate
        DROP VIEW IF EXISTS weight_management_summary CASCADE;
        DROP TABLE IF EXISTS weight_tracking CASCADE;
        DROP TABLE IF EXISTS weight_management CASCADE;

        -- Create weight management table for goals and settings
        CREATE TABLE IF NOT EXISTS weight_management (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          starting_weight DECIMAL(5,2) NOT NULL,
          goal_weight DECIMAL(5,2) NOT NULL,
          height_feet INTEGER,
          height_inches INTEGER,
          start_date DATE NOT NULL DEFAULT CURRENT_DATE,
          target_date DATE,
          notes TEXT,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          bmi DECIMAL GENERATED ALWAYS AS (
            CASE 
              WHEN height_feet IS NOT NULL AND height_inches IS NOT NULL THEN
                (starting_weight / POWER(((height_feet * 12) + height_inches), 2)) * 703
              ELSE NULL
            END
          ) STORED
        );

        -- Create weight tracking records table
        CREATE TABLE IF NOT EXISTS weight_tracking (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          weight DECIMAL(5,2) NOT NULL,
          height_feet INTEGER,
          height_inches INTEGER,
          measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          notes TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          bmi DECIMAL GENERATED ALWAYS AS (
            CASE 
              WHEN height_feet IS NOT NULL AND height_inches IS NOT NULL THEN
                (weight / POWER(((height_feet * 12) + height_inches), 2)) * 703
              ELSE NULL
            END
          ) STORED
        );

        -- Create indexes for better query performance
        CREATE INDEX IF NOT EXISTS idx_weight_management_user ON weight_management(user_id);
        CREATE INDEX IF NOT EXISTS idx_weight_management_active ON weight_management(active);
        CREATE INDEX IF NOT EXISTS idx_weight_management_bmi ON weight_management(bmi);

        CREATE INDEX IF NOT EXISTS idx_weight_tracking_user ON weight_tracking(user_id);
        CREATE INDEX IF NOT EXISTS idx_weight_tracking_date ON weight_tracking(measured_at);
        CREATE INDEX IF NOT EXISTS idx_weight_tracking_bmi ON weight_tracking(bmi);

        -- Create view for weight management summary
        CREATE VIEW weight_management_summary AS
        WITH latest_weight AS (
          SELECT DISTINCT ON (user_id)
            user_id,
            weight as current_weight,
            bmi as current_bmi,
            measured_at as last_weigh_in
          FROM weight_tracking
          ORDER BY user_id, measured_at DESC
        )
        SELECT 
          wm.id,
          wm.user_id,
          u.name as patient_name,
          u.medical_record_number,
          wm.starting_weight,
          wm.goal_weight,
          lw.current_weight,
          CASE 
            WHEN lw.current_weight IS NOT NULL THEN
              wm.goal_weight - lw.current_weight
            ELSE wm.goal_weight - wm.starting_weight
          END as weight_to_goal,
          wm.height_feet,
          wm.height_inches,
          wm.bmi as starting_bmi,
          lw.current_bmi,
          wm.start_date,
          wm.target_date,
          wm.active,
          lw.last_weigh_in,
          u.healthcare_provider_id as provider_id,
          hp.name as provider_name,
          u.company_id,
          c.name as company_name,
          u.avatar_url
        FROM weight_management wm
        JOIN users u ON wm.user_id = u.id
        LEFT JOIN latest_weight lw ON wm.user_id = lw.user_id
        LEFT JOIN healthcare_providers hp ON u.healthcare_provider_id = hp.id
        LEFT JOIN companies c ON u.company_id = c.id;

        -- Grant permissions
        GRANT ALL ON weight_management TO authenticated;
        GRANT ALL ON weight_tracking TO authenticated;
        GRANT ALL ON weight_management_summary TO authenticated;
      `
    });

    if (error) throw error;
    console.log('Weight management tables created successfully');
    return true;
  } catch (error) {
    console.error('Error setting up weight management:', error);
    return false;
  }
}