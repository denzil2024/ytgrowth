"""One-off, read-only: full data pull for a standalone "what winning YouTube
titles have in common" study (DATA-STUDIES.md study #2, promoted from a
fold-in stat to its own article 2026-08-21: "I don't need patches in the
study, I need a real study with loads of insights that people can link to
without me even reaching out"). Zero fresh API quota, everything below comes
from channel_videos + video_metric_snapshots, already collected by the
weekly moat loggers (DATA-STUDIES.md moat items #3c/#3d).

Every angle uses the same two-step normalization, methodology explained in
full in the module docstring history (see git log on this file):

1. VELOCITY = latest views / days live at the point of the latest snapshot.
   Raw views alone confound channel size and video age; velocity controls
   for age.
2. MULTIPLIER = a video's velocity / its own channel's median velocity in
   this sample. Controls for channel size (same pattern app/outliers.py
   uses for its outlier multiplier).

Angles measured, each reported as a correlation or a with/without split
against the multiplier, not just a bucket average:

- Title length in characters (continuous, Spearman r, + per-niche check)
- Title length in words (continuous, Spearman r)
- Contains a number (point-biserial via rank correlation)
- Starts with a number
- Question-framed (starts with a question word, or ends with "?")
- Contains brackets/parentheses
- Contains a year tag (20XX)
- Contains a colon (X: Y structure)
- Contains an all-caps emphasis word (3+ letters)
- Contains an emoji

Excludes Shorts (is_short) since this is a long-form/search framing
question; Shorts titles behave differently and would need their own study.

Run on Railway (app service console, has DATABASE_URL):

    python scripts/query_title_patterns_study.py
"""

import math
import os
import re
import statistics
import sys
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from database.models import SessionLocal

QUERY = """
SELECT
  cv.video_id,
  cv.channel_id,
  cv.title AS title,
  cv.published_at::date AS published_date,
  MAX(vms.views) AS views,
  MAX(vms.snapshot_date) AS latest_snapshot_date,
  tc.category AS category
FROM channel_videos cv
JOIN video_metric_snapshots vms ON vms.video_id = cv.video_id
LEFT JOIN (
  SELECT DISTINCT ON (channel_id) channel_id, category
  FROM top_channel_cache
  ORDER BY channel_id, region
) tc ON tc.channel_id = cv.channel_id
WHERE cv.published_at >= '2025-01-01'
  AND cv.title IS NOT NULL
  AND cv.is_short IS NOT TRUE
  AND vms.views IS NOT NULL
GROUP BY cv.video_id, cv.channel_id, cv.title, cv.published_at, tc.category
"""

LENGTH_BUCKETS = [
    (0, 30, "<30"),
    (30, 50, "30-50"),
    (50, 70, "50-70"),
    (70, 100, "70-100"),
    (100, 10**9, "100+"),
]

QUESTION_STARTS = ("how ", "what ", "why ", "is ", "are ", "can ", "should ",
                    "does ", "do ", "will ", "which ", "who ", "when ", "where ")
YEAR_RE = re.compile(r"\b20[0-3]\d\b")
ALLCAPS_WORD_RE = re.compile(r"\b[A-Z]{3,}\b")
EMOJI_RE = re.compile(
    "[\U0001F300-\U0001FAFF\U00002600-\U000027BF\U0001F1E6-\U0001F1FF]"
)


def title_features(title):
    t = title.strip()
    lower = t.lower()
    return {
        "len_chars": len(t),
        "len_words": len(t.split()),
        "has_number": bool(re.search(r"\d", t)),
        "starts_with_number": bool(re.match(r"^\s*\d", t)),
        "is_question": lower.endswith("?") or lower.startswith(QUESTION_STARTS),
        "has_brackets": ("[" in t) or ("(" in t),
        "has_year": bool(YEAR_RE.search(t)),
        "has_colon": ":" in t,
        "has_allcaps_word": bool(ALLCAPS_WORD_RE.search(t)),
        "has_emoji": bool(EMOJI_RE.search(t)),
    }


def bucket_for(n):
    for lo, hi, label in LENGTH_BUCKETS:
        if lo <= n < hi:
            return label
    return LENGTH_BUCKETS[-1][2]


def iqr(vals):
    if len(vals) < 4:
        return (min(vals), max(vals))
    q1, _, q3 = statistics.quantiles(vals, n=4)
    return (q1, q3)


def rank(values):
    order = sorted(range(len(values)), key=lambda i: values[i])
    ranks = [0.0] * len(values)
    i = 0
    n = len(order)
    while i < n:
        j = i
        while j + 1 < n and values[order[j + 1]] == values[order[i]]:
            j += 1
        avg_rank = (i + j) / 2 + 1
        for k in range(i, j + 1):
            ranks[order[k]] = avg_rank
        i = j + 1
    return ranks


def pearson(xs, ys):
    n = len(xs)
    if n < 2:
        return None
    mx = statistics.mean(xs)
    my = statistics.mean(ys)
    cov = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    sx = math.sqrt(sum((x - mx) ** 2 for x in xs))
    sy = math.sqrt(sum((y - my) ** 2 for y in ys))
    if sx == 0 or sy == 0:
        return None
    return cov / (sx * sy)


def spearman(xs, ys):
    return pearson(rank(xs), rank(ys))


def describe_r(r, pos_label, neg_label):
    if r is None:
        return "n/a"
    a = abs(r)
    if a < 0.10:
        strength = "negligible"
    elif a < 0.30:
        strength = "weak"
    elif a < 0.50:
        strength = "moderate"
    else:
        strength = "strong"
    direction = pos_label if r > 0 else neg_label
    return f"{strength}, {direction}"


db = SessionLocal()
try:
    rows = db.execute(text(QUERY)).fetchall()
finally:
    db.close()

print(f"Raw rows pulled: {len(rows)}")

video_features = {}
video_category = {}
by_channel_velocity = defaultdict(list)
video_velocity_raw = {}
skipped_no_age = 0
for r in rows:
    days_live = (r.latest_snapshot_date - r.published_date).days
    if days_live < 1:
        skipped_no_age += 1
        continue
    velocity = r.views / days_live
    video_velocity_raw[r.video_id] = (r.channel_id, velocity)
    video_features[r.video_id] = title_features(r.title)
    video_category[r.video_id] = r.category or "uncategorized"
    by_channel_velocity[r.channel_id].append(velocity)

print(f"Skipped (published same day as latest snapshot): {skipped_no_age}")

channel_median_velocity = {cid: statistics.median(v) for cid, v in by_channel_velocity.items()}

video_multiplier = {}
for vid, (cid, velocity) in video_velocity_raw.items():
    med = channel_median_velocity[cid]
    if med:
        video_multiplier[vid] = velocity / med

print(f"Total channels: {len(by_channel_velocity)}")
print(f"Videos with a valid multiplier: {len(video_multiplier)}")

vids = list(video_multiplier.keys())
ys_all = [video_multiplier[v] for v in vids]

print("\n" + "=" * 70)
print("1. TITLE LENGTH IN CHARACTERS")
print("=" * 70)
xs = [video_features[v]["len_chars"] for v in vids]
r_pooled = spearman(xs, ys_all)
print(f"POOLED Spearman r: {r_pooled:.4f}  n={len(xs)}")
print(f"  {describe_r(r_pooled, 'positive (longer titles perform better)', 'negative (shorter titles perform better)')}")

by_cat = defaultdict(list)
for v in vids:
    by_cat[video_category[v]].append(v)

print(f"\n{'category':<15} {'n':>6} {'spearman_r':>11}   strength/direction")
for cat, cvids in sorted(by_cat.items(), key=lambda kv: -len(kv[1])):
    if len(cvids) < 30:
        print(f"{cat:<15} {len(cvids):>6} {'--':>11}   below 30-video floor, skipped")
        continue
    cxs = [video_features[v]["len_chars"] for v in cvids]
    cys = [video_multiplier[v] for v in cvids]
    r = spearman(cxs, cys)
    print(f"{cat:<15} {len(cvids):>6} {r:>11.4f}   {describe_r(r, 'longer wins', 'shorter wins')}")

bucketed = defaultdict(list)
channels_in_bucket = defaultdict(set)
for v in vids:
    label = bucket_for(video_features[v]["len_chars"])
    bucketed[label].append(video_multiplier[v])
    channels_in_bucket[label].add(video_velocity_raw[v][0])

print(f"\n{'bucket':<8} {'videos':>7} {'chans':>6} {'median_x':>9} {'mean_x':>8} {'p25_x':>8} {'p75_x':>8}")
for lo, hi, label in LENGTH_BUCKETS:
    mults = bucketed.get(label, [])
    if not mults:
        print(f"{label:<8} {'0':>7} {'0':>6} {'--':>9} {'--':>8} {'--':>8} {'--':>8}")
        continue
    med = statistics.median(mults)
    mean = statistics.mean(mults)
    q1, q3 = iqr(mults)
    print(f"{label:<8} {len(mults):>7} {len(channels_in_bucket[label]):>6} {med:>9.3f} {mean:>8.3f} {q1:>8.3f} {q3:>8.3f}")

all_lens = [video_features[v]["len_chars"] for v in vids]
print(f"\nOverall length: median {statistics.median(all_lens):.1f} chars, mean {statistics.mean(all_lens):.1f} chars")

print("\n" + "=" * 70)
print("2. TITLE LENGTH IN WORDS")
print("=" * 70)
wxs = [video_features[v]["len_words"] for v in vids]
r_words = spearman(wxs, ys_all)
print(f"POOLED Spearman r: {r_words:.4f}  n={len(wxs)}")
print(f"  {describe_r(r_words, 'positive (more words performs better)', 'negative (fewer words performs better)')}")
print(f"Overall word count: median {statistics.median(wxs):.1f} words, mean {statistics.mean(wxs):.1f} words")

print("\n" + "=" * 70)
print("3. BINARY TITLE PATTERNS (with vs. without)")
print("=" * 70)
BINARY_FEATURES = [
    ("has_number", "contains a number"),
    ("starts_with_number", "starts with a number"),
    ("is_question", "question-framed"),
    ("has_brackets", "has brackets/parens"),
    ("has_year", "has a year tag (20XX)"),
    ("has_colon", "has a colon (X: Y)"),
    ("has_allcaps_word", "has an all-caps word"),
    ("has_emoji", "has an emoji"),
]

print(f"{'feature':<22} {'n_with':>7} {'pct':>6} {'median_x_with':>14} {'median_x_without':>17} {'r':>8}   direction")
for key, label in BINARY_FEATURES:
    flags = [1 if video_features[v][key] else 0 for v in vids]
    n_with = sum(flags)
    pct = 100 * n_with / len(vids)
    with_mults = [video_multiplier[v] for v in vids if video_features[v][key]]
    without_mults = [video_multiplier[v] for v in vids if not video_features[v][key]]
    med_with = statistics.median(with_mults) if with_mults else float("nan")
    med_without = statistics.median(without_mults) if without_mults else float("nan")
    r = spearman(flags, ys_all)
    r_str = f"{r:.4f}" if r is not None else "n/a"
    direction = describe_r(r, "helps", "hurts") if r is not None else "n/a"
    print(f"{label:<22} {n_with:>7} {pct:>5.1f}% {med_with:>14.3f} {med_without:>17.3f} {r_str:>8}   {direction}")
