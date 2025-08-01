const SUPABASE_URL = "https://kdfevkbwohcajcwrqzor.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkZmV2a2J3b2hjYWpjd3Jxem9yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzMxNTM4NywiZXhwIjoyMDY4ODkxMzg3fQ.N3k4L5no6BAwcyTXZ-WcLS8PR6raOs3J1r3Zp6v3h7E";

async function supabaseRequest(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Content-Type': 'application/json'
    }
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, options);
  
  if (method === 'DELETE') {
    return { success: response.ok };
  }
  
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

async function fixPositionsSync() {
  console.log('🔧 Iniciando correção da sincronização...');
  
  // 1. Buscar todas as transações
  const transactions = await supabaseRequest('transactions?select=*&order=created_at.asc');
  console.log(`📊 Encontradas ${transactions.length} transações`);
  
  // 2. Limpar posições existentes
  await supabaseRequest('positions?id=neq.00000000-0000-0000-0000-000000000000', 'DELETE');
  console.log('🗑️ Posições existentes removidas');
  
  // 3. Criar posições para cada transação
  for (const transaction of transactions) {
    console.log(`🆕 Processando ${transaction.custom_id}: ${transaction.type} ${transaction.contract}`);
    
    const positionData = {
      user_id: transaction.user_id,
      brokerage_id: transaction.brokerage_id,
      contract: transaction.contract,
      direction: transaction.type === 'COMPRA' ? 'LONG' : 'SHORT',
      quantity: transaction.quantity,
      entry_price: transaction.price,
      current_price: transaction.price,
      status: 'EXECUTADA',
      entry_date: transaction.date,
      fees: transaction.fees || 0,
      symbol: transaction.contract,
      name: `Posição ${transaction.contract}`,
      contract_size: transaction.contract.startsWith('BGI') ? 330 : 450,
      unit: 'contratos'
    };
    
    // Criar posição
    const newPosition = await supabaseRequest('positions?select=id', 'POST', positionData);
    const positionId = Array.isArray(newPosition) ? newPosition[0]?.id : newPosition?.id;
    console.log(`✅ Posição criada: ${positionId}`);
    
    // Vincular transação à posição
    if (positionId) {
      await supabaseRequest(`transactions?id=eq.${transaction.id}`, 'PATCH', {
        position_id: positionId
      });
      console.log(`🔗 Transação ${transaction.custom_id} vinculada à posição ${positionId}`);
    }
  }
  
  console.log('✅ Sincronização concluída!');
  
  // 4. Verificar resultado
  const finalTransactions = await supabaseRequest('transactions?select=custom_id,position_id');
  const finalPositions = await supabaseRequest('positions?select=contract,direction,quantity');
  
  console.log(`📊 Resultado final:`);
  console.log(`   - Transações: ${finalTransactions.length}`);
  console.log(`   - Posições: ${finalPositions.length}`);
  console.log(`   - Transações com position_id: ${finalTransactions.filter(t => t.position_id).length}`);
}

// Executar correção
fixPositionsSync().catch(console.error); 