"""Immediate welcome email — sent the moment a new user finishes Google OAuth,
before the first audit completes.

Pairs with welcome.py, which fires after the audit with the personalised
priority action.
"""


def build_email(
    *,
    first_name: str,
    channel_name: str | None,
    dashboard_url: str,
    unsubscribe_url: str,
) -> tuple[str, str]:
    name = (first_name or "there").strip()

    def esc(s: str) -> str:
        return (s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    text = (
        f"Hey {name},\n\n"
        f"Welcome aboard. Really glad you're here.\n\n"
        f"YTGrowth is now running a full audit of your channel, analyzing your traffic "
        f"sources, audience demographics, content performance, and more across 10 "
        f"dimensions. It usually takes just a few minutes.\n\n"
        f"Once it's done, you'll get a clear picture of where your channel stands, along "
        f"with a prioritized action plan to help you grow faster.\n\n"
        f"While you wait, feel free to explore the dashboard. You can start tracking "
        f"competitors, research keywords with the Keyword Explorer, or optimize your "
        f"titles with the Title Optimizer.\n\n"
        f"{dashboard_url}\n\n"
        f"If you have any questions, just reply to this email. I read every message.\n\n"
        f"More soon.\n\n"
        f"- Denzil\n"
        f"Founder of YTGrowth\n\n"
        f"---\n"
        f"Unsubscribe: {unsubscribe_url}\n"
    )

    html = (
        f"<p>Hey {esc(name)},</p>"
        f"<p>Welcome aboard. Really glad you're here.</p>"
        f"<p>YTGrowth is now running a full audit of your channel, analyzing your traffic "
        f"sources, audience demographics, content performance, and more across 10 "
        f"dimensions. It usually takes just a few minutes.</p>"
        f"<p>Once it's done, you'll get a clear picture of where your channel stands, "
        f"along with a prioritized action plan to help you grow faster.</p>"
        f"<p>While you wait, feel free to explore the "
        f"<a href=\"{dashboard_url}\">dashboard</a>. You can start tracking competitors, "
        f"research keywords with the Keyword Explorer, or optimize your titles with the "
        f"Title Optimizer.</p>"
        f"<p><a href=\"{dashboard_url}\">Open your dashboard &rarr;</a></p>"
        f"<p>If you have any questions, just reply to this email. I read every "
        f"message.</p>"
        f"<p>More soon.</p>"
        f"<p>- <strong>Denzil</strong><br>Founder of YTGrowth</p>"
        f"<hr>"
        f"<p><small><a href=\"{unsubscribe_url}\">Unsubscribe</a></small></p>"
    )

    return text, html
