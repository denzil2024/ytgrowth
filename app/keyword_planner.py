"""Google Ads Keyword Planner integration: real monthly search volume +
competition per keyword. Powers the volume / competition / opportunity columns
of the free /tools/youtube-keyword-research tool.

This is the data source that makes the tool a real vidIQ competitor. It is FREE
(Google Ads API usage costs nothing) and does NOT touch the YouTube Data API
quota, so it is safe to call for every keyword in a lookup.

Credentials come from env (see GOOGLE_ADS_* below). Until a developer token is
approved for real data, every function degrades gracefully to empty results,
and the tool falls back to relative-demand + YouTube-cache competition. No fake
numbers are ever returned.

Results are cached cross-user in youtube_search_cache (kp: prefix, 30 days) so
repeat keywords are instant and we stay well inside the Google Ads API's own
daily operation limits.
"""

import datetime
import json
import os

from database.models import SessionLocal, YoutubeSearchCache

_KP_CACHE_TTL_HOURS = 24 * 30  # search volume is a monthly figure; 30d is fine.

# Default geo + language. US English: highest-RPM audience and the best proxy
# for global English YouTube demand. Overridable via env.
_GEO = os.getenv("GOOGLE_ADS_GEO_TARGET", "2840")        # 2840 = United States
_LANG = os.getenv("GOOGLE_ADS_LANGUAGE", "1000")          # 1000 = English


def _creds_present() -> bool:
    return all(os.getenv(k) for k in (
        "GOOGLE_ADS_DEVELOPER_TOKEN",
        "GOOGLE_ADS_CLIENT_ID",
        "GOOGLE_ADS_CLIENT_SECRET",
        "GOOGLE_ADS_REFRESH_TOKEN",
        "GOOGLE_ADS_CUSTOMER_ID",
    ))


def _norm(kw: str) -> str:
    from app.seo import _normalize_cache_query
    return _normalize_cache_query(kw)


def _cache_read(keywords: list[str]) -> tuple[dict, list[str]]:
    """Return ({norm: metrics} for fresh cached rows, [keywords still missing])."""
    found, missing = {}, []
    db = SessionLocal()
    try:
        keys = {f"kp:{_norm(k)}": k for k in keywords}
        rows = {r.cache_key: r for r in db.query(YoutubeSearchCache)
                .filter(YoutubeSearchCache.cache_key.in_(list(keys.keys()))).all()}
        now = datetime.datetime.now(datetime.timezone.utc)
        for ck, original in keys.items():
            row = rows.get(ck)
            fresh = False
            if row and row.cached_at:
                cached_at = row.cached_at
                if cached_at.tzinfo is None:
                    cached_at = cached_at.replace(tzinfo=datetime.timezone.utc)
                if (now - cached_at).total_seconds() / 3600 < _KP_CACHE_TTL_HOURS:
                    try:
                        found[_norm(original)] = json.loads(row.result_json)
                        fresh = True
                    except Exception:
                        pass
            if not fresh:
                missing.append(original)
        return found, missing
    except Exception as e:
        print(f"[keyword_planner] cache read error: {e}")
        return {}, list(keywords)
    finally:
        db.close()


def _cache_write(metrics_by_norm: dict, original_by_norm: dict):
    if not metrics_by_norm:
        return
    db = SessionLocal()
    try:
        now = datetime.datetime.now(datetime.timezone.utc)
        for nk, metrics in metrics_by_norm.items():
            ck = f"kp:{nk}"
            row = db.query(YoutubeSearchCache).filter_by(cache_key=ck).first()
            body = json.dumps(metrics)
            if row:
                row.result_json = body
                row.cached_at = now
            else:
                db.add(YoutubeSearchCache(
                    cache_key=ck,
                    original_query=original_by_norm.get(nk, nk),
                    result_json=body,
                    cached_at=now,
                    hit_count=0,
                ))
        db.commit()
    except Exception as e:
        print(f"[keyword_planner] cache write error: {e}")
        try: db.rollback()
        except Exception: pass
    finally:
        db.close()


def _fetch_from_api(keywords: list[str]) -> dict:
    """Call GenerateKeywordHistoricalMetrics for up to ~1000 keywords in one
    request. Returns {norm: {volume, competition, competition_index}}.
    Empty dict on any failure (missing lib, bad creds, API error)."""
    if not keywords:
        return {}
    try:
        from google.ads.googleads.client import GoogleAdsClient
    except Exception as e:
        print(f"[keyword_planner] google-ads not installed: {e}")
        return {}

    try:
        config = {
            "developer_token": os.getenv("GOOGLE_ADS_DEVELOPER_TOKEN", ""),
            "client_id":       os.getenv("GOOGLE_ADS_CLIENT_ID", ""),
            "client_secret":   os.getenv("GOOGLE_ADS_CLIENT_SECRET", ""),
            "refresh_token":   os.getenv("GOOGLE_ADS_REFRESH_TOKEN", ""),
            "use_proto_plus":  True,
        }
        login_cid = os.getenv("GOOGLE_ADS_LOGIN_CUSTOMER_ID", "")
        if login_cid:
            config["login_customer_id"] = login_cid.replace("-", "")
        customer_id = os.getenv("GOOGLE_ADS_CUSTOMER_ID", "").replace("-", "")

        client = GoogleAdsClient.load_from_dict(config)
        svc = client.get_service("KeywordPlanIdeaService")
        req = client.get_type("GenerateKeywordHistoricalMetricsRequest")
        req.customer_id = customer_id
        req.keywords.extend(keywords[:1000])
        req.geo_target_constants.append(f"geoTargetConstants/{_GEO}")
        req.language = f"languageConstants/{_LANG}"
        req.keyword_plan_network = client.enums.KeywordPlanNetworkEnum.GOOGLE_SEARCH

        resp = svc.generate_keyword_historical_metrics(request=req)
        out = {}
        for r in resp.results:
            m = r.keyword_metrics
            if not m:
                continue
            comp = getattr(m.competition, "name", None)
            trend = [int(v.monthly_searches or 0) for v in (m.monthly_search_volumes or [])][-12:]
            out[_norm(r.text)] = {
                "volume": int(m.avg_monthly_searches or 0),
                "competition": comp if comp in ("LOW", "MEDIUM", "HIGH") else None,
                "competition_index": int(m.competition_index) if m.competition_index is not None else None,
                "trend": trend,
            }
        return out
    except Exception as e:
        print(f"[keyword_planner] API error: {e}")
        return {}


def get_keyword_metrics(keywords: list[str]) -> dict:
    """Public entry. Returns {normalized_keyword: {volume, competition,
    competition_index}} for whatever we can resolve. Cache-first, then one
    batched API call for the rest. Empty/partial is fine; callers must handle
    missing keys (graceful fallback)."""
    keywords = [k for k in {(k or "").strip(): None for k in keywords} if k]  # dedupe, keep order
    if not keywords:
        return {}

    found, missing = _cache_read(keywords)
    if missing and _creds_present():
        fetched = _fetch_from_api(missing)
        if fetched:
            original_by_norm = {_norm(k): k for k in missing}
            _cache_write(fetched, original_by_norm)
            found.update(fetched)
    return found


def opportunity_score(volume, competition_index) -> int | None:
    """0-100 score blending demand (log-scaled volume) and low competition.
    Returns None when we don't have enough real data to score honestly."""
    if volume is None or competition_index is None:
        return None
    import math
    # Demand: log scale, ~0 at 0 searches, ~100 around 100k+/mo.
    demand = min(100.0, (math.log10(volume + 1) / 5.0) * 100.0)
    ease = 100.0 - max(0.0, min(100.0, float(competition_index)))
    # Favor winnability slightly over raw demand.
    return round(0.45 * demand + 0.55 * ease)
