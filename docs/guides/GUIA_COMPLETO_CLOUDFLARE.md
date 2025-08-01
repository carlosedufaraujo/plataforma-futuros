# 🚀 Guia Completo para Deploy no Cloudflare - Passo a Passo Simplificado

## 📋 O que vamos fazer

Vamos configurar seu sistema para funcionar no Cloudflare. Atualmente o sistema roda localmente no seu computador, mas queremos que ele funcione na internet através do Cloudflare.

## 🔍 Situação Atual

### ✅ O que já está funcionando:
- Sistema rodando localmente (http://localhost:3000)
- Banco de dados Supabase configurado
- Login funcionando com usuários pré-cadastrados
- Código no GitHub

### ❌ O que precisa ser corrigido:
- Configurar secrets no GitHub para o deploy automático
- Garantir que as variáveis de ambiente estejam corretas no Cloudflare

## 📝 Passo a Passo

### Passo 1: Obter o API Token do Cloudflare

1. **Acesse o Cloudflare**
   - Abra seu navegador
   - Entre em: https://dash.cloudflare.com/
   - Faça login com seu email e senha

2. **Criar um API Token**
   - No menu superior direito, clique no ícone do seu perfil
   - Clique em "My Profile"
   - No menu lateral, clique em "API Tokens"
   - Clique no botão azul "Create Token"

3. **Configurar o Token**
   - Clique em "Create Custom Token"
   - Em "Token name", coloque: `GitHub Actions Deploy`
   - Em "Permissions", adicione:
     - Account → Cloudflare Pages → Edit
   - Em "Account Resources", selecione sua conta
   - Clique em "Continue to summary"
   - Clique em "Create Token"

4. **Copiar o Token**
   - ⚠️ IMPORTANTE: O token aparecerá apenas uma vez!
   - Copie o token que aparece (algo como: `1234567890abcdef...`)
   - Cole em um lugar seguro temporariamente (Bloco de Notas)

### Passo 2: Obter o Account ID do Cloudflare

1. **Voltar ao Dashboard**
   - Clique em "Cloudflare" no topo da página
   - Você verá sua conta listada

2. **Copiar o Account ID**
   - Na página principal do dashboard
   - No lado direito, procure por "Account ID"
   - Copie este ID (algo como: `a1b2c3d4e5f6...`)

### Passo 3: Configurar Secrets no GitHub

1. **Acessar seu Repositório**
   - Abra: https://github.com/carlosedufaraujo/plataforma-futuros
   - Faça login se necessário

2. **Ir para Settings**
   - Clique na aba "Settings" (última aba no menu superior)
   - No menu lateral esquerdo, procure por "Secrets and variables"
   - Clique em "Actions"

3. **Adicionar os Secrets**
   
   Clique em "New repository secret" e adicione cada um:

   **Secret 1:**
   - Name: `CLOUDFLARE_API_TOKEN`
   - Secret: (cole o token do Passo 1)
   - Clique "Add secret"

   **Secret 2:**
   - Name: `CLOUDFLARE_ACCOUNT_ID`
   - Secret: (cole o ID do Passo 2)
   - Clique "Add secret"

   **Secret 3:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Secret: `https://kdfevkbwohcajcwrqzor.supabase.co`
   - Clique "Add secret"

   **Secret 4:**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Secret: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkZmV2a2J3b2hjYWpjd3Jxem9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMTUzODcsImV4cCI6MjA2ODg5MTM4N30.4nBjKi3rdpfbYmxeoa8GELdBLq8JY6ym68cJX7jpaus`
   - Clique "Add secret"

### Passo 4: Verificar Variáveis no Cloudflare Pages

1. **Acessar Cloudflare Pages**
   - Volte ao dashboard do Cloudflare
   - Clique em "Workers & Pages" no menu lateral
   - Clique no projeto "boi-gordo-investimentos" (ou "plataforma-futuros")

2. **Configurar Variáveis de Ambiente**
   - Clique em "Settings"
   - Clique em "Environment variables"
   - Verifique se estas variáveis existem:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   
   Se não existirem, adicione:
   - Clique "Add variable"
   - Nome: `NEXT_PUBLIC_SUPABASE_URL`
   - Valor: `https://kdfevkbwohcajcwrqzor.supabase.co`
   - Environment: Production
   - Clique "Save"
   
   Repita para a segunda variável.

### Passo 5: Testar o Deploy

1. **Fazer um pequeno commit**
   - Voltando ao terminal onde você roda o sistema
   - Execute:
   ```bash
   git add .
   git commit -m "test: Testando deploy automático"
   git push
   ```

2. **Verificar o Deploy**
   - Volte ao GitHub
   - Clique na aba "Actions"
   - Você deve ver um workflow rodando
   - Aguarde ficar verde (sucesso)

3. **Acessar o Site**
   - Após o deploy bem-sucedido
   - Acesse: https://boi-gordo-investimentos.pages.dev
   - Ou o domínio que você configurou

## 🆘 Solução de Problemas

### Se aparecer erro "Invalid API key":
- As variáveis de ambiente não estão configuradas corretamente no Cloudflare Pages
- Volte ao Passo 4 e verifique novamente

### Se o deploy falhar no GitHub:
- Verifique se todos os 4 secrets foram adicionados corretamente
- O nome deve ser EXATAMENTE como mostrado (maiúsculas e minúsculas importam)

### Se o site não carregar:
- Aguarde 5-10 minutos após o deploy
- Limpe o cache do navegador (Ctrl+F5)
- Verifique o console do navegador (F12) para erros

## 📞 Precisa de Ajuda?

Se algo não funcionar:
1. Tire um print da tela de erro
2. Copie a mensagem de erro
3. Me mostre para eu poder ajudar melhor

## ✅ Checklist Final

- [ ] API Token do Cloudflare criado e copiado
- [ ] Account ID do Cloudflare copiado
- [ ] 4 Secrets adicionados no GitHub
- [ ] Variáveis de ambiente verificadas no Cloudflare Pages
- [ ] Deploy testado com sucesso
- [ ] Site acessível no navegador