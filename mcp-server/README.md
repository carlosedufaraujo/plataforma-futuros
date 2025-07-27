# Boi Gordo MCP Server

MCP (Model Context Protocol) server para diagnóstico e monitoramento da plataforma Boi Gordo no Cloudflare.

## Deploy Rápido

### 1. Instalar dependências
```bash
cd mcp-server
npm install
```

### 2. Configurar variáveis
Edite o `wrangler.toml` e adicione:
- `MCP_AUTH_TOKEN`: Token secreto para autenticação
- Variáveis do Supabase se necessário

### 3. Deploy para Cloudflare Workers
```bash
npm run deploy
```

### 4. Testar localmente
```bash
npm run dev
```

## Endpoints Disponíveis

- `GET /health` - Status do servidor
- `GET /api/diagnostics/env` - Verificar variáveis de ambiente
- `POST /api/diagnostics/supabase-test` - Testar conexão Supabase
- `GET /api/diagnostics/pages-info` - Info do deployment Pages
- `POST /api/diagnostics/execute` - Executar comandos de diagnóstico

## Autenticação

Todas as requisições para `/api/*` devem incluir o header:
```
X-MCP-Token: seu-token-secreto
```

## Uso no Frontend

```typescript
import { getMCPClient } from '@/lib/mcp-client';

const client = getMCPClient();
const diagnostics = await client.getEnvDiagnostics();
```

## Configuração no Cloudflare Pages

Adicione estas variáveis de ambiente:
- `NEXT_PUBLIC_MCP_URL`: URL do seu Worker (ex: https://boi-gordo-mcp.workers.dev)
- `NEXT_PUBLIC_MCP_TOKEN`: Token de autenticação