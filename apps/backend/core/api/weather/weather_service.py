from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from .weather_repo import WeatherRepository


class WeatherService:

    def __init__(self, session: AsyncSession):
        self.session = session
        self.weather_repo = WeatherRepository(session=self.session)

    async def get_weather(self, date: datetime):
        weather = await self.weather_repo.get_weather(date=date)
        return weather
