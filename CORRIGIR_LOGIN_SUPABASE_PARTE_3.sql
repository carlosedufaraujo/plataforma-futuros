-- =================================================
-- PARTE 3: FINALIZAR POLÍTICAS E VERIFICAR
-- =================================================
-- Execute este script APÓS a PARTE 2

-- 1. CRIAR POLÍTICAS PARA DADOS DO USUÁRIO
CREATE POLICY "positions_all" ON positions
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "transactions_all" ON transactions
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "options_all" ON options
    FOR ALL USING (user_id = auth.uid());

-- 2. CRIAR POLÍTICA PARA CONTRACTS (DADOS PÚBLICOS)
CREATE POLICY "contracts_select" ON contracts
    FOR SELECT USING (auth.role() = 'authenticated');

-- 3. VERIFICAR RESULTADO FINAL
SELECT '=== RLS CORRIGIDO COM SUCESSO ===' as status;

SELECT 
    'Total de políticas criadas:' as info,
    count(*) as total
FROM pg_policies 
WHERE schemaname = 'public';

-- 4. LISTAR POLÍTICAS CRIADAS
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. VERIFICAR USUÁRIOS EXISTENTES
SELECT 
    '=== USUÁRIOS CADASTRADOS ===' as info,
    email,
    nome,
    is_active,
    role
FROM users
ORDER BY created_at DESC;

-- 6. CREDENCIAIS PARA TESTE
SELECT '=== CREDENCIAIS PARA TESTE ===' as info;
SELECT 'Admin: carloseduardo@acexcapital.com / Acex@2025' as credencial_1;
SELECT 'User: angelocaiado@rialmaagropecuaria.com.br / Rialma@2025' as credencial_2;

SELECT '=== AGORA TESTE O LOGIN NA APLICAÇÃO ===' as final_step; 