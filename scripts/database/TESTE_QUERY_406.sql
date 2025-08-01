-- TESTE QUERY 406 - SIMULAR A CONSULTA QUE FALHA
-- Testar a query exata que está causando erro 406

-- 1. Primeiro teste simples: verificar se conseguimos acessar transactions
SELECT 'TESTE 1: ACESSO BÁSICO' as teste,
       count(*) as total_transactions,
       'Se > 0, tabela acessível' as resultado
FROM transactions;

-- 2. Teste com filtro user_id do Ângelo
SELECT 'TESTE 2: FILTRO USER_ID' as teste,
       count(*) as total_angelo,
       'Transactions do Ângelo' as resultado  
FROM transactions 
WHERE user_id = '7f2dab2b-6772-46a7-9913-28247d0e6485';

-- 3. Teste com ordenação (pode ser o problema)
SELECT 'TESTE 3: ORDENAÇÃO DATE' as teste,
       'Tentando ORDER BY date DESC' as info,
       'Se der erro, problema na coluna' as resultado
FROM (
    SELECT * FROM transactions 
    WHERE user_id = '7f2dab2b-6772-46a7-9913-28247d0e6485' 
    ORDER BY date DESC 
    LIMIT 1
) t;

-- 4. Verificar se coluna date existe e tem dados
SELECT 'TESTE 4: COLUNA DATE' as teste,
       count(*) as total_com_date,
       'Registros com date não nulo' as resultado
FROM transactions 
WHERE date IS NOT NULL;

-- 5. Teste sem ordenação (para isolar o problema)
SELECT 'TESTE 5: SEM ORDENAÇÃO' as teste,
       count(*) as total_sem_order,
       'Query sem ORDER BY' as resultado
FROM transactions 
WHERE user_id = '7f2dab2b-6772-46a7-9913-28247d0e6485' 
LIMIT 1; 