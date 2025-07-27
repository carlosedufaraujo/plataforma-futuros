#!/bin/bash

echo "🔍 Testando MCP Server..."
echo ""

MCP_URL="https://boi-gordo-mcp.carlosedufaraujo.workers.dev"
MCP_TOKEN="boi-gordo-mcp-2024-secure-token"

echo "1. Testando endpoint público /health:"
curl -s "$MCP_URL/health" | jq .
echo ""

echo "2. Testando endpoint protegido /api/diagnostics/env:"
curl -s -H "X-MCP-Token: $MCP_TOKEN" "$MCP_URL/api/diagnostics/env" | jq .
echo ""

echo "3. Testando Supabase connection:"
curl -s -X POST \
  -H "X-MCP-Token: $MCP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://kdfevkbwohcajcwrqzor.supabase.co",
    "key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkZmV2a2J3b2hjYWpjd3Jxem9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMTUzODcsImV4cCI6MjA2ODg5MTM4N30.4nBjKi3rdpfbYmxeoa8GELdBLq8JY6ym68cJX7jpaus"
  }' \
  "$MCP_URL/api/diagnostics/supabase-test" | jq .

echo ""
echo "✅ Testes concluídos!"