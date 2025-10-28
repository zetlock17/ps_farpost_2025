from datetime import datetime

from models.weather import WeatherInfoOrm
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession


class WeatherRepository:

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_weather(self, date: datetime):
    
        date_only = date.date() 
                
        stmt = select(WeatherInfoOrm).where(func.date(WeatherInfoOrm.date) == date_only)
        
        weather = (await self.session.execute(stmt)).scalar_one_or_none()
        
        return weather
