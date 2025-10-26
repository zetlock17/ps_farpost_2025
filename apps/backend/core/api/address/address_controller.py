from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from utils.common_util import exception_handler
from utils.db_util import get_session_obj

from .address_schema import AddressSchema, DistrictSchema
from .address_service import AddressService

address_contoller = APIRouter()


@address_contoller.get("/")
@exception_handler
async def get_similar_addresses(
    input: str | None = None,
    session: AsyncSession = Depends(get_session_obj),
) -> list[AddressSchema]:
    address_service = AddressService(session=session)
    addresses = await address_service.get_similar_addresses(input=input)
    return addresses


@address_contoller.get("/districts")
@exception_handler
async def get_districts(
    session: AsyncSession = Depends(get_session_obj),
) -> list[DistrictSchema]:
    address_service = AddressService(session=session)
    districts = await address_service.get_districts()
    return districts