from fastapi import FastAPI
from app.routers import personality, behavior, narrative, events

app = FastAPI(
    title="AI Cat Life - AI Service",
    description="AI service for cat personality, behavior planning, and narrative generation",
    version="0.1.0",
)

app.include_router(personality.router, prefix="/api/personality", tags=["Personality"])
app.include_router(behavior.router, prefix="/api/behavior", tags=["Behavior"])
app.include_router(narrative.router, prefix="/api/narrative", tags=["Narrative"])
app.include_router(events.router, prefix="/api/events", tags=["Events"])


@app.get("/health")
async def health_check():
    return {"status": "ok"}
