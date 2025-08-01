-- SCRIPT ÚNICO PARA CORRIGIR LOGIN - EXECUTA TUDO DE UMA VEZ
-- Força execução completa usando bloco DO

DO $$
BEGIN
    -- 1. DESABILITAR RLS EM TODAS AS TABELAS
    ALTER TABLE users DISABLE ROW LEVEL SECURITY;
    ALTER TABLE brokerages DISABLE ROW LEVEL SECURITY;
    ALTER TABLE user_brokerages DISABLE ROW LEVEL SECURITY;
    ALTER TABLE positions DISABLE ROW LEVEL SECURITY;
    ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
    ALTER TABLE options DISABLE ROW LEVEL SECURITY;
    ALTER TABLE contracts DISABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE '✅ RLS desabilitado em todas as tabelas';
    
    -- 2. REMOVER TODAS AS POLÍTICAS EXISTENTES
    DROP POLICY IF EXISTS "users_select_own" ON users;
    DROP POLICY IF EXISTS "users_update_own" ON users;
    DROP POLICY IF EXISTS "users_insert_own" ON users;
    DROP POLICY IF EXISTS "brokerages_select" ON brokerages;
    DROP POLICY IF EXISTS "user_brokerages_select" ON user_brokerages;
    DROP POLICY IF EXISTS "positions_all" ON positions;
    DROP POLICY IF EXISTS "transactions_all" ON transactions;
    DROP POLICY IF EXISTS "options_all" ON options;
    DROP POLICY IF EXISTS "contracts_select" ON contracts;
    
    -- Remover políticas com nomes antigos também
    DROP POLICY IF EXISTS "Users can view own profile" ON users;
    DROP POLICY IF EXISTS "Users can update own profile" ON users;
    DROP POLICY IF EXISTS "Enable insert for authentication" ON users;
    DROP POLICY IF EXISTS "Users can view authorized brokerages" ON brokerages;
    DROP POLICY IF EXISTS "Users can view own brokerage associations" ON user_brokerages;
    DROP POLICY IF EXISTS "Users can manage own positions" ON positions;
    DROP POLICY IF EXISTS "Users can manage own transactions" ON transactions;
    DROP POLICY IF EXISTS "Users can manage own options" ON options;
    DROP POLICY IF EXISTS "Authenticated users can view contracts" ON contracts;
    
    RAISE NOTICE '✅ Todas as políticas removidas';
    
    -- 3. REABILITAR RLS
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE brokerages ENABLE ROW LEVEL SECURITY;
    ALTER TABLE user_brokerages ENABLE ROW LEVEL SECURITY;
    ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE options ENABLE ROW LEVEL SECURITY;
    ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE '✅ RLS reabilitado em todas as tabelas';
    
    -- 4. CRIAR POLÍTICAS PARA USERS
    CREATE POLICY "users_select_own" ON users 
        FOR SELECT USING (auth.uid() = id);
    CREATE POLICY "users_update_own" ON users 
        FOR UPDATE USING (auth.uid() = id);
    CREATE POLICY "users_insert_own" ON users 
        FOR INSERT WITH CHECK (auth.uid() = id);
    
    RAISE NOTICE '✅ Políticas de users criadas';
    
    -- 5. CRIAR POLÍTICA PARA USER_BROKERAGES
    CREATE POLICY "user_brokerages_select" ON user_brokerages 
        FOR SELECT USING (user_id = auth.uid());
    
    RAISE NOTICE '✅ Política de user_brokerages criada';
    
    -- 6. CRIAR POLÍTICA PARA BROKERAGES
    CREATE POLICY "brokerages_select" ON brokerages 
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM user_brokerages 
                WHERE brokerage_id = brokerages.id AND user_id = auth.uid()
            )
        );
    
    RAISE NOTICE '✅ Política de brokerages criada';
    
    -- 7. CRIAR POLÍTICAS PARA DADOS DO USUÁRIO
    CREATE POLICY "positions_all" ON positions 
        FOR ALL USING (user_id = auth.uid());
    CREATE POLICY "transactions_all" ON transactions 
        FOR ALL USING (user_id = auth.uid());
    CREATE POLICY "options_all" ON options 
        FOR ALL USING (user_id = auth.uid());
    
    RAISE NOTICE '✅ Políticas de dados do usuário criadas';
    
    -- 8. CRIAR POLÍTICA PARA CONTRACTS
    CREATE POLICY "contracts_select" ON contracts 
        FOR SELECT USING (auth.role() = 'authenticated');
    
    RAISE NOTICE '✅ Política de contracts criada';
    
    RAISE NOTICE '🎉 TODAS AS POLÍTICAS RLS FORAM CORRIGIDAS COM SUCESSO!';
    
END $$;

-- VERIFICAR RESULTADO
SELECT 
    '🎯 SCRIPT EXECUTADO COM SUCESSO!' as status,
    'Total de políticas criadas: ' || count(*)::text as info
FROM pg_policies 
WHERE schemaname = 'public';

-- MOSTRAR POLÍTICAS CRIADAS
SELECT 
    '📋 POLÍTICAS CRIADAS:' as info,
    tablename,
    policyname
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- CREDENCIAIS PARA TESTE
SELECT '🔑 CREDENCIAIS PARA TESTE:' as info;
SELECT 'Admin: carloseduardo@acexcapital.com / Acex@2025' as credencial_admin;
SELECT 'User: angelocaiado@rialmaagropecuaria.com.br / Rialma@2025' as credencial_user; 