from sqlalchemy import Column, Integer, String, Float, DateTime, Text
import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, default="developer")
    score = Column(Float, default=100.0)

class TraumaLog(Base):
    __tablename__ = "trauma_logs"

    id = Column(Integer, primary_key=True, index=True)
    mode = Column(String, index=True) # 'interview', 'think_out_loud', 'roast'
    details = Column(Text)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
