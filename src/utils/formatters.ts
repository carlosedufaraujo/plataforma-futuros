/**
 * Utilitários de formatação para números, moeda e percentuais
 */

/**
 * Formatar valor como moeda brasileira (R$)
 */
export function formatCurrency(value: number): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'R$ 0,00';
  }
  
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Formatar valor como percentual (espera valor já em %)
 * Ex: 15.5 → "15,50%"
 */
export function formatPercentage(value: number): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0,00%';
  }
  
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + '%';
}

/**
 * Formatar valor decimal como percentual (0.155 → "15,50%")
 */
export function formatDecimalAsPercentage(value: number): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0,00%';
  }
  
  return (value * 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + '%';
}

/**
 * Formatar número simples com separadores
 */
export function formatNumber(value: number, decimals: number = 2): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Formatar valor compacto (1K, 1M, etc.)
 */
export function formatCompactNumber(value: number): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  
  if (Math.abs(value) >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M';
  } else if (Math.abs(value) >= 1000) {
    return (value / 1000).toFixed(1) + 'K';
  } else {
    return value.toFixed(0);
  }
}

/**
 * Formatar valor com sinal (+/-)
 */
export function formatSignedCurrency(value: number): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'R$ 0,00';
  }
  
  const formatted = formatCurrency(Math.abs(value));
  return value >= 0 ? `+${formatted}` : `-${formatted}`;
}

/**
 * Formatar percentual com sinal (+/-)
 */
export function formatSignedPercentage(value: number): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0,00%';
  }
  
  const formatted = formatPercentage(Math.abs(value));
  return value >= 0 ? `+${formatted}` : `-${formatted}`;
} 