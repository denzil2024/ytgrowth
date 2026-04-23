import { useState, useEffect } from 'react'

// ─── persistence ──────────────────────────────────────────────────────────────
const LS_KEY = 'ytgrowth_tracked_competitors'
function loadTracked() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] }
}
function saveTracked(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(list))
}

// ─── inject font + styles once ────────────────────────────────────────────────
function useCompetitorStyles() {
  useEffect(() => {
    if (document.getElementById('ytg-comp-styles')) return

    const style = document.createElement('style')
    style.id = 'ytg-comp-styles'
    style.textContent = `
      .comp-page * { box-sizing: border-box; font-family: 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
      .comp-page p, .comp-page span, .comp-page div { margin: 0; }

      /* ── cards — system elevation, no hover lift (matches Dashboard/Keywords/Outliers) ── */
      .comp-card {
        background: #ffffff;
        border: 1px solid #e6e6ec;
        border-radius: 16px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06);
      }

      .comp-channel-card {
        background: #ffffff;
        border: 1px solid #e6e6ec;
        border-radius: 16px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06);
        padding: 14px 18px;
        display: flex;
        align-items: center;
        gap: 14px;
        margin-bottom: 8px;
        transition: border-color 0.15s;
      }
      .comp-channel-card:hover { border-color: rgba(0,0,0,0.14); }

      /* ── tabs ── */
      .comp-tab-btn {
        padding: 9px 22px;
        border-radius: 100px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: color 0.15s, border-color 0.15s, background 0.15s;
        font-family: 'Inter', system-ui, sans-serif;
        border: 1px solid transparent;
        white-space: nowrap;
        letter-spacing: -0.1px;
      }
      .comp-tab-btn.active {
        background: #111114;
        color: #fff;
        border-color: #111114;
      }
      .comp-tab-btn.inactive {
        background: #ffffff;
        color: #52525b;
        border-color: rgba(0,0,0,0.09);
        box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      }
      .comp-tab-btn.inactive:hover {
        color: #111114;
        border-color: rgba(0,0,0,0.18);
      }

      /* ── inputs ── */
      .comp-input {
        flex: 1;
        padding: 11px 20px;
        border-radius: 100px;
        border: 1px solid rgba(0,0,0,0.12);
        background: #ffffff;
        font-size: 13.5px;
        font-family: 'Inter', system-ui, sans-serif;
        outline: none;
        transition: border-color 0.18s, box-shadow 0.18s;
        color: #111114;
      }
      .comp-input::placeholder { color: #a0a0b0; font-weight: 400; }
      .comp-input:focus { border-color: rgba(0,0,0,0.3); box-shadow: 0 0 0 3px rgba(0,0,0,0.04); }

      /* ── primary red CTA — reserved for Search / Analyze ── */
      .comp-btn-primary {
        background: #e5251b;
        color: #fff;
        border: none;
        border-radius: 100px;
        padding: 11px 26px;
        font-size: 13px;
        font-weight: 700;
        font-family: 'Inter', system-ui, sans-serif;
        cursor: pointer;
        white-space: nowrap;
        transition: filter 0.15s;
        letter-spacing: -0.1px;
      }
      .comp-btn-primary:hover:not(:disabled) { filter: brightness(1.07); }
      .comp-btn-primary:disabled { background: #e0e0e6; color: #a0a0b0; cursor: default; }

      /* "Remove" — trash icon, appears on wrapper hover only */
      .comp-remove-btn {
        position: absolute;
        top: 12px;
        right: 12px;
        width: 28px;
        height: 28px;
        border-radius: 8px;
        border: 1px solid transparent;
        background: transparent;
        color: #c4c4cc;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.18s, background 0.15s, color 0.15s, border-color 0.15s;
        z-index: 2;
        flex-shrink: 0;
      }
      .comp-accordion-wrapper:hover .comp-remove-btn { opacity: 1; }
      .comp-remove-btn:hover {
        background: rgba(229,37,27,0.08);
        border-color: rgba(229,37,27,0.2);
        color: #e5251b;
      }

      /* "Open report" — red CTA (buttons are always red; matches Dashboard's
         primary action affordance). When open, switches to an outlined red
         "Close" so it reads as toggled-on without competing with the body. */
      .comp-btn-report {
        background: #e5251b;
        color: #fff;
        border: 1px solid #e5251b;
        border-radius: 100px;
        padding: 8px 18px;
        font-size: 12.5px;
        font-weight: 700;
        font-family: 'Inter', system-ui, sans-serif;
        cursor: pointer;
        white-space: nowrap;
        transition: filter 0.15s, background 0.15s, color 0.15s, box-shadow 0.15s;
        display: flex;
        align-items: center;
        gap: 6px;
        letter-spacing: -0.1px;
        box-shadow: 0 1px 3px rgba(229,37,27,0.18), 0 4px 12px rgba(229,37,27,0.18);
      }
      .comp-btn-report:hover { filter: brightness(1.07); }
      .comp-btn-report.open {
        background: #fff;
        color: #e5251b;
        border-color: #fecaca;
        box-shadow: none;
      }
      .comp-btn-report.open:hover { background: #fff5f5; filter: none; }

      /* stat chips inside accordion header */
      .comp-stat-chip {
        display: inline-flex;
        align-items: baseline;
        gap: 4px;
        background: #f4f4f6;
        border: 1px solid rgba(0,0,0,0.09);
        border-radius: 8px;
        padding: 4px 10px;
      }
      .comp-stat-chip .val {
        font-size: 12.5px;
        font-weight: 800;
        color: #111114;
        line-height: 1;
      }
      .comp-stat-chip .lbl {
        font-size: 10.5px;
        font-weight: 500;
        color: #a0a0b0;
        line-height: 1;
      }

      /* inner content blocks (video ideas, etc.) */
      .comp-inner-block {
        background: #f7f7fa;
        border: 1px solid rgba(0,0,0,0.07);
        border-radius: 12px;
        padding: 14px 18px;
        transition: background 0.15s;
      }
      .comp-inner-block:hover { background: #f0f0f4; }

      /* tags — neutral chip by default; variants use inline amber palette */
      .comp-tag {
        display: inline-block;
        padding: 3px 10px;
        border-radius: 50px;
        font-size: 11px;
        font-weight: 600;
        font-family: 'Inter', system-ui, sans-serif;
        letter-spacing: 0;
      }

      /* video rows */
      .comp-video-row {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 10px 6px;
        border-radius: 12px;
        text-decoration: none;
        transition: background 0.15s;
      }
      .comp-video-row:hover { background: #f4f4f7; }

      /* posting timing pills */
      .comp-timing-pill {
        background: #f7f7fa;
        border: 1px solid rgba(0,0,0,0.07);
        border-radius: 12px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
      }

      /* insight mini-cards */
      .comp-insight-card {
        background: #f7f7fa;
        border: 1px solid rgba(0,0,0,0.07);
        border-radius: 12px;
        padding: 16px 18px;
      }

      /* accordion */
      .comp-accordion-header {
        background: #ffffff;
        border: 1px solid #e6e6ec;
        box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06);
        padding: 16px 20px;
        display: flex;
        align-items: center;
        gap: 16px;
        transition: box-shadow 0.15s, border-color 0.15s;
        cursor: pointer;
        user-select: none;
      }
      .comp-accordion-header:hover {
        box-shadow: 0 2px 6px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08);
        border-color: rgba(0,0,0,0.14);
      }
      .comp-accordion-header.closed { border-radius: 16px; }
      .comp-accordion-header.open   { border-radius: 16px 16px 0 0; border-bottom-color: rgba(0,0,0,0.07); }

      .comp-accordion-body {
        border: 1px solid #e6e6ec;
        border-top: none;
        border-radius: 0 0 16px 16px;
        background: #f8f8fb;
        padding: 24px 20px 28px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06);
      }

      /* section divider */
      .comp-section-sep {
        height: 1px;
        background: rgba(0,0,0,0.06);
        margin: 20px 0;
        border: none;
      }

      /* empty states */
      .comp-empty-state {
        text-align: center;
        padding: 64px 0;
        color: #a0a0b0;
      }

      /* section title label above card */
      .comp-card-label {
        font-size: 10.5px;
        font-weight: 700;
        color: #a0a0b0;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        margin-bottom: 5px;
      }

      /* neutral elevated pill — used for per-row secondary actions (Analyze),
         since red filled is reserved for the page's primary CTA (Search). */
      .comp-btn-ghost {
        background: #ffffff;
        color: #111114;
        border: 1px solid rgba(0,0,0,0.09);
        border-radius: 100px;
        padding: 9px 22px;
        font-size: 13px;
        font-weight: 700;
        font-family: 'Inter', system-ui, sans-serif;
        cursor: pointer;
        white-space: nowrap;
        box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.05);
        transition: box-shadow 0.18s, transform 0.12s;
        letter-spacing: -0.1px;
      }
      .comp-btn-ghost:hover {
        box-shadow: 0 2px 6px rgba(0,0,0,0.07), 0 8px 20px rgba(0,0,0,0.08);
        transform: translateY(-1px);
      }

      /* custom checkbox for Topics to tackle */
      .comp-check {
        appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 5px;
        border: 1.5px solid rgba(0,0,0,0.18);
        background: #fff;
        cursor: pointer;
        flex-shrink: 0;
        transition: border-color 0.15s, background 0.15s;
        position: relative;
        margin-top: 2px;
      }
      .comp-check:hover { border-color: rgba(0,0,0,0.32); }
      .comp-check:checked {
        background: #16a34a;
        border-color: #16a34a;
      }
      .comp-check:checked::after {
        content: '';
        position: absolute;
        left: 5px; top: 1.5px;
        width: 5px; height: 10px;
        border-right: 2px solid #fff;
        border-bottom: 2px solid #fff;
        transform: rotate(45deg);
      }
    `
    document.head.appendChild(style)
  }, [])
}

// ─── colour tokens — strict red/amber/green palette with system tints ────────
const THREAT = {
  high:   { bg: '#fff5f5', border: '#fecaca', text: '#e5251b', label: 'High threat',   dot: '#e5251b' },
  medium: { bg: '#fffbeb', border: '#fde68a', text: '#d97706', label: 'Medium threat', dot: '#d97706' },
  low:    { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a', label: 'Low threat',    dot: '#16a34a' },
}

// Persist which "Topics to tackle" ideas the user has checked off. Scoped per
// competitor channel_id so the state survives page reloads.
const LS_CHECKED = 'ytgrowth_comp_checked_ideas'
function loadCheckedIdeas() {
  try { return JSON.parse(localStorage.getItem(LS_CHECKED) || '{}') } catch { return {} }
}
function saveCheckedIdeas(map) {
  try { localStorage.setItem(LS_CHECKED, JSON.stringify(map)) } catch {}
}

// Relative time ("12d ago" / "3mo ago") for Top videos published date.
function relTime(iso) {
  if (!iso) return ''
  try {
    const t = new Date(iso).getTime()
    const days = Math.max(0, Math.floor((Date.now() - t) / 86400000))
    if (days < 1) return 'today'
    if (days < 30)  return `${days}d ago`
    if (days < 365) return `${Math.round(days / 30)}mo ago`
    return `${Math.round(days / 365)}y ago`
  } catch { return '' }
}

function fmtK(n) {
  if (!n) return '0'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  return String(n)
}

// ─── base card — amber 3px top border matches SEO Studio / Keywords pattern ──
function Card({ children, style, topAccent = '#d97706' }) {
  return (
    <div className="comp-card" style={{ padding: '20px 24px', borderTop: `3px solid ${topAccent}`, ...style }}>
      {children}
    </div>
  )
}

function SectionTitle({ children, hint }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <p style={{ fontSize: 15, fontWeight: 700, color: '#111114', letterSpacing: '-0.3px' }}>{children}</p>
      {hint && <p style={{ fontSize: 12, color: '#9595a4', marginTop: 3, lineHeight: 1.5 }}>{hint}</p>}
    </div>
  )
}

// small chip: bold number + dim label
function StatChip({ value, label }) {
  return (
    <span className="comp-stat-chip">
      <span className="val">{value}</span>
      <span className="lbl">{label}</span>
    </span>
  )
}

// ─── search result card ───────────────────────────────────────────────────────
function ChannelCard({ channel, onAnalyze, isAdded, loadingId }) {
  const loading = loadingId === channel.channel_id
  return (
    <div className="comp-channel-card">
      {channel.thumbnail
        ? <img src={channel.thumbnail} alt="" referrerPolicy="no-referrer"
            style={{ width: 46, height: 46, borderRadius: 12, objectFit: 'cover', flexShrink: 0,
              boxShadow: '0 2px 10px rgba(0,0,0,0.13)' }} />
        : <div style={{ width: 46, height: 46, background: 'linear-gradient(135deg,#e0e0e8,#c8c8d8)',
            borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontWeight: 800, fontSize: 18, color: '#888' }}>
            {channel.channel_name[0]}
          </div>
      }
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 700, fontSize: 14, color: '#111114', marginBottom: 3, letterSpacing: '-0.1px' }}>
          {channel.channel_name}
        </p>
        {channel.description && (
          <p style={{ fontSize: 12, color: '#9595a4', overflow: 'hidden', fontWeight: 400,
            textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{channel.description}</p>
        )}
      </div>
      {isAdded ? (
        <span style={{ background: '#f0fdf4', color: '#16a34a',
          border: '1px solid #bbf7d0', borderRadius: 100,
          padding: '6px 14px', fontSize: 12, fontWeight: 700, flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 12 }}>✓</span> Added
        </span>
      ) : loading ? (
        <span style={{ background: '#f4f4f6', color: '#9595a4',
          border: '1px solid rgba(0,0,0,0.09)', borderRadius: 100,
          padding: '6px 14px', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
          Analyzing…
        </span>
      ) : (
        <button className="comp-btn-primary" onClick={() => onAnalyze(channel.channel_id)}
          style={{ padding: '9px 22px', fontSize: 13, flexShrink: 0 }}>
          Analyze
        </button>
      )}
    </div>
  )
}

// ─── AI analysis ──────────────────────────────────────────────────────────────
function AIAnalysis({ ai, top5Videos, channelId, checkedIdeas, onToggleIdea }) {
  if (!ai) return null
  const threat   = THREAT[ai.threatLevel] || THREAT.medium
  const checksForChannel = (checkedIdeas && channelId) ? (checkedIdeas[channelId] || {}) : {}

  const whyMap = {}
  ;(ai.topVideosToStudy || []).forEach(aiVid => {
    const match = (top5Videos || []).find(v =>
      v.title === aiVid.title ||
      v.title?.toLowerCase().includes(aiVid.title?.toLowerCase().slice(0, 25)) ||
      aiVid.title?.toLowerCase().includes(v.title?.toLowerCase().slice(0, 25))
    )
    if (match?.video_id) whyMap[match.video_id] = aiVid.whyItWorked
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── intelligence summary ── */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 14 }}>
          <SectionTitle>Intelligence summary</SectionTitle>
          <span style={{ background: threat.bg, color: threat.text, border: `1px solid ${threat.border}`,
            fontSize: 12, fontWeight: 700, padding: '5px 13px', borderRadius: 50, flexShrink: 0,
            display: 'inline-flex', alignItems: 'center', gap: 5, letterSpacing: '0.1px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: threat.dot,
              flexShrink: 0, boxShadow: `0 0 6px ${threat.dot}` }} />
            {threat.label}
          </span>
        </div>
        <p style={{ fontSize: 14, color: '#52525b', lineHeight: 1.78, marginBottom: 14, fontWeight: 400 }}>
          {ai.competitorSummary}
        </p>
        {/* "Why" block — neutralized to Priority Actions blue so threat colour
            doesn't re-paint the same message twice (threat pill already carries it). */}
        <div style={{ background: 'rgba(79,134,247,0.07)', border: '1px solid rgba(79,134,247,0.12)',
          borderRadius: 10, padding: '12px 14px' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#4a7cf7',
            letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
            Why
          </p>
          <p style={{ fontSize: 13.5, color: '#111114', lineHeight: 1.72 }}>
            {ai.threatReason}
          </p>
        </div>
      </Card>

      {/* ── winning moves — 2-per-row InsightCard copy ───────────────────────
           Copies Dashboard's InsightCard layout: amber top-border + amber rank
           badge + action title, then blue "Why it works" block. Two per row to
           fill the accordion width (single-column was stretching with huge
           internal whitespace). Badge carries the rank — no redundant "MOVE N"
           eyebrow. Model output is "Action — explanation"; we split on " — ". */}
      {ai.winningMoves?.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#111114', letterSpacing: '-0.3px' }}>
              Winning moves
            </p>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#9595a4', background: '#f1f1f6',
              padding: '2px 8px', borderRadius: 20, border: '1px solid #e6e6ec' }}>
              {ai.winningMoves.length}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {ai.winningMoves.map((m, i) => {
              const parts  = m.split(/\s+—\s+/)
              const action = (parts[0] || m).trim()
              const why    = parts.length > 1 ? parts.slice(1).join(' — ').trim() : null

              return (
                <div key={i} className="comp-card" style={{
                  borderRadius: 14,
                  borderTop: '3px solid #d97706',
                  padding: '14px 16px 16px',
                  display: 'flex', flexDirection: 'column', gap: 12,
                }}>
                  {/* header — rank badge + action title */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 7, background: '#d97706',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <span style={{ fontSize: 11, fontWeight: 900, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
                        {i + 1}
                      </span>
                    </div>
                    <p style={{ fontSize: 13.5, fontWeight: 700, color: '#111114', lineHeight: 1.5, letterSpacing: '-0.1px', flex: 1 }}>
                      {action}
                    </p>
                  </div>

                  {/* "Why it works" block — same palette as Overview's Why-now tile */}
                  {why && (
                    <div style={{ background: 'rgba(79,134,247,0.07)', border: '1px solid rgba(79,134,247,0.12)',
                      borderRadius: 10, padding: '10px 12px' }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: '#4a7cf7',
                        letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>
                        Why it works
                      </p>
                      <p style={{ fontSize: 13, color: '#111114', lineHeight: 1.6 }}>
                        {why}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── video ideas — checkbox-driven to-do list ── */}
      {ai.videoIdeas?.length > 0 && (
        <Card>
          <SectionTitle>Topics to tackle</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ai.videoIdeas.map((idea, i) => {
              const isDone = !!checksForChannel[idea.title]
              return (
                <div key={i} className="comp-inner-block"
                  style={{ opacity: isDone ? 0.55 : 1, transition: 'opacity 0.15s' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <input type="checkbox" className="comp-check"
                      checked={isDone}
                      onChange={() => onToggleIdea && onToggleIdea(channelId, idea.title)} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                        gap: 12, marginBottom: 6 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#111114', lineHeight: 1.45,
                          letterSpacing: '-0.1px',
                          textDecoration: isDone ? 'line-through' : 'none' }}>
                          {idea.title}
                        </p>
                        {idea.targetKeyword && (
                          <span className="comp-tag" style={{ background: '#fffbeb', color: '#d97706',
                            border: '1px solid #fde68a', flexShrink: 0, whiteSpace: 'nowrap',
                            marginTop: 2 }}>
                            {idea.targetKeyword}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 12, color: '#52525b', lineHeight: 1.6, fontWeight: 400 }}>
                        <span style={{ fontWeight: 700, color: '#111114' }}>Angle: </span>{idea.angle}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* ── top videos ── */}
      {top5Videos?.length > 0 && (
        <Card>
          <SectionTitle>Top videos to study</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {top5Videos.map((v, i) => {
              const thumb  = v.video_id ? `https://i.ytimg.com/vi/${v.video_id}/mqdefault.jpg` : v.thumbnail_url || null
              const ytUrl  = v.video_id ? `https://www.youtube.com/watch?v=${v.video_id}` : null
              const why    = whyMap[v.video_id]
              const isLast = i === top5Videos.length - 1
              return (
                <a key={v.video_id || i}
                  href={ytUrl || '#'} target="_blank" rel="noopener noreferrer"
                  className="comp-video-row"
                  style={{ borderBottom: isLast ? 'none' : '1px solid rgba(0,0,0,0.05)' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    {thumb
                      ? <img src={thumb} alt="" style={{ width: 80, height: 46, borderRadius: 10,
                          objectFit: 'cover', display: 'block', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }} />
                      : <div style={{ width: 80, height: 46, borderRadius: 10,
                          background: 'rgba(0,0,0,0.07)', display: 'block' }} />
                    }
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', opacity: 0, transition: 'opacity 0.15s',
                      background: 'rgba(0,0,0,0.42)', borderRadius: 10 }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = 1 }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = 0 }}>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="white"><path d="M7 5.5l6 3.5-6 3.5V5.5z"/></svg>
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#111114', lineHeight: 1.45,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 4 }}>{v.title}</p>
                    {/* Stats row — views · likes · comments · date */}
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center',
                      fontSize: 12, color: '#9595a4', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                      <span><b style={{ color: '#52525b', fontWeight: 700 }}>{fmtK(v.views)}</b> views</span>
                      {typeof v.likes === 'number' && (
                        <><span style={{ color: '#d0d0d8' }}>·</span>
                         <span><b style={{ color: '#52525b', fontWeight: 700 }}>{fmtK(v.likes)}</b> likes</span></>
                      )}
                      {typeof v.comments === 'number' && (
                        <><span style={{ color: '#d0d0d8' }}>·</span>
                         <span><b style={{ color: '#52525b', fontWeight: 700 }}>{fmtK(v.comments)}</b> comments</span></>
                      )}
                      {v.published_at && (
                        <><span style={{ color: '#d0d0d8' }}>·</span>
                         <span>{relTime(v.published_at)}</span></>
                      )}
                    </div>
                    {why && (
                      <p style={{ fontSize: 12, color: '#9595a4', marginTop: 4, lineHeight: 1.4,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {why}
                      </p>
                    )}
                  </div>
                  <svg width="12" height="12" viewBox="0 0 13 13" fill="none"
                    stroke="#c0c0cc" strokeWidth="1.8" strokeLinecap="round" style={{ flexShrink: 0 }}>
                    <path d="M2 11L10 3M10 3H5M10 3v5"/>
                  </svg>
                </a>
              )
            })}
          </div>
        </Card>
      )}

      {/* ── two-column: topics + title patterns ──────────────────────────────
           Uses Overview's bar-row pattern (see Dashboard's "Score breakdown"
           and the hero gauge in Priority Actions): label → bar → tabular
           number. Fills horizontal space instead of stacking tiny right-aligned
           stats with lots of whitespace beside them. */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {ai.topTopics?.length > 0 && (() => {
          const maxViews = Math.max(...ai.topTopics.map(t => t.avgViews || 0), 1)
          // Semantic scoreColor — same thresholds Dashboard uses in "Score breakdown":
          // ≥75% of max = green (strong performer), 55–74% = amber, <55% = red.
          const scoreColor = (pct) => pct >= 75 ? '#059669' : pct >= 55 ? '#d97706' : '#e5251b'
          return (
            <Card>
              <SectionTitle hint="Their strongest content clusters by average views">
                Top content topics
              </SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {ai.topTopics.map((t, i) => {
                  const pct = (t.avgViews || 0) / maxViews * 100
                  const col = scoreColor(pct)
                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
                        <p style={{ fontSize: 13.5, color: '#111114', fontWeight: 600, flex: 1, minWidth: 0,
                          letterSpacing: '-0.1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {t.topic}
                        </p>
                        <span style={{ fontSize: 14, fontWeight: 800, color: col,
                          fontVariantNumeric: 'tabular-nums', flexShrink: 0, letterSpacing: '-0.3px' }}>
                          {fmtK(t.avgViews)}
                        </span>
                        <span style={{ fontSize: 11, color: '#9595a4', fontWeight: 500,
                          fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                          · {t.videoCount}v
                        </span>
                      </div>
                      <div style={{ height: 4, background: '#eeeef3', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.max(pct, 2)}%`, height: '100%', background: col,
                          borderRadius: 99, transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)' }}/>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )
        })()}

        {ai.titlePatterns && (() => {
          // Same scoreColor thresholds as Overview's Score breakdown: 75/55 cut-offs.
          // Title length is scored AGAINST the 100-char YouTube cap — shorter is better,
          // so we invert: low% → green, mid% → amber, high% → red (close to truncation).
          const len    = ai.titlePatterns.avgTitleLength || 0
          const lenPct = Math.min(100, len)
          const lenCol = lenPct <= 60 ? '#059669' : lenPct <= 80 ? '#d97706' : '#e5251b'
          return (
          <Card>
            <SectionTitle hint="What works across their recent titles">Title patterns</SectionTitle>

            {/* Hero: avg title length — same gauge+tabular-value pattern as
                Priority Actions' hero, scoreColor palette from Score breakdown. */}
            <div style={{ marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                gap: 12, marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <p style={{ fontSize: 30, fontWeight: 800, color: lenCol, letterSpacing: '-0.8px', lineHeight: 1 }}>
                    {len}
                  </p>
                  <p style={{ fontSize: 13, color: '#9595a4', fontWeight: 500 }}>char avg title length</p>
                </div>
                <span style={{ fontSize: 11, color: '#9595a4', fontWeight: 500 }}>YouTube cap: 100</span>
              </div>
              <div style={{ height: 4, background: '#eeeef3', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  width: `${lenPct}%`,
                  height: '100%', background: lenCol, borderRadius: 99,
                  transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)',
                }}/>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {ai.titlePatterns.dominantFormats?.length > 0 && (
                <div>
                  <p className="comp-card-label" style={{ marginBottom: 7 }}>Dominant formats</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {ai.titlePatterns.dominantFormats.map((f, i) => (
                      <span key={i} className="comp-tag" style={{ background: '#f4f4f6',
                        color: '#52525b', border: '1px solid rgba(0,0,0,0.09)' }}>{f}</span>
                    ))}
                  </div>
                </div>
              )}
              {ai.titlePatterns.topKeywords?.length > 0 && (
                <div>
                  <p className="comp-card-label" style={{ marginBottom: 7 }}>Top keywords</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {ai.titlePatterns.topKeywords.map((k, i) => (
                      <span key={i} className="comp-tag" style={{ background: '#f4f4f6',
                        color: '#52525b', border: '1px solid rgba(0,0,0,0.09)' }}>{k}</span>
                    ))}
                  </div>
                </div>
              )}
              {ai.titlePatterns.powerWordsUsed?.length > 0 && (
                <div>
                  <p className="comp-card-label" style={{ marginBottom: 7 }}>Power words</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {ai.titlePatterns.powerWordsUsed.map((w, i) => (
                      <span key={i} className="comp-tag" style={{ background: '#fffbeb',
                        color: '#d97706', border: '1px solid #fde68a' }}>{w}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
          )
        })()}
      </div>

      {/* ── three-column insights ── */}
      {(ai.videoLengthInsight || ai.engagementInsight || ai.thumbnailPattern) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          {[
            { key: 'videoLengthInsight', label: 'Video length',    val: ai.videoLengthInsight },
            { key: 'engagementInsight',  label: 'Engagement',      val: ai.engagementInsight },
            { key: 'thumbnailPattern',   label: 'Thumbnail style', val: ai.thumbnailPattern },
          ].filter(x => x.val).map(({ key, label, val }) => (
            <div key={key} className="comp-insight-card">
              <p className="comp-card-label" style={{ marginBottom: 8 }}>{label}</p>
              <p style={{ fontSize: 14, color: '#52525b', lineHeight: 1.7, fontWeight: 400 }}>{val}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── posting timing ── */}
      {ai.postingBehavior && (
        <Card>
          <SectionTitle>Posting timing</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[
              { label: 'Avg gap',     val: `${ai.postingBehavior.avgGapDays}d` },
              { label: 'Best day',    val: ai.postingBehavior.bestDay },
              { label: 'Best hour',   val: ai.postingBehavior.bestHour },
              { label: 'Consistency', val: `${ai.postingBehavior.consistencyScore}/100` },
            ].map(({ label, val }) => (
              <div key={label} className="comp-timing-pill">
                <p style={{ fontSize: 20, fontWeight: 800, color: '#111114', letterSpacing: '-0.5px', lineHeight: 1 }}>{val}</p>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#a0a0b0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

// ─── main page ────────────────────────────────────────────────────────────────
export default function Competitors() {
  useCompetitorStyles()

  const [searchQuery, setSearchQuery]       = useState('')
  const [searchResults, setSearchResults]   = useState([])
  const [analyses, setAnalyses]             = useState(() => loadTracked())
  const [loadingSearch, setLoadingSearch]   = useState(false)
  const [loadingAnalyze, setLoadingAnalyze] = useState(null)
  const [analyzeError, setAnalyzeError]     = useState('')
  const [activeTab, setActiveTab]           = useState('search')
  const [searched, setSearched]             = useState(false)
  const [expandedIdx, setExpandedIdx]       = useState(null)
  const [checkedIdeas, setCheckedIdeas]     = useState(() => loadCheckedIdeas())

  useEffect(() => { saveTracked(analyses) }, [analyses])

  function toggleIdea(channelId, ideaTitle) {
    setCheckedIdeas(prev => {
      const ch = prev[channelId] || {}
      const next = { ...prev, [channelId]: { ...ch, [ideaTitle]: !ch[ideaTitle] } }
      saveCheckedIdeas(next)
      return next
    })
  }

  // On mount: if localStorage is empty, try to restore tracked competitors from the backend.
  // This recovers the list when the user clears their cache or logs in from a new device.
  useEffect(() => {
    if (loadTracked().length > 0) return  // already have local data
    fetch('/competitors/tracked', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.tracked?.length > 0) {
          setAnalyses(d.tracked)
          setActiveTab('tracked')
        }
      })
      .catch(() => {})
  }, [])

  const handleSearch = () => {
    if (!searchQuery.trim()) return
    setLoadingSearch(true)
    setSearched(true)
    fetch(`/competitors/search?q=${encodeURIComponent(searchQuery)}`,
      { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.results) setSearchResults(d.results); setLoadingSearch(false) })
      .catch(() => setLoadingSearch(false))
  }

  const handleAnalyze = (channelId) => {
    if (analyses.find(a => a.competitor.channel_id === channelId)) return
    setLoadingAnalyze(channelId)
    setAnalyzeError('')
    fetch(`/competitors/analyze/${channelId}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.competitor) {
          const entry = { ...d, savedAt: new Date().toISOString() }
          setAnalyses(prev => {
            const next = [...prev, entry]
            setExpandedIdx(next.length - 1)
            return next
          })
          setActiveTab('tracked')
        } else {
          setAnalyzeError(d.error || 'Analysis failed. Please try again.')
        }
        setLoadingAnalyze(null)
      })
      .catch(() => {
        setAnalyzeError('Request timed out or network error. Please try again.')
        setLoadingAnalyze(null)
      })
  }

  const handleRemove = (e, channelId) => {
    e.stopPropagation()
    setAnalyses(prev => prev.filter(a => a.competitor.channel_id !== channelId))
    setExpandedIdx(null)
  }

  const addedIds = analyses.map(a => a.competitor.channel_id)

  const TABS = [
    { key: 'search',  label: 'Search channels' },
    { key: 'tracked', label: analyses.length > 0 ? `Tracked (${analyses.length})` : 'Tracked' },
  ]

  return (
    <div className="comp-page">
      {/* ── header ── */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111114', marginBottom: 4, letterSpacing: '-0.6px' }}>
          Competitor Analysis
        </h2>
        <p style={{ fontSize: 14, color: '#a0a0b0', fontWeight: 400 }}>
          Search channels in your niche · get a full AI-powered competitive intelligence report
        </p>
      </div>

      {/* ── tabs ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {TABS.map(({ key, label }) => (
          <button key={key}
            className={`comp-tab-btn ${activeTab === key ? 'active' : 'inactive'}`}
            onClick={() => setActiveTab(key)}>
            {label}
          </button>
        ))}
      </div>

      {/* ══ search tab ══════════════════════════════════════════════════════ */}
      {activeTab === 'search' && (
        <div>
          <Card style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: '#111114', marginBottom: 4, letterSpacing: '-0.3px' }}>
              Find a competitor
            </p>
            <p style={{ fontSize: 14, color: '#a0a0b0', marginBottom: 16, fontWeight: 400 }}>
              Type the name of a YouTube channel in your niche, or paste a channel URL
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                className="comp-input"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="e.g. MrBeast, TechWithTim, or paste channel URL…"
              />
              <button className="comp-btn-primary" onClick={handleSearch} disabled={loadingSearch}>
                {loadingSearch ? 'Searching…' : 'Search'}
              </button>
            </div>
          </Card>

          {!searched && (
            <div className="comp-empty-state">
              <div style={{ width: 44, height: 44, borderRadius: 13, background: '#f0f0f3', border: '1px solid rgba(0,0,0,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#a0a0b0" strokeWidth="1.6" strokeLinecap="round"><circle cx="8.5" cy="8.5" r="5.5"/><line x1="13" y1="13" x2="17" y2="17"/></svg>
              </div>
              <p style={{ fontWeight: 700, color: '#52525b', marginBottom: 6, fontSize: 14 }}>Search for a channel to compare</p>
              <p style={{ fontSize: 14, color: '#a0a0b0' }}>Type any YouTube channel name above to get started</p>
            </div>
          )}

          {searched && !loadingSearch && searchResults.length === 0 && (
            <div className="comp-empty-state">
              <div style={{ width: 44, height: 44, borderRadius: 13, background: '#f0f0f3', border: '1px solid rgba(0,0,0,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#a0a0b0" strokeWidth="1.6" strokeLinecap="round"><circle cx="8.5" cy="8.5" r="5.5"/><line x1="13" y1="13" x2="17" y2="17"/><line x1="6.5" y1="8.5" x2="10.5" y2="8.5"/></svg>
              </div>
              <p style={{ fontWeight: 700, color: '#52525b', marginBottom: 6, fontSize: 14 }}>No channels found</p>
              <p style={{ fontSize: 14, color: '#a0a0b0' }}>Try a different search term or paste the channel URL</p>
            </div>
          )}

          {analyzeError && (
            <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', marginBottom: 12, fontSize: 14, color: '#e5251b', fontWeight: 500 }}>
              {analyzeError}
            </div>
          )}

          {searchResults.map(ch => (
            <ChannelCard key={ch.channel_id} channel={ch} onAnalyze={handleAnalyze}
              isAdded={addedIds.includes(ch.channel_id)} loadingId={loadingAnalyze} />
          ))}
        </div>
      )}

      {/* ══ tracked tab ═════════════════════════════════════════════════════ */}
      {activeTab === 'tracked' && (
        <div>
          {analyses.length === 0 ? (
            <div className="comp-empty-state">
              <div style={{ width: 44, height: 44, borderRadius: 13, background: '#f0f0f3', border: '1px solid rgba(0,0,0,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#a0a0b0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="10" width="3" height="7" rx="1"/><rect x="8.5" y="6" width="3" height="11" rx="1"/><rect x="14" y="3" width="3" height="14" rx="1"/></svg>
              </div>
              <p style={{ fontWeight: 700, color: '#52525b', marginBottom: 6, fontSize: 14 }}>No competitors tracked yet</p>
              <p style={{ fontSize: 14, color: '#a0a0b0', maxWidth: 300, margin: '0 auto' }}>
                Go to Search, find a channel and click Analyze — it'll be saved here automatically
              </p>
            </div>
          ) : (
            analyses.map((analysis, i) => {
              const comp    = analysis.competitor
              const ai      = analysis.ai_analysis
              const isOpen  = expandedIdx === i
              const threat  = ai ? (THREAT[ai.threatLevel] || THREAT.medium) : null
              const savedAt = analysis.savedAt
                ? new Date(analysis.savedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                : ''

              // chevron direction
              const Chevron = () => (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                  <path d="M2 4l4 4 4-4"/>
                </svg>
              )

              return (
                <div key={comp.channel_id} className="comp-accordion-wrapper"
                  style={{ marginBottom: 12, position: 'relative' }}>

                  {/* ── trash: appears on hover, far corner, away from report button ── */}
                  <button className="comp-remove-btn"
                    title="Remove competitor"
                    onClick={e => handleRemove(e, comp.channel_id)}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M2 3.5h10M5.5 3.5V2.5h3v1M5 5.5l.5 5M9 5.5l-.5 5M3 3.5l.7 8.5h6.6L11 3.5"/>
                    </svg>
                  </button>

                  {/* ── accordion header ── */}
                  <div className={`comp-accordion-header ${isOpen ? 'open' : 'closed'}`}
                    onClick={() => setExpandedIdx(isOpen ? null : i)}>

                    {comp.thumbnail && (
                      <img src={comp.thumbnail} alt="" referrerPolicy="no-referrer"
                        style={{ width: 46, height: 46, borderRadius: 12, objectFit: 'cover',
                          flexShrink: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.13)' }} />
                    )}

                    {/* ── left: name + badges ── */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <p style={{ fontWeight: 800, fontSize: 14, color: '#111114',
                          letterSpacing: '-0.2px', whiteSpace: 'nowrap', overflow: 'hidden',
                          textOverflow: 'ellipsis' }}>
                          {comp.channel_name}
                        </p>
                        {threat && (
                          <span style={{ background: threat.bg, color: threat.text,
                            border: `1px solid ${threat.border}`, fontSize: 12, fontWeight: 700,
                            padding: '3px 10px', borderRadius: 50, flexShrink: 0,
                            display: 'inline-flex', alignItems: 'center', gap: 4, letterSpacing: '0.1px' }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: threat.dot,
                              flexShrink: 0, boxShadow: `0 0 5px ${threat.dot}` }} />
                            {threat.label}
                          </span>
                        )}
                      </div>

                      {/* ── stat chips ── */}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <StatChip value={fmtK(comp.subscribers)} label="subs" />
                        <StatChip value={fmtK(comp.avg_views_per_video)} label="avg views" />
                        {ai && <StatChip value={ai.gapsToExploit?.length || 0} label="gaps" />}
                        {savedAt && (
                          <span style={{ fontSize: 12, color: '#9595a4', fontWeight: 500,
                            alignSelf: 'center', marginLeft: 2 }}>
                            · {savedAt}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ── right: only the report toggle ── */}
                    <div style={{ flexShrink: 0, borderLeft: '1px solid rgba(0,0,0,0.07)',
                      paddingLeft: 16, marginLeft: 4, paddingRight: 28 }}>
                      <button className={`comp-btn-report ${isOpen ? 'open' : ''}`}
                        onClick={e => { e.stopPropagation(); setExpandedIdx(isOpen ? null : i) }}>
                        {isOpen ? 'Close' : 'Open report'}
                        <Chevron />
                      </button>
                    </div>
                  </div>

                  {/* ── expanded report ── */}
                  {isOpen && (
                    <div className="comp-accordion-body">
                      <AIAnalysis
                        ai={ai}
                        top5Videos={comp.top_5_videos}
                        channelId={comp.channel_id}
                        checkedIdeas={checkedIdeas}
                        onToggleIdea={toggleIdea}
                      />
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
