const fs = require('fs');
const path = require('path');

// Copia arquivos de configuração do Cloudflare para o diretório de build
const filesToCopy = ['_routes.json', '_headers', '_redirects'];

filesToCopy.forEach(file => {
  const source = path.join(__dirname, '..', 'public', file);
  const dest = path.join(__dirname, '..', 'out', file);
  
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, dest);
    console.log(`✅ Copiado ${file} para out/`);
  }
});

// Verificar se as páginas foram geradas
const pagesToCheck = ['debug/index.html', 'diagnostics/index.html'];
pagesToCheck.forEach(page => {
  const pagePath = path.join(__dirname, '..', 'out', page);
  if (fs.existsSync(pagePath)) {
    console.log(`✅ Página ${page} encontrada`);
  } else {
    console.error(`❌ Página ${page} NÃO encontrada!`);
  }
});

console.log('✅ Post-build concluído');