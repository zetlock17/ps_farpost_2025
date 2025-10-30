from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from core.utils.common_util import exception_handler
from core.utils.db_util import get_session_obj

from .address_schema import AddressSchema, DistrictSchema
from .address_service import AddressService

address_contoller = APIRouter()

@address_contoller.get(
    "/",
    summary="Поиск похожих адресов по вводу пользователя",
    response_description="Список адресов, соответствующих поисковому запросу.",
)
@exception_handler
async def get_similar_addresses(
    input: str | None = Query(
        None,
        description="Ввод пользователя в поисковую строку. Может содержать часть улицы, дома или их комбинацию.",
        example="светЛанская 1"
    ),
    session: AsyncSession = Depends(get_session_obj),
) -> list[AddressSchema]:
    address_service = AddressService(session=session)
    addresses = await address_service.get_similar_addresses(input=input)
    return addresses


@address_contoller.get(
    "/districts",
    summary="Получение списка всех доступных районов",
    response_description="Список официальных, народных и крупных народных районов.",
)
@exception_handler
async def get_districts(
    session: AsyncSession = Depends(get_session_obj),
) -> list[DistrictSchema]:
    address_service = AddressService(session=session)
    districts = await address_service.get_districts()
    return districts