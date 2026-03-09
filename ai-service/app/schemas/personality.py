from pydantic import BaseModel


class PersonalityProfile(BaseModel):
    kindness: float
    laziness: float
    curiosity: float
    playfulness: float
    cleanliness: float


class PersonalityRequest(BaseModel):
    seed: int | None = None
    player_id: str


class PersonalityResponse(BaseModel):
    cat_id: str
    personality: PersonalityProfile
