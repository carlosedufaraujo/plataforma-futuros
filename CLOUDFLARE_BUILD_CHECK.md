# Verificação de Build - Cloudflare Pages

## ⚠️ IMPORTANTE: Configurações no Cloudflare Dashboard

### 1. Build configuration:
- **Build command**: `npm run build:cf`
- **Build output directory**: `out`
- **Root directory**: (deixe vazio ou /)

### 2. Environment variables (Production):
```
NEXT_PUBLIC_SUPABASE_URL=https://kdfevkbwohcajcwrqzor.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkZmV2a2J3b2hjYWpjd3Jxem9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMTUzODcsImV4cCI6MjA2ODg5MTM4N30.4nBjKi3rdpfbYmxeoa8GELdBLq8JY6ym68cJX7jpaus
NEXT_PUBLIC_MCP_URL=https://boi-gordo-mcp.carlosedufaraujo.workers.dev
NEXT_PUBLIC_MCP_TOKEN=boi-gordo-mcp-2024-secure-token
```

### 3. Node version:
- Certifique-se que está usando Node.js 18 ou superior

## 📁 Estrutura esperada após build:

```
out/
├── _redirects          ✅ (novo)
├── _routes.json        ✅
├── _headers           ✅
├── index.html         ✅
├── 404.html           ✅
├── debug/
│   └── index.html     ✅
└── diagnostics/
    └── index.html     ✅
```

## 🔍 URLs para testar:

Com trailing slash:
- https://fb0cfd9c.plataforma-futuros.pages.dev/debug/
- https://fb0cfd9c.plataforma-futuros.pages.dev/diagnostics/

Sem trailing slash (deve redirecionar):
- https://fb0cfd9c.plataforma-futuros.pages.dev/debug
- https://fb0cfd9c.plataforma-futuros.pages.dev/diagnostics

## 🚀 Se ainda der 404:

1. No Cloudflare Dashboard, vá em "View build log"
2. Verifique se o build está usando o comando correto
3. Verifique se o diretório de saída está correto
4. Tente "Retry deployment" com as configurações corretas