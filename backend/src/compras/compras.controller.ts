import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../admin/admin.guard.js';
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

@Controller('admin/compras')
@UseGuards(AdminGuard)
export class AdminComprasController {
  constructor(private readonly compras: ComprasService) {}

  @Get()
  listar() {
    return this.compras.listarCompras();
  }

  @Get(':id')
  obter(@Param('id') id: string) {
    return this.compras.obterCompraAdmin(id);
  }
}
