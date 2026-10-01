import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsIn,
  IsUUID,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { AdminGuard } from '../admin/admin.guard.js';
import { OptionalField } from '../common/optional-field.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { bloquearSessao } from '../common/session-lock.js';

class SessaoDto {
  @IsUUID() filmeId: string;
  @IsUUID() salaId: string;
  @IsDateString() @Matches(/(?:Z|[+-]\d{2}:\d{2})$/) inicio: string;
  @IsInt() @Min(0) @Max(1_000_000) precoBaseCentavos: number;
  @IsIn(['2D', '3D']) formato: string;
  @IsIn(['DUBLADO', 'LEGENDADO', 'ORIGINAL']) versao: string;
  @OptionalField() @IsBoolean() publicada?: boolean;
}

class AtualizarSessaoDto {
  @OptionalField() @IsUUID() filmeId?: string;
  @OptionalField() @IsUUID() salaId?: string;
  @OptionalField()
  @IsDateString()
  @Matches(/(?:Z|[+-]\d{2}:\d{2})$/)
  inicio?: string;
  @OptionalField() @IsInt() @Min(0) @Max(1_000_000) precoBaseCentavos?: number;
  @OptionalField() @IsIn(['2D', '3D']) formato?: string;
  @OptionalField()
  @IsIn(['DUBLADO', 'LEGENDADO', 'ORIGINAL'])
  versao?: string;
  @OptionalField() @IsBoolean() publicada?: boolean;
}

@Controller('admin/sessoes')
@UseGuards(AdminGuard)
export class SessoesController {
  constructor(private readonly prisma: PrismaService) {}

  private async dados(
    client: Prisma.TransactionClient,
    filmeId: string,
    salaId: string,
    inicioTexto: string,
    ignoreId?: string,
  ) {
    const [filme, sala] = await Promise.all([
      client.filme.findUnique({ where: { id: filmeId } }),
      client.sala.findUnique({
        where: { id: salaId },
        include: { cinema: true },
      }),
    ]);
    if (!filme || !sala)
      throw new NotFoundException('Filme ou sala não encontrados');
    if (!filme.ativo || !sala.ativo || !sala.cinema.ativo) {
      throw new BadRequestException('Filme, sala e cinema devem estar ativos');
    }
    const inicio = new Date(inicioTexto);
    if (inicio <= new Date())
      throw new BadRequestException('A sessão deve começar no futuro');
    const fim = new Date(inicio.getTime() + filme.duracaoMinutos * 60_000);
    const conflito = await client.sessao.findFirst({
      where: {
        salaId,
        id: ignoreId ? { not: ignoreId } : undefined,
        inicio: { lt: fim },
        fim: { gt: inicio },
      },
    });
    if (conflito)
      throw new ConflictException('A sala já tem sessão nesse horário');
    return { inicio, fim };
  }

  @Post()
  async criar(@Body() dto: SessaoDto) {
    const horario = await this.dados(
      this.prisma,
      dto.filmeId,
      dto.salaId,
      dto.inicio,
    );
    return this.prisma.sessao.create({ data: { ...dto, ...horario } });
  }

  @Get()
  listar() {
    return this.prisma.sessao.findMany({
      include: { filme: true, sala: { include: { cinema: true } } },
      orderBy: { inicio: 'asc' },
    });
  }

  @Get(':id')
  async obter(@Param('id') id: string) {
    const sessao = await this.prisma.sessao.findUnique({
      where: { id },
      include: {
        filme: true,
        sala: {
          include: {
            cinema: true,
            assentos: { orderBy: [{ fileira: 'asc' }, { numero: 'asc' }] },
            _count: { select: { assentos: true } },
          },
        },
        ingressos: { select: { assentoId: true } },
        _count: { select: { ingressos: true, compras: true } },
      },
    });
    if (!sessao) throw new NotFoundException('Sessão não encontrada');
    return sessao;
  }

  @Patch(':id')
  async atualizar(@Param('id') id: string, @Body() dto: AtualizarSessaoDto) {
    return this.prisma.$transaction(async (tx) => {
      await bloquearSessao(tx, id);
      const atual = await tx.sessao.findUnique({
        where: { id },
        include: { _count: { select: { compras: true } } },
      });
      if (!atual) throw new NotFoundException('Sessão não encontrada');
      if (
        atual._count.compras > 0 &&
        Object.keys(dto).some((key) => key !== 'publicada')
      ) {
        throw new ConflictException(
          'Sessão com ingressos não pode alterar seus dados de exibição',
        );
      }
      if (atual._count.compras > 0 && dto.publicada === false) {
        throw new ConflictException(
          'Sessão com ingressos não pode ser despublicada',
        );
      }
      const horario =
        dto.filmeId || dto.salaId || dto.inicio
          ? await this.dados(
              tx,
              dto.filmeId ?? atual.filmeId,
              dto.salaId ?? atual.salaId,
              dto.inicio ?? atual.inicio.toISOString(),
              id,
            )
          : {};
      return tx.sessao.update({ where: { id }, data: { ...dto, ...horario } });
    });
  }

  @Delete(':id')
  async excluir(@Param('id') id: string) {
    const atual = await this.prisma.sessao.findUnique({
      where: { id },
      include: { _count: { select: { compras: true } } },
    });
    if (!atual) throw new NotFoundException('Sessão não encontrada');
    if (atual._count.compras > 0)
      throw new ConflictException('Sessão com ingressos não pode ser excluída');
    return this.prisma.sessao.delete({ where: { id } });
  }
}
