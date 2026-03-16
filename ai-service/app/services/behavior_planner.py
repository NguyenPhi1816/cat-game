from app.schemas.behavior import CatStatus

ACTIONS = ["work_job", "buy_food", "clean_house", "play_with_player", "sleep", "cook_meal"]


def plan_behavior(cat_status: CatStatus, personality: dict, economy_state: dict | None = None, player_state: dict | None = None) -> tuple[str, str]:
    economy_state = economy_state or {}
    player_state = player_state or {}

    money = economy_state.get("money", 100)
    hours_ago = player_state.get("last_login_hours_ago", 0)

    if cat_status.energy < 0.2:
        return "sleep", "Energy too low, needs rest."

    if cat_status.hunger > 0.7:
        return "buy_food", "Cat is hungry and needs food."

    if cat_status.happiness < 0.3:
        return "play_with_player", "Cat needs happiness boost."

    # Economy-aware decisions
    if money < 20:
        return "work_job", "Money is tight — time to earn some coins."

    if hours_ago > 4:
        return "clean_house", "Player was away a long time, house needs tidying."

    laziness = personality.get("laziness", 0.5)
    if laziness > 0.7:
        return "sleep", "Cat is feeling lazy today."

    cleanliness = personality.get("cleanliness", 0.5)
    if cleanliness > 0.6:
        return "clean_house", "Cat wants to keep things tidy."

    if money > 200:
        return "buy_food", "Plenty of money — stocking up on food."

    return "work_job", "Cat decides to earn some coins."
