import os
import re
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

    found_power = [w for w in words if w.strip(".,!?\"'") in POWER_WORDS]
    scores["power_words"] = min(len(found_power) * 8, 20)

    scores["numbers"] = 15 if re.search(r'\d', t) else 0

    scores["question"] = 10 if (words[0] in QUESTION_STARTERS if words else False) or t.endswith("?") else 0

    scores["hook_format"] = 10 if re.search(r'[\[\(\|:]', t) else 0

    cap_words = [w for w in t.split() if w.isupper() and len(w) > 2]
    scores["caps_emphasis"] = min(len(cap_words) * 5, 10)

    NOISE = {"vlog","vlogging","shorts","shortsvideo","ytshorts","video","watch","youtube"}
    if top_titles:
        top_words = set()
        for tt in top_titles:
            clean = re.sub(r'#\w+', '', tt)
            for w in clean.lower().split():
                cw = w.strip(".,!?\"'")
                if len(cw) > 3 and cw not in NOISE:
                    top_words.add(cw)
        overlap = sum(1 for w in words if w.strip(".,!?\"'") in top_words)
        scores["keyword_relevance"] = min(overlap * 2, 10)
    else:
        # Fallback: score against the title's own meaningful words repeated elsewhere
        scores["keyword_relevance"] = 5

    total = sum(scores.values())
    return {
        "total": min(total, 100),
        "breakdown": scores,
        "length": length,
        "power_words_found": found_power,
    }


def _is_english(text: str) -> bool:
    if not text:
        return False
    clean = re.sub(r'#\w+', '', text)
    clean = re.sub(r'[^\x00-\x7F]+', ' ', clean).strip()
    if not clean:
        return False
    words = [w.lower().strip('.,!?"\':;()[]{}|-') for w in clean.split() if w.strip()]
    words = [w for w in words if w]
    if not words:
        return False
    return sum(1 for w in words if w in _EN_WORDS) >= 2


def search_top_videos(credentials, query: str, max_results: int = 20) -> list[dict]:
    youtube = build("youtube", "v3", credentials=credentials)
    try:
        response = youtube.search().list(
            part="snippet",
            q=query,
            type="video",
            order="viewCount",
            maxResults=max_results,
            relevanceLanguage="en",
            regionCode="US",
        ).execute()
        videos = []
        for item in response.get("items", []):
            snippet = item["snippet"]
            title = snippet.get("title", "")
            if not _is_english(title):
                continue
            videos.append({
                "video_id": item["id"]["videoId"],
                "title": title,
                "channel": snippet.get("channelTitle", ""),
                "thumbnail": snippet.get("thumbnails", {}).get("medium", {}).get("url", ""),
            })
        return videos
    except Exception as e:
        print(f"SEO search error: {e}")
        return []


def _build_criteria_instructions(breakdown: dict) -> str:
    """Turn the score breakdown into explicit pass/fail requirements for Claude."""
    lines = []

    if breakdown.get("length", 0) < 25:
        lines.append("LENGTH: Title must be exactly 50–70 characters — count every character including spaces")

    if breakdown.get("power_words", 0) == 0:
        lines.append("POWER WORD: Must include one of: Best, Top, Secret, Truth, Never, Always, Proven, Ultimate, Guide, Tips, Mistakes, Warning, Shocking, Revealed, Hack, Fast, Easy, Simple, Finally, Today")
    else:
        lines.append("POWER WORD: Keep or improve the power word already present")

    if breakdown.get("numbers", 0) == 0:
        lines.append("NUMBER: Must include a digit (e.g. '5 Things', '3 Mistakes', '10 Tips', '24-Hour', '30 Days')")
    else:
        lines.append("NUMBER: Keep the number already present")

    if breakdown.get("question", 0) == 0 and breakdown.get("hook_format", 0) == 0:
        lines.append("HOOK FORMAT: Must use one of — end with '?' (question), add '(...)' parenthesis after the main idea, or use a colon ':' to split the title")
    elif breakdown.get("hook_format", 0) == 10:
        lines.append("HOOK FORMAT: Keep the hook/colon/bracket format")

    return "\n".join(f"  • {l}" for l in lines)


def _call_claude(client, prompt: str) -> list[str]:
    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=400,
        messages=[{"role": "user", "content": prompt}]
    )
    raw = message.content[0].text.strip()
    return [line.strip().strip('"').strip("'") for line in raw.split("\n") if line.strip()]


def generate_title_suggestions(
    title: str, topic: str, top_titles: list[str], score_data: dict
) -> tuple[list[dict], str]:
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key:
        return [], "ANTHROPIC_API_KEY is not set"

    client = anthropic.Anthropic(api_key=api_key)
    top_sample = "\n".join(f"  - {t}" for t in top_titles[:6]) if top_titles else "  None available"
    criteria = _build_criteria_instructions(score_data.get("breakdown", {}))

    base_prompt = f"""You are a YouTube SEO specialist. Rewrite the title below to score higher on these specific criteria.

Original title: "{title}"
Topic/niche: "{topic}"
Current score: {score_data['total']}/100

MANDATORY criteria each new title MUST satisfy:
{criteria}

Top-viewed English titles in this niche (study the patterns):
{top_sample}

Write exactly 3 improved titles. Each title:
- Must satisfy ALL mandatory criteria above
- Must be 50–70 characters — after writing each title, count every character including spaces and verify
- Must keep the creator's actual topic — no fabricated claims
- Must use plain ASCII only — no emoji, no special characters

Return ONLY the 3 titles, one per line, no numbering, no commentary."""

    MIN_SCORE = 65
    MAX_ATTEMPTS = 2
    good: list[dict] = []

    try:
        for attempt in range(MAX_ATTEMPTS):
            needed = 3 - len(good)
            if needed <= 0:
                break

            if attempt == 0:
                prompt = base_prompt
            else:
                # Tell Claude exactly what failed and why
                rejected_info = "\n".join(
                    f'  - "{r["title"]}" ({r["length"]} chars, score {r["score"]}/100 — too short or missing criteria)'
                    for r in _rejected
                )
                prompt = base_prompt + f"""

IMPORTANT — your previous attempt produced titles that failed quality checks:
{rejected_info}

Common fixes:
- If a title is under 50 chars, add a specific detail, location, or time frame (e.g. "in 7 Days", "That Actually Work", "Nobody Tells You")
- If power word is missing, start with "How", "Why", "Top", "Best", or "Secret"
- If no number, use "5", "7", "10", "24-Hour", or "30-Day"

Write {needed} new title(s) only. Each must score 65+ on our criteria."""

            raw_titles = _call_claude(client, prompt)[:needed]
            _rejected = []

            for t in raw_titles:
                s = _score_title(t, top_titles)
                entry = {
                    "title": t,
                    "score": s["total"],
                    "breakdown": s["breakdown"],
                    "length": s["length"],
                    "power_words_found": s["power_words_found"],
                }
                if s["total"] >= MIN_SCORE:
                    good.append(entry)
                else:
                    _rejected.append(entry)

        # If we still don't have 3, include the best of the rejected ones
        if len(good) < 3:
            _rejected.sort(key=lambda x: x["score"], reverse=True)
            good.extend(_rejected[: 3 - len(good)])

        good.sort(key=lambda x: x["score"], reverse=True)
        return good[:3], ""

    except Exception as e:
        print(f"Claude error: {e}")
        return [], str(e)


def analyze_title(credentials, title: str, topic: str) -> dict:
    search_query = topic if topic else title
    top_videos = search_top_videos(credentials, search_query, max_results=20)
    top_titles = [v["title"] for v in top_videos]

    # Score original title
    score_data = _score_title(title, top_titles)

    # Score each top video and filter to quality examples only
    scored_top = []
    for v in top_videos:
        s = _score_title(v["title"], [])
        scored_top.append({**v, "seo_score": s["total"]})
    # Show only titles that score well, sorted by our SEO score
    scored_top = [v for v in scored_top if v["seo_score"] >= 45]
    scored_top.sort(key=lambda x: x["seo_score"], reverse=True)

    # Generate scored suggestions
    suggestions, suggestion_error = generate_title_suggestions(
        title, topic or title, top_titles, score_data
    )

    return {
        "score": score_data["total"],
        "breakdown": score_data["breakdown"],
        "title_length": score_data["length"],
        "power_words_found": score_data["power_words_found"],
        "suggestions": suggestions,
        "suggestion_error": suggestion_error,
        "top_videos": scored_top[:6],
    }
