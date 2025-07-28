# Memória do Claude - Sistema Plataforma Futuros

## 🚀 Deploy no Cloudflare - SEMPRE FAZER GIT PUSH

### ⚠️ IMPORTANTE: Após qualquer alteração no código, SEMPRE execute:
```bash
git add .
git commit -m "descrição das mudanças"
git push origin main
```

O deploy para o Cloudflare é automático após o push. Aguardar 2-3 minutos para as mudanças aparecerem em produção.

## 📋 Informações do Sistema

### URLs
- **Produção**: https://plataforma-futuros.pages.dev
- **GitHub**: https://github.com/carlosedufaraujo/plataforma-futuros
- **Supabase**: https://supabase.com/dashboard/project/kdfevkbwohcajcwrqzor

### Credenciais de Teste
- **Admin**: carloseduardo@acexcapital.com / 123456
- **Usuário**: angelocaiado@rialmaagropecuaria.com.br / 123456

### Variáveis de Ambiente (Cloudflare Pages)
- `NEXT_PUBLIC_SUPABASE_URL`: https://kdfevkbwohcajcwrqzor.supabase.co
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkZmV2a2J3b2hjYWpjd3Jxem9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMTUzODcsImV4cCI6MjA2ODg5MTM4N30.4nBjKi3rdpfbYmxeoa8GELdBLq8JY6ym68cJX7jpaus

## 🛠️ Comandos Úteis

### Desenvolvimento Local
```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run dev:stable   # Inicia servidor estável
npm run stop         # Para o servidor
```

### Deploy
```bash
git add .
git commit -m "mensagem"
git push origin main
```

### Limpar Cache (se houver problemas)
```bash
rm -rf .next
npm run dev:clean
```

## 📝 Notas Importantes

1. **NÃO usar service_role key no frontend** - apenas anon key
2. **Sempre verificar espaços em chaves** ao copiar/colar
3. **Deploy automático** acontece após cada push
4. **Dados no Supabase** são permanentes e não afetados por deploys

## 🔧 Estrutura do Projeto

- Frontend: Next.js 15 com App Router
- Backend: Supabase (PostgreSQL + Auth)
- Deploy: Cloudflare Pages
- Auth: Supabase Auth com RLS
- UI: Tailwind CSS + componentes customizados

## 📅 Última Atualização
- Data: 28/01/2025
- Status: Sistema 100% operacional no Cloudflare
- Deploy automático configurado e funcionando