const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://kdfevkbwohcajcwrqzor.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkZmV2a2J3b2hjYWpjd3Jxem9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMTUzODcsImV4cCI6MjA2ODg5MTM4N30.4nBjKi3rdpfbYmxeoa8GELdBLq8JY6ym68cJX7jpaus';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugPositionError() {
  console.log('🔍 Debugando erro ao criar posição...\n');

  try {
    // 1. Verificar estrutura da tabela positions
    console.log('1. Verificando colunas da tabela positions:');
    const { data: columns, error: columnsError } = await supabase
      .from('positions')
      .select('*')
      .limit(0);
    
    if (columnsError) {
      console.error('Erro ao verificar colunas:', columnsError);
    }

    // 2. Tentar criar posição com ID personalizado
    console.log('\n2. Tentando criar posição com ID personalizado (PS0001):');
    const testPosition1 = {
      id: 'PS0001',
      user_id: '2dc60bee-5466-4f7e-8e1d-00cf91ee6e97',
      brokerage_id: '6b75b1d7-8cea-4823-9c2f-2ff236d32da6',
      contract_id: 'e82c3a6a-8f91-4d2f-a9cf-12ca5a8b67ad',
      contract: 'CCMK25',
      direction: 'LONG',
      quantity: 10,
      entry_price: 85.50,
      current_price: 85.50,
      status: 'EM_ABERTO',
      entry_date: new Date().toISOString()
    };

    const { data: data1, error: error1 } = await supabase
      .from('positions')
      .insert(testPosition1)
      .select();

    if (error1) {
      console.error('❌ Erro com ID personalizado:', error1);
      console.log('Detalhes:', error1.details, error1.hint, error1.message);
    } else {
      console.log('✅ Sucesso com ID personalizado:', data1);
    }

    // 3. Tentar criar posição sem ID (deixar o banco gerar)
    console.log('\n3. Tentando criar posição sem ID (auto-gerado):');
    const testPosition2 = {
      user_id: '2dc60bee-5466-4f7e-8e1d-00cf91ee6e97',
      brokerage_id: '6b75b1d7-8cea-4823-9c2f-2ff236d32da6',
      contract_id: 'e82c3a6a-8f91-4d2f-a9cf-12ca5a8b67ad',
      contract: 'CCMK25',
      direction: 'LONG',
      quantity: 10,
      entry_price: 85.50,
      current_price: 85.50,
      status: 'EM_ABERTO',
      entry_date: new Date().toISOString()
    };

    const { data: data2, error: error2 } = await supabase
      .from('positions')
      .insert(testPosition2)
      .select();

    if (error2) {
      console.error('❌ Erro sem ID:', error2);
      console.log('Detalhes:', error2.details, error2.hint, error2.message);
    } else {
      console.log('✅ Sucesso sem ID:', data2);
    }

    // 4. Verificar se há posições existentes
    console.log('\n4. Verificando posições existentes:');
    const { data: existingPositions, error: listError } = await supabase
      .from('positions')
      .select('id, contract, user_id')
      .limit(5);

    if (listError) {
      console.error('Erro ao listar:', listError);
    } else {
      console.log('Posições existentes:', existingPositions);
    }

  } catch (err) {
    console.error('Erro geral:', err);
  }
}

debugPositionError();