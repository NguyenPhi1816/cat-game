import random

from app.schemas.personality import PersonalityProfile


def _bias(base: float, delta: float) -> float:
    return round(min(1.0, max(0.1, base + delta)), 2)


def generate_personality(seed: int | None = None, player_preference: str | None = None) -> PersonalityProfile:
    rng = random.Random(seed)
    kindness    = round(rng.uniform(0.1, 1.0), 2)
    laziness    = round(rng.uniform(0.1, 1.0), 2)
    curiosity   = round(rng.uniform(0.1, 1.0), 2)
    playfulness = round(rng.uniform(0.1, 1.0), 2)
    cleanliness = round(rng.uniform(0.1, 1.0), 2)

    if player_preference:
        pref = player_preference.lower()
        if any(kw in pref for kw in ("active", "energetic", "playful", "hyper")):
            curiosity   = _bias(curiosity,   +0.3)
            playfulness = _bias(playfulness, +0.3)
            laziness    = _bias(laziness,    -0.3)
        elif any(kw in pref for kw in ("calm", "lazy", "chill", "relax")):
            laziness    = _bias(laziness,    +0.3)
            playfulness = _bias(playfulness, -0.2)
        elif any(kw in pref for kw in ("clean", "tidy", "neat", "organized")):
            cleanliness = _bias(cleanliness, +0.35)
            laziness    = _bias(laziness,    -0.2)
        elif any(kw in pref for kw in ("kind", "gentle", "sweet", "friendly")):
            kindness    = _bias(kindness,    +0.35)

    return PersonalityProfile(
        kindness=kindness,
        laziness=laziness,
        curiosity=curiosity,
        playfulness=playfulness,
        cleanliness=cleanliness,
    )
