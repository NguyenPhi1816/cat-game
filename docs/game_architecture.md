# Game Architecture -- AI Cat Life

## 1. Overview

AI Cat Life is a mobile idle/management game where **cats take care of
the player** instead of the player taking care of the cats.

Tech stack: - Mobile App: React Native - Backend API: NestJS - AI
Service: Python (FastAPI) - Database: PostgreSQL - Realtime/Async:
Redis + Queue - AI Agent Logic: Python service

System architecture follows a **microservice-inspired modular design**
so AI systems can evolve independently.

------------------------------------------------------------------------

# 2. High Level Architecture

Mobile Client (React Native) \| API Gateway (NestJS) \|
------------------------------------------------- \| User Service \|
Game Service \| Economy Service \|
------------------------------------------------- \| Database
(PostgreSQL)

AI Layer Python AI Service (FastAPI) \| AI Agent Engine \| Event / Task
Queue

------------------------------------------------------------------------

# 3. Components

## 3.1 Mobile App (React Native)

Responsibilities: - Player login / account - Game UI - Cat interaction -
Notifications - Offline progress visualization

Key modules: - UI Screens - Game State Manager - Local Cache - API
Client

------------------------------------------------------------------------

## 3.2 Backend (NestJS)

Responsibilities: - Authentication - Player data management - Economy
balancing - Cat state persistence - Offline progress calculation

Modules: - Auth Module - Player Module - Cat Module - Economy Module -
Quest Module

------------------------------------------------------------------------

## 3.3 AI Service (Python)

Framework: FastAPI

Responsibilities: - Cat personality generation - Cat behavior
decisions - Story generation - Player event interpretation

Sub-systems:

AI Personality Engine\
Behavior Planner\
Narrative Generator\
Emotion Simulation

See **Section 8** for AI model configuration details.

------------------------------------------------------------------------

## 4. Communication Flow

Player Action ↓ React Native ↓ NestJS API ↓ Database update ↓ AI service
triggered (if needed) ↓ AI returns decision ↓ Game state updated

------------------------------------------------------------------------

## 5. Offline Simulation

When player offline:

Backend simulates:

time_passed = now - last_login

Cats will: - Work jobs - Earn money - Buy items - Improve house -
Trigger events

AI may generate story summaries.

------------------------------------------------------------------------

## 6. AI Driven Gameplay

Cats make decisions like:

-   Should I work today?
-   Should I buy food for the human?
-   Should I decorate the house?
-   Should I wake the human?

AI model inputs:

-   Player state
-   Cat personality
-   World state
-   Economy

Outputs:

Action plan for the cat.

------------------------------------------------------------------------

## 7. Scalability

AI Service scalable independently.

Use queue system:

NestJS -\> Task Queue -\> AI Worker

------------------------------------------------------------------------

## 8. AI Model Configuration

The system is optimized for **low hardware environments** (CPU or very
low VRAM). All AI models are selected to run efficiently without a
dedicated GPU.

Target hardware: CPU-only or integrated graphics (e.g. AMD Ryzen 7
5000 Series with no discrete GPU).

------------------------------------------------------------------------

### 8.1 Gameplay AI Model

Used for cat intelligence and all in-game reasoning tasks.

Recommended models (choose one):

-   **Phi-3 Mini** (preferred for lowest resource usage)
-   **Llama 3 8B** (quantized)
-   **Mistral 7B** (quantized)

These models run locally via the Python AI Service or can be accessed
through a remote API if local resources are insufficient.

Used for:

-   Cat personality reasoning
-   Behavior planning
-   Event generation
-   Narrative summaries

Frameworks:

-   FastAPI (service layer)
-   LangChain or similar agent framework (orchestration)

------------------------------------------------------------------------

### 8.2 Image Generation Model

Used to generate game assets as an **offline pipeline** (not during
gameplay).

Base model: **Stable Diffusion 1.5**

Optimization: **LCM LoRA** (for fast CPU inference)

Output resolution: 512x512

Used for:

-   Chibi character sprites
-   Chibi cat assets
-   Simple background / item assets

This pipeline runs separately from the live game service and produces
static assets that are bundled or downloaded by the client.
