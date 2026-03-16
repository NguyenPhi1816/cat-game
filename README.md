# AI Cat Life

A mobile idle game where cats manage the player's household while they're away. Built with React Native, NestJS, and a Python AI service.

## Architecture

```
cat-game/
├── mobile/          React Native (Expo) — iOS & Android app
├── backend/         NestJS — REST API
├── ai-service/      Python FastAPI — AI personality & narrative engine
└── docker-compose.yml
```

```
Mobile App
    │
    │ HTTP (REST)
    ▼
NestJS Backend  ──────────── PostgreSQL
    │
    │ HTTP (internal)
    ▼
Python AI Service (FastAPI + LangChain)
```

## Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose

## Quick Start

### 1. Start the database

```bash
docker-compose up -d
```

### 2. Backend API

```bash
cd backend
cp .env.example .env   # fill in DB credentials
npm install
npm run start:dev
# Runs on http://localhost:3000
```

### 3. AI Service

```bash
cd ai-service
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
# Runs on http://localhost:8000
```

### 4. Mobile App

```bash
cd mobile
npm install
npx expo start
# Scan QR code with Expo Go app
```

### Run everything (Windows)

Run the convenience PowerShell script which starts Docker infra and opens each service in its own PowerShell window:

```powershell
./run-all.ps1
```

### Run everything (macOS / Linux)

Run the shell script which starts Docker infra and background-starts each service:

```bash
./run-all.sh
```

## Environment Variables

| Service    | File              | Key variables                            |
| ---------- | ----------------- | ---------------------------------------- |
| backend    | `backend/.env`    | DATABASE\_\*, JWT_SECRET, AI_SERVICE_URL |
| ai-service | `ai-service/.env` | MODEL_NAME, MODEL_PATH                   |
| mobile     | `mobile/.env`     | EXPO_PUBLIC_API_URL                      |

## Key Features

- Up to 3 cats per player with AI-generated personalities
- Upgradeable rooms that boost cat stats
- Idle economy — earn coins while offline
- Cooking system with recipes and ingredients
- Cat jobs with timed completion and rewards
- AI-generated narrative summaries of offline activity
