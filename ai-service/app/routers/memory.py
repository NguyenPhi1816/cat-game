from fastapi import APIRouter
from app.schemas.memory import MemoryAnalysisRequest, MemoryAnalysisResponse
from app.services.memory_analyzer import analyze_memories

router = APIRouter()


@router.post("/analyze", response_model=MemoryAnalysisResponse)
async def memory_analyze(request: MemoryAnalysisRequest):
    result = analyze_memories(request.memories)
    return MemoryAnalysisResponse(**result)
