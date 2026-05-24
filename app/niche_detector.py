"""Channel niche detection via Haiku.

One job: read the user's channel (name, description, Studio keywords,
recent and top video titles) and return a free-form niche label plus
3-5 search keywords to find similar channels with.

Replaces the brittle seed-word matcher + hardcoded "vlogs" fallback in
routers/dashboard_routes.py and the extract_niche_keywords / infer_niche
chain in app/niche_outliers.py.

Cached cross-user in ai_output_cache, 30-day TTL. Cache key is built
from the channel's stable signal (lowered name, sorted top titles,
sorted recent titles, subs tier). Two channels with the same content
fingerprint share the row at zero Anthropic cost.
"""
from __future__ import annotations

import json
import os
import re

from app.utils import cached_ai_output, make_anthropic_client


def _subs_tier(n: int) -> str:
    if n < 10_000:    return "micro"
    if n < 100_000:   return "small"
    if n < 1_000_000: return "mid"
    return "large"


def detect_channel_niche(channel: dict, videos: list) -> dict:
    """Ask Haiku what niche a channel is in.

    Returns:
      {
        "niche":    "knife sharpening tutorials for hobbyists",
        "keywords": ["knife sharpening", "whetstone", "kitchen knives"],
        "error":    "",
      }

    On any failure (no key, parse error, Haiku error) returns the same
    shape with empty fields and an error string. Callers should treat
    empty niche / keywords as "could not detect" and hide the card.
    """
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key:
        return {"niche": "", "keywords": [], "error": "ANTHROPIC_API_KEY is not set"}

    channel = channel or {}
    videos  = videos or []

    channel_name = (channel.get("channel_name") or channel.get("title") or "").strip()
    description  = (channel.get("description") or "").strip()[:600]
    kw_field     = (channel.get("keywords") or "").strip()[:300]
    subs         = int(channel.get("subscribers", 0) or 0)

    top_titles = [
        (v.get("title") or "").strip()
        for v in sorted(videos, key=lambda x: int(x.get("views", 0) or 0), reverse=True)[:5]
        if v.get("title")
    ]
    recent_titles = [
        (v.get("title") or "").strip()
        for v in sorted(videos, key=lambda x: (x.get("published_at") or ""), reverse=True)[:10]
        if v.get("title")
    ]

    if not channel_name and not top_titles and not recent_titles:
        return {"niche": "", "keywords": [], "error": "no_channel_signal"}

    # Cache inputs: ONLY fields that semantically determine the niche.
    # Sorted lists so cosmetic reorderings hit the same row.
    cache_inputs = {
        "channel_name":   channel_name.lower(),
        "description":    description.lower(),
        "kw_field":       kw_field.lower(),
        "subs_tier":      _subs_tier(subs),
        "top_titles":     sorted(t.lower() for t in top_titles),
        "recent_titles": sorted(t.lower() for t in recent_titles),
        "model":          "claude-haiku-4-5-20251001",
        "prompt_version": "v1",
    }

    def _fetch():
        prompt = f"""Read this YouTube channel and tell me what niche it is in.

Channel name: {channel_name or "(unknown)"}
Subscribers: {subs:,}
Description: {description or "(none)"}
Studio keywords: {kw_field or "(none)"}

Top 5 videos by views:
{chr(10).join(f"- {t}" for t in top_titles) if top_titles else "(none)"}

10 most recent videos:
{chr(10).join(f"- {t}" for t in recent_titles) if recent_titles else "(none)"}

Return ONLY valid JSON, no markdown:

{{
  "niche":    "short free-form label describing what this channel is about (3-8 words). Be specific. 'Knife sharpening tutorials for hobbyists' is better than 'cooking'. 'Indie game dev devlogs in Unity' is better than 'gaming'.",
  "keywords": ["3 to 5 short YouTube search phrases (1-3 words each) that would surface similar channels. Real phrases viewers would type, not adjectives."]
}}"""

        try:
            client = make_anthropic_client()
            msg = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=400,
                messages=[{"role": "user", "content": prompt}],
            )
            raw = msg.content[0].text.strip()
            if raw.startswith("```"):
                raw = re.sub(r"^```[a-z]*\n?", "", raw)
                raw = re.sub(r"\n?```$", "", raw.strip())
            parsed = json.loads(raw)
            niche = (parsed.get("niche") or "").strip()
            kws_raw = parsed.get("keywords") or []
            keywords = []
            for k in kws_raw:
                if not isinstance(k, str):
                    continue
                k = k.strip().lower()
                if 2 <= len(k) <= 60 and k not in keywords:
                    keywords.append(k)
            return {"niche": niche[:120], "keywords": keywords[:5], "error": ""}
        except json.JSONDecodeError as e:
            print(f"[niche_detector] JSON parse error: {e}")
            return {"niche": "", "keywords": [], "error": f"parse_error: {e}"}
        except Exception as e:
            print(f"[niche_detector] Haiku error: {e}")
            return {"niche": "", "keywords": [], "error": str(e)}

    return cached_ai_output(
        function_name="detect_channel_niche",
        inputs=cache_inputs,
        ttl_hours=24 * 30,  # 30 days
        fetch_fn=_fetch,
    )
