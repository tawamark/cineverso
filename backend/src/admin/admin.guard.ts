import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AdminService } from './admin.service.js';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly admin: AdminService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authorization = request.headers.authorization ?? '';
    const token = authorization.startsWith('Bearer ')
      ? authorization.slice(7)
      : '';
    if (!(await this.admin.tokenValido(token))) {
      throw new UnauthorizedException('Token de administrador inválido');
    }
    return true;
  }
}
