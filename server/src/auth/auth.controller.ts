import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDtoImpl } from './dto/register.dto';
import { LoginDtoImpl } from './dto/login.dto';
import type { AuthResponse } from '@md-reader/shared';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDtoImpl): Promise<AuthResponse> {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDtoImpl): Promise<AuthResponse> {
    return this.authService.login(dto);
  }
}
