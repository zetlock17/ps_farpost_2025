from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

from ..address.address_schema import AddressSchema


class NeighborBlackoutSchema(AddressSchema):
    """Адрес соседнего здания с указанием актуального типа отключения."""
    type: Literal["hot_water", "cold_water", "electricity", "heat"] = Field(
        ...,
        description="Тип актуального отключения в соседнем здании.",
        example="electricity"
    )

class CoordinateSchema(BaseModel):

    """Географические координаты здания."""
    latitude: float = Field(
        ...,
        description="Широта здания.",
        example=43.14199
    )
    longitude: float = Field(
        ...,
        description="Долгота здания.",
        example=131.90807
    )


class BlackoutListFilterSchema(BaseModel):
    """Схема фильтров для получения общего списка отключений."""
    start_date: datetime | None = Field(
        None,
        description="Фильтр по дате начала отключения (включая указанную дату).",
        example="2023-10-01T10:00:00"
    )
    date: datetime | None = Field(
        None,
        description="Фильтр по актуальности: отключение должно быть активно.",
        example="2023-11-05T15:30:00"
    )
    district: str | None = Field(
        None,
        description="Фильтр по названию официального, народного или крупного народного района.",
        example="Ленинский район"
    )
    type: Literal["hot_water", "cold_water", "electricity", "heat"] | None = (
        Field(
            None,
            description="Фильтр по типу коммунальной услуги."
        )
    )

class BlackoutByAddressFilterSchema(BaseModel):
    """Схема фильтров для поиска отключений по конкретному адресу."""
    date: datetime = Field(
        ...,
        description="Дата и время, на которую нужно проверить актуальность отключений.",
        example="2024-01-20T12:00:00"
    )
    building_id: str = Field(
        ...,
        description="Уникальный ID здания, для которого запрашивается информация.",
        example="b428b92bb123994a56234bb6eeeed414"
    )
    limit_neighbors: int | None = Field(
        None,
        description="Максимальное количество соседних адресов с отключениями для возврата.",
        example=10
    )

class BlackoutInfoSchema(BaseModel):
    """Базовая информация об отключении коммунальной услуги."""
    id: str = Field(
        ...,
        description="Уникальный идентификатор отключения.",
        example="f88cefa506f44ebf8f010b8681b5449e"
    )
    start_date: datetime = Field(
        ...,
        description="Дата и время начала отключения.",
        example="2018-01-01T00:08:00"
    )
    end_date: datetime = Field(
        ...,
        description="Дата и время фактического окончания отключения.",
        example="2018-01-01T09:00:00"
    )
    description: str = Field(
        ...,
        description="Описание причины отключения и проводимых работ.",
        example="Авария на сети электроснабжения, ведутся восстановительные работы"
    )
    type: Literal["hot_water", "cold_water", "electricity", "heat"] = Field(
        ...,
        description="Тип отключенной коммунальной услуги."
    )

    building_number: str = Field(..., description="Номер дома.", example="118А")
    street: str = Field(..., description="Название улицы.", example="Светланская ул.")
    district: str = Field(..., description="Официальный район города.", example="Ленинский район")
    folk_district: str = Field(..., description="Народный район (неофициальный).", example="Центр")
    big_folk_district: str = Field(..., description="Крупный народный район.", example="Центр")
    city: str = Field(..., description="Название города.", example="Владивосток")
    coordinates: CoordinateSchema = Field(..., description="Географические координаты.")


class BlackoutByAddressInfoSchema(BlackoutInfoSchema):
    """Информация об отключении для конкретного адреса с добавлением прогнозной даты."""
    predicted_end_date: datetime = Field(
        ...,
        description="Прогнозируемая дата и время окончания отключения (на основе модели).",
        example="2018-01-01T05:30:00"
    )

class BlackoutByAddressListSchema(BaseModel):
    """Список отключений по адресу и соседству."""
    blackouts: list[BlackoutByAddressInfoSchema] = Field(
        ...,
        description="Список всех актуальных отключений для запрошенного здания с прогнозом."
    )
    neighbor_blackouts: list[NeighborBlackoutSchema] = Field(
        ...,
        description="Список соседних адресов с актуальными отключениями."
    )
