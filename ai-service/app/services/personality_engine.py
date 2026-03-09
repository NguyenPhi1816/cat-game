import random

from app.schemas.personality import PersonalityProfile


def generate_personality(seed: int | None = None) -> PersonalityProfile:
    rng = random.Random(seed)
    return PersonalityProfile(
        kindness=round(rng.uniform(0.1, 1.0), 2),
        laziness=round(rng.uniform(0.1, 1.0), 2),
        curiosity=round(rng.uniform(0.1, 1.0), 2),
        playfulness=round(rng.uniform(0.1, 1.0), 2),
        cleanliness=round(rng.uniform(0.1, 1.0), 2),
    )
