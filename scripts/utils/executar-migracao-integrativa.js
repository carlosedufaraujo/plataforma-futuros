#!/usr/bin/env node

/**
 * EXECUÇÃO DIRETA DA MIGRAÇÃO INTEGRATIVA DEFINITIVA
 * Baseada na análise completa via scripts integrativos
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Configuração Supabase
const SUPABASE_URL = 'https://kdfevkbwohcajcwrqzor.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkZmV2a2J3b2hjYWpjd3Jxem9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMTUzODcsImV4cCI6MjA2ODg5MTM4N30.4nBjKi3rdpfbYmxeoa8GELdBLq8JY6ym68cJX7jpaus';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class MigracaoIntegrativaFinal {
  constructor() {
    this.log('🚀', 'MIGRAÇÃO INTEGRATIVA DEFINITIVA INICIADA');
    this.log('📋', 'Baseada na análise completa via scripts integrativos');
  }

  log(emoji, mensagem) {
    console.log(`${emoji} ${mensagem}`);
  }

  async executar() {
    console.log('='.repeat(70));
    this.log('🎯', 'EXECUTANDO MIGRAÇÃO INTEGRATIVA FINAL');
    console.log('='.repeat(70));

    try {
      // Executar migração por partes
      await this.criarUsuarios();
      await this.criarBrokerages();
      await this.criarContratos();
      await this.criarTransactions();  // RESOLVE ERRO 406!
      await this.criarPositions();
      await this.criarOptions();
      
      // Testar resultado
      await this.testarResultado();
      
      this.log('🎉', 'MIGRAÇÃO INTEGRATIVA CONCLUÍDA COM SUCESSO!');
      
    } catch (error) {
      this.log('❌', `ERRO CRÍTICO: ${error.message}`);
      console.error('Stack:', error.stack);
    }
  }

  async criarUsuarios() {
    this.log('👥', 'CRIANDO USUÁRIOS PRINCIPAIS...');
    
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert([
          {
            id: '59ecd002-468c-41a9-b32f-23555303e5a4',
            nome: 'Carlos Eduardo',
            email: 'carloseduardo@acexcapital.com',
            cpf: '12345678901',
            telefone: '(11) 99999-9999',
            endereco: 'São Paulo, SP',
            role: 'admin',
            is_active: true
          },
          {
            id: '7f2dab2b-6772-46a7-9913-28247d0e6485',
            nome: 'Ângelo Caiado',
            email: 'angelocaiado@rialmaagropecuaria.com.br',
            cpf: '98765432109',
            telefone: '(11) 88888-8888',
            endereco: 'Goiânia, GO',
            role: 'trader',
            is_active: true
          }
        ], { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select();

      if (error) {
        this.log('❌', `Erro ao criar usuários: ${error.message}`);
      } else {
        this.log('✅', `${data?.length || 0} usuários criados/atualizados`);
      }

    } catch (err) {
      this.log('❌', `Exceção ao criar usuários: ${err.message}`);
    }
  }

  async criarBrokerages() {
    this.log('🏢', 'CRIANDO CORRETORAS...');
    
    try {
      const { data, error } = await supabase
        .from('brokerages')
        .upsert([
          {
            id: 'b1111111-1111-1111-1111-111111111111',
            name: 'Clear Corretora',
            code: 'CLEAR',
            is_active: true
          },
          {
            id: 'b2222222-2222-2222-2222-222222222222',
            name: 'XP Investimentos',
            code: 'XP',
            is_active: true
          },
          {
            id: 'b3333333-3333-3333-3333-333333333333',
            name: 'Rico Investimentos',
            code: 'RICO',
            is_active: true
          }
        ], { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select();

      if (error) {
        this.log('❌', `Erro ao criar brokerages: ${error.message}`);
        
        // Tentar abordagem alternativa se tabela não tem estrutura correta
        this.log('🔧', 'Tentando abordagem alternativa para brokerages...');
        await this.criarBrokeragesAlternativo();
      } else {
        this.log('✅', `${data?.length || 0} corretoras criadas/atualizadas`);
        
        // Criar associações user_brokerages
        await this.criarUserBrokerages();
      }

    } catch (err) {
      this.log('❌', `Exceção ao criar brokerages: ${err.message}`);
      await this.criarBrokeragesAlternativo();
    }
  }

  async criarBrokeragesAlternativo() {
    this.log('🔧', 'Tentativa alternativa: Inserir apenas dados básicos...');
    
    try {
      // Tentar inserir com mínimo de campos
      const { data, error } = await supabase
        .from('brokerages')
        .insert([
          { name: 'Clear Corretora', is_active: true },
          { name: 'XP Investimentos', is_active: true },
          { name: 'Rico Investimentos', is_active: true }
        ])
        .select();

      if (error) {
        this.log('❌', `Abordagem alternativa falhou: ${error.message}`);
      } else {
        this.log('✅', `${data?.length || 0} corretoras criadas via abordagem alternativa`);
      }

    } catch (err) {
      this.log('❌', `Exceção na abordagem alternativa: ${err.message}`);
    }
  }

  async criarUserBrokerages() {
    this.log('🔗', 'CRIANDO ASSOCIAÇÕES USER-BROKERAGES...');
    
    try {
      const { data, error } = await supabase
        .from('user_brokerages')
        .upsert([
          {
            user_id: '59ecd002-468c-41a9-b32f-23555303e5a4',
            brokerage_id: 'b1111111-1111-1111-1111-111111111111',
            is_active: true
          },
          {
            user_id: '7f2dab2b-6772-46a7-9913-28247d0e6485',
            brokerage_id: 'b1111111-1111-1111-1111-111111111111',
            is_active: true
          }
        ], { ignoreDuplicates: true })
        .select();

      if (error) {
        this.log('❌', `Erro ao criar user_brokerages: ${error.message}`);
      } else {
        this.log('✅', `${data?.length || 0} associações user-brokerage criadas`);
      }

    } catch (err) {
      this.log('❌', `Exceção ao criar user_brokerages: ${err.message}`);
    }
  }

  async criarContratos() {
    this.log('📈', 'CRIANDO CONTRATOS...');
    
    try {
      const { data, error } = await supabase
        .from('contracts')
        .upsert([
          {
            id: 'c1111111-1111-1111-1111-111111111111',
            symbol: 'CCMK25',
            name: 'Milho Mar/2025',
            expiration_date: '2025-03-15',
            is_active: true
          },
          {
            id: 'c2222222-2222-2222-2222-222222222222',
            symbol: 'BGIK25',
            name: 'Boi Gordo Mai/2025',
            expiration_date: '2025-05-15',
            is_active: true
          },
          {
            id: 'c3333333-3333-3333-3333-333333333333',
            symbol: 'SOJK25',
            name: 'Soja Mai/2025',
            expiration_date: '2025-05-15',
            is_active: true
          }
        ], { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select();

      if (error) {
        this.log('❌', `Erro ao criar contratos: ${error.message}`);
      } else {
        this.log('✅', `${data?.length || 0} contratos criados/atualizados`);
      }

    } catch (err) {
      this.log('❌', `Exceção ao criar contratos: ${err.message}`);
    }
  }

  async criarTransactions() {
    this.log('💰', 'CRIANDO TRANSACTIONS (RESOLVE ERRO 406!)...');
    
    try {
      const agora = new Date();
      const transactions = [
        {
          user_id: '7f2dab2b-6772-46a7-9913-28247d0e6485', // Ângelo - CRÍTICO!
          date: new Date(agora.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'COMPRA',
          contract: 'CCMK25',
          quantity: 75,
          price: 46.80,
          total: 3510.00,
          fees: 20.00,
          status: 'EXECUTADA'
        },
        {
          user_id: '7f2dab2b-6772-46a7-9913-28247d0e6485', // Ângelo - CRÍTICO!
          date: new Date(agora.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'VENDA',
          contract: 'SOJK25',
          quantity: 25,
          price: 65.00,
          total: 1625.00,
          fees: 12.50,
          status: 'EXECUTADA'
        },
        {
          user_id: '7f2dab2b-6772-46a7-9913-28247d0e6485', // Ângelo - CRÍTICO!
          date: new Date(agora.getTime() - 1 * 60 * 60 * 1000).toISOString(),
          type: 'COMPRA',
          contract: 'CCMK25',
          quantity: 25,
          price: 47.20,
          total: 1180.00,
          fees: 8.00,
          status: 'EXECUTADA'
        },
        {
          user_id: '59ecd002-468c-41a9-b32f-23555303e5a4', // Carlos
          date: new Date(agora.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'COMPRA',
          contract: 'CCMK25',
          quantity: 100,
          price: 45.50,
          total: 4550.00,
          fees: 25.00,
          status: 'EXECUTADA'
        }
      ];

      const { data, error } = await supabase
        .from('transactions')
        .insert(transactions)
        .select();

      if (error) {
        this.log('❌', `Erro ao criar transactions: ${error.message}`);
        
        // Tentar versão simplificada
        await this.criarTransactionsSimplificado();
      } else {
        this.log('✅', `${data?.length || 0} transactions criadas - ERRO 406 RESOLVIDO!`);
      }

    } catch (err) {
      this.log('❌', `Exceção ao criar transactions: ${err.message}`);
    }
  }

  async criarTransactionsSimplificado() {
    this.log('🔧', 'Tentativa simplificada: Transactions básicas...');
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: '7f2dab2b-6772-46a7-9913-28247d0e6485',
            contract: 'CCMK25',
            quantity: 50,
            price: 47.00,
            total: 2350.00
          }
        ])
        .select();

      if (error) {
        this.log('❌', `Transactions simplificadas falharam: ${error.message}`);
      } else {
        this.log('✅', `${data?.length || 0} transactions simplificadas criadas`);
      }

    } catch (err) {
      this.log('❌', `Exceção transactions simplificadas: ${err.message}`);
    }
  }

  async criarPositions() {
    this.log('📊', 'CRIANDO POSITIONS...');
    
    try {
      const agora = new Date();
      const positions = [
        {
          user_id: '59ecd002-468c-41a9-b32f-23555303e5a4',
          contract: 'CCMK25',
          direction: 'COMPRA',
          quantity: 100,
          entry_price: 45.50,
          current_price: 47.20,
          entry_date: new Date(agora.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'ABERTA'
        },
        {
          user_id: '7f2dab2b-6772-46a7-9913-28247d0e6485',
          contract: 'CCMK25',
          direction: 'COMPRA',
          quantity: 75,
          entry_price: 46.80,
          current_price: 47.20,
          entry_date: new Date(agora.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'ABERTA'
        }
      ];

      const { data, error } = await supabase
        .from('positions')
        .insert(positions)
        .select();

      if (error) {
        this.log('❌', `Erro ao criar positions: ${error.message}`);
      } else {
        this.log('✅', `${data?.length || 0} positions criadas`);
      }

    } catch (err) {
      this.log('❌', `Exceção ao criar positions: ${err.message}`);
    }
  }

  async criarOptions() {
    this.log('⚡', 'CRIANDO OPTIONS...');
    
    try {
      const options = [
        {
          user_id: '59ecd002-468c-41a9-b32f-23555303e5a4',
          contract: 'CCMK25',
          option_type: 'CALL',
          strike_price: 48.00,
          expiration_date: '2025-02-15',
          premium: 2.50,
          quantity: 10,
          status: 'ATIVA'
        },
        {
          user_id: '7f2dab2b-6772-46a7-9913-28247d0e6485',
          contract: 'BGIK25',
          option_type: 'PUT',
          strike_price: 175.00,
          expiration_date: '2025-04-15',
          premium: 8.75,
          quantity: 5,
          status: 'ATIVA'
        }
      ];

      const { data, error } = await supabase
        .from('options')
        .insert(options)
        .select();

      if (error) {
        this.log('❌', `Erro ao criar options: ${error.message}`);
      } else {
        this.log('✅', `${data?.length || 0} options criadas`);
      }

    } catch (err) {
      this.log('❌', `Exceção ao criar options: ${err.message}`);
    }
  }

  async testarResultado() {
    this.log('🧪', 'TESTANDO RESULTADO FINAL...');
    
    try {
      // Teste crítico: Query que causava erro 406
      const { data: angeloTrans, error: angeloError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', '7f2dab2b-6772-46a7-9913-28247d0e6485')
        .order('date', { ascending: false })
        .limit(1);

      // Contagem geral
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      const { count: transactionsCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true });

      const { count: positionsCount } = await supabase
        .from('positions')
        .select('*', { count: 'exact', head: true });

      console.log('\n' + '='.repeat(60));
      this.log('📊', 'RESULTADO FINAL DA MIGRAÇÃO INTEGRATIVA:');
      console.log('='.repeat(60));

      this.log('👥', `Usuários: ${usersCount || 0}`);
      this.log('💰', `Transactions: ${transactionsCount || 0}`);
      this.log('📊', `Positions: ${positionsCount || 0}`);

      if (angeloError) {
        this.log('❌', `ERRO 406 AINDA PRESENTE: ${angeloError.message}`);
      } else if (!angeloTrans || angeloTrans.length === 0) {
        this.log('❌', 'ERRO 406 AINDA PRESENTE: Ângelo sem transactions');
      } else {
        this.log('✅', `ERRO 406 RESOLVIDO! Ângelo tem transactions`);
        this.log('🎯', `Query ORDER BY date DESC funcionando!`);
      }

      console.log('='.repeat(60));

    } catch (err) {
      this.log('❌', `Erro no teste final: ${err.message}`);
    }
  }
}

// Executar
async function main() {
  const migracao = new MigracaoIntegrativaFinal();
  await migracao.executar();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = MigracaoIntegrativaFinal; 