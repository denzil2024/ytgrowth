import os
import re
import urllib.parse
import requests
from collections import Counter
from googleapiclient.discovery import build
import anthropic

POWER_WORDS = {
    "how", "why", "best", "top", "secret", "truth", "worst", "never",
    "always", "every", "proven", "ultimate", "complete", "guide", "tips",
    "mistakes", "warning", "shocking", "exposed", "revealed", "hack",
    "tricks", "fast", "easy", "simple", "free", "new", "first", "last",
    "finally", "stop", "start", "instantly", "immediately", "today",
}

QUESTION_STARTERS = {
    "how", "why", "what", "when", "who", "which", "where", "is", "are",
    "does", "can", "will", "should",
}

_EN_WORDS = {
    "the","a","an","is","are","was","were","be","been","being","have","has","had","do",
    "does","did","will","would","could","should","may","might","shall","must","can",
    "i","me","my","we","our","you","your","he","him","his","she","her","it","its",
    "they","them","their","what","which","who","this","that","these","those","am",
    "and","or","but","if","in","on","at","to","for","of","with","about","between",
    "into","through","during","before","after","from","up","down","out","off","over",
    "then","here","there","when","where","why","how","all","both","each","few","more",
    "most","other","some","no","not","only","same","so","than","too","very","just",
    "because","as","until","while","though","since","yet","still","also",
    "get","got","make","made","go","come","see","know","think","take","look","want",
    "give","use","find","tell","ask","feel","try","leave","call","keep","let","show",
    "hear","play","run","move","live","believe","bring","write","sit","stand","lose",
    "pay","meet","learn","change","understand","watch","follow","stop","create","spend",
    "grow","open","walk","win","remember","love","buy","wait","build","stay","return",
    "day","days","time","year","years","way","people","life","hand","part","place",
    "work","number","night","point","home","room","area","money","story","month","lot",
    "right","study","book","job","word","business","friend","power","hour","game","end",
    "city","name","school","talk","body","information","back","level","health","person",
    "thing","things","something","nothing","everything","anything","someone","everyone",
    "video","channel","subscribe","like","comment","share","watch","content","creator",
    "vlog","blog","episode","series","tutorial","guide","tips","tricks","hacks","secrets",
    "review","unboxing","challenge","routine","update","reaction","behind","scenes",
    "travel","trip","tour","visit","explore","adventure","journey","experience",
    "fitness","workout","exercise","diet","healthy","weight","gym","training",
    "cooking","recipe","meal","kitchen","ingredients","easy","simple","quick",
    "income","budget","savings","investment","finance","rich","wealth","earn",
    "tech","phone","laptop","computer","software","app","gadget","device","setup",
    "beauty","makeup","skincare","fashion","style","outfit","hair","skin",
    "music","song","dance","artist","album","funny","comedy","laugh","prank",
    "best","top","worst","first","last","new","old","big","small","great","good","bad",
    "real","true","honest","secret","hidden","revealed","exposed","shocking","amazing",
    "awesome","incredible","ultimate","complete","full","every","daily","free","live",
    "happy","sad","angry","excited","lonely","tired","relationship","family","friends",
    "alone","love","morning","night","today","yesterday","tomorrow","week","month",
    "one","two","three","four","five","six","seven","eight","nine","ten",
}

VIRAL_FORMATS = {
    "survival_challenge": {
        "label": "Survival / Time Challenge",
        "patterns": [r"\bi survived\b", r"\b\d+\s*(hour|day|week|month|year)s?\s*(with|in|of|challenge)\b"],
        "example": "I Survived 24 Hours With [Person/Situation]",
        "why": "Extreme curiosity — viewer must know the outcome.",
    },
    "extreme_comparison": {
        "label": "Extreme Comparison",
        "patterns": [r"\$[\d,]+\s+vs\.?\s+\$[\d,]+", r"\b(cheap|budget|expensive|luxury)\b.{0,25}\bvs\.?\b"],
        "example": "$5 VS $500 [Subject]: Honest Review",
        "why": "Price contrast triggers the value-seeking instinct immediately.",
    },
    "authority_warning": {
        "label": "Authority / Warning",
        "patterns": [r"\bdon'?t\b.{0,35}\buntil\b", r"\bnever\b.{0,25}\bdo this instead\b", r"\bbefore you (buy|start|try|do)\b"],
        "example": "Don't Buy [Subject] Until You See This",
        "why": "Fear of making a mistake drives very high CTR.",
    },
    "listicle": {
        "label": "Listicle / Structure",
        "patterns": [r"^\d+\s+(things|ways|tips|mistakes|reasons|steps|secrets|hacks|facts)\b", r"^\d+.{0,35}\bi (wish|knew|learned)\b"],
        "example": "7 Things I Wish I Knew About [Subject]",
        "why": "Numbers set clear expectations — viewers know exactly what they get.",
    },
    "curiosity_gap": {
        "label": "Curiosity Gap",
        "patterns": [r"\bi tested\b", r"\bi tried (every|all)\b", r"\bthe (truth|reality|secret) (about|behind)\b", r"\bnobody (talks|tells) (about|you)\b"],
        "example": "I Tested Every [Subject] So You Don't Have To",
        "why": "Creates an open loop the viewer must click to resolve.",
    },
    "aspirational": {
        "label": "Aspirational / How I",
        "patterns": [r"\bhow i\b.{0,45}\b(grew|made|built|earned|lost|gained|went from|turned)\b", r"\bfrom \d+.{0,30}to \d+\b"],
        "example": "How I Grew [Subject] From 0 to [Number] in [Time]",
        "why": "Transformation stories are the highest-retention format.",
    },
}

# Stop words for n-gram extraction — includes contractions after punctuation-stripping
_NGRAM_STOP = {
    "the","a","an","in","on","at","to","for","of","and","or","but","is","are","was",
    "i","my","we","our","you","your","it","this","that","with","as","so","if","be",
    "been","being","have","has","had","do","does","did","will","would","could","should",
    "may","might","shall","must","can","not","no","nor","yet","still","just","even",
    "also","very","too","more","most","much","many","any","all","both","each","few",
    "see","get","go","come","know","think","take","look","want","give","use","find",
    "tell","ask","feel","try","keep","let","say","make","put","set","run","its",
    # contractions become these after apostrophe is stripped:
    "cant","dont","wont","doesnt","didnt","couldnt","shouldnt","wouldnt","isnt",
    "arent","wasnt","werent","hasnt","havent","hadnt","ive","youre","theyre","hes",
    "shes","weve","theyll","thats","whats","whos","lets","im","id","ill","youd",
    # generic filler that leaks into title n-grams:
    "how","why","what","when","who","which","where","now","then","here","there","well",
    "really","literally","actually","basically","totally","completely","honestly",
}

_TITLE_NOISE = {"vlog","vlogging","shorts","video","watch","youtube","subscribe","channel"}


# ─── Claude helpers ────────────────────────────────────────────────────────────

def _make_client() -> anthropic.Anthropic:
    from app.utils import make_anthropic_client
    return make_anthropic_client()


# YouTube content genre keywords — must always be preserved in search terms, never dropped
_GENRE_WORDS = {
    "haul", "vlog", "vlogmas", "grwm", "ootd", "diml", "asmr",
    "challenge", "reaction", "unboxing", "review", "tutorial", "mukbang",
    "lookbook", "storytime", "transformation", "routine", "lifestyle",
    "travel", "collab", "q&a", "qa", "favourites", "favorites", "empties",
    "wishlist", "collection", "try-on", "tryon", "try on", "swap",
    "monthly", "weekly", "daily", "day in my life",
    # housing & real estate content
    "tour", "house tour", "apartment tour", "room tour", "home tour",
    "moving vlog", "rent", "apartment",
}



def _extract_search_terms(client: anthropic.Anthropic, title: str, context: str) -> list[str]:
    """
    Extract the PRIMARY NICHE PHRASE + 2–3 related phrases from a title.

    The first term returned is the core YouTube search query — e.g. "house tour kenya".
    This is what viewers type to find this exact category of video and what we use
    as the primary YouTube search query.

    Rule: preserve content genre words (haul, vlog, tour, grwm, etc.) and any
    location/person modifiers that define the niche. Never strip them into generic terms.
      "My House Tour Kenya" → "house tour kenya"   ✓
      NOT → "home decor", "interior design"        ✗
    """
    extra = f"\nExtra context: {context}" if context else ""

    title_lower = title.lower()
    found_genres = [g for g in _GENRE_WORDS if g in title_lower]
    genre_hint = (
        f"\nThese YouTube content-genre words appear in the title and MUST be in the primary phrase: {', '.join(found_genres)}"
        if found_genres else ""
    )

    try:
        msg = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=120,
            messages=[{"role": "user", "content": (
                f'Title: "{title}"{extra}{genre_hint}\n\n'
                f'Task: identify the YouTube search phrases for this creator video.\n\n'
                f'STEP 1 — PRIMARY NICHE PHRASE (return this FIRST):\n'
                f'What 2–4 words would a viewer type on YouTube to find this exact category?\n'
                f'Combine: content-type + subject/location/person.\n'
                f'Examples:\n'
                f'  "My House Tour Kenya // ..." → "house tour kenya"\n'
                f'  "Monthly Amazon Haul..." → "amazon haul"\n'
                f'  "GRWM: First Day of College..." → "grwm college"\n'
                f'  "How I Made $10k on Etsy..." → "how to make money etsy"\n\n'
                f'STEP 2 — 2–3 RELATED PHRASES:\n'
                f'Variations a viewer might also search. Keep the genre word and modifier.\n\n'
                f'RULES:\n'
                f'- NEVER drop genre words (tour, haul, grwm, vlog, challenge, review, etc.)\n'
                f'- NEVER drop location/person/platform modifiers (kenya, amazon, college, etc.)\n'
                f'- Do NOT go generic: "house tour" without "kenya" loses the niche\n\n'
                f'Return ONLY comma-separated phrases, primary first, no commentary.'
            )}]
        )
        raw = msg.content[0].text.strip()
        terms = [t.strip().lower() for t in raw.split(",") if t.strip()]
        terms = [t for t in terms if len(t) > 3][:4]

        # Safety: if the primary term lost any genre or location modifier, try to restore
        if found_genres and terms:
            primary = terms[0]
            missing = [g for g in found_genres if g not in primary]
            for g in missing[:1]:
                terms[0] = f"{g} {primary}"[:50]

        return terms if terms else [title[:60]]

    except Exception as e:
        print(f"Search term extraction error: {e}")
        filler = _NGRAM_STOP | {"see", "come", "still", "make", "made", "get", "got"}
        words = re.sub(r"[^\w\s]", " ", title.lower()).split()
        meaningful = [w for w in words if (w not in filler and len(w) > 3) or w in _GENRE_WORDS]
        return [" ".join(meaningful[:4])] if meaningful else [title[:50]]


# ─── YouTube data fetching ─────────────────────────────────────────────────────

def _is_ascii_english(text: str) -> bool:
    """Return True only for ASCII text — filters Hindi, Arabic, CJK characters."""
    try:
        text.encode("ascii")
        return bool(text.strip())
    except UnicodeEncodeError:
        return False


def _is_english(text: str) -> bool:
    if not text:
        return False
    clean = re.sub(r"#\w+", "", text)
    clean = re.sub(r"[^\x00-\x7F]+", " ", clean).strip()
    if not clean:
        return False
    words = [w.lower().strip('.,!?"\':;()[]{}|-') for w in clean.split() if w.strip()]
    words = [w for w in words if w]
    if not words:
        return False
    return sum(1 for w in words if w in _EN_WORDS) >= 2


_SHORTS_PATTERNS = re.compile(r"#shorts?|#short\b|\byt\s*shorts?\b", re.IGNORECASE)


def _parse_duration_seconds(iso: str) -> int:
    """Parse ISO 8601 duration (PT4M30S) → total seconds."""
    m = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", iso or "")
    if not m:
        return 0
    h, mn, s = m.groups()
    return int(h or 0) * 3600 + int(mn or 0) * 60 + int(s or 0)


def _is_short(title: str, duration_seconds: int) -> bool:
    """True if this is a YouTube Short — different content type, different title conventions."""
    if _SHORTS_PATTERNS.search(title):
        return True
    # Shorts are ≤ 60 seconds; filter anything under 90s to have a safe margin
    if 0 < duration_seconds <= 90:
        return True
    return False


def _search_youtube_once(youtube, query: str, max_results: int = 25, order: str = "relevance") -> dict[str, dict]:
    """Run a single YouTube search. Returns raw candidates (Shorts not yet filtered — done in batch)."""
    try:
        resp = youtube.search().list(
            part="snippet",
            q=query,
            type="video",
            order=order,
            maxResults=max_results,
            relevanceLanguage="en",
            regionCode="US",
        ).execute()
    except Exception as e:
        print(f"YouTube search error for '{query}': {e}")
        return {}

    results: dict[str, dict] = {}
    for item in resp.get("items", []):
        snippet = item["snippet"]
        title = snippet.get("title", "")
        if not _is_english(title):
            continue
        if _SHORTS_PATTERNS.search(title):
            continue
        vid_id = item["id"]["videoId"]
        results[vid_id] = {
            "video_id": vid_id,
            "title": title,
            "channel": snippet.get("channelTitle", ""),
            "thumbnail": snippet.get("thumbnails", {}).get("medium", {}).get("url", ""),
            "tags": [],
            "view_count": 0,
        }
    return results


def search_top_videos(credentials, search_terms: list[str], max_results: int = 25) -> list[dict]:
    """
    Multi-query YouTube search (order=relevance) → deduplicate → fetch details, view counts,
    and duration → filter Shorts.

    order=relevance gives us what actually ranks for this query — the real competitive landscape.
    We fetch view counts so Claude can understand what's performing vs what's just ranking.
    """
    youtube = build("youtube", "v3", credentials=credentials)
    combined: dict[str, dict] = {}

    for term in search_terms:
        # Primary search: relevance order (what competes for this query)
        batch = _search_youtube_once(youtube, term, max_results=max_results, order="relevance")
        for vid_id, data in batch.items():
            if vid_id not in combined:
                combined[vid_id] = data

    if not combined:
        return []

    # Batch-fetch snippet (tags) + contentDetails (duration) + statistics (view count)
    try:
        details_resp = youtube.videos().list(
            part="snippet,contentDetails,statistics",
            id=",".join(list(combined.keys())[:50]),
        ).execute()
        non_shorts: dict[str, dict] = {}
        for item in details_resp.get("items", []):
            vid_id = item["id"]
            if vid_id not in combined:
                continue
            duration_iso = item.get("contentDetails", {}).get("duration", "")
            duration_sec = _parse_duration_seconds(duration_iso)
            title = combined[vid_id]["title"]
            if _is_short(title, duration_sec):
                continue
            raw_tags = item["snippet"].get("tags", [])
            combined[vid_id]["tags"] = [t for t in raw_tags if _is_ascii_english(t)][:20]
            combined[vid_id]["duration_seconds"] = duration_sec
            combined[vid_id]["view_count"] = int(
                item.get("statistics", {}).get("viewCount", 0)
            )
            combined[vid_id]["published_at"] = item["snippet"].get("publishedAt", "")[:10]
            non_shorts[vid_id] = combined[vid_id]
    except Exception as e:
        print(f"Video details error: {e}")
        non_shorts = combined

    return list(non_shorts.values())


def get_autocomplete_suggestions(search_terms: list[str]) -> list[str]:
    """
    Fetch YouTube autocomplete for each search term.
    Autocomplete = what real viewers actually type = the highest-intent keywords.
    """
    results: list[str] = []
    for term in search_terms:
        for query in [term, f"best {term}", f"how to {term}"]:
            try:
                url = (
                    "https://suggestqueries.google.com/complete/search"
                    f"?client=firefox&ds=yt&q={urllib.parse.quote(query)}&hl=en"
                )
                resp = requests.get(url, timeout=4, headers={"User-Agent": "Mozilla/5.0"})
                if resp.ok:
                    data = resp.json()
                    for s in (data[1] if len(data) > 1 else []):
                        if isinstance(s, str) and _is_ascii_english(s) and s not in results:
                            results.append(s)
            except Exception as e:
                print(f"Autocomplete error for '{query}': {e}")
    return results[:30]


# ─── Keyword research ──────────────────────────────────────────────────────────

def _extract_ngram_candidates(titles: list[str], autocomplete: list[str]) -> list[str]:
    """Extract 2–3 word phrases that repeat across top titles + autocomplete."""
    all_text = titles + autocomplete
    bigrams: list[str] = []
    trigrams: list[str] = []

    for text in all_text:
        clean = re.sub(r"[^\w\s]", " ", text.lower())
        words = [w for w in clean.split() if w and w not in _NGRAM_STOP and len(w) > 2]
        for i in range(len(words) - 1):
            bigrams.append(f"{words[i]} {words[i+1]}")
        for i in range(len(words) - 2):
            trigrams.append(f"{words[i]} {words[i+1]} {words[i+2]}")

    bi_counts = Counter(bigrams)
    tri_counts = Counter(trigrams)
    phrases = [p for p, c in tri_counts.most_common(12) if c >= 2]
    phrases += [p for p, c in bi_counts.most_common(20) if c >= 2 and p not in " ".join(phrases)]
    return phrases[:20]


def _score_keyword(
    phrase: str,
    autocomplete: list[str],
    titles: list[str],
    all_tags: list[str],
) -> dict:
    """
    Score a keyword phrase on two axes — like VidIQ:

    VOLUME  = how many people search for it
              Proxy: how many autocomplete suggestions contain this phrase
              (autocomplete only surfaces high-volume queries)

    COMPETITION = how hard is it to rank
              Proxy: how many of the top videos already target this exact phrase
              in their title (high title frequency = established competition)

    SCORE   = weighted combination favouring low competition + decent volume
    """
    p = phrase.lower()
    ac_hits   = sum(1 for s in autocomplete if p in s.lower())
    title_hits = sum(1 for t in titles    if p in t.lower())
    tag_hits   = sum(1 for t in all_tags  if p in t.lower())

    # Volume: autocomplete is the strongest signal (real search demand)
    # 1 hit = LOW, 2–3 = MED, 4+ = HIGH
    volume_score = min(ac_hits * 30, 100)

    # Competition: more top videos targeting it = harder to break in
    # 0–2 videos = LOW competition (green), 3–5 = MED, 6+ = HIGH
    comp_score = min(title_hits * 18 + tag_hits * 8, 100)

    # Overall score rewards LOW competition + HIGH volume
    overall = int(volume_score * 0.55 + (100 - comp_score) * 0.45)

    volume_label = "HIGH" if volume_score >= 70 else "MED" if volume_score >= 35 else "LOW"
    comp_label   = "HIGH" if comp_score   >= 65 else "MED" if comp_score   >= 35 else "LOW"

    return {
        "phrase":      phrase,
        "score":       overall,
        "volume":      volume_label,
        "competition": comp_label,
        "ac_hits":     ac_hits,
        "title_hits":  title_hits,
    }


def research_keywords(
    search_terms: list[str],
    autocomplete: list[str],
    top_titles: list[str],
    all_tags: list[str],
) -> list[dict]:
    """
    Build a ranked keyword list with volume + competition scores.
    This is the data that powers both the keyword panel and the Claude prompt.
    """
    candidates = _extract_ngram_candidates(top_titles, autocomplete)

    # Also include the original search terms themselves as candidates
    for term in search_terms:
        if term not in candidates:
            candidates.append(term)

    scored = [_score_keyword(p, autocomplete, top_titles, all_tags) for p in candidates]
    # Sort: highest overall score first (best opportunity = high volume, low competition)
    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:15]


# ─── Title scoring ─────────────────────────────────────────────────────────────

def _detect_viral_format(title: str) -> str | None:
    t = title.lower()
    for fmt_key, fmt_data in VIRAL_FORMATS.items():
        for pattern in fmt_data["patterns"]:
            if re.search(pattern, t):
                return fmt_key
    return None


def _score_title(title: str, top_titles: list[str]) -> dict:
    t = title.strip()
    words = t.lower().split()
    scores = {}

    length = len(t)
    if 50 <= length <= 70:
        scores["length"] = 25
    elif 40 <= length <= 80:
        scores["length"] = 15
    elif length < 20:
        scores["length"] = 0
    else:
        scores["length"] = 8

    first_three = [w.strip(".,!?\"'()[]") for w in words[:3]]
    strong_start = (
        any(w in POWER_WORDS or w in QUESTION_STARTERS for w in first_three)
        or any(re.search(r"\d", w) for w in first_three)
    )
    scores["front_loading"] = 15 if strong_start else 0

    found_power = [w for w in words if w.strip(".,!?\"'") in POWER_WORDS]
    scores["power_words"] = min(len(found_power) * 8, 15)

    scores["numbers"] = 10 if re.search(r"\d", t) else 0

    scores["question"] = 10 if (words[0] in QUESTION_STARTERS if words else False) or t.endswith("?") else 0

    scores["hook_format"] = 10 if re.search(r"[\[\(\|:]", t) else 0

    if top_titles:
        top_words: set[str] = set()
        for tt in top_titles:
            for w in re.sub(r"#\w+", "", tt).lower().split():
                cw = w.strip(".,!?\"'")
                if len(cw) > 3 and cw not in _TITLE_NOISE:
                    top_words.add(cw)
        overlap = sum(1 for w in words if w.strip(".,!?\"'") in top_words)
        scores["keyword_relevance"] = min(overlap * 2, 10)
    else:
        scores["keyword_relevance"] = 5

    viral_fmt = _detect_viral_format(t)
    scores["viral_format"] = 10 if viral_fmt else 0

    return {
        "total": min(sum(scores.values()), 100),
        "breakdown": scores,
        "length": length,
        "power_words_found": found_power,
        "viral_format_detected": viral_fmt,
    }


# ─── Deterministic SEO / CTR / Hook rubric for AI-suggested titles ──────────────
#
# Replaces the old "ask Claude to grade itself" pattern (which returned arbitrary
# numbers with no rubric). All three scores here are computed purely from the
# title text against the live keyword + competitor data — so rankings are stable,
# repeatable, and explainable.

_SPECIFICITY_PATTERN  = re.compile(r"(\$[\d,]+|[A-Za-z]{2,5}\s?[\d,]{2,}|\d+%|\d+\s*(hour|day|week|month|year|min|sec)s?|\d+\s*(k|m|b)\b|\$?\d{2,})", re.IGNORECASE)
_CONTRAST_PATTERN     = re.compile(r"\b(vs\.?|versus|before|after|but|instead|actually|really|truth|reality|honest|worth it)\b", re.IGNORECASE)
# Curiosity: explicit question words + implicit open-loop phrases the old pattern missed.
_CURIOSITY_PATTERN    = re.compile(r"\b(why|how|what|which|secret|reason|nobody|no one|wish|never|until|behind|inside|actually|finally|did i|did it|did we|did they|does it|can i|will i|will it|is it|surviving|trying|testing|tested|tried|cover|covers|covered|works?|worked|really)\b", re.IGNORECASE)
# Present-tense verb openers that signal journey/story — reward alongside power words as a valid strong opener.
_VERB_OPENER          = re.compile(r"^(surviving|trying|testing|spending|making|cooking|shopping|building|going|coming|inside|watch|meet|come|live|turning|finding|learning|growing)\b", re.IGNORECASE)
# First-person ownership — emotional anchor for vlog/personal content.
_PERSONAL_VOICE       = re.compile(r"\b(i|i'?m|my|me|we|our|us)\b", re.IGNORECASE)
_GENERIC_CLICKBAIT    = re.compile(r"\b(shocking|unbelievable|insane|crazy|you won'?t believe|gone wrong|must watch)\b", re.IGNORECASE)


def _tokenize(text: str) -> list[str]:
    return [w.strip(".,!?\"'()[]:") for w in text.lower().split() if w.strip()]


def _score_suggestion_rubric(title: str, top_titles: list[str], keyword_scores: list[dict] | None, primary_keyword: str = "") -> dict:
    """
    Returns { seo, ctr, hook, combined, breakdown } for a single suggested title.
    Combined = SEO * 0.30 + CTR * 0.40 + Hook * 0.30  (CTR is the viewer's first decision).

    Rubric is calibrated so a solid creative title (good length, keyword word-overlap,
    concrete detail, personal voice, strong opener) lands in the 70-85 range — not 45-55.
    """
    t = title.strip()
    t_lower = t.lower()
    words = _tokenize(t)
    length = len(t)

    # ───── SEO (0-100) ─────
    seo = 0
    # Length compliance (0-25)
    if 50 <= length <= 70:    seo += 25
    elif 40 <= length <= 80:  seo += 18
    elif 30 <= length < 40:   seo += 10
    else:                     seo += 0

    # Primary keyword — WORD-LEVEL overlap, not substring. "shopping haul kenya" vs
    # "Ksh 12,000 Monthly Shop" should register the partial match on "shop", not zero out.
    pk = (primary_keyword or "").strip().lower()
    pk_words = set(w for w in pk.split() if len(w) > 2)
    title_word_set = set(words)
    if pk_words:
        overlap_ct = len(pk_words & title_word_set)
        overlap_ratio = overlap_ct / len(pk_words)
        first_half = t_lower[: max(1, len(t) // 2)]
        if overlap_ratio >= 1.0:
            seo += 35 if any(w in first_half for w in pk_words) else 26
        elif overlap_ratio >= 0.5:
            seo += 22
        elif overlap_ratio > 0:
            seo += 14
        else:
            seo += 4  # not zero — title can still be SEO-valid via secondary keywords
    else:
        seo += 22  # no primary given — don't penalise

    # Secondary keyword coverage (0-25) — word-overlap count across top 10 keyword phrases.
    if keyword_scores:
        hits = 0
        seen_phrases = set()
        for k in keyword_scores[:10]:
            phrase = (k.get("phrase") or "").lower().strip()
            if not phrase or phrase == pk or phrase in seen_phrases:
                continue
            seen_phrases.add(phrase)
            phrase_words = set(w for w in phrase.split() if len(w) > 2)
            if phrase_words and len(phrase_words & title_word_set) >= min(2, len(phrase_words)):
                hits += 1
        seo += min(hits * 7, 25)
    else:
        seo += 10

    # Anti-keyword-stuffing (0-15)
    if pk:
        repeats = t_lower.count(pk) if pk in t_lower else 0
        seo += 15 if repeats <= 1 else (8 if repeats == 2 else 0)
    else:
        seo += 12

    seo = min(seo, 100)

    # ───── CTR (0-100) — does the viewer's thumb stop scrolling ─────
    ctr = 0
    # Specificity (0-30): numbers, dollar/currency, timeframes
    has_specificity = bool(_SPECIFICITY_PATTERN.search(t))
    if has_specificity:
        ctr += 30

    # Emotional contrast / turn (0-15)
    has_contrast = bool(_CONTRAST_PATTERN.search(t))
    if has_contrast:
        ctr += 15

    # Curiosity — broader: explicit questions, journey verbs, open-loop implications, "?" ending
    has_curiosity = bool(_CURIOSITY_PATTERN.search(t)) or t.endswith("?")
    if has_curiosity:
        ctr += 25

    # Power-word discipline — 1 is ideal, more than 2 reads as spam
    power_hits = sum(1 for w in words if w in POWER_WORDS)
    if power_hits == 0:    ctr += 10
    elif power_hits == 1:  ctr += 15
    elif power_hits == 2:  ctr += 10
    else:                  ctr += 0

    # Personal voice (0-5) — "my", "i", "me" signals authentic creator content
    if _PERSONAL_VOICE.search(t):
        ctr += 5

    # Not generic clickbait (0-10)
    ctr += 0 if _GENERIC_CLICKBAIT.search(t) else 10

    ctr = min(ctr, 100)

    # ───── Hook (0-100) — opening strength + pattern interrupt vs competitor set ─────
    hook = 0

    # Opening strength (0-25) — any of: keyword/question/number, power word, strong verb opener, personal pronoun
    first_three = words[:3]
    strong_first = (
        any(w in POWER_WORDS or w in QUESTION_STARTERS for w in first_three)
        or any(re.search(r"\d", w) for w in first_three)
        or bool(pk_words and words and words[0] in pk_words)
        or bool(_VERB_OPENER.match(t))
        or (words and words[0] in {"i", "my", "me", "we"})
    )
    hook += 25 if strong_first else 14

    # Pattern interrupt vs competitors (0-25). Low floor of 8 so a niche with overlapping
    # vocabulary doesn't crater every title.
    if top_titles and words:
        competitor_words = set()
        for ct in top_titles[:15]:
            for w in _tokenize(ct):
                if len(w) > 3 and w not in _TITLE_NOISE:
                    competitor_words.add(w)
        meaningful_title_words = [w for w in words if len(w) > 3 and w not in _TITLE_NOISE]
        if meaningful_title_words:
            novel = [w for w in meaningful_title_words if w not in competitor_words]
            novelty_ratio = len(novel) / len(meaningful_title_words)
            hook += max(8, int(novelty_ratio * 25))
        else:
            hook += 15
    else:
        hook += 15

    # Concrete stakes / outcome (0-25)
    outcome_verbs = re.compile(
        r"\b(grew|made|built|earned|lost|gained|turned|went from|saved|doubled|tripled|quit|"
        r"fixed|broke|survived|surviving|tested|tried|covers?|covered|discovered|found)\b",
        re.IGNORECASE,
    )
    has_stakes = has_specificity or bool(outcome_verbs.search(t))
    hook += 25 if has_stakes else 10

    # Personal investment (0-15) — first-person ownership makes the viewer feel it's a real story
    hook += 15 if _PERSONAL_VOICE.search(t) else 0

    # Viral format match (0-10) — mild signal, don't overweight
    hook += 10 if _detect_viral_format(t) else 4

    hook = min(hook, 100)

    combined = round(seo * 0.30 + ctr * 0.40 + hook * 0.30)

    return {
        "seo": seo,
        "ctr": ctr,
        "hook": hook,
        "combined": combined,
        "breakdown": {
            "length": length,
            "primary_keyword_overlap": round((len(pk_words & title_word_set) / len(pk_words)) if pk_words else 1.0, 2),
            "power_word_count": power_hits,
            "has_specificity": has_specificity,
            "has_contrast": has_contrast,
            "has_curiosity": has_curiosity,
            "has_personal_voice": bool(_PERSONAL_VOICE.search(t)),
            "is_generic_clickbait": bool(_GENERIC_CLICKBAIT.search(t)),
        },
    }


# ─── Claude prompt + suggestions ──────────────────────────────────────────────

def _build_gap_report(breakdown: dict) -> str:
    gaps = []
    if breakdown.get("length", 0) < 25:
        gaps.append("LENGTH: Must be 50–70 characters. Count every character including spaces.")
    if breakdown.get("front_loading", 0) == 0:
        gaps.append(
            "FRONT-LOADING [CRITICAL]: First 3 words must be the strongest. "
            "Never start with weak filler: See, Come, Just, So, Still, Here, Well. "
            "Put the keyword, the number, or the strongest phrase first — the viewer decides in the first 3 words."
        )
    if breakdown.get("power_words", 0) == 0:
        gaps.append("EMOTIONAL PULL: No strong signal in the title. Use specificity — concrete numbers, outcomes, or contrasts — not generic clickbait words. Make the viewer feel the gap between where they are and where the video takes them.")
    if breakdown.get("numbers", 0) == 0:
        gaps.append("SPECIFICITY: A specific number, timeframe, or data point would make this more concrete and clickable (e.g. '3-Step', '$200', '7 Days').")
    if breakdown.get("hook_format", 0) == 0 and breakdown.get("question", 0) == 0:
        gaps.append("HOOK FORMAT: Consider splitting into hook + payoff with ':' (e.g. 'Why X: The Real Reason'). Or frame as a question the viewer is already asking.")
    if breakdown.get("viral_format", 0) == 0:
        gaps.append("STRUCTURE: No clear pattern found. The strongest YouTube titles follow a recognisable structure — comparison, transformation, question, or insider reveal.")
    if breakdown.get("keyword_relevance", 0) < 5:
        gaps.append("KEYWORDS: Title shares few words with top-performing videos. Use the keyword opportunities listed below.")
    return (
        "\n".join(f"  [{i+1}] {g}" for i, g in enumerate(gaps))
        if gaps else "  No critical gaps — push for higher emotional impact."
    )


def _strip_emdash(obj):
    """Recursively replace em-dashes (—) with a plain hyphen (-) in all strings."""
    if isinstance(obj, str):
        return obj.replace('\u2014', '-').replace('\u2013', '-')
    if isinstance(obj, dict):
        return {k: _strip_emdash(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_strip_emdash(i) for i in obj]
    return obj


# Words that stay lowercase in YouTube title case unless they are the first or last word.
_TC_MINOR = {
    'a', 'an', 'the',
    'and', 'but', 'or', 'nor', 'for', 'so', 'yet',
    'at', 'by', 'in', 'of', 'on', 'to', 'up', 'as', 'vs',
    'from', 'into', 'onto', 'with', 'per',
}

def _to_title_case(text: str) -> str:
    """
    Convert a YouTube title to proper title case.
    - Capitalises the first letter of every significant word.
    - Keeps short prepositions/conjunctions lowercase (unless first/last word).
    - Preserves all-caps tokens like 'AI', 'SEO', 'VS', '$500'.
    - Handles apostrophes correctly: "don't" → "Don't", not "Don'T".
    """
    if not text:
        return text
    words = text.split()
    result = []
    n = len(words)
    for i, word in enumerate(words):
        # Peel off any leading punctuation/symbols to find the alphabetic core
        lstrip_chars = "([#@$\""
        rstrip_chars = ")].,!?:;\""
        prefix = ""
        suffix = ""
        core = word
        while core and core[0] in lstrip_chars:
            prefix += core[0]
            core = core[1:]
        while core and core[-1] in rstrip_chars:
            suffix = core[-1] + suffix
            core = core[:-1]

        # Preserve all-caps tokens (acronyms, currency combos like $500, etc.)
        if core.isupper() and len(core) > 1:
            result.append(word)
            continue

        core_lower = core.lower()
        is_first = i == 0
        is_last  = i == n - 1

        if not is_first and not is_last and core_lower in _TC_MINOR:
            new_core = core_lower
        else:
            # Capitalise first letter only; fix apostrophe problem from str.title()
            new_core = core[0].upper() + core[1:] if core else core
            # "don't" → after upper → "Don't" is fine; but if it came in as "don'T" fix it
            new_core = re.sub(r"'([A-Z])", lambda m: "'" + m.group(1).lower(), new_core)

        result.append(prefix + new_core + suffix)
    return " ".join(result)


def _call_sonnet(client: anthropic.Anthropic, prompt: str) -> str:
    msg = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4900,
        messages=[{"role": "user", "content": prompt}]
    )
    return msg.content[0].text.strip()


_VLOG_GENRES = {
    "tour", "house tour", "apartment tour", "room tour", "home tour",
    "vlog", "grwm", "diml", "day in my life", "haul", "ootd",
    "storytime", "lookbook", "routine", "collab", "q&a",
    "favourites", "favorites", "empties", "wishlist",
    "moving vlog", "travel vlog",
}

_TUTORIAL_MARKERS = {"how to", "tutorial", "step by step", "beginners guide", "explained", "tips"}
_REVIEW_MARKERS = {"review", "unboxing", "vs", "comparison", "honest review", "tested"}


def _detect_content_type(title: str, primary_phrase: str) -> str:
    """
    Classify the video so we can apply the right title strategy.
    Returns: 'personal_vlog' | 'tutorial' | 'review' | 'general'
    """
    combined = (title + " " + primary_phrase).lower()
    if any(g in combined for g in _VLOG_GENRES):
        return "personal_vlog"
    if any(m in combined for m in _TUTORIAL_MARKERS):
        return "tutorial"
    if any(m in combined for m in _REVIEW_MARKERS):
        return "review"
    return "general"


def generate_title_suggestions(
    title: str,
    search_terms: list[str],
    top_videos: list[dict],
    score_data: dict,
    keyword_scores: list[dict],
    autocomplete: list[str],
    context: str = "",
    primary_phrase: str = "",
) -> tuple[list[dict], dict, str]:
    """
    3-phase prompt: analyse the live YouTube competitive data → find the gap →
    generate 3 titles with different psychological hooks.

    Returns (suggestions, intent_analysis, error_string).
    """
    import json as _json

    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key:
        return [], {}, "ANTHROPIC_API_KEY is not set"

    client = _make_client()
    content_type = _detect_content_type(title, primary_phrase)
    niche = primary_phrase or (search_terms[0] if search_terms else title[:40])
    top_titles = [v["title"] for v in top_videos]

    # Build the competitor data block with view counts — this is the ground truth
    if top_videos:
        competitor_block = "REAL YOUTUBE SEARCH RESULTS FOR THIS NICHE (live data):\n"
        for i, v in enumerate(top_videos[:10], 1):
            views = v.get("view_count", 0)
            views_str = f"{views:,}" if views else "unknown"
            competitor_block += f'  {i}. "{v["title"]}" — {views_str} views — {v["channel"]}\n'
    else:
        competitor_block = ""

    ac_block = (
        "YOUTUBE AUTOCOMPLETE (what viewers actually type when searching this niche):\n"
        + "\n".join(f"  - {s}" for s in autocomplete[:10])
    ) if autocomplete else ""

    best_kws = [k for k in keyword_scores if k["competition"] != "HIGH"][:6]
    kw_block = (
        "HIGH-OPPORTUNITY KEYWORDS (real search demand, low competition):\n"
        + "\n".join(f'  • "{k["phrase"]}"  volume={k["volume"]} competition={k["competition"]}' for k in best_kws)
    ) if best_kws else ""

    context_block = f"WHAT THE VIDEO IS ABOUT: {context}\n" if context else ""

    vlog_note = ""
    if content_type == "personal_vlog":
        vlog_note = """
CONTENT TYPE: Personal vlog / lifestyle video.
- First-person voice is natural: "My", "I", "Come", "Inside My"
- Do NOT invent listicle numbers ("7 Things") — this is not a list video
- Numbers that exist in the video (e.g. "2 Bedroom") are fine
"""

    prompt = f"""You are a YouTube growth strategist who writes titles for a living. Your job is NOT to brainstorm clever phrases — it is to write titles YouTube's recommendation engine will push to real viewers based on the live data below.

USER'S TITLE: "{title}"
NICHE KEYWORD: "{niche}"
{context_block}{vlog_note}
{competitor_block}
{ac_block}
{kw_block}

Your task has 3 phases. Return a single JSON object.

PHASE 1 — ANALYSIS (from the live YouTube data, not guesswork)
- search_intent: what is the viewer trying to achieve? (learn / discover / solve / buy / be entertained)
- emotional_driver: what feeling makes someone click on this type of video?
- viewer_profile: 1 sentence — who is typing this query and what outcome do they want?
- top_keywords: the 4–6 phrases that appear most across the competitor titles above
- dominant_patterns: what title structure dominates the top results? (e.g. "listicle", "personal story", "luxury reveal", "how-to")

PHASE 2 — GAP
- overused_angle: the framing too many of the competitor titles share
- gap_opportunity: the angle completely MISSING from every competitor title above. THIS is your differentiation wedge.

PHASE 3 — 3 CREATIVE TITLES
Write 3 titles, each aimed at the gap above. They must feel like titles a creator would write, not templates.

WHAT MAKES A TITLE WORK HERE:
- Emotional pull from SPECIFICITY — a real number, a concrete outcome, a named contrast, a real moment. Never generic clickbait ("Shocking", "You Won't Believe").
- Curiosity with a clear payoff — the viewer must know what they'll feel or learn by clicking.
- Pattern interrupt vs the competitor set — if every competitor title opens the same way, yours opens differently.
- Voice that sounds human, not marketing copy. Write as the creator talking directly to one person.
- Every title anchors on the gap_opportunity above — that is the reason YouTube will push it to a fresh audience.

HARD RULES (enforced):
- 50–70 characters total, including spaces. Count exactly.
- Plain text only. No emoji. No ALL CAPS words.
- FORBIDDEN CHARACTERS: em-dashes (—), en-dashes (–), colons (:), and pipes (|). Do not use them anywhere in the title. If you need punctuation, use a hyphen (-) or a comma.
- No fabricated facts. No invented numbers. If the user's title already mentions a number, you may keep it; never invent one.
- No forced listicle numbers unless the video is genuinely a list.
- Do not reuse the same opening structure across all 3 titles. Vary how each one starts.

Each title must be DIFFERENT from the other two in both opening word and emotional angle — not 3 rephrasings.

Return ONLY this JSON (no markdown, no prose):
{{
  "analysis": {{
    "search_intent": "...",
    "emotional_driver": "...",
    "viewer_profile": "...",
    "top_keywords": ["...", "..."],
    "dominant_patterns": "...",
    "overused_angle": "...",
    "gap_opportunity": "..."
  }},
  "titles": [
    {{
      "title": "<50-70 chars, no colon>",
      "primary_keyword": "<the keyword this title anchors on>",
      "angle": "<1 sentence: why YouTube will distribute this to fresh viewers, anchored to the gap>",
      "why_it_works": "<1 sentence: what emotion the viewer feels on seeing it>"
    }},
    {{
      "title": "<different opening, different angle>",
      "primary_keyword": "...",
      "angle": "...",
      "why_it_works": "..."
    }},
    {{
      "title": "<third distinct angle>",
      "primary_keyword": "...",
      "angle": "...",
      "why_it_works": "..."
    }}
  ]
}}"""

    try:
        raw = _call_sonnet(client, prompt)

        # Strip markdown code fences if present
        clean = raw.strip()
        if clean.startswith("```"):
            clean = re.sub(r"^```[a-z]*\n?", "", clean)
            clean = re.sub(r"\n?```$", "", clean.strip())

        data = _json.loads(clean)
        analysis = data.get("analysis", {})
        raw_titles = data.get("titles", [])

        suggestions = []
        for t in raw_titles[:3]:
            title_text = _to_title_case(t.get("title", "").strip().strip('"'))
            if not title_text or len(title_text) < 15:
                continue

            # Enforce the no-colon rule server-side as a safety net — if Claude slips one in,
            # convert to a hyphen rather than discard the suggestion.
            title_text = title_text.replace(":", " -").replace("|", " -")
            title_text = re.sub(r"\s{2,}", " ", title_text).strip()

            primary_kw = t.get("primary_keyword", "") or niche
            rubric = _score_suggestion_rubric(title_text, top_titles, keyword_scores, primary_kw)
            heuristic = _score_title(title_text, top_titles)  # kept for legacy "breakdown" field
            suggestions.append({
                "title": title_text,
                # Scores now deterministic — computed from the title + competitor/keyword data.
                "score": rubric["combined"],
                "seo_score": rubric["seo"],
                "ctr_score": rubric["ctr"],
                "hook_score": rubric["hook"],
                "rubric": rubric["breakdown"],
                "breakdown": heuristic["breakdown"],
                "length": len(title_text),
                "power_words_found": heuristic["power_words_found"],
                "viral_format_detected": heuristic.get("viral_format_detected"),
                "primary_keyword": primary_kw,
                "angle": t.get("angle", ""),
                "why_it_works": t.get("why_it_works", ""),
                # Frontend still expects these keys; keep for compatibility but fill them sensibly.
                "hook": t.get("hook", "curiosity"),
                "strategy": "hybrid",
            })

        # Best title first — the Title Scorecard hero + "Use this" selection flow
        # all assume suggestions[0] is the strongest option.
        suggestions.sort(key=lambda s: s["score"], reverse=True)

        return suggestions, analysis, ""

    except Exception as e:
        print(f"Claude error: {e}\nRaw response: {raw if 'raw' in dir() else 'none'}")
        return [], {}, str(e)


# ─── Video optimization (title + description + thumbnail critique) ──────────────

def optimize_video(credentials, video_id: str, title: str, thumbnail_url: str, views: int = 0, likes: int = 0) -> dict:
    """
    Full critique of an already-uploaded video: scores the title, analyses the
    description, and uses Claude vision to critique the thumbnail.
    """
    import json as _json
    import base64

    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key:
        return {"error": "ANTHROPIC_API_KEY is not set"}

    # Step 1: Fetch description from YouTube
    description = ""
    try:
        youtube = build("youtube", "v3", credentials=credentials)
        resp = youtube.videos().list(part="snippet", id=video_id).execute()
        items = resp.get("items", [])
        if items:
            description = items[0]["snippet"].get("description", "")
    except Exception as e:
        print(f"Description fetch error: {e}")

    # Step 2: Score the title (no competitor context — standalone score)
    score_data = _score_title(title, [])

    # Step 3: Fetch thumbnail as base64 for vision analysis
    thumb_b64 = None
    thumb_media_type = "image/jpeg"
    try:
        r = requests.get(thumbnail_url, timeout=6, headers={"User-Agent": "Mozilla/5.0"})
        if r.ok:
            content_type = r.headers.get("Content-Type", "image/jpeg").split(";")[0].strip()
            thumb_media_type = content_type if content_type.startswith("image/") else "image/jpeg"
            thumb_b64 = base64.b64encode(r.content).decode()
    except Exception as e:
        print(f"Thumbnail fetch error: {e}")

    # Step 4: Build Claude prompt
    client = _make_client()
    desc_preview = description[:600].strip() if description else "(no description set)"

    messages_content = []
    if thumb_b64:
        messages_content.append({
            "type": "image",
            "source": {"type": "base64", "media_type": thumb_media_type, "data": thumb_b64},
        })

    # Detect geography for the optimize_video description too
    opt_geo_match = _GEO_PATTERN.search(title)
    opt_geo_note = (
        f"Geography detected: '{opt_geo_match.group(0)}'. Reference the location naturally in the body."
        if opt_geo_match
        else "No specific geography — do NOT add location references. This is general/global content."
    )

    # Extract implied keywords from title for hashtag anchoring
    title_words = [w.strip(".,!?\"'()[]").lower() for w in title.split() if len(w) > 3]
    # We'll ask Claude to pick 3 hashtags from the title's core phrases, not guess broadly

    messages_content.append({"type": "text", "text": f"""You are a YouTube growth strategist. Analyse this uploaded video and give specific, actionable improvement feedback.

TITLE: "{title}"
VIEWS: {views:,}  |  LIKES: {likes:,}
LIKE RATE: {round(likes/views*100, 1) if views > 0 else 0}%

DESCRIPTION (first 600 chars):
\"\"\"
{desc_preview}
\"\"\"

{"The thumbnail image is shown above." if thumb_b64 else "No thumbnail image available."}

GEOGRAPHY RULE: {opt_geo_note}

Give feedback across 3 areas. Be direct and specific - name the exact problem and the exact fix.
NEVER use em-dashes (—) or en-dashes (–) anywhere in your response. Use a hyphen (-) or colon (:) instead.

For the full_description field, write a complete rewritten description following these rules:
- 300-400 words (hard minimum — short descriptions lose search ranking)
- Opening (first 150 chars visible before "Show more"): contains the primary keyword, gives viewer an immediate reason to read on. No "Welcome to my channel."
- Body: 2-3 flowing paragraphs. No bullet points. No generic sub-headers. Write like talking directly to the viewer. Weave the 3 most important keywords from the title naturally — once each.
- One short, genuine CTA at the end (not "SMASH that like button")
- Final line: exactly 3 hashtags derived from the 3 most important keyword phrases in the title, in CamelCase format (e.g. #HouseTourKenya). No more, no fewer. Only include a geo hashtag if geography is relevant per the geography rule above.
- No timestamps, no external links, no em-dashes

Return ONLY this JSON (no markdown, no explanation):
{{
  "title": {{
    "score": <0-100>,
    "verdict": "<one sentence>",
    "issues": ["<issue 1>", "<issue 2>"]
  }},
  "description": {{
    "score": <0-100>,
    "verdict": "<one sentence>",
    "hook_quality": "<assessment of the first 150 chars — what shows before Show more>",
    "issues": ["<issue 1>", "<issue 2>"],
    "improved_opening": "<rewritten first 2 lines — keyword-rich, compelling, under 150 chars>",
    "full_description": "<complete 300-400 word rewritten description with 3 hashtags on the final line>"
  }},
  "thumbnail": {{
    "score": <0-100>,
    "verdict": "<one sentence>",
    "has_text_overlay": <true/false>,
    "has_face": <true/false>,
    "contrast_strong": <true/false>,
    "tips": ["<specific tip 1>", "<specific tip 2>"]
  }}
}}"""})

    try:
        msg = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=3200,
            messages=[{"role": "user", "content": messages_content}]
        )
        raw = msg.content[0].text.strip()
        if raw.startswith("```"):
            raw = re.sub(r"^```[a-z]*\n?", "", raw)
            raw = re.sub(r"\n?```$", "", raw.strip())
        analysis = _strip_emdash(_json.loads(raw))
        return {
            "analysis": analysis,
            "title_breakdown": score_data["breakdown"],
            "title_score": score_data["total"],
            "description": description,
            "error": "",
        }
    except Exception as e:
        print(f"optimize_video error: {e}")
        return {"error": str(e)}


# ─── Thumbnail text generation ─────────────────────────────────────────────────

def generate_thumbnail_text(title: str, niche: str = "") -> tuple[list[dict], str]:
    """
    Generate 4 short thumbnail overlay text options for a given title.
    Returns (options, error_string).
    """
    import json as _json

    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key:
        return [], "ANTHROPIC_API_KEY is not set"

    client = _make_client()
    niche_block = f"NICHE: {niche}\n" if niche else ""

    prompt = f"""You are a YouTube thumbnail strategist.

VIDEO TITLE: "{title}"
{niche_block}
The thumbnail overlay text is short text placed ON the thumbnail image. It works WITH the title — not repeating it, but adding a second hook that makes the viewer feel they must click.

Generate exactly 4 thumbnail text options. Each must be:
- 2–6 words, ALL CAPS
- Complementary to the title (never just repeat it)
- Instantly readable on a thumbnail at a glance
- Punchy and specific

Use these 4 styles, one each:
1. number_callout — spotlight a number or stat implied by the title (e.g. "$10K", "30 DAYS", "3 YEARS")
2. emotion_word — one or two powerful words that capture the feeling or reaction (e.g. "IT WORKED", "LIFE CHANGING", "I WAS WRONG")
3. before_after — a contrast, transformation, or reveal (e.g. "FROM $0", "BEFORE & AFTER", "NEVER AGAIN")
4. question_hook — a short question that creates an open loop (e.g. "WORTH IT?", "DOES IT WORK?", "HOW?!")

Return ONLY this JSON array (no markdown):
[
  {{"style": "number_callout", "label": "Number callout", "text": "...", "why": "one short phrase"}},
  {{"style": "emotion_word",   "label": "Emotion / reaction", "text": "...", "why": "one short phrase"}},
  {{"style": "before_after",   "label": "Before / After", "text": "...", "why": "one short phrase"}},
  {{"style": "question_hook",  "label": "Question hook",  "text": "...", "why": "one short phrase"}}
]"""

    try:
        msg = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=400,
            messages=[{"role": "user", "content": prompt}]
        )
        raw = msg.content[0].text.strip()
        if raw.startswith("```"):
            raw = re.sub(r"^```[a-z]*\n?", "", raw)
            raw = re.sub(r"\n?```$", "", raw.strip())
        options = _json.loads(raw)
        return options[:4], ""
    except Exception as e:
        print(f"Thumbnail text error: {e}")
        return [], str(e)


# ─── Description generation ────────────────────────────────────────────────────

# Location signals — if any of these appear in the title/niche, geography hashtags are appropriate.
_GEO_PATTERN = re.compile(
    r'\b(africa|kenya|nigeria|ghana|south africa|tanzania|uganda|ethiopia|'
    r'rwanda|cameroon|senegal|ivory coast|zimbabwe|zambia|botswana|namibia|'
    r'uk|london|united kingdom|england|scotland|wales|ireland|'
    r'usa|america|new york|los angeles|chicago|houston|miami|'
    r'india|pakistan|bangladesh|sri lanka|nepal|'
    r'australia|sydney|melbourne|canada|toronto|vancouver|'
    r'germany|france|spain|italy|portugal|netherlands|'
    r'dubai|uae|saudi|qatar|kuwait|bahrain|'
    r'nairobi|lagos|accra|johannesburg|cape town|addis ababa|'
    r'singapore|malaysia|philippines|indonesia|thailand|vietnam)\b',
    re.IGNORECASE,
)


def _phrase_to_hashtag(phrase: str) -> str:
    """Convert a keyword phrase to CamelCase hashtag. 'house tour kenya' → '#HouseTourKenya'."""
    words = re.sub(r"[^\w\s]", "", phrase).split()
    return "#" + "".join(w.capitalize() for w in words if w)


def generate_description_suggestions(
    title: str,
    current_description: str = "",
    niche: str = "",
    intent_analysis: dict = None,
    keyword_scores: list = None,
    current_year: int = 2026,
    channel_context: dict = None,
) -> tuple[list[dict], list[str], str]:
    """
    Generate 3 YouTube description options for a given title.
    Returns (descriptions, top_keywords, error_string).
    top_keywords is the same top-3 list surfaced to the frontend so it can render
    the keyword chips alongside the description output.
    """
    import json as _json

    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key:
        return [], [], "ANTHROPIC_API_KEY is not set"

    client = _make_client()

    # ── Pull the top 3 keywords and build exact hashtags from them ──
    top_kw_phrases: list[str] = []
    if keyword_scores:
        top_kw_phrases = [k["phrase"] for k in keyword_scores if k.get("competition") != "HIGH"][:3]
    # Fall back to niche if no keywords available
    if not top_kw_phrases and niche:
        top_kw_phrases = [niche]

    hashtags_line = " ".join(_phrase_to_hashtag(p) for p in top_kw_phrases)
    keywords_block = "\n".join(f"  {i+1}. {p}" for i, p in enumerate(top_kw_phrases))

    # ── Geography detection ──
    # Only include location context if the title or niche is genuinely location-specific.
    combined_text = f"{title} {niche}"
    geo_match = _GEO_PATTERN.search(combined_text)
    geo_note = (
        f"Geography detected: '{geo_match.group(0)}'. This is location-specific content — "
        f"it is appropriate to reference the location naturally in the body text."
        if geo_match
        else
        "No specific geography detected — do NOT invent or add any location references. "
        "This content is global/general; adding a location would mislead viewers."
    )

    search_intent    = (intent_analysis or {}).get("search_intent", "")
    emotional_driver = (intent_analysis or {}).get("emotional_driver", "")
    viewer_profile   = (intent_analysis or {}).get("viewer_profile", "")
    gap_opportunity  = (intent_analysis or {}).get("gap_opportunity", "")

    current_block = (
        f'CURRENT DESCRIPTION (use as context, but rewrite from scratch):\n"""\n{current_description[:600]}\n"""\n'
        if current_description.strip() else ""
    )

    # Build channel context block — helps Claude use the creator's niche language
    channel_block = ""
    if channel_context:
        ch_name    = channel_context.get("channel_name", "")
        ch_kw      = channel_context.get("channel_keywords", "")
        top_titles = channel_context.get("top_video_titles", [])
        parts = []
        if ch_name:
            parts.append(f"Channel name: {ch_name}")
        if ch_kw:
            parts.append(f"Channel keywords/topics: {ch_kw[:300]}")
        if top_titles:
            titles_str = "\n".join(f"  - {t}" for t in top_titles[:5])
            parts.append(f"Creator's top-performing videos (for context/voice matching):\n{titles_str}")
        if parts:
            channel_block = "\nCHANNEL CONTEXT (use to match the creator's niche terminology and avoid duplicating topics already covered):\n" + "\n".join(parts) + "\n"

    prompt = f"""You are a YouTube description writer who makes copy feel warm, genuine, and specific — never corporate, never keyword-stuffed. Viewers should feel like a real creator wrote this to them.

VIDEO TITLE: "{title}"
PRIMARY NICHE: {niche or title}
CURRENT YEAR: {current_year}
{channel_block}
VIEWER CONTEXT:
- Search intent: {search_intent or "find useful content on this topic"}
- Emotional driver: {emotional_driver or "curiosity and desire to learn"}
- Viewer profile: {viewer_profile or "someone interested in this topic"}
- Gap opportunity: {gap_opportunity or ""}

TOP 3 KEYWORDS (these are the exact phrases viewers search — use them naturally):
{keywords_block}

HASHTAG RULE (non-negotiable):
The description must end with EXACTLY this line of 3 hashtags — no more, no fewer:
{hashtags_line}
These are derived directly from the top keyword phrases above. Do not change them. Do not add extras.

GEOGRAPHY RULE:
{geo_note}

{current_block}
Write 3 complete YouTube descriptions. Each uses a different opening strategy.

CRITICAL WRITING RULES for every description:
1. LENGTH: 300-400 words. Hard floor — shorter descriptions get downgraded by YouTube.
2. OPENING (first 150 characters — visible before "Show more"): Must contain the primary keyword AND give the viewer a specific, emotional reason to keep reading. Open with a scene, a feeling, a concrete promise — not "In this video" or "Welcome to my channel".
3. PROSE STYLE: Warm flowing paragraphs. Write like you are talking to one person over coffee. No bullet points, no numbered lists, no sub-headers. Each paragraph leads into the next. Sentences vary in length — short ones land harder.
4. SWEETNESS: Use sensory detail, small specifics, real moments. A description should feel lived-in, not like filler copy. Find one moment or image to anchor it.
5. KEYWORD USE: Weave all 3 keywords into the body naturally — once each is enough, never more than twice total. They must feel like words a human would say, not forced anchors. If a keyword sounds awkward in a sentence, rephrase the sentence.
6. CALL TO ACTION: One short genuine CTA at the end — warm, specific, not shouty. Examples: "If this helped, drop a comment below" or "Save this for later — you'll want it when you start."
7. HASHTAGS: The very last line must be exactly: {hashtags_line}
8. No timestamps, no external links, no em-dashes, no en-dashes. Use a hyphen or a comma instead. Do not use a colon to open a section.
9. Year references must be {current_year} or later — never a past year.

Description A — STORY / HOOK:
Open with a personal or relatable moment tied to the emotional driver. Pull the viewer in by putting them in a scene or feeling they recognise. The primary keyword must appear in the first sentence.

Description B — VALUE / BENEFIT:
Open with the concrete outcome the viewer gets from watching. State it directly and specifically. Make the gap between where they are and where this video takes them feel real — not vague. Primary keyword in the first sentence.

Description C — SEO / DIRECT:
Open with the primary keyword naturally in the very first phrase. Intent-first, benefits clear, reads authoritative but still human. Best for search ranking.

Return ONLY this JSON array — no markdown, no commentary:
[
  {{
    "type": "story",
    "label": "Story / Hook",
    "preview": "<first 150 characters of the full description>",
    "full": "<complete 300-400 word description ending with the hashtag line>",
    "why_it_works": "<one sentence explaining why this opening matches the viewer's emotional driver>"
  }},
  {{
    "type": "value",
    "label": "Value / Benefit",
    "preview": "<first 150 characters>",
    "full": "<complete 300-400 word description ending with the hashtag line>",
    "why_it_works": "<one sentence>"
  }},
  {{
    "type": "keyword",
    "label": "SEO / Keyword-first",
    "preview": "<first 150 characters>",
    "full": "<complete 300-400 word description ending with the hashtag line>",
    "why_it_works": "<one sentence>"
  }}
]"""

    try:
        msg = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=3000,
            messages=[{"role": "user", "content": prompt}]
        )
        raw = msg.content[0].text.strip()
        if raw.startswith("```"):
            raw = re.sub(r"^```[a-z]*\n?", "", raw)
            raw = re.sub(r"\n?```$", "", raw.strip())
        descriptions = _strip_emdash(_json.loads(raw))
        return descriptions[:3], top_kw_phrases, ""
    except Exception as e:
        print(f"Description generation error: {e}")
        return [], top_kw_phrases, str(e)


# ─── Intent matching ───────────────────────────────────────────────────────────

def _filter_by_intent(niche_phrase: str, videos: list[dict]) -> list[dict]:
    """
    Keep only videos whose titles contain ALL words from the niche phrase
    as whole words (word-boundary match, not substring).

    "tour" must not match "touring", "tourist", "touristy".
    "house" must not match "household".
    "kenya" must not match "kenyatta".

    Returns whatever strict matches exist — never falls back to the full pool.
    """
    phrase_words = [
        w.strip(".,!?\"'()[]{}:-")
        for w in re.sub(r"[^\w\s]", " ", niche_phrase.lower()).split()
        if len(w) > 1
    ]
    if not phrase_words:
        return videos

    matched: list[dict] = []
    for v in videos:
        v_lower = v["title"].lower()
        if all(re.search(r"\b" + re.escape(w) + r"\b", v_lower) for w in phrase_words):
            matched.append(v)
    return matched


# ─── Main entry point ──────────────────────────────────────────────────────────

def analyze_title(credentials, title: str, confirmed_keyword: str = "") -> dict:
    """
    Main analysis entry point.

    confirmed_keyword: if the user picked an intent option before running the analysis,
    this is their chosen search phrase (e.g. "home office cleaning vlog").
    When provided, we skip AI extraction and use it directly as the primary phrase.
    """
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    client = _make_client() if api_key else None

    # Step 1: Determine primary niche phrase
    # Priority: user-confirmed keyword > AI extraction > fallback
    if confirmed_keyword.strip():
        primary_phrase = confirmed_keyword.strip().lower()
        # Build secondary search terms from the title to widen the pool
        if client:
            search_terms = [primary_phrase] + _extract_search_terms(client, title, "")[1:3]
        else:
            search_terms = [primary_phrase]
        print(f"Using confirmed keyword: {primary_phrase!r}")
    elif client:
        search_terms = _extract_search_terms(client, title, "")
        primary_phrase = search_terms[0] if search_terms else title[:60]
        print(f"AI-extracted primary phrase: {primary_phrase!r}  |  All terms: {search_terms}")
    else:
        filler = _NGRAM_STOP | {"see", "come", "still"}
        words = re.sub(r"[^\w\s]", " ", title.lower()).split()
        meaningful = [w for w in words if w not in filler and len(w) > 3]
        search_terms = [" ".join(meaningful[:4])] if meaningful else [title[:50]]
        primary_phrase = search_terms[0]

    # Step 2: Search YouTube — primary niche phrase first (exact topic match),
    #         then secondary keyword terms to broaden the pool
    raw_videos = search_top_videos(credentials, search_terms, max_results=50)

    # Step 2b: Filter to videos that match the niche phrase.
    #
    # When the user confirmed their keyword (confirmed_keyword is set), the YouTube
    # search with order=relevance already filtered by intent — no need to filter further.
    # Applying a strict word-filter on top would drop most results (e.g. "home office
    # cleaning vlog" requires all 4 words in a video title, almost nothing passes).
    #
    # When the keyword was AI-extracted, we apply word-boundary filtering to remove
    # false positives (e.g. "Kenya Moore" matching "house tour kenya").
    if confirmed_keyword.strip():
        intent_videos = raw_videos  # YouTube search already filtered by intent
        top_videos = raw_videos
    else:
        intent_videos = _filter_by_intent(primary_phrase, raw_videos)
        top_videos = intent_videos if intent_videos else raw_videos[:10]

    top_titles = [v["title"] for v in top_videos]
    print(f"Videos found: {len(raw_videos)} total, {len(intent_videos)} intent-matched")

    # Step 3: Aggregate all tags (already ASCII-filtered in search_top_videos)
    tag_freq: dict[str, int] = {}
    for v in top_videos:
        for tag in v.get("tags", []):
            tl = tag.lower().strip()
            if tl and len(tl) > 2:
                tag_freq[tl] = tag_freq.get(tl, 0) + 1
    all_tags_flat = [t for t, _ in sorted(tag_freq.items(), key=lambda x: -x[1])]

    # Step 4: Autocomplete for all search terms
    autocomplete = get_autocomplete_suggestions(search_terms)

    # Step 5: Keyword research — scored by volume + competition
    keyword_scores = research_keywords(search_terms, autocomplete, top_titles, all_tags_flat)

    # Step 6: Score original title
    score_data = _score_title(title, top_titles)

    # Step 7: Score top videos for comparison panel
    scored_top = []
    for v in top_videos:
        s = _score_title(v["title"], [])
        scored_top.append({**v, "seo_score": s["total"]})
    scored_top = [v for v in scored_top if v["seo_score"] >= 35]
    scored_top.sort(key=lambda x: x["seo_score"], reverse=True)

    # Step 8: Generate 3 AI titles using live YouTube data
    if client:
        suggestions, intent_analysis, suggestion_error = generate_title_suggestions(
            title,
            search_terms,
            top_videos,        # pass full video objects with view counts
            score_data,
            keyword_scores,
            autocomplete,
            primary_phrase=primary_phrase,
        )
    else:
        suggestions, intent_analysis, suggestion_error = [], {}, "ANTHROPIC_API_KEY is not set"

    return _strip_emdash({
        "score":                score_data["total"],
        "breakdown":            score_data["breakdown"],
        "title_length":         score_data["length"],
        "power_words_found":    score_data["power_words_found"],
        "viral_format_detected":score_data.get("viral_format_detected"),
        "primary_phrase":       primary_phrase,
        "search_terms_used":    search_terms,
        "videos_found":         len(raw_videos),
        "intent_matched":       len(intent_videos),
        "autocomplete_terms":   autocomplete[:10],
        "keyword_scores":       keyword_scores,
        "top_tags":             all_tags_flat[:15],
        "suggestions":          suggestions,
        "intent_analysis":      intent_analysis,
        "suggestion_error":     suggestion_error,
        "top_videos":           scored_top[:8],
    })


