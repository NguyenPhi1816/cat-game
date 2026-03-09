from fastapi import APIRouter
from app.schemas.narrative import EventRequest, EventResponse
from app.services.narrative_generator import generate_event

router = APIRouter()


@router.post("/random", response_model=EventResponse)
async def random_event(request: EventRequest):
    event_type, description = generate_event()
    return EventResponse(event_type=event_type, description=description)
