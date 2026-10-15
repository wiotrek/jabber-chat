import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service.js';
import { toPublicUser, type PublicUser } from '../users/user.presenter.js';
import type { RegisterDto } from './dto/register.dto.js';
import type { LoginDto } from './dto/login.dto.js';
import type { JwtPayload } from './jwt-payload.interface.js';

export interface AuthResult {
  accessToken: string;
  user: PublicUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email is already registered.');
    }

    const user = await this.usersService.create({
      email: dto.email,
      username: dto.username,
      password: dto.password,
      displayName: dto.displayName,
    });

    return this.buildAuthResult(user.id, user.email, user.username, toPublicUser(user));
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const passwordMatches = await user.comparePassword(dto.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return this.buildAuthResult(user.id, user.email, user.username, toPublicUser(user));
  }

  private buildAuthResult(
    id: string,
    email: string,
    username: string,
    user: PublicUser,
  ): AuthResult {
    const payload: JwtPayload = { sub: id, email, username };
    return { accessToken: this.jwtService.sign(payload), user };
  }
}
