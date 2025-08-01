-- IMPLEMENTAR SISTEMA DE ADMIN COMPLETO
-- Adicionar políticas RLS para admin ver/gerenciar TUDO

DO $$
BEGIN
    RAISE NOTICE '🚀 IMPLEMENTANDO SISTEMA DE ADMIN...';
    
    -- 1. GARANTIR QUE CARLOS EDUARDO É ADMIN
    UPDATE users SET role = 'admin' WHERE email = 'carloseduardo@acexcapital.com';
    
    RAISE NOTICE '✅ PASSO 1: Carlos Eduardo definido como admin';
    
    -- 2. REMOVER POLÍTICAS DE ADMIN ANTIGAS (SE EXISTIREM)
    DROP POLICY IF EXISTS "admin_can_view_all_users" ON users;
    DROP POLICY IF EXISTS "admin_can_manage_all_users" ON users;
    DROP POLICY IF EXISTS "admin_can_view_all_brokerages" ON brokerages;
    DROP POLICY IF EXISTS "admin_can_manage_all_brokerages" ON brokerages;
    DROP POLICY IF EXISTS "admin_can_view_all_user_brokerages" ON user_brokerages;
    DROP POLICY IF EXISTS "admin_can_manage_all_user_brokerages" ON user_brokerages;
    DROP POLICY IF EXISTS "admin_can_view_all_positions" ON positions;
    DROP POLICY IF EXISTS "admin_can_manage_all_positions" ON positions;
    DROP POLICY IF EXISTS "admin_can_view_all_transactions" ON transactions;
    DROP POLICY IF EXISTS "admin_can_manage_all_transactions" ON transactions;
    DROP POLICY IF EXISTS "admin_can_view_all_options" ON options;
    DROP POLICY IF EXISTS "admin_can_manage_all_options" ON options;
    
    RAISE NOTICE '✅ PASSO 2: Políticas antigas de admin removidas';
    
    -- 3. CRIAR POLÍTICAS DE ADMIN PARA USERS (VER E GERENCIAR TODOS)
    CREATE POLICY "admin_can_view_all_users" ON users
        FOR SELECT USING (
            auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
        );
    
    CREATE POLICY "admin_can_manage_all_users" ON users
        FOR ALL USING (
            auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
        );
    
    RAISE NOTICE '✅ PASSO 3: Políticas de admin criadas para USERS';
    
    -- 4. CRIAR POLÍTICAS DE ADMIN PARA BROKERAGES
    CREATE POLICY "admin_can_view_all_brokerages" ON brokerages
        FOR SELECT USING (
            auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
        );
    
    CREATE POLICY "admin_can_manage_all_brokerages" ON brokerages
        FOR ALL USING (
            auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
        );
    
    RAISE NOTICE '✅ PASSO 4: Políticas de admin criadas para BROKERAGES';
    
    -- 5. CRIAR POLÍTICAS DE ADMIN PARA USER_BROKERAGES
    CREATE POLICY "admin_can_view_all_user_brokerages" ON user_brokerages
        FOR SELECT USING (
            auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
        );
    
    CREATE POLICY "admin_can_manage_all_user_brokerages" ON user_brokerages
        FOR ALL USING (
            auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
        );
    
    RAISE NOTICE '✅ PASSO 5: Políticas de admin criadas para USER_BROKERAGES';
    
    -- 6. CRIAR POLÍTICAS DE ADMIN PARA POSITIONS
    CREATE POLICY "admin_can_view_all_positions" ON positions
        FOR SELECT USING (
            auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
        );
    
    CREATE POLICY "admin_can_manage_all_positions" ON positions
        FOR ALL USING (
            auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
        );
    
    RAISE NOTICE '✅ PASSO 6: Políticas de admin criadas para POSITIONS';
    
    -- 7. CRIAR POLÍTICAS DE ADMIN PARA TRANSACTIONS
    CREATE POLICY "admin_can_view_all_transactions" ON transactions
        FOR SELECT USING (
            auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
        );
    
    CREATE POLICY "admin_can_manage_all_transactions" ON transactions
        FOR ALL USING (
            auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
        );
    
    RAISE NOTICE '✅ PASSO 7: Políticas de admin criadas para TRANSACTIONS';
    
    -- 8. CRIAR POLÍTICAS DE ADMIN PARA OPTIONS
    CREATE POLICY "admin_can_view_all_options" ON options
        FOR SELECT USING (
            auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
        );
    
    CREATE POLICY "admin_can_manage_all_options" ON options
        FOR ALL USING (
            auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
        );
    
    RAISE NOTICE '✅ PASSO 8: Políticas de admin criadas para OPTIONS';
    
    -- 9. VERIFICAR TOTAL DE POLÍTICAS APÓS ADMIN
    DECLARE
        policy_count INTEGER;
    BEGIN
        SELECT count(*) INTO policy_count 
        FROM pg_policies 
        WHERE schemaname = 'public';
        
        RAISE NOTICE '📊 TOTAL DE POLÍTICAS APÓS ADMIN: %', policy_count;
    END;
    
    RAISE NOTICE '🎉 SISTEMA DE ADMIN IMPLEMENTADO COM SUCESSO!';
    RAISE NOTICE '👑 Carlos Eduardo agora tem acesso TOTAL ao sistema:';
    RAISE NOTICE '   ✅ Ver todos os usuários';
    RAISE NOTICE '   ✅ Gerenciar todas as corretoras';
    RAISE NOTICE '   ✅ Visualizar todas as posições/transações';
    RAISE NOTICE '   ✅ Administrar user_brokerages';
    RAISE NOTICE '   ✅ Controle total do sistema';
    
END $$; 