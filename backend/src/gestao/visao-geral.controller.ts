import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../admin/admin.guard.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Controller('admin/visao-geral')
@UseGuards(AdminGuard)
export class VisaoGeralController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async obter() {
    const agora = new Date();
    const [filmesAtivos, sessoesFuturas, ingressosVendidos, vendas, vendasRecentes, proximasSessoes] =
      await Promise.all([
        this.prisma.filme.count({ where: { ativo: true } }),
        this.prisma.sessao.count({ where: { publicada: true, inicio: { gt: agora } } }),
        this.prisma.ingresso.count(),
        this.prisma.compra.aggregate({ _sum: { totalCentavos: true }, _count: true }),
        this.prisma.compra.findMany({
          take: 5,
          orderBy: { criadaEm: 'desc' },
          include: {
            sessao: { include: { filme: true } },
            _count: { select: { ingressos: true } },
          },
        }),
        this.prisma.sessao.findMany({
          where: { publicada: true, inicio: { gt: agora } },
          take: 5,
          orderBy: { inicio: 'asc' },
          include: {
            filme: true,
            sala: { include: { cinema: true } },
            _count: { select: { ingressos: true } },
          },
        }),
      ]);

    return {
      estatisticas: {
        filmesAtivos,
        sessoesFuturas,
        ingressosVendidos,
        vendasRealizadas: vendas._count,
        faturamentoCentavos: vendas._sum.totalCentavos ?? 0,
      },
      vendasRecentes,
      proximasSessoes,
    };
  }
}
