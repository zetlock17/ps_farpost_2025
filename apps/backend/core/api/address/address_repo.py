from core.models.geo import (
    BigFolkDistrictOrm,
    BuildingOrm,
    DistrictOrm,
    FolkDistrictOrm,
    StreetOrm,
)
from sqlalchemy import or_, select, union
from sqlalchemy.ext.asyncio import AsyncSession


class AddressRepository:

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_similar_addresses(self, input: str | None):
        stmt = select(
            BuildingOrm.number.label("building"), 
            StreetOrm.name.label("street"),
            BuildingOrm.id.label('building_id')
        ).join(
            StreetOrm, StreetOrm.id == BuildingOrm.street_id
        )

        if input:
            input_parts = input.split()

            for part in input_parts:
                part_low = part.lower()
                search_pattern_low = f"%{part_low}%"
                part_capitalize = part_low.capitalize()
                search_pattern_capitalize = f"%{part_capitalize}%"

                street_condition_low = StreetOrm.name.ilike(search_pattern_low)
                street_condition_capitalize = StreetOrm.name.ilike(search_pattern_capitalize)

                building_number_condition_low = BuildingOrm.number.ilike(search_pattern_low)
                building_number_condition_capitalize = BuildingOrm.number.ilike(search_pattern_capitalize)

                combined_condition = or_(
                    street_condition_low, 
                    street_condition_capitalize, 
                    building_number_condition_low, 
                    building_number_condition_capitalize
                )

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
    
    async def get_building(self, building_id: str | None = None):
        stmt = select(BuildingOrm)

        if building_id:
            stmt = stmt.where(BuildingOrm.id == building_id)

        building = (await self.session.execute(stmt)).first()

        return building