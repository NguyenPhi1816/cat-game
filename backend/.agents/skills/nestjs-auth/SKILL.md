---
name: nestjs-auth
description: Use when implementing or modifying authentication in the backend. Covers JWT strategy, guards, password hashing with bcrypt, protected routes, and extracting the current user from a request. Auth module is at src/auth/.
version: 1.0.0
license: MIT
---

# NestJS Authentication

**Use this skill for any work involving authentication, JWT tokens, guards, or protected routes in the `backend` project.**

The auth module lives at `src/auth/`. It currently has stubs for `register`, `login`, and `validateUser` — this skill covers how to implement them fully.

## Dependencies to Install

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install -D @types/passport-jwt @types/bcrypt
```

## Configuration

Add JWT secret to `.env`:

```
JWT_SECRET=your-secret-here
JWT_EXPIRES_IN=7d
```

## Implementation

### 1. Update `AuthService` (`src/auth/auth.service.ts`)

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async register(dto: RegisterDto) {
    const hash = await bcrypt.hash(dto.password, 10);
    // TODO: insert { email: dto.email, passwordHash: hash } into users table
    return { message: 'User registered', email: dto.email };
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const payload = { sub: user.id, email: user.email };
    return { accessToken: this.jwtService.sign(payload) };
  }

  async validateUser(email: string, password: string) {
    // TODO: fetch user from DB by email
    // const user = await this.usersRepo.findByEmail(email);
    // if (!user) return null;
    // const valid = await bcrypt.compare(password, user.passwordHash);
    // return valid ? user : null;
    return null;
  }
}
```

### 2. JWT Strategy (`src/auth/jwt.strategy.ts`)

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: { sub: string; email: string }) {
    // Return value is attached to request.user
    return { userId: payload.sub, email: payload.email };
  }
}
```

### 3. JWT Guard (`src/auth/jwt-auth.guard.ts`)

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

### 4. `AuthModule` (`src/auth/auth.module.ts`)

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtAuthGuard, JwtModule],  // export guard so other modules can use it
})
export class AuthModule {}
```

## Protecting Routes

Apply `JwtAuthGuard` to any controller or individual route:

```typescript
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// Protect the entire controller
@UseGuards(JwtAuthGuard)
@Controller('cats')
export class CatController {
  @Get('my-cats')
  getMyCats(@Request() req) {
    const { userId } = req.user;   // set by JwtStrategy.validate()
    return this.catService.findByPlayerId(userId);
  }
}

// Or protect a single route
@Controller('players')
export class PlayerController {
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req) {
    return this.playerService.findById(req.user.userId);
  }
}
```

## Current User Decorator

Create a reusable decorator to avoid `@Request() req` everywhere:

```typescript
// src/auth/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;   // { userId: string, email: string }
  },
);
```

Usage:

```typescript
@UseGuards(JwtAuthGuard)
@Get('me')
getProfile(@CurrentUser() user: { userId: string; email: string }) {
  return this.playerService.findById(user.userId);
}
```

## Auth Controller (`src/auth/auth.controller.ts`)

```typescript
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
```

## DTOs

```typescript
// dto/register.dto.ts
export class RegisterDto {
  email: string;
  password: string;
  username: string;
}

// dto/login.dto.ts
export class LoginDto {
  email: string;
  password: string;
}
```

## Rules

- Never store plain-text passwords — always hash with `bcrypt` (cost factor ≥ 10).
- Never hard-code `JWT_SECRET` — always read from `process.env`.
- Always use `JwtAuthGuard` (Passport-based) rather than manually verifying tokens.
- `JwtStrategy.validate()` return value becomes `request.user` — keep it minimal (`userId`, `email`).
- Export `JwtAuthGuard` from `AuthModule` so other modules can apply it without re-importing Passport.
