# 📋 Diretrizes de Commit - Cloudflare Pages

## ⚠️ IMPORTANTE: SEM EMOJIS NOS COMMITS

O **Cloudflare Pages** tem um **problema conhecido** com emojis e caracteres especiais UTF-8 em mensagens de commit, causando erro:

```
Invalid commit message, it must be a valid UTF-8 string. [code: 8000111]
```

## ✅ FORMATO CORRETO:

```bash
git commit -m "TIPO: Descricao sem emojis

DETALHES:
- Ponto 1
- Ponto 2
- Ponto 3

RESULTADO ESPERADO:
- O que deve acontecer"
```

## ❌ EVITAR:

```bash
git commit -m "🔧 FIX: Problema com emojis"  # ❌ CAUSARÁ ERRO!  
git commit -m "✅ FEAT: Nova funcionalidade"  # ❌ CAUSARÁ ERRO!
git commit -m "🚀 Deploy atualizado"         # ❌ CAUSARÁ ERRO!
```

## 📚 TIPOS RECOMENDADOS:

- `FIX:` - Correção de bugs
- `FEAT:` - Nova funcionalidade  
- `REFACTOR:` - Refatoração de código
- `DOCS:` - Documentação
- `STYLE:` - Formatação/estilo
- `TEST:` - Testes
- `CHORE:` - Tarefas de manutenção

## 🔗 REFERÊNCIA:

- [Cloudflare Pages - Debugging](https://developers.cloudflare.com/pages/configuration/debugging-pages/)
- **Seção**: "Building application" → "Make sure there are no emojis or special characters..."

## 💡 DICA:

Use este comando para commit rápido sem emojis:
```bash
git commit -m "$(date +'%Y-%m-%d'): Descricao da mudanca"
``` 