#!/bin/bash

# Script para manter o servidor Next.js rodando
echo "🚀 Iniciando servidor de desenvolvimento..."

# Mata qualquer processo anterior na porta 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Limpa o cache se necessário
if [ "$1" == "--clean" ]; then
    echo "🧹 Limpando cache..."
    rm -rf .next
fi

# Inicia o servidor em background
echo "📦 Iniciando Next.js..."
npm run dev &

# Pega o PID do processo
DEV_PID=$!

echo "✅ Servidor iniciado com PID: $DEV_PID"
echo "🌐 Acesse em: http://localhost:3000"
echo ""
echo "Para parar o servidor, use: kill $DEV_PID"
echo "Ou execute: npm run stop"

# Mantém o script rodando
wait $DEV_PID