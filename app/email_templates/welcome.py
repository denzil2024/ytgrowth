"""Welcome email — Linear / Stripe / Notion style.

Design reference: modern minimal SaaS lifecycle email.
- White background, no dark header chrome.
- Single column, max 540px, generous whitespace.
- Inter with system fallbacks.
- Founder voice — opens "Hey there," reads like a short personal email.
- One CTA, left-aligned, red brand pill.
- Tiny footer in muted grey + one-line unsubscribe.
"""


def _initials_avatar(channel_name: str) -> str:
    """Fallback red-circle avatar with the channel's first letter."""
    initial = (channel_name or "?")[0].upper()
    return (
        f'<div style="width:48px;height:48px;border-radius:50%;'
        f'background:#e5251b;color:#ffffff;font-size:20px;font-weight:700;'
        f'line-height:48px;text-align:center;display:inline-block;">{initial}</div>'
    )


def build_email_html(
    *,
    channel_name: str,
    channel_thumbnail: str | None,
    top_action: str | None,
    dashboard_url: str,
    unsubscribe_url: str,
) -> str:
    safe_name = (channel_name or "your channel").replace("<", "&lt;").replace(">", "&gt;")

    if channel_thumbnail:
        avatar_html = (
            f'<img src="{channel_thumbnail}" width="48" height="48" '
            f'style="border-radius:50%;object-fit:cover;display:block;" alt="">'
        )
    else:
        avatar_html = _initials_avatar(channel_name)

    # Personalised top-action sentence — bolded inline, no separate callout box.
    top_action_block = ""
    if top_action:
        safe_action = top_action.replace("<", "&lt;").replace(">", "&gt;")
        top_action_block = f"""
            <p style="font-size:16px;color:#1a1a1f;line-height:1.65;margin:0 0 24px 0;">
              <strong style="font-weight:600;">Your #1 priority this week:</strong><br>
              {safe_action}
            </p>"""

    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Welcome to YTGrowth.io</title>
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

        <!-- Channel avatar + name (small, just for context) -->
        <tr>
          <td style="padding:0 0 28px 0;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td valign="middle" style="padding-right:14px;">{avatar_html}</td>
                <td valign="middle">
                  <p style="font-size:15px;font-weight:600;color:#1a1a1f;margin:0;letter-spacing:-0.1px;">{safe_name}</p>
                  <p style="font-size:13px;color:#737380;margin:2px 0 0 0;">Connected to YTGrowth.io</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:0 0 8px 0;">
            <h1 style="font-size:22px;font-weight:600;color:#1a1a1f;letter-spacing:-0.5px;line-height:1.3;margin:0 0 20px 0;">Your audit is ready.</h1>

            <p style="font-size:16px;color:#1a1a1f;line-height:1.65;margin:0 0 20px 0;">
              Hey there,
            </p>

            <p style="font-size:16px;color:#1a1a1f;line-height:1.65;margin:0 0 20px 0;">
              We just finished analysing your last 20 videos — CTR, retention, posting cadence, traffic mix, and how YouTube is currently distributing your content. Everything is sitting in your dashboard.
            </p>

            {top_action_block}

            <p style="font-size:16px;color:#1a1a1f;line-height:1.65;margin:0 0 28px 0;">
              Open the dashboard to see the other 4 priority actions, plus what your top-performing pattern looks like right now.
            </p>

            <!-- CTA -->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 32px 0;">
              <tr>
                <td style="background:#e5251b;border-radius:8px;">
                  <a href="{dashboard_url}" style="display:inline-block;color:#ffffff;font-size:15px;font-weight:600;padding:12px 22px;text-decoration:none;letter-spacing:-0.1px;">Open my dashboard →</a>
                </td>
              </tr>
            </table>

            <p style="font-size:15px;color:#1a1a1f;line-height:1.65;margin:0 0 8px 0;">
              If you get stuck or have a question, just reply to this email — it goes straight to me.
            </p>

            <p style="font-size:15px;color:#1a1a1f;line-height:1.65;margin:0 0 0 0;">
              — the YTGrowth.io team
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:48px 0 0 0;">
            <p style="font-size:12px;color:#9a9aa8;margin:0;line-height:1.5;">You're getting this because you connected your channel to YTGrowth.io. <a href="{unsubscribe_url}" style="color:#9a9aa8;text-decoration:underline;">Unsubscribe</a></p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>"""
