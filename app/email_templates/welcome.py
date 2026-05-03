"""Audit-complete email, sent once per channel after the first 10-dimension
audit finishes.

Pairs with email_templates/welcome_immediate.py (sent on signup, before the
audit). This one delivers the personalised hook: the user's top priority
action from their actual audit.

Plain text canonical, minimal HTML with NO inline styles so email clients
render with native typography. Same structure as welcome_immediate.py.
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
    channel_ref = (channel_name or "").strip() or "your channel"

    def esc(s: str) -> str:
        return (s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    # Priority block — only shown when the audit produced one
    if top_action:
        priority_text = (
            f"Your top priority right now\n\n"
            f"{top_action}\n\n"
            f"That's the single highest-leverage move based on what we found in your last "
            f"20 videos. Your full audit has the rest of the priority actions ranked.\n\n"
        )
        priority_html = (
            f"<p><strong>Your top priority right now</strong></p>"
            f"<p>{esc(top_action)}</p>"
            f"<p>That's the single highest-leverage move based on what we found in your "
            f"last 20 videos. Your full audit has the rest of the priority actions "
            f"ranked.</p>"
        )
    else:
        priority_text = ""
        priority_html = ""

    text = (
        f"Hi {name},\n\n"
        f"Your audit on {channel_ref} just finished.\n\n"
        f"What we looked at\n\n"
        f"Your last 20 videos, CTR, retention curves, posting cadence, traffic sources, "
        f"and how YouTube is currently distributing your content.\n\n"
        f"{priority_text}"
        f"{dashboard_url}\n\n"
        f"Hit reply if anything doesn't make sense\n\n"
        f"Audit results can be dense. If a recommendation feels off, or if you want me "
        f"to walk through what something means, just reply to this email. This inbox "
        f"comes straight to me.\n\n"
        f"— Denzil\n"
        f"Founder of YTGrowth\n\n"
        f"---\n"
        f"Unsubscribe: {unsubscribe_url}\n"
    )

    html = (
        f"<p>Hi {esc(name)},</p>"
        f"<p>Your audit on {esc(channel_ref)} just finished.</p>"
        f"<p><strong>What we looked at</strong></p>"
        f"<p>Your last 20 videos, CTR, retention curves, posting cadence, traffic "
        f"sources, and how YouTube is currently distributing your content.</p>"
        f"{priority_html}"
        f"<p><a href=\"{dashboard_url}\">{dashboard_url}</a></p>"
        f"<p><strong>Hit reply if anything doesn't make sense</strong></p>"
        f"<p>Audit results can be dense. If a recommendation feels off, or if you want "
        f"me to walk through what something means, just reply to this email. This inbox "
        f"comes straight to me.</p>"
        f"<p>&mdash; Denzil<br>Founder of YTGrowth</p>"
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
