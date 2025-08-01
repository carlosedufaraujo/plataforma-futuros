'use client';

import React from 'react';

interface Column {
  key: string;
  header: string;
  render?: (value: any, row: any) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps {
  columns?: Column[];
  headers?: string[]; // Compatibilidade com código antigo
  data: any[];
  loading?: boolean;
  emptyMessage?: string;
  onSort?: (key: string) => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  className?: string;
}

export default function DataTable({ 
  columns = [], 
  headers, // Compatibilidade com código antigo
  data = [], 
  loading = false, 
  emptyMessage = "Nenhum dado encontrado",
  onSort,
  sortKey,
  sortDirection,
  className = ""
}: DataTableProps) {
  
  // Converter headers para columns se necessário (compatibilidade)
  let tableColumns = columns;
  if ((!columns || columns.length === 0) && headers && headers.length > 0) {
    tableColumns = headers.map((header, index) => ({
      key: index.toString(),
      header: header,
      sortable: false
    }));
  }
  
  // Verificação de segurança
  if (!tableColumns || !Array.isArray(tableColumns) || tableColumns.length === 0) {
    console.error('DataTable: propriedade columns ou headers é obrigatória');
    return (
      <div className="error-state" style={{ padding: '20px', textAlign: 'center', color: 'var(--color-error)' }}>
        ⚠️ Erro: Configuração de colunas ausente
      </div>
    );
  }
  
  const handleHeaderClick = (column: Column) => {
    if (column.sortable && onSort) {
      onSort(column.key);
    }
  };

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '200px' }}>
        <div className="loading-spinner"></div>
        <div className="loading-text">Carregando dados...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="empty-state" style={{ minHeight: '200px' }}>
        <div className="empty-icon">📊</div>
        <div className="empty-title">Nenhum dado encontrado</div>
        <div className="empty-description">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className={`table-container ${className}`}>
      <table className="data-table">
        <thead>
          <tr>
            {tableColumns.map((column) => (
              <th 
                key={column.key}
                className={`
                  ${column.className || ''} 
                  ${column.sortable ? 'sortable' : ''} 
                  ${sortKey === column.key ? 'sorted' : ''}
                `}
                onClick={() => handleHeaderClick(column)}
              >
                <div className="th-content">
                  <span>{column.header}</span>
                  {column.sortable && (
                    <div className="sort-icon">
                      {sortKey === column.key ? (
                        sortDirection === 'asc' ? '↑' : '↓'
                      ) : (
                        '↕'
                      )}
                    </div>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={row.id || index}>
              {headers && headers.length > 0 ? (
                // Modo compatibilidade: renderizar diretamente os valores do array
                row.map((cell: any, cellIndex: number) => (
                  <td key={cellIndex}>
                    {cell || '-'}
                  </td>
                ))
              ) : (
                // Modo novo: usar columns com render customizado
                tableColumns.map((column) => (
                  <td key={column.key} className={column.className || ''}>
                    {column.render 
                      ? column.render(row[column.key], row)
                      : row[column.key] || '-'
                    }
                  </td>
                ))
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}