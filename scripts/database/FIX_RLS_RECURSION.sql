-- ================================
-- CORRIGIR RECURSÃO INFINITA NAS POLÍTICAS RLS
-- ================================

-- 1. Remover TODAS as políticas existentes das tabelas
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Enable insert for authentication" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;

DROP POLICY IF EXISTS "Users can view authorized brokerages" ON brokerages;
DROP POLICY IF EXISTS "Admins can view all brokerages" ON brokerages;

DROP POLICY IF EXISTS "Users can view own brokerage associations" ON user_brokerages;
DROP POLICY IF EXISTS "Admins can view all user_brokerages" ON user_brokerages;

DROP POLICY IF EXISTS "Users can manage own positions" ON positions;
DROP POLICY IF EXISTS "Admins can view all positions" ON positions;

DROP POLICY IF EXISTS "Users can manage own transactions" ON transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON transactions;

DROP POLICY IF EXISTS "Users can manage own options" ON options;
DROP POLICY IF EXISTS "Admins can view all options" ON options;

DROP POLICY IF EXISTS "Authenticated users can view contracts" ON contracts;

-- 2. Criar políticas CORRIGIDAS sem recursão

-- USERS - Política especial que permite acesso à própria linha
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authentication" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- BROKERAGES - Baseado em user_brokerages
CREATE POLICY "Users can view authorized brokerages" ON brokerages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_brokerages
            WHERE user_brokerages.brokerage_id = brokerages.id
            AND user_brokerages.user_id = auth.uid()
        )
    );

-- USER_BROKERAGES
CREATE POLICY "Users can view own brokerage associations" ON user_brokerages
    FOR SELECT USING (user_id = auth.uid());

-- POSITIONS
CREATE POLICY "Users can manage own positions" ON positions
    FOR ALL USING (user_id = auth.uid());

-- TRANSACTIONS
CREATE POLICY "Users can manage own transactions" ON transactions
    FOR ALL USING (user_id = auth.uid());

-- OPTIONS
CREATE POLICY "Users can manage own options" ON options
    FOR ALL USING (user_id = auth.uid());

-- CONTRACTS
CREATE POLICY "Authenticated users can view contracts" ON contracts
    FOR SELECT USING (auth.role() = 'authenticated');

-- 3. Criar função segura para verificar se usuário é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- Retorna true se o usuário tem role 'admin'
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Criar políticas adicionais para admin usando a função
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can view all brokerages" ON brokerages
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can view all positions" ON positions
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can view all transactions" ON transactions
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can view all options" ON options
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can view all user_brokerages" ON user_brokerages
    FOR SELECT USING (is_admin());

-- 5. Verificação final
SELECT '=== POLÍTICAS RLS CORRIGIDAS ===' as info;

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'brokerages', 'positions', 'transactions', 'options', 'user_brokerages')
ORDER BY tablename, policyname;