# 🚀 MCP - Comandos Rápidos para Diagnóstico

## 🔥 Diagnóstico Completo em 1 Minuto

```bash
# Copie e cole este comando para diagnóstico completo:
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
  }' && echo "\n---\n" && \
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
  }' && echo "\n---\n" && \
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

## 📋 Comandos Individuais

### 1️⃣ Verificar Ambiente
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
  }' | jq
```

### 2️⃣ Testar Supabase
```bash
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
  }' | jq
```

### 3️⃣ Verificar Páginas
```bash
curl -X POST https://boi-gordo-mcp-official.carlosedufaraujo.workers.dev/rpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "check-pages-deployment",
      "arguments": {
        "pagesUrl": "https://plataforma-futuros.pages.dev"
      }
    }
  }' | jq
```

### 4️⃣ Listar Rotas
```bash
curl -X POST https://boi-gordo-mcp-official.carlosedufaraujo.workers.dev/rpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 4,
    "method": "tools/call",
    "params": {
      "name": "list-routes",
      "arguments": {
        "baseUrl": "https://plataforma-futuros.pages.dev"
      }
    }
  }' | jq
```

### 5️⃣ Analisar Erro 404
```bash
curl -X POST https://boi-gordo-mcp-official.carlosedufaraujo.workers.dev/rpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 5,
    "method": "tools/call",
    "params": {
      "name": "analyze-errors",
      "arguments": {
        "errorCode": 404,
        "context": "Página não encontrada"
      }
    }
  }' | jq
```

### 6️⃣ Analisar Erro 401
```bash
curl -X POST https://boi-gordo-mcp-official.carlosedufaraujo.workers.dev/rpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 6,
    "method": "tools/call",
    "params": {
      "name": "analyze-errors",
      "arguments": {
        "errorCode": 401,
        "context": "Erro de autenticação Supabase"
      }
    }
  }' | jq
```

## 🔧 Comandos Úteis Adicionais

### Health Check Simples
```bash
curl https://boi-gordo-mcp-official.carlosedufaraujo.workers.dev/health | jq
```

### Listar Todas as Ferramentas
```bash
curl -X POST https://boi-gordo-mcp-official.carlosedufaraujo.workers.dev/rpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }' | jq
```

## 📱 URLs Importantes

- **MCP Server**: https://boi-gordo-mcp-official.carlosedufaraujo.workers.dev
- **Frontend**: https://plataforma-futuros.pages.dev
- **Debug Page**: https://plataforma-futuros.pages.dev/debug/
- **Diagnostics**: https://plataforma-futuros.pages.dev/diagnostics/

## 🆘 Quando Usar Cada Comando

| Problema | Comando a Usar |
|----------|----------------|
| Site fora do ar | Diagnóstico Completo |
| Erro 404 | Analisar Erro 404 + Listar Rotas |
| Erro 401 | Analisar Erro 401 + Testar Supabase |
| Deploy novo | Verificar Páginas + Verificar Ambiente |
| Supabase não conecta | Testar Supabase + Verificar Ambiente |

## 💡 Dica Pro

Salve este alias no seu `.bashrc` ou `.zshrc`:

```bash
alias mcp-check='curl -X POST https://boi-gordo-mcp-official.carlosedufaraujo.workers.dev/rpc -H "Content-Type: application/json" -d "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"check-environment\",\"arguments\":{}}}" | jq'
```

Depois use apenas:
```bash
mcp-check
```