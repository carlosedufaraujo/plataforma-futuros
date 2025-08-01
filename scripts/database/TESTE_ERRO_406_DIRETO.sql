-- TESTE DIRETO ERRO 406 - REPRODUZIR O PROBLEMA
-- Testar a query exata que está causando o erro

-- Query que está falhando no frontend:
-- GET /transactions?select=*&user_id=eq.7f2dab2b-6772-46a7-9913-28247d0e6485&order=date.desc&limit=1

-- 1. Teste básico - acessar transactions
SELECT 'TESTE 1 - ACESSO BÁSICO' as teste;
SELECT count(*) as total_transactions FROM transactions;

-- 2. Teste com filtro user_id
SELECT 'TESTE 2 - FILTRO USER_ID' as teste;
SELECT count(*) as transactions_angelo 
FROM transactions 
WHERE user_id = '7f2dab2b-6772-46a7-9913-28247d0e6485';

-- 3. Teste com ORDER BY (possível culpado)
SELECT 'TESTE 3 - ORDER BY DATE' as teste;
SELECT id, user_id, date 
FROM transactions 
WHERE user_id = '7f2dab2b-6772-46a7-9913-28247d0e6485' 
ORDER BY date DESC;

-- 4. Teste completo (query problemática)
SELECT 'TESTE 4 - QUERY COMPLETA' as teste;
SELECT * 
FROM transactions 
WHERE user_id = '7f2dab2b-6772-46a7-9913-28247d0e6485' 
ORDER BY date DESC 
LIMIT 1; 