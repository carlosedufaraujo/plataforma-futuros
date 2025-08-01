-- CORREÇÃO MÍNIMA ERRO 406 - APENAS CAMPOS ESSENCIAIS
-- Inserir com mínimo de campos, deixar defaults funcionarem

-- 1. Tentar inserção muito simples (apenas user_id e date)
INSERT INTO transactions (user_id, date) 
VALUES ('7f2dab2b-6772-46a7-9913-28247d0e6485', CURRENT_TIMESTAMP);

-- 2. Se der erro, tentar com mais campos essenciais
-- INSERT INTO transactions (user_id, date, contract, quantity, price, total) 
-- VALUES ('7f2dab2b-6772-46a7-9913-28247d0e6485', CURRENT_TIMESTAMP, 'CCMK25', 1, 50.00, 50.00);

-- 3. Verificar se inseriu
SELECT 'SUCESSO!' as resultado, count(*) as total
FROM transactions 
WHERE user_id = '7f2dab2b-6772-46a7-9913-28247d0e6485';

-- 4. Ver que dados foram criados
SELECT user_id, date, type, status, contract, quantity, price
FROM transactions 
WHERE user_id = '7f2dab2b-6772-46a7-9913-28247d0e6485';

-- 5. Testar query problemática
SELECT 'TESTE QUERY:' as info;
SELECT * 
FROM transactions 
WHERE user_id = '7f2dab2b-6772-46a7-9913-28247d0e6485' 
ORDER BY date DESC 
LIMIT 1; 