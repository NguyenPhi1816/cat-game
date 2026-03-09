from pydantic import BaseModel


class CatStatus(BaseModel):
    hunger: float
    happiness: float
    stress: float
    energy: float


class BehaviorRequest(BaseModel):
    cat_id: str
    cat_status: CatStatus
    personality: dict
    economy_state: dict
    player_state: dict


class BehaviorResponse(BaseModel):
    cat_id: str
    action: str
    reason: str
