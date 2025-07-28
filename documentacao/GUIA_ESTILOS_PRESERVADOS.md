# 🎨 Guia de Estilos Preservados - Sistema Boi Gordo

## ⚠️ IMPORTANTE: Este documento deve ser seguido rigorosamente para manter a identidade visual existente

## 🎯 Princípios Fundamentais

### 1. Nunca Alterar
- Cores definidas em CSS variables
- Tamanhos de fonte e hierarquia
- Espaçamentos e paddings
- Animações e tempos de transição
- Bordas e sombras
- Largura do sidebar (280px)

### 2. Sempre Manter
- Font family: Inter
- Border radius: 8px (padrão), 10px (cards especiais)
- Transition timing: 0.2s ease (padrão), 0.3s ease (hover complexo)
- Box shadows específicas
- Gradientes definidos

## 🎨 Paleta de Cores Exata

### Tema Dark (Padrão)
```css
/* NUNCA ALTERAR ESTES VALORES */
:root {
  /* Backgrounds */
  --bg-primary: #0f0f0f;      /* Fundo principal - preto profundo */
  --bg-secondary: #1a1a1a;    /* Fundo de cards e elementos */
  --bg-tertiary: #252525;     /* Fundo de seções terciárias */
  --bg-hover: #2a2a2a;        /* Estado hover */
  
  /* Textos */
  --text-primary: #ffffff;     /* Texto principal */
  --text-secondary: #a3a3a3;   /* Texto secundário */
  --text-tertiary: #6b6b6b;    /* Texto terciário */
  --text-bright: #ffffff;      /* Texto brilhante/destacado */
  
  /* Estados e Feedback */
  --color-positive: #10b981;   /* Verde - lucros/sucesso */
  --color-negative: #ef4444;   /* Vermelho - perdas/erro */
  --color-info: #3b82f6;       /* Azul - informação/ativo */
  --color-warning: #f59e0b;    /* Amarelo - avisos */
  
  /* Bordas */
  --border-color: rgba(255, 255, 255, 0.1);
  
  /* Gradientes Exatos */
  --gradient-primary: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  --gradient-positive: linear-gradient(135deg, #10b981 0%, #059669 100%);
  --gradient-negative: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}
```

## 📐 Layout e Estrutura

### Sidebar
```css
/* PRESERVAR EXATAMENTE */
.sidebar {
  width: var(--sidebar-width); /* 280px - NUNCA MUDAR */
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  z-index: 100;
}

/* Animação do menu ativo */
.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px; /* Barra lateral de 3px */
  background: var(--color-info);
}
```

### Container Principal
```css
.main-content {
  margin-left: var(--sidebar-width); /* 280px */
  padding: 24px; /* Padding fixo */
  max-width: calc(100vw - var(--sidebar-width));
}
```

## 🎭 Animações e Transições

### Transições Padrão
```css
/* USAR SEMPRE ESTES VALORES */
.elemento {
  transition: all 0.2s ease; /* Transição padrão */
}

/* Para hovers mais elaborados */
.elemento-complexo {
  transition: all 0.3s ease;
}

/* Para mudanças de tema */
* {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-duration: 200ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Efeitos de Hover
```css
/* Elevação padrão */
.btn:hover,
.card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Hover mais pronunciado */
.card-importante:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

/* Rotação para ícones */
.chevron:hover {
  transform: rotate(180deg);
}
```

## 🔲 Componentes Essenciais

### Botões
```css
/* Botão Base - PRESERVAR */
.btn {
  padding: 10px 16px; /* Padding específico */
  border-radius: 8px; /* Radius padrão */
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  gap: 8px; /* Espaço entre ícone e texto */
}

/* Estados do botão */
.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(100, 200, 255, 0.3);
}
```

### Cards
```css
/* Card padrão */
.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px; /* Radius maior para cards */
  padding: 24px;
  transition: all 0.3s ease;
}

/* Sombras específicas */
.card {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

### Modais
```css
/* Overlay com blur */
.modal-overlay {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease;
}

/* Modal container */
.modal {
  background: var(--bg-secondary);
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.3s ease;
}

/* Animações do modal */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Tabelas
```css
/* Header da tabela */
.table th {
  background: var(--bg-tertiary);
  padding: 12px 16px; /* Padding específico */
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
}

/* Linhas da tabela */
.table td {
  padding: 16px; /* Padding maior que o header */
  border-bottom: 1px solid var(--border-color);
}

/* Hover na linha */
.table tr:hover td {
  background: var(--bg-hover);
}
```

## 📊 Elementos de Dados

### Valores Positivos/Negativos
```css
/* Texto positivo */
.text-positive {
  color: var(--color-positive);
  font-weight: 600;
}

/* Texto negativo */
.text-negative {
  color: var(--color-negative);
  font-weight: 600;
}

/* Badges com gradiente */
.badge-positive {
  background: var(--gradient-positive);
  color: white;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}
```

### Gráficos e Visualizações
```javascript
// Configuração padrão para Chart.js
const defaultChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: 'var(--text-secondary)',
        font: {
          family: 'Inter',
          size: 12,
          weight: '500'
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        color: 'var(--border-color)',
        borderColor: 'var(--border-color)'
      },
      ticks: {
        color: 'var(--text-secondary)',
        font: {
          family: 'Inter',
          size: 11
        }
      }
    },
    y: {
      grid: {
        color: 'var(--border-color)',
        borderColor: 'var(--border-color)'
      },
      ticks: {
        color: 'var(--text-secondary)',
        font: {
          family: 'Inter',
          size: 11
        }
      }
    }
  }
};
```

## 🎯 Padrões de Interação

### Focus States
```css
/* Focus padrão */
input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: var(--color-info);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}
```

### Loading States
```css
/* Spinner de loading */
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color);
  border-top-color: var(--color-info);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### Skeleton Loading
```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-tertiary) 25%,
    var(--bg-hover) 50%,
    var(--bg-tertiary) 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

## 📱 Breakpoints e Responsividade

### Media Queries Padrão
```css
/* Mobile - até 640px */
@media (max-width: 640px) {
  .sidebar {
    transform: translateX(-100%);
  }
  .main-content {
    margin-left: 0;
    padding: 16px;
  }
}

/* Tablet - 641px até 1024px */
@media (min-width: 641px) and (max-width: 1024px) {
  /* Ajustes específicos para tablet */
}

/* Desktop - acima de 1025px */
@media (min-width: 1025px) {
  /* Layout desktop padrão */
}
```

## 🚨 Checklist de Validação

Antes de criar ou modificar qualquer componente, verifique:

- [ ] Está usando as cores exatas das CSS variables?
- [ ] Manteve os border-radius corretos (8px padrão, 12px para cards)?
- [ ] Aplicou transition: all 0.2s ease?
- [ ] Preservou os paddings e margens existentes?
- [ ] Manteve a fonte Inter?
- [ ] Respeitou a hierarquia tipográfica?
- [ ] Aplicou os efeitos de hover corretos?
- [ ] Manteve as sombras específicas?
- [ ] Preservou as animações existentes?
- [ ] Testou em tema dark e light?

## 🔴 NUNCA FAZER

1. **NUNCA** alterar valores de cores direto no CSS
2. **NUNCA** mudar a largura do sidebar (280px)
3. **NUNCA** alterar os tempos de transição padrão
4. **NUNCA** modificar os tamanhos de fonte base
5. **NUNCA** remover animações existentes
6. **NUNCA** alterar os gradientes definidos
7. **NUNCA** mudar a família de fontes de Inter
8. **NUNCA** modificar os valores de box-shadow
9. **NUNCA** alterar os border-radius padrão
10. **NUNCA** remover os efeitos de hover

## ✅ SEMPRE FAZER

1. **SEMPRE** usar as variáveis CSS existentes
2. **SEMPRE** manter consistência nos espaçamentos
3. **SEMPRE** aplicar transições suaves
4. **SEMPRE** testar em ambos os temas
5. **SEMPRE** preservar as animações
6. **SEMPRE** manter a hierarquia visual
7. **SEMPRE** seguir os padrões de hover
8. **SEMPRE** usar os componentes base existentes
9. **SEMPRE** validar com o checklist
10. **SEMPRE** documentar qualquer exceção necessária

---

📅 **Criado em**: 27 de Julho de 2025  
⚠️ **Status**: DOCUMENTO CRÍTICO - NÃO MODIFICAR SEM APROVAÇÃO