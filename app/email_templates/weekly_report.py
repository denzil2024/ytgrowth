"""Weekly report email — sent every week to active users.

Plain text canonical, minimal HTML mirror with NO inline styles. Same
design language as the welcome emails: reads like a note from the founder,
not a dashboard UI dropped into an email.

Metrics are presented as a simple inline line rather than styled card
blocks. Sections (summary, biggest win, watch out, priority action) are
plain paragraphs with bold labels.
"""


def _fmt_num(n) -> str:
    if n is None:
        return "N/A"
    n = int(n)
    if n >= 1_000_000:
        return f"{n/1_000_000:.1f}M"
    if n >= 1_000:
        return f"{n/1_000:.1f}K"
    return f"{n:,}"


def _delta(metric: dict, unit: str = "", is_score: bool = False) -> str:
    """Return a short delta string like '+320' or '-1.2%' or '' if flat/missing."""
    delta = metric.get("delta")
    direction = metric.get("direction", "flat")
    if delta is None or direction == "flat":
        return ""
    sign = "+" if direction == "up" else ""
    if is_score:
        return f" ({sign}{int(delta)} pts)"
    if unit == "%":
        return f" ({sign}{abs(delta):.1f}%)"
    return f" ({sign}{_fmt_num(abs(delta))})"


def _delta_text(metric: dict, unit: str = "", is_score: bool = False) -> str:
    """Plain-text delta: '+320' / '-1.2%' / 'no change' / 'first report'."""
    delta = metric.get("delta")
    direction = metric.get("direction", "flat")
    if delta is None:
        return " (first report)"
    if direction == "flat":
        return ""
    sign = "+" if direction == "up" else "-"
    if is_score:
        return f" ({sign}{abs(int(delta))} pts)"
    if unit == "%":
        return f" ({sign}{abs(delta):.1f}%)"
    return f" ({sign}{_fmt_num(abs(delta))})"


def build_email(
    report_data: dict,
    unsubscribe_token: str,
    base_url: str,
    logo_url: str = "",
) -> tuple[str, str]:
    """Returns (text, html). Text is canonical."""

    channel_name    = report_data.get("channelName", "")
    report_title    = report_data.get("reportTitle", "Your week on YouTube")
    weekly_summary  = report_data.get("weeklySummary", "")
    biggest_win     = report_data.get("biggestWin", "")
    watch_out       = report_data.get("watchOut", "")
    priority_action = report_data.get("priorityAction", "")
    motivational    = report_data.get("motivationalClose", "")
    metrics         = report_data.get("metrics", {})

    # Prefer the user's actual first name when the sender injected it;
    # fall back to first word of channel name.
    first_name = (
        report_data.get("firstName") or
        (channel_name.split()[0] if channel_name else "") or
        "there"
    )

    dashboard_url   = f"{base_url}/dashboard?tab=weekly-report"
    unsubscribe_url = f"{base_url}/unsubscribe?token={unsubscribe_token}"

    # ── Metrics line ──────────────────────────────────────────────────────
    subs_m  = metrics.get("subscribers", {})
    views_m = metrics.get("weeklyViews", {})
    ctr_m   = metrics.get("avgCtr", {})
    score_m = metrics.get("channelScore", {})

    subs_val  = _fmt_num(subs_m.get("value"))
    views_val = _fmt_num(views_m.get("value"))
    ctr_val   = f"{ctr_m.get('value')}%" if ctr_m.get("value") is not None else "N/A"
    score_val = f"{score_m.get('value')}/100" if score_m.get("value") is not None else "N/A"

    subs_delta  = _delta_text(subs_m)
    views_delta = _delta_text(views_m)
    ctr_delta   = _delta_text(ctr_m, unit="%")
    score_delta = _delta_text(score_m, is_score=True)

    metrics_line_text = (
        f"Subscribers: {subs_val}{subs_delta}  |  "
        f"Views: {views_val}{views_delta}  |  "
        f"CTR: {ctr_val}{ctr_delta}  |  "
        f"Score: {score_val}{score_delta}"
    )

    # ── Optional sections (only included when the report has data) ────────
    summary_text     = f"This week\n\n{weekly_summary}\n\n" if weekly_summary else ""
    biggest_win_text = f"Biggest win\n\n{biggest_win}\n\n"  if biggest_win    else ""
    watch_out_text   = f"Watch out\n\n{watch_out}\n\n"       if watch_out      else ""
    priority_text    = f"Priority this week\n\n{priority_action}\n\n" if priority_action else ""
    motivational_text= f"{motivational}\n\n"                  if motivational   else ""

    def esc(s: str) -> str:
        return (s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    summary_html     = f"<p><strong>This week</strong></p><p>{esc(weekly_summary)}</p>"   if weekly_summary else ""
    biggest_win_html = f"<p><strong>Biggest win</strong></p><p>{esc(biggest_win)}</p>"    if biggest_win    else ""
    watch_out_html   = f"<p><strong>Watch out</strong></p><p>{esc(watch_out)}</p>"         if watch_out      else ""
    priority_html    = f"<p><strong>Priority this week</strong></p><p>{esc(priority_action)}</p>" if priority_action else ""
    motivational_html= f"<p>{esc(motivational)}</p>"                                        if motivational   else ""

    text = (
        f"Hey {first_name},\n\n"
        f"{report_title}\n\n"
        f"{metrics_line_text}\n\n"
        f"{summary_text}"
        f"{biggest_win_text}"
        f"{watch_out_text}"
        f"{priority_text}"
        f"{motivational_text}"
        f"{dashboard_url}\n\n"
        f"If you're finding YTGrowth useful, an upvote on Product Hunt helps "
        f"other creators find us.\n\n"
        f"https://www.producthunt.com/products/ytgrowth\n\n"
        f"- Denzil\n"
        f"Founder of YTGrowth\n\n"
        f"---\n"
        f"Unsubscribe: {unsubscribe_url}\n"
    )

    html = (
        f"<p>Hey {esc(first_name)},</p>"
        f"<p>{esc(report_title)}</p>"
        f"<p><strong>Subscribers:</strong> {subs_val}{esc(subs_delta)} &nbsp;&nbsp;"
        f"<strong>Views:</strong> {views_val}{esc(views_delta)} &nbsp;&nbsp;"
        f"<strong>CTR:</strong> {ctr_val}{esc(ctr_delta)} &nbsp;&nbsp;"
        f"<strong>Score:</strong> {score_val}{esc(score_delta)}</p>"
        f"{summary_html}"
        f"{biggest_win_html}"
        f"{watch_out_html}"
        f"{priority_html}"
        f"{motivational_html}"
        f"<p><a href=\"{dashboard_url}\">View full report &rarr;</a></p>"
        f"<p>- <strong>Denzil</strong><br>Founder of YTGrowth</p>"
        f"<p style=\"color:#666;\">If you're finding YTGrowth useful, "
        f"<a href=\"https://www.producthunt.com/products/ytgrowth\">"
        f"an upvote on Product Hunt</a> helps other creators find us.</p>"
        f"<hr>"
        f"<p><small><a href=\"{unsubscribe_url}\">Unsubscribe from weekly reports</a></small></p>"
    )

    return text, html


# Backward-compat shim for existing call site in app/weekly_report.py
def build_email_html(report_data: dict, unsubscribe_token: str,
                     base_url: str, logo_url: str = "") -> str:
    _, html = build_email(report_data, unsubscribe_token, base_url, logo_url)
    return html
