"""Topup-offer email — sent to free users who have burned through 2 or 3
of their 3 monthly AI analyses. Pitches a 30% discount on monthly plans
for 2 billing cycles using code TOPUP30.

Discount applies to MONTHLY Solo / Growth / Agency only. Lifetime, annual,
and credit packs are NOT eligible. The copy makes that explicit.

Same minimalist style as welcome.py, welcome_immediate.py, reengagement.py
— plain HTML, no cards, no inline styles. Reads like a personal email
from the founder, not a marketing blast.
"""

DISCOUNT_CODE = "TOPUP30"


def build_email(
    *,
    first_name: str,
    monthly_used: int,
    monthly_allowance: int,
    pricing_url: str,
    unsubscribe_url: str,
) -> tuple[str, str]:
    name = (first_name or "there").strip()
    used  = max(0, int(monthly_used or 0))
    total = max(1, int(monthly_allowance or 3))

    def esc(s: str) -> str:
        return (s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    if used >= total:
        usage_line = f"You've used all {used} of your free AI analyses this month."
    else:
        usage_line = f"You've used {used} of your {total} free AI analyses this month."

    text = (
        f"Hey {name},\n\n"
        f"{usage_line} That tells me YTGrowth is doing something right. Thank you.\n\n"
        f"I want to make it easier to keep going. Use code TOPUP30 at checkout "
        f"to get 30% off your first 2 billing cycles on any monthly plan.\n\n"
        f"Eligible plans:\n\n"
        f"  Solo. $19/mo becomes $13.30/mo for 2 months. 20 AI analyses, full SEO\n"
        f"        Studio, Keyword Research, Thumbnail IQ.\n\n"
        f"  Growth. $49/mo becomes $34.30/mo for 2 months. 50 AI analyses,\n"
        f"        Competitor Analysis (5 channels), weekly reports.\n\n"
        f"  Agency. $149/mo becomes $104.30/mo for 2 months. 150 AI analyses,\n"
        f"        Competitor Analysis (10 channels), priority support.\n\n"
        f"The code is good for monthly plans only. Lifetime, annual, and credit "
        f"packs are not eligible. After the 2 cycles, regular pricing kicks in. "
        f"Cancel anytime, no hoops.\n\n"
        f"Upgrade here: {pricing_url}\n\n"
        f"If there's something missing that would tip you toward upgrading, hit "
        f"reply and tell me. I read every message.\n\n"
        f"- Denzil\n"
        f"Founder of YTGrowth\n\n"
        f"---\n"
        f"Unsubscribe: {unsubscribe_url}\n"
    )

    html = (
        f"<p>Hey {esc(name)},</p>"
        f"<p>{esc(usage_line)} That tells me YTGrowth is doing something right. Thank you.</p>"
        f"<p>I want to make it easier to keep going. Use code "
        f"<strong>TOPUP30</strong> at checkout to get <strong>30% off your first 2 "
        f"billing cycles</strong> on any monthly plan.</p>"
        f"<p><strong>Eligible plans:</strong></p>"
        f"<ul>"
        f"<li><strong>Solo.</strong> $19/mo becomes <strong>$13.30/mo</strong> for 2 months. "
        f"20 AI analyses, full SEO Studio, Keyword Research, Thumbnail IQ.</li>"
        f"<li><strong>Growth.</strong> $49/mo becomes <strong>$34.30/mo</strong> for 2 months. "
        f"50 AI analyses, Competitor Analysis (5 channels), weekly reports.</li>"
        f"<li><strong>Agency.</strong> $149/mo becomes <strong>$104.30/mo</strong> for 2 months. "
        f"150 AI analyses, Competitor Analysis (10 channels), priority support.</li>"
        f"</ul>"
        f"<p>The code is good for monthly plans only. Lifetime, annual, and credit "
        f"packs are not eligible. After the 2 cycles, regular pricing kicks in. "
        f"Cancel anytime, no hoops.</p>"
        f"<p><a href=\"{esc(pricing_url)}\">Upgrade with TOPUP30 &rarr;</a></p>"
        f"<p>If there's something missing that would tip you toward upgrading, hit "
        f"reply and tell me. I read every message.</p>"
        f"<p>- <strong>Denzil</strong><br>Founder of YTGrowth</p>"
        f"<hr>"
        f"<p><small><a href=\"{esc(unsubscribe_url)}\">Unsubscribe</a></small></p>"
    )

    return text, html
