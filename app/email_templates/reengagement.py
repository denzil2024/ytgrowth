"""3-day re-engagement email — Linear / Stripe / Notion style.

Same minimalist shell as welcome.py: white background, single column,
Inter, founder voice, one CTA. Lead with the user's actual #1 priority
action so the email feels personal, not blasted. No callout boxes —
the action is bolded inline.
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

    if top_action:
        body_html = f"""
            <p style="font-size:16px;color:#1a1a1f;line-height:1.65;margin:0 0 20px 0;">
              Hey there,
            </p>
            <p style="font-size:16px;color:#1a1a1f;line-height:1.65;margin:0 0 20px 0;">
              You ran an audit on <strong style="font-weight:600;">{safe_name}</strong> a few days ago, and we found {priority_actions_count} things to fix. Here's the one to start with:
            </p>
            <p style="font-size:16px;color:#1a1a1f;line-height:1.65;margin:0 0 24px 0;padding:0 0 0 16px;border-left:3px solid #e5251b;">
              {safe_action}
            </p>
            <p style="font-size:16px;color:#1a1a1f;line-height:1.65;margin:0 0 28px 0;">
              The other {max(priority_actions_count - 1, 4)} are sitting in your dashboard — about 5 minutes to read through.
            </p>"""
    else:
        body_html = f"""
            <p style="font-size:16px;color:#1a1a1f;line-height:1.65;margin:0 0 20px 0;">
              Hey there,
            </p>
            <p style="font-size:16px;color:#1a1a1f;line-height:1.65;margin:0 0 28px 0;">
              You ran an audit on <strong style="font-weight:600;">{safe_name}</strong> a few days ago but haven't been back since. The 5 priority fixes, competitor gaps, and SEO suggestions are still waiting for you in your dashboard — about 5 minutes to read through.
            </p>"""

    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your audit is still waiting</title>
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1a1a1f;-webkit-font-smoothing:antialiased;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#ffffff;padding:48px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="540" style="max-width:540px;">

        <!-- Wordmark -->
        <tr>
          <td style="padding:0 0 36px 0;">
            <span style="font-size:18px;font-weight:700;color:#1a1a1f;letter-spacing:-0.4px;">YTGrowth<span style="color:#e5251b;">.io</span></span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:0 0 8px 0;">
            <h1 style="font-size:22px;font-weight:600;color:#1a1a1f;letter-spacing:-0.5px;line-height:1.3;margin:0 0 24px 0;">Your audit is still waiting.</h1>

            {body_html}

            <!-- CTA -->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 32px 0;">
              <tr>
                <td style="background:#e5251b;border-radius:8px;">
                  <a href="{dashboard_url}" style="display:inline-block;color:#ffffff;font-size:15px;font-weight:600;padding:12px 22px;text-decoration:none;letter-spacing:-0.1px;">See all priorities →</a>
                </td>
              </tr>
            </table>

            <p style="font-size:15px;color:#1a1a1f;line-height:1.65;margin:0 0 8px 0;">
              Reply to this email if you'd like a hand getting started.
            </p>

            <p style="font-size:15px;color:#1a1a1f;line-height:1.65;margin:0 0 0 0;">
              — the YTGrowth.io team
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:48px 0 0 0;">
            <p style="font-size:12px;color:#9a9aa8;margin:0;line-height:1.5;">You're getting this because you connected your channel to YTGrowth.io a few days ago. <a href="{unsubscribe_url}" style="color:#9a9aa8;text-decoration:underline;">Unsubscribe</a></p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>"""
