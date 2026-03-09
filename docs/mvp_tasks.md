# AI Cat Life — MVP Task Breakdown

> Granular tasks designed for smaller AI models. Each task is self-contained with
> clear inputs, outputs, files, and acceptance criteria.

---

## Phase 0: Project Configuration

### Task 0.1 — Backend: Add environment configuration

**Project:** `backend/`
**Goal:** Set up environment-based config using `@nestjs/config`.

**Steps:**
1. Run `npm install @nestjs/config` in `backend/`
2. Create file `backend/.env` with:
   ```
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_NAME=cat_life
   DATABASE_USER=postgres
   DATABASE_PASSWORD=postgres
   JWT_SECRET=your-secret-key-change-in-production
   AI_SERVICE_URL=http://localhost:8000
   ```
3. Create file `backend/src/config/configuration.ts`:
   ```typescript
   export default () => ({
     database: {
       host: process.env.DATABASE_HOST || 'localhost',
       port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
       name: process.env.DATABASE_NAME || 'cat_life',
       user: process.env.DATABASE_USER || 'postgres',
       password: process.env.DATABASE_PASSWORD || 'postgres',
     },
     jwt: {
       secret: process.env.JWT_SECRET || 'default-secret',
     },
     aiService: {
       url: process.env.AI_SERVICE_URL || 'http://localhost:8000',
     },
   });
   ```
4. Update `backend/src/app.module.ts` — add `ConfigModule.forRoot({ isGlobal: true, load: [configuration] })` to imports.
5. Add `.env` to `backend/.gitignore`.
6. Verify: `npx nest build` succeeds.

**Acceptance:** App builds. Config values are accessible via `ConfigService`.

---

### Task 0.2 — Backend: Add TypeORM and PostgreSQL connection

**Project:** `backend/`
**Goal:** Connect NestJS to PostgreSQL using TypeORM.

**Dependencies:** Task 0.1

**Steps:**
1. Run `npm install @nestjs/typeorm typeorm pg` in `backend/`
2. Update `backend/src/app.module.ts` — add `TypeOrmModule.forRoot(...)` using config values:
   ```typescript
   TypeOrmModule.forRoot({
     type: 'postgres',
     host: process.env.DATABASE_HOST,
     port: parseInt(process.env.DATABASE_PORT, 10),
     username: process.env.DATABASE_USER,
     password: process.env.DATABASE_PASSWORD,
     database: process.env.DATABASE_NAME,
     autoLoadEntities: true,
     synchronize: true, // disable in production
   })
   ```
3. Verify: `npx nest build` succeeds.

**Acceptance:** App builds with TypeORM configured. When DB is running, app connects on startup.

---

### Task 0.3 — Backend: Add global validation pipe

**Project:** `backend/`
**Goal:** Enable DTO validation globally.

**Steps:**
1. Run `npm install class-validator class-transformer` in `backend/`
2. Update `backend/src/main.ts` — add before `app.listen()`:
   ```typescript
   app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
   ```
3. Verify: `npx nest build` succeeds.

**Acceptance:** All incoming DTOs are auto-validated. Invalid requests return 400.

---

### Task 0.4 — AI Service: Add .env and database config

**Project:** `ai-service/`
**Goal:** Create `.env` file and update config.

**Steps:**
1. Create `ai-service/.env`:
   ```
   DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/cat_life_ai
   REDIS_URL=redis://localhost:6379
   OPENAI_API_KEY=sk-placeholder
   ```
2. File `ai-service/app/core/config.py` already exists — verify it loads from `.env`.
3. Add `.env` to `.gitignore` if not already present.

**Acceptance:** `python -c "from app.core.config import settings; print(settings.database_url)"` prints the URL.

---

### Task 0.5 — Mobile: Install navigation and core dependencies

**Project:** `mobile/`
**Goal:** Set up React Navigation and basic project dependencies.

**Steps:**
1. Run in `mobile/`:
   ```
   npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
   npm install react-native-screens react-native-safe-area-context
   npm install axios
   npm install @react-native-async-storage/async-storage
   ```
2. Create `mobile/src/` directory structure:
   ```
   src/
     api/
     components/
     screens/
     navigation/
     store/
     types/
     utils/
   ```
3. Create `mobile/src/api/client.ts`:
   ```typescript
   import axios from 'axios';

   const API_BASE_URL = 'http://localhost:3000';

   export const apiClient = axios.create({
     baseURL: API_BASE_URL,
     timeout: 10000,
     headers: { 'Content-Type': 'application/json' },
   });
   ```
4. Verify: `npx tsc --noEmit` passes.

**Acceptance:** Navigation libraries installed. API client created. TypeScript compiles.

---

## Phase 1: Database Entities

### Task 1.1 — Entity: User

**Project:** `backend/`
**File:** `backend/src/auth/entities/user.entity.ts` (create)
**Goal:** Create the User TypeORM entity.

**Schema:**
```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date;
}
```

**After:** Register entity in `auth.module.ts` using `TypeOrmModule.forFeature([User])`.

**Acceptance:** `npx nest build` succeeds. Entity is registered.

---

### Task 1.2 — Entity: PlayerProfile

**Project:** `backend/`
**File:** `backend/src/player/entities/player.entity.ts` (update existing)
**Goal:** Update the PlayerProfile entity with full schema.

**Schema:**
```typescript
@Entity('player_profiles')
export class PlayerProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  player_name: string;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  experience: number;

  @CreateDateColumn()
  created_at: Date;
}
```

**After:** Ensure `TypeOrmModule.forFeature([PlayerProfile])` is in `player.module.ts`.

**Acceptance:** `npx nest build` succeeds.

---

### Task 1.3 — Entity: Cat

**Project:** `backend/`
**File:** `backend/src/cat/entities/cat.entity.ts` (update existing)
**Goal:** Update Cat entity with full attributes from the game scenario.

**Schema:**
```typescript
@Entity('cats')
export class Cat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  player_id: string;

  @Column()
  name: string;

  @Column({ default: 'playful' })
  personality_type: string;  // chef, lazy, clean_freak, playful

  @Column({ type: 'float', default: 0.5 })
  intelligence: number;

  @Column({ type: 'float', default: 0.5 })
  kindness: number;

  @Column({ type: 'float', default: 1.0 })
  energy: number;

  @Column({ type: 'float', default: 0.5 })
  loyalty: number;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  experience: number;

  @Column({ default: 1 })
  care_level: number;

  @Column({ type: 'float', default: 1.0 })
  happiness: number;

  @CreateDateColumn()
  created_at: Date;
}
```

**Acceptance:** `npx nest build` succeeds.

---

### Task 1.4 — Entity: CatStatus

**Project:** `backend/`
**File:** `backend/src/cat/entities/cat-status.entity.ts` (create)
**Goal:** Create CatStatus entity for real-time cat state.

**Schema:**
```typescript
@Entity('cat_status')
export class CatStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  cat_id: string;

  @Column({ type: 'float', default: 0.0 })
  hunger: number;

  @Column({ type: 'float', default: 1.0 })
  happiness: number;

  @Column({ type: 'float', default: 0.0 })
  stress: number;

  @Column({ type: 'timestamp', nullable: true })
  last_action_time: Date;
}
```

**After:** Add to `TypeOrmModule.forFeature([Cat, CatStatus])` in `cat.module.ts`.

**Acceptance:** `npx nest build` succeeds.

---

### Task 1.5 — Entity: Wallet

**Project:** `backend/`
**File:** `backend/src/economy/entities/wallet.entity.ts` (update existing)
**Goal:** Update Wallet entity.

**Schema:**
```typescript
@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  player_id: string;

  @Column({ type: 'float', default: 100 })
  money: number;

  @Column({ type: 'float', default: 0 })
  premium_currency: number;
}
```

**Acceptance:** `npx nest build` succeeds.

---

### Task 1.6 — Entity: Job

**Project:** `backend/`
**File:** `backend/src/quest/entities/job.entity.ts` (update existing)
**Goal:** Update Job entity.

**Schema:**
```typescript
@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'float' })
  reward_money: number;

  @Column()
  duration: number; // in minutes
}
```

**Acceptance:** `npx nest build` succeeds.

---

### Task 1.7 — Entity: CatJob

**Project:** `backend/`
**File:** `backend/src/quest/entities/cat-job.entity.ts` (create)
**Goal:** Create CatJob entity — tracks which cat is doing which job.

**Schema:**
```typescript
@Entity('cat_jobs')
export class CatJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  cat_id: string;

  @Column()
  job_id: string;

  @Column({ type: 'timestamp' })
  start_time: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_time: Date;

  @Column({ default: 'in_progress' })
  status: string; // in_progress, completed, cancelled
}
```

**After:** Add to `TypeOrmModule.forFeature([Job, CatJob])` in `quest.module.ts`.

**Acceptance:** `npx nest build` succeeds.

---

### Task 1.8 — Entity: Item and Inventory

**Project:** `backend/`
**Files:**
- `backend/src/economy/entities/item.entity.ts` (create)
- `backend/src/economy/entities/inventory.entity.ts` (create)

**Item schema:**
```typescript
@Entity('items')
export class Item {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  type: string; // ingredient, furniture, recipe

  @Column({ type: 'float' })
  price: number;
}
```

**Inventory schema:**
```typescript
@Entity('inventory')
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  player_id: string;

  @Column()
  item_id: string;

  @Column({ default: 1 })
  quantity: number;
}
```

**After:** Add both to `TypeOrmModule.forFeature([Wallet, Item, Inventory])` in `economy.module.ts`.

**Acceptance:** `npx nest build` succeeds.

---

### Task 1.9 — Entity: Event

**Project:** `backend/`
**File:** `backend/src/quest/entities/event.entity.ts` (create)
**Goal:** Create game Event entity for random events.

**Schema:**
```typescript
@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  player_id: string;

  @Column()
  event_type: string;

  @Column({ type: 'text' })
  description: string;

  @CreateDateColumn()
  created_at: Date;
}
```

**After:** Add to `TypeOrmModule.forFeature(...)` in `quest.module.ts`.

**Acceptance:** `npx nest build` succeeds.

---

### Task 1.10 — Entity: House and Room

**Project:** `backend/`
**Files:**
- `backend/src/player/entities/house.entity.ts` (create)
- `backend/src/player/entities/room.entity.ts` (create)

**House schema:**
```typescript
@Entity('houses')
export class House {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  player_id: string;

  @CreateDateColumn()
  created_at: Date;
}
```

**Room schema:**
```typescript
@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  house_id: string;

  @Column()
  name: string; // kitchen, living_room, bedroom, bathroom

  @Column({ default: 1 })
  level: number;
}
```

**After:** Add to `TypeOrmModule.forFeature([PlayerProfile, House, Room])` in `player.module.ts`.

**Acceptance:** `npx nest build` succeeds.

---

### Task 1.11 — Entity: Recipe

**Project:** `backend/`
**File:** `backend/src/economy/entities/recipe.entity.ts` (create)
**Goal:** Create Recipe entity for the cooking system.

**Schema:**
```typescript
@Entity('recipes')
export class Recipe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // e.g. "Fish Soup"

  @Column({ type: 'jsonb' })
  ingredients: { item_id: string; quantity: number }[];

  @Column({ type: 'float', default: 0 })
  energy_recovery: number;

  @Column({ default: 0 })
  experience_reward: number;

  @Column({ type: 'float', default: 0 })
  happiness_bonus: number;

  @Column({ default: 1 })
  required_care_level: number;
}
```

**After:** Add to economy module's `TypeOrmModule.forFeature(...)`.

**Acceptance:** `npx nest build` succeeds.

---

### Task 1.12 — Entity: CatMemory (for AI long-term memory)

**Project:** `backend/`
**File:** `backend/src/cat/entities/cat-memory.entity.ts` (create)
**Goal:** Store important cat memories that affect future behavior.

**Schema:**
```typescript
@Entity('cat_memories')
export class CatMemory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  cat_id: string;

  @Column()
  memory_type: string; // praised, ignored, saved_money, got_sick

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'float', default: 1.0 })
  importance: number; // 0.0 to 1.0

  @CreateDateColumn()
  created_at: Date;
}
```

**After:** Add to `TypeOrmModule.forFeature([Cat, CatStatus, CatMemory])` in `cat.module.ts`.

**Acceptance:** `npx nest build` succeeds.

---

## Phase 2: Authentication

### Task 2.1 — Auth: JWT strategy and module setup

**Project:** `backend/`
**Goal:** Set up Passport JWT authentication.

**Steps:**
1. Run `npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt`
2. Run `npm install -D @types/passport-jwt @types/bcrypt`
3. Create `backend/src/auth/strategies/jwt.strategy.ts`:
   ```typescript
   @Injectable()
   export class JwtStrategy extends PassportStrategy(Strategy) {
     constructor(private configService: ConfigService) {
       super({
         jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
         secretOrKey: configService.get('jwt.secret'),
       });
     }
     async validate(payload: { sub: string; email: string }) {
       return { userId: payload.sub, email: payload.email };
     }
   }
   ```
4. Create `backend/src/auth/guards/jwt-auth.guard.ts`:
   ```typescript
   @Injectable()
   export class JwtAuthGuard extends AuthGuard('jwt') {}
   ```
5. Update `backend/src/auth/auth.module.ts`:
   - Import `JwtModule.register(...)`, `PassportModule`
   - Register `JwtStrategy` as provider
   - Import `TypeOrmModule.forFeature([User])`

**Acceptance:** `npx nest build` succeeds. JwtAuthGuard is available for route protection.

---

### Task 2.2 — Auth: Register endpoint

**Project:** `backend/`
**Goal:** Implement `POST /auth/register`.

**Steps:**
1. Update `backend/src/auth/dto/register.dto.ts`:
   ```typescript
   export class RegisterDto {
     @IsEmail()
     email: string;

     @IsString()
     @MinLength(6)
     password: string;

     @IsString()
     @MinLength(2)
     player_name: string;
   }
   ```
2. Update `backend/src/auth/auth.service.ts` — add `register(dto)` method:
   - Check if user with email exists → throw `ConflictException`
   - Hash password with bcrypt (10 rounds)
   - Create User entity, save to DB
   - Create PlayerProfile entity, save to DB
   - Create Wallet with default 100 money
   - Create House with 4 default rooms (kitchen, living_room, bedroom, bathroom)
   - Return JWT token
3. Update `backend/src/auth/auth.controller.ts` — add `@Post('register')` route.

**Acceptance:** `POST /auth/register` with `{ email, password, player_name }` creates user and returns `{ access_token }`.

---

### Task 2.3 — Auth: Login endpoint

**Project:** `backend/`
**Goal:** Implement `POST /auth/login`.

**Steps:**
1. Update `backend/src/auth/dto/login.dto.ts`:
   ```typescript
   export class LoginDto {
     @IsEmail()
     email: string;

     @IsString()
     password: string;
   }
   ```
2. Update `backend/src/auth/auth.service.ts` — add `login(dto)` method:
   - Find user by email → throw `UnauthorizedException` if not found
   - Compare password with bcrypt → throw `UnauthorizedException` if mismatch
   - Update `last_login` timestamp
   - Return JWT token with payload `{ sub: user.id, email: user.email }`
3. Update `backend/src/auth/auth.controller.ts` — add `@Post('login')` route.

**Acceptance:** `POST /auth/login` with valid credentials returns `{ access_token }`. Invalid credentials return 401.

---

### Task 2.4 — Auth: Get current user endpoint

**Project:** `backend/`
**Goal:** Implement `GET /auth/me` — returns current user info.

**Steps:**
1. Add method `getProfile(userId)` in `auth.service.ts` — fetch user by ID, omit `password_hash`.
2. Add `@Get('me')` route in `auth.controller.ts` — use `@UseGuards(JwtAuthGuard)` and `@Request()` to get user ID.

**Acceptance:** `GET /auth/me` with valid Bearer token returns user profile. Without token returns 401.

---

## Phase 3: Player System

### Task 3.1 — Player: Get player profile

**Project:** `backend/`
**Goal:** Implement `GET /player/profile`.

**Steps:**
1. Update `player.service.ts` — add `getProfile(userId)`:
   - Find PlayerProfile by `user_id`
   - Return profile data
2. Update `player.controller.ts` — add `@Get('profile')` with `@UseGuards(JwtAuthGuard)`.

**Acceptance:** Returns `{ id, player_name, level, experience }` for authenticated user.

---

### Task 3.2 — Player: Update player profile

**Project:** `backend/`
**Goal:** Implement `PATCH /player/profile`.

**Steps:**
1. Create `backend/src/player/dto/update-player.dto.ts`:
   ```typescript
   export class UpdatePlayerDto {
     @IsOptional() @IsString()
     player_name?: string;
   }
   ```
2. Update `player.service.ts` — add `updateProfile(userId, dto)`.
3. Update `player.controller.ts` — add `@Patch('profile')`.

**Acceptance:** `PATCH /player/profile` updates player name and returns updated profile.

---

### Task 3.3 — Player: Get house and rooms

**Project:** `backend/`
**Goal:** Implement `GET /player/house`.

**Steps:**
1. Update `player.service.ts` — add `getHouse(userId)`:
   - Find House by `player_id`
   - Find all Rooms by `house_id`
   - Return `{ house, rooms }`
2. Update `player.controller.ts` — add `@Get('house')`.

**Acceptance:** Returns house with list of rooms and their levels.

---

### Task 3.4 — Player: Upgrade room

**Project:** `backend/`
**Goal:** Implement `POST /player/house/rooms/:roomId/upgrade`.

**Steps:**
1. Create `backend/src/player/dto/upgrade-room.dto.ts` (no body needed, room ID from URL param).
2. Update `player.service.ts` — add `upgradeRoom(userId, roomId)`:
   - Find room, verify it belongs to the player's house
   - Calculate upgrade cost: `room.level * 50` coins
   - Check wallet has enough money → throw `BadRequestException` if not
   - Deduct cost from wallet
   - Increment `room.level`
   - Return updated room
3. Inject `EconomyService` or `Wallet` repository into `PlayerService` (cross-module dependency).
4. Update `player.controller.ts` — add `@Post('house/rooms/:roomId/upgrade')`.

**Acceptance:** Upgrading room deducts coins and increments room level. Insufficient funds returns 400.

---

## Phase 4: Cat System

### Task 4.1 — Cat: Create cat

**Project:** `backend/`
**Goal:** Implement `POST /cats`.

**Steps:**
1. Update `backend/src/cat/dto/create-cat.dto.ts`:
   ```typescript
   export class CreateCatDto {
     @IsString() @MinLength(1)
     name: string;

     @IsOptional() @IsString()
     personality_type?: string; // chef, lazy, clean_freak, playful
   }
   ```
2. Update `cat.service.ts` — add `createCat(userId, dto)`:
   - Find player profile by `user_id`
   - Count existing cats for player → max 3 for free users
   - Create Cat entity with default attributes
   - Create CatStatus entity (hunger: 0, happiness: 1.0, stress: 0)
   - If `personality_type` not provided, call AI service `/api/personality/generate` to get random personality
   - Return created cat
3. Update `cat.controller.ts` — add `@Post()`.

**Acceptance:** `POST /cats` with `{ name }` creates cat and returns full cat data. 4th cat is rejected for free users.

---

### Task 4.2 — Cat: List player's cats

**Project:** `backend/`
**Goal:** Implement `GET /cats`.

**Steps:**
1. Update `cat.service.ts` — add `getCats(userId)`:
   - Find player profile
   - Find all cats by `player_id`
   - For each cat, also fetch CatStatus
   - Return array of cats with status
2. Update `cat.controller.ts` — add `@Get()`.

**Acceptance:** Returns array of cats with their current status.

---

### Task 4.3 — Cat: Get single cat details

**Project:** `backend/`
**Goal:** Implement `GET /cats/:catId`.

**Steps:**
1. Update `cat.service.ts` — add `getCat(userId, catId)`:
   - Find cat by ID, verify belongs to player
   - Fetch CatStatus
   - Fetch CatMemories (recent 10)
   - Return combined data
2. Update `cat.controller.ts` — add `@Get(':catId')`.

**Acceptance:** Returns full cat data including status and memories.

---

### Task 4.4 — Cat: Feed cat

**Project:** `backend/`
**Goal:** Implement `POST /cats/:catId/feed`.

**Steps:**
1. Create `backend/src/cat/dto/feed-cat.dto.ts`:
   ```typescript
   export class FeedCatDto {
     @IsString()
     item_id: string; // food item from inventory
   }
   ```
2. Update `cat.service.ts` — add `feedCat(userId, catId, dto)`:
   - Find cat, verify ownership
   - Find item in player inventory, verify quantity > 0
   - Reduce inventory quantity by 1
   - Reduce cat's `hunger` by item's energy value (min 0)
   - Increase cat's `happiness` by 0.1
   - Add experience to cat
   - Return updated cat status
3. Update `cat.controller.ts` — add `@Post(':catId/feed')`.

**Acceptance:** Feeding reduces hunger, increases happiness, consumes item from inventory.

---

### Task 4.5 — Cat: Level up system

**Project:** `backend/`
**Goal:** Implement cat leveling logic.

**Steps:**
1. Create `backend/src/cat/services/leveling.service.ts`:
   ```typescript
   @Injectable()
   export class LevelingService {
     getExperienceForLevel(level: number): number {
       return level * 100; // 100 XP per level
     }

     getCareLevel(level: number): number {
       if (level >= 10) return 5;  // Manage house automatically
       if (level >= 7) return 4;   // Prepare work supplies
       if (level >= 5) return 3;   // Buy groceries
       if (level >= 3) return 2;   // Clean rooms
       return 1;                   // Cook simple meals
     }

     checkLevelUp(cat: Cat): { leveled: boolean; newLevel: number } {
       const required = this.getExperienceForLevel(cat.level);
       if (cat.experience >= required) {
         return { leveled: true, newLevel: cat.level + 1 };
       }
       return { leveled: false, newLevel: cat.level };
     }
   }
   ```
2. Register `LevelingService` in `cat.module.ts`.
3. Call `checkLevelUp()` after any action that grants XP (feeding, completing jobs, etc). When leveled, update `cat.level`, `cat.care_level`, reset excess XP.

**Acceptance:** Cat levels up when XP threshold is reached. Care level updates according to the CareLevel table.

---

### Task 4.6 — Cat: Personality modifiers

**Project:** `backend/`
**Goal:** Implement personality-based speed/efficiency modifiers.

**Steps:**
1. Create `backend/src/cat/services/personality.service.ts`:
   ```typescript
   @Injectable()
   export class PersonalityService {
     getModifiers(personalityType: string) {
       const modifiers = {
         chef:        { cook_speed: 1.5, clean_speed: 1.0, energy_cost: 1.0, happiness_bonus: 1.0 },
         lazy:        { cook_speed: 0.8, clean_speed: 0.8, energy_cost: 0.7, happiness_bonus: 1.0 },
         clean_freak: { cook_speed: 1.0, clean_speed: 1.5, energy_cost: 1.0, happiness_bonus: 1.0 },
         playful:     { cook_speed: 1.0, clean_speed: 1.0, energy_cost: 1.0, happiness_bonus: 1.5 },
       };
       return modifiers[personalityType] || modifiers.playful;
     }
   }
   ```
2. Register in `cat.module.ts`.

**Acceptance:** Personality modifiers are accessible and applied to cat actions.

---

## Phase 5: Economy System

### Task 5.1 — Economy: Get wallet

**Project:** `backend/`
**Goal:** Implement `GET /economy/wallet`.

**Steps:**
1. Update `economy.service.ts` — add `getWallet(userId)`:
   - Find PlayerProfile by `user_id`
   - Find Wallet by `player_id`
   - Return wallet data
2. Update `economy.controller.ts` — add `@Get('wallet')` with auth guard.

**Acceptance:** Returns `{ money, premium_currency }`.

---

### Task 5.2 — Economy: List shop items

**Project:** `backend/`
**Goal:** Implement `GET /economy/shop`.

**Steps:**
1. Update `economy.service.ts` — add `getShopItems()`:
   - Return all Items from DB
2. Update `economy.controller.ts` — add `@Get('shop')`.

**Acceptance:** Returns array of items with name, type, price.

---

### Task 5.3 — Economy: Buy item

**Project:** `backend/`
**Goal:** Implement `POST /economy/buy`.

**Steps:**
1. Create `backend/src/economy/dto/buy-item.dto.ts`:
   ```typescript
   export class BuyItemDto {
     @IsString()
     item_id: string;

     @IsInt() @Min(1)
     quantity: number;
   }
   ```
2. Update `economy.service.ts` — add `buyItem(userId, dto)`:
   - Find item by `item_id`
   - Calculate total cost: `item.price * quantity`
   - Find wallet, check `money >= total_cost` → throw if not
   - Deduct money from wallet
   - Add to inventory (create or increment quantity)
   - Return updated wallet
3. Update `economy.controller.ts` — add `@Post('buy')`.

**Acceptance:** Buying deducts money and adds item to inventory. Insufficient funds returns 400.

---

### Task 5.4 — Economy: Get player inventory

**Project:** `backend/`
**Goal:** Implement `GET /economy/inventory`.

**Steps:**
1. Update `economy.service.ts` — add `getInventory(userId)`:
   - Find player profile
   - Find all inventory entries for player with item details
   - Return array of `{ item, quantity }`
2. Update `economy.controller.ts` — add `@Get('inventory')`.

**Acceptance:** Returns player's inventory with item details and quantities.

---

### Task 5.5 — Economy: Seed default items

**Project:** `backend/`
**Goal:** Create a seed script to populate default items.

**Steps:**
1. Create `backend/src/seeds/items.seed.ts`:
   ```typescript
   export const DEFAULT_ITEMS = [
     { name: 'Fish', type: 'ingredient', price: 10 },
     { name: 'Milk', type: 'ingredient', price: 8 },
     { name: 'Vegetables', type: 'ingredient', price: 5 },
     { name: 'Meat', type: 'ingredient', price: 15 },
     { name: 'Basic Cat Bed', type: 'furniture', price: 50 },
     { name: 'Scratching Post', type: 'furniture', price: 30 },
   ];
   ```
2. Create `backend/src/seeds/jobs.seed.ts`:
   ```typescript
   export const DEFAULT_JOBS = [
     { name: 'Restaurant Chef', reward_money: 30, duration: 60 },
     { name: 'Cleaning Service', reward_money: 20, duration: 45 },
     { name: 'Cafe Assistant', reward_money: 15, duration: 30 },
   ];
   ```
3. Create `backend/src/seeds/seed.service.ts` — on app startup, check if items table is empty. If so, insert defaults.
4. Register seed service in `app.module.ts` and call `onModuleInit()`.

**Acceptance:** First startup populates items and jobs. Subsequent startups skip.

---

## Phase 6: Cat Jobs (Quest System)

### Task 6.1 — Quest: List available jobs

**Project:** `backend/`
**Goal:** Implement `GET /quests/jobs`.

**Steps:**
1. Update `quest.service.ts` — add `getJobs()`: return all jobs.
2. Update `quest.controller.ts` — add `@Get('jobs')`.

**Acceptance:** Returns array of jobs with name, reward, duration.

---

### Task 6.2 — Quest: Assign cat to job

**Project:** `backend/`
**Goal:** Implement `POST /quests/assign`.

**Steps:**
1. Create `backend/src/quest/dto/assign-job.dto.ts`:
   ```typescript
   export class AssignJobDto {
     @IsString()
     cat_id: string;

     @IsString()
     job_id: string;
   }
   ```
2. Update `quest.service.ts` — add `assignJob(userId, dto)`:
   - Verify cat belongs to player
   - Verify cat is not already on a job (status = 'in_progress')
   - Verify cat's care_level meets job requirements (care_level >= 1 for all MVP jobs)
   - Verify cat has enough energy (energy >= 0.3)
   - Create CatJob record with `start_time = now`, calculate `end_time = now + duration`
   - Reduce cat energy by 0.3
   - Return CatJob record
3. Update `quest.controller.ts` — add `@Post('assign')`.

**Acceptance:** Assigning a job creates a CatJob record. Cat cannot take 2 jobs simultaneously.

---

### Task 6.3 — Quest: Complete job and collect reward

**Project:** `backend/`
**Goal:** Implement `POST /quests/complete/:catJobId`.

**Steps:**
1. Update `quest.service.ts` — add `completeJob(userId, catJobId)`:
   - Find CatJob by ID, verify ownership
   - Check `now >= end_time` → if not, throw `BadRequestException('Job not finished yet')`
   - Update CatJob status to `completed`
   - Add `reward_money` to player's wallet
   - Add experience to cat (e.g. `duration / 10`)
   - Check for level up
   - Create CatMemory: `{ memory_type: 'completed_job', description: 'Worked as {job.name}' }`
   - Return reward summary
2. Update `quest.controller.ts` — add `@Post('complete/:catJobId')`.

**Acceptance:** Completing a job awards money and XP. Job must be past end_time.

---

### Task 6.4 — Quest: Get active cat jobs

**Project:** `backend/`
**Goal:** Implement `GET /quests/active`.

**Steps:**
1. Update `quest.service.ts` — add `getActiveJobs(userId)`:
   - Find all CatJob records with `status = 'in_progress'` for player's cats
   - Include job details and time remaining
   - Return array
2. Update `quest.controller.ts` — add `@Get('active')`.

**Acceptance:** Returns list of in-progress jobs with remaining time.

---

## Phase 7: Cooking System

### Task 7.1 — Cooking: Seed default recipes

**Project:** `backend/`
**Goal:** Add default recipes to the seed script.

**Steps:**
1. Create `backend/src/seeds/recipes.seed.ts`:
   ```typescript
   export const DEFAULT_RECIPES = [
     {
       name: 'Fish Soup',
       ingredients: [
         { item_name: 'Fish', quantity: 1 },
         { item_name: 'Milk', quantity: 1 },
       ],
       energy_recovery: 0.5,
       experience_reward: 15,
       happiness_bonus: 0.2,
       required_care_level: 1,
     },
     {
       name: 'Steak',
       ingredients: [
         { item_name: 'Meat', quantity: 1 },
         { item_name: 'Vegetables', quantity: 1 },
       ],
       energy_recovery: 0.7,
       experience_reward: 20,
       happiness_bonus: 0.3,
       required_care_level: 1,
     },
     {
       name: 'Veggie Salad',
       ingredients: [
         { item_name: 'Vegetables', quantity: 2 },
       ],
       energy_recovery: 0.3,
       experience_reward: 10,
       happiness_bonus: 0.1,
       required_care_level: 1,
     },
   ];
   ```
2. Add recipe seeding to `seed.service.ts`.

**Acceptance:** Recipes are seeded on first startup.

---

### Task 7.2 — Cooking: List recipes

**Project:** `backend/`
**Goal:** Implement `GET /economy/recipes`.

**Steps:**
1. Update `economy.service.ts` — add `getRecipes()`: return all recipes.
2. Update `economy.controller.ts` — add `@Get('recipes')`.

**Acceptance:** Returns array of recipes with ingredients and rewards.

---

### Task 7.3 — Cooking: Cook a meal

**Project:** `backend/`
**Goal:** Implement `POST /cats/:catId/cook`.

**Steps:**
1. Create `backend/src/cat/dto/cook.dto.ts`:
   ```typescript
   export class CookDto {
     @IsString()
     recipe_id: string;
   }
   ```
2. Update `cat.service.ts` — add `cook(userId, catId, dto)`:
   - Verify cat belongs to player
   - Verify cat's `care_level >= recipe.required_care_level`
   - Verify cat has enough `energy >= 0.2`
   - Check player inventory has all required ingredients
   - Deduct ingredients from inventory
   - Apply personality modifier (chef cooks faster — for MVP just grant bonus XP)
   - Cat gains XP: `recipe.experience_reward`
   - Cat happiness: `+recipe.happiness_bonus`
   - Cat energy: `-0.2` (modified by personality)
   - Cat hunger: `-recipe.energy_recovery`
   - Check level up
   - Return cooking result summary
3. Update `cat.controller.ts` — add `@Post(':catId/cook')`.

**Acceptance:** Cooking consumes ingredients, gives cat XP, reduces hunger. Missing ingredients returns 400.

---

## Phase 8: Offline Progression

### Task 8.1 — Offline: Calculate offline rewards

**Project:** `backend/`
**Goal:** Create offline simulation service.

**Steps:**
1. Create `backend/src/player/services/offline.service.ts`:
   ```typescript
   @Injectable()
   export class OfflineService {
     calculateOfflineRewards(lastLogin: Date, now: Date, playerLevel: number) {
       let hoursAway = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);
       hoursAway = Math.min(hoursAway, 8); // cap at 8 hours

       const efficiency = 0.35; // 35% of active play rate
       const salaryPerHour = 10 + (playerLevel * 2);
       const salary = Math.floor(hoursAway * salaryPerHour * efficiency);

       return {
         hours_away: Math.round(hoursAway * 10) / 10,
         salary_earned: salary,
         capped: hoursAway >= 8,
       };
     }
   }
   ```
2. Register in `player.module.ts`.

**Acceptance:** Given a last_login time, returns salary earned with 8-hour cap and 35% efficiency.

---

### Task 8.2 — Offline: Cat actions during offline

**Project:** `backend/`
**Goal:** Simulate cat actions during offline time.

**Steps:**
1. Update `backend/src/player/services/offline.service.ts` — add `simulateCatActions(cats, hoursAway)`:
   - For each cat:
     - Calculate number of actions: `Math.floor(hoursAway * 0.5)` (one action per 2 hours)
     - For each action, based on personality and care_level, pick an action (clean, cook simple meal)
     - Grant XP per action: 5
     - Increase hunger: `+0.1` per action
     - Decrease energy: `-0.1` per action
   - Return list of `{ cat_id, actions_performed: string[], xp_gained, status_changes }`.

**Acceptance:** Returns simulated actions for each cat proportional to time away.

---

### Task 8.3 — Offline: Daily report endpoint

**Project:** `backend/`
**Goal:** Implement `GET /player/daily-report` — called when player opens the app.

**Steps:**
1. Update `player.service.ts` or create new controller method:
   - Get user's `last_login` from User entity
   - If less than 1 minute since last login, return `{ has_report: false }`
   - Calculate offline rewards (salary)
   - Simulate cat actions
   - Add salary to wallet
   - Update cat states (XP, hunger, energy)
   - Check for level ups
   - Update `last_login` to now
   - Call AI service `/api/narrative/generate` with actions list to get story summary
   - Return full daily report:
     ```json
     {
       "has_report": true,
       "hours_away": 6.5,
       "salary_earned": 45,
       "cat_reports": [
         {
           "cat_name": "Luna",
           "actions": ["Cleaned the living room", "Cooked Fish Soup"],
           "xp_gained": 10,
           "leveled_up": false
         }
       ],
       "narrative": "While you were away, Luna kept the house spotless and made you a warm fish soup.",
       "events": []
     }
     ```
2. Update `player.controller.ts` — add `@Get('daily-report')`.

**Acceptance:** Opening the app after being away returns a daily report with salary, cat actions, and narrative.

---

## Phase 9: AI Service Enhancements

### Task 9.1 — AI: Improve personality generator with player profile input

**Project:** `ai-service/`
**Goal:** Personality generation should consider player preferences.

**Steps:**
1. Update `ai-service/app/schemas/personality.py` — add optional fields to `PersonalityRequest`:
   ```python
   player_preference: str | None = None  # e.g. "I want an active cat"
   ```
2. Update `ai-service/app/services/personality_engine.py`:
   - If `player_preference` contains keywords like "active", "energetic" → bias curiosity and playfulness higher
   - If "calm", "lazy" → bias laziness higher
   - If "clean" → bias cleanliness higher
   - Otherwise use pure random

**Acceptance:** `POST /api/personality/generate` with preference text generates biased personality.

---

### Task 9.2 — AI: Improve behavior planner with economy awareness

**Project:** `ai-service/`
**Goal:** Behavior planner should consider economic state.

**Steps:**
1. Update `ai-service/app/services/behavior_planner.py`:
   - If `economy_state.money < 20` → prioritize `work_job`
   - If `economy_state.money > 200` → allow `buy_food` more freely
   - If `player_state.last_login_hours_ago > 4` → prioritize house tasks

**Acceptance:** Different economy states produce different action choices.

---

### Task 9.3 — AI: Improve narrative generator with templates

**Project:** `ai-service/`
**Goal:** Add more narrative variety and emotional tone.

**Steps:**
1. Update `ai-service/app/services/narrative_generator.py`:
   - Add 10+ template variations
   - Add personality-aware templates (e.g. lazy cat → "Your cat reluctantly cleaned up...")
   - Add support for `cat_personality` parameter
2. Update router/schema to accept `personality_type` in request.

**Acceptance:** Narratives feel varied and personality-aware across multiple calls.

---

### Task 9.4 — AI: Offline simulation endpoint

**Project:** `ai-service/`
**Goal:** Create `POST /api/offline/simulate` — comprehensive offline simulation.

**Steps:**
1. Create `ai-service/app/schemas/offline.py`:
   ```python
   class OfflineSimRequest(BaseModel):
       player_id: str
       cats: list[dict]  # cat data with status and personality
       hours_away: float
       economy_state: dict

   class OfflineSimResponse(BaseModel):
       cat_actions: list[dict]
       events: list[dict]
       narrative: str
   ```
2. Create `ai-service/app/services/offline_simulator.py`:
   - For each cat, call behavior planner in a loop (once per simulated hour)
   - Collect all actions
   - Roll for random events (10% chance per hour)
   - Generate narrative summary
   - Return combined results
3. Create `ai-service/app/routers/offline.py` — `POST /api/offline/simulate`.
4. Register router in `main.py`.

**Acceptance:** `POST /api/offline/simulate` returns a complete offline simulation result.

---

### Task 9.5 — AI: Long-term memory query endpoint

**Project:** `ai-service/`
**Goal:** Create `POST /api/memory/analyze` — analyze memories to affect behavior.

**Steps:**
1. Create `ai-service/app/schemas/memory.py`:
   ```python
   class MemoryAnalysisRequest(BaseModel):
       cat_id: str
       memories: list[dict]  # { memory_type, description, importance, created_at }

   class MemoryAnalysisResponse(BaseModel):
       mood_modifier: float  # -1.0 to 1.0
       behavior_bias: str    # preferred action based on memories
       reason: str
   ```
2. Create `ai-service/app/services/memory_analyzer.py`:
   - If recent memories include "ignored" → mood -0.3, bias "sleep"
   - If recent memories include "praised" → mood +0.2, bias "work_job"
   - If "saved_money" → mood +0.1, bias "buy_food"
3. Create `ai-service/app/routers/memory.py` and register in `main.py`.

**Acceptance:** Memory analysis returns mood and behavior modifications.

---

## Phase 10: Mobile App — Screens

### Task 10.1 — Mobile: Navigation setup

**Project:** `mobile/`
**Goal:** Set up navigation structure with auth flow and main tabs.

**Steps:**
1. Create `mobile/src/navigation/AppNavigator.tsx`:
   - If not logged in → show Auth stack (Login, Register screens)
   - If logged in → show Main tab navigator (Home, Cats, House, Shop)
2. Create `mobile/src/navigation/types.ts` — define navigation param types.
3. Update `mobile/App.tsx` to render `<AppNavigator />` wrapped in `NavigationContainer`.

**Acceptance:** App shows login screen by default. After login, shows tab navigator.

---

### Task 10.2 — Mobile: Auth screens (Login + Register)

**Project:** `mobile/`
**Goal:** Create Login and Register screens.

**Steps:**
1. Create `mobile/src/screens/LoginScreen.tsx`:
   - Email and password text inputs
   - Login button → call `POST /auth/login`
   - "Create Account" link → navigate to Register
   - Store token in AsyncStorage on success
2. Create `mobile/src/screens/RegisterScreen.tsx`:
   - Email, password, player name inputs
   - Register button → call `POST /auth/register`
   - Store token and navigate to main app
3. Create `mobile/src/store/authStore.ts`:
   - Store/retrieve JWT from AsyncStorage
   - `isLoggedIn` state
   - `login(token)`, `logout()`, `getToken()` methods

**Acceptance:** User can register, login, and token persists across app restarts.

---

### Task 10.3 — Mobile: Home screen (Dashboard + Daily Report)

**Project:** `mobile/`
**Goal:** Create the main home screen showing daily report and overview.

**Steps:**
1. Create `mobile/src/screens/HomeScreen.tsx`:
   - On mount, call `GET /player/daily-report`
   - If `has_report: true`, show daily report modal/card:
     - "Welcome back! You were away for X hours"
     - "Salary earned: X coins"
     - Cat action summary list
     - Narrative text
   - After dismissing report, show dashboard:
     - Player name and level
     - Wallet balance
     - Cat summary cards (name, level, current action)
   - Pull-to-refresh

**Acceptance:** Home screen loads player data. Daily report shows after being away.

---

### Task 10.4 — Mobile: Cat list and detail screen

**Project:** `mobile/`
**Goal:** Create cat management screens.

**Steps:**
1. Create `mobile/src/screens/CatsScreen.tsx`:
   - Call `GET /cats` on mount
   - Display list of cats with: name, level, personality, energy bar, happiness bar
   - "Add Cat" button (if < 3 cats) → navigate to CreateCat
   - Tap cat → navigate to CatDetail
2. Create `mobile/src/screens/CatDetailScreen.tsx`:
   - Call `GET /cats/:catId`
   - Show: name, level, XP progress, care level, personality
   - Status bars: energy, happiness, hunger, stress
   - Action buttons: Feed, Cook, Send to Work
   - Recent memories list
3. Create `mobile/src/screens/CreateCatScreen.tsx`:
   - Name text input
   - Personality picker (chef, lazy, clean_freak, playful, random)
   - Create button → call `POST /cats`

**Acceptance:** User can view, create, and manage cats from the mobile app.

---

### Task 10.5 — Mobile: House screen

**Project:** `mobile/`
**Goal:** Create house management screen.

**Steps:**
1. Create `mobile/src/screens/HouseScreen.tsx`:
   - Call `GET /player/house` on mount
   - Display rooms as cards: Kitchen, Living Room, Bedroom, Bathroom
   - Each card shows: room name, level, bonus description
   - "Upgrade" button on each room → call `POST /player/house/rooms/:id/upgrade`
   - Show upgrade cost and confirm

**Acceptance:** User can view rooms and upgrade them.

---

### Task 10.6 — Mobile: Shop and inventory screen

**Project:** `mobile/`
**Goal:** Create shop and inventory screens.

**Steps:**
1. Create `mobile/src/screens/ShopScreen.tsx`:
   - Tab: Shop / Inventory
   - Shop tab: call `GET /economy/shop`, display items with buy button
   - Buy button → call `POST /economy/buy` with quantity selector
   - Show wallet balance at top
   - Inventory tab: call `GET /economy/inventory`, display owned items with quantities
2. Create `mobile/src/components/ItemCard.tsx` — reusable item display component.

**Acceptance:** User can browse shop, buy items, and view inventory.

---

### Task 10.7 — Mobile: Cat action screens (Feed, Cook, Jobs)

**Project:** `mobile/`
**Goal:** Create action modals/screens for cat interactions.

**Steps:**
1. Create `mobile/src/screens/FeedCatScreen.tsx`:
   - Show inventory food items
   - Tap item → call `POST /cats/:catId/feed`
   - Show updated status
2. Create `mobile/src/screens/CookScreen.tsx`:
   - Call `GET /economy/recipes`
   - Show available recipes with required ingredients
   - Highlight which ones the player can cook (has ingredients)
   - Tap recipe → call `POST /cats/:catId/cook`
3. Create `mobile/src/screens/JobsScreen.tsx`:
   - Call `GET /quests/jobs` and `GET /quests/active`
   - Show available jobs with reward and duration
   - "Send Cat" button → picker to select which cat → call `POST /quests/assign`
   - Show active jobs with countdown timer
   - "Collect" button when done → call `POST /quests/complete/:catJobId`

**Acceptance:** User can feed cats, cook recipes, and manage cat jobs from the app.

---

## Phase 11: Backend ↔ AI Service Integration

### Task 11.1 — Backend: HTTP client for AI service

**Project:** `backend/`
**Goal:** Create a reusable service to call the AI FastAPI service.

**Steps:**
1. Run `npm install @nestjs/axios axios` in `backend/`
2. Create `backend/src/ai/ai.module.ts` and `backend/src/ai/ai.service.ts`:
   ```typescript
   @Injectable()
   export class AiService {
     constructor(
       private httpService: HttpService,
       private configService: ConfigService,
     ) {}

     private get baseUrl() {
       return this.configService.get('aiService.url');
     }

     async generatePersonality(playerId: string, seed?: number) {
       const { data } = await firstValueFrom(
         this.httpService.post(`${this.baseUrl}/api/personality/generate`, { player_id: playerId, seed }),
       );
       return data;
     }

     async planBehavior(catId: string, catStatus: any, personality: any, economyState: any, playerState: any) {
       const { data } = await firstValueFrom(
         this.httpService.post(`${this.baseUrl}/api/behavior/plan`, {
           cat_id: catId, cat_status: catStatus, personality, economy_state: economyState, player_state: playerState,
         }),
       );
       return data;
     }

     async generateNarrative(catId: string, actions: string[], hours: number) {
       const { data } = await firstValueFrom(
         this.httpService.post(`${this.baseUrl}/api/narrative/generate`, {
           cat_id: catId, actions_taken: actions, time_elapsed_hours: hours,
         }),
       );
       return data;
     }

     async generateEvent(playerId: string, catId: string) {
       const { data } = await firstValueFrom(
         this.httpService.post(`${this.baseUrl}/api/events/random`, { player_id: playerId, cat_id: catId }),
       );
       return data;
     }
   }
   ```
3. Export `AiModule` and import it in modules that need AI (cat, player).

**Acceptance:** Backend can call all AI service endpoints. Fails gracefully if AI service is down.

---

### Task 11.2 — Backend: Wire AI into cat creation

**Project:** `backend/`
**Goal:** When creating a cat without personality, call AI service.

**Dependencies:** Task 11.1, Task 4.1

**Steps:**
1. Inject `AiService` into `CatService`
2. In `createCat()` — if no personality_type provided:
   - Call `aiService.generatePersonality(playerId)`
   - Map returned personality profile to a personality_type based on highest trait
   - Store personality values in cat entity
3. If AI service is down, fall back to random personality_type assignment.

**Acceptance:** Creating a cat without specifying personality calls AI and assigns one.

---

### Task 11.3 — Backend: Wire AI into daily report

**Project:** `backend/`
**Goal:** Daily report uses AI narrative generator.

**Dependencies:** Task 11.1, Task 8.3

**Steps:**
1. In the daily report endpoint:
   - After calculating cat actions, call `aiService.generateNarrative(catId, actions, hoursAway)` for each cat
   - Include narrative in response
   - If AI service is down, use a simple template fallback

**Acceptance:** Daily report includes AI-generated narrative text.

---

## Phase 12: MVP Polish

### Task 12.1 — Backend: Error handling and HTTP exceptions

**Project:** `backend/`
**Goal:** Add consistent error responses.

**Steps:**
1. Create `backend/src/common/filters/http-exception.filter.ts`:
   ```typescript
   @Catch(HttpException)
   export class HttpExceptionFilter implements ExceptionFilter {
     catch(exception: HttpException, host: ArgumentsHost) {
       const ctx = host.switchToHttp();
       const response = ctx.getResponse();
       const status = exception.getStatus();

       response.status(status).json({
         statusCode: status,
         message: exception.message,
         timestamp: new Date().toISOString(),
       });
     }
   }
   ```
2. Register as global filter in `main.ts`.

**Acceptance:** All errors return consistent `{ statusCode, message, timestamp }` format.

---

### Task 12.2 — Backend: Request logging middleware

**Project:** `backend/`
**Goal:** Log all incoming requests.

**Steps:**
1. Create `backend/src/common/middleware/logger.middleware.ts`:
   ```typescript
   @Injectable()
   export class LoggerMiddleware implements NestMiddleware {
     use(req: Request, res: Response, next: NextFunction) {
       console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
       next();
     }
   }
   ```
2. Apply in `app.module.ts` via `configure(consumer)`.

**Acceptance:** All requests are logged to console.

---

### Task 12.3 — Backend: CORS configuration

**Project:** `backend/`
**Goal:** Enable CORS for mobile app.

**Steps:**
1. Update `backend/src/main.ts`:
   ```typescript
   app.enableCors({
     origin: '*', // restrict in production
     methods: 'GET,POST,PATCH,DELETE',
   });
   ```

**Acceptance:** Mobile app can make API calls without CORS errors.

---

### Task 12.4 — Mobile: Loading states and error handling

**Project:** `mobile/`
**Goal:** Add loading spinners and error messages to all screens.

**Steps:**
1. Create `mobile/src/components/LoadingSpinner.tsx` — centered ActivityIndicator.
2. Create `mobile/src/components/ErrorMessage.tsx` — styled error text with retry button.
3. Update all screens to show loading while API calls are in progress.
4. Update all screens to show error message if API call fails.

**Acceptance:** Every screen shows loading indicator and handles errors gracefully.

---

### Task 12.5 — Mobile: Pull-to-refresh on list screens

**Project:** `mobile/`
**Goal:** Add pull-to-refresh to Home, Cats, Shop screens.

**Steps:**
1. Wrap scroll views with `RefreshControl` component.
2. On pull, re-fetch data from API.

**Acceptance:** Pulling down on list screens refreshes the data.

---

### Task 12.6 — Docker Compose for local development

**Project:** Root `cat-game/`
**Goal:** Create Docker Compose for PostgreSQL and Redis.

**Steps:**
1. Create `docker-compose.yml` at project root:
   ```yaml
   version: '3.8'
   services:
     postgres:
       image: postgres:16
       environment:
         POSTGRES_DB: cat_life
         POSTGRES_USER: postgres
         POSTGRES_PASSWORD: postgres
       ports:
         - "5432:5432"
       volumes:
         - pgdata:/var/lib/postgresql/data

     redis:
       image: redis:7-alpine
       ports:
         - "6379:6379"

   volumes:
     pgdata:
   ```

**Acceptance:** `docker-compose up -d` starts PostgreSQL and Redis. Backend can connect.

---

### Task 12.7 — README files for each project

**Project:** Root `cat-game/`
**Goal:** Create README with setup instructions.

**Steps:**
1. Create `cat-game/README.md`:
   - Project overview
   - Architecture diagram (text)
   - Setup instructions: Docker, backend, AI service, mobile
   - How to run each project
2. Update `backend/README.md` with NestJS-specific setup.
3. Create `ai-service/README.md` with FastAPI setup.

**Acceptance:** A new developer can set up the project by following the README.

---

## Dependency Summary

```
Phase 0 (Config)
  └── Phase 1 (Entities)
       └── Phase 2 (Auth) ─────────────────────────┐
            └── Phase 3 (Player) ──────────────────│──┐
            └── Phase 4 (Cat) ─────────────────────│──│──┐
            └── Phase 5 (Economy) ─────────────────│──│──│──┐
                 └── Phase 6 (Quests) ─────────────│──│──│──│
                 └── Phase 7 (Cooking) ────────────│──│──│──│
       Phase 8 (Offline) depends on Phases 3,4,5 ──┘──┘──┘──┘
       Phase 9 (AI Enhancements) — independent
       Phase 10 (Mobile Screens) depends on Phases 2-7
       Phase 11 (Integration) depends on Phases 4,8,9
       Phase 12 (Polish) — last
```

---

## Task Count Summary

| Phase | Description           | Tasks |
|-------|-----------------------|-------|
| 0     | Configuration         | 5     |
| 1     | Database Entities     | 12    |
| 2     | Authentication        | 4     |
| 3     | Player System         | 4     |
| 4     | Cat System            | 6     |
| 5     | Economy System        | 5     |
| 6     | Quest / Cat Jobs      | 4     |
| 7     | Cooking System        | 3     |
| 8     | Offline Progression   | 3     |
| 9     | AI Service Enhancements| 5    |
| 10    | Mobile App Screens    | 7     |
| 11    | Backend ↔ AI Integration| 3   |
| 12    | MVP Polish            | 7     |
| **Total** |                   | **68**|
