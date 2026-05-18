"""Free-plan change announcement (2026-05-18).

Sent once to existing free users: the self-renewing "3 analyses every
month" plan is replaced by a one-time 5-credit trial of the full-power
converter features (Outliers, Competitor Analysis, SEO Studio), with the
monthly refill removed. Honest about the takeaway, grounded (not hype)
on the product confidence line.

Plain-text canonical + an inline-styled HTML mirror (system font stack,
16px, 1.6 line height) so it renders cleanly across mail clients. No
em-dashes, no italics.
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

    # Inline-styled so it survives Gmail/Outlook stripping <style> blocks.
    wrap_open = (
        '<div style="margin:0;padding:24px;background:#f4f4f6;">'
        '<div style="max-width:560px;margin:0 auto;background:#ffffff;'
        'border-radius:12px;padding:32px 28px;'
        "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,"
        "Helvetica,Arial,sans-serif;color:#1a1a1f;font-size:16px;"
        'line-height:1.6;">'
    )
    h = lambda t: (
        f'<p style="margin:24px 0 8px;font-size:15px;font-weight:700;'
        f'color:#0a0a0f;">{t}</p>'
    )
    p = lambda t: f'<p style="margin:0 0 16px;">{t}</p>'

    html = (
        wrap_open
        + p(f"Hi {esc(name)},")
        + p("Quick heads-up: we've changed how the free plan works.")
        + p(
            '<strong>Before:</strong> 3 analyses that refilled every month.'
            '<br><strong>Now:</strong> a one-time set of free analyses that '
            'unlock our best features at full power, not a stripped-down '
            'version.'
        )
        + h("Why we did this")
        + p(
            "The old free plan only ever let you touch a watered-down slice "
            "of YTGrowth. You never got to see what it actually does. "
            "Running the AI and data behind the strong features costs us "
            "real money on every run, so a plan that refilled forever "
            "forced us to keep free weak. We'd rather flip that: give you "
            "the real thing to judge us on, not the limited mode."
        )
        + h("What you get free")
        + p(
            '&bull; Your full channel audit, refreshable once a week'
            '<br>&bull; Your remaining analyses on Outliers, Competitor '
            'Analysis, and SEO Studio, full versions, no limits while they '
            'last'
        )
        + p(
            "These are the features creators actually switch tools for. "
            "Outliers surfaces videos already proven to win in your niche. "
            "Competitor Analysis breaks down exactly why a rival is growing "
            "and what to take from it. This is where YTGrowth is sharper "
            "than the generic keyword tools, and it gets sharper the more "
            "creators use it."
        )
        + h("The honest part")
        + p(
            "The monthly refill is gone. Once your free analyses are used, "
            "you upgrade to keep going. Whatever you hadn't used yet is "
            "still on your account, nothing was taken."
        )
        + p(
            "Thanks for being here early. We're building this to be the "
            "tool serious creators keep."
        )
        + (
            f'<p style="margin:24px 0;">'
            f'<a href="{dashboard_url}" style="display:inline-block;'
            f'background:#0a0a0f;color:#ffffff;text-decoration:none;'
            f'font-weight:600;font-size:15px;padding:11px 22px;'
            f'border-radius:8px;">Open your dashboard</a></p>'
        )
        + (
            '<p style="margin:24px 0 0;">- <strong>Denzil</strong><br>'
            '<span style="color:#6b6b78;">Founder of YTGrowth</span></p>'
        )
        + (
            '<hr style="border:none;border-top:1px solid #ececef;'
            'margin:24px 0 14px;">'
        )
        + (
            f'<p style="margin:0;font-size:12px;color:#9595a4;">'
            f'<a href="{unsubscribe_url}" style="color:#9595a4;">'
            f'Unsubscribe</a></p>'
        )
        + "</div></div>"
    )

    return text, html
