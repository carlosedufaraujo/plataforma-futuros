#!/usr/bin/env node

/**
 * INVESTIGAÇÃO ESPECÍFICA DO ERRO 406
 * Agora sabemos que os dados existem - foco no problema real
 */

const { createClient } = require('@supabase/supabase-js');

// Configuração Supabase
const SUPABASE_URL = 'https://kdfevkbwohcajcwrqzor.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkZmV2a2J3b2hjYWpjd3Jxem9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMTUzODcsImV4cCI6MjA2ODg5MTM4N30.4nBjKi3rdpfbYmxeoa8GELdBLq8JY6ym68cJX7jpaus';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class InvestigadorErro406 {
  constructor() {
    this.log('🔍', 'INVESTIGANDO ERRO 406 ESPECÍFICO');
    this.log('✅', 'Dados confirmados existentes: users=2, transactions=1, brokerages=4');
  }

  log(emoji, mensagem) {
    console.log(`${emoji} ${mensagem}`);
  }

  async executar() {
    console.log('='.repeat(70));
    this.log('🎯', 'FOCO: ERRO 406 COM DADOS EXISTENTES');
    console.log('='.repeat(70));

    try {
      // 1. Investigar query específica que causa erro 406
      await this.testarQueryProblematica();
      
      // 2. Verificar dados do Ângelo especificamente
      await this.verificarAngeloEspecifico();
      
      // 3. Testar diferentes variações da query
      await this.testarVariacoesQuery();
      
      // 4. Investigar RLS específicas
      await this.investigarRLS();
      
      this.log('📋', 'INVESTIGAÇÃO CONCLUÍDA');
      
    } catch (error) {
      this.log('❌', `ERRO CRÍTICO: ${error.message}`);
      console.error('Stack:', error.stack);
    }
  }

  async testarQueryProblematica() {
    this.log('🧪', 'TESTANDO QUERY ESPECÍFICA QUE CAUSA ERRO 406...');
    
    const ANGELO_ID = '7f2dab2b-6772-46a7-9913-28247d0e6485';
    
    try {
      this.log('🔍', 'Query exata do erro: transactions + user_id=Angelo + ORDER BY date DESC + LIMIT 1');
      
      const { data, error, count } = await supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', ANGELO_ID)
        .order('date', { ascending: false })
        .limit(1);

      this.log('📊', `Resultado query problemática:`);
      this.log('📈', `  - Count: ${count}`);
      this.log('📈', `  - Data length: ${data ? data.length : 'null'}`);
      this.log('📈', `  - Error: ${error ? error.message : 'nenhum'}`);
      
      if (data && data.length > 0) {
        this.log('✅', 'Query funcionou! Dados encontrados:');
        console.log('   ', JSON.stringify(data[0], null, 2));
      } else {
        this.log('⚠️', 'Query retornou vazia - pode ser o problema!');
      }

    } catch (err) {
      this.log('❌', `Exceção na query problemática: ${err.message}`);
    }
  }

  async verificarAngeloEspecifico() {
    this.log('👤', 'VERIFICANDO DADOS ESPECÍFICOS DO ÂNGELO...');
    
    const ANGELO_ID = '7f2dab2b-6772-46a7-9913-28247d0e6485';
    
    try {
      // Verificar se Ângelo existe
      const { data: angelo, error: angeloError } = await supabase
        .from('users')
        .select('*')
        .eq('id', ANGELO_ID)
        .single();

      if (angeloError) {
        this.log('❌', `Erro ao buscar Ângelo: ${angeloError.message}`);
      } else if (angelo) {
        this.log('✅', `Ângelo encontrado: ${angelo.nome} (${angelo.role})`);
      } else {
        this.log('❌', 'Ângelo não encontrado');
      }

      // Verificar transactions do Ângelo (sem filtros)
      const { data: transactions, error: transError, count } = await supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', ANGELO_ID);

      this.log('📊', `Transactions do Ângelo:`);
      this.log('📈', `  - Total: ${count || 0}`);
      this.log('📈', `  - Error: ${transError ? transError.message : 'nenhum'}`);
      
      if (transactions && transactions.length > 0) {
        this.log('✅', `${transactions.length} transactions encontradas para Ângelo`);
        transactions.forEach((t, i) => {
          this.log('📋', `  ${i+1}. ${t.type} ${t.contract} - ${t.date}`);
        });
      } else {
        this.log('⚠️', 'NENHUMA transaction encontrada para Ângelo - ESTE É O PROBLEMA!');
      }

    } catch (err) {
      this.log('❌', `Exceção ao verificar Ângelo: ${err.message}`);
    }
  }

  async testarVariacoesQuery() {
    this.log('🔄', 'TESTANDO VARIAÇÕES DA QUERY...');
    
    const ANGELO_ID = '7f2dab2b-6772-46a7-9913-28247d0e6485';
    
    const queries = [
      {
        nome: 'Sem ORDER BY',
        query: () => supabase.from('transactions').select('*').eq('user_id', ANGELO_ID).limit(1)
      },
      {
        nome: 'Sem LIMIT',
        query: () => supabase.from('transactions').select('*').eq('user_id', ANGELO_ID).order('date', { ascending: false })
      },
      {
        nome: 'Sem user_id filter',
        query: () => supabase.from('transactions').select('*').order('date', { ascending: false }).limit(1)
      },
      {
        nome: 'Count only',
        query: () => supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('user_id', ANGELO_ID)
      }
    ];

    for (const teste of queries) {
      try {
        this.log('🧪', `Testando: ${teste.nome}`);
        
        const { data, error, count } = await teste.query();
        
        this.log('📊', `  Resultado: count=${count}, data=${data ? data.length : 'null'}, error=${error ? error.message : 'ok'}`);
        
      } catch (err) {
        this.log('❌', `  Exceção: ${err.message}`);
      }
    }
  }

  async investigarRLS() {
    this.log('🔒', 'INVESTIGANDO POLÍTICAS RLS...');
    
    try {
      // Testar acesso geral às tabelas
      const tabelas = ['users', 'transactions', 'brokerages'];
      
      for (const tabela of tabelas) {
        try {
          const { count, error } = await supabase
            .from(tabela)
            .select('*', { count: 'exact', head: true });

          this.log('📊', `Tabela ${tabela}: ${count || 0} registros acessíveis, error: ${error ? error.message : 'ok'}`);
          
        } catch (err) {
          this.log('❌', `Tabela ${tabela}: exceção ${err.message}`);
        }
      }

    } catch (err) {
      this.log('❌', `Erro na investigação RLS: ${err.message}`);
    }
  }
}

// Executar
async function main() {
  const investigador = new InvestigadorErro406();
  await investigador.executar();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = InvestigadorErro406; 