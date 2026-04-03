from sqlalchemy import Column, String, Integer, Float, DateTime, Text, Boolean, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime

def _now():
    return datetime.datetime.now(datetime.timezone.utc)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)
    google_token = Column(String)
    channel_id = Column(String)
    channel_name = Column(String)
    created_at = Column(DateTime, default=_now)

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
    fetched_at = Column(DateTime, default=_now)

class UserSession(Base):
    __tablename__ = "user_sessions"
    session_id = Column(String, primary_key=True)
    creds_json = Column(Text, nullable=False)
    user_data_json = Column(Text, nullable=False)
    updated_at = Column(DateTime, default=_now, onupdate=_now)

class VideoOptimizeCache(Base):
    __tablename__ = "video_optimize_cache"
    id          = Column(Integer, primary_key=True)
    channel_id  = Column(String, nullable=False, index=True)
    video_id    = Column(String, nullable=False, index=True)
    result_json = Column(Text, nullable=False)
    updated_at  = Column(DateTime, default=_now, onupdate=_now)

class UserSubscription(Base):
    __tablename__ = "user_subscriptions"
    channel_id        = Column(String, primary_key=True)
    email             = Column(String, nullable=True, index=True)
    plan              = Column(String,  default="free")   # free|solo|growth|agency|lifetime_solo|lifetime_growth|lifetime_agency
    billing_cycle     = Column(String,  default="none")   # monthly|annual|lifetime|none
    monthly_allowance = Column(Integer, default=5)        # analyses granted per period
    monthly_used      = Column(Integer, default=0)        # resets on reset_date (free never resets)
    pack_balance      = Column(Integer, default=0)        # never expires, stacks
    reset_date        = Column(DateTime, nullable=True)   # next monthly reset (None = free)
    is_lifetime       = Column(Boolean,  default=False)
    paddle_subscription_id = Column(String, nullable=True)
    paddle_customer_id     = Column(String, nullable=True)
    channels_allowed  = Column(Integer, default=1)
    status            = Column(String,  default="free")   # free|active|canceled|past_due
    updated_at        = Column(DateTime, default=_now, onupdate=_now)


import os
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///ytgrowth.db")
# Railway provides postgres:// but SQLAlchemy needs postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
Base.metadata.create_all(engine)
SessionLocal = sessionmaker(bind=engine)
