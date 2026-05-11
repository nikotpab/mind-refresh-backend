import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(pass, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      name: user.name,
      department: user.department,
    };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department || null,
        photoUrl: user.photoUrl || '/default-avatar.png',
      },
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return this.login({
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        department: payload.department,
      });
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async register(data: any) {
    const { email, password, name, role, department } = data;

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await this.usersService.create({
      email,
      passwordHash,
      name,
      role,
      department: department || null,
      photoUrl: '/default-avatar.png',
    });

    const { passwordHash: _, ...result } = newUser;
    return result;
  }
}
