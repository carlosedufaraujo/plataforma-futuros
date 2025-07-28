-- ================================
-- VERIFICAR E ADICIONAR COLUNA ROLE
-- ================================

-- Verificar se a coluna role existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'role'
        ) THEN '✅ Coluna role já existe'
        ELSE '❌ Coluna role NÃO existe - execute: ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT ''trader'' CHECK (role IN (''admin'', ''trader'', ''viewer''));'
    END as "Status da Coluna Role";