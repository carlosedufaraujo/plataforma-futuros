-- =================================================
-- PARTE 1: LIMPAR POLÍTICAS RLS PROBLEMÁTICAS
-- =================================================
-- Execute este script PRIMEIRO no Supabase SQL Editor

-- 1. DESABILITAR RLS TEMPORARIAMENTE
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE brokerages DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_brokerages DISABLE ROW LEVEL SECURITY;
ALTER TABLE positions DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE options DISABLE ROW LEVEL SECURITY;
ALTER TABLE contracts DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS AS POLÍTICAS EXISTENTES
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- 3. REMOVER FUNÇÕES PROBLEMÁTICAS
DROP FUNCTION IF EXISTS is_admin();

-- 4. VERIFICAR LIMPEZA
SELECT 
    'Políticas removidas com sucesso!' as status,
    count(*) as politicas_restantes
FROM pg_policies 
WHERE schemaname = 'public';

SELECT '=== EXECUTAR PARTE 2 AGORA ===' as proximo_passo; 