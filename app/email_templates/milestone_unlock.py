"""Milestone unlock email — direct port of in-app MilestoneShareCard.

NOT a redesign. Copies every visual element from
Dashboard.jsx::MilestoneShareCard (lines 361-573) into email-safe HTML:

- Outer card: 600px white, 16px radius, shadow.
- Top dark band: linear gradient #15151c → #0a0a0f. Red rounded-square
  logo (34×34, inline play SVG) + "YTGrowth.io" wordmark (22/800,
  ".io" in #ff3b30).
- Body gradient: cat.h1 + ~12% alpha → white at 38% → white.
- V-drape ribbon (two folded straps + dark center triangle) and star
  badge composited into ONE 200×200 SVG so they overlap correctly
  without flexbox.
- Star: radial gradient using cat.h1/h2/h3, white inner circle,
  milestone-category icon overlay in cat.ink.
- Headline 34/900, subtitle 15/500.
- Hero number 84/900 in cat.h2, label 13/800 uppercase 0.18em.
- Date ribbon: SVG polygon with notched ends + linear gradient
  #ff4a3f → #e5251b. (Plain HTML clipPath isn't email-safe; SVG works.)
- Channel avatar 68×68 round + YouTube play badge stacked via
  position:relative/absolute (works in modern Gmail/Apple Mail).
- Footer: top border + "YTGrowth.io · YouTube Growth Analytics".
"""


CATEGORY_GRADIENT = {
    "subs":        {"h1": "#ff8a80", "h2": "#e5251b", "h3": "#7a0f08", "stroke": "#4a0903", "ink": "#4a0903"},
    "views":       {"h1": "#7fb3ff", "h2": "#2563eb", "h3": "#1e3a8a", "stroke": "#172554", "ink": "#172554"},
    "watch_hours": {"h1": "#ffe082", "h2": "#eab308", "h3": "#8a6400", "stroke": "#4a3400", "ink": "#4a3400"},
    "uploads":     {"h1": "#6ee7b7", "h2": "#059669", "h3": "#064e3b", "stroke": "#022c1e", "ink": "#022c1e"},
}

CATEGORY_LABEL = {
    "subs":        "Subscribers",
    "views":       "Total Views",
    "watch_hours": "Watch Hours",
    "uploads":     "Uploads",
}

CATEGORY_VERB = {
    "subs":        "subscribers",
    "views":       "total views",
    "watch_hours": "watch hours",
    "uploads":     "uploads",
}


def _fmt_num(n: int) -> str:
    if n >= 1_000_000:
        s = f"{n / 1_000_000:.1f}"
        return (s.rstrip("0").rstrip(".") if "." in s else s) + "M"
    if n >= 1_000:
        s = f"{n / 1_000:.1f}"
        return (s.rstrip("0").rstrip(".") if "." in s else s) + "K"
    return f"{n:,}"


def _milestone_icon_paths(category: str) -> str:
    """SVG inner content for the icon centered in the star (24×24 viewBox)."""
    if category == "subs":
        return (
            '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>'
            '<circle cx="9" cy="7" r="4"/>'
            '<path d="M23 21v-2a4 4 0 0 0-3-3.87"/>'
            '<path d="M16 3.13a4 4 0 0 1 0 7.75"/>'
        )
    if category == "views":
        return (
            '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>'
            '<circle cx="12" cy="12" r="3"/>'
        )
    if category == "watch_hours":
        return (
            '<circle cx="12" cy="12" r="10"/>'
            '<polyline points="12 6 12 12 16 14"/>'
        )
    if category == "uploads":
        return (
            '<polygon points="23 7 16 12 23 17 23 7"/>'
            '<rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>'
        )
    return ""


def _composite_ribbon_star_svg(category: str, tier: int) -> str:
    """Single 200×200 SVG containing the V-drape ribbon (top) AND the star
    badge (centered, overlapping the ribbon's lower half). Star is
    translated by (26, 52) so it sits at the bottom of the canvas while
    the ribbon's V-tips meet behind its upper edge.

    The card body gradient is baked into the SVG background so it renders
    correctly whether or not the email client preserves SVG transparency.
    """
    cat = CATEGORY_GRADIENT.get(category, CATEGORY_GRADIENT["subs"])
    rL = f"ribL-{category}-{tier}".replace(" ", "")
    rR = f"ribR-{category}-{tier}".replace(" ", "")
    sg = f"star-{category}-{tier}".replace(" ", "")
    bg = f"bg-{category}"

    # Star polygon points scaled from the 120-unit master to 148px (factor 148/120).
    raw_pts = [
        (60, 8), (73, 44), (112, 44), (80, 68), (92, 104),
        (60, 82), (28, 104), (40, 68), (8, 44), (47, 44),
    ]
    fac = 148 / 120
    star_pts = " ".join(f"{x * fac:.2f},{y * fac:.2f}" for x, y in raw_pts)
    inner_cx = 148 / 2           # 74
    inner_cy = (148 / 2) * 0.97  # ≈ 71.78
    inner_r  = 148 * 0.19        # 28.12
    icon_size   = 148 * 0.26     # 38.48
    icon_x      = (148 - icon_size) / 2          # 54.76 — centred horizontally
    # In-app: icon div has marginTop: -s*0.03 (= -4.44px) shifting it upward to
    # align with the white circle centre (cy=71.78). Match that offset here.
    icon_y      = (148 - icon_size) / 2 - (148 * 0.03)  # ≈ 50.32
    icon_scale  = icon_size / 24

    icon_paths = _milestone_icon_paths(category)
    icon_color = cat["ink"]
    sf = f"sf-{category}"

    return f"""<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Card body gradient baked in so email clients that don't preserve SVG
         transparency still show the correct tinted background. -->
    <linearGradient id="{bg}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="{cat['h1']}" stop-opacity="0.094"/>
      <stop offset="100%" stop-color="#ffffff"      stop-opacity="1"/>
    </linearGradient>
    <linearGradient id="{rL}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#ff5246"/>
      <stop offset="100%" stop-color="#c1150c"/>
    </linearGradient>
    <linearGradient id="{rR}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#d31a10"/>
      <stop offset="100%" stop-color="#8a0e07"/>
    </linearGradient>
    <radialGradient id="{sg}" cx="36%" cy="30%" r="72%">
      <stop offset="0%"   stop-color="{cat['h1']}"/>
      <stop offset="55%"  stop-color="{cat['h2']}"/>
      <stop offset="100%" stop-color="{cat['h3']}"/>
    </radialGradient>
    <filter id="{sf}" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.22"/>
    </filter>
  </defs>
  <!-- Background gradient (matches card body) -->
  <rect width="200" height="200" fill="url(#{bg})"/>
  <!-- V-drape ribbon (top) — exact polygon coords from Dashboard.jsx -->
  <polygon points="56,0 98,0 112,112 90,128 78,112" fill="url(#{rL})"/>
  <polygon points="102,0 144,0 122,112 110,128 88,112" fill="url(#{rR})"/>
  <polygon points="92,118 108,118 100,134" fill="#5e0a04"/>
  <!-- Star badge — translated so it sits at flex-end of 200px container -->
  <g transform="translate(26 52)" filter="url(#{sf})">
    <polygon points="{star_pts}" fill="url(#{sg})" stroke="{cat['stroke']}" stroke-width="1.25" stroke-linejoin="round"/>
    <circle cx="{inner_cx:.2f}" cy="{inner_cy:.2f}" r="{inner_r:.2f}" fill="rgba(255,255,255,0.96)"/>
  </g>
  <!-- Icon drawn separately (outside filter group) to avoid shadow on the icon itself -->
  <g transform="translate({26 + icon_x:.2f} {52 + icon_y:.2f}) scale({icon_scale:.4f})" fill="none" stroke="{icon_color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    {icon_paths}
  </g>
</svg>"""


def _date_ribbon_svg(date_str: str) -> str:
    """Notched red ribbon with the achievement date — SVG polygon + <text>
    because CSS clipPath isn't email-safe."""
    safe_date = (date_str or "").replace("<", "&lt;").replace(">", "&gt;")
    label = f"Achieved {safe_date}"
    # Width grows with text length so the ribbon never crops the date.
    w = max(220, 14 + len(label) * 8)
    h = 44
    notch_in = 10  # how deep the side notches cut in
    return f"""
    <svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto;">
      <defs>
        <linearGradient id="dateRib-{w}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ff4a3f"/>
          <stop offset="100%" stop-color="#e5251b"/>
        </linearGradient>
      </defs>
      <polygon points="0,0 {w},0 {w - notch_in},{h / 2} {w},{h} 0,{h} {notch_in},{h / 2}" fill="url(#dateRib-{w})"/>
      <text x="{w / 2}" y="{h / 2 + 5}" text-anchor="middle" fill="#ffffff" font-family="'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif" font-size="14" font-weight="700" letter-spacing="-0.1">{label}</text>
    </svg>"""


def build_email_html(
    *,
    channel_name: str,
    channel_thumbnail: str | None,
    category: str,
    tier: int,
    achieved_date: str,
    dashboard_url: str,
    unsubscribe_url: str,
    base_url: str = "https://ytgrowth.io",
) -> str:
    cat   = CATEGORY_GRADIENT.get(category, CATEGORY_GRADIENT["subs"])
    label = CATEGORY_LABEL.get(category, "")
    verb  = CATEGORY_VERB.get(category, "")
    safe_name = (channel_name or "Your Channel").replace("<", "&lt;").replace(">", "&gt;")

    # Body gradient — top tinted with cat.h1 at ~12% alpha, fading to white.
    body_bg = (
        f"background:#ffffff;"
        f"background:linear-gradient(180deg, {cat['h1']}1f 0%, #ffffff 38%, #ffffff 100%);"
    )

    # Channel avatar — img if we have one, else red-circle initial.
    if channel_thumbnail:
        avatar_main = (
            f'<img src="{channel_thumbnail}" width="68" height="68" alt="" '
            f'style="display:block;width:68px;height:68px;border-radius:50%;'
            f'object-fit:cover;border:3px solid #ffffff;'
            f'box-shadow:0 0 0 1.5px #e5e5ec, 0 4px 14px rgba(0,0,0,0.12);">'
        )
    else:
        initial = (channel_name or "?")[0].upper()
        avatar_main = (
            f'<div style="display:block;width:68px;height:68px;border-radius:50%;'
            f'background:#ff3b30;color:#ffffff;font-size:28px;font-weight:800;'
            f'line-height:68px;text-align:center;border:3px solid #ffffff;'
            f'box-shadow:0 0 0 1.5px #e5e5ec, 0 4px 14px rgba(0,0,0,0.12);">'
            f'{initial}</div>'
        )

    # Gmail strips inline <svg> tags but RENDERS svg referenced via <img src>.
    # We pre-generate one SVG file per category at build time and serve it as
    # a static asset so the medal actually shows up in the inbox.
    import urllib.parse
    medal_url      = f"{base_url}/email-assets/medal-{category}.svg"
    date_ribbon_url = f"{base_url}/email-assets/date-ribbon.svg?date={urllib.parse.quote(achieved_date)}"
    # Pre-compute ribbon width so the <img> has correct dimensions.
    _date_label = f"Achieved {achieved_date}"
    ribbon_w    = max(220, 14 + len(_date_label) * 8)
    tier_str    = _fmt_num(tier)

    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>You hit {tier_str} {verb}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f9;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#0f0f13;-webkit-font-smoothing:antialiased;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f5f5f9;padding:32px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,0.22);border:1px solid #e8e8ee;">

        <!-- Top dark band: hosted SVG logo + wordmark -->
        <tr>
          <td align="center" style="background:#0a0a0f;background:linear-gradient(180deg,#15151c 0%,#0a0a0f 100%);padding:22px 0;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto;">
              <tr>
                <td valign="middle" style="padding-right:10px;">
                  <img src="{base_url}/email-assets/ytg-logo-mark.svg" width="34" height="34" alt="YTGrowth"
                       style="display:block;border:0;outline:none;text-decoration:none;box-shadow:0 2px 10px rgba(255,59,48,0.45);">
                </td>
                <td valign="middle">
                  <span style="font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.6px;">YTGrowth<span style="color:#ff3b30;">.io</span></span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Inner certificate body — tinted gradient -->
        <tr>
          <td style="{body_bg}padding:0 56px 40px;">

            <!-- Composite V-drape ribbon + star badge — img src referencing
                 a hosted SVG so Gmail actually renders it (inline <svg> is stripped). -->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td align="center" style="padding-top:0;">
                  <img src="{medal_url}" width="200" height="200" alt="" style="display:block;margin:0 auto;border:0;outline:none;text-decoration:none;">
                </td>
              </tr>
            </table>

            <!-- Headline -->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td align="center" style="padding-top:10px;">
                  <h1 style="font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:34px;font-weight:900;color:#0f0f13;letter-spacing:-1.1px;line-height:1;margin:0;">Congratulations!</h1>
                  <p style="font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;color:#6a6a78;margin:10px 0 0 0;font-weight:500;letter-spacing:-0.1px;">You've reached {tier_str} {verb}</p>
                </td>
              </tr>
            </table>

            <!-- Hero stat -->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td align="center" style="padding-top:30px;">
                  <p style="font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:84px;font-weight:900;color:{cat['h2']};letter-spacing:-3px;line-height:0.95;margin:0;font-variant-numeric:tabular-nums;">{tier_str}</p>
                  <p style="font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:13px;font-weight:800;color:{cat['h2']};letter-spacing:0.18em;text-transform:uppercase;margin:12px 0 0 0;">{label}</p>
                </td>
              </tr>
            </table>

            <!-- Date ribbon — hosted SVG so the gradient covers the notched ends
                 exactly as the in-app clipPath does (CSS triangles can't be gradient). -->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td align="center" style="padding-top:30px;">
                  <img src="{date_ribbon_url}" width="{ribbon_w}" height="44" alt="Achieved {achieved_date}"
                       style="display:block;margin:0 auto;border:0;outline:none;text-decoration:none;">
                </td>
              </tr>
            </table>

            <!-- Channel identity -->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td align="center" style="padding-top:32px;">
                  <!-- position:relative div + position:absolute div (NOT table) for the badge.
                       Gmail ignores position:absolute on <table> elements but honours it on <div>. -->
                  <div style="position:relative;display:inline-block;width:68px;height:68px;">
                    {avatar_main}
                    <div style="position:absolute;bottom:-2px;right:-2px;width:22px;height:22px;background:#ff3b30;border-radius:5px;border:2px solid #ffffff;box-shadow:0 2px 5px rgba(0,0,0,0.2);">
                      <div style="width:0;height:0;border-top:5px solid transparent;border-bottom:5px solid transparent;border-left:9px solid #ffffff;margin:6px 0 0 6px;font-size:0;line-height:0;"></div>
                    </div>
                  </div>
                  <p style="font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:17px;font-weight:800;color:#0f0f13;letter-spacing:-0.3px;margin:10px 0 0 0;">{safe_name}</p>
                </td>
              </tr>
            </table>

            <!-- Footer watermark -->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top:30px;border-top:1px solid #ececf2;">
              <tr>
                <td align="center" style="padding-top:20px;">
                  <span style="font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:13px;font-weight:800;color:#0f0f13;letter-spacing:-0.2px;">YTGrowth.io</span>
                  <span style="color:#c8c8d0;font-size:14px;">&nbsp;&middot;&nbsp;</span>
                  <span style="font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;font-weight:600;color:#6a6a78;letter-spacing:0.02em;">YouTube Growth Analytics</span>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- Outer footer (unsubscribe) -->
        <tr>
          <td style="background:#ffffff;padding:18px 40px 24px;text-align:center;">
            <p style="font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;color:#9a9aa8;margin:0;line-height:1.55;">You're getting this because you unlocked a new milestone on YTGrowth.io. <a href="{unsubscribe_url}" style="color:#9a9aa8;text-decoration:underline;">Unsubscribe</a></p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>"""
