-- ================================
-- SETUP COMPLETO: TABELAS + RLS
-- ================================

-- Primeiro, verificar se as tabelas existem e criar as que faltam

-- Tabela de relação usuário-corretora (que está faltando)
CREATE TABLE IF NOT EXISTS user_brokerages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    brokerage_id UUID REFERENCES brokerages(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'trader' CHECK (role IN ('admin', 'trader', 'viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, brokerage_id)
);

-- ================================
-- HABILITAR RLS EM TODAS AS TABELAS
-- ================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE brokerages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_brokerages ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- ================================
-- POLÍTICAS PARA TABELA USERS
-- ================================

-- Dropar políticas existentes se houver
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Enable insert for authentication" ON users;

-- Usuários podem ver apenas seu próprio registro
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Permitir inserção durante o registro (público)
CREATE POLICY "Enable insert for authentication" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- ================================
-- POLÍTICAS PARA TABELA BROKERAGES
-- ================================

-- Dropar políticas existentes se houver
DROP POLICY IF EXISTS "Users can view authorized brokerages" ON brokerages;
DROP POLICY IF EXISTS "Only admins can insert brokerages" ON brokerages;
DROP POLICY IF EXISTS "Only admins can update brokerages" ON brokerages;

-- Usuários podem ver corretoras às quais têm acesso
CREATE POLICY "Users can view authorized brokerages" ON brokerages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_brokerages
            WHERE user_brokerages.brokerage_id = brokerages.id
            AND user_brokerages.user_id = auth.uid()
        )
    );

-- Apenas admins podem criar/atualizar corretoras
CREATE POLICY "Only admins can insert brokerages" ON brokerages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.email IN ('admin@acex.com', 'carlos@acex.com')
        )
    );

CREATE POLICY "Only admins can update brokerages" ON brokerages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.email IN ('admin@acex.com', 'carlos@acex.com')
        )
    );

-- ================================
-- POLÍTICAS PARA TABELA USER_BROKERAGES
-- ================================

-- Dropar políticas existentes se houver
DROP POLICY IF EXISTS "Users can view own brokerage associations" ON user_brokerages;
DROP POLICY IF EXISTS "Admins can manage user_brokerages" ON user_brokerages;

-- Usuários podem ver suas próprias associações
CREATE POLICY "Users can view own brokerage associations" ON user_brokerages
    FOR SELECT USING (user_id = auth.uid());

-- Admins podem gerenciar associações
CREATE POLICY "Admins can manage user_brokerages" ON user_brokerages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.email IN ('admin@acex.com', 'carlos@acex.com')
        )
    );

-- ================================
-- POLÍTICAS PARA TABELA POSITIONS
-- ================================

-- Dropar políticas existentes se houver
DROP POLICY IF EXISTS "Users can view own positions" ON positions;
DROP POLICY IF EXISTS "Users can create own positions" ON positions;
DROP POLICY IF EXISTS "Users can update own positions" ON positions;
DROP POLICY IF EXISTS "Users can delete own positions" ON positions;

-- Usuários podem ver apenas suas próprias posições
CREATE POLICY "Users can view own positions" ON positions
    FOR SELECT USING (user_id = auth.uid());

-- Usuários podem criar suas próprias posições
CREATE POLICY "Users can create own positions" ON positions
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Usuários podem atualizar suas próprias posições
CREATE POLICY "Users can update own positions" ON positions
    FOR UPDATE USING (user_id = auth.uid());

-- Usuários podem deletar suas próprias posições
CREATE POLICY "Users can delete own positions" ON positions
    FOR DELETE USING (user_id = auth.uid());

-- ================================
-- POLÍTICAS PARA TABELA TRANSACTIONS
-- ================================

-- Dropar políticas existentes se houver
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can create own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;

-- Usuários podem ver apenas suas próprias transações
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (user_id = auth.uid());

-- Usuários podem criar suas próprias transações
CREATE POLICY "Users can create own transactions" ON transactions
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Usuários podem atualizar suas próprias transações
CREATE POLICY "Users can update own transactions" ON transactions
    FOR UPDATE USING (user_id = auth.uid());

-- Usuários podem deletar suas próprias transações
CREATE POLICY "Users can delete own transactions" ON transactions
    FOR DELETE USING (user_id = auth.uid());

-- ================================
-- POLÍTICAS PARA TABELA OPTIONS
-- ================================

-- Dropar políticas existentes se houver
DROP POLICY IF EXISTS "Users can view own options" ON options;
DROP POLICY IF EXISTS "Users can create own options" ON options;
DROP POLICY IF EXISTS "Users can update own options" ON options;
DROP POLICY IF EXISTS "Users can delete own options" ON options;

-- Usuários podem ver apenas suas próprias opções
CREATE POLICY "Users can view own options" ON options
    FOR SELECT USING (user_id = auth.uid());

-- Usuários podem criar suas próprias opções
CREATE POLICY "Users can create own options" ON options
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Usuários podem atualizar suas próprias opções
CREATE POLICY "Users can update own options" ON options
    FOR UPDATE USING (user_id = auth.uid());

-- Usuários podem deletar suas próprias opções
CREATE POLICY "Users can delete own options" ON options
    FOR DELETE USING (user_id = auth.uid());

-- ================================
-- POLÍTICAS PARA TABELA CONTRACTS
-- ================================

-- Dropar políticas existentes se houver
DROP POLICY IF EXISTS "Authenticated users can view contracts" ON contracts;
DROP POLICY IF EXISTS "Only admins can manage contracts" ON contracts;

-- Todos os usuários autenticados podem ver contratos (dados públicos)
CREATE POLICY "Authenticated users can view contracts" ON contracts
    FOR SELECT USING (auth.role() = 'authenticated');

-- Apenas admins podem gerenciar contratos
CREATE POLICY "Only admins can manage contracts" ON contracts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.email IN ('admin@acex.com', 'carlos@acex.com')
        )
    );

-- ================================
-- FUNÇÃO HELPER PARA VERIFICAR ACESSO À CORRETORA
-- ================================

-- Dropar função se existir
DROP FUNCTION IF EXISTS user_has_brokerage_access(UUID);

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

-- ================================
-- INSERIR ASSOCIAÇÃO PADRÃO APÓS REGISTRO
-- ================================

-- Dropar função e trigger se existirem
DROP TRIGGER IF EXISTS assign_default_brokerage_trigger ON users;
DROP FUNCTION IF EXISTS assign_default_brokerage();

-- Trigger para associar usuário à primeira corretora após registro
CREATE OR REPLACE FUNCTION assign_default_brokerage()
RETURNS TRIGGER AS $$
DECLARE
    default_brokerage_id UUID;
BEGIN
    -- Buscar a primeira corretora ativa (ACEX Capital Markets)
    SELECT id INTO default_brokerage_id
    FROM brokerages
    WHERE is_active = true
    ORDER BY created_at
    LIMIT 1;
    
    -- Se encontrou uma corretora, criar associação
    IF default_brokerage_id IS NOT NULL THEN
        INSERT INTO user_brokerages (user_id, brokerage_id, role)
        VALUES (NEW.id, default_brokerage_id, 'trader');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
CREATE TRIGGER assign_default_brokerage_trigger
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION assign_default_brokerage();

-- ================================
-- GRANT PERMISSÕES NECESSÁRIAS
-- ================================

-- Permitir que usuários autenticados executem funções
GRANT EXECUTE ON FUNCTION user_has_brokerage_access(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION assign_default_brokerage() TO authenticated;

-- ================================
-- CRIAR ÍNDICES PARA PERFORMANCE
-- ================================

CREATE INDEX IF NOT EXISTS idx_user_brokerages_user_id ON user_brokerages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_brokerages_brokerage_id ON user_brokerages(brokerage_id);

-- ================================
-- INSERIR DADOS DE EXEMPLO (SE NECESSÁRIO)
-- ================================

-- Se já existe um usuário admin, criar associação com a corretora padrão
DO $$
DECLARE
    admin_user_id UUID;
    default_brokerage_id UUID;
BEGIN
    -- Buscar usuário admin
    SELECT id INTO admin_user_id
    FROM users
    WHERE email IN ('admin@acex.com', 'carlos@acex.com')
    LIMIT 1;
    
    -- Buscar corretora ACEX
    SELECT id INTO default_brokerage_id
    FROM brokerages
    WHERE nome = 'ACEX Capital Markets'
    LIMIT 1;
    
    -- Se ambos existem e não há associação, criar
    IF admin_user_id IS NOT NULL AND default_brokerage_id IS NOT NULL THEN
        INSERT INTO user_brokerages (user_id, brokerage_id, role)
        VALUES (admin_user_id, default_brokerage_id, 'admin')
        ON CONFLICT (user_id, brokerage_id) DO NOTHING;
    END IF;
END $$;

-- ================================
-- VERIFICAÇÃO FINAL
-- ================================

-- Listar tabelas com RLS habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'brokerages', 'user_brokerages', 'positions', 'transactions', 'options', 'contracts')
ORDER BY tablename;