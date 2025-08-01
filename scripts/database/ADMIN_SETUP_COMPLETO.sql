-- ================================
-- SETUP ADMIN COMPLETO - EXECUÇÃO ÚNICA
-- ================================

DO $$
BEGIN
    -- 1. Adicionar coluna role se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'trader' CHECK (role IN ('admin', 'trader', 'viewer'));
    END IF;

    -- 2. Atualizar Carlos Eduardo para admin
    UPDATE users SET role = 'admin' WHERE email = 'carloseduardo@acexcapital.com';
    
    -- 3. Atualizar role nas vinculações
    UPDATE user_brokerages 
    SET role = 'admin' 
    WHERE user_id = (SELECT id FROM users WHERE email = 'carloseduardo@acexcapital.com');

    -- 4. Remover políticas antigas se existirem
    DROP POLICY IF EXISTS "Admins can view all users" ON users;
    DROP POLICY IF EXISTS "Admins can view all brokerages" ON brokerages;
    DROP POLICY IF EXISTS "Admins can view all positions" ON positions;
    DROP POLICY IF EXISTS "Admins can view all transactions" ON transactions;
    DROP POLICY IF EXISTS "Admins can view all options" ON options;
    DROP POLICY IF EXISTS "Admins can view all user_brokerages" ON user_brokerages;

    -- 5. Criar políticas para admin em users
    CREATE POLICY "Admins can view all users" ON users
        FOR SELECT USING (
            auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
        );

    -- 6. Criar políticas para admin em brokerages
    CREATE POLICY "Admins can view all brokerages" ON brokerages
        FOR SELECT USING (
            auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
        );

    -- 7. Criar políticas para admin em positions
    CREATE POLICY "Admins can view all positions" ON positions
        FOR SELECT USING (
            auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
        );

    -- 8. Criar políticas para admin em transactions
    CREATE POLICY "Admins can view all transactions" ON transactions
        FOR SELECT USING (
            auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
        );

    -- 9. Criar políticas para admin em options
    CREATE POLICY "Admins can view all options" ON options
        FOR SELECT USING (
            auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
        );

    -- 10. Criar políticas para admin em user_brokerages
    CREATE POLICY "Admins can view all user_brokerages" ON user_brokerages
        FOR SELECT USING (
            auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
        );

END $$;

-- Verificação final
WITH verificacao AS (
    SELECT 
        '=== SETUP ADMIN COMPLETO ===' as categoria,
        '' as detalhe,
        1 as ordem
    
    UNION ALL
    
    SELECT 
        'Usuário Admin',
        nome || ' | Email: ' || email || ' | Role: ' || COALESCE(role, 'trader'),
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
        'Políticas RLS Criadas',
        'Admin pode ver todos os dados do sistema',
        4
        
    UNION ALL
    
    SELECT 
        '',
        '---',
        5
        
    UNION ALL
    
    SELECT 
        'Status das Tabelas',
        tablename || ': ' || 
        CASE WHEN rowsecurity THEN '✅ RLS Habilitado' ELSE '❌ RLS Desabilitado' END,
        6 + ROW_NUMBER() OVER (ORDER BY tablename)
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN ('users', 'brokerages', 'user_brokerages', 'positions', 'transactions', 'options')
)
SELECT categoria, detalhe
FROM verificacao
ORDER BY ordem;