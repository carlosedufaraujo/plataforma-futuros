#!/usr/bin/env node

console.log('🔍 Debug de Variáveis de Ambiente\n');
console.log('=================================\n');

// Listar todas as variáveis NEXT_PUBLIC_
console.log('Variáveis NEXT_PUBLIC_ disponíveis:');
Object.keys(process.env).forEach(key => {
  if (key.startsWith('NEXT_PUBLIC_')) {
    console.log(`${key}: ${process.env[key]}`);
  }
});

console.log('\n=================================\n');

// Verificar arquivos .env
const fs = require('fs');
const path = require('path');

const envFiles = ['.env', '.env.local', '.env.production', '.env.development'];

envFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`\n📄 Arquivo ${file} encontrado:`);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(line => 
      line.trim() && !line.startsWith('#') && line.includes('NEXT_PUBLIC_')
    );
    lines.forEach(line => console.log(`  ${line}`));
  }
});

console.log('\n=================================\n');

// Verificar se estamos no Cloudflare
console.log('Ambiente de execução:');
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`CI: ${process.env.CI}`);
console.log(`CF_PAGES: ${process.env.CF_PAGES}`);
console.log(`CF_PAGES_BRANCH: ${process.env.CF_PAGES_BRANCH}`);
console.log(`CF_PAGES_URL: ${process.env.CF_PAGES_URL}`);

console.log('\n=================================\n');

// Sugestão de próximos passos
console.log('📌 Próximos passos:');
console.log('1. Execute este script localmente: node scripts/debug-env.js');
console.log('2. Execute durante o build: npm run build:cf');
console.log('3. Compare os resultados para identificar diferenças');