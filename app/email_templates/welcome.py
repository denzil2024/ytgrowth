"""Welcome email — sent once when a user's first audit completes.

Strict brand alignment per user feedback:
- Real /favicon.svg logo (28×28), not a text wordmark.
- Inter, brand typography scale: 14 body / 22-800 h1 / 11-700 eyebrows.
- Single column, fewer stacked blocks (no avatar+name chip — channel
  name lives inline in the prose so the email isn't a skyscraper on
  mobile).
- All left-aligned. No centered headings. No coloured callout backgrounds.
- One CTA, brand red.
"""


def build_email_html(
    *,
    channel_name: str,
    channel_thumbnail: str | None,  # accepted for signature compat; not rendered
    top_action: str | None,
    dashboard_url: str,
    unsubscribe_url: str,
    base_url: str = "https://ytgrowth.io",
) -> str:
    safe_name = (channel_name or "your channel").replace("<", "&lt;").replace(">", "&gt;")

    # Bold the priority sentence inline; no callout box, no background fill,
    # no left border. Pure typographic emphasis only.
    priority_block = ""
    if top_action:
        safe_action = top_action.replace("<", "&lt;").replace(">", "&gt;")
        priority_block = f"""
            <p style="font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;color:#0f0f13;line-height:1.7;letter-spacing:-0.05px;margin:0 0 18px 0;">
              <strong style="font-weight:700;">Your top priority this week.</strong> {safe_action}
            </p>"""

    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your YTGrowth audit is ready</title>
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#0f0f13;-webkit-font-smoothing:antialiased;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#ffffff;padding:48px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="520" style="max-width:520px;">

        <!-- Logo (real /favicon.svg, not a wordmark) -->
        <tr>
          <td style="padding:0 0 28px 0;" align="left">
            <img src="{base_url}/favicon.svg" width="28" height="28" alt="YTGrowth.io" style="display:block;border:0;outline:none;text-decoration:none;">
          </td>
        </tr>

        <!-- H1 (brand scale: 22 / 800 / -0.5px) -->
        <tr>
          <td style="padding:0 0 18px 0;" align="left">
            <h1 style="font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:22px;font-weight:800;color:#0f0f13;letter-spacing:-0.5px;line-height:1.25;margin:0;">Your audit is ready.</h1>
          </td>
        </tr>

        <!-- Body — single tight prose block. Channel name inline so we don't
             need a separate avatar chip stacking the layout taller. -->
        <tr>
          <td style="padding:0 0 18px 0;" align="left">
            <p style="font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;color:#0f0f13;line-height:1.7;letter-spacing:-0.05px;margin:0 0 14px 0;">
              Hey there, we just finished analysing <strong style="font-weight:700;">{safe_name}</strong> — your last 20 videos, CTR, retention, posting cadence, and how YouTube is currently distributing your content.
            </p>
            {priority_block}
            <p style="font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;color:#0f0f13;line-height:1.7;letter-spacing:-0.05px;margin:0;">
              Open the dashboard for the other priority actions, plus what your top-performing pattern looks like right now.
            </p>
          </td>
        </tr>

        <!-- CTA — brand red, left-aligned, single line -->
        <tr>
          <td style="padding:14px 0 26px 0;" align="left">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="background:#e5251b;border-radius:8px;">
                  <a href="{dashboard_url}" style="display:inline-block;color:#ffffff;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:13.5px;font-weight:700;padding:11px 20px;text-decoration:none;letter-spacing:-0.05px;">Open my dashboard</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Sign-off -->
        <tr>
          <td style="padding:0 0 36px 0;" align="left">
            <p style="font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;color:#0f0f13;line-height:1.7;letter-spacing:-0.05px;margin:0 0 4px 0;">If you get stuck, just reply to this email.</p>
            <p style="font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;color:#0f0f13;line-height:1.7;letter-spacing:-0.05px;margin:0;">— the YTGrowth.io team</p>
          </td>
        </tr>

        <!-- Footer (eyebrow scale: 11 / muted grey) -->
        <tr>
          <td style="padding:18px 0 0 0;border-top:1px solid #eeeef3;" align="left">
            <p style="font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;color:#9595a4;line-height:1.55;letter-spacing:0;margin:0;">You're getting this because you connected your channel to YTGrowth.io. <a href="{unsubscribe_url}" style="color:#9595a4;text-decoration:underline;">Unsubscribe</a></p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>"""
