-- ================================
-- VERIFICAR ESTRUTURA DA TABELA USERS
-- ================================

-- 1. Ver todas as colunas da tabela users
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- 2. Verificar usuários existentes
SELECT 
    id,
    email,
    nome,
    role,
    created_at
FROM users
LIMIT 10;

-- 3. Verificar se há usuários no auth.users
SELECT 
    id,
    email,
    created_at
FROM auth.users
LIMIT 10;