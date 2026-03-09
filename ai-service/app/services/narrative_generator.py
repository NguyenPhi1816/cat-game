import random


def generate_narrative(cat_name: str, actions: list[str], hours: float) -> str:
    templates = [
        f"While you were away for {hours:.0f} hours, {cat_name} was busy: {', '.join(actions)}.",
        f"{cat_name} spent the day productively. Tasks completed: {', '.join(actions)}.",
        f"Your cat {cat_name} took care of everything! Activities: {', '.join(actions)}.",
    ]
    return random.choice(templates)


EVENT_POOL = [
    ("random_treasure", "Cat found a shiny coin under the sofa!"),
    ("cat_sick", "Cat caught a cold and needs medicine."),
    ("new_recipe", "Cat discovered a new recipe: Tuna Surprise!"),
    ("visitor", "A stray cat visited and they became friends."),
    ("redecorate", "Cat rearranged the living room furniture."),
]


def generate_event() -> tuple[str, str]:
    return random.choice(EVENT_POOL)
