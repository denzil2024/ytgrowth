"""Niche Outliers — the weekly "what YouTube is pushing in your niche right now"
discovery engine that powers the dashboard hero card.

Run server-side once per niche per week (not per user) so the Claude cost is
flat regardless of user count:
  - 14 niches x 1 refresh/week
  - Per niche: 1 search.list (100 quota), 1 videos.list batch (1 quota),
    1 channels.list batch (1 quota), 1 Haiku call (~$0.05)
  - Total: ~$0.70/week in Claude + 1,400 YouTube quota units

Discovery model:
  1. search.list?q=<niche query>&type=video&publishedAfter=last 60 days,
     ordered by viewCount. 50 candidates max.
  2. videos.list to get full statistics + content details.
  3. channels.list to get each candidate channel's subscriber count.
  4. Score by views-per-subscriber-ratio (the canonical outlier signal).
     A video with 1M views from a 100K-sub channel (10x ratio) ranks higher
     than a 10M-view video from a 50M-sub channel (0.2x).
  5. Pick the single highest-scoring outlier and ask Haiku for the
     "why it's working" + "your angle" breakdown.

Why Haiku not Sonnet: this runs unattended, the input is structured
metadata (no nuance to reason over), and we want costs flat. Haiku is
plenty for the templated output we need.
"""
from __future__ import annotations

import json
import os
import re
from datetime import datetime, timedelta, timezone

from googleapiclient.errors import HttpError

from app.utils import make_anthropic_client
from app.top_channels import CATEGORY_QUERIES, CATEGORIES
from database.models import SessionLocal, NicheOutlierCache


# Look-back window for the search. Tighter window = fresher results.
_RECENCY_DAYS = 60

# How many candidates to pull from search.list (max 50 per call).
_CANDIDATE_POOL = 50

# Minimum subs the surfaced channel needs. Stops a 100-view video from a
# 10-sub channel surfacing as "1000x ratio" garbage.
_MIN_SUBS = 5_000

# Minimum views the candidate needs. Filters out fresh uploads that
# haven't had time to be distributed.
_MIN_VIEWS = 10_000

# Floor on the sub-ratio shown in the UI so we don't trumpet "0.4x" as
# an outlier. The "Top 18% in niche" copy assumes this is at least 1.5.
_MIN_DISPLAY_RATIO = 1.5


# ─── YouTube discovery ─────────────────────────────────────────────────────────

def _yt_client():
    api_key = os.getenv("YOUTUBE_API_KEY", "")
    if not api_key:
        return None
    from googleapiclient.discovery import build
    return build("youtube", "v3", developerKey=api_key, cache_discovery=False)


def _iso_published_after_days(days: int) -> str:
    return (datetime.now(timezone.utc) - timedelta(days=days)).isoformat().replace("+00:00", "Z")


def _search_videos(yt, query: str) -> list[str]:
    """Returns up to _CANDIDATE_POOL video IDs matching the niche query,
    ordered by viewCount within the look-back window."""
    try:
        resp = yt.search().list(
            part="snippet",
            q=query,
            type="video",
            order="viewCount",
            maxResults=_CANDIDATE_POOL,
            publishedAfter=_iso_published_after_days(_RECENCY_DAYS),
            videoDuration="medium",  # excludes shorts (< 4 min) and >20m
        ).execute()
    except HttpError as e:
        print(f"[niche_outliers] search failed for q='{query}': {e}")
        return []
    out = []
    for item in resp.get("items", []):
        vid = (item.get("id") or {}).get("videoId")
        if vid:
            out.append(vid)
    return out


def _batch_videos(yt, video_ids: list[str]) -> list[dict]:
    """Fetches snippet + statistics for up to 50 videos in one call."""
    if not video_ids:
        return []
    try:
        resp = yt.videos().list(
            part="snippet,statistics,contentDetails",
            id=",".join(video_ids[:50]),
            maxResults=50,
        ).execute()
    except HttpError as e:
        print(f"[niche_outliers] videos.list failed: {e}")
        return []
    return resp.get("items") or []


def _batch_channels(yt, channel_ids: list[str]) -> dict[str, int]:
    """Returns channel_id → subscriber_count for up to 50 channels in one call."""
    if not channel_ids:
        return {}
    try:
        resp = yt.channels().list(
            part="statistics",
            id=",".join(channel_ids[:50]),
            maxResults=50,
        ).execute()
    except HttpError as e:
        print(f"[niche_outliers] channels.list failed: {e}")
        return {}
    out: dict[str, int] = {}
    for ch in resp.get("items") or []:
        stats = ch.get("statistics") or {}
        if (stats.get("hiddenSubscriberCount") or False):
            continue
        try:
            subs = int(stats.get("subscriberCount") or 0)
        except Exception:
            subs = 0
        out[ch["id"]] = subs
    return out


def _outlier_score(view_count: int, subs: int) -> tuple[float, int]:
    """Returns (raw_ratio, score_0_100). The score is a calibrated 0-100
    derived from the views/subs ratio with diminishing returns past 10x.
    Mirrors the niche-relative scoring in app/outliers.py."""
    if subs <= 0:
        return 0.0, 0
    ratio = view_count / subs
    # Calibration: 1x → 50, 2x → 70, 5x → 85, 10x+ → 95+, log-shaped.
    import math
    score = min(99, int(50 + 15 * math.log10(max(ratio, 0.1)) + 5 * math.log10(max(view_count, 1) / 10_000)))
    score = max(0, score)
    return ratio, score


def _pick_top_outlier(videos: list[dict], subs_by_channel: dict[str, int]) -> dict | None:
    """Scores and returns the single best outlier from the candidate pool, or None
    if nothing qualifies."""
    scored = []
    for v in videos:
        snippet = v.get("snippet") or {}
        stats   = v.get("statistics") or {}
        channel_id = snippet.get("channelId") or ""
        subs       = subs_by_channel.get(channel_id, 0)
        try:
            view_count = int(stats.get("viewCount") or 0)
        except Exception:
            view_count = 0
        if subs < _MIN_SUBS:    continue
        if view_count < _MIN_VIEWS: continue
        ratio, score = _outlier_score(view_count, subs)
        if ratio < _MIN_DISPLAY_RATIO: continue
        scored.append({
            "video_id":      v.get("id"),
            "title":         snippet.get("title") or "",
            "channel_title": snippet.get("channelTitle") or "",
            "channel_id":    channel_id,
            "thumbnail_url": ((snippet.get("thumbnails") or {}).get("high") or {}).get("url")
                             or ((snippet.get("thumbnails") or {}).get("medium") or {}).get("url")
                             or "",
            "view_count":    view_count,
            "sub_count":     subs,
            "ratio":         ratio,
            "score":         score,
            "published_at":  snippet.get("publishedAt") or "",
        })
    if not scored:
        return None
    # Sort by score DESC, then ratio DESC. Top one wins.
    scored.sort(key=lambda x: (-x["score"], -x["ratio"]))
    return scored[0]


# ─── Haiku breakdown ───────────────────────────────────────────────────────────

_BREAKDOWN_SYSTEM = (
    "You write crisp, founder-level breakdowns for YouTube creators. "
    "You never use em-dashes, never use italics, and never pad with filler. "
    "Output must be concise, specific, and immediately actionable. "
    "You always respond with valid JSON, no markdown fences."
)


def _generate_breakdown(niche: str, outlier: dict) -> dict | None:
    """One Haiku call. Returns dict with 'why' (3 bullet strings),
    'angle' (suggested title template), and 'keyword' (search target).
    Returns None on failure; caller falls back to a generic template."""
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key:
        return None
    try:
        client = make_anthropic_client()
        prompt = (
            f"This YouTube video is outperforming its niche cohort:\n\n"
            f"Niche: {niche}\n"
            f"Title: \"{outlier['title']}\"\n"
            f"Channel: {outlier['channel_title']} ({outlier['sub_count']:,} subs)\n"
            f"Views: {outlier['view_count']:,} ({outlier['ratio']:.1f}x sub ratio)\n\n"
            f"Return JSON with three keys:\n"
            f"1. \"why\": array of EXACTLY 3 short bullets (max 80 chars each) "
            f"explaining the specific reasons YouTube is distributing this video. "
            f"Be concrete (e.g. \"Curiosity hook in first 4 words\", "
            f"\"Transformation arc framing\"). No vague advice.\n"
            f"2. \"angle\": ONE suggested video title another creator in this niche "
            f"could adapt from this winning formula. 50-70 chars. Should feel like a "
            f"working YouTube title, not a description. Avoid copying the original.\n"
            f"3. \"keyword\": the 2-4 word YouTube search phrase a viewer would type "
            f"to find this kind of video.\n\n"
            f"Output ONLY the JSON object."
        )
        msg = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=400,
            system=_BREAKDOWN_SYSTEM,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = msg.content[0].text.strip()
        raw = re.sub(r"^```[a-z]*\n?", "", raw)
        raw = re.sub(r"\n?```$", "", raw).strip()
        data = json.loads(raw)
        why = data.get("why") or []
        if not isinstance(why, list) or len(why) < 2:
            return None
        return {
            "why":     [str(w)[:160] for w in why[:3]],
            "angle":   str(data.get("angle") or "")[:160],
            "keyword": str(data.get("keyword") or "")[:80],
        }
    except Exception as e:
        print(f"[niche_outliers] Haiku breakdown failed for {niche}: {e}")
        return None


# ─── Cache helpers ─────────────────────────────────────────────────────────────

def _save(niche: str, outlier: dict, breakdown: dict) -> None:
    db = SessionLocal()
    try:
        pub_dt = datetime.fromisoformat((outlier["published_at"] or "").replace("Z", "+00:00")) \
                 if outlier["published_at"] else datetime.now(timezone.utc)
        row = db.query(NicheOutlierCache).filter_by(niche=niche).first()
        display_ratio = max(1, int(round(outlier["ratio"])))
        payload = dict(
            video_id       = outlier["video_id"],
            title          = outlier["title"],
            channel_title  = outlier["channel_title"],
            channel_id     = outlier["channel_id"],
            thumbnail_url  = outlier["thumbnail_url"],
            view_count     = outlier["view_count"],
            sub_ratio      = display_ratio,
            published_at   = pub_dt.replace(tzinfo=None) if pub_dt.tzinfo else pub_dt,
            outlier_score  = outlier["score"],
            why_working    = json.dumps(breakdown["why"]),
            angle_template = breakdown["angle"],
            angle_keyword  = breakdown["keyword"] or None,
        )
        if row:
            for k, v in payload.items():
                setattr(row, k, v)
        else:
            db.add(NicheOutlierCache(niche=niche, **payload))
        db.commit()
        print(f"[niche_outliers] saved {niche}: {outlier['title'][:60]} (score {outlier['score']}, {display_ratio}x)")
    except Exception as e:
        db.rollback()
        print(f"[niche_outliers] save failed for {niche}: {e}")
    finally:
        db.close()


# ─── Public API ────────────────────────────────────────────────────────────────

def refresh_niche(niche: str) -> dict | None:
    """Refresh one niche's outlier pick. Returns the saved payload or None on
    failure. Safe to call repeatedly; overwrites the existing row."""
    if niche not in CATEGORY_QUERIES:
        print(f"[niche_outliers] unknown niche: {niche}")
        return None
    yt = _yt_client()
    if yt is None:
        return None

    query = CATEGORY_QUERIES[niche]
    video_ids = _search_videos(yt, query)
    if not video_ids:
        print(f"[niche_outliers] no candidates for {niche}")
        return None

    videos = _batch_videos(yt, video_ids)
    if not videos:
        return None

    channel_ids = list({(v.get("snippet") or {}).get("channelId") for v in videos if (v.get("snippet") or {}).get("channelId")})
    subs_by_channel = _batch_channels(yt, channel_ids)

    outlier = _pick_top_outlier(videos, subs_by_channel)
    if not outlier:
        print(f"[niche_outliers] no qualifying outlier for {niche}")
        return None

    breakdown = _generate_breakdown(niche, outlier) or {
        "why":     [
            "Strong view-to-subscriber ratio in this niche",
            "Title pattern is working with YouTube's recommendation engine",
            "Topic has proven distribution beyond the channel's own audience",
        ],
        "angle":   outlier["title"],
        "keyword": "",
    }
    _save(niche, outlier, breakdown)
    return get_for_niche(niche)


def refresh_all_niches() -> int:
    """Refresh every niche. Returns number successfully refreshed."""
    ok = 0
    for niche in CATEGORIES:
        try:
            if refresh_niche(niche):
                ok += 1
        except Exception as e:
            print(f"[niche_outliers] refresh_all error for {niche}: {e}")
    return ok


def get_for_niche(niche: str) -> dict | None:
    """Read the cached outlier for a niche. Returns frontend-ready dict or None."""
    if not niche:
        return None
    db = SessionLocal()
    try:
        row = db.query(NicheOutlierCache).filter_by(niche=niche).first()
        if not row:
            return None
        try:
            why = json.loads(row.why_working or "[]")
        except Exception:
            why = []
        return {
            "niche":          row.niche,
            "video_id":       row.video_id,
            "title":          row.title,
            "channel_title":  row.channel_title,
            "channel_id":     row.channel_id,
            "thumbnail_url":  row.thumbnail_url,
            "view_count":     row.view_count,
            "sub_ratio":      row.sub_ratio,
            "published_at":   row.published_at.isoformat() if row.published_at else None,
            "outlier_score":  row.outlier_score,
            "why_working":    why,
            "angle_template": row.angle_template,
            "angle_keyword":  row.angle_keyword,
            "refreshed_at":   row.refreshed_at.isoformat() if row.refreshed_at else None,
        }
    finally:
        db.close()


# ─── Niche inference from a creator's channel ──────────────────────────────────

# Crude keyword → niche mapping. Channel keywords are usually a free-form
# comma-separated string the creator typed in YouTube Studio. We score each
# niche's query terms against the creator's keywords and topic strings and
# pick the highest scorer.
_NICHE_KEYWORD_HINTS = {
    "gaming":        ["gaming", "gameplay", "game", "minecraft", "fortnite", "esports", "twitch"],
    "tech":          ["tech", "technology", "review", "iphone", "android", "laptop", "gadget", "ai", "software"],
    "beauty":        ["beauty", "makeup", "skincare", "hair", "nails", "cosmetics", "tutorial"],
    "finance":       ["finance", "investing", "money", "stocks", "crypto", "personal finance", "wealth", "budget"],
    "cooking":       ["cooking", "recipe", "food", "baking", "kitchen", "meal", "chef"],
    "fitness":       ["fitness", "workout", "gym", "training", "exercise", "yoga", "running"],
    "music":         ["music", "song", "artist", "guitar", "piano", "production", "beats"],
    "education":     ["education", "learning", "tutorial", "science", "math", "history", "explained"],
    "vlogs":         ["vlog", "daily", "lifestyle", "day in the life", "routine"],
    "travel":        ["travel", "vlog", "adventure", "tourism", "destination", "journey"],
    "comedy":        ["comedy", "funny", "sketch", "humor", "stand up", "parody"],
    "sports":        ["sports", "football", "soccer", "basketball", "highlights", "athlete"],
    "entertainment": ["entertainment", "celebrity", "drama", "reaction", "shows", "movies"],
    "news":          ["news", "current events", "politics", "breaking", "report"],
}


def infer_niche(channel_keywords: str | list | None, channel_title: str = "", recent_titles: list[str] | None = None) -> str:
    """Maps a creator's channel keywords / topic strings to one of the 14
    niche categories. Returns 'education' as a safe default when nothing
    matches (broad, well-populated category).

    Scoring: each niche scored by how many of its hint terms appear in the
    creator's keywords + channel title + top 10 recent video titles. Highest
    score wins; ties broken by hint specificity.
    """
    haystack_parts: list[str] = []
    if isinstance(channel_keywords, str):
        haystack_parts.append(channel_keywords)
    elif isinstance(channel_keywords, list):
        haystack_parts.extend(str(k) for k in channel_keywords)
    if channel_title:
        haystack_parts.append(channel_title)
    for t in (recent_titles or [])[:10]:
        haystack_parts.append(str(t))
    haystack = " ".join(haystack_parts).lower()
    if not haystack.strip():
        return "education"

    best_niche = "education"
    best_score = 0
    for niche, hints in _NICHE_KEYWORD_HINTS.items():
        score = 0
        for hint in hints:
            if re.search(rf"\b{re.escape(hint)}\b", haystack):
                score += 1
        if score > best_score:
            best_score = score
            best_niche = niche
    return best_niche
