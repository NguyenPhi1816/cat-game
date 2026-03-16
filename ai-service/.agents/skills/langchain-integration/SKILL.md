---
name: langchain-integration
description: Use when adding or modifying LLM-powered logic in the AI service. Covers LangChain chains, prompts, LLM configuration for local CPU models (Phi-3 Mini, Llama 3 8B quantized, Mistral 7B quantized), and how to wire LangChain into existing FastAPI services.
version: 1.0.0
license: MIT
---

# LangChain Integration

**Use this skill when adding LLM reasoning to any service in `ai-service`.**

The AI service targets **CPU-only / low-VRAM environments** (no dedicated GPU).
All LLM usage must be compatible with quantized local models or a lightweight API backend.

## Supported Model Backends

### Option A — Local model via Ollama (recommended for development)

Run a model locally with [Ollama](https://ollama.com):

```bash
ollama pull phi3:mini        # Phi-3 Mini (~2 GB)
ollama pull llama3:8b-q4_0   # Llama 3 8B quantized (~5 GB)
ollama pull mistral:7b-q4_0  # Mistral 7B quantized (~4 GB)
```

Connect via `langchain-ollama`:

```python
from langchain_ollama import OllamaLLM

llm = OllamaLLM(model="phi3:mini")  # or "llama3:8b-q4_0", "mistral:7b-q4_0"
```

### Option B — OpenAI-compatible API (fallback / production)

```python
from langchain_openai import ChatOpenAI
from app.core.config import settings

llm = ChatOpenAI(
    model="gpt-4o-mini",
    api_key=settings.openai_api_key,
)
```

The `openai_api_key` is loaded from `.env` via `app/core/config.py`.

### Choosing the Backend

Wrap selection in a helper so the rest of the code doesn't care:

```python
# app/core/llm.py
from app.core.config import settings

def get_llm():
    if settings.openai_api_key:
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(model="gpt-4o-mini", api_key=settings.openai_api_key)

    from langchain_ollama import OllamaLLM
    return OllamaLLM(model=settings.local_model)  # default: "phi3:mini"
```

Add `local_model: str = "phi3:mini"` to `Settings` in `app/core/config.py`.

## Building a Chain

### Simple prompt → LLM → string output

```python
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from app.core.llm import get_llm

_prompt = PromptTemplate.from_template(
    "You are {cat_name}, a cat with the following traits: {personality}.\n"
    "The player has been away for {hours} hours.\n"
    "Write a short, warm summary (2-3 sentences) of what you did while they were gone.\n"
    "Actions: {actions}"
)

def build_narrative_chain():
    return _prompt | get_llm() | StrOutputParser()
```

### Invoking a chain from a service

```python
# app/services/narrative_generator.py
from functools import lru_cache
from app.chains.narrative import build_narrative_chain

@lru_cache(maxsize=1)
def _chain():
    return build_narrative_chain()

def generate_narrative(cat_name: str, actions: list[str], hours: float) -> str:
    return _chain().invoke({
        "cat_name": cat_name,
        "personality": "curious, kind, slightly lazy",
        "hours": hours,
        "actions": ", ".join(actions),
    })
```

Use `@lru_cache` so the chain (and LLM connection) is initialised once per process.

## Structured Output

Use `PydanticOutputParser` when the LLM must return structured data:

```python
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import PromptTemplate
from pydantic import BaseModel, Field
from app.core.llm import get_llm

class BehaviorDecision(BaseModel):
    action: str = Field(description="The action the cat will take")
    reason: str = Field(description="Why the cat chose this action")

parser = PydanticOutputParser(pydantic_object=BehaviorDecision)

prompt = PromptTemplate(
    template=(
        "You are a cat AI. Given the cat's status and personality, decide the next action.\n"
        "Cat status: {status}\nPersonality: {personality}\n"
        "{format_instructions}"
    ),
    input_variables=["status", "personality"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

chain = prompt | get_llm() | parser
```

## Keeping LLM Calls Out of Routers

Routers must stay thin. Never call `chain.invoke()` inside a router:

```python
# WRONG — LLM call in router
@router.post("/plan")
async def plan(request: BehaviorRequest):
    result = llm.invoke(...)   # ❌ business logic in router
    return result

# RIGHT — delegate to service
@router.post("/plan", response_model=BehaviorResponse)
async def plan(request: BehaviorRequest):
    action, reason = plan_behavior(request.cat_status, request.personality)  # ✅
    return BehaviorResponse(cat_id=request.cat_id, action=action, reason=reason)
```

## Running LLM Calls Async

LangChain chains support `ainvoke` for async handlers:

```python
@router.post("/generate", response_model=NarrativeResponse)
async def create_narrative(request: NarrativeRequest):
    summary = await narrative_chain().ainvoke({...})
    return NarrativeResponse(cat_id=request.cat_id, summary=summary)
```

For sync service functions called from async handlers, offload to a thread:

```python
import asyncio
from functools import partial

async def generate_narrative_async(cat_name: str, actions: list[str], hours: float) -> str:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        None, partial(generate_narrative, cat_name, actions, hours)
    )
```

## Prompt Design Guidelines

- Keep system prompts short — small models (Phi-3 Mini, 7B) perform better with concise, direct instructions.
- Always tell the model its role: `"You are a cat named {name}..."`.
- For structured output, always include `{format_instructions}` from `PydanticOutputParser`.
- Avoid multi-turn conversation for simple tasks; single-turn `PromptTemplate` chains are faster and more predictable on small models.

## Rules

- Never hard-code an API key — always read from `settings`.
- Always use `@lru_cache` or a module-level variable for chain instances (avoid re-creating the LLM on every request).
- Default to local Ollama when `openai_api_key` is empty.
- Keep prompts in dedicated files or `app/chains/` — not inside service functions.
- Test LLM integrations with `phi3:mini` first (fastest on CPU).
