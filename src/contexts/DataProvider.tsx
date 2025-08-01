'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Position, Option, Transaction, User, Brokerage } from '@/types';
import { supabaseService } from '@/services/supabaseService';
import { useAuth } from './AuthContext';
import { generatePositionId, generateOptionId, generateTransactionId, generateUserId, generateBrokerageId } from '@/services/idGenerator';

interface DataContextType {
  // Estados de dados
  positions: Position[];
  options: Option[];
  transactions: Transaction[];
  users: User[];
  brokerages: Brokerage[];
  currentUser: User | null;
  selectedBrokerage: Brokerage | null;
  
  // Estados de controle
  loading: boolean;
  error: string | null;
  
  // Funções de manipulação
  addPosition: (position: Omit<Position, 'id'>) => Promise<void>;
  updatePosition: (id: string, updates: Partial<Position>) => Promise<void>;
  deletePosition: (id: string) => Promise<void>;
  closePosition: (id: string, closePrice: number, closeDate?: string) => Promise<void>;
  duplicatePosition: (id: string) => Promise<void>;
  
  addOption: (option: Omit<Option, 'id'>) => Promise<void>;
  updateOption: (id: string, updates: Partial<Option>) => Promise<void>;
  deleteOption: (id: string) => Promise<void>;
  
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  setCurrentUser: (user: User | null) => void;
  
  addBrokerage: (brokerage: Omit<Brokerage, 'id'>) => Promise<void>;
  updateBrokerage: (id: string, updates: Partial<Brokerage>) => Promise<void>;
  deleteBrokerage: (id: string) => Promise<void>;
  setSelectedBrokerage: (brokerage: Brokerage | null) => void;
  
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  // Estados
  const [positions, setPositions] = useState<Position[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [brokerages, setBrokerages] = useState<Brokerage[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedBrokerage, setSelectedBrokerage] = useState<Brokerage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para carregar dados
  const loadData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [positionsData, optionsData, transactionsData, usersData, brokeragesData] = await Promise.all([
        supabaseService.getPositions(),
        supabaseService.getOptions(),
        supabaseService.getTransactions(),
        supabaseService.getUsers(),
        supabaseService.getBrokerages()
      ]);

      setPositions(positionsData);
      setOptions(optionsData);
      setTransactions(transactionsData);
      setUsers(usersData);
      setBrokerages(brokeragesData);

      // Configurar usuário atual
      const authUser = usersData.find(u => u.email === user.email);
      if (authUser) {
        setCurrentUser(authUser);
        
        // Configurar corretora padrão
        if (authUser.defaultBrokerageId) {
          const defaultBrokerage = brokeragesData.find(b => b.id === authUser.defaultBrokerageId);
          if (defaultBrokerage) {
            setSelectedBrokerage(defaultBrokerage);
          }
        }
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Carregar dados quando o usuário mudar
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Funções de manipulação de posições
  const addPosition = async (position: Omit<Position, 'id'>) => {
    try {
      // Não incluir ID - deixar o Supabase gerar UUID automaticamente
      const newPosition = {
        ...position,
        user_id: currentUser?.id || position.user_id,
        brokerage_id: selectedBrokerage?.id || position.brokerage_id
      };
      
      const created = await supabaseService.createPosition(newPosition);
      setPositions(prev => [...prev, created]);
    } catch (err) {
      console.error('Erro ao adicionar posição:', err);
      throw err;
    }
  };

  const updatePosition = async (id: string, updates: Partial<Position>) => {
    try {
      const updated = await supabaseService.updatePosition(id, updates);
      setPositions(prev => prev.map(p => p.id === id ? updated : p));
    } catch (err) {
      console.error('Erro ao atualizar posição:', err);
      throw err;
    }
  };

  const deletePosition = async (id: string) => {
    try {
      await supabaseService.deletePosition(id);
      setPositions(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Erro ao deletar posição:', err);
      throw err;
    }
  };

  const closePosition = async (id: string, closePrice: number, closeDate?: string) => {
    try {
      const position = positions.find(p => p.id === id);
      if (!position) throw new Error('Posição não encontrada');

      const updates = {
        status: 'closed' as const,
        closePrice,
        closeDate: closeDate || new Date().toISOString().split('T')[0]
      };

      await updatePosition(id, updates);
    } catch (err) {
      console.error('Erro ao fechar posição:', err);
      throw err;
    }
  };

  const duplicatePosition = async (id: string) => {
    try {
      const position = positions.find(p => p.id === id);
      if (!position) throw new Error('Posição não encontrada');

      const { id: _, ...positionData } = position;
      await addPosition({
        ...positionData,
        status: 'open',
        openDate: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      console.error('Erro ao duplicar posição:', err);
      throw err;
    }
  };

  // Funções de manipulação de opções
  const addOption = async (option: Omit<Option, 'id'>) => {
    try {
      const newOption = {
        ...option,
        id: generateOptionId(),
        userId: currentUser?.id || '',
        brokerageId: selectedBrokerage?.id || option.brokerageId
      };
      
      const created = await supabaseService.createOption(newOption);
      setOptions(prev => [...prev, created]);
    } catch (err) {
      console.error('Erro ao adicionar opção:', err);
      throw err;
    }
  };

  const updateOption = async (id: string, updates: Partial<Option>) => {
    try {
      const updated = await supabaseService.updateOption(id, updates);
      setOptions(prev => prev.map(o => o.id === id ? updated : o));
    } catch (err) {
      console.error('Erro ao atualizar opção:', err);
      throw err;
    }
  };

  const deleteOption = async (id: string) => {
    try {
      await supabaseService.deleteOption(id);
      setOptions(prev => prev.filter(o => o.id !== id));
    } catch (err) {
      console.error('Erro ao deletar opção:', err);
      throw err;
    }
  };

  // Funções de manipulação de transações
  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const newTransaction = {
        ...transaction,
        id: generateTransactionId(),
        userId: currentUser?.id || '',
        brokerageId: selectedBrokerage?.id || transaction.brokerageId
      };
      
      const created = await supabaseService.createTransaction(newTransaction);
      setTransactions(prev => [...prev, created]);
    } catch (err) {
      console.error('Erro ao adicionar transação:', err);
      throw err;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const updated = await supabaseService.updateTransaction(id, updates);
      setTransactions(prev => prev.map(t => t.id === id ? updated : t));
    } catch (err) {
      console.error('Erro ao atualizar transação:', err);
      throw err;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await supabaseService.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Erro ao deletar transação:', err);
      throw err;
    }
  };

  // Funções de manipulação de usuários
  const addUser = async (user: Omit<User, 'id'>) => {
    try {
      const newUser = {
        ...user,
        id: generateUserId()
      };
      
      const created = await supabaseService.createUser(newUser);
      setUsers(prev => [...prev, created]);
    } catch (err) {
      console.error('Erro ao adicionar usuário:', err);
      throw err;
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    try {
      const updated = await supabaseService.updateUser(id, updates);
      setUsers(prev => prev.map(u => u.id === id ? updated : u));
      
      if (currentUser?.id === id) {
        setCurrentUser(updated);
      }
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      throw err;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await supabaseService.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      console.error('Erro ao deletar usuário:', err);
      throw err;
    }
  };

  // Funções de manipulação de corretoras
  const addBrokerage = async (brokerage: Omit<Brokerage, 'id'>) => {
    try {
      const newBrokerage = {
        ...brokerage,
        id: generateBrokerageId()
      };
      
      const created = await supabaseService.createBrokerage(newBrokerage);
      setBrokerages(prev => [...prev, created]);
    } catch (err) {
      console.error('Erro ao adicionar corretora:', err);
      throw err;
    }
  };

  const updateBrokerage = async (id: string, updates: Partial<Brokerage>) => {
    try {
      const updated = await supabaseService.updateBrokerage(id, updates);
      setBrokerages(prev => prev.map(b => b.id === id ? updated : b));
      
      if (selectedBrokerage?.id === id) {
        setSelectedBrokerage(updated);
      }
    } catch (err) {
      console.error('Erro ao atualizar corretora:', err);
      throw err;
    }
  };

  const deleteBrokerage = async (id: string) => {
    try {
      await supabaseService.deleteBrokerage(id);
      setBrokerages(prev => prev.filter(b => b.id !== id));
      
      if (selectedBrokerage?.id === id) {
        setSelectedBrokerage(null);
      }
    } catch (err) {
      console.error('Erro ao deletar corretora:', err);
      throw err;
    }
  };

  const value: DataContextType = {
    positions,
    options,
    transactions,
    users,
    brokerages,
    currentUser,
    selectedBrokerage,
    loading,
    error,
    addPosition,
    updatePosition,
    deletePosition,
    closePosition,
    duplicatePosition,
    addOption,
    updateOption,
    deleteOption,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addUser,
    updateUser,
    deleteUser,
    setCurrentUser,
    addBrokerage,
    updateBrokerage,
    deleteBrokerage,
    setSelectedBrokerage,
    refreshData: loadData
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData deve ser usado dentro de DataProvider');
  }
  return context;
}