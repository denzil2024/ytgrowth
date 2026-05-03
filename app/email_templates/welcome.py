"""Audit-complete email, sent once per channel after the first 10-dimension
audit finishes.

Pairs with email_templates/welcome_immediate.py (sent on signup, before the
audit). This one delivers the personalised hook: the user's #1 priority
action surfaced from their actual audit.

Plain text first. Reads like a one-to-one note from the founder. No tables,
no logo header, no big CTA buttons. Founder preference: only milestone emails
get visual badges; transactional emails stay plain.
"""


def build_email(
    *,
    first_name: str,
    channel_name: str | None,
    top_action: str | None,
    dashboard_url: str,
    unsubscribe_url: str,
) -> tuple[str, str]:
    """Returns (text, html). Text is the canonical version; html is a minimal
    mirror so HTML-only clients render with native typography rather than
    monospace defaults.
    """
    name = (first_name or "there").strip()
    channel_ref = (channel_name or "").strip() or "your channel"

    def esc(s: str) -> str:
        return (s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    # Personalised priority line, only included when the audit produced one.
    if top_action:
        priority_text = (
            f"Your top priority right now: {top_action}\n\n"
            f"That's the single highest-leverage move based on what we saw in your last 20 videos. "
            f"Your full audit has the other priority actions ranked, plus what your top-performing "
            f"pattern looks like.\n\n"
        )
        priority_html = (
            f'<p style="margin:0 0 14px 0;"><strong style="font-weight:700;">Your top priority right '
            f'now:</strong> {esc(top_action)}</p>'
            '<p style="margin:0 0 14px 0;">That\'s the single highest-leverage move based on what we '
            'saw in your last 20 videos. Your full audit has the other priority actions ranked, plus '
            'what your top-performing pattern looks like.</p>'
        )
    else:
        priority_text = ""
        priority_html = ""

    text = (
        f"Hi {name},\n\n"
        f"Your audit on {channel_ref} just finished. We looked at your last 20 videos, your CTR, "
        f"retention, posting cadence, and how YouTube is currently distributing your content.\n\n"
        f"{priority_text}"
        f"{dashboard_url}\n\n"
        f"If anything in the audit doesn't make sense, or if you spot something that looks off, "
        f"hit reply. I read every email.\n\n"
        f"— Denzil\n"
        f"Founder of YTGrowth\n\n"
        f"---\n"
        f"Unsubscribe: {unsubscribe_url}\n"
    )

    html = (
        '<div style="font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Helvetica,Arial,sans-serif;'
        'font-size:15px;line-height:1.6;color:#0f0f13;max-width:560px;">'
        f'<p style="margin:0 0 14px 0;">Hi {esc(name)},</p>'
        f'<p style="margin:0 0 14px 0;">Your audit on {esc(channel_ref)} just finished. We looked '
        f'at your last 20 videos, your CTR, retention, posting cadence, and how YouTube is '
        f'currently distributing your content.</p>'
        f'{priority_html}'
        f'<p style="margin:0 0 14px 0;"><a href="{dashboard_url}" style="color:#e5251b;">'
        f'{dashboard_url}</a></p>'
        '<p style="margin:0 0 14px 0;">If anything in the audit doesn\'t make sense, or if you '
        'spot something that looks off, hit reply. I read every email.</p>'
        '<p style="margin:0 0 6px 0;">&mdash; Denzil</p>'
        '<p style="margin:0 0 24px 0;color:#5a5a6a;">Founder of YTGrowth</p>'
        '<hr style="border:none;border-top:1px solid #eeeef3;margin:0 0 12px 0;">'
        f'<p style="margin:0;font-size:12px;color:#9595a4;">'
        f'<a href="{unsubscribe_url}" style="color:#9595a4;">Unsubscribe</a></p>'
        '</div>'
    )

    return text, html


# Backward-compat shim. The old call site in app/welcome_email.py used
# build_email_html(channel_name=..., channel_thumbnail=..., top_action=...,
# dashboard_url=..., unsubscribe_url=..., base_url=...). Returning HTML only.
def build_email_html(
    *,
    channel_name: str,
    channel_thumbnail: str | None = None,  # accepted for signature compat; unused
    top_action: str | None,
    dashboard_url: str,
    unsubscribe_url: str,
    base_url: str = "https://ytgrowth.io",  # accepted for signature compat; unused
) -> str:
    _, html = build_email(
        first_name="",  # legacy callers don't pass first_name; sender handles fallback
        channel_name=channel_name,
        top_action=top_action,
        dashboard_url=dashboard_url,
        unsubscribe_url=unsubscribe_url,
    )
    return html
