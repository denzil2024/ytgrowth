"""Audit-complete email — sent once per channel after the first 10-dimension
audit finishes. Personalised with the user's top priority action when
available.

Pairs with welcome_immediate.py (sent on signup, before the audit).
"""


def build_email(
    *,
    first_name: str,
    channel_name: str | None,
    top_action: str | None,
    dashboard_url: str,
    unsubscribe_url: str,
) -> tuple[str, str]:
    name = (first_name or "there").strip()

    def esc(s: str) -> str:
        return (s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    # Priority block — included only when the audit produced one
    if top_action:
        priority_text = (
            f"Start with the top items first. Those are the moves most likely to "
            f"shift your numbers in the next 30 days.\n\n"
            f"Your top priority: {top_action}\n\n"
        )
        priority_html = (
            f"<p>Start with the top items first. Those are the moves most likely to "
            f"shift your numbers in the next 30 days.</p>"
            f"<p><strong>Your top priority:</strong> {esc(top_action)}</p>"
        )
    else:
        priority_text = (
            "Start with the top items first. Those are the moves most likely to "
            "shift your numbers in the next 30 days.\n\n"
        )
        priority_html = (
            "<p>Start with the top items first. Those are the moves most likely to "
            "shift your numbers in the next 30 days.</p>"
        )

    text = (
        f"Hey {name},\n\n"
        f"Your channel audit is ready.\n\n"
        f"YTGrowth has analyzed your channel across 10 dimensions, including traffic "
        f"sources, device types, geography, audience demographics, shares, dislikes, "
        f"and playlist adds. Inside your dashboard, you'll find a prioritized list of "
        f"actions ranked by impact.\n\n"
        f"{priority_text}"
        f"A few things worth exploring once you're in:\n\n"
        f"  • Competitor Analysis. See what's working for channels in your niche and "
        f"find the gaps you can own.\n"
        f"  • Thumbnail IQ. Get a score on your thumbnails based on what actually "
        f"drives clicks.\n"
        f"  • SEO Studio. Build titles and descriptions around real search intent, "
        f"not guesswork.\n"
        f"  • Video Ideas. Get content ideas pulled from competitor data and what "
        f"your audience is already looking for.\n\n"
        f"{dashboard_url}\n\n"
        f"This is your channel's new home base. Come back often.\n\n"
        f"- Denzil\n"
        f"Founder of YTGrowth\n\n"
        f"---\n"
        f"Unsubscribe: {unsubscribe_url}\n"
    )

    html = (
        f"<p>Hey {esc(name)},</p>"
        f"<p>Your channel audit is ready.</p>"
        f"<p>YTGrowth has analyzed your channel across 10 dimensions, including traffic "
        f"sources, device types, geography, audience demographics, shares, dislikes, "
        f"and playlist adds. Inside your dashboard, you'll find a prioritized list of "
        f"actions ranked by impact.</p>"
        f"{priority_html}"
        f"<p>A few things worth exploring once you're in:</p>"
        f"<ul>"
        f"<li><strong>Competitor Analysis.</strong> See what's working for channels in "
        f"your niche and find the gaps you can own.</li>"
        f"<li><strong>Thumbnail IQ.</strong> Get a score on your thumbnails based on "
        f"what actually drives clicks.</li>"
        f"<li><strong>SEO Studio.</strong> Build titles and descriptions around real "
        f"search intent, not guesswork.</li>"
        f"<li><strong>Video Ideas.</strong> Get content ideas pulled from competitor "
        f"data and what your audience is already looking for.</li>"
        f"</ul>"
        f"<p><a href=\"{dashboard_url}\">Open your dashboard &rarr;</a></p>"
        f"<p>This is your channel's new home base. Come back often.</p>"
        f"<p>- <strong>Denzil</strong><br>Founder of YTGrowth</p>"
        f"<hr>"
        f"<p><small><a href=\"{unsubscribe_url}\">Unsubscribe</a></small></p>"
    )

    return text, html


def build_email_html(
    *,
    channel_name: str,
    channel_thumbnail: str | None = None,
    top_action: str | None,
    dashboard_url: str,
    unsubscribe_url: str,
    base_url: str = "https://ytgrowth.io",
) -> str:
    _, html = build_email(
        first_name="",
        channel_name=channel_name,
        top_action=top_action,
        dashboard_url=dashboard_url,
        unsubscribe_url=unsubscribe_url,
    )
    return html
