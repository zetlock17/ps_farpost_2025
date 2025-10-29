from pydantic import BaseModel, Field


class AddressSchema(BaseModel):
    """Схема для возврата одного адреса (улица + дом) с уникальным ID здания."""
    street: str = Field(
        ...,
        description="Название улицы.",
        example="Светланская ул."
    )
    building: str = Field(
        ...,
        description="Номер дома (включая буквы, если есть).",
        example="118А"
    )
    building_id: str = Field(
        ...,
        description="Уникальный идентификатор здания в базе данных.",
        example="b428b92bb123994a56234bb6eeeed414"
    )

class DistrictSchema(BaseModel):
    """Схема для возврата названия района(официального, народного или крупного народного) города."""
    name: str = Field(
        ...,
        description="Название официального, народного или крупного народного района.",
        example="Ленинский район"
    )

