const fs = require('fs');
const path = require('path');

console.log('🔧 Cloudflare post-build script iniciado...');

// Função para copiar arquivos recursivamente
function copyRecursive(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursive(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Verificar se o diretório out existe
if (!fs.existsSync('out')) {
  console.error('❌ Diretório "out" não encontrado. Execute "npm run build" primeiro.');
  process.exit(1);
}

// Garantir que _redirects e _routes.json sejam copiados
const filesToCopy = [
  { src: 'public/_redirects', dest: 'out/_redirects' },
  { src: 'public/_routes.json', dest: 'out/_routes.json' },
  { src: 'public/_headers', dest: 'out/_headers' }
];

filesToCopy.forEach(({ src, dest }) => {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✅ Copiado: ${src} → ${dest}`);
  }
});

// Verificar estrutura de pastas
const requiredPaths = ['out/debug', 'out/diagnostics'];
requiredPaths.forEach(dir => {
  if (fs.existsSync(dir)) {
    const indexPath = path.join(dir, 'index.html');
    if (fs.existsSync(indexPath)) {
      console.log(`✅ Verificado: ${indexPath}`);
    } else {
      console.error(`❌ Arquivo não encontrado: ${indexPath}`);
    }
  } else {
    console.error(`❌ Diretório não encontrado: ${dir}`);
  }
});

// Criar arquivo de manifesto para debug
const manifest = {
  buildTime: new Date().toISOString(),
  routes: {
    '/': fs.existsSync('out/index.html'),
    '/debug': fs.existsSync('out/debug/index.html'),
    '/diagnostics': fs.existsSync('out/diagnostics/index.html')
  }
};

fs.writeFileSync('out/build-manifest.json', JSON.stringify(manifest, null, 2));
console.log('✅ Manifesto de build criado');

console.log('✅ Post-build concluído com sucesso!');