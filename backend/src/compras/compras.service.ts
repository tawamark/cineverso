import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { precoComDesconto } from '../catalogo/preco.js';
import { CriarCompraDto } from './compras.dto.js';
import { bloquearSessao } from '../common/session-lock.js';

@Injectable()
export class ComprasService {
  constructor(private readonly prisma: PrismaService) {}

  async criar(dto: CriarCompraDto) {
    const assentoIds = dto.itens.map((item) => item.assentoId);
    if (new Set(assentoIds).size !== assentoIds.length) {
      throw new BadRequestException('Assento repetido na compra');
    }
    const tipoIds = [...new Set(dto.itens.map((item) => item.tipoIngressoId))];
    try {
      return await this.prisma.$transaction(async (tx) => {
        await bloquearSessao(tx, dto.sessaoId);
        const sessao = await tx.sessao.findFirst({
          where: {
            id: dto.sessaoId,
            publicada: true,
            inicio: { gt: new Date() },
            filme: { ativo: true },
            sala: { ativo: true, cinema: { ativo: true } },
          },
        });
        if (!sessao) throw new NotFoundException('Sessão não disponível');
        const [assentos, tipos] = await Promise.all([
          tx.assento.findMany({
            where: { id: { in: assentoIds }, salaId: sessao.salaId },
          }),
          tx.tipoIngresso.findMany({ where: { id: { in: tipoIds } } }),
        ]);
        if (assentos.length !== assentoIds.length) {
          throw new BadRequestException('Assento não pertence à sala');
        }
        const agora = new Date();
        const tiposPorId = new Map(tipos.map((tipo) => [tipo.id, tipo]));
        for (const id of tipoIds) {
          const tipo = tiposPorId.get(id);
          if (
            !tipo ||
            !tipo.ativo ||
            (tipo.inicioVigencia && tipo.inicioVigencia > agora) ||
            (tipo.fimVigencia && tipo.fimVigencia < agora)
          ) {
            throw new BadRequestException('Tipo de ingresso indisponível');
          }
        }
        const precos = dto.itens.map((item) =>
          precoComDesconto(
            sessao.precoBaseCentavos,
            tiposPorId.get(item.tipoIngressoId)!.descontoPercentual,
          ),
        );
        const compra = await tx.compra.create({
          data: {
            codigo: randomBytes(18).toString('base64url'),
            sessaoId: sessao.id,
            totalCentavos: precos.reduce((total, preco) => total + preco, 0),
          },
        });
        await tx.ingresso.createMany({
          data: dto.itens.map((item, index) => ({
            codigo: randomBytes(18).toString('base64url'),
            compraId: compra.id,
            sessaoId: sessao.id,
            assentoId: item.assentoId,
            tipoIngressoId: item.tipoIngressoId,
            precoCentavos: precos[index],
          })),
        });
        return tx.compra.findUniqueOrThrow({
          where: { id: compra.id },
          include: {
            ingressos: { include: { assento: true, tipoIngresso: true } },
          },
        });
      });
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Um ou mais assentos já foram vendidos');
      }
      throw error;
    }
  }

  listarCompras() {
    return this.prisma.compra.findMany({
      include: {
        ingressos: { include: { assento: true, tipoIngresso: true } },
        sessao: {
          include: { filme: true, sala: { include: { cinema: true } } },
        },
      },
      orderBy: { criadaEm: 'desc' },
    });
  }

  async obterCompraAdmin(id: string) {
    const compra = await this.prisma.compra.findUnique({
      where: { id },
      include: {
        ingressos: {
          include: { assento: true, tipoIngresso: true },
          orderBy: [{ assento: { fileira: 'asc' } }, { assento: { numero: 'asc' } }],
        },
        sessao: {
          include: { filme: true, sala: { include: { cinema: true } } },
        },
      },
    });
    if (!compra) throw new NotFoundException('Compra não encontrada');
    return compra;
  }

  async obterCompra(codigo: string) {
    const compra = await this.prisma.compra.findUnique({
      where: { codigo },
      include: {
        ingressos: { include: { assento: true, tipoIngresso: true } },
        sessao: {
          include: { filme: true, sala: { include: { cinema: true } } },
        },
      },
    });
    if (!compra) throw new NotFoundException('Compra não encontrada');
    return compra;
  }

  async obterIngresso(codigo: string) {
    const ingresso = await this.prisma.ingresso.findUnique({
      where: { codigo },
      include: {
        assento: true,
        tipoIngresso: true,
        sessao: {
          include: { filme: true, sala: { include: { cinema: true } } },
        },
      },
    });
    if (!ingresso) throw new NotFoundException('Ingresso não encontrado');
    return ingresso;
  }
}
