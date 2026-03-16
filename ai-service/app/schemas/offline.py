from pydantic import BaseModel


class OfflineSimRequest(BaseModel):
    player_id: str
    cats: list[dict]       # cat data with status and personality
    hours_away: float
    economy_state: dict


class OfflineSimResponse(BaseModel):
    cat_actions: list[dict]
    events: list[dict]
    narrative: str
