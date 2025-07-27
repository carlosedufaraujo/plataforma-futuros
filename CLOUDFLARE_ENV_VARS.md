# Configuração de Variáveis de Ambiente no Cloudflare Pages

## Passo a Passo

1. **Acesse o Dashboard do Cloudflare**
   - Vá para https://dash.cloudflare.com
   - Clique em "Workers & Pages"
   - Selecione seu projeto "plataforma-futuros"

2. **Configure as Variáveis**
   - Clique na aba "Settings"
   - Vá para "Environment variables"
   - Clique em "Add variable"

3. **Adicione estas variáveis EXATAMENTE como abaixo:**

   **Variable 1:**
   - Variable name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://kdfevkbwohcajcwrqzor.supabase.co`
   - Environment: Production (certifique-se que está marcado)

   **Variable 2:**
   - Variable name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkZmV2a2J3b2hjYWpjd3Jxem9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMTUzODcsImV4cCI6MjA2ODg5MTM4N30.4nBjKi3rdpfbYmxeoa8GELdBLq8JY6ym68cJX7jpaus`
   - Environment: Production

   **Variable 3 (Opcional):**
   - Variable name: `NEXT_PUBLIC_API_URL`
   - Value: `https://fb0cfd9c.plataforma-futuros.pages.dev`
   - Environment: Production

4. **Salve e Faça Novo Deploy**
   - Clique em "Save"
   - Vá para a aba "Deployments"
   - No último deployment, clique nos 3 pontinhos
   - Selecione "Retry deployment"

## Verificação

Após o deploy, acesse:
- https://fb0cfd9c.plataforma-futuros.pages.dev/debug

Você deve ver:
- SUPABASE_URL: ✅ Configurada
- SUPABASE_ANON_KEY: ✅ Configurada

## Importante

- As variáveis DEVEM começar com `NEXT_PUBLIC_` para serem acessíveis no cliente
- Após adicionar variáveis, SEMPRE faça um novo deploy
- O Cloudflare não injeta variáveis em builds já feitos