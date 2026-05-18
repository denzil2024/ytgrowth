"""Free-plan change announcement (2026-05-18).

Sent once to existing free users: the self-renewing "3 analyses every
month" plan is replaced by a one-time 5-credit trial of the full-power
converter features (Outliers, Competitor Analysis, SEO Studio), with the
monthly refill removed. Honest about the takeaway, grounded (not hype)
on the product confidence line.

Plain-text canonical + a bare HTML fragment mirror in the house style
(matches welcome.py / reengagement.py: no inline CSS, no card, no
button). No em-dashes, no italics.
"""


def build_email(
    *,
    first_name: str,
    dashboard_url: str,
    unsubscribe_url: str,
) -> tuple[str, str]:
    name = (first_name or "there").strip()

    def esc(s: str) -> str:
        return (s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    text = (
        f"Hi {name},\n\n"
        f"Quick heads-up: we've changed how the free plan works.\n\n"
        f"Before: 3 analyses that refilled every month.\n"
        f"Now: a one-time set of free analyses that unlock our best "
        f"features at full power, not a stripped-down version.\n\n"
        f"Why we did this\n\n"
        f"The old free plan only ever let you touch a watered-down slice "
        f"of YTGrowth. You never got to see what it actually does. Running "
        f"the AI and data behind the strong features costs us real money on "
        f"every run, so a plan that refilled forever forced us to keep free "
        f"weak. We'd rather flip that: give you the real thing to judge us "
        f"on, not the limited mode.\n\n"
        f"What you get free\n\n"
        f"- Your full channel audit, refreshable once a week\n"
        f"- Your remaining analyses on Outliers, Competitor Analysis, and "
        f"SEO Studio, full versions, no limits while they last\n\n"
        f"These are the features creators actually switch tools for. "
        f"Outliers surfaces videos already proven to win in your niche. "
        f"Competitor Analysis breaks down exactly why a rival is growing "
        f"and what to take from it. This is where YTGrowth is sharper than "
        f"the generic keyword tools, and it gets sharper the more creators "
        f"use it.\n\n"
        f"The honest part\n\n"
        f"The monthly refill is gone. Once your free analyses are used, you "
        f"upgrade to keep going. Whatever you hadn't used yet is still on "
        f"your account, nothing was taken.\n\n"
        f"Thanks for being here early. We're building this to be the tool "
        f"serious creators keep.\n\n"
        f"{dashboard_url}\n\n"
        f"- Denzil\n"
        f"Founder of YTGrowth\n\n"
        f"---\n"
        f"Unsubscribe: {unsubscribe_url}\n"
    )

    # House style: a bare HTML fragment (no inline CSS, no card, no
    # button). Matches welcome.py / reengagement.py exactly so it renders
    # with the same clean default as every other YTGrowth email.
    html = (
        f"<p>Hi {esc(name)},</p>"
        f"<p>Quick heads-up: we've changed how the free plan works.</p>"
        f"<p><strong>Before:</strong> 3 analyses that refilled every month."
        f"<br><strong>Now:</strong> a one-time set of free analyses that "
        f"unlock our best features at full power, not a stripped-down "
        f"version.</p>"
        f"<p><strong>Why we did this</strong></p>"
        f"<p>The old free plan only ever let you touch a watered-down slice "
        f"of YTGrowth. You never got to see what it actually does. Running "
        f"the AI and data behind the strong features costs us real money on "
        f"every run, so a plan that refilled forever forced us to keep free "
        f"weak. We'd rather flip that: give you the real thing to judge us "
        f"on, not the limited mode.</p>"
        f"<p><strong>What you get free</strong></p>"
        f"<ul>"
        f"<li>Your full channel audit, refreshable once a week</li>"
        f"<li>Your remaining analyses on Outliers, Competitor Analysis, and "
        f"SEO Studio, full versions, no limits while they last</li>"
        f"</ul>"
        f"<p>These are the features creators actually switch tools for. "
        f"Outliers surfaces videos already proven to win in your niche. "
        f"Competitor Analysis breaks down exactly why a rival is growing "
        f"and what to take from it. This is where YTGrowth is sharper than "
        f"the generic keyword tools, and it gets sharper the more creators "
        f"use it.</p>"
        f"<p><strong>The honest part</strong></p>"
        f"<p>The monthly refill is gone. Once your free analyses are used, "
        f"you upgrade to keep going. Whatever you hadn't used yet is still "
        f"on your account, nothing was taken.</p>"
        f"<p>Thanks for being here early. We're building this to be the "
        f"tool serious creators keep.</p>"
        f"<p><a href=\"{dashboard_url}\">Open your dashboard &rarr;</a></p>"
        f"<p>- <strong>Denzil</strong><br>Founder of YTGrowth</p>"
        f"<hr>"
        f"<p><small><a href=\"{unsubscribe_url}\">Unsubscribe</a></small></p>"
    )

    return text, html
