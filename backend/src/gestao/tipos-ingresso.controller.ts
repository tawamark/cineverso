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
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { AdminGuard } from '../admin/admin.guard.js';
import { OptionalField } from '../common/optional-field.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';

class TipoDto {
  @IsString() @IsNotEmpty() nome: string;
  @IsInt() @Min(0) @Max(100) descontoPercentual: number;
  @IsOptional()
  @IsDateString()
  @Matches(/(?:Z|[+-]\d{2}:\d{2})$/)
  inicioVigencia?: string | null;
  @IsOptional()
  @IsDateString()
  @Matches(/(?:Z|[+-]\d{2}:\d{2})$/)
  fimVigencia?: string | null;
}

class AtualizarTipoDto {
  @OptionalField() @IsString() @IsNotEmpty() nome?: string;
  @OptionalField() @IsInt() @Min(0) @Max(100) descontoPercentual?: number;
  @IsOptional()
  @IsDateString()
  @Matches(/(?:Z|[+-]\d{2}:\d{2})$/)
  inicioVigencia?: string | null;
  @IsOptional()
  @IsDateString()
  @Matches(/(?:Z|[+-]\d{2}:\d{2})$/)
  fimVigencia?: string | null;
  @OptionalField() @IsBoolean() ativo?: boolean;
}

@Controller('admin/tipos-ingresso')
@UseGuards(AdminGuard)
export class TiposIngressoController {
  constructor(private readonly prisma: PrismaService) {}

  private validarPeriodo(
    inicio?: Date | string | null,
    fim?: Date | string | null,
  ) {
    if (inicio && fim && new Date(inicio) > new Date(fim)) {
      throw new BadRequestException(
        'Fim da vigência deve ser posterior ao início',
      );
    }
  }

  @Post()
  criar(@Body() dto: TipoDto) {
    this.validarPeriodo(dto.inicioVigencia, dto.fimVigencia);
    return this.prisma.tipoIngresso.create({
      data: {
        nome: dto.nome,
        descontoPercentual: dto.descontoPercentual,
        inicioVigencia: dto.inicioVigencia
          ? new Date(dto.inicioVigencia)
          : null,
        fimVigencia: dto.fimVigencia ? new Date(dto.fimVigencia) : null,
      },
    });
  }

  @Get()
  listar() {
    return this.prisma.tipoIngresso.findMany({ orderBy: { nome: 'asc' } });
  }

  @Get(':id')
  async obter(@Param('id') id: string) {
    const tipo = await this.prisma.tipoIngresso.findUnique({ where: { id } });
    if (!tipo) throw new NotFoundException('Tipo de ingresso não encontrado');
    return tipo;
  }

  @Patch(':id')
  async atualizar(@Param('id') id: string, @Body() dto: AtualizarTipoDto) {
    const atual = await this.obter(id);
    this.validarPeriodo(
      dto.inicioVigencia === undefined
        ? atual.inicioVigencia
        : dto.inicioVigencia,
      dto.fimVigencia === undefined ? atual.fimVigencia : dto.fimVigencia,
    );
    return this.prisma.tipoIngresso.update({
      where: { id },
      data: {
        ...dto,
        inicioVigencia:
          dto.inicioVigencia === undefined
            ? undefined
            : dto.inicioVigencia === null
              ? null
              : new Date(dto.inicioVigencia),
        fimVigencia:
          dto.fimVigencia === undefined
            ? undefined
            : dto.fimVigencia === null
              ? null
              : new Date(dto.fimVigencia),
      },
    });
  }

  @Delete(':id')
  async excluir(@Param('id') id: string) {
    const tipo = await this.prisma.tipoIngresso.findUnique({
      where: { id },
      include: { _count: { select: { ingressos: true } } },
    });
    if (!tipo) throw new NotFoundException('Tipo de ingresso não encontrado');
    if (tipo._count.ingressos > 0)
      throw new ConflictException(
        'Tipo utilizado em ingressos não pode ser excluído',
      );
    return this.prisma.tipoIngresso.delete({ where: { id } });
  }
}
