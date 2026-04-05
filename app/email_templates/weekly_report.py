"""HTML email builder for weekly reports."""


def _delta_html(metric: dict, unit: str = "", is_score: bool = False) -> str:
    """Render a delta badge: arrow + value in green/red/gray."""
    delta = metric.get("delta")
    direction = metric.get("direction", "flat")

    if delta is None:
        return '<span style="font-size:11px;font-weight:500;color:#9ca3af;">First report</span>'

    if direction == "flat":
        return '<span style="font-size:11px;font-weight:500;color:#9ca3af;">&#8594; No change</span>'

    if direction == "up":
        color = "#16a34a"
        arrow = "&#8593;"
        sign  = "+"
    else:
        color = "#e5251b"
        arrow = "&#8595;"
        sign  = ""

    if is_score:
        val = f"{sign}{int(delta)} pts"
    elif unit == "%":
        val = f"{sign}{abs(delta):.1f}%"
    else:
        val = f"{sign}{_fmt_num(abs(delta))}"

    return f'<span style="font-size:11px;font-weight:500;color:{color};">{arrow} {val}</span>'


def _fmt_num(n) -> str:
    if n is None:
        return "—"
    n = int(n)
    if n >= 1_000_000:
        return f"{n/1_000_000:.1f}M"
    if n >= 1_000:
        return f"{n/1_000:.1f}K"
    return f"{n:,}"


def _metric_card(label: str, value_str: str, delta_html: str) -> str:
    return f"""
      <td style="width:50%;padding:6px;">
        <div style="background:#f9fafb;border-radius:8px;padding:14px 16px;border:1px solid rgba(0,0,0,0.07);">
          <div style="font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">{label}</div>
          <div style="font-size:22px;font-weight:600;color:#111114;line-height:1;font-variant-numeric:tabular-nums;margin-bottom:5px;">{value_str}</div>
          <div>{delta_html}</div>
        </div>
      </td>"""


def build_email_html(report_data: dict, unsubscribe_token: str,
                     base_url: str, logo_url: str) -> str:
    channel_name  = report_data.get("channelName", "")
    thumb_url     = report_data.get("channelThumbnail", "")
    report_title  = report_data.get("reportTitle", "Your Week on YouTube")
    weekly_summary = report_data.get("weeklySummary", "")
    biggest_win   = report_data.get("biggestWin", "")
    watch_out     = report_data.get("watchOut", "")
    priority_action = report_data.get("priorityAction", "")
    motivational  = report_data.get("motivationalClose", "")
    metrics       = report_data.get("metrics", {})

    first_name = channel_name.split()[0] if channel_name else "there"

    # Dashboard CTA URL
    cta_url         = f"{base_url}/dashboard?tab=weekly-report"
    unsubscribe_url = f"{base_url}/unsubscribe?token={unsubscribe_token}"

    # ── Metric values ──────────────────────────────────────────────────────────
    subs_m   = metrics.get("subscribers", {})
    views_m  = metrics.get("weeklyViews", {})
    ctr_m    = metrics.get("avgCtr", {})
    score_m  = metrics.get("channelScore", {})

    subs_val  = _fmt_num(subs_m.get("value"))
    views_val = _fmt_num(views_m.get("value"))
    ctr_val   = f"{ctr_m.get('value')}%" if ctr_m.get("value") is not None else "N/A"
    score_val = f"{score_m.get('value')}/100" if score_m.get("value") is not None else "N/A"

    subs_delta  = _delta_html(subs_m)
    views_delta = _delta_html(views_m)
    ctr_delta   = _delta_html(ctr_m, unit="%")
    score_delta = _delta_html(score_m, is_score=True)

    # ── Channel avatar ─────────────────────────────────────────────────────────
    if thumb_url:
        avatar_html = (
            f'<img src="{thumb_url}" width="32" height="32" '
            f'style="border-radius:50%;vertical-align:middle;margin-right:8px;'
            f'display:inline-block;" alt="{channel_name}">'
        )
    else:
        initial = (channel_name[0].upper() if channel_name else "?")
        avatar_html = (
            f'<span style="display:inline-block;width:32px;height:32px;border-radius:50%;'
            f'background:#fef2f2;color:#e5251b;font-size:14px;font-weight:600;'
            f'text-align:center;line-height:32px;vertical-align:middle;margin-right:8px;">'
            f'{initial}</span>'
        )

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>{report_title}</title>
  <!--[if mso]><style>td{{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif!important}}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background:#f4f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f4f4f6;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- HEADER -->
        <tr>
          <td style="background:#ffffff;border-bottom:2px solid #e5251b;padding:24px 32px;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td>
                  <img src="{logo_url}" height="28" width="auto" alt="YTGrowth"
                       style="display:inline-block;vertical-align:middle;margin-right:16px;">
                  {avatar_html}
                  <span style="font-size:13px;color:#6b7280;vertical-align:middle;">{channel_name}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- GREETING -->
        <tr>
          <td style="padding:32px 32px 0;">
            <div style="font-size:16px;font-weight:600;color:#111114;margin-bottom:6px;">Hey {first_name},</div>
            <div style="font-size:13px;color:#9ca3af;">{report_title}</div>
          </td>
        </tr>

        <!-- METRICS GRID -->
        <tr>
          <td style="padding:24px 32px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                {_metric_card("Subscribers", subs_val, subs_delta)}
                {_metric_card("Weekly Views", views_val, views_delta)}
              </tr>
              <tr>
                {_metric_card("Avg CTR", ctr_val, ctr_delta)}
                {_metric_card("Channel Score", score_val, score_delta)}
              </tr>
            </table>
          </td>
        </tr>

        <!-- WEEKLY SUMMARY -->
        <tr>
          <td style="padding:24px 32px 0;">
            <div style="font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">This Week</div>
            <div style="font-size:15px;color:#374151;line-height:1.7;">{weekly_summary}</div>
          </td>
        </tr>

        <!-- BIGGEST WIN -->
        <tr>
          <td style="padding:20px 32px 0;">
            <div style="border-left:3px solid #16a34a;padding-left:16px;">
              <div style="font-size:10px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">Biggest Win</div>
              <div style="font-size:14px;color:#374151;line-height:1.6;">{biggest_win}</div>
            </div>
          </td>
        </tr>

        <!-- WATCH OUT -->
        <tr>
          <td style="padding:16px 32px 0;">
            <div style="border-left:3px solid #f59e0b;padding-left:16px;">
              <div style="font-size:10px;font-weight:700;color:#d97706;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">Watch Out</div>
              <div style="font-size:14px;color:#374151;line-height:1.6;">{watch_out}</div>
            </div>
          </td>
        </tr>

        <!-- PRIORITY ACTION -->
        <tr>
          <td style="padding:24px 32px 0;">
            <div style="background:#fef2f2;border-radius:10px;border:1px solid rgba(229,37,27,0.15);padding:20px;">
              <div style="font-size:10px;font-weight:700;color:#e5251b;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Your Priority This Week</div>
              <div style="font-size:15px;font-weight:500;color:#111114;line-height:1.7;">{priority_action}</div>
            </div>
          </td>
        </tr>

        <!-- MOTIVATIONAL CLOSE -->
        <tr>
          <td style="padding:24px 32px 0;">
            <div style="font-size:14px;color:#6b7280;line-height:1.6;">{motivational}</div>
          </td>
        </tr>

        <!-- CTA BUTTON -->
        <tr>
          <td style="padding:24px 32px;">
            <a href="{cta_url}"
               style="display:block;background:#e5251b;color:#ffffff;border-radius:8px;padding:14px;font-size:14px;font-weight:600;text-align:center;text-decoration:none;">
              View Full Report in YTGrowth &#8594;
            </a>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid rgba(0,0,0,0.07);background:#f9fafb;">
            <div style="font-size:12px;color:#9ca3af;line-height:1.6;">
              You're receiving this because you connected your YouTube channel to YTGrowth.
            </div>
            <div style="font-size:12px;color:#9ca3af;margin-top:4px;line-height:1.6;">
              YTGrowth &middot; ytgrowth.io
            </div>
            <div style="margin-top:8px;">
              <a href="{unsubscribe_url}"
                 style="font-size:12px;color:#9ca3af;text-decoration:underline;">
                Unsubscribe from weekly reports
              </a>
            </div>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

</body>
</html>"""
