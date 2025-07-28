-- ================================
-- CORRIGIR POLÍTICA DE BROKERAGES
-- ================================

-- Remover política muito ampla
DROP POLICY IF EXISTS "Users can view brokerages" ON brokerages;

-- Criar política correta que verifica associação via user_brokerages
CREATE POLICY "Users can view authorized brokerages" ON brokerages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_brokerages
            WHERE user_brokerages.brokerage_id = brokerages.id
            AND user_brokerages.user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Verificar resultado
SELECT 
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'brokerages'
ORDER BY policyname;