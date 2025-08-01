# Beauty App - Plataforma de Gestão de Serviços e Agendamento

Uma plataforma completa de gestão para salões de beleza e profissionais de manicure, com interface móvel para clientes e painel administrativo web.

## 🚀 Funcionalidades

### Para Clientes (App Mobile)
- **Agendamento Online**: Sistema intuitivo de agendamento com seleção de serviços
- **Portfólio Visual**: Galeria de trabalhos realizados
- **Sistema de Fidelidade**: Acúmulo de pontos por serviços
- **Histórico de Agendamentos**: Visualização completa do histórico
- **Interface Responsiva**: Otimizada para dispositivos móveis

### Para Administradores (Painel Web)
- **Dashboard Completo**: Estatísticas em tempo real
- **Gestão de Agendamentos**: Calendário interativo com múltiplas visualizações
- **CRM de Clientes**: Cadastro e gestão completa de clientes
- **Catálogo de Serviços**: Gestão de preços, duração e pontos de fidelidade
- **Galeria de Trabalhos**: Upload e organização de portfolio
- **Relatórios Financeiros**: Acompanhamento de receitas e transações
- **Sistema de Configurações**: Personalização completa da plataforma

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express
- **Banco de Dados**: PostgreSQL + Drizzle ORM
- **UI/UX**: Tailwind CSS + shadcn/ui
- **Gerenciamento de Estado**: TanStack Query
- **Validação**: Zod
- **Internacionalização**: Suporte completo ao português brasileiro

## 📱 Acesso às Interfaces

### App Mobile (Clientes)
- `/app` - Interface principal do cliente
- `/cliente` - Rota alternativa
- `/mobile` - Rota alternativa

### Painel Administrativo
- `/` - Painel completo de administração

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- PostgreSQL
- npm ou yarn

### Instalação

1. Clone o repositório:
```bash
git clone [seu-repositorio]
cd beauty-app
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```
Edite o arquivo `.env` com suas configurações de banco de dados.

4. Execute as migrações do banco:
```bash
npm run db:push
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5000`

## 📁 Estrutura do Projeto

```
beauty-app/
├── client/              # Frontend React
│   ├── src/
│   │   ├── components/  # Componentes reutilizáveis
│   │   ├── pages/       # Páginas principais
│   │   ├── hooks/       # Hooks customizados
│   │   └── lib/         # Utilitários e configurações
├── server/              # Backend Node.js
│   ├── routes.ts        # Rotas da API
│   ├── storage.ts       # Camada de dados
│   └── db.ts           # Configuração do banco
├── shared/              # Tipos e schemas compartilhados
│   └── schema.ts        # Schema do banco com Drizzle
└── README.md
```

## 🗄️ Banco de Dados

O sistema utiliza as seguintes entidades principais:

- **Users**: Administradores do sistema
- **Clients**: Clientes cadastrados
- **Services**: Catálogo de serviços
- **Appointments**: Agendamentos realizados
- **Gallery**: Imagens do portfolio
- **Transactions**: Controle financeiro

## 🌐 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório GitHub ao Vercel
2. Configure as variáveis de ambiente no painel da Vercel
3. O deploy será automático a cada push

### Outras Plataformas

O projeto é compatível com:
- Railway
- Render
- Heroku
- Digital Ocean App Platform

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Constrói a aplicação para produção
- `npm run db:push` - Aplica mudanças no schema do banco
- `npm run db:studio` - Abre o Drizzle Studio

## 🎨 Personalização

O sistema permite personalização completa através do painel administrativo:

- Cores da interface (tema rosa/magenta personalizado)
- Configurações de horário de funcionamento
- Feriados regionais brasileiros
- Timezone (configurado para São Paulo/Brasil)

## 📞 Suporte

Este é um sistema completo e pronto para produção, desenvolvido especificamente para o mercado brasileiro de beleza e estética.

## 📄 Licença

Este projeto é proprietário. Todos os direitos reservados.