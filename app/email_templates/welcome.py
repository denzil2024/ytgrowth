"""Welcome email — sent once when a user's first audit completes.

Mirrors milestone_unlock.py's email-safe HTML structure: dark
YTGrowth.io header, white card, red CTA button, footer with
unsubscribe link. Drops the milestone tier hero in favour of a
3-step "what to try next" list (same copy as the in-app
WelcomeModal so the touchpoints feel consistent).
"""


STEPS = [
    ("1", "Read your audit",
     "Overview shows your Priority Actions — exactly what to fix this week."),
    ("2", "Optimise a video",
     "SEO Studio rewrites your titles and descriptions, "
     "Post-Publish Review tells you why a video flopped."),
    ("3", "Find your next idea",
     "Video Ideas, Outliers, and Competitors surface what's actually "
     "working in your niche."),
]


def build_email_html(
    *,
    channel_name: str,
    channel_thumbnail: str | None,
    top_action: str | None,
    dashboard_url: str,
    unsubscribe_url: str,
) -> str:
    if channel_thumbnail:
        avatar_html = (
            f'<img src="{channel_thumbnail}" width="48" height="48" '
            f'style="border-radius:50%;object-fit:cover;border:2px solid #ffffff;'
            f'box-shadow:0 0 0 1.5px #e5e5ec;display:inline-block;vertical-align:middle;" alt="">'
        )
    else:
        initial = (channel_name or "?")[0].upper()
        avatar_html = (
            f'<div style="display:inline-block;width:48px;height:48px;border-radius:50%;'
            f'background:#ff3b30;color:#ffffff;font-size:22px;font-weight:800;line-height:48px;'
            f'text-align:center;border:2px solid #ffffff;box-shadow:0 0 0 1.5px #e5e5ec;'
            f'vertical-align:middle;">{initial}</div>'
        )

    safe_name = (channel_name or "your channel").replace("<", "&lt;").replace(">", "&gt;")

    # Personalised top-action callout — only rendered when we have one.
    top_action_block = ""
    if top_action:
        safe_action = top_action.replace("<", "&lt;").replace(">", "&gt;")
        top_action_block = f"""
            <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:18px 22px;margin:0 0 28px 0;text-align:left;">
              <p style="font-size:11px;font-weight:800;color:#a16207;letter-spacing:1px;text-transform:uppercase;margin:0 0 8px 0;">Top priority this week</p>
              <p style="font-size:14.5px;color:#0f0f13;line-height:1.55;margin:0;">{safe_action}</p>
            </div>"""

    steps_html = "".join(f"""
            <tr>
              <td style="padding:0 0 12px 0;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td width="36" valign="top" style="padding-right:14px;">
                      <div style="width:30px;height:30px;border-radius:8px;background:#0a0a0f;color:#ffffff;font-size:13px;font-weight:800;line-height:30px;text-align:center;">{n}</div>
                    </td>
                    <td valign="top">
                      <p style="font-size:14.5px;font-weight:800;color:#0f0f13;letter-spacing:-0.1px;margin:2px 0 4px 0;line-height:1.3;">{title}</p>
                      <p style="font-size:13px;color:#6a6a78;line-height:1.55;margin:0;">{body}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>""" for (n, title, body) in STEPS)

    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Welcome to YTGrowth.io</title>
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
          <td style="padding:36px 44px 30px;">
            <div style="text-align:center;margin:0 0 24px 0;">
              {avatar_html}
              <p style="font-size:13px;color:#6a6a78;margin:12px 0 0 0;">Connected: <strong style="color:#0f0f13;">{safe_name}</strong></p>
            </div>

            <h1 style="font-size:26px;font-weight:900;color:#0f0f13;letter-spacing:-0.7px;margin:0 0 10px 0;text-align:center;">Your YTGrowth audit is ready</h1>
            <p style="font-size:14.5px;color:#6a6a78;line-height:1.65;margin:0 0 28px 0;text-align:center;">Here's the 3-step path most creators follow on day one. Each step costs 1 credit.</p>

            {top_action_block}

            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 28px 0;">
              {steps_html}
            </table>

            <div style="text-align:center;">
              <a href="{dashboard_url}" style="display:inline-block;background:#e5251b;color:#ffffff;font-size:15px;font-weight:700;padding:14px 32px;border-radius:999px;text-decoration:none;letter-spacing:-0.1px;box-shadow:0 4px 14px rgba(229,37,27,0.35);">Open my dashboard</a>
            </div>
            <p style="font-size:12.5px;color:#9a9aa8;margin:14px 0 0 0;text-align:center;">Need help anytime? Email <a href="mailto:support@ytgrowth.io" style="color:#6a6a78;text-decoration:underline;">support@ytgrowth.io</a></p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 44px 28px;border-top:1px solid #ececf2;text-align:center;">
            <p style="font-size:12px;color:#9a9aa8;margin:0 0 6px 0;line-height:1.5;">You're getting this because you just connected your channel to YTGrowth.io.</p>
            <p style="font-size:11px;color:#b8b8c2;margin:0;"><a href="{unsubscribe_url}" style="color:#b8b8c2;text-decoration:underline;">Unsubscribe from product emails</a></p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>"""
