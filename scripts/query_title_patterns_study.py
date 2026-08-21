"""One-off, read-only: full data pull for a standalone "what winning YouTube
titles have in common" study (DATA-STUDIES.md study #2, promoted from a
fold-in stat to its own article 2026-08-21: "I don't need patches in the
study, I need a real study with loads of insights that people can link to
without me even reaching out ... I hope I'm now going to read a Backlinko or
Ahrefs level article"). Zero fresh API quota: everything below comes from
channel_videos + video_metric_snapshots, already collected by the weekly
moat loggers (DATA-STUDIES.md moat items #3c/#3d).

Two normalization steps under every angle (git log on this file has the full
reasoning from earlier passes):

1. VELOCITY = latest views / days live as of that snapshot. Controls for
   video age (a 170-day-old video and a 5-day-old video are not comparable
   on raw views).
2. MULTIPLIER = a video's velocity / its own channel's median velocity in
   this sample. Controls for channel size (same normalization pattern
   app/outliers.py uses for its outlier multiplier).

What makes this a Backlinko/Ahrefs-depth pass instead of a bucket-average
one, per direct feedback that means/medians alone read as amateur:

- DECILES, not 5 coarse buckets: title length split into 10 equal-count
  bins shows the actual shape of the curve (monotonic? a peak in the
  middle? flat then a cliff?), not just "shorter/longer wins."
- A curve-shape description is generated automatically from the decile
  medians (monotonic increasing/decreasing vs. a peak/trough at a specific
  decile), so the finding is about the SHAPE, the way ViewsKit's "monotonic,
  no second peak" claim is a shape claim, not just a direction claim.
- CROSS-TABS: the same fixed length-decile edges are applied separately to
  videos with vs. without a number in the title, and with vs. without
  question framing, so we can see whether the length effect holds, reverses,
  or disappears once another pattern is present. That is a genuinely new
  finding a single-variable study cannot produce.
- Per-niche correlation as a Simpson's-paradox check: a pooled relationship
  can appear only because certain niches both write long titles and perform
  well for unrelated reasons.
- Binary title patterns (numbers, questions, brackets, year tags, colons,
  all-caps words, emoji) each get prevalence, a median split, and their own
  correlation, not just a length view.
- N is reported first and prominently, Backlinko-style ("we analyzed N
  videos across M channels"), not buried at the bottom.

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


def iqr(vals):
    if len(vals) < 4:
        return (min(vals), max(vals))
    q1, _, q3 = statistics.quantiles(vals, n=4)
    return (q1, q3)


def percentiles(vals, ps=(10, 25, 50, 75, 90)):
    if not vals:
        return {p: None for p in ps}
    s = sorted(vals)
    n = len(s)
    out = {}
    for p in ps:
        idx = min(n - 1, max(0, round(p / 100 * (n - 1))))
        out[p] = s[idx]
    return out


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


def equal_count_bins(vids, key_fn, n_bins=10):
    """Split vids into n_bins equal-count groups by key_fn, sorted ascending.
    Returns list of (bin_index, lo_val, hi_val, [vids])."""
    sorted_vids = sorted(vids, key=key_fn)
    n = len(sorted_vids)
    bins = []
    for i in range(n_bins):
        lo_idx = (i * n) // n_bins
        hi_idx = ((i + 1) * n) // n_bins
        chunk = sorted_vids[lo_idx:hi_idx]
        if not chunk:
            continue
        bins.append((i + 1, key_fn(chunk[0]), key_fn(chunk[-1]), chunk))
    return bins


def fixed_edge_bins(vids, key_fn, edges):
    """Bucket vids into bins defined by [(lo, hi), ...] edges (inclusive lo,
    exclusive hi except the last). Returns list of (lo, hi, [vids])."""
    bins = [[] for _ in edges]
    for v in vids:
        k = key_fn(v)
        for i, (lo, hi) in enumerate(edges):
            if lo <= k < hi or (i == len(edges) - 1 and k >= lo):
                bins[i].append(v)
                break
    return [(edges[i][0], edges[i][1], bins[i]) for i in range(len(edges))]


def describe_curve(medians):
    """Heuristic shape description from a list of per-bin medians, in bin
    order. Not a statistical test, just a pointer for the human writing the
    article to verify against the actual printed numbers."""
    valid = [(i, m) for i, m in enumerate(medians) if m is not None]
    if len(valid) < 3:
        return "not enough populated bins to describe a shape"
    diffs = [valid[i + 1][1] - valid[i][1] for i in range(len(valid) - 1)]
    ups = sum(1 for d in diffs if d > 0)
    downs = sum(1 for d in diffs if d < 0)
    peak_i, peak_v = max(valid, key=lambda t: t[1])
    trough_i, trough_v = min(valid, key=lambda t: t[1])
    if downs == 0:
        return f"monotonically increasing (every bin), peak at bin {peak_i + 1}"
    if ups == 0:
        return f"monotonically decreasing (every bin), trough at bin {trough_i + 1}"
    if valid[0][0] < peak_i < valid[-1][0]:
        return f"peaks at bin {peak_i + 1} of {len(valid)} (not monotonic: a middle range outperforms both extremes)"
    return (f"mixed, {ups} increases / {downs} decreases across bins, "
            f"peak at bin {peak_i + 1}, trough at bin {trough_i + 1} (no clean monotonic pattern)")


db = SessionLocal()
try:
    rows = db.execute(text(QUERY)).fetchall()
finally:
    db.close()

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

channel_median_velocity = {cid: statistics.median(v) for cid, v in by_channel_velocity.items()}

video_multiplier = {}
for vid, (cid, velocity) in video_velocity_raw.items():
    med = channel_median_velocity[cid]
    if med:
        video_multiplier[vid] = velocity / med

vids = list(video_multiplier.keys())
ys_all = [video_multiplier[v] for v in vids]

print("=" * 74)
print(f"STUDY N: {len(vids)} videos across {len(by_channel_velocity)} channels")
print(f"(raw rows pulled: {len(rows)}, skipped same-day-as-snapshot: {skipped_no_age})")
print("=" * 74)

all_lens = [video_features[v]["len_chars"] for v in vids]
p = percentiles(all_lens)
print(f"\nTitle length spread (chars): p10={p[10]} p25={p[25]} median={p[50]} p75={p[75]} p90={p[90]}")
print(f"Mean: {statistics.mean(all_lens):.1f} chars")

print("\n" + "=" * 74)
print("1. TITLE LENGTH DECILES (equal-count bins, the actual curve)")
print("=" * 74)
decile_bins = equal_count_bins(vids, lambda v: video_features[v]["len_chars"], n_bins=10)
decile_medians = []
print(f"{'decile':<7} {'chars':<12} {'videos':>7} {'chans':>6} {'median_x':>9} {'mean_x':>8} {'p25_x':>8} {'p75_x':>8}")
for idx, lo, hi, chunk in decile_bins:
    mults = [video_multiplier[v] for v in chunk]
    chans = {video_velocity_raw[v][0] for v in chunk}
    med = statistics.median(mults)
    decile_medians.append(med)
    mean = statistics.mean(mults)
    q1, q3 = iqr(mults)
    print(f"D{idx:<6} {f'{lo}-{hi}':<12} {len(chunk):>7} {len(chans):>6} {med:>9.3f} {mean:>8.3f} {q1:>8.3f} {q3:>8.3f}")

print(f"\nCurve shape: {describe_curve(decile_medians)}")

r_pooled = spearman(all_lens, ys_all)
print(f"\nPOOLED Spearman r (length vs. multiplier): {r_pooled:.4f}  n={len(all_lens)}")
print(f"  {describe_r(r_pooled, 'positive (longer titles perform better)', 'negative (shorter titles perform better)')}")

print("\n" + "=" * 74)
print("2. TITLE LENGTH x NICHE (Simpson's-paradox check)")
print("=" * 74)
by_cat = defaultdict(list)
for v in vids:
    by_cat[video_category[v]].append(v)

print(f"{'category':<15} {'n':>6} {'spearman_r':>11}   strength/direction")
for cat, cvids in sorted(by_cat.items(), key=lambda kv: -len(kv[1])):
    if len(cvids) < 30:
        print(f"{cat:<15} {len(cvids):>6} {'--':>11}   below 30-video floor, skipped")
        continue
    cxs = [video_features[v]["len_chars"] for v in cvids]
    cys = [video_multiplier[v] for v in cvids]
    r = spearman(cxs, cys)
    print(f"{cat:<15} {len(cvids):>6} {r:>11.4f}   {describe_r(r, 'longer wins', 'shorter wins')}")

# Fixed edges from the pooled deciles, reused for both cross-tabs below so
# the two curves are directly comparable on the same x-axis.
edges = []
for i, (idx, lo, hi, chunk) in enumerate(decile_bins):
    next_lo = decile_bins[i + 1][1] if i + 1 < len(decile_bins) else hi + 1
    edges.append((lo, next_lo))

print("\n" + "=" * 74)
print("3. LENGTH x NUMBER-IN-TITLE cross-tab (same length bins both rows)")
print("=" * 74)
for flag_val, label in [(True, "HAS a number"), (False, "NO number")]:
    subset = [v for v in vids if video_features[v]["has_number"] == flag_val]
    bins = fixed_edge_bins(subset, lambda v: video_features[v]["len_chars"], edges)
    meds = []
    for lo, hi, chunk in bins:
        if len(chunk) < 20:
            meds.append(None)
            continue
        meds.append(statistics.median(video_multiplier[v] for v in chunk))
    print(f"\n{label} (n={len(subset)}):")
    print("  " + "  ".join(f"{m:.2f}" if m is not None else "  --" for m in meds) + "   (one value per length decile, low-n bins as --)")
    print(f"  shape: {describe_curve(meds)}")

print("\n" + "=" * 74)
print("4. LENGTH x QUESTION-FRAMING cross-tab (same length bins both rows)")
print("=" * 74)
for flag_val, label in [(True, "IS a question"), (False, "NOT a question")]:
    subset = [v for v in vids if video_features[v]["is_question"] == flag_val]
    bins = fixed_edge_bins(subset, lambda v: video_features[v]["len_chars"], edges)
    meds = []
    for lo, hi, chunk in bins:
        if len(chunk) < 20:
            meds.append(None)
            continue
        meds.append(statistics.median(video_multiplier[v] for v in chunk))
    print(f"\n{label} (n={len(subset)}):")
    print("  " + "  ".join(f"{m:.2f}" if m is not None else "  --" for m in meds) + "   (one value per length decile, low-n bins as --)")
    print(f"  shape: {describe_curve(meds)}")

print("\n" + "=" * 74)
print("5. TITLE LENGTH IN WORDS")
print("=" * 74)
wxs = [video_features[v]["len_words"] for v in vids]
r_words = spearman(wxs, ys_all)
print(f"POOLED Spearman r: {r_words:.4f}  n={len(wxs)}")
print(f"  {describe_r(r_words, 'positive (more words performs better)', 'negative (fewer words performs better)')}")
print(f"Overall word count: median {statistics.median(wxs):.1f} words, mean {statistics.mean(wxs):.1f} words")

print("\n" + "=" * 74)
print("6. BINARY TITLE PATTERNS (with vs. without)")
print("=" * 74)
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
