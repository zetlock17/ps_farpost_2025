from models.models import (
    BigFolkDistrictOrm,
    BlackoutBuildingOrm,
    BlackoutOrm,
    BuildingOrm,
    CityOrm,
    DistrictOrm,
    FolkDistrictOrm,
    StreetOrm,
)
from sqlalchemy import JSON, and_, func, or_, select, type_coerce
from sqlalchemy.ext.asyncio import AsyncSession

from .blackout_schema import BlackoutFilterSchema


class BlackoutRepository:

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_blackouts(self, filter: BlackoutFilterSchema):
        stmt = (
            select(
                BlackoutOrm.id,
                BlackoutOrm.start_date,
                BlackoutOrm.end_date,
                BlackoutOrm.description,
                BlackoutOrm.type,
                BuildingOrm.number.label("building_number"),
                type_coerce(
                    func.json_object(
                        "latitude",
                        func.coalesce(
                            func.json_extract(BuildingOrm.coordinates, "$[0].lat"), 0.0
                        ),
                        "longitude",
                        func.coalesce(
                            func.json_extract(BuildingOrm.coordinates, "$[0].lon"), 0.0
                        ),
                    ),
                    JSON,
                ).label("coordinates"),
                StreetOrm.name.label("street"),
                DistrictOrm.name.label("district"),
                FolkDistrictOrm.name.label("folk_district"),
                BigFolkDistrictOrm.name.label("big_folk_district"),
                CityOrm.name.label("city"),
            )
            .join(
                BlackoutBuildingOrm,
                BlackoutBuildingOrm.blackout_id == BlackoutOrm.id,
            )
            .join(
                BuildingOrm,
                BuildingOrm.id == BlackoutBuildingOrm.building_id,
            )
            .join(StreetOrm, StreetOrm.id == BuildingOrm.street_id)
            .join(DistrictOrm, DistrictOrm.id == BuildingOrm.district_id)
            .join(
                FolkDistrictOrm,
                FolkDistrictOrm.id == BuildingOrm.folk_district_id,
            )
            .join(
                BigFolkDistrictOrm,
                BigFolkDistrictOrm.id == BuildingOrm.big_folk_district_id,
            )
            .join(CityOrm, CityOrm.id == BuildingOrm.city_id)
        )

        if filter.type:
            stmt = stmt.where(BlackoutOrm.type == filter.type)

        if filter.start_date:
            stmt = stmt.where(BlackoutOrm.start_date >= filter.start_date)

        if filter.date:
            stmt = stmt.where(and_(BlackoutOrm.start_date <= filter.date, filter.date<= BlackoutOrm.end_date))

        if filter.district:
            stmt = stmt.where(
                or_(
                    DistrictOrm.name == filter.district,
                    FolkDistrictOrm.name == filter.district,
                    BigFolkDistrictOrm.name == filter.district,
                )
            )
        
        if filter.street:
            search_pattern = f"%{filter.street}%"
            street_condition = StreetOrm.name.ilike(search_pattern)
            stmt = stmt.where(street_condition)

        if filter.building:
            stmt = stmt.where(BuildingOrm.number == filter.building)

        blackouts = await self.session.execute(stmt)

        return blackouts
