"""Public YouTube keyword research lookup. Backs the free
/tools/youtube-keyword-research front-end.

Two layers, very different costs:

1. SUGGESTIONS (the keyword-ideas list). Pulled from Google's free autocomplete
   endpoint via app.keywords.scrape_autocomplete. NOT the Data API, so zero of
   the 10K/day quota. Works for ANY term, no login. Cached (ac: prefix, 30d) so
   repeats are instant and we stay polite to Google. A light per-IP guard caps
   how fast one client can trigger fresh scrapes.

2. COMPETITION (channel size, view ceiling, top videos). This is the expensive
   search.list layer (100 units). Per CLAUDE.md this endpoint is anonymous and
   bot-vulnerable, so it is CACHE-ONLY here: it reads the cross-user `kw:` cache
   that logged-in Keyword Research and the nightly niche warmer fill, and never
   calls search.list itself. A miss returns competition=null (the suggestions
   still render, so it's never a dead end); the UI prompts a free sign-in for
   live competition on that exact term.
"""

import datetime
import json
import threading
import time

from fastapi import APIRouter, Query, Request
from fastapi.responses import JSONResponse

from database.models import SessionLocal, YoutubeSearchCache

router = APIRouter()

_KW_CACHE_TTL_HOURS = 24      # competition cache, mirror app/keywords.py
_AC_CACHE_TTL_HOURS = 24 * 30 # autocomplete suggestions are stable for ~a month

# Light in-memory per-IP guard on FRESH autocomplete scrapes (cache hits are
# unlimited). Wiped on restart, per-worker — that's fine: it only blunts burst
# abuse driving outbound load, it is not a security boundary. The real quota
# moat is that this endpoint never touches the Data API.
_SCRAPE_WINDOW_SECONDS = 60
_SCRAPE_MAX_PER_WINDOW = 15
_scrape_hits: dict[str, list[float]] = {}
_scrape_lock = threading.Lock()


def _client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for", "")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _scrape_allowed(ip: str) -> bool:
    now = time.time()
    with _scrape_lock:
        hits = [t for t in _scrape_hits.get(ip, []) if now - t < _SCRAPE_WINDOW_SECONDS]
        if len(hits) >= _SCRAPE_MAX_PER_WINDOW:
            _scrape_hits[ip] = hits
            return False
        hits.append(now)
        _scrape_hits[ip] = hits
        return True


def _competition_label(comp: dict) -> str:
    """Low / Medium / High from the cached numbers: median subscriber size of
    the ranking channels, relaxed a notch when the field is stale (6+ months)."""
    subs = comp.get("top_subs_median", 0) or 0
    days_since = comp.get("days_since_newest")
    if subs >= 1_000_000:
        label = "High"
    elif subs >= 150_000:
        label = "Medium"
    else:
        label = "Low"
    if isinstance(days_since, int) and days_since >= 180:
        label = {"High": "Medium", "Medium": "Low"}.get(label, label)
    return label


# High-intent modifiers: searches with these convert and usually sit on
# more rankable long-tail. Used only as a free, transparent heuristic, never
# presented as live data.
_INTENT_MODIFIERS = (
    "how to", "how", "best", "top", "for beginners", "beginner", "beginners",
    "tutorial", "guide", "review", "reviews", "vs", "ideas", "tips",
    "explained", "step by step", "easy", "checklist", "examples", "example",
    "template", "mistakes", "worst", "cheap", "free", "diy", "at home",
)


def _specificity(kw: str) -> str:
    n = len((kw or "").split())
    if n <= 2:
        return "broad"
    if n <= 4:
        return "specific"
    return "long-tail"


def _has_intent(kw: str) -> bool:
    low = " " + (kw or "").lower().strip() + " "
    return any((" " + m + " ") in low for m in _INTENT_MODIFIERS)


# Sort tier for the suggestion list. Real competition is the only trustworthy
# "which to pick" signal, so scored terms lead (easiest first); everything
# unscored keeps YouTube's own suggestion order (a demand signal) via a stable
# sort. Specificity/intent are context tags, NOT a ranking basis.
_SORT_TIER = {"Low": 0, "Medium": 1, "High": 3}


def _batch_competition(keywords: list[str]) -> dict:
    """One query that returns {normalized_key: {competition, top_views_median}}
    for whichever of these keywords are in the kw: cache, fresh, full-schema.
    Cache-only, no Data API. Cheap: a single indexed IN() lookup."""
    from app.seo import _normalize_cache_query
    norm_by_key = {}
    for kw in keywords:
        nk = _normalize_cache_query(kw)
        norm_by_key[f"kw:{nk}|5|relevance"] = nk
    out = {}
    if not norm_by_key:
        return out
    db = SessionLocal()
    try:
        rows = (
            db.query(YoutubeSearchCache)
            .filter(YoutubeSearchCache.cache_key.in_(list(norm_by_key.keys())))
            .all()
        )
        now = datetime.datetime.now(datetime.timezone.utc)
        for row in rows:
            if not row.cached_at:
                continue
            cached_at = row.cached_at
            if cached_at.tzinfo is None:
                cached_at = cached_at.replace(tzinfo=datetime.timezone.utc)
            if (now - cached_at).total_seconds() / 3600 >= _KW_CACHE_TTL_HOURS:
                continue
            try:
                comp = json.loads(row.result_json)
            except Exception:
                continue
            if "top_videos" not in comp:
                continue
            out[norm_by_key.get(row.cache_key)] = {
                "competition": _competition_label(comp),
                "top_views_median": comp.get("top_views_median", 0),
            }
        return out
    except Exception as e:
        print(f"[keyword_tool] batch competition error: {e}")
        return out
    finally:
        db.close()


_QUESTION_STARTS = {
    "how", "what", "why", "when", "where", "who", "which",
    "can", "do", "does", "is", "are", "should", "will", "would",
}


def _is_question(kw: str) -> bool:
    low = (kw or "").lower().strip()
    if not low:
        return False
    if "?" in low:
        return True
    return low.split(" ", 1)[0] in _QUESTION_STARTS


def _enrich_suggestions(words_list: list[str], kp_map: dict, yt_map: dict) -> list[dict]:
    """Decision-ready rows: real volume + competition + opportunity score from
    Keyword Planner where available; YouTube-cache competition as fallback;
    free specificity / intent tags and a relative-demand rank for everything.
    Sorted by opportunity (best first) when scored, else by demand order."""
    from app.seo import _normalize_cache_query
    from app.keyword_planner import opportunity_score
    n = max(1, len(words_list))
    out = []
    for i, kw in enumerate(words_list):
        nk = _normalize_cache_query(kw)
        kpm = kp_map.get(nk) or {}
        ytm = yt_map.get(nk) or {}
        volume = kpm.get("volume")
        comp = kpm.get("competition") or ytm.get("competition")
        comp = comp.title() if comp else None  # 'LOW'/'Low' -> 'Low'
        comp_index = kpm.get("competition_index")
        out.append({
            "keyword": kw,
            "specificity": _specificity(kw),
            "highIntent": _has_intent(kw),
            "volume": volume,
            "competition": comp,
            "opportunity": opportunity_score(volume, comp_index),
            "demand_rel": round((1 - i / n) * 100),  # autocomplete-rank demand proxy
            "top_views_median": ytm.get("top_views_median"),
        })
    # Scored terms lead (best opportunity first); the rest keep demand order
    # via the stable sort.
    out.sort(key=lambda s: (0, -s["opportunity"]) if s.get("opportunity") is not None else (1, 0))
    return out


def _read_competition(keyword: str):
    """Cache-only read of the kw: competition cache. Returns the enriched dict
    or None. Never fetches. Bumps hit_count so anonymous demand steers the
    nightly warmer."""
    from app.seo import _normalize_cache_query
    cache_key = f"kw:{_normalize_cache_query(keyword)}|5|relevance"
    db = SessionLocal()
    try:
        row = db.query(YoutubeSearchCache).filter_by(cache_key=cache_key).first()
        if not row or not row.cached_at:
            return None
        cached_at = row.cached_at
        if cached_at.tzinfo is None:
            cached_at = cached_at.replace(tzinfo=datetime.timezone.utc)
        age_hours = (datetime.datetime.now(datetime.timezone.utc) - cached_at).total_seconds() / 3600
        if age_hours >= _KW_CACHE_TTL_HOURS:
            return None
        try:
            comp = json.loads(row.result_json)
        except Exception:
            return None
        if "top_videos" not in comp or "publishing_timeline" not in comp:
            return None
        try:
            row.hit_count = (row.hit_count or 0) + 1
            row.last_hit_at = datetime.datetime.now(datetime.timezone.utc)
            db.commit()
        except Exception:
            try: db.rollback()
            except Exception: pass
        return {
            "competition": _competition_label(comp),
            "result_count": comp.get("result_count", 0),
            "top_subs_median": comp.get("top_subs_median", 0),
            "top_views_median": comp.get("top_views_median", 0),
            "all_views_median": comp.get("all_views_median", 0),
            "days_since_newest": comp.get("days_since_newest"),
            "top_videos": comp.get("top_videos", []),
            "publishing_timeline": comp.get("publishing_timeline", []),
        }
    except Exception as e:
        print(f"[keyword_tool] competition read error: {e}")
        return None
    finally:
        db.close()


def _read_suggestions_cache(norm_key: str):
    db = SessionLocal()
    try:
        row = db.query(YoutubeSearchCache).filter_by(cache_key=f"ac:{norm_key}").first()
        if not row or not row.cached_at:
            return None
        cached_at = row.cached_at
        if cached_at.tzinfo is None:
            cached_at = cached_at.replace(tzinfo=datetime.timezone.utc)
        age_hours = (datetime.datetime.now(datetime.timezone.utc) - cached_at).total_seconds() / 3600
        if age_hours >= _AC_CACHE_TTL_HOURS:
            return None
        try:
            data = json.loads(row.result_json)
            return data if isinstance(data, list) else None
        except Exception:
            return None
    except Exception:
        return None
    finally:
        db.close()


def _write_suggestions_cache(norm_key: str, keyword: str, suggestions: list):
    db = SessionLocal()
    try:
        now = datetime.datetime.now(datetime.timezone.utc)
        row = db.query(YoutubeSearchCache).filter_by(cache_key=f"ac:{norm_key}").first()
        body = json.dumps(suggestions)
        if row:
            row.result_json = body
            row.cached_at = now
            row.hit_count = (row.hit_count or 0) + 1
            row.last_hit_at = now
        else:
            db.add(YoutubeSearchCache(
                cache_key=f"ac:{norm_key}",
                original_query=keyword,
                result_json=body,
                cached_at=now,
                hit_count=1,
                last_hit_at=now,
            ))
        db.commit()
    except Exception as e:
        print(f"[keyword_tool] suggestions cache write error: {e}")
        try: db.rollback()
        except Exception: pass
    finally:
        db.close()


@router.get("/lookup")
def lookup(request: Request, q: str = Query(..., min_length=1, max_length=120)):
    """Return free keyword suggestions for any term (autocomplete, cached) plus
    cached competition data when available. Never calls the Data API."""
    from app.seo import _is_meaningful_query, _normalize_cache_query

    keyword = (q or "").strip()
    if not _is_meaningful_query(keyword):
        return _empty_payload(keyword, reason="too_short")

    norm = _normalize_cache_query(keyword)

    # ── Suggestions (free, cached) ──
    suggestions = _read_suggestions_cache(norm)
    if suggestions is None:
        if not _scrape_allowed(_client_ip(request)):
            return _empty_payload(keyword, reason="rate_limited")
        try:
            from app.keywords import scrape_autocomplete
            raw = scrape_autocomplete(keyword) or []
            # Drop the seed itself; keep demand order; cap to a sane list.
            seen = set()
            suggestions = []
            for s in raw:
                sl = s.strip()
                low = sl.lower()
                if not sl or low == keyword.lower() or low in seen:
                    continue
                seen.add(low)
                suggestions.append(sl)
            suggestions = suggestions[:40]
            _write_suggestions_cache(norm, keyword, suggestions)
        except Exception as e:
            print(f"[keyword_tool] autocomplete error for '{keyword}': {e}")
            suggestions = []

    # ── Real metrics: Keyword Planner (volume + competition) for seed +
    #    suggestions in one cached, quota-free call; YouTube cache adds top
    #    videos / view ceiling for the seed. ──
    from app.keyword_planner import get_keyword_metrics, opportunity_score
    all_terms = [keyword] + suggestions
    kp_map = get_keyword_metrics(all_terms)   # {} until Ads token is approved
    yt_map = _batch_competition(all_terms)

    enriched = _enrich_suggestions(suggestions, kp_map, yt_map)
    scored_count = sum(1 for s in enriched if s.get("opportunity") is not None)
    questions = [s for s in suggestions if _is_question(s)][:8]

    # ── Seed overview ──
    seed_kp = kp_map.get(norm) or {}
    seed_yt = _read_competition(keyword) or {}
    _seed_comp = seed_kp.get("competition") or seed_yt.get("competition")
    overview = {
        "volume": seed_kp.get("volume"),
        "competition": _seed_comp.title() if _seed_comp else None,
        "competition_index": seed_kp.get("competition_index"),
        "opportunity": opportunity_score(seed_kp.get("volume"), seed_kp.get("competition_index")),
        "trend": seed_kp.get("trend") or [],
        "view_ceiling": seed_yt.get("top_views_median"),
        "result_count": seed_yt.get("result_count"),
        "days_since_newest": seed_yt.get("days_since_newest"),
        "top_videos": seed_yt.get("top_videos") or [],
        "publishing_timeline": seed_yt.get("publishing_timeline") or [],
    }

    return {
        "keyword": keyword,
        "overview": overview,
        "suggestions": enriched,
        "questions": questions,
        "scored_count": scored_count,
        "has_volume": seed_kp.get("volume") is not None or any(s.get("volume") is not None for s in enriched),
    }


def _empty_payload(keyword: str, reason: str) -> dict:
    return {
        "keyword": keyword,
        "overview": None,
        "suggestions": [],
        "questions": [],
        "scored_count": 0,
        "has_volume": False,
        "reason": reason,
    }


@router.get("/popular")
def popular(limit: int = Query(24, ge=1, le=60)):
    """Most-researched cached keywords that have full competition data, by
    hit_count. Powers the 'Popular keywords' browser. Read-only."""
    db = SessionLocal()
    try:
        rows = (
            db.query(YoutubeSearchCache)
            .filter(YoutubeSearchCache.cache_key.like("kw:%"))
            .order_by(YoutubeSearchCache.hit_count.desc())
            .limit(limit)
            .all()
        )
        out = []
        for row in rows:
            name = (row.original_query or "").strip()
            if not name:
                continue
            try:
                comp = json.loads(row.result_json)
            except Exception:
                continue
            if "top_videos" not in comp:
                continue
            out.append({
                "keyword": name,
                "competition": _competition_label(comp),
                "top_views_median": comp.get("top_views_median", 0),
                "result_count": comp.get("result_count", 0),
            })
        return {"keywords": out}
    except Exception as e:
        print(f"[keyword_tool] popular error: {e}")
        return {"keywords": []}
    finally:
        db.close()
