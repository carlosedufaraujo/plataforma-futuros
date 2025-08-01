#!/bin/bash

echo "🧹 Limpando console.logs do código..."
echo ""

# Contar console.logs antes
BEFORE=$(grep -r "console.log" src --include="*.tsx" --include="*.ts" | wc -l)
echo "📊 Console.logs encontrados: $BEFORE"
echo ""

# Arquivos a serem preservados (críticos para debug)
PRESERVE_FILES=(
  "src/lib/supabase.ts"
  "src/services/supabaseService.ts"
)

# Função para verificar se arquivo deve ser preservado
should_preserve() {
  local file=$1
  for preserve in "${PRESERVE_FILES[@]}"; do
    if [[ "$file" == *"$preserve"* ]]; then
      return 0
    fi
  done
  return 1
}

# Processar arquivos
FILES_PROCESSED=0
LOGS_REMOVED=0

find src -name "*.tsx" -o -name "*.ts" | while read file; do
  if should_preserve "$file"; then
    echo "⏭️  Preservando: $file"
    continue
  fi
  
  # Contar logs no arquivo
  LOG_COUNT=$(grep -c "console.log" "$file" 2>/dev/null || echo 0)
  
  if [ $LOG_COUNT -gt 0 ]; then
    echo "📝 Processando: $file ($LOG_COUNT logs)"
    
    # Remover console.logs mas preservar console.error e console.warn
    sed -i.bak '/console\.log/d' "$file"
    
    # Remover arquivos de backup
    rm "${file}.bak" 2>/dev/null
    
    FILES_PROCESSED=$((FILES_PROCESSED + 1))
    LOGS_REMOVED=$((LOGS_REMOVED + LOG_COUNT))
  fi
done

# Contar console.logs depois
AFTER=$(grep -r "console.log" src --include="*.tsx" --include="*.ts" | wc -l)

echo ""
echo "✅ Limpeza concluída!"
echo "📊 Resumo:"
echo "   - Arquivos processados: $FILES_PROCESSED"
echo "   - Console.logs removidos: $((BEFORE - AFTER))"
echo "   - Console.logs restantes: $AFTER (em arquivos críticos)"
echo ""

# Verificar se ainda existem logs desnecessários
if [ $AFTER -gt 20 ]; then
  echo "⚠️  Ainda existem muitos console.logs. Verifique manualmente:"
  grep -r "console.log" src --include="*.tsx" --include="*.ts" | head -10
fi