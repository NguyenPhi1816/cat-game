import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  async register(dto: RegisterDto) {
    // TODO: hash password, insert into users table
    return { message: 'User registered', email: dto.email };
  }

  async login(dto: LoginDto) {
    // TODO: validate credentials, return JWT
    return { accessToken: 'jwt-token-placeholder' };
  }

  async validateUser(email: string, password: string) {
    // TODO: look up user and verify password hash
    return null;
  }
}
