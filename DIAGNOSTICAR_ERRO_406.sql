-- DIAGNOSTICAR ERRO 406 - TRANSACTIONS
-- Verificar estrutura e dados da tabela transactions

SELECT '1. TABELA TRANSACTIONS' as categoria,
       'Existe: ' || CASE WHEN EXISTS(
           SELECT 1 FROM pg_tables 
           WHERE tablename = 'transactions' AND schemaname = 'public'
       ) THEN '✅ SIM' ELSE '❌ NÃO' END as info,
       'RLS: ' || COALESCE((
           SELECT rowsecurity::text FROM pg_tables 
           WHERE tablename = 'transactions' AND schemaname = 'public'
       ), 'N/A') as detalhe,
       'Políticas: ' || COALESCE((
           SELECT count(*)::text FROM pg_policies 
           WHERE tablename = 'transactions' AND schemaname = 'public'
       ), '0') as extra

UNION ALL

SELECT '2. ESTRUTURA TRANSACTIONS' as categoria,
       '📋 Colunas disponíveis:' as info,
       string_agg(column_name, ', ' ORDER BY ordinal_position) as detalhe,
       'Total: ' || count(*)::text as extra
FROM information_schema.columns 
WHERE table_name = 'transactions' AND table_schema = 'public'

UNION ALL

SELECT '3. DADOS TRANSACTIONS' as categoria,
       'Total registros: ' || COALESCE(count(*)::text, '0') as info,
       'Com user_id Angelo: ' || COALESCE((
           SELECT count(*)::text FROM transactions 
           WHERE user_id = '7f2dab2b-6772-46a7-9913-28247d0e6485'
       ), '0') as detalhe,
       'Erro pode ser falta de dados' as extra
FROM transactions

UNION ALL

SELECT '4. POLÍTICAS TRANSACTIONS' as categoria,
       '📋 ' || policyname as info,
       'Comando: ' || cmd as detalhe,
       'Using: ' || COALESCE(substring(quals, 1, 50), 'N/A') as extra
FROM pg_policies 
WHERE tablename = 'transactions' AND schemaname = 'public'

UNION ALL

SELECT '5. TESTE QUERY ANGELO' as categoria,
       'Simulando query que falha:' as info,
       'SELECT * FROM transactions WHERE user_id = ... ORDER BY date DESC LIMIT 1' as detalhe,
       'Verificar se funciona manualmente' as extra

UNION ALL

SELECT '6. COLUNA DATE' as categoria,
       'Tipo: ' || COALESCE(data_type, 'NÃO EXISTE') as info,
       'Nullable: ' || COALESCE(is_nullable, 'N/A') as detalhe,
       'Problema pode ser na ordenação' as extra
FROM information_schema.columns 
WHERE table_name = 'transactions' AND column_name = 'date' AND table_schema = 'public'

ORDER BY categoria; 