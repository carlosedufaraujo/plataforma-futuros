-- ================================
-- VERIFICAR CONSTRAINT DO ROLE
-- ================================

-- 1. Ver todas as constraints da tabela users
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'users'::regclass;

-- 2. Ver especificamente a constraint do role
SELECT 
    conname,
    pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'users'::regclass 
AND conname LIKE '%role%';

-- 3. Ver usuários existentes e seus roles
SELECT id, email, role 
FROM users
LIMIT 10;