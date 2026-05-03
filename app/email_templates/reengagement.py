"""Re-engagement email — sent 3 days after signup to users who haven't
returned to the dashboard.

Plain text canonical, minimal HTML mirror with no inline styles. Same
design language as all other transactional emails. No em-dashes.

Includes a soft Product Hunt upvote + follow ask. The re-engagement
window (someone who signed up but hasn't been back in 3 days) is a
natural moment to make this ask without it feeling spammy.
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
    channel_ref = (channel_name or "").strip() or "your channel"

    def esc(s: str) -> str:
        return (s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    # Priority action block
    if top_action:
        priority_text = (
            f"Your top priority: {top_action}\n\n"
            f"There are {priority_actions_count} more actions waiting in your dashboard, "
            f"ranked by impact. About 5 minutes to read through.\n\n"
        )
        priority_html = (
            f"<p><strong>Your top priority:</strong> {esc(top_action)}</p>"
            f"<p>There are {priority_actions_count} more actions waiting in your dashboard, "
            f"ranked by impact. About 5 minutes to read through.</p>"
        )
    else:
        priority_text = (
            f"There are {priority_actions_count} priority actions waiting in your "
            f"dashboard, ranked by impact. About 5 minutes to read through.\n\n"
        )
        priority_html = (
            f"<p>There are {priority_actions_count} priority actions waiting in your "
            f"dashboard, ranked by impact. About 5 minutes to read through.</p>"
        )

    text = (
        f"Hey {name},\n\n"
        f"Your {channel_ref} audit is done. The results are in your dashboard whenever "
        f"you're ready to come back.\n\n"
        f"{priority_text}"
        f"{dashboard_url}\n\n"
        f"One more thing\n\n"
        f"If you've had a chance to try YTGrowth, we'd really appreciate an upvote and "
        f"a follow on Product Hunt. It helps other creators find us, and it means a lot "
        f"to a small team.\n\n"
        f"Give us an upvote and follow us: {PRODUCT_HUNT_URL}\n\n"
        f"- Denzil\n"
        f"Founder of YTGrowth\n\n"
        f"---\n"
        f"Unsubscribe: {unsubscribe_url}\n"
    )

    html = (
        f"<p>Hey {esc(name)},</p>"
        f"<p>Your {esc(channel_ref)} audit is done. The results are in your dashboard "
        f"whenever you're ready to come back.</p>"
        f"{priority_html}"
        f"<p><a href=\"{dashboard_url}\">Go to your dashboard &rarr;</a></p>"
        f"<p><strong>One more thing</strong></p>"
        f"<p>If you've had a chance to try YTGrowth, we'd really appreciate an upvote "
        f"and a follow on Product Hunt. It helps other creators find us, and it means a "
        f"lot to a small team.</p>"
        f"<p><a href=\"{PRODUCT_HUNT_URL}\">Give us an upvote and follow us on Product Hunt &rarr;</a></p>"
        f"<p>- <strong>Denzil</strong><br>Founder of YTGrowth</p>"
        f"<hr>"
        f"<p><small><a href=\"{unsubscribe_url}\">Unsubscribe</a></small></p>"
    )

    return text, html


# Backward-compat shim for any existing call sites using the old signature.
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
