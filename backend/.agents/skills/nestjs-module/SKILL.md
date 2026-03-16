---
name: nestjs-module
description: Use when adding, modifying, or debugging any NestJS module in the backend. Covers the module/controller/service/DTO/entity pattern used throughout this project (Auth, Player, Cat, Economy, Quest).
version: 1.0.0
license: MIT
---

# NestJS Module Pattern

**Use this skill for any work involving NestJS modules, controllers, services, DTOs, or entities in the `backend` project.**

## Project Structure

```
backend/src/
  main.ts               Bootstrap — listens on process.env.PORT ?? 3000
  app.module.ts         Root module — imports all feature modules
  auth/                 Authentication (register, login, JWT)
  player/               Player profiles
  cat/                  Cat management and status
  economy/              Wallet and coin transactions
  quest/                Quest tracking
```

Each feature follows the same layout:

```
<feature>/
  <feature>.module.ts       NestJS module — wires providers and exports
  <feature>.controller.ts   HTTP handlers — thin, delegates to service
  <feature>.service.ts      Business logic
  dto/                      Request/response shape (class-validator recommended)
  entities/                 Plain entity classes (no ORM decorator yet)
```

## Adding a New Module (End-to-End)

### 1. Entity (`entities/<feature>.entity.ts`)

```typescript
export class MemoryEntity {
  id: string;
  catId: string;
  event: string;
  importance: number;
  createdAt: Date;
}
```

### 2. DTOs (`dto/`)

```typescript
// dto/create-memory.dto.ts
export class CreateMemoryDto {
  catId: string;
  event: string;
  importance?: number;
}

// dto/memory-response.dto.ts
export class MemoryResponseDto {
  id: string;
  catId: string;
  event: string;
  importance: number;
}
```

### 3. Service (`<feature>.service.ts`)

```typescript
import { Injectable } from '@nestjs/common';
import { CreateMemoryDto } from './dto/create-memory.dto';

@Injectable()
export class MemoryService {
  async create(dto: CreateMemoryDto) {
    // TODO: insert into memories table
    return { id: 'generated-id', ...dto, importance: dto.importance ?? 1.0 };
  }

  async findByCatId(catId: string) {
    // TODO: query memories by cat_id
    return [];
  }
}
```

### 4. Controller (`<feature>.controller.ts`)

```typescript
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MemoryService } from './memory.service';
import { CreateMemoryDto } from './dto/create-memory.dto';

@Controller('memory')
export class MemoryController {
  constructor(private readonly memoryService: MemoryService) {}

  @Post()
  create(@Body() dto: CreateMemoryDto) {
    return this.memoryService.create(dto);
  }

  @Get('cat/:catId')
  findByCat(@Param('catId') catId: string) {
    return this.memoryService.findByCatId(catId);
  }
}
```

### 5. Module (`<feature>.module.ts`)

```typescript
import { Module } from '@nestjs/common';
import { MemoryController } from './memory.controller';
import { MemoryService } from './memory.service';

@Module({
  controllers: [MemoryController],
  providers: [MemoryService],
  exports: [MemoryService],   // export if other modules need to inject the service
})
export class MemoryModule {}
```

### 6. Register in `app.module.ts`

```typescript
import { MemoryModule } from './memory/memory.module';

@Module({
  imports: [AuthModule, PlayerModule, CatModule, EconomyModule, QuestModule, MemoryModule],
  ...
})
export class AppModule {}
```

## Existing Modules

| Module    | Controller prefix | Key endpoints                                         |
|-----------|-------------------|-------------------------------------------------------|
| `auth`    | `/auth`           | `POST /register`, `POST /login`                       |
| `player`  | `/players`        | `POST /`, `GET /:id`                                  |
| `cat`     | `/cats`           | `POST /`, `GET /player/:playerId`, `GET /:id/status`  |
| `economy` | `/economy`        | `GET /wallet/:playerId`, `POST /wallet/:playerId/add` |
| `quest`   | `/quests`         | (see quest module)                                    |

## CatEntity Fields

```typescript
id: string
playerId: string
name: string
personalityType: string
intelligence: number   // 0–100
kindness: number       // 0–100
energy: number         // 0–100
loyalty: number        // 0–100
createdAt: Date
```

## Injecting One Service into Another

```typescript
// In the consuming module — import the provider module
@Module({
  imports: [CatModule],           // CatModule must export CatService
  providers: [QuestService],
})
export class QuestModule {}

// In the consuming service — inject via constructor
@Injectable()
export class QuestService {
  constructor(private readonly catService: CatService) {}
}
```

## HTTP Status Codes

Use NestJS decorators to override the default `200`:

```typescript
import { HttpCode, HttpStatus } from '@nestjs/common';

@Post()
@HttpCode(HttpStatus.CREATED)   // 201
create(@Body() dto: CreateCatDto) { ... }
```

Throw standard exceptions:

```typescript
import { NotFoundException, BadRequestException } from '@nestjs/common';

async findById(id: string) {
  const cat = await this.db.find(id);
  if (!cat) throw new NotFoundException(`Cat ${id} not found`);
  return cat;
}
```

## Running the Backend

```bash
# Development (watch mode)
npm run start:dev

# Tests
npm test

# Build
npm run build
```

Port defaults to `3000`. Set `PORT` env var to override.

## Rules

- Controllers must only call service methods — never contain business logic.
- Services must be decorated with `@Injectable()`.
- Every new module must be added to the `imports` array in `app.module.ts`.
- Export a service from its module only if other modules need to inject it.
- DTOs are plain classes — add `class-validator` decorators when input validation is needed.
- Never put database queries directly in controllers.
