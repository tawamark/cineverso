# CineVerso

O CineVerso é um sistema web desenvolvido para a disciplina de Programação IV.

A ideia do projeto é criar uma aplicação para venda de ingressos e gerenciamento de um cinema, permitindo cadastrar filmes, salas, sessões e controlar os ingressos vendidos.

## Integrantes

- Augusto Lima Hagemeier
- Thauan Gustavo Kerber
- Gilmar Antes Junior

## Funcionalidades

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

- Next.js com TypeScript
- NestJS com TypeScript
- Prisma ORM
- PostgreSQL
- Tailwind CSS
- npm

## Estrutura do projeto

O projeto será dividido em frontend e backend.

```text
cineverso/
├── frontend/
├── backend/
├── compose.yaml
├── .gitignore
└── README.md
```

## Como executar

### Banco de dados

Com Docker instalado, inicie o PostgreSQL:

```bash
docker compose up -d
```

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run prisma:generate
npm run start:dev
```

O backend será iniciado em `http://localhost:3001`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend será iniciado em `http://localhost:3000`.

## Aplicação online

O link da aplicação será disponibilizado após o deploy.

## Vídeo de apresentação

O link do vídeo de apresentação será adicionado quando o projeto estiver finalizado.

## Sobre o trabalho

Este projeto está sendo desenvolvido como atividade final da disciplina de Programação IV, com o objetivo de criar um MVP funcional utilizando frontend, backend, banco de dados e operações CRUD.
