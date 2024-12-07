-- Create posts table if it doesn't exist
create table if not exists public.posts (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text not null unique,
  content text,
  excerpt text,
  category text not null,
  type text not null,
  image_url text,
  video_url text,
  embed_code text,
  duration text,
  app_url text,
  web_url text,
  featured boolean default false,
  active boolean default true,
  creator text,
  likes integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index if not exists idx_posts_category on posts(category);
create index if not exists idx_posts_type on posts(type);
create index if not exists idx_posts_slug on posts(slug);