-- ================================
-- SETUP COMPLETO DE AUTENTICAÇÃO E RLS
-- Baseado na estrutura atual do banco
-- ================================

-- PASSO 1: Criar tabela user_brokerages que está faltando
CREATE TABLE IF NOT EXISTS user_brokerages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    brokerage_id UUID REFERENCES brokerages(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'trader' CHECK (role IN ('admin', 'trader', 'viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, brokerage_id)
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_brokerages_user_id ON user_brokerages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_brokerages_brokerage_id ON user_brokerages(brokerage_id);

-- PASSO 2: Associar usuário existente com corretora existente
-- Como já existe 1 usuário e 1 corretora, vamos associá-los
INSERT INTO user_brokerages (user_id, brokerage_id, role)
SELECT u.id, b.id, 'admin'
FROM users u
CROSS JOIN brokerages b
WHERE u.email = 'carlos@acex.com'  -- Ajuste o email se necessário
AND b.nome = 'ACEX Capital Markets'
ON CONFLICT (user_id, brokerage_id) DO NOTHING;

-- PASSO 3: Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE brokerages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_brokerages ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- PASSO 4: Criar políticas RLS para tabela USERS
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authentication" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- PASSO 5: Criar políticas RLS para tabela BROKERAGES
CREATE POLICY "Users can view authorized brokerages" ON brokerages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_brokerages
            WHERE user_brokerages.brokerage_id = brokerages.id
            AND user_brokerages.user_id = auth.uid()
        )
    );

CREATE POLICY "Only admins can manage brokerages" ON brokerages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_brokerages
            WHERE user_brokerages.user_id = auth.uid()
            AND user_brokerages.brokerage_id = brokerages.id
            AND user_brokerages.role = 'admin'
        )
    );

-- PASSO 6: Criar políticas RLS para tabela USER_BROKERAGES
CREATE POLICY "Users can view own brokerage associations" ON user_brokerages
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage user_brokerages" ON user_brokerages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_brokerages ub2
            WHERE ub2.user_id = auth.uid()
            AND ub2.role = 'admin'
            AND ub2.brokerage_id IN (
                SELECT brokerage_id FROM user_brokerages WHERE id = user_brokerages.id
            )
        )
    );

-- PASSO 7: Criar políticas RLS para tabela POSITIONS
CREATE POLICY "Users can view own positions" ON positions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own positions" ON positions
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own positions" ON positions
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own positions" ON positions
    FOR DELETE USING (user_id = auth.uid());

-- PASSO 8: Criar políticas RLS para tabela TRANSACTIONS
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own transactions" ON transactions
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own transactions" ON transactions
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own transactions" ON transactions
    FOR DELETE USING (user_id = auth.uid());

-- PASSO 9: Criar políticas RLS para tabela OPTIONS
CREATE POLICY "Users can view own options" ON options
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own options" ON options
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own options" ON options
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own options" ON options
    FOR DELETE USING (user_id = auth.uid());

-- PASSO 10: Criar políticas RLS para tabela CONTRACTS
CREATE POLICY "Authenticated users can view contracts" ON contracts
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can manage contracts" ON contracts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_brokerages
            WHERE user_brokerages.user_id = auth.uid()
            AND user_brokerages.role = 'admin'
        )
    );

-- PASSO 11: Criar função para verificar acesso à corretora
CREATE OR REPLACE FUNCTION user_has_brokerage_access(brokerage_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_brokerages
        WHERE user_brokerages.user_id = auth.uid()
        AND user_brokerages.brokerage_id = $1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASSO 12: Criar trigger para associar novo usuário à corretora padrão
CREATE OR REPLACE FUNCTION assign_default_brokerage()
RETURNS TRIGGER AS $$
DECLARE
    default_brokerage_id UUID;
BEGIN
    -- Buscar a primeira corretora ativa
    SELECT id INTO default_brokerage_id
    FROM brokerages
    WHERE is_active = true
    ORDER BY created_at
    LIMIT 1;
    
    -- Se encontrou uma corretora, criar associação
    IF default_brokerage_id IS NOT NULL THEN
        INSERT INTO user_brokerages (user_id, brokerage_id, role)
        VALUES (NEW.id, default_brokerage_id, 'trader')
        ON CONFLICT DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
CREATE TRIGGER assign_default_brokerage_trigger
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION assign_default_brokerage();

-- PASSO 13: Grant permissões
GRANT EXECUTE ON FUNCTION user_has_brokerage_access(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION assign_default_brokerage() TO authenticated;

-- PASSO 14: Verificação final
SELECT 
    'SETUP COMPLETO!' as status,
    'Tabela user_brokerages criada' as acao_1,
    'RLS habilitado em todas as tabelas' as acao_2,
    'Políticas de segurança aplicadas' as acao_3,
    'Triggers configurados' as acao_4;

-- Mostrar status final
SELECT 
    tablename,
    CASE WHEN rowsecurity THEN '✅ RLS Habilitado' ELSE '❌ RLS Desabilitado' END as status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'brokerages', 'user_brokerages', 'positions', 'transactions', 'options', 'contracts')
ORDER BY tablename;