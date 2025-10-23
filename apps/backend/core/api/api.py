from fastapi import APIRouter

from .blackout.blackout_contoller import blackout_contoller

api_controller = APIRouter()
api_controller.include_router(
    blackout_contoller, prefix="/blackout", tags=["Blackout"]
)
