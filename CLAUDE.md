# CLAUDE.md - Documentação do Sistema Boi Gordo Investimentos

## Visão Geral

Sistema de gestão de investimentos em contratos futuros de Boi Gordo e Milho, com integração Supabase e deployment em Cloudflare Pages.

## Comandos Importantes

### Build e Deploy

```bash
# Build local
npm run build

# Build para Cloudflare (ignora erros de ESLint/TypeScript)
npm run build:cf

# Deploy para Cloudflare Pages
npx wrangler pages deploy out --project-name=plataforma-futuros --commit-dirty=true
```

### Desenvolvimento

```bash
# Servidor de desenvolvimento
npm run dev

# Linting
npm run lint
```

## Configuração de Variáveis de Ambiente

### 1. Cloudflare Pages Dashboard

Acesse: https://dash.cloudflare.com → Pages → plataforma-futuros → Settings → Environment variables

Adicione as seguintes variáveis para **Production**:

```
NEXT_PUBLIC_SUPABASE_URL=https://kdfevkbwohcajcwrqzor.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkZmV2a2J3b2hjYWpjd3Jxem9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMTUzODcsImV4cCI6MjA2ODg5MTM4N30.4nBjKi3rdpfbYmxeoa8GELdBLq8JY6ym68cJX7jpaus
```

### 2. Arquivo Local (.env.local)

Para desenvolvimento local, crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://kdfevkbwohcajcwrqzor.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkZmV2a2J3b2hjYWpjd3Jxem9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMTUzODcsImV4cCI6MjA2ODg5MTM4N30.4nBjKi3rdpfbYmxeoa8GELdBLq8JY6ym68cJX7jpaus
```

## Estrutura do Projeto

```
/
├── src/
│   ├── app/              # Páginas Next.js (App Router)
│   ├── components/       # Componentes React
│   ├── contexts/         # Context API
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Configuração Supabase
│   ├── services/        # Serviços e APIs
│   └── types/           # TypeScript types
├── mcp-official/        # MCP Server (Workers)
├── functions/           # Cloudflare Pages Functions
├── scripts/             # Scripts de build
└── public/              # Assets estáticos
```

## URLs de Produção

- **Frontend**: https://plataforma-futuros.pages.dev
- **MCP Server**: https://boi-gordo-mcp-official.carlosedufaraujo.workers.dev

## Páginas Principais

- `/` - Dashboard de Rentabilidade
- `/debug` - Debug de variáveis de ambiente
- `/diagnostics` - Diagnóstico do sistema com MCP

## Troubleshooting

### Problema: Páginas retornando 404

**Solução**: O sistema usa Cloudflare Pages Functions para roteamento. Certifique-se de que:
1. O arquivo `functions/[[catchall]].js` existe
2. Os arquivos `_redirects` e `_routes.json` estão em `/public`
3. Execute `npm run build:cf` antes do deploy

### Problema: Erro de conexão com Supabase

**Solução**: Verifique se as variáveis de ambiente estão configuradas:
1. No Cloudflare Pages Dashboard para produção
2. No arquivo `.env.local` para desenvolvimento local

### Problema: Build falhando com erros de TypeScript/ESLint

**Solução**: Use `npm run build:cf` que ignora esses erros em produção.

## MCP Server - Ferramentas de Diagnóstico

O MCP Server oferece 5 ferramentas:

1. **check-environment** - Verifica variáveis de ambiente
2. **test-supabase** - Testa conexão com Supabase
3. **check-pages-deployment** - Verifica status das páginas
4. **analyze-errors** - Analisa erros HTTP
5. **list-routes** - Lista status de todas as rotas

### Exemplo de uso via curl:

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

## Tabelas do Supabase

- **users** - Usuários do sistema
- **brokerages** - Corretoras
- **positions** - Posições de investimento
- **transactions** - Transações
- **contracts** - Contratos futuros
- **contract_prices** - Preços dos contratos
- **options** - Opções de investimento

## Notas de Desenvolvimento

1. O sistema usa Next.js 15 com App Router
2. Deployment via Cloudflare Pages com static export
3. Estado gerenciado via Context API e hooks customizados
4. UI construída com Tailwind CSS
5. Gráficos com Chart.js e Recharts