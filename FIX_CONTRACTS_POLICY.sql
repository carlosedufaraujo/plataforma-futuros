-- Corrigir a política restante em contracts
DROP POLICY IF EXISTS "Authenticated users can view contracts" ON contracts;

-- Verificar se todas as políticas estão corretas agora
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;