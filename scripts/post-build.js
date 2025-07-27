const fs = require('fs');
const path = require('path');

// Copia arquivos de configuração do Cloudflare para o diretório de build
const filesToCopy = ['_routes.json', '_headers'];

filesToCopy.forEach(file => {
  const source = path.join(__dirname, '..', 'public', file);
  const dest = path.join(__dirname, '..', 'out', file);
  
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, dest);
    console.log(`✅ Copiado ${file} para out/`);
  }
});

console.log('✅ Post-build concluído');