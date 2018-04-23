from database import Base
from sqlalchemy import Column, Integer, JSON, String, Text
from sqlalchemy.types import DateTime, PickleType
from sqlalchemy.schema import ForeignKey

# http://docs.sqlalchemy.org/en/latest/orm/mapping_api.html

class Label(Base):
    __tablename__ = 'label'
    id = Column(Integer, primary_key=True)
    uid = Column(String(256))
    label = Column(String(256))

class LabeledText(Base):
    __tablename__ = 'labeled_text'
    id = Column(Integer(), primary_key=True)
    timestamp = Column(DateTime())
    uid = Column(String(256))
    label = Column(Integer, ForeignKey('label.id'))
    text = Column(Text())

class Classifier(Base):
    __tablename__ = 'classifier'
    id = Column(Integer(), primary_key=True)
    timestamp = Column(DateTime())
    uid = Column(String(256))
    model = Column(PickleType())
