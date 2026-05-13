"""Niche Outliers — dashboard hero pick, computed per creator.

Runs the SAME app.outliers.search_outliers pipeline the paid Outliers
feature uses, with each creator's REAL channel_id, REAL subscriber count,
and niche keywords pulled from their own channel + recent titles via
app.competitors.extract_niche_keywords (the helper Competitors uses).

This replaces the previous per-broad-niche shared cache, which fed
search_outliers hardcoded generic keywords like ["music", "song", "cover"]
and a 10k baseline. That made every creator in a niche see the same
outlier, often unrelated to their actual channel. Now the result is
specific to the creator's own signal.

Cache: one row per channel_id in ChannelNicheOutlierCache, TTL 7 days.
On expiry, callers serve the stale row and kick a background refresh.
"""
from __future__ import annotations

import json
import os
import re
from datetime import datetime, timedelta, timezone

from app.competitors import extract_niche_keywords
from app.outliers import search_outliers
from app.top_channels import CATEGORY_QUERIES, CATEGORIES
from app.utils import make_anthropic_client
from database.models import (
    SessionLocal,
    NicheOutlierCache,
    ChannelNicheOutlierCache,
    OutliersSearchCache,
    OutliersReport,
)


# TTL after which a cached row is considered stale. Callers may still serve
# a stale row while a background refresh runs, so the UI never blocks once
# the creator has been seeded.
CACHE_TTL = timedelta(days=7)


# Representative niche keywords used when running search_outliers server-side
# (no per-user niche to pass). These bias the niche-match scoring toward the
# right cohort. Kept loose so we don't over-filter the candidate pool.
NICHE_KEYWORDS = {
    "gaming":        ["gaming", "gameplay", "game", "playthrough"],
    "tech":          ["tech", "technology", "review", "gadget", "software"],
    "beauty":        ["beauty", "makeup", "skincare", "tutorial"],
    "finance":       ["finance", "investing", "money", "stocks"],
    "cooking":       ["cooking", "recipe", "food", "kitchen"],
    "fitness":       ["fitness", "workout", "training", "exercise"],
    "music":         ["music", "song", "artist", "cover"],
    "education":     ["education", "learning", "tutorial", "explained"],
    "vlogs":         ["vlog", "daily", "lifestyle", "routine"],
    "travel":        ["travel", "vlog", "adventure", "destination"],
    "comedy":        ["comedy", "funny", "sketch", "humor"],
    "sports":        ["sports", "highlights", "athlete"],
    "entertainment": ["entertainment", "reaction", "celebrity"],
    "news":          ["news", "current events", "report"],
}

# Representative subscriber count used as the user-baseline in scoring.
# search_outliers uses this only for niche-relative views floor logic;
# per-video outlier scores are computed against each video's own channel,
# so the exact value here is not load-bearing.
_REPRESENTATIVE_SUBS = 10_000

# ─── Public API ────────────────────────────────────────────────────────────────

def refresh_niche(niche: str) -> dict | None:
    """Refresh one niche by running the real Outliers pipeline server-side
    with API-key auth. Stores the #1 outlier video into NicheOutlierCache.
    Returns the saved payload or None on failure.
    """
    if niche not in CATEGORY_QUERIES:
        print(f"[niche_outliers] unknown niche: {niche}")
        return None

    query = CATEGORY_QUERIES[niche]
    niche_kw = NICHE_KEYWORDS.get(niche, [niche])

    try:
        result = search_outliers(
            creds=None,             # build_youtube_client falls back to API key
            query=query,
            my_channel_id="",       # no exclusion
            my_subscribers=_REPRESENTATIVE_SUBS,
            my_niche_keywords=niche_kw,
            confirmed_keyword="",   # let the intent classifier do its thing
        )
    except Exception as e:
        print(f"[niche_outliers] search_outliers raised for {niche}: {e}")
        return None

    if not isinstance(result, dict) or result.get("error"):
        print(f"[niche_outliers] search_outliers returned no usable result for {niche}: {result.get('error') if isinstance(result, dict) else result}")
        return None

    videos = result.get("videos") or []
    if not videos:
        print(f"[niche_outliers] no videos returned for {niche}")
        return None

    top = videos[0]
    _save_from_outlier(niche, top)
    return get_for_niche(niche)


def refresh_all_niches() -> int:
    """Refresh every niche. Returns the count successfully refreshed."""
    ok = 0
    for niche in CATEGORIES:
        try:
            if refresh_niche(niche):
                ok += 1
        except Exception as e:
            print(f"[niche_outliers] refresh_all error for {niche}: {e}")
    return ok


# ─── Read from the user's existing Outliers result (paid feature output) ─────

def get_from_outliers_cache(channel_id: str) -> dict | None:
    """If the creator has run the paid Outliers feature, surface the strongest
    video outlier from their saved result. This is the cleanest source: the
    user typed their own query, the search ran with their real channel
    context, and the result is already in OutliersSearchCache.

    Returns the payload in the same shape NicheHeroCard expects, or None if
    no cached Outliers result exists for this channel.

    Falls back across:
      1. OutliersSearchCache (single most recent paid search)
      2. OutliersReport (history; pick the newest)
    """
    if not channel_id:
        return None
    db = SessionLocal()
    try:
        row = db.query(OutliersSearchCache).filter_by(channel_id=channel_id).first()
        result_json = row.result_json if row else None
        query_used = row.query if row else ""
        updated_at = row.updated_at if row else None

        if not result_json:
            # Fall back to the most recent report in history.
            rep = (
                db.query(OutliersReport)
                  .filter_by(channel_id=channel_id)
                  .order_by(OutliersReport.updated_at.desc())
                  .first()
            )
            if rep:
                result_json = rep.result_json
                query_used = rep.query
                updated_at = rep.updated_at

        if not result_json:
            return None

        try:
            result = json.loads(result_json)
        except Exception:
            return None

        videos = (result or {}).get("videos") or []
        if not videos:
            return None

        # Pick the top video by outlier_score (already sorted by search_outliers
        # but be defensive). search_outliers' outlier_score is a multiplier.
        top = max(videos, key=lambda v: float(v.get("outlier_score") or 0))
        return _build_payload_from_outlier_video(top, query_used or "", updated_at)
    finally:
        db.close()


def _build_payload_from_outlier_video(top: dict, query_used: str, updated_at) -> dict:
    """Map a video dict from OutliersSearchCache.result_json into the same
    payload shape NicheHeroCard renders. Keeps the frontend contract stable."""
    ratio = float(top.get("views_per_sub") or 0)
    outlier_mult = float(top.get("outlier_score") or 0)
    view_count = int(top.get("views") or top.get("view_count") or 0)
    ratio_display = max(1, int(round(ratio))) if ratio else 1

    import math
    score_0_100 = max(0, min(99, int(50 + 22 * math.log10(max(outlier_mult, 0.1)))))

    why_bullets = _extract_bullets(top.get("why_worked", ""))
    if len(why_bullets) < 3:
        extras = []
        wn = (top.get("why_now") or "").strip()
        if wn:
            extras.append(wn)
        qa = top.get("quick_actions") or []
        if qa:
            extras.append(str(qa[0]))
        for ex in extras:
            if len(why_bullets) >= 3:
                break
            if ex and ex not in why_bullets:
                why_bullets.append(ex)
    why_bullets = [str(b)[:180] for b in why_bullets[:3]]

    refreshed_iso = None
    if updated_at:
        try:
            refreshed_iso = updated_at.isoformat()
        except Exception:
            refreshed_iso = None

    return {
        "niche":           "",
        "niche_keywords":  [],
        "query_used":      query_used or "",
        "video_id":        top.get("video_id") or "",
        "title":           (top.get("title") or "")[:500],
        "channel_title":   (top.get("channel_name") or top.get("channel_title") or "")[:200],
        "channel_id":      (top.get("channel_id") or "")[:120],
        "thumbnail_url":   (top.get("thumbnail") or top.get("thumbnail_url") or "")[:500],
        "view_count":      view_count,
        "sub_ratio":       ratio_display,
        "published_at":    top.get("published_at"),
        "outlier_score":   score_0_100,
        "why_working":     why_bullets,
        "angle_template":  "",
        "angle_reasoning": "",
        "angle_keyword":   "",
        "refreshed_at":    refreshed_iso,
        "source":          "outliers_cache",
    }


# ─── Per-channel pipeline (auto-pick fallback, currently disabled on Home) ────

def refresh_for_channel(channel_id: str, channel: dict, videos: list) -> dict | None:
    """Refresh THIS creator's niche outlier card. Runs search_outliers with
    the same inputs the paid Outliers feature uses: real channel_id, real
    subscriber count, niche keywords pulled from their own channel + recent
    titles. Returns the saved payload or None on failure.
    """
    if not channel_id:
        return None

    channel = channel or {}
    videos = videos or []
    channel_title = channel.get("channel_name") or channel.get("title") or ""
    recent_titles = [v.get("title", "") for v in videos[:10] if v.get("title")]
    subscribers = int(channel.get("subscribers", 0) or 0) or 1000

    niche_kw = extract_niche_keywords(channel, videos) or []
    if not niche_kw:
        # Fall back to inferred broad niche keywords so search has SOMETHING
        # to anchor on. Better than returning no card.
        inferred = infer_niche(channel.get("keywords") or "", channel_title, recent_titles)
        niche_kw = NICHE_KEYWORDS.get(inferred, [inferred or "vlog"])

    query = niche_kw[0] if niche_kw else (channel_title or "vlog")
    detected_niche = infer_niche(channel.get("keywords") or "", channel_title, recent_titles)

    try:
        result = search_outliers(
            creds=None,
            query=query,
            my_channel_id=channel_id,
            my_subscribers=subscribers,
            my_niche_keywords=niche_kw,
            confirmed_keyword="",
        )
    except Exception as e:
        print(f"[niche_outliers] search_outliers raised for {channel_id}: {e}")
        return None

    if not isinstance(result, dict) or result.get("error"):
        err = result.get("error") if isinstance(result, dict) else result
        print(f"[niche_outliers] search_outliers returned no usable result for {channel_id}: {err}")
        return None

    videos_out = result.get("videos") or []
    if not videos_out:
        print(f"[niche_outliers] no videos returned for {channel_id}")
        return None

    top = videos_out[0]
    _save_for_channel(channel_id, detected_niche, niche_kw, query, top)
    return get_for_channel(channel_id)


def get_for_channel(channel_id: str) -> dict | None:
    """Read the cached outlier for one creator. Returns None if no row.
    Caller is responsible for checking freshness via `is_stale`.
    """
    if not channel_id:
        return None
    db = SessionLocal()
    try:
        row = db.query(ChannelNicheOutlierCache).filter_by(channel_id=channel_id).first()
        if not row:
            return None
        try:
            stored = json.loads(row.why_working or "[]")
        except Exception:
            stored = []
        why: list[str] = []
        angle_reasoning = ""
        for item in stored:
            s = str(item)
            if s.startswith("__reasoning__:"):
                angle_reasoning = s[len("__reasoning__:"):].strip()
            else:
                why.append(s)
        try:
            kw_list = json.loads(row.niche_keywords or "[]")
        except Exception:
            kw_list = []
        return {
            "niche":           row.detected_niche or "",
            "niche_keywords":  kw_list,
            "query_used":      row.query_used or "",
            "video_id":        row.video_id,
            "title":           row.title,
            "channel_title":   row.channel_title,
            "channel_id":      row.src_channel_id,
            "thumbnail_url":   row.thumbnail_url,
            "view_count":      row.view_count,
            "sub_ratio":       row.sub_ratio,
            "published_at":    row.published_at.isoformat() if row.published_at else None,
            "outlier_score":   row.outlier_score,
            "why_working":     why,
            "angle_template":  row.angle_template,
            "angle_reasoning": angle_reasoning,
            "angle_keyword":   row.angle_keyword,
            "refreshed_at":    row.refreshed_at.isoformat() if row.refreshed_at else None,
        }
    finally:
        db.close()


def is_stale(payload: dict | None) -> bool:
    """True if the cached row is older than CACHE_TTL, or missing a timestamp."""
    if not payload:
        return True
    ts = payload.get("refreshed_at")
    if not ts:
        return True
    dt = _parse_iso(ts)
    if not dt:
        return True
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return (datetime.now(timezone.utc) - dt) > CACHE_TTL


def _save_for_channel(
    channel_id: str,
    detected_niche: str,
    niche_keywords: list[str],
    query_used: str,
    top: dict,
) -> None:
    """Map a search_outliers video dict into a per-channel cache row."""
    db = SessionLocal()
    try:
        ratio = float(top.get("views_per_sub") or 0)
        outlier_mult = float(top.get("outlier_score") or 0)
        view_count = int(top.get("view_count") or 0)
        ratio_display = max(1, int(round(ratio))) if ratio else 1

        import math
        score_0_100 = max(0, min(99, int(50 + 22 * math.log10(max(outlier_mult, 0.1)))))

        pub_dt = _parse_iso(top.get("published_at"))

        why_bullets = _extract_bullets(top.get("why_worked", ""))
        if len(why_bullets) < 3:
            extras = []
            wn = (top.get("why_now") or "").strip()
            if wn:
                extras.append(wn)
            qa = top.get("quick_actions") or []
            if qa:
                extras.append(str(qa[0]))
            for ex in extras:
                if len(why_bullets) >= 3:
                    break
                if ex and ex not in why_bullets:
                    why_bullets.append(ex)
        why_bullets = [str(b)[:180] for b in why_bullets[:3]]

        angle_pack = _generate_angle(detected_niche or "vlogs", top) or {
            "angle":   top.get("title", "")[:160],
            "angle_reasoning": "Adapt the winning structure to your own voice and audience.",
            "keyword": "",
        }

        stored_why = list(why_bullets)
        if angle_pack.get("angle_reasoning"):
            stored_why.append(f"__reasoning__:{angle_pack['angle_reasoning']}")

        payload = dict(
            detected_niche = (detected_niche or "")[:60] or None,
            niche_keywords = json.dumps(list(niche_keywords)[:6]),
            query_used     = (query_used or "")[:200] or None,
            video_id       = top.get("video_id") or "",
            title          = (top.get("title") or "")[:500],
            channel_title  = (top.get("channel_title") or "")[:200],
            src_channel_id = (top.get("channel_id") or "")[:120],
            thumbnail_url  = (top.get("thumbnail_url") or "")[:500],
            view_count     = view_count,
            sub_ratio      = ratio_display,
            published_at   = pub_dt.replace(tzinfo=None) if (pub_dt and pub_dt.tzinfo) else pub_dt,
            outlier_score  = score_0_100,
            why_working    = json.dumps(stored_why),
            angle_template = (angle_pack.get("angle") or "")[:200],
            angle_keyword  = (angle_pack.get("keyword") or "")[:120] or None,
        )

        row = db.query(ChannelNicheOutlierCache).filter_by(channel_id=channel_id).first()
        if row:
            for k, v in payload.items():
                setattr(row, k, v)
        else:
            db.add(ChannelNicheOutlierCache(channel_id=channel_id, **payload))
        db.commit()
        print(f"[niche_outliers] saved channel={channel_id[:16]} niche={detected_niche} kw={niche_keywords[:3]} title={payload['title'][:60]}")
    except Exception as e:
        db.rollback()
        print(f"[niche_outliers] save_for_channel failed for {channel_id}: {e}")
    finally:
        db.close()


def get_for_niche(niche: str) -> dict | None:
    """Read the cached outlier for a niche, mapped to the frontend shape."""
    if not niche:
        return None
    db = SessionLocal()
    try:
        row = db.query(NicheOutlierCache).filter_by(niche=niche).first()
        if not row:
            return None
        try:
            stored = json.loads(row.why_working or "[]")
        except Exception:
            stored = []
        why: list[str] = []
        angle_reasoning = ""
        for item in stored:
            s = str(item)
            if s.startswith("__reasoning__:"):
                angle_reasoning = s[len("__reasoning__:"):].strip()
            else:
                why.append(s)
        return {
            "niche":           row.niche,
            "video_id":        row.video_id,
            "title":           row.title,
            "channel_title":   row.channel_title,
            "channel_id":      row.channel_id,
            "thumbnail_url":   row.thumbnail_url,
            "view_count":      row.view_count,
            "sub_ratio":       row.sub_ratio,
            "published_at":    row.published_at.isoformat() if row.published_at else None,
            "outlier_score":   row.outlier_score,
            "why_working":     why,
            "angle_template":  row.angle_template,
            "angle_reasoning": angle_reasoning,
            "angle_keyword":   row.angle_keyword,
            "refreshed_at":    row.refreshed_at.isoformat() if row.refreshed_at else None,
        }
    finally:
        db.close()


# ─── Save helpers ──────────────────────────────────────────────────────────────

def _save_from_outlier(niche: str, top: dict) -> None:
    """Map a search_outliers video dict into the NicheOutlierCache row.

    Fields available on `top` from app.outliers._score_videos +
    Claude enrichment:
      title, video_id, channel_title, channel_id, thumbnail_url,
      view_count, sub_count, views_per_sub, outlier_score (float, e.g. 6.4),
      published_at, why_worked (str), why_now (str), quick_actions (list).
    """
    db = SessionLocal()
    try:
        # search_outliers' outlier_score is a multiplier (views per sub /
        # cohort median). Convert to a 0-100 display score the way the
        # dashboard hero expects.
        ratio = float(top.get("views_per_sub") or 0)
        outlier_mult = float(top.get("outlier_score") or 0)
        view_count = int(top.get("view_count") or 0)
        sub_count  = int(top.get("sub_count") or 0)
        ratio_display = max(1, int(round(ratio))) if ratio else 1

        # Map outlier multiplier (1.0=cohort median, 10x=elite) onto 0-100.
        # 1x -> 50, 2x -> 70, 5x -> 85, 10x+ -> 95+. Log-shaped, capped.
        import math
        score_0_100 = max(0, min(99, int(50 + 22 * math.log10(max(outlier_mult, 0.1)))))

        pub_dt = _parse_iso(top.get("published_at"))

        # Three "why it works" bullets from search_outliers' Claude output.
        # why_worked is one paragraph; we split on bullet markers if present,
        # otherwise wrap as a single bullet and append why_now + first
        # quick_action so the card always shows 2-3 grounded reasons.
        why_bullets = _extract_bullets(top.get("why_worked", ""))
        if len(why_bullets) < 3:
            extras = []
            wn = (top.get("why_now") or "").strip()
            if wn:
                extras.append(wn)
            qa = top.get("quick_actions") or []
            if qa:
                extras.append(str(qa[0]))
            for ex in extras:
                if len(why_bullets) >= 3:
                    break
                if ex and ex not in why_bullets:
                    why_bullets.append(ex)
        why_bullets = [str(b)[:180] for b in why_bullets[:3]]

        # Generate a tailored angle template via a cheap Sonnet call. The
        # search_outliers payload doesn't already produce a "title another
        # creator should ship" — its quick_actions are operational steps
        # ("rewrite the hook", "front-load the payoff") rather than a
        # publishable title. Keep this dedicated angle call.
        angle_pack = _generate_angle(niche, top) or {
            "angle":   top.get("title", "")[:160],
            "angle_reasoning": "Adapt the winning structure to your own voice and audience.",
            "keyword": "",
        }

        # Stash angle_reasoning inside the why_working JSON so we don't need
        # a schema migration. Frontend pulls it out separately.
        stored_why = list(why_bullets)
        if angle_pack.get("angle_reasoning"):
            stored_why.append(f"__reasoning__:{angle_pack['angle_reasoning']}")

        payload = dict(
            video_id       = top.get("video_id") or "",
            title          = (top.get("title") or "")[:500],
            channel_title  = (top.get("channel_title") or "")[:200],
            channel_id     = (top.get("channel_id") or "")[:120],
            thumbnail_url  = (top.get("thumbnail_url") or "")[:500],
            view_count     = view_count,
            sub_ratio      = ratio_display,
            published_at   = pub_dt.replace(tzinfo=None) if (pub_dt and pub_dt.tzinfo) else pub_dt,
            outlier_score  = score_0_100,
            why_working    = json.dumps(stored_why),
            angle_template = (angle_pack.get("angle") or "")[:200],
            angle_keyword  = (angle_pack.get("keyword") or "")[:120] or None,
        )

        row = db.query(NicheOutlierCache).filter_by(niche=niche).first()
        if row:
            for k, v in payload.items():
                setattr(row, k, v)
        else:
            db.add(NicheOutlierCache(niche=niche, **payload))
        db.commit()
        print(f"[niche_outliers] saved {niche}: {payload['title'][:60]} (score {score_0_100}, {ratio_display}x)")
    except Exception as e:
        db.rollback()
        print(f"[niche_outliers] save failed for {niche}: {e}")
    finally:
        db.close()


def _parse_iso(s: str | None) -> datetime | None:
    if not s:
        return None
    try:
        return datetime.fromisoformat(str(s).replace("Z", "+00:00"))
    except Exception:
        return None


def _extract_bullets(text: str) -> list[str]:
    """Split an explanation paragraph into clean bullet strings.
    Handles bullet-marker prefixes (-, *, •, 1., 1)) plus newlines, and
    falls back to sentence-splitting when the text is a paragraph."""
    if not text:
        return []
    raw = str(text).replace("\r", "")
    # Bullet markers
    parts = re.split(r"(?:^|\n)\s*(?:[-*•]|\d+[\.)])\s+", raw)
    parts = [p.strip() for p in parts if p and p.strip()]
    if len(parts) >= 2:
        return parts
    # Sentence split as a fallback
    sentences = re.split(r"(?<=[.!?])\s+", raw.strip())
    return [s.strip() for s in sentences if s.strip()]


# ─── Angle generation (one cheap call per niche refresh) ──────────────────────

_ANGLE_SYSTEM = (
    "You are a senior YouTube growth strategist. Output crisp, ready-to-ship "
    "video titles for creators. Never use em-dashes. Always return strict JSON."
)


def _generate_angle(niche: str, top: dict) -> dict | None:
    """Produce a tailored title another creator could ship, plus the reason
    it echoes the winner. ~$0.005 Haiku call. Skipped if ANTHROPIC_API_KEY
    is missing."""
    if not os.getenv("ANTHROPIC_API_KEY"):
        return None
    try:
        client = make_anthropic_client()
        prompt = f"""This {niche} video is significantly outperforming its cohort right now:

Title: "{top.get('title', '')}"
Channel: {top.get('channel_title', '')} ({int(top.get('sub_count') or 0):,} subs)
Views: {int(top.get('view_count') or 0):,}
Outlier multiplier: {top.get('outlier_score', 0):.1f}x cohort median

A creator in the {niche} niche wants a ready-to-ship title that echoes the same structural hook but uses fresh phrasing.

Return ONLY valid JSON:
{{
  "angle": "A 50-70 char YouTube title another creator in this niche could publish today. Mirror the winner's HOOK STRUCTURE, never copy its words. Feels like a real title, not a description. No brackets or placeholders.",
  "angle_reasoning": "One sentence, max 140 chars, explaining what makes this angle a working echo of the winning formula.",
  "keyword": "The 2-4 word YouTube search phrase the viewer would type"
}}

Strict rules:
- No em-dashes anywhere.
- No quotation marks inside the angle title.
- The angle must work as a standalone YouTube title.
"""
        msg = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=400,
            system=_ANGLE_SYSTEM,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = msg.content[0].text.strip()
        raw = re.sub(r"^```[a-z]*\n?", "", raw)
        raw = re.sub(r"\n?```$", "", raw).strip()
        data = json.loads(raw)
        return {
            "angle":           str(data.get("angle") or "")[:180],
            "angle_reasoning": str(data.get("angle_reasoning") or "")[:200],
            "keyword":         str(data.get("keyword") or "")[:80],
        }
    except Exception as e:
        print(f"[niche_outliers] angle generation failed for {niche}: {e}")
        return None


# ─── Per-user personalization (used by /dashboard/personalize-angle) ──────────

def personalize_angle(
    channel_id: str,
    channel_name: str,
    channel_keywords: str,
    recent_titles: list[str],
) -> dict | None:
    """Per-user angle personalization. Reads THIS creator's cached niche
    outlier and rewrites the suggested angle using their voice + niche.
    Returns dict or None on failure. Cheap (~$0.005, Haiku).

    The base outlier is already per-channel (search_outliers ran with the
    creator's real signals), so this is mainly a voice/phrasing pass."""
    payload = get_for_channel(channel_id)
    if not payload:
        return None
    niche = payload.get("niche") or "vlogs"
    if not os.getenv("ANTHROPIC_API_KEY"):
        return None
    try:
        recent_blob = "\n".join(f"- {t}" for t in (recent_titles or [])[:6] if t)
        base_angle    = payload.get("angle_template") or ""
        base_keyword  = payload.get("angle_keyword")  or ""
        outlier_title = payload.get("title") or ""

        client = make_anthropic_client()
        prompt = f"""A YouTube creator is studying this winning {niche} video this week:

Winning video: "{outlier_title}"
Generic angle: "{base_angle}"

Now tailor it for this specific creator:

Channel name: {channel_name or 'Unknown'}
Niche keywords: {channel_keywords or 'not provided'}
Their recent video titles:
{recent_blob or '(none provided)'}

Return ONLY valid JSON:
{{
  "angle": "A 50-70 char YouTube title that fits THIS creator's voice + topics, mirroring the winner's hook structure. No brackets or placeholders.",
  "angle_reasoning": "One sentence, max 140 chars, explaining why this fits THIS creator.",
  "keyword": "2-4 word YouTube search phrase to target"
}}

No em-dashes. No quotation marks inside the angle.
"""
        msg = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=400,
            system=_ANGLE_SYSTEM,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = msg.content[0].text.strip()
        raw = re.sub(r"^```[a-z]*\n?", "", raw)
        raw = re.sub(r"\n?```$", "", raw).strip()
        data = json.loads(raw)
        return {
            "angle":           str(data.get("angle") or "")[:180] or base_angle,
            "angle_reasoning": str(data.get("angle_reasoning") or "")[:200],
            "keyword":         str(data.get("keyword") or "")[:80] or base_keyword,
        }
    except Exception as e:
        print(f"[niche_outliers] personalize_angle failed for {niche}: {e}")
        return None


# ─── Niche inference (unchanged from previous version) ────────────────────────

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
    """Map a creator's channel keywords + recent titles to one of the 14 niches.
    Defaults to 'education' (broad, well-populated) when nothing matches."""
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
