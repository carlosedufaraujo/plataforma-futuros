-- ================================
-- TESTAR AS POLÍTICAS RLS
-- ================================

-- 1. Verificar se as políticas foram criadas corretamente
SELECT 
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 2. Testar acesso como usuário específico
-- Substitua o UUID pelo ID de um usuário real do sistema
SET LOCAL "request.jwt.claims" = '{"sub":"d7b6e0b7-8c3e-4f5a-9d2c-1a3b4c5d6e7f"}';

-- 3. Testar consulta na tabela users
SELECT id, email, nome, role FROM users;

-- 4. Testar consulta nas corretoras
SELECT b.* 
FROM brokerages b
WHERE EXISTS (
    SELECT 1 FROM user_brokerages ub
    WHERE ub.brokerage_id = b.id
    AND ub.user_id = 'd7b6e0b7-8c3e-4f5a-9d2c-1a3b4c5d6e7f'
);

-- 5. Resetar contexto
RESET ALL;

-- 6. Verificar se há algum erro nas políticas
SELECT 
    n.nspname AS schema_name,
    c.relname AS table_name,
    pol.polname AS policy_name,
    CASE pol.polcmd
        WHEN 'r' THEN 'SELECT'
        WHEN 'a' THEN 'INSERT'
        WHEN 'w' THEN 'UPDATE'
        WHEN 'd' THEN 'DELETE'
        WHEN '*' THEN 'ALL'
    END AS command,
    pg_get_expr(pol.polqual, pol.polrelid) AS using_expression,
    pg_get_expr(pol.polwithcheck, pol.polrelid) AS check_expression
FROM pg_policy pol
JOIN pg_class c ON c.oid = pol.polrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
ORDER BY c.relname, pol.polname;