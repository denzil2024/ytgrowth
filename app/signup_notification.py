"""Internal admin notification when a new user signs up.

Called once per new UserAccount from /auth/callback in a background thread,
so OAuth response time is never affected by Resend latency. Silent on error.
"""

import os
import datetime


ADMIN_NOTIFY_EMAIL = os.environ.get("ADMIN_NOTIFY_EMAIL", "signups@ytgrowth.io")


def _row(label: str, value: str) -> str:
    return (
        f"<tr>"
        f"<td style='padding:6px 16px 6px 0;color:#9595a4;font-size:12px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;vertical-align:top;white-space:nowrap'>{label}</td>"
        f"<td style='padding:6px 0;color:#111114;font-size:14px;font-weight:500'>{value}</td>"
        f"</tr>"
    )


def notify_new_signup(
    email: str,
    name: str,
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

    signed_up = datetime.datetime.utcnow().strftime("%b %d, %Y · %H:%M UTC")
    display = name or email.split("@")[0]

    rows = [
        _row("Name",       display),
        _row("Email",      email),
        _row("Signed up",  signed_up),
    ]

    utm_pairs = [
        ("Source",   utm_source),
        ("Medium",   utm_medium),
        ("Campaign", utm_campaign),
        ("Content",  utm_content),
        ("Term",     utm_term),
    ]
    has_utms = any(v for _, v in utm_pairs)
    if has_utms:
        for label, val in utm_pairs:
            if val:
                rows.append(_row(label, val))
    else:
        rows.append(_row("Source", "<span style='color:#9595a4;font-weight:400'>direct / untracked</span>"))

    rows_html = "".join(rows)

    html = f"""\
<!doctype html>
<html>
<body style="margin:0;padding:32px 16px;background:#f4f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e6e6ec;border-radius:14px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 4px 16px rgba(0,0,0,0.06);">
    <div style="padding:24px 28px 8px;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#e5251b;">New signup</p>
      <h1 style="margin:0 0 4px;font-size:20px;font-weight:800;color:#111114;letter-spacing:-0.4px;">{display}</h1>
      <p style="margin:0;font-size:14px;color:#52525b;">{email}</p>
    </div>
    <div style="padding:16px 28px 24px;border-top:1px solid #f0f0f3;margin-top:16px;">
      <table cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;">
        {rows_html}
      </table>
    </div>
  </div>
  <p style="max-width:480px;margin:14px auto 0;text-align:center;font-size:11px;color:#9595a4;">YTGrowth · internal notification</p>
</body>
</html>
"""

    subject = f"New signup: {display}"
    if utm_source:
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
