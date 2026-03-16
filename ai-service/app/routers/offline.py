from fastapi import APIRouter
from app.schemas.offline import OfflineSimRequest, OfflineSimResponse
from app.services.offline_simulator import simulate_offline

router = APIRouter()


@router.post("/simulate", response_model=OfflineSimResponse)
async def offline_simulate(request: OfflineSimRequest):
    result = simulate_offline(request.cats, request.hours_away, request.economy_state)
    return OfflineSimResponse(**result)
