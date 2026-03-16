def analyze_memories(memories: list[dict]) -> dict:
    mood_modifier = 0.0
    behavior_bias = "work_job"
    reasons: list[str] = []

    # Weight recent memories more heavily (first in list = most recent)
    for i, memory in enumerate(memories):
        memory_type = memory.get("memory_type", "")
        importance = float(memory.get("importance", 1.0))
        recency_weight = 1.0 if i < 3 else 0.5

        weight = importance * recency_weight

        if memory_type == "ignored":
            mood_modifier -= 0.3 * weight
            behavior_bias = "sleep"
            reasons.append("Cat was ignored recently")
        elif memory_type == "praised":
            mood_modifier += 0.2 * weight
            behavior_bias = "work_job"
            reasons.append("Cat was praised recently")
        elif memory_type == "saved_money":
            mood_modifier += 0.1 * weight
            behavior_bias = "buy_food"
            reasons.append("Cat saved money recently")
        elif memory_type == "got_sick":
            mood_modifier -= 0.2 * weight
            behavior_bias = "sleep"
            reasons.append("Cat was sick recently")
        elif memory_type in ("completed_job", "cooked_meal"):
            mood_modifier += 0.1 * weight
            if behavior_bias not in ("sleep",):
                behavior_bias = "work_job"
            reasons.append(f"Cat completed {memory_type.replace('_', ' ')}")

    # Clamp to [-1.0, 1.0]
    mood_modifier = round(max(-1.0, min(1.0, mood_modifier)), 2)
    reason = "; ".join(reasons[:3]) if reasons else "No significant memories"

    return {
        "mood_modifier": mood_modifier,
        "behavior_bias": behavior_bias,
        "reason": reason,
    }
