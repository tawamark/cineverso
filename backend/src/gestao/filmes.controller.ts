import {
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
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
import { AdminGuard } from '../admin/admin.guard.js';
import { OptionalField } from '../common/optional-field.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';

class FilmeDto {
  @IsString() @IsNotEmpty() titulo: string;
  @IsInt() @Min(1) @Max(600) duracaoMinutos: number;
  @IsOptional() @IsString() sinopse?: string;
  @IsOptional() @IsString() classificacao?: string;
  @IsOptional() @IsString() genero?: string;
  @IsOptional() @IsUrl() cartazUrl?: string;
}

class AtualizarFilmeDto {
  @OptionalField() @IsString() @IsNotEmpty() titulo?: string;
  @OptionalField() @IsInt() @Min(1) @Max(600) duracaoMinutos?: number;
  @IsOptional() @IsString() sinopse?: string;
  @IsOptional() @IsString() classificacao?: string;
  @IsOptional() @IsString() genero?: string;
  @IsOptional() @IsUrl() cartazUrl?: string;
  @OptionalField() @IsBoolean() ativo?: boolean;
}

@Controller('admin/filmes')
@UseGuards(AdminGuard)
export class FilmesController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  criar(@Body() dto: FilmeDto) {
    return this.prisma.filme.create({ data: dto });
  }

  @Get()
  listar() {
    return this.prisma.filme.findMany({ orderBy: { titulo: 'asc' } });
  }

  @Get(':id')
  async obter(@Param('id') id: string) {
    const filme = await this.prisma.filme.findUnique({ where: { id } });
    if (!filme) throw new NotFoundException('Filme não encontrado');
    return filme;
  }

  @Patch(':id')
  async atualizar(@Param('id') id: string, @Body() dto: AtualizarFilmeDto) {
    await this.obter(id);
    return this.prisma.filme.update({ where: { id }, data: dto });
  }

  @Delete(':id')
  async excluir(@Param('id') id: string) {
    const filme = await this.prisma.filme.findUnique({
      where: { id },
      include: { _count: { select: { sessoes: true } } },
    });
    if (!filme) throw new NotFoundException('Filme não encontrado');
    if (filme._count.sessoes > 0)
      throw new ConflictException('Filme com sessões não pode ser excluído');
    return this.prisma.filme.delete({ where: { id } });
  }
}
