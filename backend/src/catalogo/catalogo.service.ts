import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { precoComDesconto } from './preco.js';

@Injectable()
export class CatalogoService {
  constructor(private readonly prisma: PrismaService) {}

  listarFilmes() {
    const agora = new Date();
    const sessaoAtiva = {
      publicada: true,
      inicio: { gt: agora },
      sala: { ativo: true, cinema: { ativo: true } },
    };
    return this.prisma.filme.findMany({
      where: { ativo: true, sessoes: { some: sessaoAtiva } },
      include: {
        sessoes: {
          where: sessaoAtiva,
          include: { sala: { include: { cinema: true } } },
          orderBy: { inicio: 'asc' },
        },
      },
      orderBy: { titulo: 'asc' },
    });
  }

  private async sessaoPublica(id: string) {
    const sessao = await this.prisma.sessao.findFirst({
      where: {
        id,
        publicada: true,
        inicio: { gt: new Date() },
        filme: { ativo: true },
        sala: { ativo: true, cinema: { ativo: true } },
      },
      include: { filme: true, sala: { include: { cinema: true } } },
    });
    if (!sessao) throw new NotFoundException('Sessão não disponível');
    return sessao;
  }

  async obterSessao(id: string) {
    const sessao = await this.sessaoPublica(id);
    const agora = new Date();
    const tipos = await this.prisma.tipoIngresso.findMany({
      where: {
        ativo: true,
        OR: [{ inicioVigencia: null }, { inicioVigencia: { lte: agora } }],
        AND: [{ OR: [{ fimVigencia: null }, { fimVigencia: { gte: agora } }] }],
      },
      orderBy: { nome: 'asc' },
    });
    return {
      ...sessao,
      tiposIngresso: tipos.map((tipo) => ({
        ...tipo,
        precoCentavos: precoComDesconto(
          sessao.precoBaseCentavos,
          tipo.descontoPercentual,
        ),
      })),
    };
  }

  async listarAssentos(id: string) {
    const sessao = await this.sessaoPublica(id);
    const [assentos, ocupados] = await Promise.all([
      this.prisma.assento.findMany({
        where: { salaId: sessao.salaId },
        orderBy: [{ fileira: 'asc' }, { numero: 'asc' }],
      }),
      this.prisma.ingresso.findMany({
        where: { sessaoId: id },
        select: { assentoId: true },
      }),
    ]);
    const ocupadosIds = new Set(ocupados.map((ingresso) => ingresso.assentoId));
    return assentos.map((assento) => ({
      ...assento,
      disponivel: !ocupadosIds.has(assento.id),
    }));
  }
}
