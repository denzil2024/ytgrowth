"""Immediate welcome email, sent the moment a new user finishes Google OAuth.

Plain-text-first by design. Reads like a real one-to-one note from the
founder, not a marketing template. No table layouts, no logo header, no big
red CTA button. Just text, with a single inline link to the dashboard.

Pairs with email_templates/welcome.py, which still fires AFTER the audit
completes with the personalised "your top priority is X" hook.
"""


def build_email(
    *,
    first_name: str,
    channel_name: str | None,
    dashboard_url: str,
    unsubscribe_url: str,
) -> tuple[str, str]:
    """Returns (text, html). Text is canonical; html is a minimal mirror so
    HTML-only clients (Gmail web, Outlook) render the same content with native
    typography instead of monospace.
    """
    name = (first_name or "there").strip()
    channel_ref = (channel_name or "").strip() or "your channel"

    # Escape user-controlled values for the HTML version
    def esc(s: str) -> str:
        return (s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    name_html        = esc(name)
    channel_ref_html = esc(channel_ref)

    text = (
        f"Hi {name},\n\n"
        f"I'm Denzil, the founder of YTGrowth. I just saw {channel_ref} connect, "
        f"so I wanted to send a quick note personally to say thanks for trusting us with your channel.\n\n"
        f"YTGrowth exists because I was tired of YouTube tools that hand you a wall of numbers and "
        f"leave you to figure out what to do with them. So we built one that actually tells you the "
        f"next move. That's the whole bet.\n\n"
        f"Your first audit is already running in the background. You'll get a second email from me "
        f"with your top priority action as soon as it lands, usually in a minute or two.\n\n"
        f"In the meantime, your dashboard already has the rest of the toolkit open: full Channel "
        f"Audit, Competitor Analysis, SEO Studio, Thumbnail IQ, Keyword Explorer, and Outliers. "
        f"Have a poke around.\n\n"
        f"{dashboard_url}\n\n"
        f"If anything ever feels off, slow, or just plain wrong, please hit reply. This inbox "
        f"comes straight to me, and I read every email. The product gets better because of users "
        f"who tell me what's broken.\n\n"
        f"Welcome aboard. Genuinely glad you're here.\n\n"
        f"— Denzil\n"
        f"Founder of YTGrowth\n\n"
        f"---\n"
        f"Unsubscribe: {unsubscribe_url}\n"
    )

    html = (
        '<div style="font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Helvetica,Arial,sans-serif;'
        'font-size:15px;line-height:1.6;color:#0f0f13;max-width:560px;">'
        f'<p style="margin:0 0 14px 0;">Hi {name_html},</p>'
        f'<p style="margin:0 0 14px 0;">I\'m Denzil, the founder of YTGrowth. I just saw '
        f'{channel_ref_html} connect, so I wanted to send a quick note personally to say thanks for '
        f'trusting us with your channel.</p>'
        '<p style="margin:0 0 14px 0;">YTGrowth exists because I was tired of YouTube tools that '
        'hand you a wall of numbers and leave you to figure out what to do with them. So we built '
        'one that actually tells you the next move. That\'s the whole bet.</p>'
        '<p style="margin:0 0 14px 0;">Your first audit is already running in the background. '
        'You\'ll get a second email from me with your top priority action as soon as it lands, '
        'usually in a minute or two.</p>'
        '<p style="margin:0 0 14px 0;">In the meantime, your dashboard already has the rest of the '
        'toolkit open: full Channel Audit, Competitor Analysis, SEO Studio, Thumbnail IQ, '
        'Keyword Explorer, and Outliers. Have a poke around.</p>'
        f'<p style="margin:0 0 14px 0;"><a href="{dashboard_url}" style="color:#e5251b;">'
        f'{dashboard_url}</a></p>'
        '<p style="margin:0 0 14px 0;">If anything ever feels off, slow, or just plain wrong, '
        'please hit reply. This inbox comes straight to me, and I read every email. The product '
        'gets better because of users who tell me what\'s broken.</p>'
        '<p style="margin:0 0 14px 0;">Welcome aboard. Genuinely glad you\'re here.</p>'
        '<p style="margin:0 0 6px 0;">&mdash; Denzil</p>'
        '<p style="margin:0 0 24px 0;color:#5a5a6a;">Founder of YTGrowth</p>'
        '<hr style="border:none;border-top:1px solid #eeeef3;margin:0 0 12px 0;">'
        f'<p style="margin:0;font-size:12px;color:#9595a4;">'
        f'<a href="{unsubscribe_url}" style="color:#9595a4;">Unsubscribe</a></p>'
        '</div>'
    )

    return text, html
