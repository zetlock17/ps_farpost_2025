from sqlalchemy.ext.asyncio import AsyncSession

from .blackout_repo import BlackoutRepository
from .blackout_schema import BlackoutFilter


class BlackoutService:

    def __init__(self, session: AsyncSession):
        self.session = session
        self.blackout_repo = BlackoutRepository(session=self.session)

    async def get_blackouts(self, filter: BlackoutFilter):
        blackouts = await self.blackout_repo.get_blackouts(filter=filter)
        
        return blackouts
