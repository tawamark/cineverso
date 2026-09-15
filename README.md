# CineVerso

O CineVerso é um sistema web desenvolvido para a disciplina de Programação IV.

A ideia do projeto é criar uma aplicação para venda de ingressos e gerenciamento de um cinema, permitindo cadastrar filmes, salas, sessões e controlar os ingressos vendidos.

> **Status:** ambiente inicial configurado. As funcionalidades do produto ainda não foram implementadas.

## Integrantes

- Augusto Lima Hagemeier
- Thauan Gustavo Kerber
- Gilmar Antes Junior

## Funcionalidades planejadas

O sistema terá como principais funcionalidades:

- Cadastro de filmes
- Edição e exclusão de filmes
- Cadastro de salas
- Gerenciamento das salas
- Cadastro de sessões
- Gerenciamento de horários e valores das sessões
- Venda de ingressos
- Consulta das sessões disponíveis

## Tecnologias

- **Frontend:** Next.js, React, TypeScript e Tailwind CSS
- **Backend:** NestJS e TypeScript
- **ORM:** Prisma ORM
- **Banco de dados:** PostgreSQL 17
- **Gerenciador de pacotes:** npm
- **Ambiente local:** Docker Compose

## Estrutura do projeto

```text
cineverso/
├── frontend/          # Aplicação Next.js
├── backend/           # API NestJS e configuração do Prisma
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
| `npm test` | Executa os testes do backend |

## Banco de dados

O Prisma está configurado para PostgreSQL, mas o schema ainda não possui entidades. A modelagem do banco e as migrations serão realizadas em uma próxima etapa.

## Aplicação online

O link da aplicação será disponibilizado após o deploy.

## Vídeo de apresentação

O link do vídeo de apresentação será adicionado quando o projeto estiver finalizado.

## Sobre o trabalho

Este projeto está sendo desenvolvido como atividade final da disciplina de Programação IV, com o objetivo de criar um MVP funcional utilizando frontend, backend, banco de dados e operações CRUD.
