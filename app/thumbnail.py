"""
Thumbnail IQ — two-layer analysis engine.

Layer 1: deterministic algorithm (Pillow + OpenCV + NumPy + pytesseract). 60 pts max.
         Runs immediately on upload. Free. No Claude call.

Layer 2: Claude vision analysis. 40 pts max (6 dimensions × 0–10 × 0.667).
         Runs on explicit user request. Costs 1 credit.

Benchmark pool: top-performing videos in same niche+format+size_bracket.
                Cached 30 days. Shared across all users.
"""

import os
import re
import uuid
import json
import base64
import hashlib
import datetime
import requests

import numpy as np
from PIL import Image
from io import BytesIO


# ─── Format detection ─────────────────────────────────────────────────────────

_FORMAT_PATTERNS = {
    "tutorial":   re.compile(r"\bhow to\b|\bstep by step\b|\bbeginners?\b|\bguide\b", re.I),
    "listicle":   re.compile(r"^\d+\s|\b\d+\s(things|ways|tips|mistakes|reasons|steps|secrets|hacks|facts)\b", re.I),
    "story":      re.compile(r"\bi (did|tried|spent|survived|made|lost|gained)\b", re.I),
    "comparison": re.compile(r"\bvs\.?\b|\bor\b.{0,20}\bwhich\b|\bcomparison\b", re.I),
    "revelation": re.compile(r"\btruth\b|\breality\b|\bsecret\b|\bexposed\b|\bwhy\b", re.I),
}


def detect_format(title: str) -> str:
    for fmt, pat in _FORMAT_PATTERNS.items():
        if pat.search(title):
            return fmt
    return "general"


def get_size_bracket(subscribers: int) -> str:
    if subscribers <= 10_000:
        return "nano"
    elif subscribers <= 100_000:
        return "micro"
    elif subscribers <= 1_000_000:
        return "mid"
    return "macro"


# ─── Image fetching ────────────────────────────────────────────────────────────

def fetch_image_bytes(url: str) -> bytes | None:
    try:
        r = requests.get(url, timeout=8, headers={"User-Agent": "Mozilla/5.0"})
        return r.content if r.ok else None
    except Exception as e:
        print(f"[thumbnail] fetch_image_bytes error: {e}")
        return None


def md5_hash(data: bytes) -> str:
    return hashlib.md5(data).hexdigest()


# ─── Layer 1: deterministic algorithm ─────────────────────────────────────────

def run_layer1(image_bytes: bytes) -> dict:
    """
    Run all 7 deterministic scoring components.
    Returns full breakdown dict with 'algorithm_score' (max 60).
    """
    try:
        import cv2
        import pytesseract
    except ImportError as e:
        return {"error": f"Missing dependency: {e}"}

    # ── Load image ────────────────────────────────────────────────────────────
    try:
        pil_img = Image.open(BytesIO(image_bytes)).convert("RGB")
    except Exception as e:
        return {"error": f"Cannot open image: {e}"}

    width, height = pil_img.size
    img_area = max(width * height, 1)

    # ── DIMENSIONS (5 pts) ────────────────────────────────────────────────────
    ratio = width / max(height, 1)
    is_16_9 = abs(ratio - 16 / 9) < 0.05
    if width == 1280 and height == 720:
        dim_score = 5
    elif is_16_9:
        dim_score = 3
    else:
        dim_score = 0

    # ── FILE SIZE (5 pts) ─────────────────────────────────────────────────────
    size_mb = len(image_bytes) / (1024 * 1024)
    if size_mb < 2:
        size_score = 5
    elif size_mb < 4:
        size_score = 2
    else:
        size_score = 0

    # ── CONTRAST (15 pts) ─────────────────────────────────────────────────────
    gray_arr = np.array(pil_img.convert("L"), dtype=float)
    stddev = float(np.std(gray_arr))
    if stddev > 80:
        contrast_score = 15
    elif stddev > 55:
        contrast_score = 10
    elif stddev > 30:
        contrast_score = 5
    else:
        contrast_score = 0

    # ── FACE PRESENCE (10 pts) ────────────────────────────────────────────────
    img_arr = np.array(pil_img)
    img_cv  = img_arr[:, :, ::-1].copy()   # RGB → BGR for OpenCV
    gray_cv = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)

    cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    face_cascade = cv2.CascadeClassifier(cascade_path)
    faces = face_cascade.detectMultiScale(gray_cv, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

    face_detected = len(faces) > 0
    face_count    = int(len(faces))
    face_coverage_pct = 0.0
    face_position = "none"
    face_score    = 0

    if face_detected:
        total_face_area = sum(int(w) * int(h) for (_, _, w, h) in faces)
        face_coverage_pct = round(total_face_area / img_area * 100, 1)
        # Position of largest face
        largest = max(faces, key=lambda f: int(f[2]) * int(f[3]))
        x, y, w, h = [int(v) for v in largest]
        center_x = x + w / 2
        face_position = "left" if center_x < width / 3 else ("right" if center_x > 2 * width / 3 else "center")
        face_score = 10 if face_coverage_pct > 20 else (6 if face_coverage_pct >= 10 else 3)

    # ── TEXT PRESENCE (10 pts) ────────────────────────────────────────────────
    try:
        ocr_data = pytesseract.image_to_data(
            pil_img, output_type=pytesseract.Output.DICT, config="--psm 11"
        )
    except Exception as e:
        print(f"[thumbnail] OCR error: {e}")
        ocr_data = {"conf": [], "text": [], "left": [], "top": [], "width": [], "height": []}

    text_boxes      = []
    detected_words  = []
    for i, conf in enumerate(ocr_data.get("conf", [])):
        try:
            conf_val = int(conf)
        except (TypeError, ValueError):
            continue
        if conf_val > 50:
            w = int(ocr_data["width"][i] or 0)
            h = int(ocr_data["height"][i] or 0)
            if w > 0 and h > 0:
                text_boxes.append((
                    int(ocr_data["left"][i]),
                    int(ocr_data["top"][i]),
                    w, h,
                ))
                word = str(ocr_data["text"][i]).strip()
                if word:
                    detected_words.append(word)

    detected_text   = " ".join(detected_words)
    text_word_count = len(detected_words)
    text_coverage_pct = round(sum(w * h for (_, _, w, h) in text_boxes) / img_area * 100, 1)
    text_position   = "none"

    if text_boxes:
        avg_y = sum(y + h / 2 for (_, y, _, h) in text_boxes) / len(text_boxes)
        text_position = "top" if avg_y < height / 3 else ("bottom" if avg_y > 2 * height / 3 else "middle")

    if 10 <= text_coverage_pct <= 30:
        text_score = 10
    elif 5 <= text_coverage_pct < 10:
        text_score = 6
    elif text_coverage_pct > 30:
        text_score = 5
    else:
        text_score = 0

    # ── TEXT READABILITY (10 pts) ─────────────────────────────────────────────
    readability_score = 0
    contrast_ratio    = 0.0

    if text_boxes:
        def _rel_lum(r, g, b):
            def _c(v):
                x = v / 255.0
                return x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4
            return 0.2126 * _c(r) + 0.7152 * _c(g) + 0.0722 * _c(b)

        ratios = []
        for (tx, ty, tw, th) in text_boxes[:5]:
            x1, y1 = max(0, tx), max(0, ty)
            x2, y2 = min(width, tx + tw), min(height, ty + th)
            if x2 <= x1 or y2 <= y1:
                continue
            region = img_arr[y1:y2, x1:x2]
            if region.size == 0:
                continue
            bx1, by1 = max(0, x1 - 5), max(0, y1 - 5)
            bx2, by2 = min(width, x2 + 5), min(height, y2 + 5)
            bg = img_arr[by1:by2, bx1:bx2]
            if bg.size == 0:
                continue
            fg_pix = region.reshape(-1, 3).astype(float).min(axis=0)
            bg_pix = bg.reshape(-1, 3).astype(float).max(axis=0)
            L1 = _rel_lum(*fg_pix)
            L2 = _rel_lum(*bg_pix)
            lt, dk = max(L1, L2), min(L1, L2)
            ratios.append((lt + 0.05) / (dk + 0.05))

        if ratios:
            contrast_ratio = round(sum(ratios) / len(ratios), 2)
            if contrast_ratio > 7:
                readability_score = 10
            elif contrast_ratio > 4.5:
                readability_score = 7
            elif contrast_ratio > 3:
                readability_score = 4

    # ── COLOR VIBRANCY (5 pts) ────────────────────────────────────────────────
    img_hsv = cv2.cvtColor(img_cv, cv2.COLOR_BGR2HSV)
    mean_saturation = float(np.mean(img_hsv[:, :, 1]))

    if mean_saturation > 120:
        vibrancy_score = 5
    elif mean_saturation > 80:
        vibrancy_score = 3
    elif mean_saturation > 50:
        vibrancy_score = 1
    else:
        vibrancy_score = 0

    # K-means dominant colors (k=3)
    pixels = img_cv.reshape(-1, 3).astype(np.float32)
    if len(pixels) > 8000:
        idx    = np.random.choice(len(pixels), 8000, replace=False)
        pixels = pixels[idx]

    dominant_colors = ["#cccccc", "#888888", "#333333"]
    try:
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 1.0)
        _, _, centers = cv2.kmeans(pixels, 3, None, criteria, 3, cv2.KMEANS_RANDOM_CENTERS)
        dominant_colors = [f"#{int(c[2]):02x}{int(c[1]):02x}{int(c[0]):02x}" for c in centers]
    except Exception:
        pass

    # ── Totals ────────────────────────────────────────────────────────────────
    algorithm_score = (
        dim_score + size_score + contrast_score + face_score +
        text_score + readability_score + vibrancy_score
    )

    return {
        "dimensions":       {"score": dim_score,       "width": width, "height": height, "ratio": round(ratio, 3)},
        "file_size":         {"score": size_score,      "size_mb": round(size_mb, 2)},
        "contrast":          {"score": contrast_score,  "stddev": round(stddev, 1)},
        "face":              {"score": face_score,       "face_detected": face_detected,
                              "face_count": face_count,  "face_coverage_pct": face_coverage_pct,
                              "face_position": face_position},
        "text_presence":     {"score": text_score,      "coverage_pct": text_coverage_pct,
                              "detected_text": detected_text, "word_count": text_word_count,
                              "text_position": text_position},
        "text_readability":  {"score": readability_score, "contrast_ratio": contrast_ratio},
        "vibrancy":          {"score": vibrancy_score,  "mean_saturation": round(mean_saturation, 1),
                              "dominant_colors": dominant_colors},
        "algorithm_score":   algorithm_score,
    }


# ─── Benchmark pool ────────────────────────────────────────────────────────────

def get_or_build_benchmark_pool(
    db,
    credentials,
    keyword: str,
    fmt: str,
    size_bracket: str,
    competitor_context: dict | None = None,
) -> dict | None:
    """
    Return a valid (unexpired) benchmark pool or build and cache a new one.
    The pool is shared across all users with the same keyword+format+size_bracket.
    """
    from database.models import NicheBenchmarkPool, CompetitorThumbnailScore

    now = datetime.datetime.now(datetime.timezone.utc)

    # ── Check cache ───────────────────────────────────────────────────────────
    pool = db.query(NicheBenchmarkPool).filter_by(
        keyword=keyword, format=fmt, size_bracket=size_bracket
    ).first()

    if pool:
        exp = pool.expires_at
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=datetime.timezone.utc)
        if now < exp:
            videos = json.loads(pool.videos)
            avgs   = json.loads(pool.layer1_averages) if pool.layer1_averages else {}
            return {"videos": videos, "averages": avgs, "keyword": keyword,
                    "format": fmt, "size_bracket": size_bracket}

    # ── Build new pool ────────────────────────────────────────────────────────
    videos = _fetch_benchmark_videos(credentials, keyword, fmt, size_bracket)
    if not videos:
        return None

    # Run Layer 1 on each benchmark thumbnail (only if not already cached)
    avgs = _score_benchmark_videos(db, videos)

    expires_at = now + datetime.timedelta(days=30)

    if pool:
        pool.videos         = json.dumps(videos)
        pool.layer1_averages = json.dumps(avgs)
        pool.created_at     = now
        pool.expires_at     = expires_at
    else:
        pool = NicheBenchmarkPool(
            keyword=keyword, format=fmt, size_bracket=size_bracket,
            videos=json.dumps(videos),
            layer1_averages=json.dumps(avgs),
            created_at=now,
            expires_at=expires_at,
        )
        db.add(pool)
    db.commit()

    return {"videos": videos, "averages": avgs, "keyword": keyword,
            "format": fmt, "size_bracket": size_bracket}


def _fetch_benchmark_videos(credentials, keyword: str, fmt: str, size_bracket: str) -> list[dict]:
    """
    Fetch, filter, and rank the top 10 benchmark videos for keyword+format+size_bracket.
    Relaxes format/size filters if fewer than 5 pass.
    """
    from app.seo import search_top_videos
    from googleapiclient.discovery import build

    today = datetime.date.today()
    twelve_months_ago = today - datetime.timedelta(days=365)

    try:
        videos = search_top_videos(credentials, [keyword], max_results=50)
    except Exception as e:
        print(f"[thumbnail] benchmark fetch error: {e}")
        return []

    if not videos:
        return []

    # Attach velocity to each video
    enriched = []
    for v in videos:
        pub_str = (v.get("published_at") or "")[:10]
        try:
            pub_date = datetime.date.fromisoformat(pub_str)
        except Exception:
            continue
        days_live = max((today - pub_date).days, 1)
        v["velocity"]  = v.get("view_count", 0) / days_live
        v["days_live"] = days_live
        enriched.append(v)

    if not enriched:
        return []

    # FILTER 1: velocity > median
    vels   = sorted(v["velocity"] for v in enriched)
    median = vels[len(vels) // 2]
    f1     = [v for v in enriched if v["velocity"] > median]

    # FILTER 2: last 12 months
    f2 = [v for v in f1 if (v.get("published_at") or "")[:10] >= str(twelve_months_ago)]

    # FILTER 3: >10k views
    f3 = [v for v in f2 if v.get("view_count", 0) > 10_000]

    if not f3:
        return []

    # Fetch channel_id for each video via YouTube API (videos.list snippet already
    # returns channelId — but search_top_videos doesn't capture it, so re-fetch)
    try:
        youtube   = build("youtube", "v3", credentials=credentials)
        vid_ids   = [v["video_id"] for v in f3[:50]]
        details   = youtube.videos().list(part="snippet", id=",".join(vid_ids)).execute()
        vid2ch    = {item["id"]: item["snippet"].get("channelId", "") for item in details.get("items", [])}
        for v in f3:
            v["channel_id"] = vid2ch.get(v["video_id"], "")

        # Fetch subscriber counts in bulk
        ch_ids  = list({v["channel_id"] for v in f3 if v.get("channel_id")})
        ch_resp = youtube.channels().list(part="statistics", id=",".join(ch_ids[:50])).execute()
        ch_subs = {
            item["id"]: int(item.get("statistics", {}).get("subscriberCount", 0))
            for item in ch_resp.get("items", [])
        }
        for v in f3:
            v["channel_subscribers"] = ch_subs.get(v.get("channel_id", ""), 0)
    except Exception as e:
        print(f"[thumbnail] channel stats fetch error: {e}")
        for v in f3:
            v.setdefault("channel_id", "")
            v.setdefault("channel_subscribers", 0)

    # FILTER 4: format match
    f4 = [v for v in f3 if detect_format(v.get("title", "")) == fmt]

    # FILTER 5: channel size bracket
    f5 = [v for v in f4 if get_size_bracket(v.get("channel_subscribers", 0)) == size_bracket]

    result = sorted(f5, key=lambda v: -v["velocity"])[:10]

    # Relax if < 5
    if len(result) < 5:
        seen = {v["video_id"] for v in result}
        extra = [v for v in f3 if v["video_id"] not in seen
                 and get_size_bracket(v.get("channel_subscribers", 0)) == size_bracket]
        result = sorted(result + extra, key=lambda v: -v["velocity"])[:10]

    if len(result) < 5:
        seen = {v["video_id"] for v in result}
        extra = [v for v in f3 if v["video_id"] not in seen]
        result = sorted(result + extra, key=lambda v: -v["velocity"])[:10]

    return result[:10]


def _score_benchmark_videos(db, videos: list[dict]) -> dict:
    """
    Run Layer 1 on benchmark thumbnails (skip already-cached ones).
    Returns averaged benchmark metrics.
    """
    from database.models import CompetitorThumbnailScore

    scores = []
    for v in videos:
        vid_id  = v.get("video_id", "")
        thumb   = v.get("thumbnail", "")
        cached  = db.query(CompetitorThumbnailScore).filter_by(video_id=vid_id).first()

        if cached and cached.layer1_scores:
            s = json.loads(cached.layer1_scores)
        else:
            img_bytes = fetch_image_bytes(thumb) if thumb else None
            if not img_bytes:
                continue
            s = run_layer1(img_bytes)
            if "error" in s:
                continue
            row = CompetitorThumbnailScore(
                video_id=vid_id,
                thumbnail_url=thumb,
                layer1_scores=json.dumps(s),
                algorithm_score=s.get("algorithm_score", 0),
            )
            db.add(row)
            db.commit()

        scores.append(s)

    if not scores:
        return {}

    def avg(key, sub=None):
        vals = []
        for s in scores:
            try:
                v = s[key]["score"] if sub is None else s[key][sub]
                vals.append(float(v))
            except Exception:
                pass
        return round(sum(vals) / len(vals), 1) if vals else 0.0

    face_rates = [1 if s.get("face", {}).get("face_detected") else 0 for s in scores]
    text_rates = [1 if s.get("text_presence", {}).get("coverage_pct", 0) > 0 else 0 for s in scores]

    all_colors = []
    for s in scores:
        all_colors.extend(s.get("vibrancy", {}).get("dominant_colors", []))

    return {
        "benchmark_avg_contrast":          avg("contrast"),
        "benchmark_avg_face_coverage":     avg("face", "face_coverage_pct"),
        "benchmark_avg_text_coverage":     avg("text_presence", "coverage_pct"),
        "benchmark_avg_readability":       avg("text_readability"),
        "benchmark_avg_vibrancy":          avg("vibrancy"),
        "benchmark_face_detection_rate":   round(sum(face_rates) / len(face_rates) * 100),
        "benchmark_text_detection_rate":   round(sum(text_rates) / len(text_rates) * 100),
        "benchmark_dominant_color_palette": list(set(all_colors))[:6],
        "benchmark_avg_algorithm_score":   avg("algorithm_score") if "algorithm_score" in scores[0] else 0,
        "n_benchmarks":                    len(scores),
    }


def calculate_benchmark_comparison(layer1: dict, avgs: dict) -> dict:
    """Per-component gap vs benchmark average."""
    cmp = {}
    for key, bkey in [
        ("contrast",         "benchmark_avg_contrast"),
        ("face",             "benchmark_avg_face_coverage"),
        ("text_presence",    "benchmark_avg_text_coverage"),
        ("text_readability", "benchmark_avg_readability"),
        ("vibrancy",         "benchmark_avg_vibrancy"),
    ]:
        user_score  = layer1.get(key, {}).get("score", 0)
        bench_score = avgs.get(bkey, 0)
        if bench_score:
            pct_diff = round((user_score - bench_score) / bench_score * 100)
        else:
            pct_diff = 0
        cmp[key] = {"user": user_score, "benchmark": bench_score, "pct_diff": pct_diff}
    # Include detection rates so frontend can inject them into static explanations
    cmp["benchmark_face_rate"] = avgs.get("benchmark_face_detection_rate", 0)
    cmp["benchmark_text_rate"] = avgs.get("benchmark_text_detection_rate", 0)
    return cmp


def calculate_percentile(db, channel_id: str, keyword: str, fmt: str,
                          size_bracket: str, score: int) -> tuple[float, float]:
    """
    Returns (niche_avg_score, user_percentile) against all analyses with same
    keyword+format+size_bracket.
    """
    from database.models import ThumbnailAnalysis

    peers = db.query(ThumbnailAnalysis).filter(
        ThumbnailAnalysis.confirmed_keyword == keyword,
        ThumbnailAnalysis.format           == fmt,
        ThumbnailAnalysis.size_bracket     == size_bracket,
        ThumbnailAnalysis.algorithm_score  != None,
        ThumbnailAnalysis.cleared_at       == None,
    ).all()

    if not peers:
        return float(score), 50.0

    peer_scores = [p.algorithm_score for p in peers if p.algorithm_score is not None]
    if not peer_scores:
        return float(score), 50.0

    avg_score   = round(sum(peer_scores) / len(peer_scores), 1)
    below       = sum(1 for s in peer_scores if s < score)
    percentile  = round(below / len(peer_scores) * 100, 1)
    return avg_score, percentile


# ─── Layer 2: Claude vision ────────────────────────────────────────────────────

def run_layer2(
    thumbnail_b64: str,
    layer1: dict,
    benchmark: dict,
    channel_info: dict,
    video_title: str = "",
    linked_video_idea: dict | None = None,
) -> dict:
    """
    Call Claude vision with the thumbnail + top 3 benchmark thumbnails.
    Returns the 6-dimension score dict.
    """
    import anthropic as _anthropic
    from app.utils import make_anthropic_client

    client = make_anthropic_client()

    keyword      = benchmark.get("keyword", "")
    fmt          = benchmark.get("format", "general")
    size_bracket = benchmark.get("size_bracket", "nano")
    avgs         = benchmark.get("averages", {})
    bench_videos = benchmark.get("videos", [])

    # Top 3 benchmark thumbnails by velocity (highest first)
    top3 = sorted(bench_videos, key=lambda v: -v.get("velocity", 0))[:3]
    top3_titles = [v.get("title", "") for v in top3]

    # Build content blocks
    content = []

    # User thumbnail (first)
    content.append({
        "type": "image",
        "source": {"type": "base64", "media_type": "image/jpeg", "data": thumbnail_b64},
    })

    # Top 3 benchmark thumbnails
    for bv in top3:
        thumb_url  = bv.get("thumbnail", "")
        img_bytes  = fetch_image_bytes(thumb_url) if thumb_url else None
        if img_bytes:
            b64 = base64.b64encode(img_bytes).decode()
            content.append({
                "type": "image",
                "source": {"type": "base64", "media_type": "image/jpeg", "data": b64},
            })

    # Build video idea context block (inserted into prompt if available)
    if linked_video_idea:
        _vi = linked_video_idea
        video_idea_block = f"""

VIDEO IDEA CONTEXT (from competitor research):
This thumbnail is for a specific video idea that was identified through competitor gap analysis.

Video title: "{_vi.get('title', '')}"
Target keyword: "{_vi.get('targetKeyword', '')}"
Competitor gap this exploits: "{_vi.get('angle', '')}"
Opportunity score: {_vi.get('opportunityScore', 0)}/100
Source: {_vi.get('source', 'competitor')}

This means the thumbnail is directly competing against channels already ranking for "{_vi.get('targetKeyword', '')}".
The top 3 benchmark thumbnails shown above are from those exact competing channels.

When scoring Feed Distinctiveness and Click Psychology, reference the specific competitor gap this video is designed to exploit. Tell the user if their thumbnail will actually win against the specific competition identified, not just the niche in general.
"""
    else:
        video_idea_block = ""

    # Build text prompt
    l1_face = layer1.get("face", {})
    l1_text = layer1.get("text_presence", {})
    l1_vibr = layer1.get("vibrancy", {})
    l1_cont = layer1.get("contrast", {})
    subs    = channel_info.get("subscribers", 0)

    prompt = f"""Analyze this YouTube thumbnail for a {fmt} video targeting the keyword: "{keyword}"

Channel size: {size_bracket} ({subs:,} subscribers)

WHAT THE ALGORITHM ALREADY DETECTED IN THIS THUMBNAIL:
- Face detected: {l1_face.get("face_detected", False)} ({l1_face.get("face_coverage_pct", 0)}% of image, positioned {l1_face.get("face_position", "none")})
- Text detected: "{l1_text.get("detected_text", "")}" ({l1_text.get("coverage_pct", 0)}% coverage, positioned {l1_text.get("text_position", "none")})
- Dominant colors: {l1_vibr.get("dominant_colors", [])}
- Contrast level: {l1_cont.get("stddev", 0)} stddev

WHAT THE TOP PERFORMING THUMBNAILS IN THIS NICHE SHOW:
- {avgs.get("benchmark_face_detection_rate", 0)}% of top performers have a face
- {avgs.get("benchmark_text_detection_rate", 0)}% of top performers have text overlay
- Most common colors: {avgs.get("benchmark_dominant_color_palette", [])}
- Their video titles: {top3_titles}
(The top 3 benchmark thumbnail images follow the user's thumbnail above)

Score this thumbnail on exactly these 6 dimensions:

1. FACIAL EMOTION (0-10): What specific emotion is expressed? Is it readable at 200px? Does emotion match the video's promise? If no face: does the scene create equivalent emotional pull?

2. TEXT PSYCHOLOGY (0-10): What type of text? Does it create tension without the title? Is the font bold enough for mobile? Does it contradict or complement the image? If no text: score 0 unless visual is exceptionally strong.

3. COLOR PSYCHOLOGY (0-10): Are colors emotionally congruent? Is there one dominant color that separates this in a crowded feed? Compare directly against benchmark color palette.

4. COMPOSITION AND VISUAL HIERARCHY (0-10): Where does the eye go first? Is there visual tension? Is the most important element in a rule-of-thirds power zone?

5. TITLE AND THUMBNAIL RELATIONSHIP (0-10): User's video title: "{video_title if video_title else 'not provided'}"
Do title and thumbnail tell DIFFERENT parts of the same story? Score 0 if no title provided.

6. FEED DISTINCTIVENESS (0-10): Based on the benchmark thumbnails shown — would this stand out? Identify the single most distinctive element or explain exactly why it blends in.
{video_idea_block}
For each dimension provide: score (0-10), verdict (one specific sentence referencing exact visual elements), fix (one direct actionable change if score < 8 — name exact colors, words, positions), vs_benchmark (one sentence comparing against top performers).

Also provide: overallVerdict (2 honest sentences), biggestWin (single strongest element), biggestFix (highest impact single change), emotionLabel (1-2 words: e.g. "Strong shock"), feedPosition ("stands out"|"blends in"|"disappears"), clickPrediction ("above niche average"|"at niche average"|"below niche average").

NEVER use em-dashes (—). Return ONLY this JSON:
{{
  "scores": {{
    "facialEmotion":      {{"score": 0, "verdict": "", "fix": "", "vs_benchmark": ""}},
    "textPsychology":     {{"score": 0, "verdict": "", "fix": "", "vs_benchmark": ""}},
    "colorPsychology":    {{"score": 0, "verdict": "", "fix": "", "vs_benchmark": ""}},
    "composition":        {{"score": 0, "verdict": "", "fix": "", "vs_benchmark": ""}},
    "titleRelationship":  {{"score": 0, "verdict": "", "fix": "", "vs_benchmark": ""}},
    "feedDistinctiveness":{{"score": 0, "verdict": "", "fix": "", "vs_benchmark": ""}}
  }},
  "overallVerdict": "",
  "biggestWin": "",
  "biggestFix": "",
  "emotionLabel": "",
  "feedPosition": "",
  "clickPrediction": ""
}}"""

    content.append({"type": "text", "text": prompt})

    try:
        msg = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2400,
            system=(
                "You are an elite YouTube thumbnail analyst with deep knowledge of click psychology, "
                "visual communication, and what makes viewers stop scrolling. "
                "Your analysis must be brutally specific — reference exact visual elements you can see. "
                "Never give generic advice. Return only valid JSON."
            ),
            messages=[{"role": "user", "content": content}],
        )
        raw = msg.content[0].text.strip()
        if raw.startswith("```"):
            raw = re.sub(r"^```[a-z]*\n?", "", raw)
            raw = re.sub(r"\n?```$", "", raw.strip())
        result = json.loads(raw)

        # Calculate claude_score (sum of 6 dimensions × 0.667, max 40)
        dim_scores = result.get("scores", {})
        raw_sum    = sum(v.get("score", 0) for v in dim_scores.values())
        claude_score = round(raw_sum * 0.667)

        result["claude_score"] = claude_score
        return result

    except Exception as e:
        print(f"[thumbnail] Layer 2 Claude error: {e}")
        return {"error": str(e)}
