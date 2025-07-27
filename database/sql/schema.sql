-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Tipos ENUM
CREATE TYPE contract_type AS ENUM ('BGI', 'CCM');
CREATE TYPE position_direction AS ENUM ('LONG', 'SHORT');
CREATE TYPE option_type AS ENUM ('CALL', 'PUT');
CREATE TYPE transaction_type AS ENUM ('BUY', 'SELL', 'EXERCISE', 'EXPIRE');
CREATE TYPE position_status AS ENUM ('OPEN', 'CLOSED', 'PARTIAL');
CREATE TYPE user_role AS ENUM ('admin', 'trader', 'viewer');

-- Tabela de usuários
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    telefone VARCHAR(20),
    endereco TEXT,
    initial_capital DECIMAL(15,2) DEFAULT 200000.00,
    current_capital DECIMAL(15,2) DEFAULT 200000.00,
    theme VARCHAR(10) DEFAULT 'dark',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de corretoras
CREATE TABLE brokerages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    endereco TEXT,
    assessor VARCHAR(255),
    telefone VARCHAR(20),
    email VARCHAR(255),
    corretagem_milho DECIMAL(10,2) DEFAULT 0,
    corretagem_boi DECIMAL(10,2) DEFAULT 0,
    taxas DECIMAL(10,2) DEFAULT 0,
    impostos DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de relacionamento usuário-corretora (M:N)
CREATE TABLE user_brokerage_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    brokerage_id UUID REFERENCES brokerages(id) ON DELETE CASCADE,
    role user_role DEFAULT 'viewer',
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    granted_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, brokerage_id)
);

-- Tabela de contratos disponíveis
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(10) UNIQUE NOT NULL, -- BGIK25, CCMN25, etc
    contract_type contract_type NOT NULL,
    expiration_date DATE NOT NULL,
    contract_size INTEGER NOT NULL, -- 330 para BGI, 450 para CCM
    unit VARCHAR(20) NOT NULL, -- arrobas, sacos
    name VARCHAR(100) NOT NULL, -- Boi Gordo, Milho
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de preços (histórico e atual)
CREATE TABLE prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID REFERENCES contracts(id),
    price DECIMAL(10,4) NOT NULL,
    volume INTEGER DEFAULT 0,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_current BOOLEAN DEFAULT true
);

-- Tabela de posições
CREATE TABLE positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    brokerage_id UUID REFERENCES brokerages(id), -- Nova referência
    contract_id UUID REFERENCES contracts(id),
    direction position_direction NOT NULL,
    quantity INTEGER NOT NULL,
    entry_price DECIMAL(10,4) NOT NULL,
    current_price DECIMAL(10,4),
    stop_loss DECIMAL(10,4),
    take_profit DECIMAL(10,4),
    status position_status DEFAULT 'OPEN',
    entry_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    exit_date TIMESTAMP WITH TIME ZONE,
    exit_price DECIMAL(10,4),
    realized_pnl DECIMAL(15,2),
    unrealized_pnl DECIMAL(15,2),
    fees DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de opções
CREATE TABLE options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    brokerage_id UUID REFERENCES brokerages(id), -- Nova referência
    contract_id UUID REFERENCES contracts(id),
    option_type option_type NOT NULL,
    strike_price DECIMAL(10,4) NOT NULL,
    premium DECIMAL(10,4) NOT NULL,
    quantity INTEGER NOT NULL,
    expiration_date DATE NOT NULL,
    is_purchased BOOLEAN NOT NULL, -- true = comprada, false = vendida
    status position_status DEFAULT 'OPEN',
    delta DECIMAL(6,4),
    gamma DECIMAL(6,4),
    theta DECIMAL(6,4),
    vega DECIMAL(6,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de estratégias de opções
CREATE TABLE option_strategies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    brokerage_id UUID REFERENCES brokerages(id), -- Nova referência
    name VARCHAR(100) NOT NULL, -- Bull Call Spread, Protective Put, etc
    description TEXT,
    max_profit DECIMAL(15,2),
    max_loss DECIMAL(15,2),
    breakeven DECIMAL(10,4),
    cost DECIMAL(15,2),
    status position_status DEFAULT 'OPEN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de componentes de estratégia (relação M:N)
CREATE TABLE strategy_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    strategy_id UUID REFERENCES option_strategies(id) ON DELETE CASCADE,
    option_id UUID REFERENCES options(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de transações
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    brokerage_id UUID REFERENCES brokerages(id), -- Nova referência
    position_id UUID REFERENCES positions(id),
    option_id UUID REFERENCES options(id),
    contract_id UUID REFERENCES contracts(id),
    transaction_type transaction_type NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,4) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    fees DECIMAL(10,2) DEFAULT 0,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- Tabela de configurações do usuário
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    api_url VARCHAR(500),
    risk_limit DECIMAL(15,2) DEFAULT 50000.00,
    auto_hedge BOOLEAN DEFAULT false,
    notifications BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para configurações de corretora por usuário
CREATE TABLE user_brokerage_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    brokerage_id VARCHAR(50) NOT NULL REFERENCES brokerages(id) ON DELETE CASCADE,
    api_key TEXT NOT NULL, -- Criptografado
    secret_key TEXT NOT NULL, -- Criptografado
    client_id TEXT, -- Para corretoras que usam client_id
    environment VARCHAR(20) NOT NULL DEFAULT 'sandbox', -- 'sandbox' ou 'production'
    auto_sync BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_sync TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraint para garantir uma configuração ativa por usuário/corretora
    UNIQUE(user_id, brokerage_id)
);

-- Índices para performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_cpf ON users(cpf);
CREATE INDEX idx_brokerages_cnpj ON brokerages(cnpj);
CREATE INDEX idx_user_brokerage_access_user_id ON user_brokerage_access(user_id);
CREATE INDEX idx_user_brokerage_access_brokerage_id ON user_brokerage_access(brokerage_id);
CREATE INDEX idx_positions_user_id ON positions(user_id);
CREATE INDEX idx_positions_brokerage_id ON positions(brokerage_id);
CREATE INDEX idx_positions_status ON positions(status);
CREATE INDEX idx_positions_contract_id ON positions(contract_id);
CREATE INDEX idx_prices_contract_id ON prices(contract_id);
CREATE INDEX idx_prices_timestamp ON prices(timestamp);
CREATE INDEX idx_prices_is_current ON prices(is_current);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_brokerage_id ON transactions(brokerage_id);
CREATE INDEX idx_transactions_executed_at ON transactions(executed_at);
CREATE INDEX idx_options_user_id ON options(user_id);
CREATE INDEX idx_options_brokerage_id ON options(brokerage_id);
CREATE INDEX idx_options_status ON options(status);
CREATE INDEX idx_user_brokerage_configs_user_id ON user_brokerage_configs(user_id);
CREATE INDEX idx_user_brokerage_configs_brokerage_id ON user_brokerage_configs(brokerage_id);
CREATE INDEX idx_user_brokerage_configs_active ON user_brokerage_configs(user_id, is_active);

-- Triggers para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brokerages_updated_at BEFORE UPDATE ON brokerages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_brokerage_access_updated_at BEFORE UPDATE ON user_brokerage_access
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON positions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_options_updated_at BEFORE UPDATE ON options
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_option_strategies_updated_at BEFORE UPDATE ON option_strategies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 

CREATE TRIGGER update_user_brokerage_configs_updated_at
    BEFORE UPDATE ON user_brokerage_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Adicionar campo selected_brokerage_id na tabela users
ALTER TABLE users ADD COLUMN IF NOT EXISTS selected_brokerage_id VARCHAR(50) REFERENCES brokerages(id);

-- Índice para selected_brokerage_id
CREATE INDEX IF NOT EXISTS idx_users_selected_brokerage ON users(selected_brokerage_id); 