#!/bin/bash

# Configurações do Supabase
export SUPABASE_URL="https://kdfevkbwohcajcwrqzor.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkZmV2a2J3b2hjYWpjd3Jxem9yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzMxNTM4NywiZXhwIjoyMDY4ODkxMzg3fQ.N3k4L5no6BAwcyTXZ-WcLS8PR6raOs3J1r3Zp6v3h7E"

# Função base para consultas
supabase_query() {
    curl -s -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
         -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
         -H "Content-Type: application/json" \
         "$1"
}

# Função para SQL direto
supabase_sql() {
    local sql_query="$1"
    curl -s -X POST \
         -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
         -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
         -H "Content-Type: application/json" \
         -d "{\"query\": \"$sql_query\"}" \
         "$SUPABASE_URL/rest/v1/rpc/exec_sql"
}

# Listar todas as transações
list_transactions() {
    echo "📊 TRANSAÇÕES:"
    supabase_query "$SUPABASE_URL/rest/v1/transactions?select=custom_id,type,contract,quantity,price,total,status&order=created_at.desc" | jq '.'
}

# Listar todas as posições
list_positions() {
    echo "📈 POSIÇÕES:"
    supabase_query "$SUPABASE_URL/rest/v1/positions?select=contract,direction,quantity,entry_price,status&order=created_at.desc" | jq '.'
}

# Ver estatísticas gerais
stats() {
    echo "📊 ESTATÍSTICAS GERAIS:"
    echo "Usuários: $(supabase_query "$SUPABASE_URL/rest/v1/users?select=count" | jq -r '.[0].count // 0')"
    echo "Corretoras: $(supabase_query "$SUPABASE_URL/rest/v1/brokerages?select=count" | jq -r '.[0].count // 0')"
    echo "Transações: $(supabase_query "$SUPABASE_URL/rest/v1/transactions?select=count" | jq -r '.[0].count // 0')"
    echo "Posições: $(supabase_query "$SUPABASE_URL/rest/v1/positions?select=count" | jq -r '.[0].count // 0')"
}

# Função para criar nova transação
create_transaction() {
    local type="$1"
    local contract="$2"
    local quantity="$3"
    local price="$4"
    local user_id="2dc60bee-5466-4f7e-8e1d-00cf91ee6e97"
    local brokerage_id="6b75b1d7-8cea-4823-9c2f-2ff236d32da6"
    local total=$(echo "$quantity * $price" | bc -l)
    
    echo "🆕 Criando transação: $type $quantity $contract @ $price"
    
    curl -s -X POST \
         -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
         -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
         -H "Content-Type: application/json" \
         -d "{
             \"user_id\": \"$user_id\",
             \"brokerage_id\": \"$brokerage_id\",
             \"type\": \"$type\",
             \"contract\": \"$contract\",
             \"quantity\": $quantity,
             \"price\": $price,
             \"total\": $total,
             \"status\": \"EXECUTADA\"
         }" \
         "$SUPABASE_URL/rest/v1/transactions" | jq '.'
}

# Limpar todos os dados (cuidado!)
clear_all_data() {
    read -p "⚠️  ATENÇÃO: Isso vai apagar TODOS os dados! Confirma? (digite 'SIM'): " confirm
    if [ "$confirm" = "SIM" ]; then
        echo "🗑️ Limpando posições..."
        curl -s -X DELETE -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_URL/rest/v1/positions?id=neq.00000000-0000-0000-0000-000000000000"
        echo "🗑️ Limpando transações..."
        curl -s -X DELETE -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_URL/rest/v1/transactions?id=neq.00000000-0000-0000-0000-000000000000"
        echo "✅ Dados limpos!"
    else
        echo "❌ Operação cancelada"
    fi
}

echo "🚀 Supabase Helpers carregados!"
echo "📚 Funções disponíveis:"
echo "  list_transactions  - Listar transações"
echo "  list_positions     - Listar posições"
echo "  stats              - Estatísticas gerais"
echo "  create_transaction - Criar nova transação"
echo "  clear_all_data     - Limpar todos os dados"
echo "  supabase_query     - Consulta direta à API" 