#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICAÇÃO COMPLETA DO SISTEMA\n');

const errors = [];
const warnings = [];
const success = [];

// 1. Verificar build do TypeScript
console.log('1️⃣ Verificando TypeScript...');
try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  success.push('✅ TypeScript: Sem erros de compilação');
} catch (error) {
  const output = error.stdout?.toString() || error.stderr?.toString() || '';
  const errorCount = (output.match(/error TS/g) || []).length;
  errors.push(`❌ TypeScript: ${errorCount} erros encontrados`);
  if (errorCount > 0 && errorCount < 10) {
    console.log('Erros TypeScript:\n', output.substring(0, 500) + '...');
  }
}

// 2. Verificar ESLint
console.log('\n2️⃣ Verificando ESLint...');
try {
  execSync('npx eslint src --ext .ts,.tsx --max-warnings 0', { stdio: 'pipe' });
  success.push('✅ ESLint: Sem erros ou warnings');
} catch (error) {
  const output = error.stdout?.toString() || '';
  const errorMatch = output.match(/(\d+) errors?/);
  const warningMatch = output.match(/(\d+) warnings?/);
  
  if (errorMatch && parseInt(errorMatch[1]) > 0) {
    errors.push(`❌ ESLint: ${errorMatch[1]} erros encontrados`);
  }
  if (warningMatch && parseInt(warningMatch[1]) > 0) {
    warnings.push(`⚠️  ESLint: ${warningMatch[1]} warnings encontrados`);
  }
}

// 3. Verificar imports quebrados
console.log('\n3️⃣ Verificando imports...');
const checkImports = () => {
  const files = execSync('find src -name "*.tsx" -o -name "*.ts"', { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);
  
  let brokenImports = 0;
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const imports = content.match(/from ['"]@\/[^'"]+['"]/g) || [];
    
    imports.forEach(imp => {
      const importPath = imp.match(/from ['"](.+)['"]/)[1];
      const resolvedPath = importPath.replace('@/', './src/');
      
      // Verificar se o arquivo existe
      const possiblePaths = [
        resolvedPath + '.tsx',
        resolvedPath + '.ts',
        resolvedPath + '/index.tsx',
        resolvedPath + '/index.ts'
      ];
      
      const exists = possiblePaths.some(p => fs.existsSync(p));
      if (!exists) {
        brokenImports++;
      }
    });
  });
  
  if (brokenImports === 0) {
    success.push('✅ Imports: Todos os imports estão corretos');
  } else {
    errors.push(`❌ Imports: ${brokenImports} imports quebrados encontrados`);
  }
};

try {
  checkImports();
} catch (error) {
  warnings.push('⚠️  Imports: Não foi possível verificar todos os imports');
}

// 4. Verificar arquivos duplicados
console.log('\n4️⃣ Verificando arquivos duplicados...');
const duplicates = execSync('find src -name "*\\ 2.*" -o -name "*copy*"', { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean);

if (duplicates.length === 0) {
  success.push('✅ Arquivos: Sem duplicatas encontradas');
} else {
  warnings.push(`⚠️  Arquivos: ${duplicates.length} arquivos duplicados encontrados`);
}

// 5. Verificar console.logs
console.log('\n5️⃣ Verificando console.logs...');
const consoleLogs = execSync('grep -r "console.log" src --include="*.tsx" --include="*.ts" | wc -l', { encoding: 'utf8' }).trim();
if (parseInt(consoleLogs) === 0) {
  success.push('✅ Console: Sem console.logs encontrados');
} else {
  warnings.push(`⚠️  Console: ${consoleLogs} console.logs encontrados`);
}

// 6. Verificar uso de .single()
console.log('\n6️⃣ Verificando uso de .single()...');
const singleUsage = execSync('grep -r "\\.single()" src --include="*.tsx" --include="*.ts" | wc -l', { encoding: 'utf8' }).trim();
if (parseInt(singleUsage) === 0) {
  success.push('✅ Supabase: Nenhum uso de .single() encontrado');
} else {
  warnings.push(`⚠️  Supabase: ${singleUsage} usos de .single() ainda presentes`);
}

// 7. Verificar service role key
console.log('\n7️⃣ Verificando service role key...');
try {
  execSync('grep -r "service_role" src --include="*.tsx" --include="*.ts"', { stdio: 'pipe' });
  errors.push('❌ Segurança: Service role key encontrada no código frontend!');
} catch {
  success.push('✅ Segurança: Service role key não encontrada no frontend');
}

// RELATÓRIO FINAL
console.log('\n' + '='.repeat(60));
console.log('📊 RELATÓRIO FINAL\n');

console.log(`✅ SUCESSOS (${success.length}):`);
success.forEach(s => console.log('  ' + s));

if (warnings.length > 0) {
  console.log(`\n⚠️  AVISOS (${warnings.length}):`);
  warnings.forEach(w => console.log('  ' + w));
}

if (errors.length > 0) {
  console.log(`\n❌ ERROS CRÍTICOS (${errors.length}):`);
  errors.forEach(e => console.log('  ' + e));
}

console.log('\n' + '='.repeat(60));

// Status final
if (errors.length === 0) {
  console.log('🎉 Sistema sem erros críticos!');
  process.exit(0);
} else {
  console.log('⚠️  Sistema com problemas que precisam ser resolvidos.');
  process.exit(1);
}