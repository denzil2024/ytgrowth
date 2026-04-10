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
    monthly_allowance = Column(Integer, default=9999)      # analyses granted per period
    monthly_used      = Column(Integer, default=0)        # resets on reset_date (free never resets)
    pack_balance      = Column(Integer, default=0)        # never expires, stacks
    reset_date        = Column(DateTime, nullable=True)   # next monthly reset (None = free)
    is_lifetime       = Column(Boolean,  default=False)
    paddle_subscription_id = Column(String, nullable=True)
    paddle_customer_id     = Column(String, nullable=True)
    channels_allowed  = Column(Integer, default=1)
    status            = Column(String,  default="free")   # free|active|canceled|past_due
    updated_at        = Column(DateTime, default=_now, onupdate=_now)


class CompetitorVideoIdeas(Base):
    """Raw videoIdeas extracted from each competitor analysis run."""
    __tablename__ = "competitor_video_ideas"
    id            = Column(Integer, primary_key=True)
    channel_id    = Column(String, nullable=False, index=True)   # the user's channel
    competitor_id = Column(String, nullable=False)               # the competitor analyzed
    ideas_json    = Column(Text, nullable=False)                  # JSON array of idea objects
    created_at    = Column(DateTime, default=_now)


class ChannelVideoIdeas(Base):
    """Final merged/enriched video ideas per channel — single source of truth."""
    __tablename__ = "channel_video_ideas"
    channel_id   = Column(String, primary_key=True)
    ideas_json   = Column(Text, nullable=False)      # JSON array of idea objects
    source       = Column(String, default="competitor")  # "competitor"|"ai"|"mixed"
    last_updated = Column(DateTime, default=_now, onupdate=_now)


class ThumbnailAnalysis(Base):
    """Per-user thumbnail analysis result. Never deleted — only soft-cleared."""
    __tablename__ = "thumbnail_analyses"
    id                 = Column(String, primary_key=True)   # UUID
    channel_id         = Column(String, nullable=False, index=True)
    thumbnail_hash     = Column(String, nullable=False, index=True)
    thumbnail_b64      = Column(Text,   nullable=False)
    video_title        = Column(String, nullable=True)
    confirmed_keyword  = Column(String, nullable=True)
    format             = Column(String, nullable=True)
    size_bracket       = Column(String, nullable=True)
    uploaded_at        = Column(DateTime, default=_now)
    last_analyzed_at   = Column(DateTime, nullable=True)
    layer1_scores      = Column(Text, nullable=True)    # JSON
    layer2_scores      = Column(Text, nullable=True)    # JSON (null until Layer 2 runs)
    benchmark_comparison = Column(Text, nullable=True)  # JSON
    algorithm_score    = Column(Integer, nullable=True)
    claude_score       = Column(Integer, nullable=True)  # null until Layer 2
    final_score        = Column(Integer, nullable=True)  # null until Layer 2
    niche_avg_score    = Column(Float,   nullable=True)
    user_percentile    = Column(Float,   nullable=True)
    cleared_at         = Column(DateTime, nullable=True)
    linked_video_idea  = Column(Text, nullable=True)    # JSON — full idea object if one was selected


class NicheBenchmarkPool(Base):
    """Shared benchmark pool cache — one entry per keyword+format+size_bracket combo."""
    __tablename__ = "niche_benchmark_pools"
    keyword        = Column(String, primary_key=True)
    format         = Column(String, primary_key=True)
    size_bracket   = Column(String, primary_key=True)
    videos         = Column(Text,   nullable=False)          # JSON array
    layer1_averages = Column(Text,  nullable=True)           # JSON
    created_at     = Column(DateTime, default=_now)
    expires_at     = Column(DateTime, nullable=False)


class CompetitorThumbnailScore(Base):
    """Cached Layer 1 scores for benchmark thumbnails — never recalculated."""
    __tablename__ = "competitor_thumbnail_scores"
    video_id       = Column(String,  primary_key=True)
    thumbnail_url  = Column(String,  nullable=True)
    layer1_scores  = Column(Text,    nullable=True)    # JSON
    algorithm_score = Column(Integer, nullable=True)
    scored_at      = Column(DateTime, default=_now)


class WeeklyReport(Base):
    """One report per channel per week. Never deleted."""
    __tablename__ = "weekly_reports"
    id             = Column(String, primary_key=True)   # UUID
    channel_id     = Column(String, nullable=False, index=True)
    email          = Column(String, nullable=False)
    week_start     = Column(String, nullable=False)     # YYYY-MM-DD (Monday)
    week_end       = Column(String, nullable=False)     # YYYY-MM-DD (Sunday)
    report_data    = Column(Text,   nullable=False)     # JSON
    email_sent     = Column(Boolean, default=False)
    email_sent_at  = Column(DateTime, nullable=True)
    created_at     = Column(DateTime, default=_now)
    opened         = Column(Boolean, default=False)
    unsubscribed   = Column(Boolean, default=False)


class UserEmailPreferences(Base):
    """Per-channel email preferences. Created on first report send."""
    __tablename__ = "user_email_preferences"
    channel_id        = Column(String, primary_key=True)
    email             = Column(String, nullable=False)
    weekly_report     = Column(Boolean, default=True)
    unsubscribe_token = Column(String, nullable=True, unique=True, index=True)
    unsubscribed_at   = Column(DateTime, nullable=True)
    resubscribed_at   = Column(DateTime, nullable=True)
    created_at        = Column(DateTime, default=_now)


class UserAccount(Base):
    """One Google account (email). One account can own multiple channels."""
    __tablename__ = "user_accounts"
    email           = Column(String, primary_key=True)
    google_id       = Column(String, nullable=True)
    display_name    = Column(String, nullable=True)
    profile_picture = Column(String, nullable=True)
    created_at      = Column(DateTime, default=_now)


class ChannelRegistry(Base):
    """Every channel ever connected to YTGrowth. Rows are never deleted."""
    __tablename__ = "channel_registry"
    id                 = Column(Integer, primary_key=True, autoincrement=True)
    owner_email        = Column(String, nullable=False, index=True)
    channel_id         = Column(String, nullable=False, index=True)
    channel_name       = Column(String, nullable=True)
    channel_thumbnail  = Column(String, nullable=True)
    subscribers        = Column(Integer, nullable=True)
    connected_at       = Column(DateTime, default=_now)
    disconnected_at    = Column(DateTime, nullable=True)
    is_active          = Column(Boolean, default=True)
    last_audit_at      = Column(DateTime, nullable=True)


import os
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///ytgrowth.db")
# Railway provides postgres:// but SQLAlchemy needs postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
Base.metadata.create_all(engine)
SessionLocal = sessionmaker(bind=engine)

# ── Incremental migrations (idempotent) ───────────────────────────────────────
from sqlalchemy import text as _text
with engine.connect() as _conn:
    for _stmt in [
        "ALTER TABLE thumbnail_analyses ADD COLUMN linked_video_idea TEXT",
        "ALTER TABLE weekly_reports ADD COLUMN opened BOOLEAN DEFAULT 0",
        "ALTER TABLE weekly_reports ADD COLUMN unsubscribed BOOLEAN DEFAULT 0",
        "ALTER TABLE user_email_preferences ADD COLUMN unsubscribe_token TEXT",
        "ALTER TABLE user_email_preferences ADD COLUMN resubscribed_at DATETIME",
        "ALTER TABLE user_sessions ADD COLUMN owner_email TEXT",
        "CREATE TABLE IF NOT EXISTS user_accounts (email TEXT PRIMARY KEY, google_id TEXT, display_name TEXT, profile_picture TEXT, created_at DATETIME)",
        "CREATE TABLE IF NOT EXISTS channel_registry (id INTEGER PRIMARY KEY AUTOINCREMENT, owner_email TEXT NOT NULL, channel_id TEXT NOT NULL, channel_name TEXT, channel_thumbnail TEXT, subscribers INTEGER, connected_at DATETIME, disconnected_at DATETIME, is_active BOOLEAN DEFAULT 1, last_audit_at DATETIME)",
        "CREATE INDEX IF NOT EXISTS ix_channel_registry_channel_id ON channel_registry (channel_id)",
        "CREATE INDEX IF NOT EXISTS ix_channel_registry_owner_email ON channel_registry (owner_email)",
        "CREATE UNIQUE INDEX IF NOT EXISTS uq_channel_registry_owner_channel ON channel_registry (owner_email, channel_id)",
        "UPDATE user_subscriptions SET monthly_allowance = 9999, monthly_used = 0 WHERE plan = 'free'",
    ]:
        try:
            _conn.execute(_text(_stmt))
            _conn.commit()
        except Exception:
            pass  # Column already exists
