const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://kdfevkbwohcajcwrqzor.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkZmV2a2J3b2hjYWpjd3Jxem9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMTUzODcsImV4cCI6MjA2ODg5MTM4N30.4nBjKi3rdpfbYmxeoa8GELdBLq8JY6ym68cJX7jpaus';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCreatePosition() {
  console.log('🧪 Testando criação de posição...\n');

  try {
    // Testar sem autenticação (usando política temp_positions_all_access)
    console.log('1. Testando sem autenticação (política pública temporária)...');
    
    // Criar posição de teste
    console.log('\n2. Criando posição de teste...');
    const testPosition = {
      user_id: '2dc60bee-5466-4f7e-8e1d-00cf91ee6e97',
      brokerage_id: '6b75b1d7-8cea-4823-9c2f-2ff236d32da6',
      contract_id: 'e82c3a6a-8f91-4d2f-a9cf-12ca5a8b67ad',
      contract: 'CCMK25',
      direction: 'LONG',
      quantity: 10,
      entry_price: 85.50,
      current_price: 85.50,
      status: 'EM_ABERTO',
      entry_date: new Date().toISOString(),
      fees: 0,
      symbol: 'CCMK25',
      name: 'Milho Maio 2025',
      contract_size: 27,
      unit: 'ton',
      exposure: 85.50 * 10 * 27,
      unrealized_pnl: 0
    };

    console.log('Dados da posição:', testPosition);

    const { data, error } = await supabase
      .from('positions')
      .insert(testPosition)
      .select();

    if (error) {
      console.error('\n❌ Erro ao criar posição:', error);
      console.error('Código:', error.code);
      console.error('Mensagem:', error.message);
      console.error('Detalhes:', error.details);
      console.error('Dica:', error.hint);
    } else {
      console.log('\n✅ Posição criada com sucesso!');
      console.log('ID gerado:', data[0].id);
      console.log('Dados completos:', data[0]);
    }

    // Listar posições para confirmar
    console.log('\n3. Verificando posições existentes...');
    const { data: positions, error: listError } = await supabase
      .from('positions')
      .select('id, contract, status, entry_date')
      .order('created_at', { ascending: false })
      .limit(5);

    if (listError) {
      console.error('❌ Erro ao listar:', listError);
    } else {
      console.log('✅ Últimas posições:', positions);
    }

  } catch (err) {
    console.error('\n❌ Erro geral:', err);
  }
}

testCreatePosition();