-- ================================
-- ATUALIZAR CARLOS EDUARDO PARA ADMIN
-- ================================

-- 1. Adicionar coluna role na tabela users (se não existir)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'trader' 
CHECK (role IN ('admin', 'trader', 'viewer'));

-- 2. Atualizar Carlos Eduardo para admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'carloseduardo@acexcapital.com';

-- 3. Atualizar role nas vinculações dele
UPDATE user_brokerages 
SET role = 'admin' 
WHERE user_id IN (
    SELECT id FROM users WHERE email = 'carloseduardo@acexcapital.com'
);

-- 4. Criar políticas RLS especiais para admin
-- Política para ver todos os usuários (admin)
DROP POLICY IF EXISTS "Admins can view all users" ON users;
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM users WHERE role = 'admin'
        )
    );

-- Política para ver todas as corretoras (admin)
DROP POLICY IF EXISTS "Admins can view all brokerages" ON brokerages;
CREATE POLICY "Admins can view all brokerages" ON brokerages
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM users WHERE role = 'admin'
        )
    );

-- Política para ver todas as positions (admin)
DROP POLICY IF EXISTS "Admins can view all positions" ON positions;
CREATE POLICY "Admins can view all positions" ON positions
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM users WHERE role = 'admin'
        )
    );

-- Política para ver todas as transactions (admin)
DROP POLICY IF EXISTS "Admins can view all transactions" ON transactions;
CREATE POLICY "Admins can view all transactions" ON transactions
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM users WHERE role = 'admin'
        )
    );

-- Política para ver todas as options (admin)
DROP POLICY IF EXISTS "Admins can view all options" ON options;
CREATE POLICY "Admins can view all options" ON options
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM users WHERE role = 'admin'
        )
    );

-- Política para ver todos os user_brokerages (admin)
DROP POLICY IF EXISTS "Admins can view all user_brokerages" ON user_brokerages;
CREATE POLICY "Admins can view all user_brokerages" ON user_brokerages
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM users WHERE role = 'admin'
        )
    );

-- 5. Verificar resultado
SELECT 
    '=== VERIFICAÇÃO DE ADMIN ===' as info
UNION ALL
SELECT 
    'Nome: ' || nome || ' | Role: ' || role || ' | Email: ' || email
FROM users
WHERE email = 'carloseduardo@acexcapital.com'
UNION ALL
SELECT 
    '---'
UNION ALL
SELECT 
    'Políticas RLS criadas para acesso total do admin';