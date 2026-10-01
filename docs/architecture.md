# Arquitetura e fluxos

## Componentes

```text
Navegador
   │
   ▼
Frontend Next.js :3000
   │ HTTP/JSON
   ▼
Backend NestJS :3001
   │ Prisma ORM
   ▼
PostgreSQL :5432
```

- O frontend utiliza Next.js, React, TypeScript e Tailwind CSS.
- O backend expõe uma API REST com NestJS e validação global dos dados recebidos.
- O Prisma gerencia o acesso ao PostgreSQL e as migrations do banco.
- O Docker Compose fornece o banco de desenvolvimento local.

## Fluxo público de ingressos

1. O cliente consulta o catálogo.
2. Seleciona um filme e uma sessão futura publicada.
3. A interface consulta o mapa atualizado da sala.
4. O cliente escolhe as poltronas e o tipo de ingresso de cada uma.
5. A API valida a disponibilidade e grava a compra e os ingressos em uma transação.
6. O sistema devolve códigos que permitem consultar a compra posteriormente.

## Fluxo administrativo

1. O administrador entra com email e senha.
2. A API devolve um token com validade de oito horas.
3. O frontend envia o token nas requisições administrativas.
4. O administrador gerencia a programação e consulta vendas e ocupação.

## Organização do frontend

- O grupo de rotas públicas contém catálogo, detalhes do filme, seleção de ingressos e consulta de compra.
- O grupo administrativo contém login, layout protegido, visão geral e módulos de gerenciamento.
- Componentes compartilhados concentram cabeçalhos, tabelas, seletores, modais, toasts, validações e estados vazios.
- A URL base da API é configurada por `NEXT_PUBLIC_API_URL`.

## Organização do backend

- `admin`: autenticação administrativa.
- `catalogo`: consultas públicas de filmes, sessões e assentos.
- `compras`: confirmação e consulta de compras e ingressos.
- `gestao`: operações administrativas do cinema.
- `prisma`: conexão e acesso ao banco de dados.
