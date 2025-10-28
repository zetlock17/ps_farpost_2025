from sqlalchemy import or_, select, union
from sqlalchemy.ext.asyncio import AsyncSession

from models.geo import (
    BigFolkDistrictOrm,
    BuildingOrm,
    DistrictOrm,
    FolkDistrictOrm,
    StreetOrm,
)


class AddressRepository:

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_similar_addresses(self, input: str | None):
        stmt = select(
            BuildingOrm.number.label("number"), 
            StreetOrm.name.label("street")
        ).join(
            StreetOrm, StreetOrm.id == BuildingOrm.street_id
        )

        if input:
            input_parts = input.split()

            for part in input_parts:
                search_pattern = f"%{part}%"
                street_condition = StreetOrm.name.ilike(search_pattern)
                building_number_condition = BuildingOrm.number.ilike(search_pattern)
                combined_condition = or_(street_condition, building_number_condition)

                stmt = stmt.where(combined_condition)
        
        result = await self.session.execute(stmt)
        addresses = result.mappings().all() 

        return addresses

    async def get_districts(self):
        stmt_district = select(DistrictOrm.name.label('name'))
        stmt_folk = select(FolkDistrictOrm.name.label('name'))
        stmt_big_folk = select(BigFolkDistrictOrm.name.label('name'))

        union_stmt = union(stmt_district, stmt_folk, stmt_big_folk)

        districts =( await self.session.execute(union_stmt)).mappings().all()

        return districts