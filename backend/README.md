# AI Cat Life — Backend

NestJS REST API for the AI Cat Life game.

## Stack

- NestJS + TypeScript
- TypeORM + PostgreSQL
- Passport JWT authentication
- HttpModule for AI service communication

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your database credentials
```

### Required environment variables

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=cat_life
JWT_SECRET=your-secret-key
AI_SERVICE_URL=http://localhost:8000
```

## Running

```bash
# Development (watch mode)
npm run start:dev

# Production build
npm run build
npm run start:prod
```

## API Modules

| Module   | Prefix        | Description                        |
|----------|---------------|------------------------------------|
| Auth     | /auth         | Register, login, JWT               |
| Player   | /player       | Profile, house, daily report       |
| Cats     | /cats         | CRUD, feed, cook                   |
| Economy  | /economy      | Wallet, shop, inventory, recipes   |
| Quest    | /quest        | Jobs — assign and complete         |

## Notes

- `TypeORM synchronize: true` is enabled in development. Disable in production.
- All errors return `{ statusCode, message, timestamp }` format.
- AI service calls fail gracefully — gameplay continues if AI is offline.