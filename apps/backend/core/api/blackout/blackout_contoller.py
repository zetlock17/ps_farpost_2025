from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from utils.common_util import exception_handler
from utils.db_util import get_session_obj, get_session_weather_obj

from .blackout_schema import (
    BlackoutByAddressFilterSchema,
    BlackoutByAddressListSchema,
    BlackoutInfoSchema,
    BlackoutListFilterSchema,
)
from .blackout_service import BlackoutService

blackout_contoller = APIRouter()


@blackout_contoller.get("/")
@exception_handler
async def get_blackout_list(
    filter: BlackoutListFilterSchema = Depends(BlackoutListFilterSchema),
    session: AsyncSession = Depends(get_session_obj),
) -> list[BlackoutInfoSchema]:
    blackout_service = BlackoutService(session=session)
    blackouts = await blackout_service.get_blackout_list(filter=filter)
    return blackouts

@blackout_contoller.get("/by_address")
@exception_handler
async def get_blackout_by_address(
    filter: BlackoutByAddressFilterSchema = Depends(BlackoutByAddressFilterSchema),
    session: AsyncSession = Depends(get_session_obj),
    weather_session: AsyncSession = Depends(get_session_weather_obj)
) -> BlackoutByAddressListSchema:
    blackout_service = BlackoutService(session=session, weather_session=weather_session)
    blackouts = await blackout_service.get_blackouts_by_address(filter=filter)
    return blackouts
