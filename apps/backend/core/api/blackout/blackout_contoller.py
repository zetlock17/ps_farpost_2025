from fastapi import APIRouter, Depends, status
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


@blackout_contoller.get(
    "/",
    summary="Получение списка всех отключений с возможностью фильтрации",
    response_description="Список отключений, отфильтрованных по типу, дате или району.",
)
@exception_handler
async def get_blackout_list(
    filter: BlackoutListFilterSchema = Depends(BlackoutListFilterSchema),
    session: AsyncSession = Depends(get_session_obj),
) -> list[BlackoutInfoSchema]:
    blackout_service = BlackoutService(session=session)
    blackouts = await blackout_service.get_blackout_list(filter=filter)
    return blackouts


@blackout_contoller.get(
    "/by_address",
    summary="Получение актуальных отключений для конкретного здания с прогнозом",
    response_description="Актуальные отключения для здания, прогнозная дата окончания и список соседних отключений.",
    responses={
        status.HTTP_404_NOT_FOUND: {
            "content": {
                "application/json": {
                    "example": {"detail": 'объект "здание" не найден'}
                }
            }
        },
        status.HTTP_200_OK: {
            "description": "Успешный возврат данных об отключениях."
        }
    }
)
@exception_handler
async def get_blackout_by_address(
    filter: BlackoutByAddressFilterSchema = Depends(BlackoutByAddressFilterSchema),
    session: AsyncSession = Depends(get_session_obj),
    weather_session: AsyncSession = Depends(get_session_weather_obj)
) -> BlackoutByAddressListSchema:
    blackout_service = BlackoutService(session=session, weather_session=weather_session)
    blackouts = await blackout_service.get_blackouts_by_address(filter=filter)
    return blackouts
