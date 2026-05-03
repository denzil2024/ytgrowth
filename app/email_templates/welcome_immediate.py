"""Immediate welcome email, sent the moment a new user finishes Google OAuth.

Plain-text canonical, minimal HTML mirror with NO inline styles so email
clients render the body with their native typography (same vibe as a normal
1:1 email from the founder, not a marketing template).

Pairs with email_templates/welcome.py, which fires AFTER the audit completes
with the personalised "your top priority is X" hook.
"""


def build_email(
    *,
    first_name: str,
    channel_name: str | None,
    dashboard_url: str,
    unsubscribe_url: str,
) -> tuple[str, str]:
    name = (first_name or "there").strip()
    channel_ref = (channel_name or "").strip() or "your channel"

    def esc(s: str) -> str:
        return (s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    text = (
        f"Hi {name},\n\n"
        f"Thanks for connecting {channel_ref}. Your first 10-dimension audit is running right "
        f"now. As soon as it lands I'll send you a follow-up with your top priority action.\n\n"
        f"Why we built this\n\n"
        f"I got tired of YouTube tools that show you a wall of numbers and leave you to figure "
        f"out what to do with them. So we built one that actually tells you the next move. "
        f"That's the whole bet.\n\n"
        f"What's already open in your dashboard\n\n"
        f"While the audit runs, the rest of the toolkit is unlocked: Channel Audit, Competitor "
        f"Analysis, SEO Studio, Thumbnail IQ, Keyword Explorer, and Outliers. Have a poke "
        f"around.\n\n"
        f"{dashboard_url}\n\n"
        f"One ask\n\n"
        f"If anything ever feels off, slow, or just plain wrong, hit reply. This inbox comes "
        f"straight to me and I read every email. The product gets better because of users who "
        f"tell me what's broken.\n\n"
        f"Welcome aboard. Genuinely glad you're here.\n\n"
        f"— Denzil\n"
        f"Founder of YTGrowth\n\n"
        f"---\n"
        f"Unsubscribe: {unsubscribe_url}\n"
    )

    # NO inline styles. Email client (Gmail / Outlook / Apple Mail) renders
    # with its own typography, which is what makes the email feel like a
    # real personal note instead of a marketing template.
    html = (
        f"<p>Hi {esc(name)},</p>"
        f"<p>Thanks for connecting {esc(channel_ref)}. Your first 10-dimension audit is running "
        f"right now. As soon as it lands I'll send you a follow-up with your top priority "
        f"action.</p>"
        f"<p><strong>Why we built this</strong></p>"
        f"<p>I got tired of YouTube tools that show you a wall of numbers and leave you to "
        f"figure out what to do with them. So we built one that actually tells you the next "
        f"move. That's the whole bet.</p>"
        f"<p><strong>What's already open in your dashboard</strong></p>"
        f"<p>While the audit runs, the rest of the toolkit is unlocked: Channel Audit, "
        f"Competitor Analysis, SEO Studio, Thumbnail IQ, Keyword Explorer, and Outliers. "
        f"Have a poke around.</p>"
        f"<p><a href=\"{dashboard_url}\">{dashboard_url}</a></p>"
        f"<p><strong>One ask</strong></p>"
        f"<p>If anything ever feels off, slow, or just plain wrong, hit reply. This inbox "
        f"comes straight to me and I read every email. The product gets better because of "
        f"users who tell me what's broken.</p>"
        f"<p>Welcome aboard. Genuinely glad you're here.</p>"
        f"<p>&mdash; Denzil<br>Founder of YTGrowth</p>"
        f"<hr>"
        f"<p><small><a href=\"{unsubscribe_url}\">Unsubscribe</a></small></p>"
    )

    return text, html
