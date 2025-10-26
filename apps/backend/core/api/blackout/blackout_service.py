from sqlalchemy.ext.asyncio import AsyncSession

from .blackout_repo import BlackoutRepository
from .blackout_schema import BlackoutFilterSchema


class BlackoutService:

    def __init__(self, session: AsyncSession):
        self.session = session
        self.blackout_repo = BlackoutRepository(session=self.session)

    async def get_blackouts(self, filter: BlackoutFilterSchema):
        blackouts = await self.blackout_repo.get_blackouts(filter=filter)
        
        return blackouts
