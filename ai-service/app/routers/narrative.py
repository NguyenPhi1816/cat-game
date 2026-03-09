from fastapi import APIRouter
from app.schemas.narrative import NarrativeRequest, NarrativeResponse
from app.services.narrative_generator import generate_narrative

router = APIRouter()


@router.post("/generate", response_model=NarrativeResponse)
async def create_narrative(request: NarrativeRequest):
    summary = generate_narrative(
        cat_name=request.cat_id,
        actions=request.actions_taken,
        hours=request.time_elapsed_hours,
    )
    return NarrativeResponse(cat_id=request.cat_id, summary=summary)
