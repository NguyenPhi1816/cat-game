import random


TEMPLATES_BY_PERSONALITY: dict[str, list[str]] = {
    "chef": [
        "While you were away for {hours:.0f} hours, {name} cooked up a storm: {actions}.",
        "{name} took charge of the kitchen and whipped up something delicious. Tasks: {actions}.",
        "Chef {name} kept busy experimenting with new recipes. Activities: {actions}.",
    ],
    "lazy": [
        "Your cat {name} reluctantly handled a few things while you were gone: {actions}.",
        "{name} yawned their way through {hours:.0f} hours and managed to: {actions}.",
        "After several long naps, {name} finally got around to: {actions}.",
    ],
    "clean_freak": [
        "While you were away, {name} scrubbed every corner spotless. Tasks: {actions}.",
        "{name} couldn't stand the mess and got straight to work: {actions}.",
        "Your tidy cat {name} spent {hours:.0f} hours maintaining order. Activities: {actions}.",
    ],
    "playful": [
        "While you were away, {name} had an absolute blast and also managed: {actions}.",
        "{name} bounced around for {hours:.0f} hours and somehow completed: {actions}.",
        "Between games and zoomies, {name} found time to: {actions}.",
    ],
}

TEMPLATES_GENERIC: list[str] = [
    "While you were away for {hours:.0f} hours, {name} was busy: {actions}.",
    "{name} spent the day productively. Tasks completed: {actions}.",
    "Your cat {name} took care of everything! Activities: {actions}.",
    "In your {hours:.0f}-hour absence, {name} kept the household running: {actions}.",
    "{name} didn't waste a moment while you were out. Here's what happened: {actions}.",
    "Home was in good hands — {name} handled: {actions}.",
    "You can always count on {name}. During your absence they completed: {actions}.",
    "Things were lively while you were away. {name} took care of: {actions}.",
    "{hours:.0f} hours flew by for {name}, who was occupied with: {actions}.",
    "Returning home, you find {name} looking satisfied after: {actions}.",
]


def generate_narrative(
    cat_name: str,
    actions: list[str],
    hours: float,
    personality_type: str | None = None,
) -> str:
    action_str = ", ".join(actions) if actions else "resting quietly"
    pool = TEMPLATES_BY_PERSONALITY.get(personality_type or "", TEMPLATES_GENERIC)
    template = random.choice(pool)
    return template.format(name=cat_name, actions=action_str, hours=hours)


EVENT_POOL = [
    ("random_treasure", "Cat found a shiny coin under the sofa!"),
    ("cat_sick", "Cat caught a cold and needs medicine."),
    ("new_recipe", "Cat discovered a new recipe: Tuna Surprise!"),
    ("visitor", "A stray cat visited and they became friends."),
    ("redecorate", "Cat rearranged the living room furniture."),
]


def generate_event() -> tuple[str, str]:
    return random.choice(EVENT_POOL)
