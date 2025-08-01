-- DIAGNÓSTICO SIMPLES ERRO 406 - TRANSACTIONS
-- Verificar tabela transactions e possíveis problemas

-- 1. Verificar se tabela existe
SELECT 'TABELA TRANSACTIONS' as teste,
       CASE WHEN EXISTS(
           SELECT 1 FROM pg_tables 
           WHERE tablename = 'transactions' AND schemaname = 'public'
       ) THEN '✅ EXISTE' ELSE '❌ NÃO EXISTE' END as resultado,
       'Tabela principal do erro' as observacao

UNION ALL

-- 2. Verificar colunas da tabela
SELECT 'COLUNAS TRANSACTIONS' as teste,
       count(*)::text || ' colunas' as resultado,
       string_agg(column_name, ', ' ORDER BY ordinal_position) as observacao
FROM information_schema.columns 
WHERE table_name = 'transactions' AND table_schema = 'public'

UNION ALL

-- 3. Verificar coluna date especificamente
SELECT 'COLUNA DATE' as teste,
       CASE WHEN EXISTS(
           SELECT 1 FROM information_schema.columns 
           WHERE table_name = 'transactions' AND column_name = 'date' AND table_schema = 'public'
       ) THEN '✅ EXISTE' ELSE '❌ NÃO EXISTE' END as resultado,
       'Necessária para ORDER BY date DESC' as observacao

UNION ALL

-- 4. Verificar RLS
SELECT 'RLS TRANSACTIONS' as teste,
       COALESCE((
           SELECT rowsecurity::text FROM pg_tables 
           WHERE tablename = 'transactions' AND schemaname = 'public'
       ), 'TABELA NÃO EXISTE') as resultado,
       'Row Level Security status' as observacao

UNION ALL

-- 5. Contar dados
SELECT 'DADOS TRANSACTIONS' as teste,
       COALESCE((
           SELECT count(*)::text FROM transactions
       ), '0 ou ERRO') as resultado,
       'Total de registros' as observacao

UNION ALL

-- 6. Dados do Ângelo
SELECT 'DADOS ANGELO' as teste,
       COALESCE((
           SELECT count(*)::text FROM transactions 
           WHERE user_id = '7f2dab2b-6772-46a7-9913-28247d0e6485'
       ), '0 ou ERRO') as resultado,
       'Registros do usuário Ângelo' as observacao

ORDER BY teste; 