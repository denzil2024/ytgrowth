"""Milestone unlock email — HTML render.

Triggered when a channel crosses a new tier. Mirrors the in-app share
certificate: dark YTGrowth.io header, hero tier number in the category
color, achievement date banner, channel identity, CTA back to dashboard.
Email-safe HTML (table layout, inline styles).
"""


def _fmt_num(n: int) -> str:
    if n >= 1_000_000:
        s = f"{n / 1_000_000:.1f}"
        return (s.rstrip("0").rstrip(".") if "." in s else s) + "M"
    if n >= 1_000:
        s = f"{n / 1_000:.1f}"
        return (s.rstrip("0").rstrip(".") if "." in s else s) + "K"
    return f"{n:,}"


CATEGORY_LABEL = {
    "subs":        "Subscribers",
    "views":       "Total Views",
    "watch_hours": "Watch Hours",
}

CATEGORY_VERB = {
    "subs":        "subscribers",
    "views":       "total views",
    "watch_hours": "watch hours",
}

CATEGORY_COLOR = {
    "subs":        {"mid": "#e5251b", "deep": "#7a0f08"},
    "views":       {"mid": "#2563eb", "deep": "#1e3a8a"},
    "watch_hours": {"mid": "#eab308", "deep": "#8a6400"},
}


def build_email_html(
    *,
    channel_name: str,
    channel_thumbnail: str | None,
    category: str,
    tier: int,
    achieved_date: str,
    dashboard_url: str,
    unsubscribe_url: str,
) -> str:
    color = CATEGORY_COLOR.get(category, CATEGORY_COLOR["subs"])
    label = CATEGORY_LABEL.get(category, "")
    verb  = CATEGORY_VERB.get(category, "")

    if channel_thumbnail:
        avatar_html = (
            f'<img src="{channel_thumbnail}" width="64" height="64" '
            f'style="border-radius:50%;object-fit:cover;border:3px solid #ffffff;'
            f'box-shadow:0 0 0 1.5px #e5e5ec;display:block;margin:0 auto;" alt="">'
        )
    else:
        initial = (channel_name or "?")[0].upper()
        avatar_html = (
            f'<div style="width:64px;height:64px;border-radius:50%;background:#ff3b30;'
            f'color:#ffffff;font-size:28px;font-weight:800;line-height:64px;'
            f'text-align:center;border:3px solid #ffffff;box-shadow:0 0 0 1.5px #e5e5ec;'
            f'margin:0 auto;">{initial}</div>'
        )

    safe_name = (channel_name or "Your Channel").replace("<", "&lt;").replace(">", "&gt;")

    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Milestone unlocked</title>
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
          <td style="padding:40px 44px 36px;text-align:center;">
            <h1 style="font-size:30px;font-weight:900;color:#0f0f13;letter-spacing:-1px;margin:0 0 10px 0;">Congratulations!</h1>
            <p style="font-size:15px;color:#6a6a78;margin:0 0 34px 0;">You&rsquo;ve reached {_fmt_num(tier)} {verb}</p>

            <p style="font-size:72px;font-weight:900;color:{color['mid']};letter-spacing:-3px;line-height:0.95;margin:0 0 10px 0;">{_fmt_num(tier)}</p>
            <p style="font-size:13px;font-weight:800;color:{color['mid']};letter-spacing:3px;text-transform:uppercase;margin:0 0 30px 0;">{label}</p>

            <div style="text-align:center;margin:0 0 34px 0;">
              <span style="display:inline-block;background:#e5251b;color:#ffffff;font-size:14px;font-weight:700;padding:11px 28px;border-radius:4px;box-shadow:0 3px 10px rgba(229,37,27,0.25);">Achieved {achieved_date}</span>
            </div>

            <div style="margin:0 0 32px 0;">
              {avatar_html}
              <p style="font-size:17px;font-weight:800;color:#0f0f13;letter-spacing:-0.3px;margin:14px 0 0 0;">{safe_name}</p>
            </div>

            <a href="{dashboard_url}" style="display:inline-block;background:{color['mid']};color:#ffffff;font-size:15px;font-weight:700;padding:14px 32px;border-radius:999px;text-decoration:none;letter-spacing:-0.1px;box-shadow:0 4px 14px {color['mid']}40;">Share your milestone</a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 44px 28px;border-top:1px solid #ececf2;text-align:center;">
            <p style="font-size:12px;color:#9a9aa8;margin:0 0 6px 0;line-height:1.5;">You&rsquo;re getting this because you unlocked a new milestone on YTGrowth.io.</p>
            <p style="font-size:11px;color:#b8b8c2;margin:0;"><a href="{unsubscribe_url}" style="color:#b8b8c2;text-decoration:underline;">Unsubscribe from product emails</a></p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>"""
