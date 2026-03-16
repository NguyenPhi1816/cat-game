---
name: fastapi-ai-endpoints
description: Use when adding, editing, or debugging any FastAPI endpoint in the AI service. Covers the router/schema/service pattern, Pydantic models, project structure, and how to wire a new feature end-to-end.
version: 1.0.0
license: MIT
---

# FastAPI AI Endpoints

**Use this skill for any work involving FastAPI routes, Pydantic schemas, or service logic in the `ai-service` project.**

## Project Structure

```
ai-service/
  app/
    main.py              App entry point — registers all routers
    core/
      config.py          Settings via pydantic-settings (.env)
    routers/             One file per feature — defines APIRouter and HTTP handlers
    schemas/             Pydantic request/response models for each feature
    services/            Pure Python business logic — no FastAPI imports
  requirements.txt
```

The pattern is always: **router → schema → service**.
Routers are thin. All logic lives in services. Schemas define the contract.

## Adding a New Endpoint (End-to-End)

### 1. Define schemas (`app/schemas/<feature>.py`)

```python
from pydantic import BaseModel

class MemoryRequest(BaseModel):
    cat_id: str
    event: str
    importance: float = 1.0

class MemoryResponse(BaseModel):
    cat_id: str
    stored: bool
    memory_id: str
```

### 2. Implement service logic (`app/services/<feature>.py`)

```python
import uuid

def store_memory(cat_id: str, event: str, importance: float) -> tuple[bool, str]:
    # Pure logic — no FastAPI, no HTTP concerns
    memory_id = str(uuid.uuid4())
    # TODO: persist to database
    return True, memory_id
```

### 3. Create the router (`app/routers/<feature>.py`)

```python
from fastapi import APIRouter
from app.schemas.memory import MemoryRequest, MemoryResponse
from app.services.memory_service import store_memory

router = APIRouter()

@router.post("/store", response_model=MemoryResponse)
async def store_cat_memory(request: MemoryRequest):
    stored, memory_id = store_memory(
        cat_id=request.cat_id,
        event=request.event,
        importance=request.importance,
    )
    return MemoryResponse(cat_id=request.cat_id, stored=stored, memory_id=memory_id)
```

### 4. Register in `app/main.py`

```python
from app.routers import personality, behavior, narrative, events, memory  # add import

app.include_router(memory.router, prefix="/api/memory", tags=["Memory"])
```

## Existing Routers

| Router     | Prefix              | Key endpoint          |
|------------|---------------------|-----------------------|
| personality | `/api/personality` | `POST /generate`      |
| behavior    | `/api/behavior`    | `POST /plan`          |
| narrative   | `/api/narrative`   | `POST /generate`      |
| events      | `/api/events`      | `POST /random`        |

## Existing Schemas

**PersonalityProfile** — `kindness`, `laziness`, `curiosity`, `playfulness`, `cleanliness` (all `float`)

**CatStatus** — `hunger`, `happiness`, `stress`, `energy` (all `float`)

**BehaviorRequest** — `cat_id: str`, `cat_status: CatStatus`, `personality: dict`, `economy_state: dict`, `player_state: dict`

**NarrativeRequest** — `cat_id: str`, `actions_taken: list[str]`, `time_elapsed_hours: float`

**EventRequest** — `player_id: str`, `cat_id: str`

## Configuration

Settings are loaded from `.env` via `pydantic-settings`:

```python
# app/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://localhost:5432/cat_life_ai"
    redis_url: str = "redis://localhost:6379"
    openai_api_key: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
```

Import anywhere with:

```python
from app.core.config import settings
```

## Running the Service

```bash
uvicorn app.main:app --reload
```

Interactive docs available at `http://localhost:8000/docs`.

Health check: `GET /health` → `{"status": "ok"}`

## Error Handling

Use FastAPI's `HTTPException` for expected errors:

```python
from fastapi import HTTPException

@router.get("/{cat_id}")
async def get_cat(cat_id: str):
    result = find_cat(cat_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Cat not found")
    return result
```

## Async vs Sync

- Use `async def` for handlers that will `await` database/HTTP calls.
- Use regular `def` in service functions that are CPU-bound (LLM inference, random logic).
- Never `await` inside a sync service function — use `asyncio.run_in_executor` if needed.

## Rules

- Routers must only import from `schemas` and `services` — never cross-import between routers.
- Services must have no FastAPI imports (`APIRouter`, `HTTPException`, etc.).
- All request/response bodies must be Pydantic `BaseModel` subclasses.
- Always specify `response_model` on route decorators.
- Use `float` for all 0.0–1.0 stat fields (hunger, energy, personality traits, etc.).
