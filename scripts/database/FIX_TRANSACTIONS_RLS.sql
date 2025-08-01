-- Verificar e corrigir RLS para transactions
-- Primeiro verificar as políticas existentes
SELECT * FROM pg_policies 
WHERE tablename = 'transactions';

-- Recriar políticas de forma mais simples
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;

-- Política de leitura - usuários podem ver suas próprias transações
CREATE POLICY "Users can view own transactions" ON transactions
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR 
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Política de inserção
CREATE POLICY "Users can insert own transactions" ON transactions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Política de atualização
CREATE POLICY "Users can update own transactions" ON transactions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política de exclusão
CREATE POLICY "Users can delete own transactions" ON transactions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Verificar se RLS está habilitado
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Testar se funciona
SELECT count(*) FROM transactions;
EOF < /dev/null