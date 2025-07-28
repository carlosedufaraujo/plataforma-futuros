-- ================================
-- RESET DE SENHAS NO SUPABASE AUTH
-- ================================

-- Primeiro, vamos verificar os usuários no auth
SELECT 
    '=== USUÁRIOS NO AUTH.USERS ===' as info
UNION ALL
SELECT 
    email || ' (ID: ' || id || ')'
FROM auth.users
ORDER BY 1;

-- Deletar usuários antigos do auth (se existirem)
DELETE FROM auth.users 
WHERE email IN ('carloseduardo@acexcapital.com', 'angelocaiado@rialmaagropecuaria.com.br');

-- Recriar os usuários com senhas corretas
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) 
SELECT 
    '00000000-0000-0000-0000-000000000000',
    u.id,
    'authenticated',
    'authenticated', 
    u.email,
    crypt('Acex@2025', gen_salt('bf')),
    now(),
    jsonb_build_object(
        'nome', u.nome,
        'cpf', u.cpf,
        'telefone', u.telefone
    ),
    now(),
    now(),
    '',
    '',
    '',
    ''
FROM users u
WHERE u.email = 'carloseduardo@acexcapital.com';

-- Criar Ângelo
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
)
SELECT 
    '00000000-0000-0000-0000-000000000000',
    u.id,
    'authenticated',
    'authenticated',
    u.email,
    crypt('Rialma@2025', gen_salt('bf')),
    now(),
    jsonb_build_object(
        'nome', u.nome,
        'cpf', u.cpf,
        'telefone', u.telefone
    ),
    now(),
    now(),
    '',
    '',
    '',
    ''
FROM users u
WHERE u.email = 'angelocaiado@rialmaagropecuaria.com.br';

-- Verificar resultado
SELECT 
    '=== USUÁRIOS RECRIADOS ===' as info
UNION ALL
SELECT 
    'Email: ' || email || ' | ID: ' || id
FROM auth.users
WHERE email IN ('carloseduardo@acexcapital.com', 'angelocaiado@rialmaagropecuaria.com.br');