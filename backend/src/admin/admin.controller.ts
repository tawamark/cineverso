import { Body, Controller, Post } from '@nestjs/common';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { AdminService } from './admin.service.js';

class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  senha: string;
}

@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.admin.login(dto.email, dto.senha);
  }
}
