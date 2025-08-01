# Estrutura do Projeto - Plataforma Futuros

## 📁 Estrutura de Pastas

```
boi-gordo-investimentos2/
├── docs/                      # Documentação do projeto
│   ├── setup/                 # Guias de configuração
│   ├── database/              # Documentação do banco
│   └── guides/                # Guias e manuais
│
├── scripts/                   # Scripts utilitários
│   ├── database/              # Scripts SQL
│   ├── migration/             # Scripts de migração
│   └── utils/                 # Utilitários JS
│
├── src/                       # Código fonte
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/           # Rotas autenticadas
│   │   ├── api/              # API routes
│   │   ├── login/            # Página de login
│   │   ├── layout.tsx        # Layout principal
│   │   └── page.tsx          # Homepage
│   │
│   ├── components/           # Componentes React
│   │   ├── ui/              # Componentes base (Button, Input, etc)
│   │   ├── features/        # Componentes de features
│   │   ├── layouts/         # Layouts da aplicação
│   │   ├── Admin/           # Componentes administrativos
│   │   ├── Auth/            # Componentes de autenticação
│   │   ├── Common/          # Componentes compartilhados
│   │   ├── Modals/          # Modais do sistema
│   │   ├── Settings/        # Componentes de configurações
│   │   └── Trading/         # Componentes de trading
│   │
│   ├── contexts/            # React Contexts
│   │   ├── AuthContext.tsx  # Contexto de autenticação
│   │   ├── DataProvider.tsx # Provider de dados unificado
│   │   └── FilterContext.tsx # Contexto de filtros
│   │
│   ├── hooks/               # Custom React Hooks
│   ├── lib/                 # Bibliotecas e configurações
│   ├── services/            # Serviços e APIs
│   ├── styles/              # Estilos globais
│   │   ├── globals.css      # CSS global
│   │   └── design-tokens.css # Design tokens
│   │
│   ├── types/               # TypeScript types
│   └── utils/               # Funções utilitárias
│
├── public/                  # Arquivos estáticos
├── tests/                   # Testes
│   ├── unit/               # Testes unitários
│   └── e2e/                # Testes end-to-end
│
└── [arquivos de configuração]
    ├── .eslintrc.json      # Configuração ESLint
    ├── .gitignore          # Git ignore
    ├── CLAUDE.md           # Instruções para o Claude
    ├── README.md           # Documentação principal
    ├── next.config.mjs     # Configuração Next.js
    ├── package.json        # Dependências
    ├── tailwind.config.js  # Configuração Tailwind
    └── tsconfig.json       # Configuração TypeScript
```

## 🔧 Melhorias Implementadas

### 1. **Organização de Arquivos**
- ✅ Movidos 68 arquivos SQL para `scripts/database/`
- ✅ Movidos 42 arquivos MD para `docs/guides/`
- ✅ Scripts JS organizados em `scripts/utils/`
- ✅ Removidos arquivos de log e adicionados ao `.gitignore`

### 2. **Contextos Unificados**
- ✅ Criado `DataProvider.tsx` unificado
- ✅ Removidos contextos duplicados (HybridDataContext, SupabaseDataContext, etc)
- ✅ Simplificada a hierarquia de providers

### 3. **Configurações Corrigidas**
- ✅ TypeScript: Habilitada verificação de tipos
- ✅ ESLint: Habilitado e configurado adequadamente
- ✅ Criado `.eslintrc.json` com regras apropriadas

### 4. **Sistema de Design**
- ✅ Criado `design-tokens.css` com variáveis consistentes
- ✅ Atualizado `globals.css` para usar design tokens
- ✅ Implementado sistema de cores, espaçamento e tipografia consistente

### 5. **Limpeza do Projeto**
- ✅ Removidas pastas não utilizadas (backend/, mcp-server/, etc)
- ✅ Removidas páginas de teste desnecessárias
- ✅ Removidos arquivos temporários e capturas de tela

## 🚀 Próximos Passos

1. **Atualizar imports** nos componentes para usar o novo `DataProvider`
2. **Executar linting** para corrigir problemas de código
3. **Testar build** com as novas configurações
4. **Documentar** APIs e componentes principais
5. **Implementar testes** unitários e E2E

## 📝 Notas Importantes

- O projeto agora segue uma estrutura mais limpa e organizada
- Todas as configurações de build estão habilitadas para validação
- O sistema de design está centralizado e consistente
- A manutenção ficou mais fácil com a nova organização