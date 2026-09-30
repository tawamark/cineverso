import { Module } from '@nestjs/common';
import {
  ComprasController,
  IngressosController,
} from './compras.controller.js';
import { ComprasService } from './compras.service.js';

@Module({
  controllers: [ComprasController, IngressosController],
  providers: [ComprasService],
})
export class ComprasModule {}
