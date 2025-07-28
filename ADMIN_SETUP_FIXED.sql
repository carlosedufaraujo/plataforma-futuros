-- ================================
-- SETUP ADMIN - VERSÃO CORRIGIDA
-- ================================

-- 1. Primeiro, adicionar a coluna role (ignora erro se já existir)
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'trader' CHECK (role IN ('admin', 'trader', 'viewer'));

-- 2. Atualizar Carlos Eduardo para admin
UPDATE users SET role = 'admin' WHERE email = 'carloseduardo@acexcapital.com';

-- 3. Atualizar role nas vinculações dele
UPDATE user_brokerages 
SET role = 'admin' 
WHERE user_id = (SELECT id FROM users WHERE email = 'carloseduardo@acexcapital.com');

-- 4. Remover políticas antigas
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can view all brokerages" ON brokerages;
DROP POLICY IF EXISTS "Admins can view all positions" ON positions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON transactions;
DROP POLICY IF EXISTS "Admins can view all options" ON options;
DROP POLICY IF EXISTS "Admins can view all user_brokerages" ON user_brokerages;

-- 5. Criar novas políticas para admin
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
    );

CREATE POLICY "Admins can view all brokerages" ON brokerages
    FOR SELECT USING (
        auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
    );

CREATE POLICY "Admins can view all positions" ON positions
    FOR SELECT USING (
        auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
    );

CREATE POLICY "Admins can view all transactions" ON transactions
    FOR SELECT USING (
        auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
    );

CREATE POLICY "Admins can view all options" ON options
    FOR SELECT USING (
        auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
    );

CREATE POLICY "Admins can view all user_brokerages" ON user_brokerages
    FOR SELECT USING (
        auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
    );

-- 6. Verificação final
SELECT '=== VERIFICAÇÃO DO SETUP ADMIN ===' as info;

SELECT 
    nome || ' | Email: ' || email || ' | Role: ' || COALESCE(role, 'trader') as "Usuário Admin"
FROM users
WHERE email = 'carloseduardo@acexcapital.com';

SELECT 
    'Total de políticas para admin criadas: 6' as "Políticas RLS";

SELECT 
    tablename || ': ' || 
    CASE WHEN rowsecurity THEN '✅ RLS Habilitado' ELSE '❌ RLS Desabilitado' END as "Status RLS"
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'brokerages', 'user_brokerages', 'positions', 'transactions', 'options')
ORDER BY tablename;