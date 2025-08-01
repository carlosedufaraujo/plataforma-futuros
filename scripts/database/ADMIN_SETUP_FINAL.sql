-- ================================
-- SETUP ADMIN FINAL - SEM ALTER TABLE
-- ================================

-- 1. Atualizar Carlos Eduardo para admin
UPDATE users SET role = 'admin' WHERE email = 'carloseduardo@acexcapital.com';

-- 2. Atualizar role nas vinculações dele
UPDATE user_brokerages 
SET role = 'admin' 
WHERE user_id = (SELECT id FROM users WHERE email = 'carloseduardo@acexcapital.com');

-- 3. Remover políticas antigas
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can view all brokerages" ON brokerages;
DROP POLICY IF EXISTS "Admins can view all positions" ON positions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON transactions;
DROP POLICY IF EXISTS "Admins can view all options" ON options;
DROP POLICY IF EXISTS "Admins can view all user_brokerages" ON user_brokerages;

-- 4. Criar novas políticas para admin
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

-- 5. Verificação final com CTE para resultado único
WITH resultado AS (
    SELECT 
        '=== SETUP ADMIN CONCLUÍDO ===' as categoria,
        '' as detalhe,
        1 as ordem
    
    UNION ALL
    
    SELECT 
        'Usuário Admin',
        nome || ' (' || email || ') - Role: ' || COALESCE(role, 'trader'),
        2
    FROM users
    WHERE email = 'carloseduardo@acexcapital.com'
    
    UNION ALL
    
    SELECT 
        '',
        '---',
        3
    
    UNION ALL
    
    SELECT 
        'Políticas RLS',
        'Admin pode acessar todos os dados do sistema',
        4
    
    UNION ALL
    
    SELECT 
        '',
        '---',
        5
    
    UNION ALL
    
    SELECT 
        'Status RLS',
        tablename || ': ' || CASE WHEN rowsecurity THEN '✅ Habilitado' ELSE '❌ Desabilitado' END,
        6 + ROW_NUMBER() OVER (ORDER BY tablename)
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN ('users', 'brokerages', 'user_brokerages', 'positions', 'transactions', 'options')
)
SELECT categoria, detalhe
FROM resultado
ORDER BY ordem;