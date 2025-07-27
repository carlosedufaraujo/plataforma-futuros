# Deploy do MCP Server

## Passo 1: Deploy do Worker

```bash
cd mcp-server
wrangler deploy
```

Após o deploy, você verá algo como:
```
Published boi-gordo-mcp (X.XX sec)
  https://boi-gordo-mcp.YOUR-SUBDOMAIN.workers.dev
```

## Passo 2: Configurar Variáveis no Cloudflare Pages

No dashboard do Cloudflare Pages, adicione:

1. `NEXT_PUBLIC_MCP_URL` = URL do worker (ex: https://boi-gordo-mcp.YOUR-SUBDOMAIN.workers.dev)
2. `NEXT_PUBLIC_MCP_TOKEN` = boi-gordo-mcp-2024-secure-token

## Passo 3: Testar

Após o novo deploy do Pages:
1. Acesse: https://fb0cfd9c.plataforma-futuros.pages.dev/debug
2. Verifique se as variáveis MCP aparecem como configuradas
3. Clique em "Testar MCP Server"

## Endpoints Disponíveis no MCP

- `GET /health` - Status do servidor (público)
- `GET /api/diagnostics/env` - Variáveis de ambiente
- `POST /api/diagnostics/supabase-test` - Testar Supabase
- `GET /api/diagnostics/pages-info` - Info do deployment
- `POST /api/diagnostics/execute` - Executar comandos

Todos endpoints `/api/*` requerem header `X-MCP-Token`.