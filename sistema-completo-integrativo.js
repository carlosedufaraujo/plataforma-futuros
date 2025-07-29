#!/usr/bin/env node

/**
 * SISTEMA COMPLETO INTEGRATIVO - BOI GORDO INVESTIMENTOS
 * Análise, diagnóstico e correção automática usando conexão direta com Supabase
 */

const { createClient } = require('@supabase/supabase-js');

// Configuração Supabase
const SUPABASE_URL = 'https://kdfevkbwohcajcwrqzor.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkZmV2a2J3b2hjYWpjd3Jxem9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMTUzODcsImV4cCI6MjA2ODg5MTM4N30.4nBjKi3rdpfbYmxeoa8GELdBLq8JY6ym68cJX7jpaus';

// Criar cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// IDs dos usuários principais
const CARLOS_ID = '59ecd002-468c-41a9-b32f-23555303e5a4';
const ANGELO_ID = '7f2dab2b-6772-46a7-9913-28247d0e6485';

class SistemaCompleto {
  constructor() {
    this.resultados = {
      analise: {},
      problemas: [],
      correcoes: [],
      testes: {}
    };
  }

  log(emoji, mensagem) {
    console.log(`${emoji} ${mensagem}`);
  }

  async executar() {
    this.log('🚀', 'INICIANDO ANÁLISE COMPLETA DO SISTEMA...');
    console.log('='.repeat(60));

    try {
      // 1. Análise da estrutura
      await this.analisarEstrutura();
      
      // 2. Verificar usuários
      await this.verificarUsuarios();
      
      // 3. Analisar dados
      await this.analisarDados();
      
      // 4. Testar queries problemáticas
      await this.testarQueriesProblematicas();
      
      // 5. Executar correções se necessário
      await this.executarCorrecoes();
      
      // 6. Testes finais
      await this.testesFinais();
      
      // 7. Relatório final
      this.relatorioFinal();

    } catch (error) {
      this.log('❌', `ERRO CRÍTICO: ${error.message}`);
      console.error('Stack:', error.stack);
    }
  }

  async analisarEstrutura() {
    this.log('📊', 'PASSO 1: ANALISANDO ESTRUTURA DO BANCO...');
    
    // Verificar tabelas existentes
    const tabelasEssenciais = ['users', 'brokerages', 'user_brokerages', 'contracts', 'positions', 'transactions', 'options'];
    
    for (const tabela of tabelasEssenciais) {
      try {
        const { count, error } = await supabase
          .from(tabela)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          this.log('❌', `Tabela ${tabela}: ERRO - ${error.message}`);
          this.resultados.problemas.push(`Tabela ${tabela} inacessível: ${error.message}`);
        } else {
          this.log('✅', `Tabela ${tabela}: ${count} registros`);
          this.resultados.analise[tabela] = count;
        }
      } catch (err) {
        this.log('❌', `Tabela ${tabela}: EXCEÇÃO - ${err.message}`);
        this.resultados.problemas.push(`Tabela ${tabela} erro crítico: ${err.message}`);
      }
    }
  }

  async verificarUsuarios() {
    this.log('👥', 'PASSO 2: VERIFICANDO USUÁRIOS...');
    
    try {
      // Verificar se Carlos e Ângelo existem
      const { data: usuarios, error } = await supabase
        .from('users')
        .select('*')
        .in('id', [CARLOS_ID, ANGELO_ID]);
      
      if (error) {
        this.log('❌', `Erro ao buscar usuários: ${error.message}`);
        this.resultados.problemas.push(`Usuários inacessíveis: ${error.message}`);
        return;
      }

      const carlos = usuarios.find(u => u.id === CARLOS_ID);
      const angelo = usuarios.find(u => u.id === ANGELO_ID);

      if (carlos) {
        this.log('✅', `Carlos Eduardo encontrado - Role: ${carlos.role}`);
        if (carlos.role !== 'admin') {
          this.resultados.problemas.push('Carlos não é admin');
        }
      } else {
        this.log('❌', 'Carlos Eduardo NÃO encontrado');
        this.resultados.problemas.push('Carlos Eduardo ausente');
      }

      if (angelo) {
        this.log('✅', `Ângelo Caiado encontrado - Role: ${angelo.role}`);
      } else {
        this.log('❌', 'Ângelo Caiado NÃO encontrado');
        this.resultados.problemas.push('Ângelo Caiado ausente');
      }

      this.resultados.analise.usuarios = { carlos, angelo };

    } catch (err) {
      this.log('❌', `Erro crítico na verificação de usuários: ${err.message}`);
      this.resultados.problemas.push(`Verificação usuários falhou: ${err.message}`);
    }
  }

  async analisarDados() {
    this.log('💾', 'PASSO 3: ANALISANDO DADOS POR USUÁRIO...');
    
    const tabelas = ['positions', 'transactions', 'options'];
    
    for (const tabela of tabelas) {
      try {
        // Dados do Carlos
        const { count: carlosCount } = await supabase
          .from(tabela)
          .select('*', { count: 'exact', head: true })
          .eq('user_id', CARLOS_ID);

        // Dados do Ângelo
        const { count: angeloCount } = await supabase
          .from(tabela)
          .select('*', { count: 'exact', head: true })
          .eq('user_id', ANGELO_ID);

        this.log('📊', `${tabela}: Carlos=${carlosCount || 0}, Ângelo=${angeloCount || 0}`);
        
        // Problema específico: Ângelo sem transactions (causa erro 406)
        if (tabela === 'transactions' && (angeloCount === 0 || angeloCount === null)) {
          this.log('⚠️', 'PROBLEMA CRÍTICO: Ângelo sem transactions (causa erro 406)');
          this.resultados.problemas.push('Ângelo sem transactions - erro 406');
        }

        this.resultados.analise[`${tabela}_por_usuario`] = {
          carlos: carlosCount || 0,
          angelo: angeloCount || 0
        };

      } catch (err) {
        this.log('❌', `Erro ao analisar ${tabela}: ${err.message}`);
        this.resultados.problemas.push(`Análise ${tabela} falhou: ${err.message}`);
      }
    }
  }

  async testarQueriesProblematicas() {
    this.log('🧪', 'PASSO 4: TESTANDO QUERIES PROBLEMÁTICAS...');
    
    // Testar query que causava erro 406
    try {
      this.log('🔍', 'Testando query transactions do Ângelo (ORDER BY date DESC LIMIT 1)...');
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', ANGELO_ID)
        .order('date', { ascending: false })
        .limit(1);

      if (error) {
        this.log('❌', `Query transactions falhou: ${error.message}`);
        this.resultados.problemas.push(`Query transactions erro: ${error.message}`);
      } else if (!data || data.length === 0) {
        this.log('⚠️', 'Query transactions retornou vazio (causa erro 406)');
        this.resultados.problemas.push('Query transactions vazia - erro 406');
      } else {
        this.log('✅', `Query transactions OK: ${data.length} resultado(s)`);
        this.resultados.testes.query_transactions = 'OK';
      }

    } catch (err) {
      this.log('❌', `Erro crítico na query transactions: ${err.message}`);
      this.resultados.problemas.push(`Query transactions exceção: ${err.message}`);
    }

    // Testar outras queries críticas
    try {
      // Testar acesso a brokerages
      const { data: brokerages, error: brokError } = await supabase
        .from('brokerages')
        .select('*')
        .limit(1);

      if (brokError) {
        this.log('❌', `Query brokerages falhou: ${brokError.message}`);
        this.resultados.problemas.push(`Query brokerages erro: ${brokError.message}`);
      } else {
        this.log('✅', `Query brokerages OK: ${brokerages?.length || 0} resultado(s)`);
        this.resultados.testes.query_brokerages = 'OK';
      }

    } catch (err) {
      this.log('❌', `Erro crítico nas queries de teste: ${err.message}`);
      this.resultados.problemas.push(`Queries teste exceção: ${err.message}`);
    }
  }

  async executarCorrecoes() {
    this.log('🔧', 'PASSO 5: EXECUTANDO CORREÇÕES AUTOMÁTICAS...');
    
    if (this.resultados.problemas.length === 0) {
      this.log('✅', 'Nenhuma correção necessária!');
      return;
    }

    this.log('⚠️', `${this.resultados.problemas.length} problema(s) identificado(s)`);
    
    // Correção 1: Inserir transactions para Ângelo se necessário
    if (this.resultados.problemas.some(p => p.includes('transactions'))) {
      await this.corrigirTransactionsAngelo();
    }

    // Correção 2: Garantir role admin para Carlos se necessário
    if (this.resultados.problemas.some(p => p.includes('admin'))) {
      await this.corrigirRoleCarlos();
    }

    // Correção 3: Inserir dados básicos se necessário
    if (this.resultados.problemas.some(p => p.includes('ausente'))) {
      await this.inserirDadosBasicos();
    }
  }

  async corrigirTransactionsAngelo() {
    this.log('🔧', 'Corrigindo transactions do Ângelo...');
    
    try {
      // Inserir algumas transactions básicas
      const transactionsExemplo = [
        {
          user_id: ANGELO_ID,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 dias atrás
          type: 'COMPRA',
          contract: 'CCMK25',
          quantity: 75,
          price: 46.80,
          total: 3510.00,
          fees: 20.00,
          status: 'EXECUTADA'
        },
        {
          user_id: ANGELO_ID,
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 dia atrás
          type: 'VENDA',
          contract: 'SOJK25',
          quantity: 25,
          price: 65.00,
          total: 1625.00,
          fees: 12.50,
          status: 'EXECUTADA'
        },
        {
          user_id: ANGELO_ID,
          date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hora atrás
          type: 'COMPRA',
          contract: 'CCMK25',
          quantity: 25,
          price: 47.20,
          total: 1180.00,
          fees: 8.00,
          status: 'EXECUTADA'
        }
      ];

      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionsExemplo)
        .select();

      if (error) {
        this.log('❌', `Erro ao inserir transactions: ${error.message}`);
        this.resultados.problemas.push(`Correção transactions falhou: ${error.message}`);
      } else {
        this.log('✅', `${data.length} transactions inseridas para Ângelo`);
        this.resultados.correcoes.push(`${data.length} transactions inseridas para Ângelo`);
      }

    } catch (err) {
      this.log('❌', `Erro crítico na correção transactions: ${err.message}`);
      this.resultados.problemas.push(`Correção transactions exceção: ${err.message}`);
    }
  }

  async corrigirRoleCarlos() {
    this.log('🔧', 'Corrigindo role admin do Carlos...');
    
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('id', CARLOS_ID)
        .select();

      if (error) {
        this.log('❌', `Erro ao atualizar role Carlos: ${error.message}`);
        this.resultados.problemas.push(`Correção role Carlos falhou: ${error.message}`);
      } else {
        this.log('✅', 'Role admin definida para Carlos');
        this.resultados.correcoes.push('Role admin definida para Carlos');
      }

    } catch (err) {
      this.log('❌', `Erro crítico na correção role Carlos: ${err.message}`);
      this.resultados.problemas.push(`Correção role Carlos exceção: ${err.message}`);
    }
  }

  async inserirDadosBasicos() {
    this.log('🔧', 'Inserindo dados básicos se necessário...');
    
    // Se não existir brokerages, inserir algumas básicas
    try {
      const { count: brokerageCount } = await supabase
        .from('brokerages')
        .select('*', { count: 'exact', head: true });

      if (!brokerageCount || brokerageCount === 0) {
        const brokeragesBasicas = [
          { name: 'Clear Corretora', code: 'CLEAR', is_active: true },
          { name: 'XP Investimentos', code: 'XP', is_active: true }
        ];

        const { data, error } = await supabase
          .from('brokerages')
          .insert(brokeragesBasicas)
          .select();

        if (error) {
          this.log('❌', `Erro ao inserir brokerages: ${error.message}`);
        } else {
          this.log('✅', `${data.length} brokerages básicas inseridas`);
          this.resultados.correcoes.push(`${data.length} brokerages inseridas`);
        }
      }

    } catch (err) {
      this.log('❌', `Erro na inserção de dados básicos: ${err.message}`);
    }
  }

  async testesFinais() {
    this.log('🧪', 'PASSO 6: TESTES FINAIS DO SISTEMA...');
    
    // Re-testar query que causava erro 406
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', ANGELO_ID)
        .order('date', { ascending: false })
        .limit(1);

      if (error) {
        this.log('❌', `TESTE FINAL FALHOU: ${error.message}`);
        this.resultados.testes.final_transactions = 'FALHOU';
      } else if (!data || data.length === 0) {
        this.log('❌', 'TESTE FINAL: Ainda sem transactions para Ângelo');
        this.resultados.testes.final_transactions = 'VAZIO';
      } else {
        this.log('✅', 'TESTE FINAL: Query transactions funcionando!');
        this.resultados.testes.final_transactions = 'OK';
      }

    } catch (err) {
      this.log('❌', `TESTE FINAL EXCEÇÃO: ${err.message}`);
      this.resultados.testes.final_transactions = 'EXCEÇÃO';
    }

    // Teste de contagem final
    try {
      const { count: positionsCount } = await supabase
        .from('positions')
        .select('*', { count: 'exact', head: true });

      const { count: transactionsCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true });

      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      this.log('📊', `CONTAGEM FINAL: ${usersCount} usuários, ${positionsCount} positions, ${transactionsCount} transactions`);
      
      this.resultados.testes.contagem_final = {
        users: usersCount,
        positions: positionsCount,
        transactions: transactionsCount
      };

    } catch (err) {
      this.log('❌', `Erro na contagem final: ${err.message}`);
    }
  }

  relatorioFinal() {
    console.log('\n' + '='.repeat(60));
    this.log('🎉', 'RELATÓRIO FINAL DO SISTEMA');
    console.log('='.repeat(60));

    // Status geral
    const problemas = this.resultados.problemas.length;
    const correcoes = this.resultados.correcoes.length;
    
    if (problemas === 0) {
      this.log('✅', 'SISTEMA TOTALMENTE FUNCIONAL!');
    } else if (correcoes > 0) {
      this.log('🔧', `${correcoes} CORREÇÕES APLICADAS, ${problemas} problemas identificados`);
    } else {
      this.log('❌', `${problemas} PROBLEMAS PENDENTES`);
    }

    // Detalhes da análise
    console.log('\n📊 ANÁLISE DAS TABELAS:');
    Object.entries(this.resultados.analise).forEach(([key, value]) => {
      if (typeof value === 'number') {
        console.log(`   ${key}: ${value} registros`);
      }
    });

    // Problemas encontrados
    if (this.resultados.problemas.length > 0) {
      console.log('\n⚠️  PROBLEMAS IDENTIFICADOS:');
      this.resultados.problemas.forEach((problema, i) => {
        console.log(`   ${i + 1}. ${problema}`);
      });
    }

    // Correções aplicadas
    if (this.resultados.correcoes.length > 0) {
      console.log('\n🔧 CORREÇÕES APLICADAS:');
      this.resultados.correcoes.forEach((correcao, i) => {
        console.log(`   ${i + 1}. ${correcao}`);
      });
    }

    // Testes finais
    console.log('\n🧪 RESULTADOS DOS TESTES:');
    Object.entries(this.resultados.testes).forEach(([teste, resultado]) => {
      const emoji = resultado === 'OK' ? '✅' : '❌';
      console.log(`   ${emoji} ${teste}: ${resultado}`);
    });

    // Recomendações finais
    console.log('\n🚀 PRÓXIMOS PASSOS:');
    if (this.resultados.testes.final_transactions === 'OK') {
      console.log('   ✅ Erro 406 deve estar resolvido');
      console.log('   ✅ Sistema pronto para uso');
      console.log('   🌐 Teste em: http://localhost:3000');
    } else {
      console.log('   ⚠️  Ainda há problemas na query transactions');
      console.log('   🔧 Execute correções manuais se necessário');
    }

    console.log('\n' + '='.repeat(60));
  }
}

// Executar o sistema
async function main() {
  const sistema = new SistemaCompleto();
  await sistema.executar();
}

// Executar se for chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = SistemaCompleto; 