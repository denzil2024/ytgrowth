"""Re-engagement email — sent 3 days after signup to users who haven't
returned to the dashboard.

Intentionally different from the audit-complete email. Instead of
repeating 'your audit is waiting', this email:

  1. Checks in with genuine curiosity about how they're finding the tool.
  2. Gives a free YouTube insight from real channel data, no strings attached.
  3. Includes a soft Product Hunt upvote ask.

Plain text canonical, minimal HTML mirror with no inline styles. No em-dashes.
"""

PRODUCT_HUNT_URL = "https://www.producthunt.com/products/ytgrowth"


def build_email(
    *,
    first_name: str,
    channel_name: str | None,
    top_action: str | None,
    priority_actions_count: int,
    dashboard_url: str,
    unsubscribe_url: str,
) -> tuple[str, str]:
    name = (first_name or "there").strip()

    def esc(s: str) -> str:
        return (s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    text = (
        f"Hey {name},\n\n"
        f"You signed up a few days ago but haven't been back. Totally fine. "
        f"I just wanted to check in.\n\n"
        f"How are you finding YTGrowth so far?\n\n"
        f"Are you still figuring out if it's right for you? Waiting for a good "
        f"time to dig in? Looking for something we might not have yet? "
        f"Hit reply and tell me. Takes 30 seconds and I genuinely read every "
        f"message. It also helps us build the right things.\n\n"
        f"Something worth knowing\n\n"
        f"Here's one insight from the data we see across hundreds of channels: "
        f"small and growing channels get the most from Search, not Browse. "
        f"YouTube's algorithm needs a lot of watch history before it starts "
        f"recommending your videos to new people. But Search is different. "
        f"If your title matches what someone is actively typing, YouTube "
        f"shows your video regardless of how big your channel is. Most "
        f"creators at the early stage are leaving that traffic on the table "
        f"because their titles are written for clicks, not for search. "
        f"YTGrowth's SEO Studio is built exactly to fix that.\n\n"
        f"{dashboard_url}\n\n"
        f"One more thing\n\n"
        f"If you've had a chance to look around and found YTGrowth useful, "
        f"an upvote and a follow on Product Hunt means a lot to a small team. "
        f"It helps other creators find us.\n\n"
        f"Give us an upvote and follow us: {PRODUCT_HUNT_URL}\n\n"
        f"- Denzil\n"
        f"Founder of YTGrowth\n\n"
        f"---\n"
        f"Unsubscribe: {unsubscribe_url}\n"
    )

    html = (
        f"<p>Hey {esc(name)},</p>"
        f"<p>You signed up a few days ago but haven't been back. Totally fine. "
        f"I just wanted to check in.</p>"
        f"<p><strong>How are you finding YTGrowth so far?</strong></p>"
        f"<p>Are you still figuring out if it's right for you? Waiting for a good "
        f"time to dig in? Looking for something we might not have yet? "
        f"Hit reply and tell me. Takes 30 seconds and I genuinely read every "
        f"message. It also helps us build the right things.</p>"
        f"<p><strong>Something worth knowing</strong></p>"
        f"<p>Here's one insight from the data we see across hundreds of channels: "
        f"small and growing channels get the most from Search, not Browse. "
        f"YouTube's algorithm needs a lot of watch history before it starts "
        f"recommending your videos to new people. But Search is different. "
        f"If your title matches what someone is actively typing, YouTube "
        f"shows your video regardless of how big your channel is. Most "
        f"creators at the early stage are leaving that traffic on the table "
        f"because their titles are written for clicks, not for search. "
        f"YTGrowth's SEO Studio is built exactly to fix that.</p>"
        f"<p><a href=\"{dashboard_url}\">Open SEO Studio in your dashboard &rarr;</a></p>"
        f"<p><strong>One more thing</strong></p>"
        f"<p>If you've had a chance to look around and found YTGrowth useful, "
        f"an upvote and a follow on Product Hunt means a lot to a small team. "
        f"It helps other creators find us.</p>"
        f"<p><a href=\"{PRODUCT_HUNT_URL}\">Give us an upvote and follow us on Product Hunt &rarr;</a></p>"
        f"<p>- <strong>Denzil</strong><br>Founder of YTGrowth</p>"
        f"<hr>"
        f"<p><small><a href=\"{unsubscribe_url}\">Unsubscribe</a></small></p>"
    )

    return text, html


def build_email_html(
    *,
    channel_name: str,
    top_action: str | None,
    priority_actions_count: int,
    dashboard_url: str,
    unsubscribe_url: str,
    base_url: str = "https://ytgrowth.io",
) -> str:
    _, html = build_email(
        first_name="",
        channel_name=channel_name,
        top_action=top_action,
        priority_actions_count=priority_actions_count,
        dashboard_url=dashboard_url,
        unsubscribe_url=unsubscribe_url,
    )
    return html
