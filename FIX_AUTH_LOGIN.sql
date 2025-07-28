-- ================================
-- FIX AUTH LOGIN - SCRIPT ÚNICO
-- ================================
-- Execute este script completo no Supabase SQL Editor

-- 1. Primeiro, vamos limpar os usuários do auth
DELETE FROM auth.users 
WHERE email IN ('carloseduardo@acexcapital.com', 'angelocaiado@rialmaagropecuaria.com.br');

-- 2. Habilitar extensão necessária
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 3. Criar usuários no auth com IDs corretos da tabela users
DO $$
DECLARE
    carlos_id UUID;
    angelo_id UUID;
BEGIN
    -- Pegar IDs reais dos usuários
    SELECT id INTO carlos_id FROM users WHERE email = 'carloseduardo@acexcapital.com';
    SELECT id INTO angelo_id FROM users WHERE email = 'angelocaiado@rialmaagropecuaria.com.br';
    
    -- Criar Carlos Eduardo no auth
    IF carlos_id IS NOT NULL THEN
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
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            carlos_id,
            'authenticated',
            'authenticated',
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
            '',
            '',
            '',
            ''
        );
    END IF;
    
    -- Criar Ângelo Caiado no auth
    IF angelo_id IS NOT NULL THEN
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
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            angelo_id,
            'authenticated',
            'authenticated',
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
            '',
            '',
            '',
            ''
        );
    END IF;
END $$;

-- 4. Verificar resultado
SELECT 
    '=== USUÁRIOS CRIADOS NO AUTH ===' as info
UNION ALL
SELECT 
    'Email: ' || au.email || ' | ID Match: ' || 
    CASE WHEN u.id = au.id THEN '✅ OK' ELSE '❌ ERRO' END
FROM auth.users au
JOIN users u ON u.email = au.email
WHERE au.email IN ('carloseduardo@acexcapital.com', 'angelocaiado@rialmaagropecuaria.com.br');