# API CineVerso

Backend do MVP em NestJS, Prisma ORM e PostgreSQL 17. A compra no totem confirma ingressos sem cobrar dinheiro; somente administradores precisam fazer login.

## Preparar e executar

Use Node.js 24.15 ou superior. Na raiz do repositório, execute `docker compose up -d`. Na pasta `backend`, instale as dependências com `npm install`, copie `.env.example` para `.env` e altere `ADMIN_PASSWORD`. Em seguida:

```sh
npm run prisma:generate
npm run db:migrate
npm run start:dev
```

`ADMIN_EMAIL` e `ADMIN_PASSWORD` criam o administrador inicial se o e-mail ainda não existir. Alterar essas variáveis depois não redefine uma senha já gravada. A API escuta na porta `PORT` (padrão 3001). O banco de desenvolvimento usa `DATABASE_URL`.

Para testar, mantenha o Docker Compose ativo e execute `npm test`, `npm run test:e2e`, `npm run lint` e `npm run build`. O teste de API aplica as migrations ao banco `TEST_DATABASE_URL`, cujo nome precisa terminar em `_test`, e limpa suas tabelas antes de cada execução. Nunca aponte `TEST_DATABASE_URL` para um banco com dados que queira conservar.

## Rotas

| Método e rota | Função |
| --- | --- |
| `POST /admin/login` | Recebe `email` e `senha`; devolve token de administrador válido por 8 horas |
| `GET/POST /admin/cinemas` | Lista/cadastra cinemas |
| `GET/PATCH/DELETE /admin/cinemas/:id` | Consulta/edita/exclui cinema |
| `GET/POST /admin/salas` | Lista/cadastra salas e seus assentos |
| `GET/PATCH/DELETE /admin/salas/:id` | Consulta/edita/exclui sala |
| `GET/POST /admin/filmes` | Lista/cadastra filmes |
| `GET/PATCH/DELETE /admin/filmes/:id` | Consulta/edita/exclui filme |
| `GET/POST /admin/tipos-ingresso` | Lista/cadastra tipos de ingresso |
| `GET/PATCH/DELETE /admin/tipos-ingresso/:id` | Consulta/edita/exclui tipo |
| `GET/POST /admin/sessoes` | Lista/cadastra sessões |
| `GET/PATCH/DELETE /admin/sessoes/:id` | Consulta/edita/exclui sessão |
| `GET /catalogo/filmes` | Filmes ativos com sessões futuras publicadas |
| `GET /sessoes/:id` | Sessão pública, cinema, sala e preços por tipo vigente |
| `GET /sessoes/:id/assentos` | Grade de assentos e disponibilidade |
| `POST /compras` | Confirma ingressos para uma sessão |
| `GET /compras/:codigo` | Consulta a compra anônima |
| `GET /ingressos/:codigo` | Consulta um ingresso pelo código |

Todas as rotas `/admin`, exceto `/admin/login`, exigem `Authorization: Bearer <token>`. Não há login de cliente. Cada ingresso e compra recebem códigos aleatórios para consulta; o frontend pode convertê-los em QR codes. A API não gera imagem do QR.

## Dados principais

- Cinema: `nome`, `cidade`, `endereco`, `ativo`.
- Sala: `cinemaId`, `nome`, `fileiras` (1 a 26), `assentosPorFileira` (1 a 50), `ativo`. A grade usa A1, A2 etc. Só pode mudar antes de cadastrar sessões.
- Filme: `titulo`, `duracaoMinutos` e, opcionalmente, `sinopse`, `classificacao`, `genero`, `cartazUrl`, `ativo`.
- Tipo de ingresso: `nome`, `descontoPercentual` (0 a 100), `inicioVigencia`, `fimVigencia`, `ativo`. Datas opcionais de vigência são verificadas na hora da compra.
- Sessão: `filmeId`, `salaId`, `inicio`, `precoBaseCentavos` (0 a 1.000.000), `publicada`. A API calcula `fim` a partir da duração do filme ao cadastrar ou reagendar a sessão. Datas enviadas precisam incluir `Z` ou fuso explícito.

Exemplo de compra, depois de consultar os IDs da sessão, assentos e tipos:

```json
{
  "sessaoId": "uuid-da-sessao",
  "itens": [
    { "assentoId": "uuid-do-assento-A1", "tipoIngressoId": "uuid-do-tipo" },
    { "assentoId": "uuid-do-assento-A2", "tipoIngressoId": "uuid-do-tipo" }
  ]
}
```

Cada compra aceita de 1 a 100 ingressos. O preço de cada ingresso é arredondado ao centavo e fica gravado com a compra. Dois pedidos concorrentes não conseguem ocupar o mesmo assento. Se qualquer assento estiver ocupado, a compra inteira recebe `409 Conflict` e nada é vendido. Dados inválidos recebem `400`, recursos inexistentes `404` e acesso administrativo sem token `401`. Compras confirmadas não podem ser canceladas neste MVP. Registros vinculados ao histórico de compras não podem ser excluídos.
