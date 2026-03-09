from pydantic import BaseModel


class NarrativeRequest(BaseModel):
    cat_id: str
    actions_taken: list[str]
    time_elapsed_hours: float


class NarrativeResponse(BaseModel):
    cat_id: str
    summary: str


class EventRequest(BaseModel):
    player_id: str
    cat_id: str


class EventResponse(BaseModel):
    event_type: str
    description: str
