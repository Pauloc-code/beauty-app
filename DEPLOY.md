# 🚀 Guia de Deploy - Beauty App

Este guia mostra como fazer o deploy da aplicação em diferentes plataformas.

## 📋 Preparação

Antes do deploy, certifique-se de ter:

1. ✅ Conta no GitHub
2. ✅ Banco PostgreSQL configurado
3. ✅ Variáveis de ambiente definidas

## 🌐 Deploy na Vercel (Recomendado)

### Passo 1: Preparar o Repositório
```bash
# Criar repositório no GitHub
git init
git add .
git commit -m "Initial commit: Beauty App"
git branch -M main
git remote add origin https://github.com/seu-usuario/beauty-app.git
git push -u origin main
```

### Passo 2: Configurar Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Conecte sua conta GitHub
3. Importe o repositório `beauty-app`
4. Configure as variáveis de ambiente:

**Variáveis Obrigatórias:**
```
DATABASE_URL=postgresql://usuario:senha@host:5432/database
NODE_ENV=production
```

### Passo 3: Deploy Automático
- O Vercel fará o deploy automaticamente
- Cada push na branch `main` atualiza a aplicação

## 🚂 Deploy na Railway

### Passo 1: Criar Projeto
1. Acesse [railway.app](https://railway.app)
2. Conecte com GitHub
3. Crie novo projeto do repositório

### Passo 2: Configurar Banco
```bash
# Railway PostgreSQL
railway add postgresql
```

### Passo 3: Variáveis de Ambiente
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
NODE_ENV=production
PORT=5000
```

## 🎨 Deploy na Render

### Passo 1: Configurar Web Service
1. Acesse [render.com](https://render.com)
2. Conecte repositório GitHub
3. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### Passo 2: Banco PostgreSQL
1. Crie PostgreSQL service no Render
2. Copie a DATABASE_URL gerada

## 🏗️ Configurações de Produção

### Build Script
```json
{
  "scripts": {
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js"
  }
}
```

### Variáveis de Ambiente Essenciais
```bash
# Banco de dados (obrigatório)
DATABASE_URL=postgresql://...

# Ambiente
NODE_ENV=production

# Porta (opcional - detectada automaticamente)
PORT=5000

# PostgreSQL específicos (se necessário)
PGHOST=...
PGPORT=5432
PGUSER=...
PGPASSWORD=...
PGDATABASE=...
```

## 🔧 Comandos Úteis

### Desenvolvimento Local
```bash
npm install
npm run dev
```

### Build de Produção
```bash
npm run build
npm start
```

### Banco de Dados
```bash
npm run db:push  # Aplicar schema
```

## 🚨 Checklist de Deploy

- [ ] Repositório GitHub criado
- [ ] Variáveis de ambiente configuradas
- [ ] DATABASE_URL válida e acessível
- [ ] Build executado com sucesso
- [ ] Aplicação acessível nas rotas:
  - `/` - Painel Admin
  - `/app` - App Mobile
  - `/cliente` - App Mobile (alternativo)

## 📱 Teste Pós-Deploy

1. **Admin Panel**: Acesse `/` e teste:
   - Login/navegação
   - Criação de agendamentos
   - Upload de imagens
   - Relatórios

2. **App Mobile**: Acesse `/app` e teste:
   - Interface responsiva
   - Navegação entre seções
   - Visualização de agendamentos

## 🆘 Troubleshooting

### Erro de Build
```bash
# Limpar cache
rm -rf node_modules
npm install
npm run build
```

### Erro de Banco
- Verificar DATABASE_URL
- Executar `npm run db:push`
- Verificar logs de conexão

### App não carrega
- Verificar variáveis de ambiente
- Verificar logs da plataforma
- Testar build local

## 🎯 Domínio Customizado

Após deploy bem-sucedido:
1. Configure DNS para apontar para a plataforma
2. Configure SSL/HTTPS (automático na maioria das plataformas)
3. Teste todas as funcionalidades

Sua Beauty App estará online e pronta para uso! 🚀