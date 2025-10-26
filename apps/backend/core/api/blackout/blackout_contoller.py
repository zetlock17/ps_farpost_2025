from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from utils.common_util import exception_handler
from utils.db_util import get_session_obj

from .blackout_schema import BlackoutFilterSchema, BlackoutInfoSchema
from .blackout_service import BlackoutService

blackout_contoller = APIRouter()


@blackout_contoller.get("/")
@exception_handler
async def get_blackouts(
    filter: BlackoutFilterSchema = Depends(BlackoutFilterSchema),
    session: AsyncSession = Depends(get_session_obj),
) -> list[BlackoutInfoSchema]:
    blackout_service = BlackoutService(session=session)
    blackouts = await blackout_service.get_blackouts(filter=filter)
    return blackouts
