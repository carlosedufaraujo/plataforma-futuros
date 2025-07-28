-- ================================
-- CRIAR USUÁRIOS NO SUPABASE AUTH - VERSÃO FINAL
-- Execute este script APÓS o SETUP_USUARIOS_CORRETORAS_FINAL.sql
-- ================================

-- Extensão necessária para criptografia de senha
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Usuario 1: Carlos Eduardo Araujo (Admin ACEX)
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
    'carloseduardo@acexcapital.com',
    crypt('Acex@2025', gen_salt('bf')),
    now(),
    jsonb_build_object(
        'nome', 'Carlos Eduardo Araujo',
        'cpf', '123.456.789-00',
        'telefone', '(54) 98456-9252'
    ),
    now(),
    now(),
    'authenticated',
    'authenticated'
);

-- Usuario 2: Ângelo Caiado (Admin Rialma)
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
    'angelocaiado@rialmaagropecuaria.com.br',
    crypt('Rialma@2025', gen_salt('bf')),
    now(),
    jsonb_build_object(
        'nome', 'Ângelo Caiado',
        'cpf', '987.654.321-00',
        'telefone', '(61) 98157-1920'
    ),
    now(),
    now(),
    'authenticated',
    'authenticated'
);

-- Verificar se foram criados
SELECT 
    '=== USUÁRIOS CRIADOS NO AUTH ===' as categoria,
    '' as info
UNION ALL
SELECT 
    'Email',
    email || ' - ' || (raw_user_meta_data->>'nome')
FROM auth.users
WHERE email IN ('carloseduardo@acexcapital.com', 'angelocaiado@rialmaagropecuaria.com.br')
ORDER BY 1, 2;

-- Resumo das credenciais
SELECT 
    '=== CREDENCIAIS DE ACESSO ===' as titulo,
    '' as info
UNION ALL
SELECT 
    'Carlos Eduardo',
    'Email: carloseduardo@acexcapital.com | Senha: Acex@2025'
UNION ALL
SELECT 
    'Ângelo Caiado',
    'Email: angelocaiado@rialmaagropecuaria.com.br | Senha: Rialma@2025';