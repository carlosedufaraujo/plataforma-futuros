-- ================================
-- ROW LEVEL SECURITY POLICIES
-- ================================

-- Habilitar RLS em todas as tabelas
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