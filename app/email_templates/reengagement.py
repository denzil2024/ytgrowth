"""3-day re-engagement email — minimal brand-aligned version.

Same shell as welcome.py: real /favicon.svg logo, brand typography
(14 body / 22-800 h1 / 11 footer), single column, no callout boxes,
no left-border quote, no background colours. The personalised top
action is bolded inline — pure typographic emphasis.
"""


def build_email_html(
    *,
    channel_name: str,
    top_action: str | None,
    priority_actions_count: int,
    dashboard_url: str,
    unsubscribe_url: str,
    base_url: str = "https://ytgrowth.io",
) -> str:
    safe_name   = (channel_name or "your channel").replace("<", "&lt;").replace(">", "&gt;")
    safe_action = (top_action or "").replace("<", "&lt;").replace(">", "&gt;")

    if top_action:
        body_paragraphs = f"""
            <p style="font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;color:#0f0f13;line-height:1.7;letter-spacing:-0.05px;margin:0 0 14px 0;">
              Hi {safe_name},
            </p>
            <p style="font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;color:#0f0f13;line-height:1.7;letter-spacing:-0.05px;margin:0 0 14px 0;">
              You ran an audit a few days ago and we found {priority_actions_count} things to fix on your channel.
            </p>
            <p style="font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;color:#0f0f13;line-height:1.7;letter-spacing:-0.05px;margin:0 0 14px 0;">
              <strong style="font-weight:700;">Start with this one.</strong> {safe_action}
            </p>
            <p style="font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;color:#0f0f13;line-height:1.7;letter-spacing:-0.05px;margin:0;">
              The other {max(priority_actions_count - 1, 4)} are sitting in your dashboard. About 5 minutes to read through.
            </p>"""
    else:
        body_paragraphs = f"""
            <p style="font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;color:#0f0f13;line-height:1.7;letter-spacing:-0.05px;margin:0 0 14px 0;">
              Hi {safe_name},
            </p>
            <p style="font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;color:#0f0f13;line-height:1.7;letter-spacing:-0.05px;margin:0;">
              You ran an audit a few days ago but haven't been back. The 5 priority fixes, competitor gaps, and SEO suggestions are sitting in your dashboard. About 5 minutes to read through.
            </p>"""

    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your audit is still waiting</title>
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#0f0f13;-webkit-font-smoothing:antialiased;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#ffffff;padding:48px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="520" style="max-width:520px;">

        <!-- Logo + wordmark (matches the dashboard footer pattern). -->
        <tr>
          <td style="padding:0 0 28px 0;" align="left">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td valign="middle" style="padding-right:9px;">
                  <img src="{base_url}/favicon.svg" width="22" height="22" alt="" style="display:block;border:0;outline:none;text-decoration:none;">
                </td>
                <td valign="middle">
                  <span style="font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;font-weight:800;color:#0f0f13;letter-spacing:-0.3px;">YTGrowth</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- H1 -->
        <tr>
          <td style="padding:0 0 18px 0;" align="left">
            <h1 style="font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:22px;font-weight:800;color:#0f0f13;letter-spacing:-0.5px;line-height:1.25;margin:0;">Your audit is still waiting.</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:0 0 18px 0;" align="left">
            {body_paragraphs}
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:14px 0 26px 0;" align="left">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="background:#e5251b;border-radius:8px;">
                  <a href="{dashboard_url}" style="display:inline-block;color:#ffffff;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:13.5px;font-weight:700;padding:11px 20px;text-decoration:none;letter-spacing:-0.05px;">See all priorities</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Sign-off -->
        <tr>
          <td style="padding:0 0 36px 0;" align="left">
            <p style="font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;color:#0f0f13;line-height:1.7;letter-spacing:-0.05px;margin:0 0 4px 0;">Reply to this email if you'd like a hand getting started.</p>
            <p style="font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;color:#0f0f13;line-height:1.7;letter-spacing:-0.05px;margin:0;">The YTGrowth.io team</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:18px 0 0 0;border-top:1px solid #eeeef3;" align="left">
            <p style="font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;color:#9595a4;line-height:1.55;letter-spacing:0;margin:0;">You're getting this because you connected your channel to YTGrowth.io a few days ago. <a href="{unsubscribe_url}" style="color:#9595a4;text-decoration:underline;">Unsubscribe</a></p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>"""
