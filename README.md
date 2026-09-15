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

Na primeira execução, instale todas as dependências a partir da raiz do projeto:

```bash
npm install
npm run setup
```

Depois, também a partir da raiz, inicie todo o ambiente de desenvolvimento:

```bash
npm run local
```

Esse comando inicia o PostgreSQL, o backend e o frontend, além de abrir automaticamente `http://localhost:3000` no navegador. O frontend e o backend ficam em modo de desenvolvimento, atualizando automaticamente quando os arquivos forem alterados.

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

## Aplicação online

O link da aplicação será disponibilizado após o deploy.

## Vídeo de apresentação

O link do vídeo de apresentação será adicionado quando o projeto estiver finalizado.

## Sobre o trabalho

Este projeto está sendo desenvolvido como atividade final da disciplina de Programação IV, com o objetivo de criar um MVP funcional utilizando frontend, backend, banco de dados e operações CRUD.
