from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class Coordinate(BaseModel):
    latitude: float = Field(...)
    longitude: float = Field(...)


class BlackoutFilter(BaseModel):
    start_date: datetime | None = Field(None)
    end_date: datetime | None = Field(None)
    district: str | None = Field(None)
    type: Literal["hot_water", "cold_water", "electricity", "heat"] | None = (
        Field(None)
    )
    addres: str | None = Field(None)


class BlackoutInfoSchema(BaseModel):
    id: str = Field(...)
    start_date: datetime = Field(...)
    end_date: datetime = Field(...)
    description: str = Field(...)
    type: Literal["hot_water", "cold_water", "electricity", "heat"] = Field(
        ...
    )

    building_number: int = Field(...)
    street: str = Field(...)
    district: str = Field(...)
    folk_district: str = Field(...)
    big_folk_district: str = Field(...)
    city: str = Field(...)

    coordinate: Coordinate = Field(...)
