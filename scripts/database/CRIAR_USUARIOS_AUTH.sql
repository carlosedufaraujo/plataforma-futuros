-- ================================
-- CRIAR USUÁRIOS NO SUPABASE AUTH
-- Execute este script APÓS o SETUP_USUARIOS_CORRETORAS.sql
-- ================================

-- Extensão necessária para criptografia de senha
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Usuario 1: Carlos Eduardo (Admin ACEX)
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    aud,
    role
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'carlos@acex.com',
    crypt('Acex@2025', gen_salt('bf')),
    now(),
    '{"nome": "Carlos Eduardo", "cpf": "123.456.789-00"}'::jsonb,
    now(),
    now(),
    'authenticated',
    'authenticated'
);

-- Usuario 2: Ana Paula (Trader Prime)
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    aud,
    role
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    'ana@primeinvest.com',
    crypt('Prime@2025', gen_salt('bf')),
    now(),
    '{"nome": "Ana Paula Silva", "cpf": "987.654.321-00"}'::jsonb,
    now(),
    now(),
    'authenticated',
    'authenticated'
);

-- Verificar se foram criados
SELECT 
    email,
    raw_user_meta_data->>'nome' as nome,
    created_at
FROM auth.users
WHERE email IN ('carlos@acex.com', 'ana@primeinvest.com');