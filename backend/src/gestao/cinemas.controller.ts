import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { AdminGuard } from '../admin/admin.guard.js';
import { OptionalField } from '../common/optional-field.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';

class CinemaDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  cidade: string;

  @IsString()
  @IsNotEmpty()
  endereco: string;
}

class AtualizarCinemaDto {
  @OptionalField() @IsString() @IsNotEmpty() nome?: string;
  @OptionalField() @IsString() @IsNotEmpty() cidade?: string;
  @OptionalField() @IsString() @IsNotEmpty() endereco?: string;
  @OptionalField() @IsBoolean() ativo?: boolean;
}

@Controller('admin/cinemas')
@UseGuards(AdminGuard)
export class CinemasController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  criar(@Body() dto: CinemaDto) {
    return this.prisma.cinema.create({ data: dto });
  }

  @Get()
  listar() {
    return this.prisma.cinema.findMany({ orderBy: { nome: 'asc' } });
  }

  @Get(':id')
  async obter(@Param('id') id: string) {
    const cinema = await this.prisma.cinema.findUnique({ where: { id } });
    if (!cinema) throw new NotFoundException('Cinema não encontrado');
    return cinema;
  }

  @Patch(':id')
  atualizar(@Param('id') id: string, @Body() dto: AtualizarCinemaDto) {
    return this.prisma.cinema.update({ where: { id }, data: dto });
  }

  @Delete(':id')
  excluir(@Param('id') id: string) {
    return this.prisma.cinema.delete({ where: { id } });
  }
}
