const SUPABASE_URL = "https://kdfevkbwohcajcwrqzor.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkZmV2a2J3b2hjYWpjd3Jxem9yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzMxNTM4NywiZXhwIjoyMDY4ODkxMzg3fQ.N3k4L5no6BAwcyTXZ-WcLS8PR6raOs3J1r3Zp6v3h7E";

async function supabaseRequest(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Content-Type': 'application/json',
      'Prefer': method === 'POST' ? 'return=representation' : 'return=minimal'
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
  
  if (!text) return method === 'POST' ? [] : {};
  
  try {
    return JSON.parse(text);
  } catch (e) {
    console.warn('Resposta não é JSON válido:', text);
    return method === 'POST' ? [] : {};
  }
}

async function syncComplete() {
  console.log('🚀 INICIANDO SINCRONIZAÇÃO COMPLETA...');
  
  try {
    // 1. Buscar todas as transações
    const transactions = await supabaseRequest('transactions?select=*&order=created_at.asc');
    console.log(`📊 Encontradas ${transactions.length} transações`);
    
    // 2. Limpar posições existentes
    console.log('🗑️ Limpando posições existentes...');
    await supabaseRequest('positions?id=neq.00000000-0000-0000-0000-000000000000', 'DELETE');
    
    // 3. Criar posições para cada transação
    console.log('🆕 Criando posições vinculadas...');
    
    for (const transaction of transactions) {
      console.log(`\n📝 Processando ${transaction.custom_id}: ${transaction.type} ${transaction.contract}`);
      
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
      console.log('   🔨 Criando posição...');
      const newPositions = await supabaseRequest('positions', 'POST', positionData);
      const newPosition = Array.isArray(newPositions) && newPositions.length > 0 ? newPositions[0] : null;
      
      if (newPosition && newPosition.id) {
        console.log(`   ✅ Posição criada: ${newPosition.id}`);
        
        // Vincular transação à posição
        console.log('   🔗 Vinculando transação à posição...');
        await supabaseRequest(`transactions?id=eq.${transaction.id}`, 'PATCH', {
          position_id: newPosition.id
        });
        console.log(`   ✅ Transação ${transaction.custom_id} vinculada à posição ${newPosition.id}`);
      } else {
        console.error(`   ❌ Falha ao criar posição para ${transaction.custom_id}`);
      }
    }
    
    // 4. Verificar resultado final
    console.log('\n📊 VERIFICANDO RESULTADO FINAL...');
    
    const finalTransactions = await supabaseRequest('transactions?select=custom_id,position_id');
    const finalPositions = await supabaseRequest('positions?select=contract,direction,quantity,entry_price');
    
    const transactionsWithPositions = finalTransactions.filter(t => t.position_id !== null);
    
    console.log('\n🎯 RESULTADO DA SINCRONIZAÇÃO:');
    console.log(`   📋 Transações: ${finalTransactions.length}`);
    console.log(`   📈 Posições: ${finalPositions.length}`);
    console.log(`   🔗 Transações vinculadas: ${transactionsWithPositions.length}`);
    console.log(`   ✅ Taxa de sucesso: ${Math.round((transactionsWithPositions.length / finalTransactions.length) * 100)}%`);
    
    if (transactionsWithPositions.length === finalTransactions.length && finalPositions.length === finalTransactions.length) {
      console.log('\n🎉 SINCRONIZAÇÃO 100% COMPLETA!');
      console.log('🌐 Recarregue a aplicação em http://localhost:3000');
    } else {
      console.log('\n⚠️ SINCRONIZAÇÃO PARCIAL - Verificar logs acima');
    }
    
    // 5. Mostrar resumo das posições por contrato
    console.log('\n📊 RESUMO DAS POSIÇÕES POR CONTRATO:');
    const positionsByContract = {};
    
    finalPositions.forEach(pos => {
      if (!positionsByContract[pos.contract]) {
        positionsByContract[pos.contract] = { long: 0, short: 0 };
      }
      
      if (pos.direction === 'LONG') {
        positionsByContract[pos.contract].long += pos.quantity;
      } else {
        positionsByContract[pos.contract].short += pos.quantity;
      }
    });
    
    Object.keys(positionsByContract).forEach(contract => {
      const { long, short } = positionsByContract[contract];
      const net = long - short;
      const direction = net > 0 ? 'LONG' : net < 0 ? 'SHORT' : 'NEUTRO';
      console.log(`   ${contract}: LONG ${long} | SHORT ${short} | LÍQUIDO: ${Math.abs(net)} ${direction}`);
    });
    
  } catch (error) {
    console.error('❌ ERRO NA SINCRONIZAÇÃO:', error);
  }
}

// Executar sincronização
syncComplete(); 