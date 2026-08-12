from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, JSON
from app.database import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(120), nullable=False)
    company = Column(String(120), nullable=False)
    location = Column(String(80), default="Remote")
    experience = Column(String(40), default="Mid")
    remote = Column(String(20), default="Remote")
    skills = Column(JSON, default=list)
    description = Column(Text, default="")


class AnalysisRecord(Base):
    __tablename__ = "analysis_records"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255))
    score = Column(Float)
    skills = Column(JSON, default=list)
    strengths = Column(JSON, default=list)
    recommended_roles = Column(JSON, default=list)
    ats_score = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
