-- =============================================
-- Fix RLS policies: auth.role() → auth.uid()
-- auth.role() returns 'anon' even for logged-in users
-- auth.uid() IS NOT NULL is the reliable check
-- WITH CHECK is required for INSERT/UPDATE operations
-- =============================================

-- Drop old policies
DROP POLICY IF EXISTS "Authenticated users full access" ON empresas;
DROP POLICY IF EXISTS "Authenticated users full access" ON pacientes;
DROP POLICY IF EXISTS "Authenticated users full access" ON fichas_nutricionales;

-- Recreate with correct auth check
CREATE POLICY "Authenticated users full access" ON empresas
  FOR ALL USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users full access" ON pacientes
  FOR ALL USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users full access" ON fichas_nutricionales
  FOR ALL USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
