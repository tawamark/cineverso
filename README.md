# CineVerso

O CineVerso é um sistema web desenvolvido para a disciplina de Programação IV.

A aplicação reúne um catálogo público para escolha de filmes e ingressos e um painel administrativo para gerenciar a operação do cinema.

> **Status:** MVP full stack funcional em desenvolvimento, com frontend, API e banco de dados integrados.

## Integrantes

- Augusto Lima Hagemeier
- Thauan Gustavo Kerber
- Gilmar Antes Junior

## Funcionalidades

O sistema terá como principais funcionalidades:

- Catálogo público com filmes em cartaz e lançamentos em breve
- Busca pública por título ou gênero
- Detalhes do filme e consulta de sessões disponíveis
- Escolha de poltronas e tipos de ingresso
- Confirmação simulada da compra, sem processamento de pagamento
- Consulta posterior de ingressos pelo código da compra
- Autenticação do administrador
- Visão geral com indicadores operacionais
- Cadastro e gerenciamento de cinemas, salas, filmes, sessões e tipos de ingresso
- Consulta de vendas, ingressos e ocupação das salas
- URLs amigáveis para filmes
- Validação dos formulários e páginas de erro 404, 500 e 503

## Tecnologias

- **Frontend:** Next.js, React, TypeScript e Tailwind CSS
- **Backend:** NestJS e TypeScript
- **ORM:** Prisma ORM
- **Banco de dados:** PostgreSQL 17
- **Gerenciador de pacotes:** npm
- **Ambiente local:** Docker Compose

## Identidade visual

A identidade utiliza a fonte Sora, ícones Lucide e a paleta registrada em [docs/color-palette.md](docs/color-palette.md).

## Estrutura do projeto

```text
cineverso/
├── frontend/          # Aplicação Next.js
├── backend/           # API NestJS e configuração do Prisma
├── docs/              # Documentação funcional, visual e técnica
├── compose.yaml       # PostgreSQL para desenvolvimento local
├── package.json       # Comandos integrados do projeto
├── .gitignore
└── README.md
```

## Pré-requisitos

Antes de iniciar, instale:

- Node.js 24.15 ou superior
- npm
- Docker Desktop com Docker Compose
- Git

## Configuração inicial

Clone o repositório e entre na pasta do projeto:

```bash
git clone https://github.com/tawamark/cineverso.git
cd cineverso
```

Instale as dependências da raiz, do frontend e do backend:

```bash
npm install
npm run setup
```

O comando `setup` também gera o Prisma Client. O arquivo local `backend/.env` deve seguir o modelo disponível em `backend/.env.example`:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/cineverso"
PORT=3001
ADMIN_EMAIL="admin@cineverso.local"
ADMIN_PASSWORD="troque-esta-senha-antes-de-usar"
TEST_DATABASE_URL="postgresql://usuario:senha@localhost:5433/cineverso_mvp_test"
```

O arquivo `.env` não é enviado ao Git.

## Executando localmente

Na raiz do projeto, execute:

```bash
npm run local
```

Esse comando inicia o PostgreSQL, o backend e o frontend, além de abrir automaticamente `http://localhost:3000` no navegador. O frontend e o backend ficam em modo de desenvolvimento, atualizando automaticamente quando os arquivos forem alterados.

Serviços disponíveis:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- PostgreSQL: `localhost:5432`

Para encerrar os servidores, pressione `Ctrl+C`. Para também parar o PostgreSQL, execute:

```bash
npm run local:stop
```

### Execução separada

Se necessário, cada parte também pode ser iniciada separadamente:

```bash
cd frontend
npm run dev
```

```bash
cd backend
npm run start:dev
```

## Comandos disponíveis

Execute os comandos abaixo na raiz do projeto:

| Comando | Descrição |
| --- | --- |
| `npm run setup` | Instala as dependências do frontend e backend e gera o Prisma Client |
| `npm run local` | Inicia banco, backend e frontend e abre o navegador |
| `npm run local:stop` | Para o PostgreSQL local |
| `npm run lint` | Executa o lint do frontend e backend |
| `npm run build` | Gera o build do frontend e backend |
| `npm test` | Executa os testes unitários do backend |
| `npm run test:e2e` | Aplica as migrations e testa a API em banco separado |

## Banco de dados

O schema Prisma e as migrations incluem cinemas, salas e assentos, filmes, sessões, tipos de ingresso, compras e ingressos. Depois de configurar `backend/.env`, execute `npm run db:migrate` na pasta `backend`. A [documentação da API](backend/README.md) descreve rotas, autenticação administrativa e testes com banco separado.

## Documentação

- [Visão funcional do MVP](docs/mvp.md)
- [Arquitetura e fluxos](docs/architecture.md)
- [Deploy](docs/deployment.md)
- [Paleta de cores](docs/color-palette.md)
- [API do backend](backend/README.md)

## Aplicação online

- Aplicação: [https://cineverso-topaz.vercel.app/](https://cineverso-topaz.vercel.app/)
- API: [https://cineverso-api.onrender.com](https://cineverso-api.onrender.com)
- Verificação da API: [https://cineverso-api.onrender.com/health](https://cineverso-api.onrender.com/health)

Como a API utiliza o plano gratuito da Render, o primeiro acesso após um período sem uso pode levar alguns segundos.

### Acesso administrativo para avaliação

- Login: [https://cineverso-topaz.vercel.app/admin/login](https://cineverso-topaz.vercel.app/admin/login)
- E-mail: `admin@cineverso.local`
- Senha: `CineVerso@2026`

Esse acesso possui permissões administrativas completas e foi disponibilizado exclusivamente para avaliação acadêmica do MVP.

## Vídeo de apresentação

O link do vídeo de apresentação será adicionado quando o projeto estiver finalizado.

## Sobre o trabalho

Este projeto está sendo desenvolvido como atividade final da disciplina de Programação IV, com o objetivo de criar um MVP funcional utilizando frontend, backend, banco de dados e operações CRUD.
