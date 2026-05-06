"""Topup-offer email — sent to free users who have burned through 2 or 3
of their 3 monthly AI analyses. Pitches a 30% discount on monthly plans
for 2 billing cycles using code TOPUP30.

Discount applies to MONTHLY Solo / Growth / Agency only. Lifetime, annual,
and credit packs are NOT eligible. The copy makes that explicit.

Polished branded HTML design — dark header band with the YTGrowth wordmark,
white card body, accent discount chip, 3 plan rows with red highlights,
red gradient CTA button. Mirrors the signup_notification visual language.
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

    # Plain text mirror — intentionally simple, founder-direct
    text = (
        f"Hey {name},\n\n"
        f"{usage_line} That tells me YTGrowth is doing something right. Thank you.\n\n"
        f"I want to make it easier to keep going. Use code TOPUP30 at checkout for "
        f"30% off your first 2 billing cycles on any monthly plan:\n\n"
        f"  Solo    $19/mo  ->  $13.30/mo for 2 months\n"
        f"           20 AI analyses per month, full SEO Studio, Keyword Research,\n"
        f"           Thumbnail IQ.\n\n"
        f"  Growth  $49/mo  ->  $34.30/mo for 2 months\n"
        f"           50 AI analyses, Competitor Analysis (5 channels), weekly\n"
        f"           performance reports, multi-channel support.\n\n"
        f"  Agency  $149/mo ->  $104.30/mo for 2 months\n"
        f"           150 AI analyses, Competitor Analysis (10 channels), pooled\n"
        f"           analyses across the team, priority support.\n\n"
        f"The code is good for monthly plans only. Lifetime, annual, and credit "
        f"packs are not eligible. After 2 cycles, regular pricing kicks in. "
        f"Cancel anytime, no hoops.\n\n"
        f"Upgrade here:\n{pricing_url}\n\n"
        f"If there's something missing that would tip you toward upgrading, hit "
        f"reply and tell me. I read every message.\n\n"
        f"- Denzil\n"
        f"Founder of YTGrowth\n\n"
        f"---\n"
        f"Unsubscribe: {unsubscribe_url}\n"
    )

    # Polished HTML — system font stack (email clients dislike web fonts)
    html = f"""\
<!doctype html>
<html>
<body style="margin:0;padding:32px 16px;background:#f0f0f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">

  <div style="max-width:560px;margin:0 auto;">

    <!-- Card -->
    <div style="background:#ffffff;border:1px solid #e2e2ea;border-radius:18px;overflow:hidden;box-shadow:0 2px 6px rgba(0,0,0,0.04),0 12px 32px rgba(0,0,0,0.07);">

      <!-- Dark header band with brand -->
      <div style="background:linear-gradient(135deg,#0f0f13 0%,#1e1e28 100%);padding:24px 32px;">
        <table cellpadding="0" cellspacing="0" border="0" style="margin:0;">
          <tr>
            <td style="vertical-align:middle;padding-right:10px;">
              <div style="width:30px;height:30px;border-radius:8px;background:#e5251b;display:flex;align-items:center;justify-content:center;line-height:0;">
                <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;">
                  <path d="M23.2 11.6a2.1 2.1 0 0 0-1.48-1.48C20.55 9.8 16 9.8 16 9.8s-4.55 0-5.72.32A2.1 2.1 0 0 0 8.8 11.6 22 22 0 0 0 8.5 16a22 22 0 0 0 .3 4.4 2.1 2.1 0 0 0 1.48 1.48C11.45 22.2 16 22.2 16 22.2s4.55 0 5.72-.32a2.1 2.1 0 0 0 1.48-1.48A22 22 0 0 0 23.5 16a22 22 0 0 0-.3-4.4z" fill="white"/>
                  <polygon points="13.5,19 19.5,16 13.5,13" fill="#e5251b"/>
                </svg>
              </div>
            </td>
            <td style="vertical-align:middle;">
              <span style="font-size:17px;font-weight:800;color:#ffffff;letter-spacing:-0.4px;">YTGrowth</span>
            </td>
            <td style="vertical-align:middle;text-align:right;">
              <span style="display:inline-block;font-size:10.5px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#ffffff;background:rgba(229,37,27,0.22);border:1px solid rgba(229,37,27,0.45);padding:4px 10px;border-radius:100px;">Limited offer</span>
            </td>
          </tr>
        </table>
      </div>

      <!-- Body -->
      <div style="padding:36px 36px 28px;">

        <h1 style="margin:0 0 14px;font-size:26px;font-weight:800;color:#0f0f13;letter-spacing:-0.7px;line-height:1.2;">
          30% off your first <span style="color:#e5251b;">2 months</span>.
        </h1>

        <p style="margin:0 0 22px;font-size:15px;color:#4a4a58;line-height:1.65;">
          Hey {esc(name)}, {esc(usage_line)} That tells me YTGrowth is doing something right. Thank you.
        </p>

        <p style="margin:0 0 14px;font-size:15px;color:#4a4a58;line-height:1.65;">
          I want to make it easier to keep going. Use this code at checkout:
        </p>

        <!-- Discount code chip -->
        <div style="margin:0 0 28px;padding:18px 20px;background:linear-gradient(180deg,#fff5f5 0%,#ffe8e6 100%);border:1px solid #fecaca;border-radius:14px;text-align:center;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#9595a4;letter-spacing:0.1em;text-transform:uppercase;">Discount code</p>
          <p style="margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:26px;font-weight:800;color:#a50f07;letter-spacing:2px;">TOPUP30</p>
          <p style="margin:8px 0 0;font-size:12.5px;color:#9595a4;font-weight:500;">30% off the first 2 monthly billing cycles</p>
        </div>

        <!-- Plans -->
        <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#9595a4;letter-spacing:0.1em;text-transform:uppercase;">Eligible monthly plans</p>

        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:separate;border-spacing:0 8px;margin-bottom:24px;">
          <tr>
            <td style="padding:14px 16px;background:#fafafc;border:1px solid #e6e6ec;border-radius:12px;">
              <table cellpadding="0" cellspacing="0" border="0" style="width:100%;">
                <tr>
                  <td style="vertical-align:top;">
                    <p style="margin:0;font-size:14px;font-weight:700;color:#0f0f13;letter-spacing:-0.2px;">Solo</p>
                    <p style="margin:3px 0 0;font-size:12.5px;color:#4a4a58;line-height:1.5;">20 AI analyses per month, full SEO Studio, Keyword Research.</p>
                  </td>
                  <td style="vertical-align:top;text-align:right;white-space:nowrap;padding-left:14px;">
                    <p style="margin:0;font-size:13px;color:#9595a4;text-decoration:line-through;font-weight:500;">$19/mo</p>
                    <p style="margin:2px 0 0;font-size:16px;font-weight:800;color:#e5251b;letter-spacing:-0.3px;">$13.30/mo</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 16px;background:#fafafc;border:1px solid #e6e6ec;border-radius:12px;">
              <table cellpadding="0" cellspacing="0" border="0" style="width:100%;">
                <tr>
                  <td style="vertical-align:top;">
                    <p style="margin:0;font-size:14px;font-weight:700;color:#0f0f13;letter-spacing:-0.2px;">Growth</p>
                    <p style="margin:3px 0 0;font-size:12.5px;color:#4a4a58;line-height:1.5;">50 AI analyses, Competitor Analysis (5 channels), weekly reports.</p>
                  </td>
                  <td style="vertical-align:top;text-align:right;white-space:nowrap;padding-left:14px;">
                    <p style="margin:0;font-size:13px;color:#9595a4;text-decoration:line-through;font-weight:500;">$49/mo</p>
                    <p style="margin:2px 0 0;font-size:16px;font-weight:800;color:#e5251b;letter-spacing:-0.3px;">$34.30/mo</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 16px;background:#fafafc;border:1px solid #e6e6ec;border-radius:12px;">
              <table cellpadding="0" cellspacing="0" border="0" style="width:100%;">
                <tr>
                  <td style="vertical-align:top;">
                    <p style="margin:0;font-size:14px;font-weight:700;color:#0f0f13;letter-spacing:-0.2px;">Agency</p>
                    <p style="margin:3px 0 0;font-size:12.5px;color:#4a4a58;line-height:1.5;">150 AI analyses, Competitor Analysis (10 channels), priority support.</p>
                  </td>
                  <td style="vertical-align:top;text-align:right;white-space:nowrap;padding-left:14px;">
                    <p style="margin:0;font-size:13px;color:#9595a4;text-decoration:line-through;font-weight:500;">$149/mo</p>
                    <p style="margin:2px 0 0;font-size:16px;font-weight:800;color:#e5251b;letter-spacing:-0.3px;">$104.30/mo</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- CTA -->
        <div style="text-align:center;margin:0 0 22px;">
          <a href="{esc(pricing_url)}" style="display:inline-block;background:linear-gradient(180deg,#e5251b 0%,#a50f07 100%);color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:100px;box-shadow:0 4px 14px rgba(229,37,27,0.35);letter-spacing:-0.1px;">
            Upgrade with TOPUP30 &rarr;
          </a>
        </div>

        <p style="margin:0 0 18px;font-size:12.5px;color:#9595a4;line-height:1.6;text-align:center;">
          Monthly plans only. Lifetime, annual, and credit packs are not eligible. After 2 cycles, regular pricing kicks in. Cancel anytime, no hoops.
        </p>

        <hr style="border:none;border-top:1px solid #ececef;margin:22px 0;"/>

        <p style="margin:0 0 12px;font-size:14.5px;color:#4a4a58;line-height:1.65;">
          If there's something missing that would tip you toward upgrading, hit reply and tell me. I read every message.
        </p>
        <p style="margin:0;font-size:14.5px;color:#0f0f13;font-weight:700;">- Denzil</p>
        <p style="margin:2px 0 0;font-size:13px;color:#9595a4;">Founder of YTGrowth</p>

      </div>

    </div>

    <p style="margin:18px 0 0;text-align:center;font-size:11.5px;color:#9595a4;">
      <a href="{esc(unsubscribe_url)}" style="color:#9595a4;text-decoration:underline;">Unsubscribe</a>
    </p>

  </div>
</body>
</html>
"""

    return text, html
