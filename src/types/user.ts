// Re-exporta a interface User do arquivo principal
export { User } from './index';

// Interface para compatibilidade com componentes legados
export interface LegacyUser {
  id: string;
  nome: string;
  cpf: string;
  endereco: string;
  telefone: string;
  email: string;
  is_active?: boolean;
  created_at?: string;
  corretoras?: string[];
  brokerageIds?: string[];
}

// Função helper para converter entre formatos
export function userToLegacy(user: import('./index').User): LegacyUser {
  return {
    id: user.id,
    nome: user.nome,
    cpf: user.cpf,
    endereco: user.endereco,
    telefone: user.telefone,
    email: user.email,
    is_active: user.is_active || user.isActive,
    created_at: user.created_at || user.createdAt,
    corretoras: user.corretoras || user.brokerageIds,
    brokerageIds: user.brokerageIds || user.corretoras
  };
}

// Função helper para converter de legacy para User
export function legacyToUser(legacy: LegacyUser): import('./index').User {
  return {
    id: legacy.id,
    nome: legacy.nome,
    cpf: legacy.cpf,
    endereco: legacy.endereco,
    telefone: legacy.telefone,
    email: legacy.email,
    isActive: legacy.is_active || true,
    is_active: legacy.is_active,
    role: 'trader',
    createdAt: legacy.created_at || new Date().toISOString(),
    created_at: legacy.created_at,
    updatedAt: new Date().toISOString(),
    brokerageIds: legacy.brokerageIds || legacy.corretoras || [],
    corretoras: legacy.corretoras || legacy.brokerageIds
  };
}