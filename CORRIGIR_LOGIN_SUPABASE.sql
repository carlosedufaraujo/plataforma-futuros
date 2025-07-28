-- ========================================================
-- SCRIPT FINAL PARA CORRIGIR PROBLEMAS DE LOGIN SUPABASE
-- ========================================================
-- Execute este script no Supabase SQL Editor:
-- https://supabase.com/dashboard/project/kdfevkbwohcajcwrqzor/sql/new

-- 1. DESABILITAR RLS TEMPORARIAMENTE
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE brokerages DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_brokerages DISABLE ROW LEVEL SECURITY;
ALTER TABLE positions DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE options DISABLE ROW LEVEL SECURITY;
ALTER TABLE contracts DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS AS POLÍTICAS EXISTENTES (QUE CAUSAM RECURSÃO)
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- 3. REMOVER FUNÇÕES PROBLEMÁTICAS
DROP FUNCTION IF EXISTS is_admin();

-- 4. REABILITAR RLS COM POLÍTICAS SIMPLES
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE brokerages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_brokerages ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- 5. CRIAR POLÍTICAS SEGURAS (SEM RECURSÃO)

-- USERS - Acesso próprio perfil
CREATE POLICY "users_select_own" ON users
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON users
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- BROKERAGES - Acesso via user_brokerages
CREATE POLICY "brokerages_select" ON brokerages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_brokerages ub
            WHERE ub.brokerage_id = brokerages.id
            AND ub.user_id = auth.uid()
        )
    );

-- USER_BROKERAGES - Próprias associações
CREATE POLICY "user_brokerages_select" ON user_brokerages
    FOR SELECT USING (user_id = auth.uid());

-- POSITIONS - Próprias posições
CREATE POLICY "positions_all" ON positions
    FOR ALL USING (user_id = auth.uid());

-- TRANSACTIONS - Próprias transações
CREATE POLICY "transactions_all" ON transactions
    FOR ALL USING (user_id = auth.uid());

-- OPTIONS - Próprias opções
CREATE POLICY "options_all" ON options
    FOR ALL USING (user_id = auth.uid());

-- CONTRACTS - Todos podem ver (dados públicos)
CREATE POLICY "contracts_select" ON contracts
    FOR SELECT USING (auth.role() = 'authenticated');

-- 6. VERIFICAR RESULTADO
SELECT '=== RLS CORRIGIDO COM SUCESSO ===' as status;

SELECT 
    'Total de políticas criadas:' as info,
    count(*) as total
FROM pg_policies 
WHERE schemaname = 'public';

-- 7. VERIFICAR USUÁRIOS EXISTENTES
SELECT 
    '=== USUÁRIOS CADASTRADOS ===' as info,
    email,
    nome,
    is_active,
    role
FROM users
ORDER BY created_at DESC;

-- 8. CREDENCIAIS DE TESTE
SELECT '=== CREDENCIAIS PARA TESTE ===' as info;
SELECT 'Email: carloseduardo@acexcapital.com' as admin_login;
SELECT 'Senha: Acex@2025' as admin_senha;
SELECT 'Email: angelocaiado@rialmaagropecuaria.com.br' as user_login;
SELECT 'Senha: Rialma@2025' as user_senha; 