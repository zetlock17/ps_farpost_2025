from sqlalchemy import Column, ForeignKey, Text
from .geo import BuildingOrm
from core.utils.db_util import base as Base


class BlackoutOrm(Base):
    __tablename__ = "blackouts"

    id = Column(Text, primary_key=True)
    start_date = Column(Text)
    end_date = Column(Text)
    description = Column(Text)
    type = Column(Text)
    initiator_name = Column(Text)
    source = Column(Text)

class BlackoutBuildingOrm(Base):
    __tablename__ = "blackouts_buildings"

    blackout_id = Column(Text, ForeignKey(BlackoutOrm.id), primary_key=True)
    building_id = Column(Text, ForeignKey(BuildingOrm.id), primary_key=True)