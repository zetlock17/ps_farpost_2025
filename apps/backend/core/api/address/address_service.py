from sqlalchemy.ext.asyncio import AsyncSession

from .address_repo import AddressRepository


class AddressService:

    def __init__(self, session: AsyncSession):
        self.session = session
        self.address_repo = AddressRepository(session=self.session)

    async def get_similar_addresses(self, input: str | None):
        addresses = await self.address_repo.get_similar_addresses(input=input)
        return addresses

    async def get_districts(self):
        districts = await self.address_repo.get_districts()
        return districts
    
    async def get_building(self, building_id: str | None = None):
        building = await self.address_repo.get_building(building_id=building_id)
        return building
