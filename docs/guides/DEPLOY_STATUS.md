# Status do Deploy - Cloudflare Pages

## URLs para testar após o deploy:

### Páginas de Diagnóstico:
- Debug: https://fb0cfd9c.plataforma-futuros.pages.dev/debug
- Diagnostics: https://fb0cfd9c.plataforma-futuros.pages.dev/diagnostics

### MCP Server:
- Health Check: https://boi-gordo-mcp.carlosedufaraujo.workers.dev/health

## Checklist pós-deploy:

1. [ ] Deploy completado no Cloudflare (aguardar ~3 minutos)
2. [ ] Página /debug acessível
3. [ ] Página /diagnostics acessível
4. [ ] Variáveis MCP aparecem configuradas
5. [ ] Teste de conexão MCP funciona

## Variáveis que devem estar no Cloudflare Pages:

```
NEXT_PUBLIC_MCP_URL = https://boi-gordo-mcp.carlosedufaraujo.workers.dev
NEXT_PUBLIC_MCP_TOKEN = boi-gordo-mcp-2024-secure-token
```

## Arquivos que devem existir no build:
- out/debug.html ✅
- out/diagnostics.html ✅

## Último deploy triggerado:
- Commit: Force rebuild to include debug and diagnostics pages
- Hora: 2025-07-27 14:18