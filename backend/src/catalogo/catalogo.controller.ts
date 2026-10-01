import { Controller, Get, Param } from '@nestjs/common';
import { CatalogoService } from './catalogo.service.js';

@Controller('catalogo')
export class CatalogoController {
  constructor(private readonly catalogo: CatalogoService) {}

  @Get('filmes')
  listarFilmes() {
    return this.catalogo.listarFilmes();
  }

  @Get('filmes/:slug')
  obterFilme(@Param('slug') slug: string) {
    return this.catalogo.obterFilme(slug);
  }
}

@Controller('sessoes')
export class SessoesPublicasController {
  constructor(private readonly catalogo: CatalogoService) {}

  @Get(':id')
  obter(@Param('id') id: string) {
    return this.catalogo.obterSessao(id);
  }

  @Get(':id/assentos')
  assentos(@Param('id') id: string) {
    return this.catalogo.listarAssentos(id);
  }
}
