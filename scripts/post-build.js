const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando post-build...');

// Garantir que o diretório out/ existe
const outDir = path.join(__dirname, '..', 'out');
if (!fs.existsSync(outDir)) {
  console.log('📁 Criando diretório out/...');
  fs.mkdirSync(outDir, { recursive: true });
}

// Copia arquivos de configuração do Cloudflare para o diretório de build
const filesToCopy = ['_routes.json', '_headers', '_redirects'];

console.log('📋 Arquivos para copiar:', filesToCopy);

filesToCopy.forEach(file => {
  const source = path.join(__dirname, '..', 'public', file);
  const dest = path.join(__dirname, '..', 'out', file);
  
  console.log(`🔍 Verificando ${file}...`);
  console.log(`   Source: ${source}`);
  console.log(`   Dest: ${dest}`);
  
  if (fs.existsSync(source)) {
    try {
      fs.copyFileSync(source, dest);
      console.log(`✅ Copiado ${file} para out/`);
    } catch (error) {
      console.error(`❌ Erro ao copiar ${file}:`, error.message);
      console.error(`   Source exists: ${fs.existsSync(source)}`);
      console.error(`   Dest dir exists: ${fs.existsSync(path.dirname(dest))}`);
    }
  } else {
    console.log(`⚠️ Arquivo ${file} não encontrado em public/`);
  }
});

// Verificar se as páginas foram geradas
console.log('🔍 Verificando páginas geradas...');
const pagesToCheck = ['debug/index.html', 'diagnostics/index.html'];
pagesToCheck.forEach(page => {
  const pagePath = path.join(__dirname, '..', 'out', page);
  if (fs.existsSync(pagePath)) {
    console.log(`✅ Página ${page} encontrada`);
  } else {
    console.log(`ℹ️ Página ${page} não encontrada (pode ser normal)`);
  }
});

console.log('✅ Post-build concluído');