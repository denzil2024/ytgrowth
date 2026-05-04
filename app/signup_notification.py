"""Internal admin notification when a new user signs up.

Called once per new UserAccount from /auth/callback in a background thread,
so OAuth response time is never affected by Resend latency. Silent on error.
"""

import os
import datetime


ADMIN_NOTIFY_EMAIL = os.environ.get("ADMIN_NOTIFY_EMAIL", "signups@ytgrowth.io")

COUNTRY_FLAGS = {
    "Afghanistan": "🇦🇫", "Albania": "🇦🇱", "Algeria": "🇩🇿", "Argentina": "🇦🇷",
    "Australia": "🇦🇺", "Austria": "🇦🇹", "Bangladesh": "🇧🇩", "Belgium": "🇧🇪",
    "Brazil": "🇧🇷", "Canada": "🇨🇦", "Chile": "🇨🇱", "China": "🇨🇳",
    "Colombia": "🇨🇴", "Croatia": "🇭🇷", "Czech Republic": "🇨🇿", "Denmark": "🇩🇰",
    "Egypt": "🇪🇬", "Ethiopia": "🇪🇹", "Finland": "🇫🇮", "France": "🇫🇷",
    "Germany": "🇩🇪", "Ghana": "🇬🇭", "Greece": "🇬🇷", "Hungary": "🇭🇺",
    "India": "🇮🇳", "Indonesia": "🇮🇩", "Iran": "🇮🇷", "Iraq": "🇮🇶",
    "Ireland": "🇮🇪", "Israel": "🇮🇱", "Italy": "🇮🇹", "Japan": "🇯🇵",
    "Jordan": "🇯🇴", "Kenya": "🇰🇪", "Malaysia": "🇲🇾", "Mexico": "🇲🇽",
    "Morocco": "🇲🇦", "Netherlands": "🇳🇱", "New Zealand": "🇳🇿", "Nigeria": "🇳🇬",
    "Norway": "🇳🇴", "Pakistan": "🇵🇰", "Peru": "🇵🇪", "Philippines": "🇵🇭",
    "Poland": "🇵🇱", "Portugal": "🇵🇹", "Romania": "🇷🇴", "Russia": "🇷🇺",
    "Saudi Arabia": "🇸🇦", "Serbia": "🇷🇸", "Singapore": "🇸🇬", "South Africa": "🇿🇦",
    "South Korea": "🇰🇷", "Spain": "🇪🇸", "Sri Lanka": "🇱🇰", "Sweden": "🇸🇪",
    "Switzerland": "🇨🇭", "Taiwan": "🇹🇼", "Tanzania": "🇹🇿", "Thailand": "🇹🇭",
    "Turkey": "🇹🇷", "Uganda": "🇺🇬", "Ukraine": "🇺🇦", "United Arab Emirates": "🇦🇪",
    "United Kingdom": "🇬🇧", "United States": "🇺🇸", "Venezuela": "🇻🇪",
    "Vietnam": "🇻🇳", "Zimbabwe": "🇿🇼",
}


def _lookup_country(ip: str) -> tuple[str, str]:
    """Return (country_name, city) from IP using ip-api.com (free, no key needed).
    Returns ('', '') on failure."""
    if not ip or ip in ("127.0.0.1", "::1"):
        return "", ""
    try:
        import urllib.request, json
        url = f"http://ip-api.com/json/{ip}?fields=status,country,city"
        with urllib.request.urlopen(url, timeout=3) as resp:
            data = json.loads(resp.read())
        if data.get("status") == "success":
            return data.get("country", ""), data.get("city", "")
    except Exception:
        pass
    return "", ""


def notify_new_signup(
    email: str,
    name: str,
    ip_address: str = "",
    utm_source: str | None = None,
    utm_medium: str | None = None,
    utm_campaign: str | None = None,
    utm_content: str | None = None,
    utm_term: str | None = None,
) -> None:
    api_key = os.environ.get("RESEND_API_KEY", "")
    if not api_key or not email:
        return

    try:
        import resend as _resend
        _resend.api_key = api_key
    except Exception as e:
        print(f"[signup_notify] resend import error: {e}")
        return

    signed_up  = datetime.datetime.utcnow().strftime("%b %d, %Y · %H:%M UTC")
    display    = name or email.split("@")[0]
    initial    = display[0].upper() if display else "?"

    country, city = _lookup_country(ip_address)
    flag          = COUNTRY_FLAGS.get(country, "🌍")

    # Persist country on the UserAccount row (fire-and-forget, already in bg thread)
    if country and email:
        try:
            from database.models import SessionLocal, UserAccount
            _db = SessionLocal()
            try:
                _acct = _db.query(UserAccount).filter_by(email=email).first()
                if _acct and not _acct.country:
                    _acct.country = country
                    _db.commit()
            finally:
                _db.close()
        except Exception as _ce:
            print(f"[signup_notify] country save error: {_ce}")
    location_str  = ""
    if city and country:
        location_str = f"{city}, {country}"
    elif country:
        location_str = country

    # Avatar colour — deterministic from first letter
    avatar_colours = ["#e5251b", "#2563eb", "#059669", "#eab308", "#7c3aed", "#db2777"]
    avatar_bg = avatar_colours[ord(initial.lower()) % len(avatar_colours)]

    # UTM block
    utm_pairs = [
        ("Source",   utm_source),
        ("Medium",   utm_medium),
        ("Campaign", utm_campaign),
        ("Content",  utm_content),
        ("Term",     utm_term),
    ]
    has_utms = any(v for _, v in utm_pairs)

    def pill(text: str, color: str = "#e5251b") -> str:
        return (
            f"<span style='display:inline-block;padding:3px 10px;background:{color}15;"
            f"color:{color};font-size:11px;font-weight:700;border-radius:20px;"
            f"letter-spacing:0.03em;'>{text}</span>"
        )

    def meta_row(icon: str, label: str, value: str) -> str:
        return (
            f"<tr>"
            f"<td style='padding:5px 14px 5px 0;color:#9595a4;font-size:12px;"
            f"font-weight:600;letter-spacing:0.04em;text-transform:uppercase;"
            f"vertical-align:top;white-space:nowrap;width:1%;'>{icon}&nbsp;{label}</td>"
            f"<td style='padding:5px 0;color:#111114;font-size:13px;font-weight:500;"
            f"vertical-align:top;'>{value}</td>"
            f"</tr>"
        )

    utm_rows = ""
    if has_utms:
        for label, val in utm_pairs:
            if val:
                utm_rows += meta_row("→", label, f"<strong>{val}</strong>")
    else:
        utm_rows = meta_row("→", "Source", "<span style='color:#9595a4;'>direct / untracked</span>")

    location_html = ""
    if location_str:
        location_html = f"<span style='font-size:20px;line-height:1;'>{flag}</span> <span style='font-size:13px;color:#52525b;font-weight:500;'>{location_str}</span>"
    else:
        location_html = "<span style='font-size:13px;color:#9595a4;'>Location unknown</span>"

    html = f"""\
<!doctype html>
<html>
<body style="margin:0;padding:32px 16px;background:#f0f0f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">

  <div style="max-width:460px;margin:0 auto;">

    <!-- Card -->
    <div style="background:#ffffff;border:1px solid #e2e2ea;border-radius:16px;overflow:hidden;box-shadow:0 2px 6px rgba(0,0,0,0.04),0 8px 24px rgba(0,0,0,0.07);">

      <!-- Header -->
      <div style="background:linear-gradient(135deg,#0f0f13 0%,#1e1e28 100%);padding:24px 28px;">
        <p style="margin:0 0 16px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#e5251b;">New signup</p>
        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="vertical-align:middle;padding-right:14px;">
              <!-- Avatar -->
              <div style="width:48px;height:48px;border-radius:50%;background:{avatar_bg};color:#ffffff;font-size:22px;font-weight:800;text-align:center;line-height:48px;">{initial}</div>
            </td>
            <td style="vertical-align:middle;">
              <p style="margin:0 0 3px;font-size:18px;font-weight:800;color:#ffffff;letter-spacing:-0.3px;">{display}</p>
              <p style="margin:0;font-size:13px;color:#9595a4;">{email}</p>
            </td>
          </tr>
        </table>
      </div>

      <!-- Location strip -->
      <div style="padding:14px 28px;background:#fafafa;border-bottom:1px solid #f0f0f3;display:block;">
        {location_html}
      </div>

      <!-- Meta rows -->
      <div style="padding:18px 28px 22px;">
        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;">
          {meta_row("🕐", "Signed up", signed_up)}
          {utm_rows}
        </table>
      </div>

      <!-- CTA -->
      <div style="padding:0 28px 24px;">
        <a href="https://ytgrowth.io/admin" style="display:inline-block;background:#e5251b;color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;padding:10px 20px;border-radius:8px;">View in Admin →</a>
      </div>

    </div>

    <p style="margin:14px 0 0;text-align:center;font-size:11px;color:#9595a4;">YTGrowth · internal notification</p>

  </div>
</body>
</html>
"""

    subject = f"🆕 {display} just signed up"
    if location_str:
        subject += f" · {flag} {location_str}"
    elif utm_source:
        subject += f" · {utm_source}"

    try:
        _resend.Emails.send({
            "from":    "YTGrowth Signups <hello@ytgrowth.io>",
            "to":      [ADMIN_NOTIFY_EMAIL],
            "subject": subject,
            "html":    html,
        })
    except Exception as e:
        print(f"[signup_notify] Resend error: {e}")
