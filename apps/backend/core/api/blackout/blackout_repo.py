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
from sqlalchemy import JSON, func, or_, select, type_coerce
from sqlalchemy.ext.asyncio import AsyncSession

from .blackout_schema import BlackoutFilter


class BlackoutRepository:

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_blackouts(self, filter: BlackoutFilter):
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
                        func.json_extract(BuildingOrm.coordinates, "$[0].lat"),
                        "longitude",
                        func.json_extract(BuildingOrm.coordinates, "$[0].lon"),
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

        if filter.end_date:
            stmt = stmt.where(BlackoutOrm.end_date <= filter.end_date)

        if filter.district:
            stmt = stmt.where(
                or_(
                    DistrictOrm.name == filter.district,
                    FolkDistrictOrm.name == filter.district,
                    BigFolkDistrictOrm.name == filter.district,
                )
            )

        blackouts = await self.session.execute(stmt)

        return blackouts
