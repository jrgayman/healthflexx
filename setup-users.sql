-- Drop existing users table if it exists
DROP TABLE IF EXISTS users;

-- Create fresh users table
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone TEXT,
  access_level TEXT DEFAULT 'Reader',
  avatar_url TEXT,
  login_count INTEGER DEFAULT 0,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_access_level ON users(access_level);

-- Insert users with default access level as Super Admin
INSERT INTO users (name, email, password_hash, phone, access_level, avatar_url)
VALUES 
  ('John Gayman', 'john.gayman@healthflexxinc.com', '$2a$10$XQtJ9.yqD7eFXDYWvj8kB.njc2FMqwcUvtXdgKRLVGTJbqOXHx3hy', '555-0101', 'Super Admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=John%20Gayman'),
  ('James Carter', 'james.carter@healthflexxinc.com', '$2a$10$XQtJ9.yqD7eFXDYWvj8kB.njc2FMqwcUvtXdgKRLVGTJbqOXHx3hy', '555-0102', 'Super Admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=James%20Carter'),
  ('Emily Johnson', 'emily.johnson@healthflexxinc.com', '$2a$10$XQtJ9.yqD7eFXDYWvj8kB.njc2FMqwcUvtXdgKRLVGTJbqOXHx3hy', '555-0103', 'Super Admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily%20Johnson'),
  ('Carlos Martinez', 'carlos.martinez@healthflexxinc.com', '$2a$10$XQtJ9.yqD7eFXDYWvj8kB.njc2FMqwcUvtXdgKRLVGTJbqOXHx3hy', '555-0104', 'Super Admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos%20Martinez'),
  ('Ava Smith', 'ava.smith@healthflexxinc.com', '$2a$10$XQtJ9.yqD7eFXDYWvj8kB.njc2FMqwcUvtXdgKRLVGTJbqOXHx3hy', '555-0105', 'Super Admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ava%20Smith'),
  ('Michael Brown', 'michael.brown@healthflexxinc.com', '$2a$10$XQtJ9.yqD7eFXDYWvj8kB.njc2FMqwcUvtXdgKRLVGTJbqOXHx3hy', '555-0106', 'Super Admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael%20Brown'),
  ('Sophia Davis', 'sophia.davis@healthflexxinc.com', '$2a$10$XQtJ9.yqD7eFXDYWvj8kB.njc2FMqwcUvtXdgKRLVGTJbqOXHx3hy', '555-0107', 'Super Admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia%20Davis'),
  ('Liam Thompson', 'liam.thompson@healthflexxinc.com', '$2a$10$XQtJ9.yqD7eFXDYWvj8kB.njc2FMqwcUvtXdgKRLVGTJbqOXHx3hy', '555-0108', 'Super Admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam%20Thompson'),
  ('Olivia Harris', 'olivia.harris@healthflexxinc.com', '$2a$10$XQtJ9.yqD7eFXDYWvj8kB.njc2FMqwcUvtXdgKRLVGTJbqOXHx3hy', '555-0109', 'Super Admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia%20Harris'),
  ('Ethan Robinson', 'ethan.robinson@healthflexxinc.com', '$2a$10$XQtJ9.yqD7eFXDYWvj8kB.njc2FMqwcUvtXdgKRLVGTJbqOXHx3hy', '555-0110', 'Super Admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ethan%20Robinson'),
  ('Chloe Jackson', 'chloe.jackson@healthflexxinc.com', '$2a$10$XQtJ9.yqD7eFXDYWvj8kB.njc2FMqwcUvtXdgKRLVGTJbqOXHx3hy', '555-0111', 'Super Admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chloe%20Jackson');