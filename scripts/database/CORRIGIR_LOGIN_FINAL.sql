-- SCRIPT FINAL CORRIGIDO - TUDO DENTRO DO BLOCO DO
-- Força execução 100% completa

DO $$
DECLARE
    policy_count INTEGER;
    rec RECORD;
BEGIN
    RAISE NOTICE '🚀 INICIANDO CORREÇÃO DO LOGIN...';
    
    -- 1. DESABILITAR RLS EM TODAS AS TABELAS
    ALTER TABLE users DISABLE ROW LEVEL SECURITY;
    ALTER TABLE brokerages DISABLE ROW LEVEL SECURITY;
    ALTER TABLE user_brokerages DISABLE ROW LEVEL SECURITY;
    ALTER TABLE positions DISABLE ROW LEVEL SECURITY;
    ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
    ALTER TABLE options DISABLE ROW LEVEL SECURITY;
    ALTER TABLE contracts DISABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE '✅ PASSO 1: RLS desabilitado em todas as tabelas';
    
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
    
    -- Remover políticas com nomes antigos
    DROP POLICY IF EXISTS "Users can view own profile" ON users;
    DROP POLICY IF EXISTS "Users can update own profile" ON users;
    DROP POLICY IF EXISTS "Enable insert for authentication" ON users;
    DROP POLICY IF EXISTS "Users can view authorized brokerages" ON brokerages;
    DROP POLICY IF EXISTS "Users can view own brokerage associations" ON user_brokerages;
    DROP POLICY IF EXISTS "Users can manage own positions" ON positions;
    DROP POLICY IF EXISTS "Users can manage own transactions" ON transactions;
    DROP POLICY IF EXISTS "Users can manage own options" ON options;
    DROP POLICY IF EXISTS "Authenticated users can view contracts" ON contracts;
    
    RAISE NOTICE '✅ PASSO 2: Todas as políticas antigas removidas';
    
    -- 3. REABILITAR RLS
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE brokerages ENABLE ROW LEVEL SECURITY;
    ALTER TABLE user_brokerages ENABLE ROW LEVEL SECURITY;
    ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE options ENABLE ROW LEVEL SECURITY;
    ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE '✅ PASSO 3: RLS reabilitado em todas as tabelas';
    
    -- 4. CRIAR POLÍTICAS PARA USERS
    CREATE POLICY "users_select_own" ON users 
        FOR SELECT USING (auth.uid() = id);
    CREATE POLICY "users_update_own" ON users 
        FOR UPDATE USING (auth.uid() = id);
    CREATE POLICY "users_insert_own" ON users 
        FOR INSERT WITH CHECK (auth.uid() = id);
    
    RAISE NOTICE '✅ PASSO 4: Políticas de users criadas (3 políticas)';
    
    -- 5. CRIAR POLÍTICA PARA USER_BROKERAGES
    CREATE POLICY "user_brokerages_select" ON user_brokerages 
        FOR SELECT USING (user_id = auth.uid());
    
    RAISE NOTICE '✅ PASSO 5: Política de user_brokerages criada';
    
    -- 6. CRIAR POLÍTICA PARA BROKERAGES
    CREATE POLICY "brokerages_select" ON brokerages 
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM user_brokerages 
                WHERE brokerage_id = brokerages.id AND user_id = auth.uid()
            )
        );
    
    RAISE NOTICE '✅ PASSO 6: Política de brokerages criada';
    
    -- 7. CRIAR POLÍTICAS PARA DADOS DO USUÁRIO
    CREATE POLICY "positions_all" ON positions 
        FOR ALL USING (user_id = auth.uid());
    CREATE POLICY "transactions_all" ON transactions 
        FOR ALL USING (user_id = auth.uid());
    CREATE POLICY "options_all" ON options 
        FOR ALL USING (user_id = auth.uid());
    
    RAISE NOTICE '✅ PASSO 7: Políticas de dados do usuário criadas (3 políticas)';
    
    -- 8. CRIAR POLÍTICA PARA CONTRACTS
    CREATE POLICY "contracts_select" ON contracts 
        FOR SELECT USING (auth.role() = 'authenticated');
    
    RAISE NOTICE '✅ PASSO 8: Política de contracts criada';
    
    -- 9. VERIFICAR TOTAL DE POLÍTICAS CRIADAS
    SELECT count(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    RAISE NOTICE '📊 TOTAL DE POLÍTICAS CRIADAS: %', policy_count;
    
    -- 10. LISTAR POLÍTICAS CRIADAS
    RAISE NOTICE '📋 POLÍTICAS CRIADAS:';
    FOR rec IN 
        SELECT tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
        ORDER BY tablename, policyname
    LOOP
        RAISE NOTICE '   - % -> %', rec.tablename, rec.policyname;
    END LOOP;
    
    RAISE NOTICE '🎉 TODAS AS POLÍTICAS RLS FORAM CORRIGIDAS COM SUCESSO!';
    RAISE NOTICE '🔑 CREDENCIAIS PARA TESTE:';
    RAISE NOTICE '   Admin: carloseduardo@acexcapital.com / Acex@2025';
    RAISE NOTICE '   User: angelocaiado@rialmaagropecuaria.com.br / Rialma@2025';
    RAISE NOTICE '🚀 AGORA TESTE O LOGIN NA APLICAÇÃO!';
    
END $$; 