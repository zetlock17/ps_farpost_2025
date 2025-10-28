from models.blackout import BlackoutBuildingOrm, BlackoutOrm
from config.settings import COORD_DELTA
from models.geo import (
    BigFolkDistrictOrm,
    BuildingOrm,
    CityOrm,
    DistrictOrm,
    FolkDistrictOrm,
    StreetOrm,
)
from sqlalchemy import JSON, Float, and_, func, or_, select, type_coerce
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.engine.row import RowMapping

from .blackout_schema import (
    AddressSchema,
    BlackoutByAddressFilterSchema,
    BlackoutListFilterSchema,
)


class BlackoutRepository:

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_blackout_list(self, filter: BlackoutListFilterSchema):
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
        

        blackouts = await self.session.execute(stmt)

        return blackouts

    async def get_target_blackouts(self, filter: BlackoutByAddressFilterSchema) -> list[RowMapping]:

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
                            func.json_extract(BuildingOrm.coordinates, "$[0].lat").cast(Float), 0.0
                        ),
                        "longitude",
                        func.coalesce(
                            func.json_extract(BuildingOrm.coordinates, "$[0].lon").cast(Float), 0.0
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
            .where(
                and_(
                    StreetOrm.name == filter.street,
                    BuildingOrm.number == filter.building,
                    BlackoutOrm.start_date <= filter.date, 
                    filter.date<= BlackoutOrm.end_date
                )
            )
        )
        return (await self.session.execute(stmt)).mappings().all()

    async def get_neighbor_addresses(self, target_lat: float, target_lon: float, filter: BlackoutByAddressFilterSchema) -> list[AddressSchema]:
        

        neighbor_stmt = (
            select(StreetOrm.name, BuildingOrm.number)
            .join(StreetOrm, StreetOrm.id == BuildingOrm.street_id)
            .where(
                and_(
                    func.json_extract(BuildingOrm.coordinates, "$[0].lat").cast(Float) >= target_lat - COORD_DELTA,
                    func.json_extract(BuildingOrm.coordinates, "$[0].lat").cast(Float) <= target_lat + COORD_DELTA,
                    func.json_extract(BuildingOrm.coordinates, "$[0].lon").cast(Float) >= target_lon - COORD_DELTA,
                    func.json_extract(BuildingOrm.coordinates, "$[0].lon").cast(Float) <= target_lon + COORD_DELTA,
                    or_(
                        StreetOrm.name != filter.street,
                        BuildingOrm.number != filter.building,
                    ),
                )
            )
            .distinct()
            .limit(filter.limit_neighbors) 
        )
        
        neighbor_results = (await self.session.execute(neighbor_stmt)).all()
        
        neighbor_addresses = [
            AddressSchema(street=row.name, building=row.number)
            for row in neighbor_results
        ]
        
        return neighbor_addresses