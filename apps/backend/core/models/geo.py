from sqlalchemy import Column, ForeignKey, Integer, Text
from utils.db_util import base as Base


class BigFolkDistrictOrm(Base):
    __tablename__ = "big_folk_districts"

    id = Column(Text, primary_key=True)
    name = Column(Text)

class CityOrm(Base):
    __tablename__ = "cities"

    id = Column(Text, primary_key=True)
    name = Column(Text)


class DistrictOrm(Base):
    __tablename__ = "districts"

    id = Column(Text, primary_key=True)
    name = Column(Text)


class FolkDistrictOrm(Base):
    __tablename__ = "folk_districts"

    id = Column(Text, primary_key=True)
    name = Column(Text)


class StreetOrm(Base):
    __tablename__ = "streets"

    id = Column(Text, primary_key=True)
    name = Column(Text)

    city_id = Column(Text, ForeignKey(CityOrm.id))


class BuildingOrm(Base):
    __tablename__ = "buildings"

    id = Column(Text, primary_key=True)
    number = Column(Text)
    is_fake = Column(Integer)
    type = Column(Text)
    coordinates = Column(Text)

    street_id = Column(Text, ForeignKey(StreetOrm.id))
    district_id = Column(Text, ForeignKey(DistrictOrm.id))
    folk_district_id = Column(Text, ForeignKey(FolkDistrictOrm.id))
    big_folk_district_id = Column(Text, ForeignKey(BigFolkDistrictOrm.id))
    city_id = Column(Text, ForeignKey(CityOrm.id))




