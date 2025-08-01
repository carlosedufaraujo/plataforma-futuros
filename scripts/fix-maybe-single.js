const fs = require('fs');
const path = require('path');

console.log('🔧 Adicionando tratamento de null para .maybeSingle()...\n');

const filePath = path.join(__dirname, '../src/services/supabaseService.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Padrões para substituir
const patterns = [
  {
    name: 'createUser',
    old: `    if (error) throw error;
    return this.mapUserFromDB(data);`,
    new: `    if (error) throw error;
    if (!data) throw new Error('Erro ao criar usuário');
    return this.mapUserFromDB(data);`
  },
  {
    name: 'updateUser',
    old: `    if (error) throw error;
    return this.mapUserFromDB(data);`,
    new: `    if (error) throw error;
    if (!data) throw new Error('Usuário não encontrado');
    return this.mapUserFromDB(data);`
  },
  {
    name: 'createBrokerage',
    old: `    if (error) throw error;
    return this.mapBrokerageFromDB(data);`,
    new: `    if (error) throw error;
    if (!data) throw new Error('Erro ao criar corretora');
    return this.mapBrokerageFromDB(data);`
  },
  {
    name: 'createPosition - já tem tratamento',
    skip: true
  },
  {
    name: 'updatePosition',
    old: `    if (error) throw error;
    return this.mapPositionFromDB(data);`,
    new: `    if (error) throw error;
    if (!data) throw new Error('Posição não encontrada');
    return this.mapPositionFromDB(data);`
  },
  {
    name: 'createTransaction - já tem tratamento',
    skip: true
  },
  {
    name: 'updateTransaction',
    old: `    if (error) throw error;
    return this.mapTransactionFromDB(data);`,
    new: `    if (error) throw error;
    if (!data) throw new Error('Transação não encontrada');
    return this.mapTransactionFromDB(data);`
  },
  {
    name: 'createOption',
    old: `    if (error) throw error;
    return this.mapOptionFromDB(data);`,
    new: `    if (error) throw error;
    if (!data) throw new Error('Erro ao criar opção');
    return this.mapOptionFromDB(data);`
  }
];

let changesCount = 0;

patterns.forEach(pattern => {
  if (pattern.skip) {
    console.log(`⏭️  ${pattern.name}`);
    return;
  }
  
  if (content.includes(pattern.old)) {
    content = content.replace(pattern.old, pattern.new);
    changesCount++;
    console.log(`✅ ${pattern.name}`);
  } else {
    console.log(`❓ ${pattern.name} - padrão não encontrado`);
  }
});

// Salvar arquivo
fs.writeFileSync(filePath, content);

console.log(`\n✅ ${changesCount} correções aplicadas!`);