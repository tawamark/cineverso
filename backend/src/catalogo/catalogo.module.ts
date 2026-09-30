import { Module } from '@nestjs/common';
import {
  CatalogoController,
  SessoesPublicasController,
} from './catalogo.controller.js';
import { CatalogoService } from './catalogo.service.js';

@Module({
  controllers: [CatalogoController, SessoesPublicasController],
  providers: [CatalogoService],
})
export class CatalogoModule {}
