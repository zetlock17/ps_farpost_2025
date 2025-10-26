from pydantic import BaseModel, Field


class AddressSchema(BaseModel):
    street: str = Field(...)
    number: str = Field(...)

class DistrictSchema(BaseModel):
    name: str = Field(...)

