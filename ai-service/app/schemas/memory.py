from pydantic import BaseModel


class MemoryAnalysisRequest(BaseModel):
    cat_id: str
    memories: list[dict]   # { memory_type, description, importance, created_at }


class MemoryAnalysisResponse(BaseModel):
    mood_modifier: float   # -1.0 to 1.0
    behavior_bias: str     # preferred action based on memories
    reason: str
