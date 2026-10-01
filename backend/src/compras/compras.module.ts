import { Module } from '@nestjs/common';
import {
  AdminComprasController,
  ComprasController,
  IngressosController,
} from './compras.controller.js';
import { ComprasService } from './compras.service.js';
import { AdminModule } from '../admin/admin.module.js';

@Module({
  imports: [AdminModule],
  controllers: [ComprasController, IngressosController, AdminComprasController],
  providers: [ComprasService],
})
export class ComprasModule {}
