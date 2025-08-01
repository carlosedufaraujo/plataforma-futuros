-- =================================================
-- PARTE 2: RECRIAR POLÍTICAS RLS CORRETAS
-- =================================================
-- Execute este script APÓS a PARTE 1

-- 1. REABILITAR RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE brokerages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_brokerages ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- 2. CRIAR POLÍTICAS USERS (SEM RECURSÃO)
CREATE POLICY "users_select_own" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. CRIAR POLÍTICAS USER_BROKERAGES
CREATE POLICY "user_brokerages_select" ON user_brokerages
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_brokerages_insert" ON user_brokerages
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- 4. CRIAR POLÍTICAS BROKERAGES
CREATE POLICY "brokerages_select" ON brokerages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_brokerages ub
            WHERE ub.brokerage_id = brokerages.id
            AND ub.user_id = auth.uid()
        )
    );

SELECT '=== EXECUTAR PARTE 3 AGORA ===' as proximo_passo; 