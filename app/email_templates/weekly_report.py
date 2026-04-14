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
    return f"""<td class="metrics-cell" style="width:48%;padding:3px;vertical-align:top;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="background:#f7f7fa;border-radius:12px;border:1px solid rgba(0,0,0,0.07);padding:18px 20px;">
                      <div style="font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">{label}</div>
                      <div style="font-size:28px;font-weight:800;color:#111114;letter-spacing:-1px;line-height:1;margin-bottom:6px;">{value_str}</div>
                      <div>{delta_html}</div>
                    </td>
                  </tr>
                </table>
              </td>"""


def build_email_html(report_data: dict, unsubscribe_token: str,
                     base_url: str, logo_url: str) -> str:
    channel_name     = report_data.get("channelName", "")
    thumb_url        = report_data.get("channelThumbnail", "")
    report_title     = report_data.get("reportTitle", "Your Week on YouTube")
    weekly_summary   = report_data.get("weeklySummary", "")
    biggest_win      = report_data.get("biggestWin", "")
    watch_out        = report_data.get("watchOut", "")
    priority_action  = report_data.get("priorityAction", "")
    motivational     = report_data.get("motivationalClose", "")
    metrics          = report_data.get("metrics", {})

    first_name = channel_name.split()[0] if channel_name else "there"

    cta_url         = f"{base_url}/dashboard?tab=weekly-report"
    unsubscribe_url = f"{base_url}/unsubscribe?token={unsubscribe_token}"

    # ── Metric values ──────────────────────────────────────────────────────────
    subs_m  = metrics.get("subscribers", {})
    views_m = metrics.get("weeklyViews", {})
    ctr_m   = metrics.get("avgCtr", {})
    score_m = metrics.get("channelScore", {})

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
        initial = channel_name[0].upper() if channel_name else "?"
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
  <style>
    @media only screen and (max-width: 600px) {{
      .metrics-cell {{
        width: 100% !important;
        display: block !important;
      }}
      .outer-pad {{
        padding-left: 24px !important;
        padding-right: 24px !important;
      }}
    }}
  </style>
</head>
<body style="margin:0;padding:0;background:#f0f0f3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f0f0f3;padding:32px 0;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">

        <!-- ── 1. HEADER BAND ── -->
        <tr>
          <td class="outer-pad" style="background:#ffffff;border-bottom:3px solid #e5251b;padding:32px 40px 24px;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
              <!-- Logo row — alone -->
              <tr>
                <td>
                  <img src="{logo_url}" height="24" width="auto" alt="YTGrowth"
                       style="display:block;">
                </td>
              </tr>
              <!-- 12px gap -->
              <tr><td style="height:12px;font-size:0;line-height:0;">&nbsp;</td></tr>
              <!-- Channel identity row -->
              <tr>
                <td>
                  {avatar_html}<span style="font-size:14px;font-weight:600;color:#111114;vertical-align:middle;">{channel_name}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── 2. REPORT TITLE BAND ── -->
        <tr>
          <td class="outer-pad" style="background:#fafafa;border-bottom:1px solid #f0f0f3;padding:20px 40px;">
            <div style="font-size:22px;font-weight:800;color:#111114;letter-spacing:-0.5px;">Hey {first_name},</div>
            <div style="font-size:13px;color:#9ca3af;margin-top:4px;">{report_title}</div>
          </td>
        </tr>

        <!-- ── 3. METRICS BAND ── -->
        <tr>
          <td class="outer-pad" style="background:#ffffff;padding:32px 40px;">
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

        <!-- ── 4. DIVIDER ── -->
        <tr>
          <td style="padding:0 40px;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
              <tr><td style="border-top:1px solid #f0f0f3;font-size:0;line-height:0;">&nbsp;</td></tr>
            </table>
          </td>
        </tr>

        <!-- ── 5. THIS WEEK SECTION ── -->
        <tr>
          <td class="outer-pad" style="padding:32px 40px 0;">
            <div style="font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px;">This Week</div>
            <div style="font-size:15px;color:#374151;line-height:1.8;">{weekly_summary}</div>
          </td>
        </tr>

        <!-- ── 6. BIGGEST WIN ── -->
        <tr>
          <td class="outer-pad" style="padding:24px 40px 0;">
            <div style="border-left:3px solid #16a34a;padding-left:16px;">
              <div style="font-size:10px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">Biggest Win</div>
              <div style="font-size:14px;color:#374151;line-height:1.7;">{biggest_win}</div>
            </div>
          </td>
        </tr>

        <!-- ── 7. WATCH OUT ── -->
        <tr>
          <td class="outer-pad" style="padding:16px 40px 0;">
            <div style="border-left:3px solid #f59e0b;padding-left:16px;">
              <div style="font-size:10px;font-weight:700;color:#d97706;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">Watch Out</div>
              <div style="font-size:14px;color:#374151;line-height:1.7;">{watch_out}</div>
            </div>
          </td>
        </tr>

        <!-- ── 8. PRIORITY ACTION BAND ── -->
        <tr>
          <td class="outer-pad" style="padding:32px 40px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="background:#fff5f5;border-radius:14px;border:1px solid rgba(229,37,27,0.15);padding:24px;">
                  <div style="font-size:10px;font-weight:700;color:#e5251b;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">Your Priority This Week</div>
                  <div style="font-size:15px;font-weight:500;color:#111114;line-height:1.75;">{priority_action}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── 9. MOTIVATIONAL CLOSE ── -->
        <tr>
          <td class="outer-pad" style="padding:24px 40px 0;">
            <div style="font-size:14px;color:#6b7280;line-height:1.7;">{motivational}</div>
          </td>
        </tr>

        <!-- ── 10. CTA BUTTON ── -->
        <tr>
          <td class="outer-pad" style="padding:32px 40px;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td>
                  <a href="{cta_url}"
                     style="display:block;background:#e5251b;color:#ffffff;border-radius:10px;padding:16px;font-size:15px;font-weight:700;text-align:center;text-decoration:none;letter-spacing:-0.2px;">
                    View Full Report in YTGrowth &#8594;
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── 11. FOOTER BAND ── -->
        <tr>
          <td class="outer-pad" style="background:#f7f7fa;border-top:1px solid #f0f0f3;padding:24px 40px;">
            <div style="font-size:12px;color:#9ca3af;">YTGrowth &middot; ytgrowth.io</div>
            <div style="font-size:12px;color:#9ca3af;margin-top:4px;line-height:1.6;">
              You're receiving this because you connected your YouTube channel to YTGrowth.
            </div>
            <div style="margin-top:12px;">
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
