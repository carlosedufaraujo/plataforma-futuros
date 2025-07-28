# 🚀 Guia Completo de Integração MCP + Supabase + Cloudflare

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura da Solução](#arquitetura-da-solução)
3. [Configuração do MCP Server](#configuração-do-mcp-server)
4. [Configuração do Supabase](#configuração-do-supabase)
5. [Integração com Cloudflare Pages](#integração-com-cloudflare-pages)
6. [Protocolos de Diagnóstico](#protocolos-de-diagnóstico)
7. [Comandos Úteis](#comandos-úteis)
8. [Troubleshooting Avançado](#troubleshooting-avançado)

## 🎯 Visão Geral

### O que é MCP (Model Context Protocol)?

MCP é um protocolo desenvolvido pela Anthropic que permite que assistentes de IA (como Claude) interajam com sistemas externos através de ferramentas padronizadas. No nosso caso, criamos um servidor MCP no Cloudflare Workers que oferece ferramentas de diagnóstico remoto.

### Componentes da Arquitetura

```mermaid
graph TB
    A[Claude/AI Assistant] -->|MCP Protocol| B[MCP Server - Workers]
    B --> C[Cloudflare Pages - Frontend]
    C --> D[Supabase - Database]
    B --> D
    
    style A fill:#f9f,stroke:#333,stroke-width:4px
    style B fill:#ff9,stroke:#333,stroke-width:2px
    style C fill:#9ff,stroke:#333,stroke-width:2px
    style D fill:#9f9,stroke:#333,stroke-width:2px
```

## 🏗️ Arquitetura da Solução

### 1. MCP Server (Cloudflare Workers)
- **URL**: https://boi-gordo-mcp-official.carlosedufaraujo.workers.dev
- **Localização**: `/mcp-official/`
- **Função**: Servidor de ferramentas de diagnóstico remoto

### 2. Frontend (Cloudflare Pages)
- **URL**: https://plataforma-futuros.pages.dev
- **Localização**: `/src/`
- **Framework**: Next.js 15 com App Router

### 3. Database (Supabase)
- **URL**: https://kdfevkbwohcajcwrqzor.supabase.co
- **Tabelas**: users, brokerages, positions, transactions, contracts

## 🛠️ Configuração do MCP Server

### Estrutura de Arquivos

```
mcp-official/
├── src/
│   └── index.ts        # Servidor principal MCP
├── package.json        # Dependências
├── tsconfig.json       # Configuração TypeScript
├── wrangler.toml       # Configuração Cloudflare Workers
└── README.md          # Documentação do MCP
```

### Arquivo Principal: `mcp-official/src/index.ts`

```typescript
// Ferramentas disponíveis no MCP
const tools = [
  {
    name: 'check-environment',
    description: 'Check environment variables and configuration',
    // ... implementação
  },
  {
    name: 'test-supabase',
    description: 'Test connection to Supabase',
    // ... implementação
  },
  {
    name: 'check-pages-deployment',
    description: 'Get information about Cloudflare Pages deployment',
    // ... implementação
  },
  {
    name: 'analyze-errors',
    description: 'Analyze common errors (401, 404) and suggest solutions',
    // ... implementação
  },
  {
    name: 'list-routes',
    description: 'List all available routes and their status',
    // ... implementação
  }
];
```

### Deploy do MCP Server

```bash
cd mcp-official
npm install
npx wrangler deploy
```

### Variáveis de Ambiente (wrangler.toml)

```toml
name = "boi-gordo-mcp-official"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
ENVIRONMENT = "production"
ALLOWED_ORIGINS = "*"
# Adicionar via dashboard ou secrets
# SUPABASE_URL = "..."
# SUPABASE_ANON_KEY = "..."
```

## 🗄️ Configuração do Supabase

### Credenciais

```env
NEXT_PUBLIC_SUPABASE_URL=https://kdfevkbwohcajcwrqzor.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkZmV2a2J3b2hjYWpjd3Jxem9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMTUzODcsImV4cCI6MjA2ODg5MTM4N30.4nBjKi3rdpfbYmxeoa8GELdBLq8JY6ym68cJX7jpaus
```

### Estrutura de Tabelas

```sql
-- Usuários
CREATE TABLE users (
  id UUID PRIMARY KEY,
  nome TEXT NOT NULL,
  cpf TEXT UNIQUE,
  email TEXT UNIQUE,
  telefone TEXT,
  endereco TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Corretoras
CREATE TABLE brokerages (
  id UUID PRIMARY KEY,
  nome TEXT NOT NULL,
  cnpj TEXT UNIQUE,
  endereco TEXT,
  assessor TEXT,
  telefone TEXT,
  email TEXT,
  corretagem_milho DECIMAL,
  corretagem_boi DECIMAL,
  taxas DECIMAL,
  impostos DECIMAL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Posições
CREATE TABLE positions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  brokerage_id UUID REFERENCES brokerages(id),
  contract_id UUID REFERENCES contracts(id),
  contract TEXT,
  direction TEXT CHECK (direction IN ('long', 'short')),
  quantity INTEGER,
  entry_price DECIMAL,
  current_price DECIMAL,
  stop_loss DECIMAL,
  take_profit DECIMAL,
  status TEXT CHECK (status IN ('open', 'closed')),
  entry_date TIMESTAMP,
  exit_date TIMESTAMP,
  exit_price DECIMAL,
  realized_pnl DECIMAL,
  unrealized_pnl DECIMAL,
  pnl_percentage DECIMAL,
  exposure DECIMAL,
  fees DECIMAL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Transações
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  brokerage_id UUID REFERENCES brokerages(id),
  position_id UUID REFERENCES positions(id),
  date TIMESTAMP,
  type TEXT CHECK (type IN ('buy', 'sell')),
  contract TEXT,
  quantity INTEGER,
  price DECIMAL,
  total DECIMAL,
  fees DECIMAL,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  custom_id TEXT UNIQUE
);

-- Contratos
CREATE TABLE contracts (
  id UUID PRIMARY KEY,
  symbol TEXT UNIQUE,
  contract_type TEXT,
  expiration_date DATE,
  contract_size INTEGER,
  unit TEXT,
  name TEXT,
  current_price DECIMAL,
  volume INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🌐 Integração com Cloudflare Pages

### Solução para Variáveis de Ambiente

Devido a limitações do Cloudflare Pages com variáveis de ambiente, implementamos uma solução robusta:

#### Arquivo: `src/config/env.ts`

```typescript
interface EnvConfig {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  NEXT_PUBLIC_API_URL: string;
  NEXT_PUBLIC_MCP_URL: string;
  NEXT_PUBLIC_MCP_TOKEN: string;
  NEXT_PUBLIC_WS_URL: string;
}

const defaultConfig: EnvConfig = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://kdfevkbwohcajcwrqzor.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIs...',
  NEXT_PUBLIC_API_URL: 'https://api.plataforma-futuros.com.br',
  NEXT_PUBLIC_MCP_URL: 'https://boi-gordo-mcp-official.carlosedufaraujo.workers.dev',
  NEXT_PUBLIC_MCP_TOKEN: 'production-token',
  NEXT_PUBLIC_WS_URL: 'wss://api.plataforma-futuros.com.br',
};

export function getEnvConfig(): EnvConfig {
  const config: EnvConfig = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || defaultConfig.NEXT_PUBLIC_SUPABASE_URL,
    // ... outras variáveis
  };
  return config;
}

export const ENV = getEnvConfig();
```

### Uso em Componentes

```typescript
import { ENV } from '@/config/env';

// Em vez de:
// const url = process.env.NEXT_PUBLIC_SUPABASE_URL

// Use:
const url = ENV.NEXT_PUBLIC_SUPABASE_URL;
```

## 🔍 Protocolos de Diagnóstico

### Quando Usar MCP para Diagnóstico

#### 🚨 REGRA DE OURO: Use MCP quando:

1. **Múltiplos Erros Simultâneos**
   - Mais de 3 erros diferentes aparecendo
   - Erros em cascata afetando várias partes do sistema

2. **Problemas de Conectividade**
   - Erro 401 (Unauthorized) com Supabase
   - Erro 404 em páginas que deveriam existir
   - Timeouts ou falhas de rede

3. **Após Mudanças Significativas**
   - Novo deployment
   - Alteração de variáveis de ambiente
   - Atualização de dependências

4. **Investigação Remota**
   - Quando não tiver acesso direto aos logs
   - Para verificar status de produção
   - Validar configurações em tempo real

### Protocolo de Diagnóstico Rápido

```bash
# 1. Verificar ambiente
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

# 2. Testar Supabase
curl -X POST https://boi-gordo-mcp-official.carlosedufaraujo.workers.dev/rpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "test-supabase",
      "arguments": {}
    }
  }'

# 3. Verificar rotas
curl -X POST https://boi-gordo-mcp-official.carlosedufaraujo.workers.dev/rpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "list-routes",
      "arguments": {
        "baseUrl": "https://plataforma-futuros.pages.dev"
      }
    }
  }'
```

### Análise de Erros Comuns

```bash
# Para erro 404
curl -X POST https://boi-gordo-mcp-official.carlosedufaraujo.workers.dev/rpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 4,
    "method": "tools/call",
    "params": {
      "name": "analyze-errors",
      "arguments": {
        "errorCode": 404,
        "context": "Página /debug não encontrada após deploy"
      }
    }
  }'
```

## 📝 Comandos Úteis

### Deploy Completo

```bash
# 1. Deploy do MCP Server
cd mcp-official
npx wrangler deploy

# 2. Build e Deploy do Frontend
cd ..
npm run build:cf
npx wrangler pages deploy out --project-name=plataforma-futuros --commit-dirty=true
```

### Verificação Local

```bash
# Verificar variáveis
node scripts/verify-env.js

# Debug de ambiente
node scripts/debug-env.js

# Teste local
npm run dev
```

### Logs e Monitoramento

```bash
# Logs do MCP Server
npx wrangler tail boi-gordo-mcp-official

# Verificar deployment
curl https://plataforma-futuros.pages.dev/debug/
```

## 🆘 Troubleshooting Avançado

### Problema: Variáveis não carregando

1. **Verificar com MCP**:
```bash
# Use a ferramenta check-environment
```

2. **Solução**:
- Verifique `src/config/env.ts`
- Garanta que está importando `ENV` em vez de `process.env`

### Problema: Erro 401 no Supabase

1. **Verificar com MCP**:
```bash
# Use a ferramenta test-supabase
```

2. **Possíveis causas**:
- Chave expirada
- URL incorreta
- CORS bloqueado

### Problema: Páginas 404

1. **Verificar com MCP**:
```bash
# Use a ferramenta list-routes
```

2. **Soluções**:
- Verificar `functions/[[catchall]].js`
- Confirmar `_redirects` e `_routes.json`
- Novo deploy após mudanças

## 🚀 Melhores Práticas

1. **Sempre use MCP primeiro** para diagnóstico remoto
2. **Mantenha ENV atualizado** em `src/config/env.ts`
3. **Documente mudanças** significativas
4. **Teste localmente** antes de deploy
5. **Use scripts de verificação** após cada deploy

## 📊 Monitoramento Contínuo

### Dashboard de Status

Acesse regularmente:
- https://plataforma-futuros.pages.dev/debug/
- https://plataforma-futuros.pages.dev/diagnostics/

### Checklist Semanal

- [ ] Verificar logs do MCP Server
- [ ] Testar todas as rotas principais
- [ ] Validar conexão com Supabase
- [ ] Revisar métricas de performance
- [ ] Atualizar documentação se necessário

---

📅 **Última atualização**: 27 de Julho de 2025
🔧 **Mantido por**: Equipe de Desenvolvimento ACEX