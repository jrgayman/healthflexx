-- First ensure we have the UUID extension and pg_trgm for text search
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Drop existing table and related objects
DROP TABLE IF EXISTS medications CASCADE;
DROP TRIGGER IF EXISTS update_medications_updated_at ON medications;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
DROP FUNCTION IF EXISTS sync_fda_medications CASCADE;

-- Create medications table
CREATE TABLE medications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ndc_code TEXT,
  brand_name TEXT,
  generic_name TEXT,
  manufacturer TEXT,
  pharm_class TEXT,
  dosage_form TEXT,
  strength TEXT,
  route TEXT,
  contraindications TEXT[],
  interactions TEXT[],
  warnings TEXT[],
  active BOOLEAN DEFAULT true,
  last_synced TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_ndc_code UNIQUE (ndc_code)
);

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_medications_brand_name;
DROP INDEX IF EXISTS idx_medications_generic_name;
DROP INDEX IF EXISTS idx_medications_pharm_class;
DROP INDEX IF EXISTS idx_medications_active;
DROP INDEX IF EXISTS idx_medications_last_synced;
DROP INDEX IF EXISTS idx_medications_search;

-- Create indexes for better query performance
CREATE INDEX idx_medications_brand_name ON medications USING gin (brand_name gin_trgm_ops);
CREATE INDEX idx_medications_generic_name ON medications USING gin (generic_name gin_trgm_ops);
CREATE INDEX idx_medications_pharm_class ON medications(pharm_class);
CREATE INDEX idx_medications_active ON medications(active);
CREATE INDEX idx_medications_last_synced ON medications(last_synced);
CREATE INDEX idx_medications_search ON medications USING gin (
  (
    coalesce(brand_name, '') || ' ' ||
    coalesce(generic_name, '') || ' ' ||
    coalesce(pharm_class, '')
  ) gin_trgm_ops
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_medications_updated_at
  BEFORE UPDATE ON medications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to sync FDA medications
CREATE OR REPLACE FUNCTION sync_fda_medications()
RETURNS void AS $$
DECLARE
  sync_time TIMESTAMPTZ;
BEGIN
  sync_time := NOW();
  
  -- Update last_synced for all records that were processed
  UPDATE medications
  SET last_synced = sync_time,
      updated_at = sync_time
  WHERE active = true;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT ALL ON medications TO authenticated;
GRANT ALL ON medications TO anon;
GRANT EXECUTE ON FUNCTION sync_fda_medications() TO authenticated;
GRANT EXECUTE ON FUNCTION sync_fda_medications() TO anon;