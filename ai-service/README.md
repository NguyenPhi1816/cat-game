# AI Cat Life — AI Service

Python FastAPI service providing AI-powered features for the cat game.

## Stack

- FastAPI
- LangChain (agent framework)
- Lightweight LLM: Phi-3 Mini / Llama 3 8B (quantized) / Mistral 7B (quantized)
- Stable Diffusion 1.5 + LCM LoRA (offline asset generation)

> Optimized for CPU / low-VRAM environments (AMD Ryzen, integrated graphics).

## Setup

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### Environment variables

```env
MODEL_NAME=phi3-mini
MODEL_PATH=./models/
```

## Running

```bash
uvicorn app.main:app --reload --port 8000
```

## API Endpoints

| Method | Path                       | Description                        |
|--------|----------------------------|------------------------------------|
| POST   | /api/personality/generate  | Generate cat personality traits    |
| POST   | /api/behavior/plan         | Plan cat behavior actions          |
| POST   | /api/narrative/generate    | Generate offline narrative summary |
| POST   | /api/events/generate       | Generate random game events        |
| POST   | /api/memory/analyze        | Analyze cat memory patterns        |
| POST   | /api/offline/simulate      | Simulate offline cat actions       |

## Image Generation

Asset generation (chibi characters, chibi cats) runs as an **offline pipeline** — not during gameplay.

Model: Stable Diffusion 1.5 + LCM LoRA
Resolution: 512x512
Runtime: CPU or low-VRAM (< 4GB)