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
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { AdminGuard } from '../admin/admin.guard.js';
import { OptionalField } from '../common/optional-field.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';

class SalaDto {
  @IsUUID() cinemaId: string;
  @IsString() @IsNotEmpty() nome: string;
  @IsInt() @Min(1) @Max(26) fileiras: number;
  @IsInt() @Min(1) @Max(50) assentosPorFileira: number;
}

class AtualizarSalaDto {
  @OptionalField() @IsString() @IsNotEmpty() nome?: string;
  @OptionalField() @IsBoolean() ativo?: boolean;
  @OptionalField() @IsInt() @Min(1) @Max(26) fileiras?: number;
  @OptionalField() @IsInt() @Min(1) @Max(50) assentosPorFileira?: number;
}

function assentos(fileiras: number, porFileira: number) {
  return Array.from({ length: fileiras }, (_, row) =>
    Array.from({ length: porFileira }, (_, seat) => ({
      fileira: String.fromCharCode(65 + row),
      numero: seat + 1,
    })),
  ).flat();
}

@Controller('admin/salas')
@UseGuards(AdminGuard)
export class SalasController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  async criar(@Body() dto: SalaDto) {
    const cinema = await this.prisma.cinema.findUnique({
      where: { id: dto.cinemaId },
    });
    if (!cinema) throw new NotFoundException('Cinema não encontrado');
    if (!cinema.ativo) throw new BadRequestException('Cinema inativo');
    const { cinemaId, ...data } = dto;
    return this.prisma.sala.create({
      data: {
        ...data,
        cinema: { connect: { id: cinemaId } },
        assentos: { create: assentos(dto.fileiras, dto.assentosPorFileira) },
      },
      include: { assentos: true },
    });
  }

  @Get()
  listar() {
    return this.prisma.sala.findMany({
      include: { cinema: true },
      orderBy: { nome: 'asc' },
    });
  }

  @Get(':id')
  async obter(@Param('id') id: string) {
    const sala = await this.prisma.sala.findUnique({
      where: { id },
      include: { assentos: true },
    });
    if (!sala) throw new NotFoundException('Sala não encontrada');
    return sala;
  }

  @Patch(':id')
  async atualizar(@Param('id') id: string, @Body() dto: AtualizarSalaDto) {
    const sala = await this.prisma.sala.findUnique({
      where: { id },
      include: { _count: { select: { sessoes: true } } },
    });
    if (!sala) throw new NotFoundException('Sala não encontrada');
    const fileiras = dto.fileiras ?? sala.fileiras;
    const porFileira = dto.assentosPorFileira ?? sala.assentosPorFileira;
    const mudouGrade =
      fileiras !== sala.fileiras || porFileira !== sala.assentosPorFileira;
    if (mudouGrade && sala._count.sessoes > 0) {
      throw new ConflictException(
        'A grade não pode mudar após cadastrar sessões',
      );
    }
    return this.prisma.$transaction(async (tx) => {
      if (mudouGrade) {
        await tx.assento.deleteMany({ where: { salaId: id } });
        await tx.assento.createMany({
          data: assentos(fileiras, porFileira).map((assento) => ({
            ...assento,
            salaId: id,
          })),
        });
      }
      return tx.sala.update({
        where: { id },
        data: dto,
        include: { assentos: true },
      });
    });
  }

  @Delete(':id')
  async excluir(@Param('id') id: string) {
    const sala = await this.prisma.sala.findUnique({
      where: { id },
      include: { _count: { select: { sessoes: true } } },
    });
    if (!sala) throw new NotFoundException('Sala não encontrada');
    if (sala._count.sessoes > 0)
      throw new ConflictException('Sala com sessões não pode ser excluída');
    return this.prisma.$transaction(async (tx) => {
      await tx.assento.deleteMany({ where: { salaId: id } });
      return tx.sala.delete({ where: { id } });
    });
  }
}
