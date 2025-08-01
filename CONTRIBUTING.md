# 🤝 Guia de Contribuição - Beauty App

## 📋 Código de Conduta

Este projeto adere a padrões profissionais de desenvolvimento. Esperamos que todos os contribuidores mantenham:

- Comunicação respeitosa e profissional
- Foco na qualidade e funcionalidade
- Respeito às decisões arquiteturais existentes
- Documentação clara de mudanças

## 🛠️ Configuração do Ambiente de Desenvolvimento

### Pré-requisitos
- Node.js 18+
- PostgreSQL 14+
- Git
- npm ou yarn

### Setup Local
```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/beauty-app.git
cd beauty-app

# 2. Instale dependências
npm install

# 3. Configure ambiente
cp .env.example .env
# Edite .env com suas configurações de banco

# 4. Setup do banco
npm run db:push

# 5. Inicie o desenvolvimento
npm run dev
```

## 🏗️ Arquitetura do Projeto

### Estrutura de Diretórios
```
beauty-app/
├── client/src/          # Frontend React
│   ├── components/      # Componentes reutilizáveis
│   ├── pages/          # Páginas principais
│   ├── hooks/          # Hooks customizados
│   └── lib/            # Utilitários
├── server/             # Backend Express
├── shared/             # Types compartilhados
└── docs/              # Documentação
```

### Tecnologias Principais
- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Banco**: PostgreSQL + Drizzle ORM
- **UI**: Tailwind CSS + shadcn/ui
- **Estado**: TanStack Query

## 📝 Padrões de Código

### TypeScript
- Use interfaces para objetos complexos
- Evite `any`, prefira tipos específicos
- Utilize generics quando apropriado
- Documente funções complexas com JSDoc

### React
- Componentes funcionais com hooks
- Props tipadas com interfaces
- Use memo() para otimização quando necessário
- Prefira custom hooks para lógica reutilizável

### CSS/Styling
- Tailwind CSS como padrão
- Componentes shadcn/ui para UI consistente
- Variáveis CSS para temas personalizáveis
- Mobile-first approach

### Banco de Dados
- Drizzle ORM para todas as operações
- Schemas tipados e validados
- Migrações versionadas
- Relacionamentos explícitos

## 🔀 Fluxo de Contribuição

### 1. Issues
- Verifique issues existentes antes de criar nova
- Use templates apropriados
- Inclua passos para reproduzir bugs
- Adicione labels relevantes

### 2. Branches
```bash
# Padrão de nomenclatura
feature/nome-da-funcionalidade
bugfix/descricao-do-bug
hotfix/correcao-urgente
```

### 3. Commits
```bash
# Formato de commit
type(scope): description

# Exemplos
feat(admin): add appointment editing
fix(mobile): resolve calendar navigation
docs(readme): update installation guide
```

### 4. Pull Requests
- Título descritivo e claro
- Descrição detalhada das mudanças
- Screenshots para mudanças visuais
- Testes das funcionalidades alteradas
- Review de pelo menos um maintainer

## 🧪 Testes

### Testes Manuais
- Teste em múltiplos dispositivos
- Verifique responsividade
- Teste fluxos completos de usuário
- Valide performance

### Checklist de Teste
- [ ] Interface responsiva (mobile/desktop)
- [ ] Navegação entre páginas funciona
- [ ] CRUD operations funcionando
- [ ] Validações de formulário
- [ ] Estados de loading/error
- [ ] Performance aceitável

## 📋 Tipos de Contribuição

### 🐛 Bug Fixes
- Correções de funcionalidades existentes
- Melhorias de performance
- Correções de responsividade
- Fix de validações

### ✨ Novas Features
- Funcionalidades do roadmap
- Melhorias de UX/UI
- Otimizações técnicas
- Integrações externas

### 📚 Documentação
- Atualizações do README
- Guias de uso
- Documentação técnica
- Comentários no código

### 🎨 Design/UI
- Melhorias visuais
- Componentes novos
- Temas e customizações
- Acessibilidade

## 🚀 Deploy e Release

### Ambiente de Staging
- Todas as mudanças devem passar por staging
- Testes completos antes do merge
- Validação de integrações

### Release Process
1. Merge para `main`
2. Deploy automático
3. Smoke tests em produção
4. Comunicação de mudanças

## 📞 Comunicação

### Canais
- Issues do GitHub para bugs/features
- Discussions para perguntas gerais
- Email para questões sensíveis

### Resposta
- Issues: até 48h para primeira resposta
- PRs: review em até 72h
- Bugs críticos: resposta imediata

## 🎯 Roadmap e Prioridades

### Alta Prioridade
- Bugs críticos
- Problemas de performance
- Questões de segurança
- Funcionalidades core

### Média Prioridade
- Melhorias de UX
- Novas funcionalidades menores
- Otimizações
- Documentação

### Baixa Prioridade
- Nice-to-have features
- Refatorações não críticas
- Experimentações

## 📖 Recursos Úteis

### Documentação Técnica
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Drizzle ORM](https://orm.drizzle.team)

### Ferramentas de Desenvolvimento
- VS Code + extensões TypeScript/React
- PostgreSQL client (pgAdmin, DBeaver)
- Git client
- Browser DevTools

## 🏆 Reconhecimento

Contribuidores são reconhecidos através de:
- Menção no CHANGELOG
- Profile na seção de contribuidores
- Participação nas decisões técnicas
- Feedback direto dos maintainers

Obrigado por contribuir com a Beauty App! 🙏