# Diagnóstico Cloudflare Pages

## Checklist de Verificação

### 1. Variáveis de Ambiente no Cloudflare
Verifique se estas variáveis foram adicionadas no Cloudflare Pages:
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = `https://kdfevkbwohcajcwrqzor.supabase.co`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- [ ] `NEXT_PUBLIC_API_URL` = URL do seu deploy (ex: `https://boi-gordo-investimentos.pages.dev`)

### 2. Possíveis Problemas e Soluções

#### Erro: Página em branco
- **Causa**: Rotas do Next.js não configuradas para exportação estática
- **Solução**: Verificar se todas as páginas usam `export default` corretamente

#### Erro: Supabase connection failed
- **Causa**: Variáveis de ambiente não configuradas
- **Solução**: Adicionar as variáveis no Cloudflare Pages settings

#### Erro: 404 em rotas
- **Causa**: Next.js App Router precisa de configuração especial
- **Solução**: Adicionar arquivo `_routes.json` na pasta `public`

### 3. Para testar localmente como produção:
```bash
npm run build
npx serve out -p 3000
```

### 4. Logs úteis para debug
No console do navegador (F12), verifique:
1. Erros de rede (aba Network)
2. Erros de JavaScript (aba Console)
3. Se as variáveis de ambiente estão sendo carregadas

### 5. Correções comuns necessárias:

#### Adicionar _routes.json para SPA routing:
```json
{
  "version": 1,
  "include": ["/*"],
  "exclude": ["/api/*", "/_next/*", "/static/*"]
}
```

#### Verificar imports de imagens:
- Cloudflare Pages pode ter problemas com imports dinâmicos
- Use imports estáticos quando possível

## Próximos Passos

1. Compartilhe a URL do deploy
2. Compartilhe erros do console do navegador
3. Compartilhe logs do Cloudflare Pages build
4. Confirme se as variáveis foram adicionadas