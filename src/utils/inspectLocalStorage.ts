/**
 * Utilitário para inspecionar dados do localStorage
 * Execute no console do navegador: window.inspectLocalStorage()
 */

export const inspectLocalStorage = () => {

  const keys = [
    'acex_positions',
    'acex_options', 
    'acex_transactions',
    'acex_users',
    'acex_brokerages',
    'acex_current_user',
    'acex_selected_brokerage',
    'acex_id_counters'
  ];

  const results = {};

  keys.forEach(key => {
    try {
      const rawData = localStorage.getItem(key);
      if (rawData) {
        const parsedData = JSON.parse(rawData);
        const actualData = parsedData.data || parsedData;
        
        results[key] = {
          exists: true,
          timestamp: parsedData.timestamp || 'N/A',
          version: parsedData.version || 'N/A',
          dataType: Array.isArray(actualData) ? 'Array' : typeof actualData,
          count: Array.isArray(actualData) ? actualData.length : 1,
          data: actualData
        };

        
        if (Array.isArray(actualData) && actualData.length > 0) {
        } else if (!Array.isArray(actualData) && actualData) {
        }
      } else {
        results[key] = {
          exists: false,
          count: 0
        };
      }
    } catch (error) {
      results[key] = {
        exists: false,
        error: error.message,
        count: 0
      };
    }
  });

  // Resumo

  const summary = {
    posições: results.acex_positions?.count || 0,
    opções: results.acex_options?.count || 0,
    transações: results.acex_transactions?.count || 0,
    usuários: results.acex_users?.count || 0,
    corretoras: results.acex_brokerages?.count || 0,
    usuárioAtual: results.acex_current_user?.exists ? 'Definido' : 'Não definido',
    corretoraAtual: results.acex_selected_brokerage?.exists ? 'Definida' : 'Não definida'
  };

  Object.entries(summary).forEach(([key, value]) => {
  });

  // Estatísticas de armazenamento
  let totalSize = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      totalSize += localStorage[key].length + key.length;
    }
  }


  return results;
};

// Disponibilizar globalmente no desenvolvimento
if (typeof window !== 'undefined') {
  (window as any).inspectLocalStorage = inspectLocalStorage;
}

export default inspectLocalStorage; 