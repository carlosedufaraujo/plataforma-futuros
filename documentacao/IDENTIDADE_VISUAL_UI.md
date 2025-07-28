# 🎨 Identidade Visual e UI - Sistema Boi Gordo

## 🌈 Visão Geral

O sistema utiliza um design moderno e profissional focado em trading de commodities, com tema escuro como padrão e suporte completo para tema claro.

## 🎯 Identidade da Marca

### Nome e Logo
- **Nome**: ACEX Capital Markets
- **Logo**: Ícone de linha de pulso/gráfico representando volatilidade do mercado
- **Posicionamento**: Plataforma profissional de trading de futuros agropecuários

## 🎨 Sistema de Cores

### Arquivo Principal: `/src/styles/globals.css`

#### Tema Escuro (Padrão)
```css
:root {
  /* Cores de Fundo */
  --bg-primary: #0f0f0f;      /* Fundo principal - preto profundo */
  --bg-secondary: #1a1a1a;    /* Fundo secundário - cinza escuro */
  --bg-tertiary: #252525;     /* Fundo terciário - cinza médio */
  --bg-hover: #2a2a2a;        /* Hover states */
  
  /* Cores de Texto */
  --text-primary: #ffffff;     /* Texto principal - branco */
  --text-secondary: #a3a3a3;   /* Texto secundário - cinza claro */
  --text-tertiary: #6b6b6b;    /* Texto terciário - cinza médio */
  
  /* Cores de Estado */
  --color-positive: #10b981;   /* Verde - lucros/compras */
  --color-negative: #ef4444;   /* Vermelho - perdas/vendas */
  --color-info: #3b82f6;       /* Azul - informações */
  --color-warning: #f59e0b;    /* Amarelo - avisos */
  
  /* Gradientes */
  --gradient-primary: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  --gradient-positive: linear-gradient(135deg, #10b981 0%, #059669 100%);
  --gradient-negative: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}
```

#### Tema Claro
```css
[data-theme="light"] {
  /* Cores de Fundo */
  --bg-primary: #ffffff;       /* Fundo principal - branco */
  --bg-secondary: #f9fafb;     /* Fundo secundário - cinza muito claro */
  --bg-tertiary: #f3f4f6;      /* Fundo terciário - cinza claro */
  --bg-hover: #e5e7eb;         /* Hover states */
  
  /* Cores de Texto */
  --text-primary: #111827;     /* Texto principal - preto */
  --text-secondary: #6b7280;   /* Texto secundário - cinza */
  --text-tertiary: #9ca3af;    /* Texto terciário - cinza claro */
  
  /* Cores mantêm mesma saturação */
  --color-positive: #10b981;
  --color-negative: #ef4444;
  --color-info: #3b82f6;
  --color-warning: #f59e0b;
}
```

## 🔤 Tipografia

### Fonte Principal
```css
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
               'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 
               'Droid Sans', 'Helvetica Neue', sans-serif;
}
```

### Hierarquia Tipográfica
```css
/* Títulos */
h1 { font-size: 2.5rem; font-weight: 700; }
h2 { font-size: 2rem; font-weight: 600; }
h3 { font-size: 1.5rem; font-weight: 600; }
h4 { font-size: 1.25rem; font-weight: 500; }

/* Corpo */
body { font-size: 16px; line-height: 1.5; }
.small { font-size: 0.875rem; }
.caption { font-size: 0.75rem; }

/* Números e valores */
.mono { font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace; }
```

## 📐 Layout e Estrutura

### Grid Principal
```css
.app-container {
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr;
  height: 100vh;
}

:root {
  --sidebar-width: 280px;  /* Largura fixa do sidebar */
}
```

### Componente Sidebar
- **Largura**: 280px (fixa)
- **Estrutura**:
  - Header com logo e nome
  - Seletor de corretora
  - Menu de navegação
  - Footer com ações (tema/logout)

### Espaçamento
```css
/* Sistema de espaçamento baseado em 8px */
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
--spacing-2xl: 3rem;     /* 48px */
```

## 🎯 Componentes UI

### Botões
```css
.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--gradient-primary);
  color: white;
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-positive {
  background: var(--gradient-positive);
  color: white;
}

.btn-negative {
  background: var(--gradient-negative);
  color: white;
}
```

### Cards
```css
.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.card-hover {
  transition: all 0.3s;
}

.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

### Badges de Status
```css
.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.badge-success {
  background: rgba(16, 185, 129, 0.1);
  color: var(--color-positive);
}

.badge-danger {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-negative);
}
```

### Tabelas
```css
.table {
  width: 100%;
  border-collapse: collapse;
}

.table th {
  background: var(--bg-tertiary);
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.875rem;
  text-transform: uppercase;
}

.table td {
  padding: 1rem 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.table tr:hover {
  background: var(--bg-hover);
}
```

## 📊 Visualização de Dados

### Gráficos (Chart.js + Recharts)
```javascript
// Tema padrão para gráficos
const chartTheme = {
  backgroundColor: 'transparent',
  titleColor: 'var(--text-primary)',
  legendColor: 'var(--text-secondary)',
  gridColor: 'var(--border-color)',
  
  // Cores para séries de dados
  colors: [
    '#3b82f6', // Azul
    '#10b981', // Verde
    '#ef4444', // Vermelho
    '#f59e0b', // Amarelo
    '#8b5cf6', // Roxo
    '#ec4899', // Rosa
  ]
};
```

### Indicadores Visuais
- **Positivo**: Verde (#10b981) com gradiente
- **Negativo**: Vermelho (#ef4444) com gradiente
- **Neutro**: Cinza (#6b7280)
- **Info**: Azul (#3b82f6)

## 🎭 Animações e Transições

### Transições Globais
```css
* {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-duration: 200ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Animações com Framer Motion
```javascript
// Fade In
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

// Slide In
const slideIn = {
  initial: { x: -20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  transition: { duration: 0.2 }
};
```

## 📱 Responsividade

### Breakpoints
```css
/* Mobile */
@media (max-width: 640px) {
  .app-container {
    grid-template-columns: 1fr;
  }
  .sidebar {
    position: fixed;
    transform: translateX(-100%);
  }
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) {
  :root {
    --sidebar-width: 240px;
  }
}

/* Desktop */
@media (min-width: 1025px) {
  :root {
    --sidebar-width: 280px;
  }
}
```

## 🧩 Componentes Customizados

### Modal System
- Backdrop com blur
- Animação de entrada/saída
- Fechamento com ESC ou clique fora
- Suporte para tamanhos variados

### Toast Notifications (react-hot-toast)
```javascript
// Configuração padrão
const toastConfig = {
  duration: 4000,
  position: 'top-right',
  style: {
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
  },
};
```

### Floating Action Button
- Posição fixa no canto inferior direito
- Menu expansível com animação
- Ações contextuais baseadas na página

## 🎯 Padrões de Interação

### Estados de Hover
- Elevação sutil (translateY)
- Mudança de cor de fundo
- Cursor pointer para elementos clicáveis

### Estados de Loading
- Skeleton screens para carregamento de dados
- Spinners animados para ações
- Indicadores de progresso para uploads

### Feedback Visual
- Confirmações com toast verde
- Erros com toast vermelho
- Avisos com toast amarelo
- Loading states inline

## 📐 Grid System

### Container
```css
.container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}
```

### Grid de Cards
```css
.grid {
  display: grid;
  gap: 1.5rem;
}

.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
```

## 🔧 Utilities Classes

### Flexbox
```css
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.gap-4 { gap: 1rem; }
```

### Spacing
```css
.p-4 { padding: 1rem; }
.m-4 { margin: 1rem; }
.mt-4 { margin-top: 1rem; }
.space-y-4 > * + * { margin-top: 1rem; }
```

### Text
```css
.text-center { text-align: center; }
.font-bold { font-weight: 700; }
.text-sm { font-size: 0.875rem; }
.text-positive { color: var(--color-positive); }
.text-negative { color: var(--color-negative); }
```

---

📅 **Atualizado em**: 27 de Julho de 2025  
🎨 **Design System**: v1.0.0