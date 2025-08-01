# ⚠️ CORREÇÃO URGENTE - Erro de Recursão RLS

## Problema
O sistema está apresentando erro: **"infinite recursion detected in policy for relation 'users'"**

## Solução
Execute o arquivo `FIX_RLS_RECURSION.sql` no Supabase SQL Editor.

### Passos:
1. Acesse: https://supabase.com/dashboard/project/kdfevkbwohcajcwrqzor/sql
2. Copie TODO o conteúdo do arquivo `FIX_RLS_RECURSION.sql`
3. Cole no SQL Editor
4. Clique em "Run" ou pressione Ctrl+Enter
5. Aguarde a execução completa

### O que o script faz:
- Remove todas as políticas RLS existentes que estão causando recursão
- Cria políticas novas e corrigidas sem referências circulares
- Cria uma função segura `is_admin()` para verificar admins
- Recria todas as políticas necessárias de forma otimizada

### Verificação:
Após executar, o sistema deve voltar a funcionar normalmente.
Teste acessando: https://plataforma-futuros.pages.dev