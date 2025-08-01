#!/bin/bash

# Script para manter o servidor Next.js sempre rodando
# Mata processos antigos e inicia um novo

echo "🔧 Iniciando servidor Next.js..."

# Mata qualquer processo na porta 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Limpa o cache do Next.js se necessário
if [ "$1" == "--clean" ]; then
    echo "🧹 Limpando cache..."
    rm -rf .next
fi

# Inicia o servidor em background
echo "🚀 Iniciando servidor na porta 3000..."
npm run dev &

# Pega o PID do processo
SERVER_PID=$!

# Salva o PID em um arquivo
echo $SERVER_PID > .server.pid

echo "✅ Servidor iniciado com PID: $SERVER_PID"
echo "📌 Para parar o servidor, use: npm run stop"
echo "🌐 Acesse: http://localhost:3000"

# Mantém o script rodando
wait $SERVER_PID