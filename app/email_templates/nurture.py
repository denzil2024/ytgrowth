"""Free-to-paid nurture sequence copy.

Seven emails sent over the first 18 days after signup. The schedule and the
send loop live in app/nurture_sequence.py; this module only holds the copy and
renders each email to (subject, text, html).

Founder-led voice, signed by Denzil. No em-dashes anywhere. Paragraphs are kept
short on purpose so they read well on a phone.

Upgrade CTAs point at the pricing page; engagement CTAs point at the dashboard.
"""


# Days after signup that each email goes out. Email 1 is immediate (offset 0).
OFFSET_DAYS = {
    1: 0,
    2: 2,
    3: 4,
    4: 7,
    5: 10,
    6: 14,
    7: 18,
}


# Each entry:
#   subject   : uses {name}
#   paras     : body paragraphs before the CTA (use {name})
#   cta_label : button text
#   cta_kind  : "dashboard" or "pricing"
#   post_cta  : optional paragraphs shown after the CTA
_EMAILS = {
    1: {
        "subject": "{name}, here's your first quick win",
        "paras": [
            "Hey {name},",
            "Glad you're in. Let me save you some time.",
            "Most creators waste their first week clicking around. You don't "
            "have to. There's one thing that moves the needle today.",
            "Open your dashboard and look at your audit. It scores your channel "
            "across 10 dimensions and hands you a ranked list of fixes.",
            "Start with the number one item. It's almost always a title or a "
            "missing description, and it's the fastest win you'll get.",
            "Do that one thing today. You'll see why people stick with this tool.",
        ],
        "cta_label": "Open your dashboard",
        "cta_kind": "dashboard",
    },
    2: {
        "subject": "{name}, you're flying blind right now",
        "paras": [
            "Hey {name},",
            "Quick truth. Posting without data is guessing.",
            "You film, you upload, you hope. Then you stare at the views "
            "wondering what happened. I did that for years.",
            "The channels that grow fast aren't lucky. They know which keywords "
            "pull traffic, which titles get clicks, and what their competitors "
            "are doing.",
            "That's the whole point of YTGrowth. It turns the guessing into a "
            "checklist.",
            "Run a keyword search on your next video idea before you film it. "
            "See the demand before you spend the weekend editing.",
        ],
        "cta_label": "See what's working in your niche",
        "cta_kind": "dashboard",
    },
    3: {
        "subject": "{name}, here's why your best video worked",
        "paras": [
            "Hey {name},",
            "Every channel has that one video that did way better than the rest.",
            "Most creators never figure out why. They just hope it happens again.",
            "The Outliers tool finds those breakout videos, yours and your "
            "competitors', and shows you what set them apart. The title pattern, "
            "the topic, the timing.",
            "Once you see the pattern, you can repeat it on purpose instead of "
            "by accident.",
            "Go pull up your outliers and look for the common thread. That "
            "thread is your next video.",
        ],
        "cta_label": "Find your outliers",
        "cta_kind": "dashboard",
    },
    4: {
        "subject": "{name}, what other creators just found",
        "paras": [
            "Hey {name},",
            "A week in. Here's what folks like you are doing with this.",
            "One creator found a keyword with strong demand and almost no good "
            "videos covering it. She made the video. It's now her top traffic "
            "source.",
            "Another stopped guessing titles. He started checking click patterns "
            "first. His average views per video climbed within a month.",
            "None of this is magic. They just stopped flying blind and let the "
            "data pick the targets.",
            "You've got the same tools open right now. The only difference is "
            "using them.",
        ],
        "cta_label": "Open your dashboard",
        "cta_kind": "dashboard",
    },
    5: {
        "subject": "{name}, why YTGrowth isn't VidIQ",
        "paras": [
            "Hey {name},",
            "You've probably tried VidIQ or TubeBuddy. Fair question: why this?",
            "Those tools throw a wall of numbers at you and leave you to figure "
            "out what matters. More dashboards, more scores, more noise.",
            "YTGrowth does the opposite. It tells you the one thing to fix next, "
            "in plain English, and why it matters for your channel.",
            "It's built for creators who want to grow, not analysts who want to "
            "study graphs.",
            "Same data underneath. The difference is we do the thinking and hand "
            "you the action.",
        ],
        "cta_label": "See the difference",
        "cta_kind": "pricing",
    },
    6: {
        "subject": "{name}, this offer closes in 48 hours",
        "paras": [
            "Hey {name},",
            "You've had two weeks on the free plan. I want to make the next step "
            "easy.",
            "For the next 48 hours you can upgrade and unlock unlimited audits, "
            "full keyword research, competitor tracking, and the weekly report "
            "that lands in your inbox every Monday.",
            "The free plan gives you a taste. The paid plan is where the "
            "compounding starts, every search and audit building on the last.",
            "If you've been on the fence, this is the nudge. The price won't be "
            "lower than this.",
        ],
        "cta_label": "Upgrade now",
        "cta_kind": "pricing",
    },
    7: {
        "subject": "{name}, last email from me",
        "paras": [
            "Hey {name},",
            "This is the last one in the series. I won't keep crowding your "
            "inbox.",
            "If YTGrowth isn't for you right now, no hard feelings. The free "
            "tools stay free and the door's open whenever you come back.",
            "But if you've been meaning to get serious about your channel, this "
            "is the moment. The creators who win are the ones who stop guessing "
            "and start measuring.",
            "Everything you need is one click away.",
        ],
        "cta_label": "Upgrade when you're ready",
        "cta_kind": "pricing",
        "post_cta": [
            "If you ever want help, just reply. I read every email.",
        ],
    },
}


def _esc(s: str) -> str:
    return (s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def build_email(
    email_number: int,
    *,
    first_name: str,
    pricing_url: str,
    dashboard_url: str,
    unsubscribe_url: str,
) -> tuple[str, str, str]:
    """Render one nurture email.

    Returns (subject, text, html). Raises KeyError on an unknown email_number
    so a bad row never silently sends an empty email.
    """
    spec = _EMAILS[email_number]
    name = (first_name or "there").strip() or "there"

    cta_url = pricing_url if spec["cta_kind"] == "pricing" else dashboard_url
    cta_label = spec["cta_label"]
    paras = [p.format(name=name) for p in spec["paras"]]
    post_cta = [p.format(name=name) for p in spec.get("post_cta", [])]
    subject = spec["subject"].format(name=name)

    # ── Plain text ──────────────────────────────────────────────────────────
    text_parts = list(paras)
    text_parts.append(f"{cta_label}: {cta_url}")
    text_parts.extend(post_cta)
    text_parts.append("- Denzil\nFounder of YTGrowth")
    text_parts.append(f"---\nUnsubscribe: {unsubscribe_url}")
    text = "\n\n".join(text_parts) + "\n"

    # ── HTML ────────────────────────────────────────────────────────────────
    html_parts = [f"<p>{_esc(p)}</p>" for p in paras]
    html_parts.append(
        f'<p><a href="{cta_url}">{_esc(cta_label)} &rarr;</a></p>'
    )
    html_parts.extend(f"<p>{_esc(p)}</p>" for p in post_cta)
    html_parts.append("<p>- <strong>Denzil</strong><br>Founder of YTGrowth</p>")
    html_parts.append("<hr>")
    html_parts.append(
        f'<p><small><a href="{unsubscribe_url}">Unsubscribe</a></small></p>'
    )
    html = "".join(html_parts)

    return subject, text, html
