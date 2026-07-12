-- Insert test accounts data
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmed_at
) VALUES 
(
  'a0000000-0000-4000-8000-000000000001',
  'admin@manga.com',
  crypt('manga_admin_2025', gen_salt('bf')),
  now(),
  now(),
  now(),
  now()
),
(
  'a0000000-0000-4000-8000-000000000002', 
  'member@manga.com',
  crypt('manga_member_2025', gen_salt('bf')),
  now(),
  now(),
  now(),
  now()
) ON CONFLICT (email) DO NOTHING;

-- Insert corresponding profiles
INSERT INTO public.profiles (
  user_id,
  email,
  role,
  username
) VALUES
(
  'a0000000-0000-4000-8000-000000000001',
  'admin@manga.com', 
  'admin',
  'Admin User'
),
(
  'a0000000-0000-4000-8000-000000000002',
  'member@manga.com',
  'user', 
  'Test Member'
) ON CONFLICT (user_id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  username = EXCLUDED.username;