from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class AddressSchema(BaseModel):
    street: str = Field(...)
    building: str = Field(...)

class CoordinateSchema(BaseModel):
    latitude: float = Field(...)
    longitude: float = Field(...)


class BlackoutListFilterSchema(BaseModel):
    start_date: datetime | None = Field(None)
    date: datetime | None = Field(None)
    district: str | None = Field(None)
    type: Literal["hot_water", "cold_water", "electricity", "heat"] | None = (
        Field(None)
    )

class BlackoutByAddressFilterSchema(BaseModel):
    date: datetime = Field(...)
    street: str = Field(...)
    building: str = Field(...)
    limit_neighbors: int | None = Field(None)

class BlackoutInfoSchema(BaseModel):
    id: str = Field(...)
    start_date: datetime = Field(...)
    end_date: datetime = Field(...)
    description: str = Field(...)
    type: Literal["hot_water", "cold_water", "electricity", "heat"] = Field(
        ...
    )

    building_number: str = Field(...)
    street: str = Field(...)
    district: str = Field(...)
    folk_district: str = Field(...)
    big_folk_district: str = Field(...)
    city: str = Field(...)

    coordinates: CoordinateSchema = Field(...)



class BlackoutInfoSchema(BaseModel):
    id: str = Field(...)
    start_date: datetime = Field(...)
    end_date: datetime = Field(...)
    description: str = Field(...)
    type: Literal["hot_water", "cold_water", "electricity", "heat"] = Field(
        ...
    )

    building_number: str = Field(...)
    street: str = Field(...)
    district: str = Field(...)
    folk_district: str = Field(...)
    big_folk_district: str = Field(...)
    city: str = Field(...)

    coordinates: CoordinateSchema = Field(...)

class BlackoutByAddressInfoSchema(BlackoutInfoSchema):
    predicted_end_date: datetime = Field(...)


class BlackoutByAddressListSchema(BaseModel):
    blackouts: list[BlackoutByAddressInfoSchema] = Field(...)
    neighbor_addresses: list[AddressSchema] = Field(...)

