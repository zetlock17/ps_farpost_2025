from datetime import datetime, timedelta

from nn.prediction_service import predict_duration
from sqlalchemy.ext.asyncio import AsyncSession

from ..weather.weather_service import WeatherService
from .blackout_repo import BlackoutRepository
from .blackout_schema import (
    BlackoutByAddressFilterSchema,
    BlackoutByAddressInfoSchema,
    BlackoutByAddressListSchema,
    BlackoutListFilterSchema,
)


class BlackoutService:

    def __init__(self, session: AsyncSession, weather_session: AsyncSession | None = None):
        self.session = session
        self.blackout_repo = BlackoutRepository(session=self.session)
        self.weather_service = WeatherService(session=weather_session)
        

    async def get_blackout_list(self, filter: BlackoutListFilterSchema):
        blackouts = await self.blackout_repo.get_blackout_list(filter=filter)
        return blackouts
    
    async def get_blackouts_by_address(self, filter: BlackoutByAddressFilterSchema) -> BlackoutByAddressListSchema:
        
        target_blackouts = await self.blackout_repo.get_target_blackouts(filter=filter)
        
        target_lat, target_lon = None, None

        if target_blackouts:
            coords_data = target_blackouts[0]["coordinates"]
            if coords_data:
                target_lat = coords_data.get("latitude")
                target_lon = coords_data.get("longitude")

        neighbor_addresses = []

        if target_lat is not None and target_lon is not None:
            neighbor_addresses = await self.blackout_repo.get_neighbor_addresses(
                target_lat=target_lat, 
                target_lon=target_lon, 
                filter=filter
            )

        blackouts_with_prediction: list[BlackoutByAddressInfoSchema] = []
        
        for blackout in target_blackouts:
            
            blackout_data = dict(blackout)
            blackout_type = blackout_data["type"]
            start_date = datetime.fromisoformat(blackout_data["start_date"])
            end_date: datetime = datetime.fromisoformat(blackout_data["end_date"])
            
            weather_data = {}

            if self.weather_service:
                weather_info = await self.weather_service.get_weather(date=start_date) 
                
                if weather_info:
                    weather_data = {
                        "temp_max": weather_info.temp_max,
                        "temp_min": weather_info.temp_min,
                        "weather_description": weather_info.weather_type,
                    }

            prediction_input = {
                "start_date": start_date, 
                "description": blackout_data.get("description"),
                "type": blackout_type,
                "city": blackout_data.get("city"),
                "street": blackout_data.get("street"),
                "house_number": blackout_data.get("building_number"),
                "district": blackout_data.get("district"),
                **weather_data,
            }

            predicted_hours = predict_duration(prediction_input)
            
            predicted_end_date = None

            if predicted_hours is not None:
                predicted_end_date = start_date + timedelta(hours=predicted_hours)
            else:
                predicted_end_date = end_date

            blackouts_with_prediction.append(
                BlackoutByAddressInfoSchema(
                    **blackout_data,
                    predicted_end_date=predicted_end_date,
                )
            )

        return BlackoutByAddressListSchema(
            blackouts=blackouts_with_prediction,
            neighbor_addresses=neighbor_addresses,
        )