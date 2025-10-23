from fastapi import APIRouter, Depends

from .blackout_schema import BlackoutFilter, BlackoutInfoSchema

blackout_contoller = APIRouter()


@blackout_contoller.get("/get")
async def get_blackouts(
    filter: BlackoutFilter = Depends(BlackoutFilter),
) -> list[BlackoutInfoSchema]:
    print(filter.type)
