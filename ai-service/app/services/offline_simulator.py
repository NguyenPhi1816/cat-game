import random

from app.schemas.behavior import CatStatus
from app.services.behavior_planner import plan_behavior
from app.services.narrative_generator import generate_event, generate_narrative


def simulate_offline(cats: list[dict], hours_away: float, economy_state: dict) -> dict:
    cat_actions: list[dict] = []
    events: list[dict] = []
    narrative_parts: list[str] = []

    for cat in cats:
        cat_id = cat.get("id", "unknown")
        cat_name = cat.get("name", "Your cat")
        personality = cat.get("personality", {})
        personality_type = cat.get("personality_type", "playful")
        status_data = cat.get("status", {})

        cat_status = CatStatus(
            hunger=status_data.get("hunger", 0.3),
            happiness=status_data.get("happiness", 0.8),
            stress=status_data.get("stress", 0.1),
            energy=status_data.get("energy", 1.0),
        )

        actions: list[str] = []
        simulated_hours = int(hours_away)

        for hour in range(simulated_hours):
            player_state = {"last_login_hours_ago": hour}
            action, _ = plan_behavior(cat_status, personality, economy_state, player_state)
            actions.append(action)

            # Update simulated status each hour
            cat_status.energy = max(0.0, cat_status.energy - 0.1)
            cat_status.hunger = min(1.0, cat_status.hunger + 0.1)

            # 10% chance of a random event per hour
            if random.random() < 0.1:
                event_type, description = generate_event()
                events.append({"cat_id": cat_id, "event_type": event_type, "description": description})

        xp_gained = len(actions) * 5
        narrative = generate_narrative(cat_name, actions, hours_away, personality_type)
        narrative_parts.append(narrative)

        cat_actions.append({
            "cat_id": cat_id,
            "cat_name": cat_name,
            "actions": actions,
            "xp_gained": xp_gained,
        })

    combined_narrative = " ".join(narrative_parts) if narrative_parts else "Your cats kept things in order while you were away."
    return {
        "cat_actions": cat_actions,
        "events": events,
        "narrative": combined_narrative,
    }
