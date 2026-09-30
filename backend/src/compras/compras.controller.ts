import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ComprasService } from './compras.service.js';
import { CriarCompraDto } from './compras.dto.js';

@Controller('compras')
export class ComprasController {
  constructor(private readonly compras: ComprasService) {}

  @Post()
  criar(@Body() dto: CriarCompraDto) {
    return this.compras.criar(dto);
  }

  @Get(':codigo')
  obter(@Param('codigo') codigo: string) {
    return this.compras.obterCompra(codigo);
  }
}

@Controller('ingressos')
export class IngressosController {
  constructor(private readonly compras: ComprasService) {}

  @Get(':codigo')
  obter(@Param('codigo') codigo: string) {
    return this.compras.obterIngresso(codigo);
  }
}
