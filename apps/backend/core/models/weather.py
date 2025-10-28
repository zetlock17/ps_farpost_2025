from sqlalchemy import Column, DateTime, Integer, Text
from utils.db_util import base as Base


class WeatherInfoOrm(Base):
    __tablename__ = "weather"

    date = Column(DateTime, primary_key=True)
    temp_max = Column(Integer)
    temp_min = Column(Integer)
    weather_type = Column(Text)