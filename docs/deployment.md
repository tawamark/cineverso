# Deploy

O ambiente online do CineVerso utiliza três serviços:

- Vercel para o frontend Next.js.
- Render para a API NestJS.
- Neon para o banco PostgreSQL.

## Endereços publicados

- Frontend: [https://cineverso-topaz.vercel.app](https://cineverso-topaz.vercel.app)
- API: [https://cineverso-api.onrender.com](https://cineverso-api.onrender.com)
- Health check: [https://cineverso-api.onrender.com/health](https://cineverso-api.onrender.com/health)

## Ordem de configuração

1. Criar o banco no Neon e copiar sua string de conexão.
2. Criar o serviço da API na Render usando o `render.yaml` da raiz.
3. Informar na Render `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` e `CORS_ORIGINS`.
4. Criar o projeto do frontend na Vercel com diretório raiz `frontend`.
5. Informar na Vercel `NEXT_PUBLIC_API_URL` com a URL pública da Render.
6. Atualizar `CORS_ORIGINS` na Render com a URL pública da Vercel.
7. testar catálogo, login administrativo e confirmação de ingressos no ambiente online.

## Variáveis da API

```env
DATABASE_URL="postgresql://..."
CORS_ORIGINS="https://cineverso-topaz.vercel.app"
ADMIN_EMAIL="admin@exemplo.com"
ADMIN_PASSWORD="uma-senha-forte"
```

Mais de uma origem pode ser permitida separando os endereços por vírgula. As credenciais e a conexão do banco devem ser cadastradas diretamente nos painéis dos serviços e nunca enviadas ao Git.

## Variável do frontend

```env
NEXT_PUBLIC_API_URL="https://cineverso-api.onrender.com"
```

## Inicialização da API

A Render executa automaticamente as migrations antes de iniciar a API. O endpoint `GET /health` é usado para verificar a disponibilidade do serviço.

No plano gratuito, o primeiro acesso depois de um período sem uso pode demorar enquanto a API é iniciada novamente.
As consultas de leitura do frontend repetem automaticamente a conexão durante esse período.
