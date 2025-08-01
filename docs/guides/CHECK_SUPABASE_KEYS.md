# ⚠️ PROBLEMA IDENTIFICADO: Chave Supabase Incorreta

## Problema
Você está usando a mesma chave para `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY`. 

A chave que começa com `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` e tem `"role":"service_role"` é a chave SERVICE, não a ANON.

## Solução

1. **Acesse o Supabase Dashboard**
   - Entre em: https://supabase.com/dashboard
   - Selecione seu projeto

2. **Obtenha a chave ANON correta**
   - Vá em: Settings → API
   - Procure por "Project API keys"
   - Copie a chave "anon public" (NÃO a service_role)

3. **Atualize o arquivo .env.local**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://kdfevkbwohcajcwrqzor.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[COLE AQUI A CHAVE ANON PUBLIC]
   SUPABASE_SERVICE_ROLE_KEY=[MANTENHA A CHAVE SERVICE_ROLE ATUAL]
   ```

4. **Reinicie o servidor**
   ```bash
   # Pare o servidor (Ctrl+C)
   # Inicie novamente
   npm run dev
   ```

## Como identificar a chave correta

- **Chave ANON**: Tem `"role":"anon"` quando decodificada
- **Chave SERVICE**: Tem `"role":"service_role"` quando decodificada

## Teste de Debug

Após atualizar, acesse: http://localhost:3000/debug-connection

Isso mostrará o status da conexão e ajudará a identificar problemas.