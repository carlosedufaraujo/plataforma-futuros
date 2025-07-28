#!/usr/bin/env node

const https = require('https');

console.log('🔍 Verificando variáveis de ambiente no Cloudflare Pages...\n');

// Função para fazer requisição HTTPS
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function checkEnvironment() {
  try {
    // 1. Verificar se a página debug está acessível
    console.log('1️⃣ Verificando página /debug...');
    const debugResponse = await fetchUrl('https://plataforma-futuros.pages.dev/debug/');
    
    if (debugResponse.status === 200) {
      console.log('✅ Página /debug acessível\n');
      
      // Extrair informações básicas do HTML
      const hasSupabaseUrl = debugResponse.data.includes('NEXT_PUBLIC_SUPABASE_URL');
      const hasSupabaseKey = debugResponse.data.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY');
      
      if (hasSupabaseUrl || hasSupabaseKey) {
        console.log('📋 Variáveis detectadas no HTML (podem estar configuradas)\n');
      }
    } else {
      console.log(`❌ Página /debug retornou status ${debugResponse.status}\n`);
    }
    
    // 2. Verificar MCP Server
    console.log('2️⃣ Verificando MCP Server...');
    const mcpUrl = 'https://boi-gordo-mcp-official.carlosedufaraujo.workers.dev/health';
    const mcpResponse = await fetchUrl(mcpUrl);
    
    if (mcpResponse.status === 200) {
      const mcpData = JSON.parse(mcpResponse.data);
      console.log('✅ MCP Server online');
      console.log(`   Versão: ${mcpData.mcp_version}`);
      console.log(`   Ambiente: ${mcpData.environment}\n`);
    } else {
      console.log('❌ MCP Server não está respondendo\n');
    }
    
    // 3. Instruções finais
    console.log('📌 Próximos passos:');
    console.log('1. Acesse https://plataforma-futuros.pages.dev/debug/');
    console.log('2. Verifique se as variáveis aparecem como "Configurado"');
    console.log('3. Se não, siga o guia em CLOUDFLARE_ENV_SETUP.md');
    console.log('\n💡 Dica: As variáveis só são aplicadas em NOVOS deployments!');
    
  } catch (error) {
    console.error('❌ Erro ao verificar:', error.message);
  }
}

// Executar verificação
checkEnvironment();