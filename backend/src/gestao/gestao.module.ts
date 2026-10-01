import { Module } from '@nestjs/common';
import { AdminModule } from '../admin/admin.module.js';
import { CinemasController } from './cinemas.controller.js';
import { SalasController } from './salas.controller.js';
import { FilmesController } from './filmes.controller.js';
import { TiposIngressoController } from './tipos-ingresso.controller.js';
import { SessoesController } from './sessoes.controller.js';
import { VisaoGeralController } from './visao-geral.controller.js';

@Module({
  imports: [AdminModule],
  controllers: [
    CinemasController,
    SalasController,
    FilmesController,
    TiposIngressoController,
    SessoesController,
    VisaoGeralController,
  ],
})
export class GestaoModule {}
