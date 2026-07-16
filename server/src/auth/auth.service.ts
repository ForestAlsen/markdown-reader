import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../user/user.service';
import type { User as SharedUser, AuthResponse } from '@md-reader/shared';
import type { RegisterDtoImpl } from './dto/register.dto';
import type { LoginDtoImpl } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDtoImpl): Promise<AuthResponse> {
    const existing = await this.userService.findByUsername(dto.username);
    if (existing) {
      throw new ConflictException('Username already exists');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.userService.create({
      username: dto.username,
      password: hashed,
      email: dto.email,
    });

    const payload = { sub: user.id, username: user.username };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: this.toSharedUser(user),
    };
  }

  async login(dto: LoginDtoImpl): Promise<AuthResponse> {
    const user = await this.userService.findByUsername(dto.username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, username: user.username };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: this.toSharedUser(user),
    };
  }

  private toSharedUser(user: {
    id: string;
    username: string;
    email?: string;
  }): SharedUser {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
    };
  }
}
