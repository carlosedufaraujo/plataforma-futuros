'use client';

import { useMemo } from 'react';
import { useData } from '@/contexts/DataProvider';
import { Position, Transaction } from '@/types';

export interface NetPosition {
  contract: string;
  product: string;
  buyQuantity: number;
  sellQuantity: number;
  netQuantity: number; // Mantém sinal negativo para VENDA
  netDirection: 'COMPRA' | 'VENDA' | 'NEUTRO';
  positions: Position[];
  weightedEntryPrice: number;
  currentPrice: number;
  totalValue: number;
  unrealizedPnL: number;
  exposure: number;
  accumulatedPnL?: number; // P&L acumulado de operações parciais (modelo correto)
}

export const useNetPositions = (filteredTransactions?: Transaction[]) => {
  const { positions, transactions, calculateNetPosition, getAllNetPositions, isPositionNeutralized } = useData();
  
  // Usar transações filtradas se fornecidas, senão usar todas
  const transactionsToUse = filteredTransactions || transactions;

  // ✅ MODELO CORRETO: Calcular posições líquidas seguindo especificações de commodities
  const netPositions = useMemo((): NetPosition[] => {
    
    // Incluir TODAS as posições (EXECUTADA, EM_ABERTO, FECHADA) para cálculo NET
    const allPositions = positions.filter(p => 
      p.status === 'EXECUTADA' || p.status === 'EM_ABERTO' || p.status === 'FECHADA'
    );
    const contracts = [...new Set(allPositions.map(p => p.contract))];
    
    
    return contracts.map(contract => {
      const contractPositions = allPositions.filter(p => p.contract === contract);
      
      
      // Verificar se há transações para este contrato para usar cálculo correto
      const contractTransactions = transactionsToUse.filter(t => t.contract === contract);
      
      if (contractTransactions.length > 0) {
        
        // Usar a mesma lógica do recalculatePosition para consistência
        const sortedTransactions = [...contractTransactions].sort((a, b) => 
          new Date(a.createdAt || a.date).getTime() - new Date(b.createdAt || b.date).getTime()
        );
        
        // Estado da posição seguindo o modelo
        let posicaoAtual = 0;
        let precoMedioAtual = 0;
        let pnlAcumulado = 0;
        
        sortedTransactions.forEach((transacao) => {
          const isBoiGordo = transacao.contract.startsWith('BGI');
          const especificacao = isBoiGordo ? 330 : 450;
          const qtdOperacao = transacao.type === 'COMPRA' ? transacao.quantity : -transacao.quantity;
          const precoOperacao = transacao.price;
          
          if (posicaoAtual === 0) {
            // ABERTURA
            posicaoAtual = qtdOperacao;
            precoMedioAtual = precoOperacao;
          } else if ((posicaoAtual > 0 && qtdOperacao > 0) || (posicaoAtual < 0 && qtdOperacao < 0)) {
            // REFORÇO - Recalcular PM ponderado
            const valorAtual = Math.abs(posicaoAtual) * precoMedioAtual;
            const valorNovo = Math.abs(qtdOperacao) * precoOperacao;
            const novaQuantidade = Math.abs(posicaoAtual + qtdOperacao);
            precoMedioAtual = novaQuantidade > 0 ? (valorAtual + valorNovo) / novaQuantidade : 0;
            posicaoAtual += qtdOperacao;
          } else if (Math.abs(qtdOperacao) <= Math.abs(posicaoAtual)) {
            // REDUÇÃO - PM permanece, calcular P&L parcial
            const qtdReduzida = Math.abs(qtdOperacao);
            const pnlParcial = qtdReduzida * especificacao * (
              posicaoAtual > 0 ? 
                (precoOperacao - precoMedioAtual) :
                (precoMedioAtual - precoOperacao)
            );
            pnlAcumulado += pnlParcial;
            posicaoAtual += qtdOperacao;
            // PM permanece o mesmo
          } else {
            // INVERSÃO - Fechar posição atual e abrir nova
            const qtdFechamento = Math.abs(posicaoAtual);
            const pnlFechamento = qtdFechamento * especificacao * (
              posicaoAtual > 0 ? 
                (precoOperacao - precoMedioAtual) :
                (precoMedioAtual - precoOperacao)
            );
            pnlAcumulado += pnlFechamento;
            posicaoAtual = qtdOperacao + posicaoAtual; // Quantidade restante
            precoMedioAtual = precoOperacao; // Novo PM
          }
        });
        
        const netQuantity = posicaoAtual;
        const netDirection = netQuantity > 0 ? 'COMPRA' : netQuantity < 0 ? 'VENDA' : 'NEUTRO';
        
        
        // FILTRAR POSIÇÕES NEUTRALIZADAS para aba Gestão
        if (netQuantity === 0) {
          return null;
        }
        
        // Calcular P&L não realizado e exposição
        const contractSize = contract.startsWith('BGI') ? 330 : 450;
        const currentPrice = contractPositions.find(p => p.current_price)?.current_price || precoMedioAtual;
        const priceDiff = currentPrice - precoMedioAtual;
        
        let unrealizedPnL = 0;
        if (netDirection === 'COMPRA') {
          unrealizedPnL = priceDiff * Math.abs(netQuantity) * contractSize;
        } else if (netDirection === 'VENDA') {
          unrealizedPnL = -priceDiff * Math.abs(netQuantity) * contractSize;
        }
        
        const exposure = precoMedioAtual * Math.abs(netQuantity) * contractSize;
        
        
        return {
          contract,
          product: contract.startsWith('BGI') ? 'Boi Gordo' : 'Milho',
          buyQuantity: netQuantity > 0 ? Math.abs(netQuantity) : 0,
          sellQuantity: netQuantity < 0 ? Math.abs(netQuantity) : 0,
          netQuantity,
          netDirection,
          positions: contractPositions,
          weightedEntryPrice: precoMedioAtual,
          currentPrice,
          totalValue: exposure,
          unrealizedPnL,
          exposure,
          accumulatedPnL: pnlAcumulado
        };
        
      } else {
        // Fallback: usar cálculo baseado em posições (método anterior)
        
        let symbolSum = 0;
        let buyTotal = 0;
        let sellTotal = 0;
        let buyQuantity = 0;
        let sellQuantity = 0;
        
        contractPositions.forEach(pos => {
          const symbolQuantity = pos.direction === 'COMPRA' ? +pos.quantity : -pos.quantity;
          symbolSum += symbolQuantity;
          
          if (pos.direction === 'COMPRA') {
            buyQuantity += pos.quantity;
            buyTotal += pos.quantity * pos.entry_price;
          } else {
            sellQuantity += pos.quantity;
            sellTotal += pos.quantity * pos.entry_price;
          }
          
        });
        
        const netQuantity = symbolSum;
        const netDirection = netQuantity > 0 ? 'COMPRA' : netQuantity < 0 ? 'VENDA' : 'NEUTRO';
        
        
        if (netQuantity === 0) {
          return null;
        }
        
        const totalValue = buyTotal + sellTotal;
        const totalQuantity = buyQuantity + sellQuantity;
        const weightedEntryPrice = totalQuantity > 0 ? totalValue / totalQuantity : 0;
        const currentPrice = contractPositions.find(p => p.current_price)?.current_price || weightedEntryPrice;
        const contractSize = contract.startsWith('BGI') ? 330 : 450;
        const priceDiff = currentPrice - weightedEntryPrice;
        
        let unrealizedPnL = 0;
        if (netDirection === 'COMPRA') {
          unrealizedPnL = priceDiff * Math.abs(netQuantity) * contractSize;
        } else if (netDirection === 'VENDA') {
          unrealizedPnL = -priceDiff * Math.abs(netQuantity) * contractSize;
        }
        
        const exposure = weightedEntryPrice * Math.abs(netQuantity) * contractSize;
        
        return {
          contract,
          product: contract.startsWith('BGI') ? 'Boi Gordo' : 'Milho',
          buyQuantity,
          sellQuantity,
          netQuantity,
          netDirection,
          positions: contractPositions,
          weightedEntryPrice,
          currentPrice,
          totalValue,
          unrealizedPnL,
          exposure,
          accumulatedPnL: 0
        };
      }
    }).filter(net => net !== null && net.netQuantity !== 0);
  }, [positions, transactionsToUse]);

  // ❌ REMOVIDO: allPositionsIncludingClosed 
  // ✅ CORREÇÃO: Agora usamos apenas getNeutralizedPositionsForPerformance para Performance

  // Estatísticas gerais
  const netStats = useMemo(() => {
    const totalUnrealizedPnL = netPositions.reduce((sum, net) => sum + net.unrealizedPnL, 0);
    const totalExposure = netPositions.reduce((sum, net) => sum + net.exposure, 0);
    const buyPositions = netPositions.filter(net => net.netDirection === 'COMPRA').length;
    const sellPositions = netPositions.filter(net => net.netDirection === 'VENDA').length;
    const neutralPositions = positions.filter(p => p.status === 'OPEN').length - 
                           netPositions.reduce((sum, net) => sum + net.positions.length, 0);

    return {
      totalUnrealizedPnL,
      totalExposure,
      buyPositions,
      sellPositions,
      neutralPositions,
      totalNetPositions: netPositions.length
    };
  }, [netPositions, positions]);

  // Função para obter posição líquida de um contrato específico
  const getNetPositionByContract = (contract: string): NetPosition | null => {
    return netPositions.find(net => net.contract === contract) || null;
  };

  // Função para verificar se uma posição individual está neutralizada
  const checkPositionNeutralization = (positionId: string): boolean => {
    return isPositionNeutralized(positionId);
  };

  // Função para formatar quantidade com sinal matemático direto
  const formatNetQuantity = (netQuantity: number): string => {
    if (netQuantity === 0) return '±0';
    return `${netQuantity}`; // O sinal matemático na quantidade já indica a direção
  };

  // Função para formatar transação com símbolos (matematicamente correto)
  const formatTransactionSymbol = (type: string, quantity: number): string => {
    return type === 'COMPRA' ? `${quantity}` : `-${quantity}`;
  };

  // Função para aplicar jogo de símbolos em array de transações (matematicamente correto)
  const applySymbolCalculation = (transactions: any[]): string => {
    let calculation = '';
    let total = 0;
    
    transactions.forEach((t, index) => {
      const symbolQuantity = t.type === 'COMPRA' ? +t.quantity : -t.quantity;
      total += symbolQuantity;
      
      if (index > 0) calculation += ' ';
      calculation += `${symbolQuantity}`;
    });
    
    calculation += ` = ${total}`;
    return calculation;
  };

  // Função para obter cor baseada na direção
  const getDirectionColor = (netDirection: string): string => {
    switch (netDirection) {
      case 'COMPRA': return 'var(--color-success)';
      case 'VENDA': return 'var(--color-danger)';
      case 'NEUTRO': return 'var(--color-secondary)';
      default: return 'var(--text-primary)';
    }
  };

  // 🚀 NOVA FUNÇÃO: Detectar P&L realizado (reduções parciais + fechamentos)
  const getRealizedPnL = useMemo(() => {
    
    const realizedPnLEntries: any[] = [];
    const contracts = [...new Set(transactionsToUse.map(t => t.contract))];
    
    contracts.forEach(contract => {
      
      const contractTransactions = transactionsToUse
        .filter(t => t.contract === contract)
        .sort((a, b) => {
          const dateA = new Date(a.date || a.createdAt || '');
          const dateB = new Date(b.date || b.createdAt || '');
          return dateA.getTime() - dateB.getTime();
        });
      
      if (contractTransactions.length < 2) {
        return;
      }
      
      // Processar transações cronologicamente
      let saldoCorrente = 0;
      let precoMedioEntrada = 0;
      let pnlRealizado = 0;
      let operacoesRealizadas = [];
      const contractSize = contract.startsWith('BGI') ? 330 : 450;
      
      contractTransactions.forEach((transaction, index) => {
        const quantidade = transaction.quantity;
        const preco = transaction.price;
        const tipo = transaction.type;
        
        
        // Detectar operações que geram P&L realizado
        if (tipo === 'COMPRA') {
          if (saldoCorrente < 0) {
            // Redução de posição SHORT (gera P&L)
            const quantidadeReduzida = Math.min(quantidade, Math.abs(saldoCorrente));
            const pnlOperacao = quantidadeReduzida * (precoMedioEntrada - preco) * contractSize;
            
            if (quantidadeReduzida > 0) {
              pnlRealizado += pnlOperacao;
              operacoesRealizadas.push({
                tipo: 'REDUÇÃO SHORT',
                quantidade: quantidadeReduzida,
                precoEntrada: precoMedioEntrada,
                precoSaida: preco,
                pnl: pnlOperacao,
                data: transaction.date || transaction.createdAt
              });
              
            }
          }
          
          // Atualizar saldo
          if (saldoCorrente <= 0) {
            precoMedioEntrada = preco;
          } else {
            precoMedioEntrada = ((saldoCorrente * precoMedioEntrada) + (quantidade * preco)) / (saldoCorrente + quantidade);
          }
          saldoCorrente += quantidade;
          
        } else if (tipo === 'VENDA') {
          if (saldoCorrente > 0) {
            // Redução de posição LONG (gera P&L)
            const quantidadeReduzida = Math.min(quantidade, saldoCorrente);
            const pnlOperacao = quantidadeReduzida * (preco - precoMedioEntrada) * contractSize;
            
            if (quantidadeReduzida > 0) {
              pnlRealizado += pnlOperacao;
              operacoesRealizadas.push({
                tipo: 'REDUÇÃO LONG',
                quantidade: quantidadeReduzida,
                precoEntrada: precoMedioEntrada,
                precoSaida: preco,
                pnl: pnlOperacao,
                data: transaction.date || transaction.createdAt
              });
              
            }
          }
          
          // Atualizar saldo
          if (saldoCorrente >= 0) {
            precoMedioEntrada = preco;
          } else {
            precoMedioEntrada = ((Math.abs(saldoCorrente) * precoMedioEntrada) + (quantidade * preco)) / (Math.abs(saldoCorrente) + quantidade);
          }
          saldoCorrente -= quantidade;
        }
        
        // Detectar fechamento completo
        if (saldoCorrente === 0 && operacoesRealizadas.length > 0) {
        }
      });
      
      // Adicionar entrada se houve P&L realizado
      if (pnlRealizado !== 0) {
        const ultimaOperacao = operacoesRealizadas[operacoesRealizadas.length - 1];
        const status = saldoCorrente === 0 ? 'FECHADA' : 'REDUÇÃO PARCIAL';
        
        realizedPnLEntries.push({
          contract,
          product: contract.startsWith('BGI') ? 'Boi Gordo' : 'Milho',
          pnl: pnlRealizado, // ✅ CORRIGIDO: Usar o P&L total acumulado
          status,
          operacoesRealizadas,
          quantidadeLiquidada: operacoesRealizadas.reduce((sum, op) => sum + op.quantidade, 0),
          ultimaOperacao: ultimaOperacao?.data,
          saldoAtual: saldoCorrente
        });
        
      }
    });
    
    return realizedPnLEntries;
  }, [transactionsToUse]);

  // 🚀 NOVA FUNÇÃO: Detectar neutralizações históricas cronológicas
  const getNeutralizedPositionsForPerformance = useMemo(() => {
    
    const neutralizedContracts: any[] = [];
    const contracts = [...new Set(transactionsToUse.map(t => t.contract))];
    
    
    contracts.forEach(contract => {
      
      const contractTransactions = transactionsToUse.filter(t => t.contract === contract);
      
      if (contractTransactions.length < 2) {
        return;
      }
      
      // 🚨 LOG ESPECÍFICO PARA BGIN (removido para produção)
      
      // Ordenar transações cronologicamente
      const sortedTransactions = contractTransactions.sort((a, b) => {
        const dateA = new Date(a.date || a.createdAt || '');
        const dateB = new Date(b.date || b.createdAt || '');  
        return dateA.getTime() - dateB.getTime();
      });
      
      
      // 🔥 NOVA LÓGICA: Detectar neutralizações históricas
      let saldoCorrente = 0;
      let precoMedioEntrada = 0;
      let pnlAcumulado = 0;
      let neutralizacoesDetectadas = [];
      let transacoesParaNeutralizacao = [];
      let valorComprasNeutralizacao = 0;
      let valorVendasNeutralizacao = 0;
      let quantidadeComprasNeutralizacao = 0;
      let quantidadeVendasNeutralizacao = 0;
      
      const contractSize = contract.startsWith('BGI') ? 330 : 450;
      
      sortedTransactions.forEach((transaction, index) => {
        const quantidade = transaction.quantity;
        const preco = transaction.price;
        const valorTransacao = quantidade * preco * contractSize;
        
        
        // Acumular dados para neutralização
        if (transaction.type === 'COMPRA') {
          valorComprasNeutralizacao += valorTransacao;
          quantidadeComprasNeutralizacao += quantidade;
        } else {
          valorVendasNeutralizacao += valorTransacao;
          quantidadeVendasNeutralizacao += quantidade;
        }
        
        // Processar transação com lógica correta
        if (transaction.type === 'COMPRA') {
          if (saldoCorrente >= 0) {
            // ABERTURA ou REFORÇO LONG
            const novaQuantidadeTotal = saldoCorrente + quantidade;
            if (saldoCorrente > 0) {
              precoMedioEntrada = ((saldoCorrente * precoMedioEntrada) + (quantidade * preco)) / novaQuantidadeTotal;
            } else {
              precoMedioEntrada = preco;
            }
            saldoCorrente = novaQuantidadeTotal;
          } else {
            // REDUÇÃO SHORT ou INVERSÃO
            const quantidadeReduzida = Math.min(quantidade, Math.abs(saldoCorrente));
            const pnlOperacao = quantidadeReduzida * (precoMedioEntrada - preco) * contractSize;
            pnlAcumulado += pnlOperacao;
            
            saldoCorrente += quantidade;
            
            if (saldoCorrente > 0) {
              precoMedioEntrada = preco;
            }
          }
        } else {
          if (saldoCorrente <= 0) {
            // ABERTURA ou REFORÇO SHORT
            const novaQuantidadeTotal = saldoCorrente - quantidade;
            if (saldoCorrente < 0) {
              precoMedioEntrada = ((Math.abs(saldoCorrente) * precoMedioEntrada) + (quantidade * preco)) / Math.abs(novaQuantidadeTotal);
            } else {
              precoMedioEntrada = preco;
            }
            saldoCorrente = novaQuantidadeTotal;
          } else {
            // REDUÇÃO LONG ou INVERSÃO
            const quantidadeReduzida = Math.min(quantidade, saldoCorrente);
            const pnlOperacao = quantidadeReduzida * (preco - precoMedioEntrada) * contractSize;
            pnlAcumulado += pnlOperacao;
            
            saldoCorrente -= quantidade;
            
            if (saldoCorrente < 0) {
              precoMedioEntrada = preco;
            }
          }
        }
        
        transacoesParaNeutralizacao.push({
          tipo: transaction.type,
          quantidade,
          preco,
          valor: valorTransacao,
          data: transaction.date || transaction.createdAt,
          saldoApos: saldoCorrente
        });
        
        
        // 🎯 DETECTAR NEUTRALIZAÇÃO HISTÓRICA (TODAS as vezes que chega a zero)
        if (saldoCorrente === 0) {
          const neutralizacao = {
            dataUltimaNeutralizacao: transaction.date || transaction.createdAt,
            pnlNeutralizacao: pnlAcumulado,
            valorCompras: valorComprasNeutralizacao,
            valorVendas: valorVendasNeutralizacao,
            quantidadeCompras: quantidadeComprasNeutralizacao,
            quantidadeVendas: quantidadeVendasNeutralizacao,
            transacoesProcessadas: [...transacoesParaNeutralizacao],
            indexNeutralizacao: index + 1
          };
          
          neutralizacoesDetectadas.push(neutralizacao);
          
          
          // 🚨 LOG ESPECÍFICO BGIN
          if (contract.includes('BGIN')) {
          }
        }
      });
      
      // Se detectou neutralização histórica, adicionar à Performance
      if (neutralizacoesDetectadas.length > 0) {
        const neutralizacao = neutralizacoesDetectadas[neutralizacoesDetectadas.length - 1]; // ÚLTIMA neutralização (mais recente)
        
         
         const neutralizedPosition = {
           contract: contract,
           product: contract.startsWith('BGI') ? 'Boi Gordo' : 'Milho',
           netQuantity: Math.min(neutralizacao.quantidadeCompras, neutralizacao.quantidadeVendas), // Quantidade netada (liquidada)
           direction: 'FECHADA',
           pnl: neutralizacao.pnlNeutralizacao,
           exposure: 0, // Exposição é 0 para posições fechadas
           roi: neutralizacao.valorCompras > 0 ? (neutralizacao.pnlNeutralizacao / neutralizacao.valorCompras) * 100 : 0,
           status: 'FECHADA',
           commodity: contract.startsWith('BGI') ? 'BOI GORDO' : 'MILHO',
           lastTransactionDate: neutralizacao.dataUltimaNeutralizacao,
           valorTotalCompras: neutralizacao.valorCompras,
           valorTotalVendas: neutralizacao.valorVendas,
           quantidadeCompras: neutralizacao.quantidadeCompras,
           quantidadeVendas: neutralizacao.quantidadeVendas,
           transacoesProcessadas: neutralizacao.transacoesProcessadas,
           saldoFinalAposNeutralizacao: saldoCorrente // Para debug
         };
         
         neutralizedContracts.push(neutralizedPosition);
         
         // 🚨 LOG ESPECÍFICO BGIN
         if (contract.includes('BGIN')) {
         }
       } else {
       }
     });
    
    if (neutralizedContracts.length > 0) {
    }
    
    // 🚨 LOG ESPECÍFICO BGIN
    const bginNeutralizadas = neutralizedContracts.filter(c => c.contract.includes('BGIN'));
    
    return neutralizedContracts;
  }, [transactionsToUse, positions]);

  // 🎯 NOVA FUNÇÃO: Detectar P&L parciais já realizados para aba Performance
  const getPartialPnLForPerformance = useMemo(() => {
    
    const partialPnLEntries: any[] = [];
    const contracts = [...new Set(transactionsToUse.map(t => t.contract))];
    
    
          contracts.forEach(contract => {
        const contractTransactions = transactionsToUse.filter(t => t.contract === contract);
        
        // 🚨 LOG ESPECÍFICO PARA BGIN - removido
        
        if (contractTransactions.length < 2) {
          if (contract.includes('BGIN')) {
          }
          return;
        }
        
        
        // 🚨 DEBUG: Removido para produção
      
      // Usar mesma lógica do recalculatePosition para detectar P&L parciais
      const sortedTransactions = [...contractTransactions].sort((a, b) => 
        new Date(a.createdAt || a.date).getTime() - new Date(b.createdAt || b.date).getTime()
      );
      
      let posicaoAtual = 0;
      let precoMedioAtual = 0;
      let pnlAcumuladoParcial = 0;
      let operacoesParciais: any[] = [];
      
      sortedTransactions.forEach((transacao, index) => {
        const isBoiGordo = transacao.contract.startsWith('BGI');
        const especificacao = isBoiGordo ? 330 : 450;
        const unidade = isBoiGordo ? '@' : 'sc';
        const qtdOperacao = transacao.type === 'COMPRA' ? transacao.quantity : -transacao.quantity;
        const precoOperacao = transacao.price;
        
        
        if (posicaoAtual === 0) {
          // ABERTURA DE POSIÇÃO
          posicaoAtual = qtdOperacao;
          precoMedioAtual = precoOperacao;
          
        } else if ((posicaoAtual > 0 && qtdOperacao > 0) || (posicaoAtual < 0 && qtdOperacao < 0)) {
          // REFORÇO DE POSIÇÃO
          const valorAtual = Math.abs(posicaoAtual) * precoMedioAtual;
          const valorNovo = Math.abs(qtdOperacao) * precoOperacao;
          const novaQuantidade = Math.abs(posicaoAtual + qtdOperacao);
          precoMedioAtual = novaQuantidade > 0 ? (valorAtual + valorNovo) / novaQuantidade : 0;
          posicaoAtual += qtdOperacao;
          
        } else if (Math.abs(qtdOperacao) <= Math.abs(posicaoAtual)) {
          // REDUÇÃO DE POSIÇÃO - GERA P&L PARCIAL!
          
          const qtdReduzida = Math.abs(qtdOperacao);
          const pnlParcial = qtdReduzida * especificacao * (
            posicaoAtual > 0 ? 
              (precoOperacao - precoMedioAtual) :  // Posição LONG vendendo
              (precoMedioAtual - precoOperacao)    // Posição SHORT comprando
          );
          
          
          pnlAcumuladoParcial += pnlParcial;
          posicaoAtual += qtdOperacao;
          
          // 🎯 REGISTRAR OPERAÇÃO PARCIAL para Performance
          operacoesParciais.push({
            data: new Date(transacao.createdAt || transacao.date),
            tipo: 'REDUÇÃO PARCIAL',
            contratos: qtdReduzida,
            precoEntrada: precoMedioAtual,
            precoSaida: precoOperacao,
            pnlParcial: pnlParcial,
            diferenca: Math.abs(precoOperacao - precoMedioAtual),
            transacao: transacao
          });
          
          
        } else {
          // INVERSÃO DE POSIÇÃO - TAMBÉM GERA P&L
          const qtdFechamento = Math.abs(posicaoAtual);
          const pnlFechamento = qtdFechamento * especificacao * (
            posicaoAtual > 0 ? 
              (precoOperacao - precoMedioAtual) :  // Posição LONG vendendo
              (precoMedioAtual - precoOperacao)    // Posição SHORT comprando
          );
          
          pnlAcumuladoParcial += pnlFechamento;
          
          operacoesParciais.push({
            data: new Date(transacao.createdAt || transacao.date),
            tipo: 'INVERSÃO PARCIAL',
            contratos: qtdFechamento,
            precoEntrada: precoMedioAtual,
            precoSaida: precoOperacao,
            pnlParcial: pnlFechamento,
            diferenca: Math.abs(precoOperacao - precoMedioAtual),
            transacao: transacao
          });
          
          // Nova posição na direção oposta
          const qtdNovaPosition = qtdOperacao + posicaoAtual;
          posicaoAtual = qtdNovaPosition;
          precoMedioAtual = precoOperacao;
          
        }
      });
      
      // 🎯 CORRIGIDO: Incluir na Performance se há operações de redução/inversão (independente do P&L)
      if (operacoesParciais.length > 0) {
        // Calcular total de contratos liquidados parcialmente
        const contratosLiquidados = operacoesParciais.reduce((total, op) => total + op.contratos, 0);
        
        // Calcular exposição baseada nos contratos liquidados (para ROI correto)
        const isBoiGordo = contract.startsWith('BGI');
        const especificacao = isBoiGordo ? 330 : 450;
        const precoMedioLiquidacao = operacoesParciais.reduce((soma, op, idx, arr) => {
          return soma + (op.precoSaida * op.contratos);
        }, 0) / contratosLiquidados;
        const exposure = contratosLiquidados * especificacao * precoMedioLiquidacao;
        const roi = exposure > 0 ? (pnlAcumuladoParcial / exposure) * 100 : 0;

        partialPnLEntries.push({
          contract: contract,
          product: contract.startsWith('BGI') ? 'Boi Gordo' : 'Milho',
          status: posicaoAtual === 0 ? 'FECHADA' : 'P&L PARCIAL', // ✅ CORRIGIDO: Status correto
          pnl: pnlAcumuladoParcial, // Usar mesmo campo que posições fechadas
          pnlParcialTotal: pnlAcumuladoParcial,
          exposure: exposure, // ✅ Exposição dos contratos liquidados
          roi: roi, // ✅ ROI baseado nos contratos liquidados
          netQuantity: contratosLiquidados, // ✅ SEMPRE quantidade de contratos realizados (liquidados)
          quantidadeLiquidada: contratosLiquidados, // ✅ Campo para quantidade
          operacoesParciais: operacoesParciais,
          posicaoAtiva: {
            quantidade: Math.abs(posicaoAtual),
            direcao: posicaoAtual > 0 ? 'COMPRA' : 'VENDA',
            precoMedio: precoMedioAtual
          },
          ultimaRealizacao: operacoesParciais[operacoesParciais.length - 1]?.data,
          ultimaOperacao: operacoesParciais[operacoesParciais.length - 1]?.data, // ✅ Campo alternativo
          realizationDate: operacoesParciais[operacoesParciais.length - 1]?.data?.toISOString()
        });
        
      } else {
        
        // 🚨 DEBUG ESPECÍFICO: Se não tem operações parciais, mostrar por quê
        if (sortedTransactions.length >= 2) {
        }
      }
    });
    
    if (partialPnLEntries.length > 0) {
    }
    
    // 🚨 LOG ESPECÍFICO BGIN
    const bginParciais = partialPnLEntries.filter(p => p.contract.includes('BGIN'));
    
    return partialPnLEntries;
  }, [transactionsToUse]);

  return {
    netPositions,
    netStats,
    getNeutralizedPositionsForPerformance, // ✅ APENAS posições neutralizadas para Performance
    getPartialPnLForPerformance, // 🎯 NOVA: P&L parciais já realizados para Performance
    getNetPositionByContract,
    checkPositionNeutralization,
    formatNetQuantity,
    formatTransactionSymbol, // Nova função para jogo de símbolos
    applySymbolCalculation, // Nova função para cálculos com símbolos
    getDirectionColor,
    getRealizedPnL, // 🎯 NOVA: P&L realizado
    // Re-exportar funções do contexto
    calculateNetPosition,
    getAllNetPositions,
    isPositionNeutralized
  };
}; 