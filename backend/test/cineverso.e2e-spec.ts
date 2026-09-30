import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('CineVerso API', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    process.env.DATABASE_URL =
      process.env.TEST_DATABASE_URL ??
      'postgresql://usuario:senha@localhost:5433/cineverso_mvp_test';
    if (!new URL(process.env.DATABASE_URL).pathname.endsWith('_test')) {
      throw new Error('O teste exige um banco com nome terminado em _test');
    }
    process.env.ADMIN_EMAIL = 'admin@cineverso.test';
    process.env.ADMIN_PASSWORD = 'senha-de-teste-segura';
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    prisma = module.get(PrismaService);
    await prisma.ingresso.deleteMany();
    await prisma.compra.deleteMany();
    await prisma.sessao.deleteMany();
    await prisma.assento.deleteMany();
    await prisma.sala.deleteMany();
    await prisma.cinema.deleteMany();
    await prisma.filme.deleteMany();
    await prisma.tipoIngresso.deleteMany();
    await prisma.tokenAdmin.deleteMany();
    await prisma.administrador.deleteMany();
    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('requires an administrator token to create a cinema', async () => {
    const denied = await request(app.getHttpServer())
      .post('/admin/cinemas')
      .send({
        nome: 'Cine Centro',
        cidade: 'Porto Alegre',
        endereco: 'Rua A, 1',
      });
    expect(denied.status).toBe(401);

    const login = await request(app.getHttpServer())
      .post('/admin/login')
      .send({ email: 'admin@cineverso.test', senha: 'senha-de-teste-segura' });
    expect(login.status).toBe(201);
    expect(login.body.token).toEqual(expect.any(String));

    const created = await request(app.getHttpServer())
      .post('/admin/cinemas')
      .set('Authorization', `Bearer ${login.body.token}`)
      .send({
        nome: 'Cine Centro',
        cidade: 'Porto Alegre',
        endereco: 'Rua A, 1',
      });
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({
      nome: 'Cine Centro',
      cidade: 'Porto Alegre',
    });
  });

  it('supports administrative CRUD without removing related records', async () => {
    const denied = await request(app.getHttpServer()).get('/admin/filmes');
    expect(denied.status).toBe(401);
    const wrongLogin = await request(app.getHttpServer())
      .post('/admin/login')
      .send({ email: 'admin@cineverso.test', senha: 'errada' });
    expect(wrongLogin.status).toBe(401);
    const login = await request(app.getHttpServer())
      .post('/admin/login')
      .send({ email: 'admin@cineverso.test', senha: 'senha-de-teste-segura' });
    const auth = `Bearer ${login.body.token}`;
    const cinema = await request(app.getHttpServer())
      .post('/admin/cinemas')
      .set('Authorization', auth)
      .send({ nome: 'Temporário', cidade: 'Canoas', endereco: 'Rua C, 3' });
    const nomeNulo = await request(app.getHttpServer())
      .patch(`/admin/cinemas/${cinema.body.id}`)
      .set('Authorization', auth)
      .send({ nome: null });
    expect(nomeNulo.status).toBe(400);
    const cinemaEditado = await request(app.getHttpServer())
      .patch(`/admin/cinemas/${cinema.body.id}`)
      .set('Authorization', auth)
      .send({ nome: 'Temporário 2' });
    expect(cinemaEditado.body.nome).toBe('Temporário 2');
    const sala = await request(app.getHttpServer())
      .post('/admin/salas')
      .set('Authorization', auth)
      .send({
        cinemaId: cinema.body.id,
        nome: 'Única',
        fileiras: 1,
        assentosPorFileira: 1,
      });
    const salaEditada = await request(app.getHttpServer())
      .patch(`/admin/salas/${sala.body.id}`)
      .set('Authorization', auth)
      .send({ nome: 'Renomeada' });
    expect(salaEditada.body.nome).toBe('Renomeada');
    const filme = await request(app.getHttpServer())
      .post('/admin/filmes')
      .set('Authorization', auth)
      .send({ titulo: 'Temporário', duracaoMinutos: 90 });
    const filmeEditado = await request(app.getHttpServer())
      .patch(`/admin/filmes/${filme.body.id}`)
      .set('Authorization', auth)
      .send({ titulo: 'Editado' });
    expect(filmeEditado.body.titulo).toBe('Editado');
    const tipo = await request(app.getHttpServer())
      .post('/admin/tipos-ingresso')
      .set('Authorization', auth)
      .send({
        nome: 'Temporário',
        descontoPercentual: 10,
        fimVigencia: new Date(Date.now() + 604_800_000).toISOString(),
      });
    const tipoEditado = await request(app.getHttpServer())
      .patch(`/admin/tipos-ingresso/${tipo.body.id}`)
      .set('Authorization', auth)
      .send({ descontoPercentual: 25 });
    expect(tipoEditado.body.descontoPercentual).toBe(25);
    const semPrazo = await request(app.getHttpServer())
      .patch(`/admin/tipos-ingresso/${tipo.body.id}`)
      .set('Authorization', auth)
      .send({ fimVigencia: null });
    expect(semPrazo.body.fimVigencia).toBeNull();
    const inicio = new Date(Date.now() + 172_800_000).toISOString();
    const precoExcessivo = await request(app.getHttpServer())
      .post('/admin/sessoes')
      .set('Authorization', auth)
      .send({
        filmeId: filme.body.id,
        salaId: sala.body.id,
        inicio,
        precoBaseCentavos: 2_147_483_648,
      });
    expect(precoExcessivo.status).toBe(400);
    const semFuso = await request(app.getHttpServer())
      .post('/admin/sessoes')
      .set('Authorization', auth)
      .send({
        filmeId: filme.body.id,
        salaId: sala.body.id,
        inicio: inicio.slice(0, -1),
        precoBaseCentavos: 1500,
      });
    expect(semFuso.status).toBe(400);
    const disputasSessao = await Promise.all(
      [0, 1].map(() =>
        request(app.getHttpServer())
          .post('/admin/sessoes')
          .set('Authorization', auth)
          .send({
            filmeId: filme.body.id,
            salaId: sala.body.id,
            inicio,
            precoBaseCentavos: 1500,
          }),
      ),
    );
    expect(disputasSessao.map((response) => response.status).sort()).toEqual([
      201, 409,
    ]);
    const sessao = disputasSessao.find((response) => response.status === 201)!;
    const sessaoEditada = await request(app.getHttpServer())
      .patch(`/admin/sessoes/${sessao.body.id}`)
      .set('Authorization', auth)
      .send({ precoBaseCentavos: 1600 });
    expect(sessaoEditada.body.precoBaseCentavos).toBe(1600);
    for (const [recurso, id] of [
      ['sessoes', sessao.body.id],
      ['tipos-ingresso', tipo.body.id],
      ['filmes', filme.body.id],
      ['salas', sala.body.id],
      ['cinemas', cinema.body.id],
    ]) {
      const listed = await request(app.getHttpServer())
        .get(`/admin/${recurso}`)
        .set('Authorization', auth);
      expect(listed.body).toEqual(
        expect.arrayContaining([expect.objectContaining({ id })]),
      );
      const deleted = await request(app.getHttpServer())
        .delete(`/admin/${recurso}/${id}`)
        .set('Authorization', auth);
      expect(deleted.status).toBe(200);
      const missing = await request(app.getHttpServer())
        .get(`/admin/${recurso}/${id}`)
        .set('Authorization', auth);
      expect(missing.status).toBe(404);
    }
  });

  it('does not move a session while its first seat is being purchased', async () => {
    const login = await request(app.getHttpServer())
      .post('/admin/login')
      .send({ email: 'admin@cineverso.test', senha: 'senha-de-teste-segura' });
    const auth = `Bearer ${login.body.token}`;
    const cinema = await request(app.getHttpServer())
      .post('/admin/cinemas')
      .set('Authorization', auth)
      .send({ nome: 'Corrida', cidade: 'Canoas', endereco: 'Rua D, 4' });
    const salaA = await request(app.getHttpServer())
      .post('/admin/salas')
      .set('Authorization', auth)
      .send({
        cinemaId: cinema.body.id,
        nome: 'A',
        fileiras: 1,
        assentosPorFileira: 1,
      });
    const salaB = await request(app.getHttpServer())
      .post('/admin/salas')
      .set('Authorization', auth)
      .send({
        cinemaId: cinema.body.id,
        nome: 'B',
        fileiras: 1,
        assentosPorFileira: 1,
      });
    const filme = await request(app.getHttpServer())
      .post('/admin/filmes')
      .set('Authorization', auth)
      .send({ titulo: 'Corrida', duracaoMinutos: 90 });
    const tipo = await request(app.getHttpServer())
      .post('/admin/tipos-ingresso')
      .set('Authorization', auth)
      .send({ nome: 'Inteira Corrida', descontoPercentual: 0 });
    const sessao = await request(app.getHttpServer())
      .post('/admin/sessoes')
      .set('Authorization', auth)
      .send({
        filmeId: filme.body.id,
        salaId: salaA.body.id,
        inicio: new Date(Date.now() + 259_200_000).toISOString(),
        precoBaseCentavos: 1000,
      });
    const assentoA = salaA.body.assentos[0].id;
    let compraPendente!: Promise<request.Response>;
    let edicaoPendente!: Promise<request.Response>;
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT "id" FROM "Sessao" WHERE "id" = ${sessao.body.id} FOR UPDATE`;
      compraPendente = request(app.getHttpServer())
        .post('/compras')
        .send({
          sessaoId: sessao.body.id,
          itens: [{ assentoId: assentoA, tipoIngressoId: tipo.body.id }],
        })
        .then((response) => response);
      edicaoPendente = request(app.getHttpServer())
        .patch(`/admin/sessoes/${sessao.body.id}`)
        .set('Authorization', auth)
        .send({ salaId: salaB.body.id })
        .then((response) => response);
      let waiting = 0;
      for (let attempt = 0; attempt < 100 && waiting < 2; attempt++) {
        const rows = await prisma.$queryRaw<Array<{ waiting: number }>>`
          SELECT COUNT(*)::int AS waiting FROM pg_stat_activity
          WHERE datname = 'cineverso_mvp_test' AND wait_event_type = 'Lock' AND pid <> pg_backend_pid()`;
        waiting = rows[0].waiting;
        if (waiting < 2)
          await new Promise((resolve) => setTimeout(resolve, 20));
      }
      expect(waiting).toBeGreaterThanOrEqual(2);
    });
    const [compra, edicao] = await Promise.all([
      compraPendente,
      edicaoPendente,
    ]);
    expect([compra.status, edicao.status]).not.toEqual([201, 200]);
    if (compra.status === 201) {
      const atual = await prisma.sessao.findUniqueOrThrow({
        where: { id: sessao.body.id },
      });
      expect(atual.salaId).toBe(salaA.body.id);
    }
  });

  it('publishes a session and sells marked seats atomically', async () => {
    const login = await request(app.getHttpServer())
      .post('/admin/login')
      .send({ email: 'admin@cineverso.test', senha: 'senha-de-teste-segura' });
    const auth = `Bearer ${login.body.token}`;
    const cinema = await request(app.getHttpServer())
      .post('/admin/cinemas')
      .set('Authorization', auth)
      .send({
        nome: 'Cinema Teste',
        cidade: 'Porto Alegre',
        endereco: 'Rua B, 2',
      });
    const sala = await request(app.getHttpServer())
      .post('/admin/salas')
      .set('Authorization', auth)
      .send({
        cinemaId: cinema.body.id,
        nome: 'Sala 1',
        fileiras: 2,
        assentosPorFileira: 3,
      });
    expect(sala.status).toBe(201);
    const filme = await request(app.getHttpServer())
      .post('/admin/filmes')
      .set('Authorization', auth)
      .send({ titulo: 'Filme Teste', duracaoMinutos: 120, genero: 'Aventura' });
    expect(filme.status).toBe(201);
    const tipo = await request(app.getHttpServer())
      .post('/admin/tipos-ingresso')
      .set('Authorization', auth)
      .send({ nome: `Meia ${Date.now()}`, descontoPercentual: 50 });
    expect(tipo.status).toBe(201);
    const inicio = new Date(Date.now() + 86_400_000).toISOString();
    const sessao = await request(app.getHttpServer())
      .post('/admin/sessoes')
      .set('Authorization', auth)
      .send({
        filmeId: filme.body.id,
        salaId: sala.body.id,
        inicio,
        precoBaseCentavos: 2000,
      });
    expect(sessao.status).toBe(201);
    expect(
      new Date(sessao.body.fim).getTime() - new Date(inicio).getTime(),
    ).toBe(120 * 60_000);

    const catalogo = await request(app.getHttpServer()).get('/catalogo/filmes');
    expect(catalogo.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: filme.body.id, titulo: 'Filme Teste' }),
      ]),
    );
    const assentos = await request(app.getHttpServer()).get(
      `/sessoes/${sessao.body.id}/assentos`,
    );
    expect(assentos.status).toBe(200);
    expect(assentos.body).toHaveLength(6);
    expect(assentos.body[0]).toMatchObject({
      fileira: 'A',
      numero: 1,
      disponivel: true,
    });

    const compra = await request(app.getHttpServer())
      .post('/compras')
      .send({
        sessaoId: sessao.body.id,
        itens: [
          { assentoId: assentos.body[0].id, tipoIngressoId: tipo.body.id },
          { assentoId: assentos.body[1].id, tipoIngressoId: tipo.body.id },
        ],
      });
    expect(compra.status).toBe(201);
    expect(compra.body.totalCentavos).toBe(2000);
    expect(compra.body.codigo).toEqual(expect.any(String));
    expect(compra.body.ingressos).toHaveLength(2);
    expect(compra.body.ingressos[0].precoCentavos).toBe(1000);
    const consulta = await request(app.getHttpServer()).get(
      `/compras/${compra.body.codigo}`,
    );
    expect(consulta.status).toBe(200);
    expect(consulta.body.ingressos).toHaveLength(2);
    const ingresso = await request(app.getHttpServer()).get(
      `/ingressos/${compra.body.ingressos[0].codigo}`,
    );
    expect(ingresso.status).toBe(200);
    expect(ingresso.body.precoCentavos).toBe(1000);
    const ocupado = await request(app.getHttpServer())
      .post('/compras')
      .send({
        sessaoId: sessao.body.id,
        itens: [
          { assentoId: assentos.body[0].id, tipoIngressoId: tipo.body.id },
          { assentoId: assentos.body[2].id, tipoIngressoId: tipo.body.id },
        ],
      });
    expect(ocupado.status).toBe(409);
    const livres = await request(app.getHttpServer()).get(
      `/sessoes/${sessao.body.id}/assentos`,
    );
    expect(livres.body[2].disponivel).toBe(true);

    const disputas = await Promise.all(
      [0, 1].map(() =>
        request(app.getHttpServer())
          .post('/compras')
          .send({
            sessaoId: sessao.body.id,
            itens: [
              { assentoId: assentos.body[2].id, tipoIngressoId: tipo.body.id },
            ],
          }),
      ),
    );
    expect(disputas.map((response) => response.status).sort()).toEqual([
      201, 409,
    ]);

    const sessaoImutavel = await request(app.getHttpServer())
      .patch(`/admin/sessoes/${sessao.body.id}`)
      .set('Authorization', auth)
      .send({ precoBaseCentavos: 3000 });
    expect(sessaoImutavel.status).toBe(409);
    const tipoAlterado = await request(app.getHttpServer())
      .patch(`/admin/tipos-ingresso/${tipo.body.id}`)
      .set('Authorization', auth)
      .send({ descontoPercentual: 0 });
    expect(tipoAlterado.status).toBe(200);
    const compraAntiga = await request(app.getHttpServer()).get(
      `/compras/${compra.body.codigo}`,
    );
    expect(compraAntiga.body.ingressos[0].precoCentavos).toBe(1000);
    const detalhesSessao = await request(app.getHttpServer()).get(
      `/sessoes/${sessao.body.id}`,
    );
    expect(detalhesSessao.body.tiposIngresso).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: tipo.body.id, precoCentavos: 2000 }),
      ]),
    );

    const salaDuplicada = await request(app.getHttpServer())
      .post('/admin/salas')
      .set('Authorization', auth)
      .send({
        cinemaId: cinema.body.id,
        nome: 'Sala 1',
        fileiras: 1,
        assentosPorFileira: 1,
      });
    expect(salaDuplicada.status).toBe(409);
    const cinemaComSala = await request(app.getHttpServer())
      .delete(`/admin/cinemas/${cinema.body.id}`)
      .set('Authorization', auth);
    expect(cinemaComSala.status).toBe(409);
    const inexistente = await request(app.getHttpServer())
      .get('/admin/cinemas/id-inexistente')
      .set('Authorization', auth);
    expect(inexistente.status).toBe(404);
  });
});
