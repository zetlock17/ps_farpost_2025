from pydantic import BaseModel, Field


class AddressSchema(BaseModel):
    street: str = Field(...)
    building: str = Field(...)
    building_id: str = Field(...)

class DistrictSchema(BaseModel):
    name: str = Field(...)

