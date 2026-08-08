"""Real account deletion (2026-08).

routers/auth.py delete_account orchestrates the full flow (cancelling any
active Paddle subscription, revoking the Google OAuth grant, clearing
in-memory session caches). This module only owns the DB side: purging every
row tied to an email across the app.
"""
import json
from sqlalchemy import or_
from database.models import (
    ChannelRegistry, UserSession, UserAccount, FeatureRequest, EmailSequence,
    VideoOptimizeCache, UserSubscription, ChatConversation, ChatMessage,
    CompetitorVideoIdeas, ChannelVideoIdeas, ThumbnailAnalysis, WeeklyReport,
    UserEmailPreferences, CompetitorAnalysisCache, CompetitorActivityCache,
    RelatedTrafficCache, SearchTermsCache, UnansweredCommentCache,
    OutliersSearchCache, SeoOptimization, Milestone, SeoAnalysisCache,
    KeywordsResearchCache, OutliersReport, VideoAutopsyCache,
    FreeTierFeatureUsage, ChannelNicheOutlierCache,
)

# Every table keyed by channel_id that holds a user's private data. Purged
# for every channel_id the account ever owned (active or previously
# disconnected — see ChannelRegistry lookup in purge_user_data).
#
# Keep this in sync with database/models.py: a table added there without a
# matching entry here means a "deleted" account's data quietly survives.
# Deliberately NOT included: TopChannelCache, ChannelMetricSnapshot,
# ChannelVideo (public YouTube stats used for cross-channel research, not
# personal account data — kept per product decision, 2026-08).
CHANNEL_KEYED_MODELS = [
    VideoOptimizeCache, UserSubscription, ChatConversation, ChatMessage,
    CompetitorVideoIdeas, ChannelVideoIdeas, ThumbnailAnalysis, WeeklyReport,
    UserEmailPreferences, CompetitorAnalysisCache, CompetitorActivityCache,
    RelatedTrafficCache, SearchTermsCache, UnansweredCommentCache,
    OutliersSearchCache, SeoOptimization, Milestone, SeoAnalysisCache,
    KeywordsResearchCache, OutliersReport, VideoAutopsyCache,
    FreeTierFeatureUsage, ChannelNicheOutlierCache,
]

# Tables keyed by an email column directly, (model, column_name).
# PendingPurchase is deliberately NOT here — kept as a financial/audit
# record of a real payment, not personal usage data.
EMAIL_KEYED_MODELS = [
    (FeatureRequest, "email"),
]


def purge_user_data(db, email: str) -> dict:
    """Deletes every row tied to `email` across the app. Caller commits.

    Returns {"channel_ids": [...], "session_ids": [...], "deleted_counts": {table: n}}
    so the caller can clear in-memory session caches and log a clear summary.
    """
    email = (email or "").strip()
    deleted_counts = {}
    if not email:
        return {"channel_ids": [], "session_ids": [], "deleted_counts": {}}

    channel_ids = [
        row.channel_id
        for row in db.query(ChannelRegistry).filter_by(owner_email=email).all()
    ]

    if channel_ids:
        for model in CHANNEL_KEYED_MODELS:
            n = db.query(model).filter(model.channel_id.in_(channel_ids)).delete(synchronize_session=False)
            if n:
                deleted_counts[model.__tablename__] = n

    # EmailSequence: channel_id is nullable (rows can be queued before any
    # channel is connected), so match on user_email OR channel_id.
    seq_filter = EmailSequence.user_email == email
    if channel_ids:
        seq_filter = or_(seq_filter, EmailSequence.channel_id.in_(channel_ids))
    n = db.query(EmailSequence).filter(seq_filter).delete(synchronize_session=False)
    if n:
        deleted_counts["email_sequences"] = n

    for model, col in EMAIL_KEYED_MODELS:
        n = db.query(model).filter(getattr(model, col) == email).delete(synchronize_session=False)
        if n:
            deleted_counts[model.__tablename__] = n

    n = db.query(ChannelRegistry).filter_by(owner_email=email).delete(synchronize_session=False)
    if n:
        deleted_counts["channel_registry"] = n

    # Sessions: owner_email-tagged rows are the reliable path going forward.
    # Also scan untagged rows (pre-dating the owner_email backfill fix) for
    # the same email embedded in user_data_json — same technique
    # routers/auth.py._find_existing_insights already uses to scan sessions.
    session_ids = []
    for row in db.query(UserSession).filter_by(owner_email=email).all():
        session_ids.append(row.session_id)
        db.delete(row)

    for row in db.query(UserSession).filter(UserSession.owner_email.is_(None)).all():
        try:
            data = json.loads(row.user_data_json) if row.user_data_json else {}
        except Exception:
            continue
        if data.get("email") == email:
            session_ids.append(row.session_id)
            db.delete(row)

    if session_ids:
        deleted_counts["user_sessions"] = len(session_ids)

    n = db.query(UserAccount).filter_by(email=email).delete(synchronize_session=False)
    if n:
        deleted_counts["user_accounts"] = n

    return {
        "channel_ids": channel_ids,
        "session_ids": session_ids,
        "deleted_counts": deleted_counts,
    }
