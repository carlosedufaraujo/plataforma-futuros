const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://kdfevkbwohcajcwrqzor.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkZmV2a2J3b2hjYWpjd3Jxem9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMTUzODcsImV4cCI6MjA2ODg5MTM4N30.4nBjKi3rdpfbYmxeoa8GELdBLq8JY6ym68cJX7jpaus';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWithRealData() {
  console.log('🔍 Testando com dados reais do Supabase...\n');

  try {
    // 1. Buscar usuários existentes
    console.log('1️⃣ Buscando usuários existentes...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, nome, email')
      .eq('is_active', true)
      .limit(5);
    
    if (usersError) throw usersError;
    
    console.log('✅ Usuários encontrados:');
    users.forEach(u => console.log(`   - ${u.nome} (${u.email}) - ID: ${u.id}`));
    
    // 2. Buscar corretoras existentes
    console.log('\n2️⃣ Buscando corretoras existentes...');
    const { data: brokerages, error: brokeragesError } = await supabase
      .from('brokerages')
      .select('id, nome')
      .eq('is_active', true)
      .limit(5);
    
    if (brokeragesError) throw brokeragesError;
    
    console.log('✅ Corretoras encontradas:');
    brokerages.forEach(b => console.log(`   - ${b.nome} - ID: ${b.id}`));
    
    // 3. Buscar contratos existentes
    console.log('\n3️⃣ Buscando contratos existentes...');
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select('id, symbol, name')
      .eq('is_active', true)
      .limit(10);
    
    if (contractsError) throw contractsError;
    
    console.log('✅ Contratos encontrados:');
    contracts.forEach(c => console.log(`   - ${c.symbol}: ${c.name} - ID: ${c.id}`));
    
    // 4. Verificar posições existentes
    console.log('\n4️⃣ Verificando posições existentes...');
    const { count: positionCount, error: countError } = await supabase
      .from('positions')
      .select('*', { count: 'exact', head: true });
    
    if (countError) throw countError;
    
    console.log(`✅ Total de posições no banco: ${positionCount}`);
    
    // 5. Tentar criar uma posição com dados reais
    if (users.length > 0 && brokerages.length > 0 && contracts.length > 0) {
      console.log('\n5️⃣ Tentando criar posição com dados reais...');
      
      const testPosition = {
        user_id: users[0].id,
        brokerage_id: brokerages[0].id,
        contract_id: contracts[0].id,
        contract: contracts[0].symbol,
        direction: 'LONG',
        quantity: 5,
        entry_price: 100.00,
        current_price: 100.00,
        status: 'EM_ABERTO',
        entry_date: new Date().toISOString(),
        fees: 0,
        symbol: contracts[0].symbol,
        name: contracts[0].name,
        contract_size: 1,
        unit: 'unit',
        exposure: 500,
        unrealized_pnl: 0
      };
      
      console.log('\nDados da posição de teste:');
      console.log(`- Usuário: ${users[0].nome}`);
      console.log(`- Corretora: ${brokerages[0].nome}`);
      console.log(`- Contrato: ${contracts[0].symbol} - ${contracts[0].name}`);
      console.log(`- Quantidade: ${testPosition.quantity}`);
      console.log(`- Preço: R$ ${testPosition.entry_price}`);
      
      const { data: newPosition, error: createError } = await supabase
        .from('positions')
        .insert(testPosition)
        .select();
      
      if (createError) {
        console.error('\n❌ Erro ao criar posição:', createError.message);
        console.error('Código:', createError.code);
        console.error('Detalhes:', createError.details);
        console.error('\n💡 Execute o script SQL FIX_RLS_WITH_EXISTING_DATA.sql no Supabase!');
      } else {
        console.log('\n✅ Posição criada com sucesso!');
        console.log('ID da posição:', newPosition[0].id);
        
        // Deletar posição de teste
        const { error: deleteError } = await supabase
          .from('positions')
          .delete()
          .eq('id', newPosition[0].id);
        
        if (!deleteError) {
          console.log('🗑️  Posição de teste deletada.');
        }
      }
    } else {
      console.log('\n⚠️  Não há dados suficientes para criar uma posição de teste.');
      console.log('Verifique se existem usuários, corretoras e contratos ativos no banco.');
    }
    
  } catch (err) {
    console.error('\n❌ Erro geral:', err);
  }
}

// Executar teste
testWithRealData();