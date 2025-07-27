#!/bin/bash

echo "🚀 Deploying MCP Server to Cloudflare Workers..."

cd mcp-server

# Verificar se wrangler está instalado
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler não encontrado. Instalando..."
    npm install -g wrangler
fi

# Login no Cloudflare (se necessário)
echo "📡 Verificando autenticação Cloudflare..."
wrangler whoami || wrangler login

# Deploy
echo "🔧 Fazendo deploy do MCP server..."
npm run deploy

echo "✅ Deploy completo!"
echo ""
echo "📌 Próximos passos:"
echo "1. Adicione estas variáveis no Cloudflare Pages:"
echo "   - NEXT_PUBLIC_MCP_URL=https://boi-gordo-mcp.workers.dev"
echo "   - NEXT_PUBLIC_MCP_TOKEN=boi-gordo-mcp-2024-secure-token"
echo ""
echo "2. Faça um novo deploy do Pages após adicionar as variáveis"
echo ""
echo "3. Acesse /debug na sua aplicação para testar"