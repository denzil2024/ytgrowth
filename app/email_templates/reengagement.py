"""3-day re-engagement email — for free users who connected but never came back.

Same email-safe shell as welcome.py / milestone_unlock.py: dark
YTGrowth.io header, white card, red CTA, footer with unsubscribe link.
Lead is the user's actual #1 priority action from their audit so the
subject line and the headline both feel personalised, not blasted.
"""


def build_email_html(
    *,
    channel_name: str,
    top_action: str | None,
    priority_actions_count: int,
    dashboard_url: str,
    unsubscribe_url: str,
) -> str:
    safe_name   = (channel_name or "your channel").replace("<", "&lt;").replace(">", "&gt;")
    safe_action = (top_action or "").replace("<", "&lt;").replace(">", "&gt;")

    # Hero block — show the actual #1 action when we have it; fall back to
    # generic copy if for any reason it isn't available.
    if top_action:
        hero_html = f"""
            <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:22px 24px;margin:0 0 24px 0;">
              <p style="font-size:11px;font-weight:800;color:#9a3412;letter-spacing:1px;text-transform:uppercase;margin:0 0 10px 0;">Your #1 priority</p>
              <p style="font-size:15px;color:#0f0f13;line-height:1.6;margin:0;">{safe_action}</p>
            </div>"""
        body_lead = (
            f"Your audit found {priority_actions_count} things to fix on {safe_name}. "
            f"Here's the one to start with — the rest are waiting on your dashboard."
        )
    else:
        hero_html = ""
        body_lead = (
            f"Your audit on {safe_name} is still waiting. The 5 priority fixes, "
            f"competitor gaps, and SEO suggestions are sitting in your dashboard."
        )

    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Your YTGrowth audit found things to fix</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f9;font-family:'Helvetica Neue',Arial,sans-serif;color:#0f0f13;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f5f5f9;padding:32px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="560" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.08);max-width:560px;">
        <!-- Dark header -->
        <tr>
          <td align="center" style="background:#0a0a0f;padding:22px 0;">
            <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.6px;">YTGrowth<span style="color:#ff3b30;">.io</span></span>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:38px 44px 32px;">
            <h1 style="font-size:24px;font-weight:900;color:#0f0f13;letter-spacing:-0.6px;margin:0 0 14px 0;line-height:1.25;">Your audit found things to fix.</h1>
            <p style="font-size:14.5px;color:#6a6a78;line-height:1.7;margin:0 0 26px 0;">{body_lead}</p>

            {hero_html}

            <div style="text-align:center;margin:8px 0 0 0;">
              <a href="{dashboard_url}" style="display:inline-block;background:#e5251b;color:#ffffff;font-size:15px;font-weight:700;padding:14px 32px;border-radius:999px;text-decoration:none;letter-spacing:-0.1px;box-shadow:0 4px 14px rgba(229,37,27,0.35);">See all priorities</a>
            </div>
            <p style="font-size:12.5px;color:#9a9aa8;margin:18px 0 0 0;text-align:center;">Got a question? Email <a href="mailto:support@ytgrowth.io" style="color:#6a6a78;text-decoration:underline;">support@ytgrowth.io</a></p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 44px 28px;border-top:1px solid #ececf2;text-align:center;">
            <p style="font-size:12px;color:#9a9aa8;margin:0 0 6px 0;line-height:1.5;">You're getting this because you connected your channel to YTGrowth.io a few days ago.</p>
            <p style="font-size:11px;color:#b8b8c2;margin:0;"><a href="{unsubscribe_url}" style="color:#b8b8c2;text-decoration:underline;">Unsubscribe from product emails</a></p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>"""
