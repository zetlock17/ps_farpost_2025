from fastapi import APIRouter

from .address.address_controller import address_contoller
from .blackout.blackout_contoller import blackout_contoller

api_controller = APIRouter()
api_controller.include_router(
    blackout_contoller, prefix="/blackout", tags=["Отключения"]
)
api_controller.include_router(
    address_contoller, prefix="/address", tags=["Адреса"]
)
