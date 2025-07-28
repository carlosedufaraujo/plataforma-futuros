# 🔧 Expansão de Ferramentas MCP - Roadmap

## 📋 Ferramentas Atuais

1. ✅ `check-environment` - Verificar variáveis de ambiente
2. ✅ `test-supabase` - Testar conexão com banco
3. ✅ `check-pages-deployment` - Verificar status das páginas
4. ✅ `analyze-errors` - Analisar erros HTTP
5. ✅ `list-routes` - Listar rotas e status

## 🚀 Ferramentas Propostas para Implementar

### 1. Gestão de Dados

#### `check-table-data`
```typescript
{
  name: 'check-table-data',
  description: 'Verificar dados em uma tabela específica',
  parameters: {
    table: string, // users, positions, transactions, etc
    limit?: number,
    filters?: object
  }
}
```

#### `validate-schema`
```typescript
{
  name: 'validate-schema',
  description: 'Validar estrutura das tabelas do Supabase',
  parameters: {
    table?: string // se vazio, valida todas
  }
}
```

#### `backup-data`
```typescript
{
  name: 'backup-data',
  description: 'Criar backup dos dados críticos',
  parameters: {
    tables: string[],
    format: 'json' | 'csv'
  }
}
```

### 2. Monitoramento e Performance

#### `check-performance`
```typescript
{
  name: 'check-performance',
  description: 'Medir performance das principais operações',
  parameters: {
    operations: string[] // ['list-positions', 'calculate-pnl', etc]
  }
}
```

#### `monitor-errors`
```typescript
{
  name: 'monitor-errors',
  description: 'Listar últimos erros registrados',
  parameters: {
    hours: number, // últimas N horas
    severity?: 'all' | 'critical' | 'warning'
  }
}
```

#### `health-check-detailed`
```typescript
{
  name: 'health-check-detailed',
  description: 'Verificação completa de saúde do sistema',
  parameters: {
    includeMetrics: boolean,
    includeLogs: boolean
  }
}
```

### 3. Operações de Manutenção

#### `clear-cache`
```typescript
{
  name: 'clear-cache',
  description: 'Limpar caches do sistema',
  parameters: {
    cacheType: 'all' | 'api' | 'static' | 'database'
  }
}
```

#### `reset-test-data`
```typescript
{
  name: 'reset-test-data',
  description: 'Resetar dados de teste para estado inicial',
  parameters: {
    confirm: boolean,
    preserveUsers: boolean
  }
}
```

#### `run-migrations`
```typescript
{
  name: 'run-migrations',
  description: 'Executar migrações pendentes do banco',
  parameters: {
    dryRun: boolean
  }
}
```

### 4. Análise de Negócio

#### `generate-report`
```typescript
{
  name: 'generate-report',
  description: 'Gerar relatório de operações',
  parameters: {
    reportType: 'daily' | 'weekly' | 'monthly',
    userId?: string,
    format: 'json' | 'pdf'
  }
}
```

#### `calculate-metrics`
```typescript
{
  name: 'calculate-metrics',
  description: 'Calcular métricas de negócio',
  parameters: {
    metrics: string[], // ['total-exposure', 'profit-loss', 'win-rate']
    period: string
  }
}
```

### 5. Integração e Sincronização

#### `sync-prices`
```typescript
{
  name: 'sync-prices',
  description: 'Sincronizar preços de contratos',
  parameters: {
    source: 'manual' | 'api',
    contracts?: string[]
  }
}
```

#### `validate-positions`
```typescript
{
  name: 'validate-positions',
  description: 'Validar consistência das posições',
  parameters: {
    userId?: string,
    autoFix: boolean
  }
}
```

## 🛠️ Implementação das Novas Ferramentas

### Estrutura do Código

```typescript
// Adicionar em mcp-official/src/index.ts

// Nova ferramenta exemplo
case 'check-table-data':
  const { table, limit = 10, filters } = args;
  
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return {
      content: [{
        type: 'text',
        text: 'Error: Supabase credentials not configured'
      }]
    };
  }

  try {
    let url = `${env.SUPABASE_URL}/rest/v1/${table}?limit=${limit}`;
    
    // Adicionar filtros se fornecidos
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        url += `&${key}=eq.${value}`;
      });
    }

    const response = await fetch(url, {
      headers: {
        'apikey': env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`
      }
    });

    const data = await response.json();
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          table,
          count: data.length,
          data: data
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error checking table data: ${error.message}`
      }]
    };
  }
```

## 📊 Priorização de Implementação

### Fase 1 (Imediato)
1. `check-table-data` - Essencial para debug
2. `health-check-detailed` - Visão completa do sistema
3. `monitor-errors` - Identificar problemas rapidamente

### Fase 2 (Próxima Sprint)
1. `validate-schema` - Garantir integridade
2. `calculate-metrics` - Métricas de negócio
3. `sync-prices` - Manter preços atualizados

### Fase 3 (Futuro)
1. `generate-report` - Relatórios automatizados
2. `backup-data` - Segurança dos dados
3. `run-migrations` - Gestão de schema

## 🔒 Segurança

### Autenticação
```typescript
// Adicionar verificação de token
const isAuthorized = (request: Request, env: Env): boolean => {
  const token = request.headers.get('X-MCP-Token');
  return token === env.MCP_SECRET_TOKEN;
};

// Usar em ferramentas sensíveis
if (!isAuthorized(request, env)) {
  return {
    content: [{
      type: 'text',
      text: 'Error: Unauthorized'
    }]
  };
}
```

### Rate Limiting
```typescript
// Implementar limite de requisições
const rateLimiter = new Map<string, number[]>();

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const requests = rateLimiter.get(ip) || [];
  const recentRequests = requests.filter(time => now - time < 60000); // último minuto
  
  if (recentRequests.length >= 60) {
    return false; // limite excedido
  }
  
  rateLimiter.set(ip, [...recentRequests, now]);
  return true;
};
```

## 📝 Documentação para Novas Ferramentas

Cada nova ferramenta deve ter:
1. Descrição clara do propósito
2. Parâmetros com tipos e validação
3. Exemplos de uso
4. Possíveis erros e soluções
5. Nível de permissão necessário

## 🚀 Deploy de Atualizações

```bash
# 1. Testar localmente
cd mcp-official
npm test

# 2. Deploy staging
npx wrangler deploy --env staging

# 3. Testar no staging
curl https://boi-gordo-mcp-staging.workers.dev/health

# 4. Deploy produção
npx wrangler deploy --env production
```

---

📅 **Roadmap atualizado em**: 27 de Julho de 2025
🎯 **Objetivo**: Ter 20+ ferramentas MCP até final de 2025