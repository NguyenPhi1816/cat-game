from fastapi import APIRouter
from app.schemas.personality import PersonalityRequest, PersonalityResponse
from app.services.personality_engine import generate_personality
import uuid

router = APIRouter()


@router.post("/generate", response_model=PersonalityResponse)
async def create_personality(request: PersonalityRequest):
    profile = generate_personality(request.seed, request.player_preference)
    return PersonalityResponse(
        cat_id=str(uuid.uuid4()),
        personality=profile,
    )
