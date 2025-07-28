# Guia Completo de Configuração de Variáveis de Ambiente no Cloudflare Pages

## ⚠️ IMPORTANTE: Problema Identificado

Você mencionou que já adicionou as variáveis anteriormente, mas a aplicação ainda não está conseguindo acessá-las. Isso pode ocorrer por algumas razões que vamos resolver.

## Variáveis Necessárias

A aplicação precisa de **7 variáveis de ambiente**:

### 1. Variáveis OBRIGATÓRIAS (Supabase)
```
NEXT_PUBLIC_SUPABASE_URL=https://kdfevkbwohcajcwrqzor.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkZmV2a2J3b2hjYWpjd3Jxem9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMTUzODcsImV4cCI6MjA2ODg5MTM4N30.4nBjKi3rdpfbYmxeoa8GELdBLq8JY6ym68cJX7jpaus
```

### 2. Variáveis OPCIONAIS (MCP e API)
```
NEXT_PUBLIC_MCP_URL=https://boi-gordo-mcp-official.carlosedufaraujo.workers.dev
NEXT_PUBLIC_MCP_TOKEN=development-token
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

### 3. Variável de Service Role (NÃO adicionar no Cloudflare Pages)
```
# Esta NÃO deve ser adicionada no frontend por questões de segurança:
SUPABASE_SERVICE_ROLE_KEY=... (manter apenas local)
```

## 📋 Passo a Passo para Configuração

### Passo 1: Acessar o Dashboard do Cloudflare

1. Acesse: https://dash.cloudflare.com
2. Faça login com sua conta
3. No menu lateral, clique em **"Workers & Pages"**
4. Localize o projeto **"plataforma-futuros"** e clique nele

### Passo 2: Acessar Configurações de Variáveis

1. No projeto, clique na aba **"Settings"** (Configurações)
2. No menu lateral, clique em **"Environment variables"**
3. Você verá duas seções:
   - **Production** (Produção)
   - **Preview** (Preview/Staging)

### Passo 3: Verificar Variáveis Existentes

**IMPORTANTE**: Se você já adicionou variáveis anteriormente, verifique:

1. Se os nomes estão EXATAMENTE como listado acima (incluindo NEXT_PUBLIC_)
2. Se não há espaços extras no início ou fim dos valores
3. Se as variáveis estão na seção **Production**

### Passo 4: Adicionar/Editar Variáveis

Para CADA variável, faça:

1. Clique em **"Add variable"** (ou "Edit" se já existir)
2. **Variable name**: Cole o nome EXATAMENTE como está acima
3. **Value**: Cole o valor SEM aspas
4. **Importante**: Marque a opção **"Encrypt"** para as chaves sensíveis
5. Clique em **"Save"**

### Passo 5: Aplicar em Production e Preview

1. Adicione as mesmas variáveis em ambas as seções:
   - **Production**: Para o site principal
   - **Preview**: Para deployments de teste

### Passo 6: Fazer um Novo Deploy

**MUITO IMPORTANTE**: As variáveis só serão aplicadas em novos deployments!

```bash
# Na pasta do projeto, execute:
cd /Users/carloseduardo/Library/Mobile\ Documents/com~apple~CloudDocs/1.\ Business/CEAC\ Agropecuária\ e\ Mercantil\ Ltda/Aplicações/boi-gordo-investimentos2

# Fazer um pequeno ajuste para forçar novo deploy
echo "// Deploy: $(date)" >> src/app/page.tsx

# Executar build e deploy
npm run build:cf
npx wrangler pages deploy out --project-name=plataforma-futuros --commit-dirty=true
```

## 🔍 Como Verificar se Funcionou

### 1. Aguarde o Deploy Completar
- O deploy leva cerca de 1-2 minutos
- Você receberá uma URL como: https://XXXXXX.plataforma-futuros.pages.dev

### 2. Acesse a Página de Debug
```
https://plataforma-futuros.pages.dev/debug/
```

### 3. Verifique o Status
Você deve ver:
- **NEXT_PUBLIC_SUPABASE_URL**: ✅ Configurado
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: ✅ Configurado
- **Conexão Supabase**: ✅ Conectado

## ❌ Troubleshooting

### Se ainda não funcionar:

1. **Verifique o nome do projeto**:
   - O projeto no Cloudflare deve se chamar exatamente **"plataforma-futuros"**
   
2. **Verifique a URL de produção**:
   - Settings → Domains → Custom domains
   - A URL principal deve estar configurada

3. **Limpe o cache do navegador**:
   - Ctrl+Shift+R (Windows/Linux) ou Cmd+Shift+R (Mac)

4. **Verifique no log do build**:
   - No Cloudflare Dashboard, vá em "Deployments"
   - Clique no último deployment
   - Veja se há erros no log

### Comando para Debug Local

Para testar se as variáveis estão corretas localmente:

```bash
# Teste local com as variáveis de produção
NEXT_PUBLIC_SUPABASE_URL=https://kdfevkbwohcajcwrqzor.supabase.co \
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkZmV2a2J3b2hjYWpjd3Jxem9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMTUzODcsImV4cCI6MjA2ODg5MTM4N30.4nBjKi3rdpfbYmxeoa8GELdBLq8JY6ym68cJX7jpaus \
npm run dev
```

## 📞 Suporte

Se após seguir todos esses passos ainda tiver problemas:

1. Verifique o console do navegador (F12) para erros
2. Acesse https://plataforma-futuros.pages.dev/diagnostics/ para diagnóstico detalhado
3. Use o MCP para debug remoto:

```bash
curl -X POST https://boi-gordo-mcp-official.carlosedufaraujo.workers.dev/rpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "check-environment",
      "arguments": {}
    }
  }'
```

## ✅ Checklist Final

- [ ] Variáveis adicionadas no Cloudflare Pages (Production)
- [ ] Variáveis adicionadas no Cloudflare Pages (Preview)
- [ ] Nomes das variáveis estão EXATOS (com NEXT_PUBLIC_)
- [ ] Valores não têm aspas ou espaços extras
- [ ] Novo deploy foi realizado APÓS adicionar as variáveis
- [ ] Página /debug/ mostra variáveis como "Configurado"
- [ ] Aplicação conecta com Supabase sem erros