from fastapi import APIRouter
from app.schemas.behavior import BehaviorRequest, BehaviorResponse
from app.services.behavior_planner import plan_behavior

router = APIRouter()


@router.post("/plan", response_model=BehaviorResponse)
async def plan(request: BehaviorRequest):
    action, reason = plan_behavior(request.cat_status, request.personality)
    return BehaviorResponse(
        cat_id=request.cat_id,
        action=action,
        reason=reason,
    )
