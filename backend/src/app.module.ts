import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { CatalogoModule } from './catalogo/catalogo.module.js';
import { AdminModule } from './admin/admin.module.js';
import { GestaoModule } from './gestao/gestao.module.js';
import { ComprasModule } from './compras/compras.module.js';
import { APP_FILTER } from '@nestjs/core';
import { PrismaExceptionFilter } from './prisma/prisma-exception.filter.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CatalogoModule,
    AdminModule,
    GestaoModule,
    ComprasModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: PrismaExceptionFilter },
  ],
})
export class AppModule {}
