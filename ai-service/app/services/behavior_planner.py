from app.schemas.behavior import CatStatus

ACTIONS = ["work_job", "buy_food", "clean_house", "play_with_player", "sleep", "cook_meal"]


def plan_behavior(cat_status: CatStatus, personality: dict) -> tuple[str, str]:
    if cat_status.energy < 0.2:
        return "sleep", "Energy too low, needs rest."

    if cat_status.hunger > 0.7:
        return "buy_food", "Cat is hungry and needs food."

    if cat_status.happiness < 0.3:
        return "play_with_player", "Cat needs happiness boost."

    laziness = personality.get("laziness", 0.5)
    if laziness > 0.7:
        return "sleep", "Cat is feeling lazy today."

    cleanliness = personality.get("cleanliness", 0.5)
    if cleanliness > 0.6:
        return "clean_house", "Cat wants to keep things tidy."

    return "work_job", "Cat decides to earn some coins."
