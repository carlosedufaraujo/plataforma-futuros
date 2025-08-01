-- CORRIGIR TODAS AS POLÍTICAS RLS DO SISTEMA
-- O problema é que todas estão com role 'public' em vez de 'authenticated'

-- ================================
-- 1. TRANSACTIONS
-- ================================
DROP POLICY IF EXISTS "Admins can view all transactions" ON transactions;
DROP POLICY IF EXISTS "Users can manage own transactions" ON transactions;

-- Admins podem ver todas as transações
CREATE POLICY "Admins can view all transactions" ON transactions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Usuários podem gerenciar suas próprias transações
CREATE POLICY "Users can manage own transactions" ON transactions
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ================================
-- 2. POSITIONS
-- ================================
DROP POLICY IF EXISTS "Admins can view all positions" ON positions;
DROP POLICY IF EXISTS "Users can manage own positions" ON positions;

-- Admins podem ver todas as posições
CREATE POLICY "Admins can view all positions" ON positions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Usuários podem gerenciar suas próprias posições
CREATE POLICY "Users can manage own positions" ON positions
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ================================
-- 3. BROKERAGES
-- ================================
DROP POLICY IF EXISTS "Admins can view all brokerages" ON brokerages;
DROP POLICY IF EXISTS "Users can view authorized brokerages" ON brokerages;

-- Todos os usuários autenticados podem ver corretoras
CREATE POLICY "Users can view brokerages" ON brokerages
FOR SELECT
TO authenticated
USING (true);

-- ================================
-- 4. USER_BROKERAGES
-- ================================
DROP POLICY IF EXISTS "Admins can view all user_brokerages" ON user_brokerages;
DROP POLICY IF EXISTS "Users can view own brokerage associations" ON user_brokerages;

-- Admins podem ver todas as associações
CREATE POLICY "Admins can view all user_brokerages" ON user_brokerages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Usuários podem ver suas próprias associações
CREATE POLICY "Users can view own brokerage associations" ON user_brokerages
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- ================================
-- 5. USERS
-- ================================
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Enable insert for authentication" ON users;

-- Admins podem ver todos os usuários
CREATE POLICY "Admins can view all users" ON users
FOR SELECT
TO authenticated
USING (
  auth.uid() = id 
  OR 
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid() 
    AND u.role = 'admin'
  )
);

-- Usuários podem ver seu próprio perfil
CREATE POLICY "Users can view own profile" ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update own profile" ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Permitir inserção durante autenticação
CREATE POLICY "Enable insert for authentication" ON users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ================================
-- 6. OPTIONS
-- ================================
DROP POLICY IF EXISTS "Admins can view all options" ON options;
DROP POLICY IF EXISTS "Users can manage own options" ON options;

-- Admins podem ver todas as opções
CREATE POLICY "Admins can view all options" ON options
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Usuários podem gerenciar suas próprias opções
CREATE POLICY "Users can manage own options" ON options
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ================================
-- 7. CONTRACTS (se existir)
-- ================================
-- Todos os usuários autenticados podem ver contratos
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'contracts') THEN
    DROP POLICY IF EXISTS "Users can view contracts" ON contracts;
    CREATE POLICY "Users can view contracts" ON contracts
    FOR SELECT
    TO authenticated
    USING (true);
  END IF;
END $$;

-- ================================
-- VERIFICAR RESULTADO
-- ================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;