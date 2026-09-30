-- CreateTable
CREATE TABLE "Administrador" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Administrador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenAdmin" (
    "id" TEXT NOT NULL,
    "administradorId" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "expiraEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TokenAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cinema" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Cinema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sala" (
    "id" TEXT NOT NULL,
    "cinemaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "fileiras" INTEGER NOT NULL,
    "assentosPorFileira" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Sala_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assento" (
    "id" TEXT NOT NULL,
    "salaId" TEXT NOT NULL,
    "fileira" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,

    CONSTRAINT "Assento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Filme" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "sinopse" TEXT,
    "duracaoMinutos" INTEGER NOT NULL,
    "classificacao" TEXT,
    "genero" TEXT,
    "cartazUrl" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Filme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoIngresso" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descontoPercentual" INTEGER NOT NULL,
    "inicioVigencia" TIMESTAMP(3),
    "fimVigencia" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TipoIngresso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sessao" (
    "id" TEXT NOT NULL,
    "filmeId" TEXT NOT NULL,
    "salaId" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fim" TIMESTAMP(3) NOT NULL,
    "precoBaseCentavos" INTEGER NOT NULL,
    "publicada" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Sessao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Compra" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "sessaoId" TEXT NOT NULL,
    "totalCentavos" INTEGER NOT NULL,
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ingresso" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "compraId" TEXT NOT NULL,
    "sessaoId" TEXT NOT NULL,
    "assentoId" TEXT NOT NULL,
    "tipoIngressoId" TEXT NOT NULL,
    "precoCentavos" INTEGER NOT NULL,

    CONSTRAINT "Ingresso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Administrador_email_key" ON "Administrador"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TokenAdmin_hash_key" ON "TokenAdmin"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "Sala_cinemaId_nome_key" ON "Sala"("cinemaId", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "Assento_salaId_fileira_numero_key" ON "Assento"("salaId", "fileira", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "TipoIngresso_nome_key" ON "TipoIngresso"("nome");

-- CreateIndex
CREATE INDEX "Sessao_salaId_inicio_fim_idx" ON "Sessao"("salaId", "inicio", "fim");

-- CreateIndex
CREATE UNIQUE INDEX "Compra_codigo_key" ON "Compra"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Ingresso_codigo_key" ON "Ingresso"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Ingresso_sessaoId_assentoId_key" ON "Ingresso"("sessaoId", "assentoId");

-- AddForeignKey
ALTER TABLE "TokenAdmin" ADD CONSTRAINT "TokenAdmin_administradorId_fkey" FOREIGN KEY ("administradorId") REFERENCES "Administrador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sala" ADD CONSTRAINT "Sala_cinemaId_fkey" FOREIGN KEY ("cinemaId") REFERENCES "Cinema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assento" ADD CONSTRAINT "Assento_salaId_fkey" FOREIGN KEY ("salaId") REFERENCES "Sala"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sessao" ADD CONSTRAINT "Sessao_filmeId_fkey" FOREIGN KEY ("filmeId") REFERENCES "Filme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sessao" ADD CONSTRAINT "Sessao_salaId_fkey" FOREIGN KEY ("salaId") REFERENCES "Sala"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compra" ADD CONSTRAINT "Compra_sessaoId_fkey" FOREIGN KEY ("sessaoId") REFERENCES "Sessao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingresso" ADD CONSTRAINT "Ingresso_compraId_fkey" FOREIGN KEY ("compraId") REFERENCES "Compra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingresso" ADD CONSTRAINT "Ingresso_sessaoId_fkey" FOREIGN KEY ("sessaoId") REFERENCES "Sessao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingresso" ADD CONSTRAINT "Ingresso_assentoId_fkey" FOREIGN KEY ("assentoId") REFERENCES "Assento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingresso" ADD CONSTRAINT "Ingresso_tipoIngressoId_fkey" FOREIGN KEY ("tipoIngressoId") REFERENCES "TipoIngresso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
