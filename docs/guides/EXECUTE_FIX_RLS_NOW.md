# 🚨 EXECUTAR URGENTE NO SUPABASE

## Problema Identificado
- Erro: "infinite recursion detected in policy for relation 'users'"
- As políticas RLS atuais estão causando recursão infinita
- Sistema não consegue carregar dados dos usuários

## Solução
Execute o arquivo `FIX_RLS_COMPLETE_V2.sql` no Supabase SQL Editor:

1. Acesse: https://supabase.com/dashboard/project/kdfevkbwohcajcwrqzor/sql/new
2. Copie TODO o conteúdo do arquivo `FIX_RLS_COMPLETE_V2.sql`
3. Cole no SQL Editor
4. Clique em "Run"

## O que o script faz:
1. Desabilita RLS temporariamente
2. Remove TODAS as políticas existentes (que estão causando recursão)
3. Cria políticas novas e simples, sem recursão
4. Reabilita RLS
5. Mostra as políticas criadas

## Após executar:
- Teste o login novamente
- O erro de recursão deve estar resolvido
- Os dados devem carregar normalmente

## Credenciais de teste:
- Admin: carloseduardo@acexcapital.com / 123456
- Usuário: angelocaiado@rialmaagropecuaria.com.br / 123456