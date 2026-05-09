-- =============================================
-- User roles: admin | asistente
-- Stores role in user_profiles linked to auth.users
-- =============================================

CREATE TYPE user_role AS ENUM ('admin', 'asistente');

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nombre TEXT,
  role user_role NOT NULL DEFAULT 'asistente',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile with 'asistente' role when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'asistente')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read all profiles (needed to list users in admin panel)
CREATE POLICY "Authenticated users can read profiles" ON user_profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Only admins can insert/update any profile (for user management)
CREATE POLICY "Admins can manage profiles" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Seed: promote the existing nutricionista@demo.com user to admin
-- (runs safely even if user doesn't exist yet)
INSERT INTO user_profiles (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email IN ('nutricionista@demo.com', 'luisrojasmunoz@gmail.com')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
