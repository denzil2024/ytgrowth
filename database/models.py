from sqlalchemy import Column, String, Integer, Float, DateTime, Text, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)
    google_token = Column(String)
    channel_id = Column(String)
    channel_name = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ChannelMetrics(Base):
    __tablename__ = "channel_metrics"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    subscribers = Column(Integer)
    total_views = Column(Integer)
    video_count = Column(Integer)
    avg_views_per_video = Column(Float)
    upload_frequency = Column(Float)
    avg_ctr = Column(Float)
    avg_watch_time = Column(Float)
    fetched_at = Column(DateTime, default=datetime.datetime.utcnow)

class UserSession(Base):
    __tablename__ = "user_sessions"
    session_id = Column(String, primary_key=True)
    creds_json = Column(Text, nullable=False)
    user_data_json = Column(Text, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class VideoOptimizeCache(Base):
    __tablename__ = "video_optimize_cache"
    id          = Column(Integer, primary_key=True)
    channel_id  = Column(String, nullable=False, index=True)
    video_id    = Column(String, nullable=False, index=True)
    result_json = Column(Text, nullable=False)
    updated_at  = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

import os
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///ytgrowth.db")
# Railway provides postgres:// but SQLAlchemy needs postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
Base.metadata.create_all(engine)
SessionLocal = sessionmaker(bind=engine)