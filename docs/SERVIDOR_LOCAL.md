# 🚀 Gerenciamento do Servidor Local

## Comandos Disponíveis

### 🟢 Iniciar Servidor

#### Opção 1: Modo Normal (Terminal fica preso)
```bash
npm run dev
```

#### Opção 2: Modo Background (Terminal fica livre)
```bash
npm run dev:bg
```
- O servidor roda em background
- Logs são salvos em `dev.log`
- PID é salvo em `.server.pid`

#### Opção 3: Modo Estável (com script)
```bash
npm run dev:stable
```
- Usa o script `start-server.sh`
- Mata processos antigos automaticamente
- Mais confiável

### 🔴 Parar Servidor

```bash
npm run stop
```
- Para qualquer processo rodando na porta 3000

### 🔄 Reiniciar Servidor

```bash
npm run restart
```
- Para e inicia o servidor novamente

### 📊 Verificar Status

```bash
npm run status
```
- Mostra se o servidor está rodando e informações do processo

### 📝 Ver Logs (quando em background)

```bash
npm run logs
```
- Mostra logs em tempo real do servidor

## 🛡️ Solução de Problemas

### Servidor não inicia
1. Verifique se a porta 3000 está livre:
   ```bash
   npm run status
   ```

2. Force a parada de todos os processos:
   ```bash
   npm run stop
   killall node
   ```

3. Limpe o cache e reinicie:
   ```bash
   rm -rf .next
   npm run dev:clean
   ```

### Servidor para sozinho
- Use o modo background para maior estabilidade:
  ```bash
  npm run dev:bg
  ```

### Ver erros
- Quando rodando em background:
  ```bash
  cat dev.log
  # ou
  npm run logs
  ```

## 🎯 Recomendação

Para desenvolvimento diário, use:
```bash
npm run dev:bg  # Inicia em background
npm run logs    # Em outro terminal para ver logs
```

Isso mantém o servidor rodando mesmo se você fechar o terminal acidentalmente.