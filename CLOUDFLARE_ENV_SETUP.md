# Configuração de Variáveis de Ambiente no Cloudflare Pages

## Variáveis Necessárias

Para que a aplicação funcione corretamente no Cloudflare, você precisa configurar as seguintes variáveis de ambiente:

### 1. NEXT_PUBLIC_SUPABASE_URL
```
https://kdfevkbwohcajcwrqzor.supabase.co
```

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkZmV2a2J3b2hjYWpjd3Jxem9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMTUzODcsImV4cCI6MjA2ODg5MTM4N30.4nBjKi3rdpfbYmxeoa8GELdBLq8JY6ym68cJX7jpaus
```

## Como Configurar no Cloudflare Pages

1. Acesse o [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navegue até **Workers & Pages**
3. Selecione seu projeto **plataforma-futuros**
4. Vá para **Settings** → **Environment variables**
5. Clique em **Add variable**
6. Adicione cada variável:
   - Variable name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: (cole o valor acima)
   - Environment: Production (e Preview se desejar)
7. Repita para `NEXT_PUBLIC_SUPABASE_ANON_KEY`
8. Clique em **Save**

## Importante

- **NÃO** adicione a `SUPABASE_SERVICE_ROLE_KEY` no Cloudflare, pois é uma chave sensível que não deve ser exposta no frontend
- As variáveis `NEXT_PUBLIC_*` são seguras para uso no cliente
- Após adicionar as variáveis, faça um novo deploy para que elas sejam aplicadas

## Verificação

Após o deploy, você pode verificar se as variáveis estão funcionando:
1. Abra o console do navegador na aplicação deployada
2. Procure por logs como "✅ Supabase disponível e ativo"
3. Verifique se não há erros 401 ou "Invalid API key"
