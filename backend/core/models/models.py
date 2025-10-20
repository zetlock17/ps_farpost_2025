from sqlalchemy import Column, ForeignKey, Integer, Text
from utils.common_util import base as Base


class BigFolkDistrictOrm(Base):
    __tablename__ = "big_folk_district"

    id = Column(Text, primary_key=True)
    name = Column(Text)


class BlackoutOrm(Base):
    __tablename__ = "blackout"

    id = Column(Text, primary_key=True)
    start_date = Column(Text)
    end_date = Column(Text)
    description = Column(Text)
    type = Column(Text)
    initiator_name = Column(Text)
    source = Column(Text)


class BlackoutBuildingOrm(Base):
    __tablename__ = "blackouts_building"

    blackout_id = Column(Text, ForeignKey("blackouts.id"), primary_key=True)
    building_id = Column(Text, ForeignKey("buildings.id"), primary_key=True)


class BuildingOrm(Base):
    __tablename__ = "building"

    id = Column(Text, primary_key=True)
    number = Column(Text)
    is_fake = Column(Integer)
    type = Column(Text)
    coordinates = Column(Text)

    street_id = Column(Text, ForeignKey("streets.id"))
    district_id = Column(Text, ForeignKey("districts.id"))
    folk_district_id = Column(Text, ForeignKey("folk_districts.id"))
    big_folk_district_id = Column(Text, ForeignKey("big_folk_districts.id"))
    city_id = Column(Text, ForeignKey("cities.id"))


class CityOrm(Base):
    __tablename__ = "city"

    id = Column(Text, primary_key=True)
    name = Column(Text)


class DistrictOrm(Base):
    __tablename__ = "district"

    id = Column(Text, primary_key=True)
    name = Column(Text)


class FolkDistrictOrm(Base):
    __tablename__ = "folk_district"

    id = Column(Text, primary_key=True)
    name = Column(Text)


class StreetOrm(Base):
    __tablename__ = "street"

    id = Column(Text, primary_key=True)
    name = Column(Text)

    city_id = Column(Text, ForeignKey("cities.id"))
