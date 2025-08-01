# Configuração de Secrets no GitHub

Para que o deploy automático funcione, você precisa configurar os seguintes secrets no GitHub:

## 1. Obter o Cloudflare API Token

1. Acesse [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Clique em "Create Token"
3. Use o template "Custom token" com as seguintes permissões:
   - **Account**: Cloudflare Pages:Edit
   - **Zone**: Page Rules:Edit (se aplicável)
4. Copie o token gerado

## 2. Obter o Cloudflare Account ID

1. No [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Selecione sua conta
3. Na página principal, você verá o "Account ID" no lado direito
4. Copie este ID

## 3. Adicionar Secrets no GitHub

1. Vá para o repositório: https://github.com/carlosedufaraujo/plataforma-futuros
2. Clique em **Settings** → **Secrets and variables** → **Actions**
3. Clique em **New repository secret**
4. Adicione os seguintes secrets:

### CLOUDFLARE_API_TOKEN
- Name: `CLOUDFLARE_API_TOKEN`
- Value: (cole o token da etapa 1)

### CLOUDFLARE_ACCOUNT_ID
- Name: `CLOUDFLARE_ACCOUNT_ID`
- Value: (cole o ID da etapa 2)

### NEXT_PUBLIC_SUPABASE_URL
- Name: `NEXT_PUBLIC_SUPABASE_URL`
- Value: `https://kdfevkbwohcajcwrqzor.supabase.co`

### NEXT_PUBLIC_SUPABASE_ANON_KEY
- Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkZmV2a2J3b2hjYWpjd3Jxem9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMTUzODcsImV4cCI6MjA2ODg5MTM4N30.4nBjKi3rdpfbYmxeoa8GELdBLq8JY6ym68cJX7jpaus`

## 4. Verificar

Após adicionar todos os secrets:
1. Faça um commit ou push para a branch main
2. Vá para a aba **Actions** no GitHub
3. Verifique se o workflow "Deploy to Cloudflare" está executando sem erros

## Nota de Segurança

- O `GITHUB_TOKEN` é automaticamente fornecido pelo GitHub Actions
- Nunca compartilhe ou commite estes tokens no código
- Os secrets são criptografados e só podem ser acessados durante a execução do workflow