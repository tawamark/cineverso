import {
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  randomBytes,
  scrypt as scryptCallback,
  createHash,
  timingSafeEqual,
} from 'node:crypto';
import { promisify } from 'node:util';
import { PrismaService } from '../prisma/prisma.service.js';

const scrypt = promisify(scryptCallback);

@Injectable()
export class AdminService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    const email = this.config.get<string>('ADMIN_EMAIL');
    const senha = this.config.get<string>('ADMIN_PASSWORD');
    if (!email || !senha) return;
    const existing = await this.prisma.administrador.findUnique({
      where: { email },
    });

    if (existing && (await this.senhaCorresponde(senha, existing.senhaHash))) {
      return;
    }

    const salt = randomBytes(16).toString('hex');
    const hash = (await scrypt(senha, salt, 64)) as Buffer;
    await this.prisma.administrador.upsert({
      where: { email },
      create: { email, senhaHash: `${salt}:${hash.toString('hex')}` },
      update: { senhaHash: `${salt}:${hash.toString('hex')}` },
    });
  }

  async login(email: string, senha: string) {
    const admin = await this.prisma.administrador.findUnique({
      where: { email },
    });
    if (!admin) throw new UnauthorizedException('Credenciais inválidas');
    if (!(await this.senhaCorresponde(senha, admin.senhaHash))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    const token = randomBytes(32).toString('base64url');
    const expiraEm = new Date(Date.now() + 8 * 60 * 60 * 1000);
    await this.prisma.tokenAdmin.create({
      data: {
        administradorId: admin.id,
        hash: createHash('sha256').update(token).digest('hex'),
        expiraEm,
      },
    });
    return { token, expiraEm };
  }

  private async senhaCorresponde(
    senha: string,
    senhaHash: string,
  ): Promise<boolean> {
    const [salt, encoded] = senhaHash.split(':');
    if (!salt || !encoded) return false;

    const expected = Buffer.from(encoded, 'hex');
    const actual = (await scrypt(senha, salt, expected.length)) as Buffer;
    return timingSafeEqual(expected, actual);
  }

  async tokenValido(token: string): Promise<boolean> {
    if (!token) return false;
    const hash = createHash('sha256').update(token).digest('hex');
    return !!(await this.prisma.tokenAdmin.findFirst({
      where: { hash, expiraEm: { gt: new Date() } },
    }));
  }
}
