import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '../generated/prisma/client.js';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ): void {
    const response = host.switchToHttp().getResponse<Response>();
    const errors: Record<string, [number, string]> = {
      P2002: [HttpStatus.CONFLICT, 'Registro duplicado'],
      P2003: [
        HttpStatus.CONFLICT,
        'Registro possui vínculos e não pode ser excluído',
      ],
      P2014: [
        HttpStatus.CONFLICT,
        'Registro possui vínculos e não pode ser excluído',
      ],
      P2025: [HttpStatus.NOT_FOUND, 'Registro não encontrado'],
    };
    const sobreposicao =
      exception.code === 'P2039' && exception.message.includes('23P01');
    const [statusCode, message] = sobreposicao
      ? [HttpStatus.CONFLICT, 'A sala já tem sessão nesse horário']
      : (errors[exception.code] ?? [
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Erro ao acessar o banco',
        ]);
    if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(`Erro Prisma ${exception.code}: ${exception.message}`);
    }
    response.status(statusCode).json({ statusCode, message });
  }
}
