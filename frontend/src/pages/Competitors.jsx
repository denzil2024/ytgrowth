import { useState, useEffect } from 'react'
import CreditsEmptyModal from '../components/CreditsEmptyModal'
import UpsellModal from '../components/UpsellModal'

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
    // Geist Variable load — page-scoped, same pattern as Chat. Geist
    // sits cleaner on this design grammar than Inter; weights drop a
    // tier across the page (500/600 max, never 700/800).
    if (!document.getElementById('ytg-comp-geist-font')) {
      const link = document.createElement('link')
      link.id = 'ytg-comp-geist-font'
      link.rel = 'stylesheet'
      link.href = 'https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@400..700&display=swap'
      document.head.appendChild(link)
    }

    if (document.getElementById('ytg-comp-styles')) return

    const style = document.createElement('style')
    style.id = 'ytg-comp-styles'
    style.textContent = `
      .comp-page { max-width: 1040px; margin: 0 auto; }
      .comp-page * { box-sizing: border-box; font-family: 'Geist', 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
      .comp-page p, .comp-page span, .comp-page div { margin: 0; }

      /* ── cards — single soft shadow + iOS inner-light highlight ──
         Matches the Chat-page design grammar: black-alpha hairline,
         14px radius, one shadow at rest, inset 1px white highlight
         along the top edge so white surfaces feel lit from above. */
      .comp-card {
        background: #ffffff;
        border: 1px solid rgba(10,10,15,0.07);
        border-radius: 14px;
        box-shadow: 0 1px 2px rgba(15,15,25,0.04), inset 0 1px 0 rgba(255,255,255,0.7);
      }

      .comp-channel-card {
        background: #ffffff;
        border: 1px solid rgba(10,10,15,0.07);
        border-radius: 14px;
        box-shadow: 0 1px 2px rgba(15,15,25,0.04), inset 0 1px 0 rgba(255,255,255,0.7);
        padding: 14px 18px;
        display: flex;
        align-items: center;
        gap: 14px;
        margin-bottom: 10px;
        transition: border-color 180ms cubic-bezier(0.32, 0.72, 0, 1), box-shadow 180ms cubic-bezier(0.32, 0.72, 0, 1), transform 180ms cubic-bezier(0.32, 0.72, 0, 1);
      }
      .comp-channel-card:hover {
        border-color: rgba(10,10,15,0.18);
        box-shadow: 0 4px 16px rgba(15,15,25,0.06), inset 0 1px 0 rgba(255,255,255,0.7);
        transform: translateY(-1px);
      }

      /* ── tabs — quiet pill nav (was chunky red filled with red glow).
         Tabs are navigation, not the page's CTA, so they shouldn't be
         the loudest element. Charcoal text, hairline border, subtle
         inset tint when active. Brand red is reserved for the page's
         actual CTA (Search) and the threat dot. ── */
      .comp-tab-btn {
        padding: 8px 16px;
        border-radius: 100px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: background 180ms cubic-bezier(0.32, 0.72, 0, 1), color 180ms cubic-bezier(0.32, 0.72, 0, 1), border-color 180ms cubic-bezier(0.32, 0.72, 0, 1);
        font-family: 'Geist', 'Inter', system-ui, sans-serif;
        border: 1px solid transparent;
        white-space: nowrap;
        letter-spacing: -0.01em;
      }
      .comp-tab-btn.active {
        background: rgba(10,10,15,0.055);
        color: #0a0a0f;
        border-color: rgba(10,10,15,0.10);
        font-weight: 600;
      }
      .comp-tab-btn.inactive {
        background: transparent;
        color: rgba(10,10,15,0.55);
        border-color: transparent;
      }
      .comp-tab-btn.inactive:hover {
        background: rgba(10,10,15,0.03);
        color: #0a0a0f;
      }

      /* ── search input — matches the Chat composer treatment: hairline
         at rest, soft red-alpha glow ring on focus. Glass effect is
         dropped here because there's no atmospheric bg behind it. ── */
      .comp-input {
        flex: 1;
        padding: 12px 20px;
        border-radius: 14px;
        border: 1px solid rgba(10,10,15,0.10);
        background: #ffffff;
        font-size: 14px;
        font-weight: 450;
        font-family: 'Geist', 'Inter', system-ui, sans-serif;
        outline: none;
        transition: border-color 200ms cubic-bezier(0.32, 0.72, 0, 1), box-shadow 200ms cubic-bezier(0.32, 0.72, 0, 1);
        color: #0a0a0f;
        letter-spacing: -0.005em;
        box-shadow: 0 1px 2px rgba(15,15,25,0.04), inset 0 1px 0 rgba(255,255,255,0.7);
      }
      .comp-input::placeholder { color: rgba(10,10,15,0.40); font-weight: 450; }
      .comp-input:focus {
        border-color: rgba(229,37,27,0.30);
        box-shadow: 0 0 0 4px rgba(229,37,27,0.06), 0 1px 2px rgba(15,15,25,0.04), inset 0 1px 0 rgba(255,255,255,0.7);
      }

      /* ── primary red CTA — Search button. Vertical gradient + inset
         highlight, same treatment as the Chat send button. ── */
      .comp-btn-primary {
        background: linear-gradient(180deg, #ef3a31 0%, #e5251b 100%);
        color: #fff;
        border: none;
        border-radius: 12px;
        padding: 12px 22px;
        font-size: 13px;
        font-weight: 600;
        font-family: 'Geist', 'Inter', system-ui, sans-serif;
        cursor: pointer;
        white-space: nowrap;
        transition: filter 160ms cubic-bezier(0.32, 0.72, 0, 1), transform 160ms cubic-bezier(0.32, 0.72, 0, 1);
        letter-spacing: -0.01em;
        box-shadow: 0 1px 2px rgba(229,37,27,0.30), inset 0 1px 0 rgba(255,255,255,0.22);
      }
      .comp-btn-primary:hover:not(:disabled) { filter: brightness(1.06); transform: translateY(-1px); }
      .comp-btn-primary:disabled {
        background: rgba(10,10,15,0.06);
        color: rgba(10,10,15,0.26);
        cursor: default;
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.6);
      }

      /* Remove (trash) icon — appears on row hover only, top-right
         corner of the identity row (not the wrapper center, since
         cards now have a tall signal row below the identity strip). */
      .comp-remove-btn {
        position: absolute;
        top: 18px;
        right: 56px;
        width: 26px;
        height: 26px;
        border-radius: 7px;
        border: none;
        background: transparent;
        color: rgba(10,10,15,0.32);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 160ms cubic-bezier(0.32, 0.72, 0, 1), background 160ms cubic-bezier(0.32, 0.72, 0, 1), color 160ms cubic-bezier(0.32, 0.72, 0, 1);
        z-index: 2;
        flex-shrink: 0;
      }
      .comp-accordion-wrapper:hover .comp-remove-btn { opacity: 1; }
      .comp-remove-btn:hover {
        background: rgba(229,37,27,0.08);
        color: #e5251b;
      }

      /* "Open report" — was a red CTA pill; now reduced to a chevron-
         only affordance on the right side of the accordion row. The row
         itself is the click target. Brand red is reserved for the
         actual page CTA (Search) and the threat dot. */
      .comp-btn-report {
        background: transparent;
        color: rgba(10,10,15,0.42);
        border: none;
        border-radius: 8px;
        padding: 6px;
        cursor: pointer;
        white-space: nowrap;
        transition: color 160ms cubic-bezier(0.32, 0.72, 0, 1), background 160ms cubic-bezier(0.32, 0.72, 0, 1);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
      }
      .comp-btn-report:hover { color: #0a0a0f; background: rgba(10,10,15,0.04); }
      .comp-btn-report.open { color: #0a0a0f; }

      /* Inline meta line — replaces the row of three boxy stat chips.
         Subs · avg views · gaps · age, all in one quiet 12/500 text3
         line. The numbers carry the weight on their own. */
      .comp-meta-line {
        display: inline-flex;
        align-items: center;
        gap: 0;
        font-size: 12.5px;
        font-weight: 500;
        color: rgba(10,10,15,0.55);
        letter-spacing: -0.01em;
        font-variant-numeric: tabular-nums;
        flex-wrap: wrap;
      }
      .comp-meta-line .val {
        color: #0a0a0f;
        font-weight: 600;
      }
      .comp-meta-line .sep {
        color: rgba(10,10,15,0.26);
        margin: 0 7px;
      }

      /* Quick-wins row — direct copy of Dashboard.jsx's .ytg-qw-row so Topics
         to tackle reads as a checkbox task list, not an elevated card stack. */
      .comp-qw-row {
        display: flex; gap: 10px; align-items: flex-start;
        padding: 10px 12px; border-radius: 10px;
        border: 1px solid transparent;
        transition: background 0.15s, border-color 0.15s;
      }
      .comp-qw-row:hover {
        background: #f4f4f7; border-color: rgba(0,0,0,0.07);
      }

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

      /* Card — single flex-column surface with a colored stripe at the
         top, an identity row (avatar + name + threat + chevron), and a
         visual signal row (3 recent thumbs). Hairline border, system
         elevation, soft lift on hover. */
      .comp-accordion-header {
        background: #ffffff;
        border: 1px solid rgba(10,10,15,0.07);
        box-shadow: 0 1px 2px rgba(15,15,25,0.04), inset 0 1px 0 rgba(255,255,255,0.7);
        padding: 0;
        display: flex;
        flex-direction: column;
        transition: box-shadow 200ms cubic-bezier(0.32, 0.72, 0, 1), border-color 200ms cubic-bezier(0.32, 0.72, 0, 1), transform 200ms cubic-bezier(0.32, 0.72, 0, 1);
        cursor: pointer;
        user-select: none;
        overflow: hidden;
      }
      .comp-accordion-header:hover {
        box-shadow: 0 4px 16px rgba(15,15,25,0.06), inset 0 1px 0 rgba(255,255,255,0.7);
        border-color: rgba(10,10,15,0.14);
        transform: translateY(-1px);
      }
      .comp-accordion-header.closed { border-radius: 14px; }
      .comp-accordion-header.open   { border-radius: 14px 14px 0 0; border-bottom-color: rgba(10,10,15,0.05); transform: none; }
      .comp-accordion-header.open:hover { transform: none; }

      /* 3px colored stripe — threat color, top edge of the card. Visual
         entry point that lets the user scan severity before reading. */
      .comp-stripe {
        height: 3px;
        width: 100%;
        flex-shrink: 0;
      }

      /* Identity row — avatar, name + threat label, meta line, chevron.
         Still the click target for expand/collapse. */
      .comp-identity-row {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 14px 18px;
      }

      /* Signal row — visual evidence. Eyebrow + top-performer stat on
         top, 3-up thumbnail grid below. Shows by default (not behind a
         disclosure) because the whole point is to put their work in
         front of you, not a paragraph describing it. */
      .comp-signal-row {
        padding: 0 18px 16px;
        border-top: 1px solid rgba(10,10,15,0.05);
        padding-top: 14px;
      }
      .comp-signal-eyebrow {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
        flex-wrap: wrap;
      }
      .comp-signal-eyebrow .label {
        font-size: 11px;
        font-weight: 700;
        color: rgba(10,10,15,0.50);
        letter-spacing: 0.10em;
        text-transform: uppercase;
      }
      .comp-signal-eyebrow .perf {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 11.5px;
        font-weight: 500;
        color: rgba(10,10,15,0.62);
        letter-spacing: -0.01em;
        font-variant-numeric: tabular-nums;
        margin-left: auto;
      }
      .comp-signal-eyebrow .perf strong { color: #0a0a0f; font-weight: 700; }
      .comp-signal-eyebrow .perf .dot {
        width: 6px; height: 6px; border-radius: 99px;
        background: #16a34a; flex-shrink: 0;
      }

      .comp-thumb-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
      }
      .comp-thumb-tile {
        display: block;
        text-decoration: none;
        color: inherit;
        border-radius: 10px;
        overflow: hidden;
        border: 1px solid #ececf0;
        background: #fff;
        transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease;
      }
      .comp-thumb-tile:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 14px rgba(0,0,0,0.10);
        border-color: #d6d6dc;
      }
      .comp-thumb-img {
        position: relative;
        aspect-ratio: 16 / 9;
        background: #ebebef;
        overflow: hidden;
      }
      .comp-thumb-img img {
        width: 100%; height: 100%; object-fit: cover; display: block;
      }
      .comp-thumb-views {
        position: absolute;
        bottom: 6px; right: 6px;
        background: rgba(0,0,0,0.78);
        color: #fff;
        font-size: 10.5px;
        font-weight: 700;
        padding: 2px 6px;
        border-radius: 5px;
        font-variant-numeric: tabular-nums;
        letter-spacing: -0.05px;
        backdrop-filter: blur(2px);
      }
      .comp-thumb-text { padding: 8px 10px 10px; }
      .comp-thumb-title {
        font-size: 12px;
        font-weight: 600;
        color: #0a0a0f;
        letter-spacing: -0.1px;
        line-height: 1.4;
        margin: 0 0 3px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        min-height: 32px;
      }
      .comp-thumb-meta {
        font-size: 11px;
        font-weight: 500;
        color: rgba(10,10,15,0.45);
        letter-spacing: -0.03px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .comp-accordion-body {
        border: 1px solid rgba(10,10,15,0.07);
        border-top: none;
        border-radius: 0 0 14px 14px;
        background: rgba(10,10,15,0.018);
        padding: 22px 18px 26px;
        box-shadow: 0 1px 2px rgba(15,15,25,0.04);
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
        padding: 48px 0;
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

// ─── base card — amber 3px top border matches SEO Studio / Keywords pattern.
// Pass topAccent={null} to render a plain card with no colored top border. ──
function Card({ children, style, topAccent = '#d97706' }) {
  return (
    <div className="comp-card" style={{
      padding: '20px 24px',
      ...(topAccent ? { borderTop: `3px solid ${topAccent}` } : {}),
      ...style,
    }}>
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
// ─── Disclosure — outlined pill button + revealable body. Pattern for
// hiding prose-heavy sections by default. Open: tinted background +
// dark text. Closed: white + soft text. Chevron rotates on open.
function Disclosure({ label, count, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '9px 16px', borderRadius: 100,
          border: '1px solid rgba(10,10,15,0.12)',
          background: open ? 'rgba(10,10,15,0.04)' : '#ffffff',
          color: open ? '#0a0a0f' : 'rgba(10,10,15,0.62)',
          fontFamily: 'inherit',
          fontSize: 12.5, fontWeight: 600, letterSpacing: '-0.01em',
          cursor: 'pointer',
          transition: 'background 140ms ease, color 140ms ease, border-color 140ms ease',
        }}
        onMouseEnter={e => {
          if (open) return
          e.currentTarget.style.background = 'rgba(15,15,19,0.03)'
          e.currentTarget.style.color = '#0a0a0f'
          e.currentTarget.style.borderColor = 'rgba(10,10,15,0.20)'
        }}
        onMouseLeave={e => {
          if (open) return
          e.currentTarget.style.background = '#ffffff'
          e.currentTarget.style.color = 'rgba(10,10,15,0.62)'
          e.currentTarget.style.borderColor = 'rgba(10,10,15,0.12)'
        }}
      >
        {open ? 'Hide' : 'Show'} {label}
        {count != null && (
          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(10,10,15,0.40)',
            background: 'rgba(10,10,15,0.05)', padding: '2px 7px', borderRadius: 99,
            border: '1px solid rgba(10,10,15,0.07)' }}>{count}</span>
        )}
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none"
          stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms ease' }}>
          <polyline points="3,4.5 6,7.5 9,4.5"/>
        </svg>
      </button>
      {open && (
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {children}
        </div>
      )}
    </div>
  )
}

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
            style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', flexShrink: 0,
              boxShadow: '0 1px 2px rgba(15,15,25,0.10)' }} />
        : <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg,#e8e8ed,#d4d4dc)',
            borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontWeight: 500, fontSize: 18, color: 'rgba(10,10,15,0.45)' }}>
            {channel.channel_name[0]}
          </div>
      }
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 500, fontSize: 14.5, color: '#0a0a0f', marginBottom: 3, letterSpacing: '-0.15px' }}>
          {channel.channel_name}
        </p>
        {channel.description && (
          <p style={{ fontSize: 12.5, color: 'rgba(10,10,15,0.50)', overflow: 'hidden', fontWeight: 450,
            letterSpacing: '-0.005em',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{channel.description}</p>
        )}
      </div>
      {isAdded ? (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 12, fontWeight: 500, color: '#15803d',
          letterSpacing: '-0.005em',
          flexShrink: 0,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: '#15803d', boxShadow: '0 0 0 3px rgba(22,163,74,0.16)' }}/>
          Added
        </span>
      ) : loading ? (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 14px', borderRadius: 100,
          background: 'rgba(10,10,15,0.04)',
          color: 'rgba(10,10,15,0.55)',
          fontSize: 12.5, fontWeight: 500, flexShrink: 0,
          letterSpacing: '-0.005em',
        }}>
          Analyzing
        </span>
      ) : (
        <button className="comp-btn-primary" onClick={() => onAnalyze(channel.channel_id)}
          style={{ padding: '9px 18px', fontSize: 13, flexShrink: 0 }}>
          Analyze
          <span style={{ fontSize: 11, fontWeight: 450, opacity: 0.7, marginLeft: 6, letterSpacing: 0 }}>1 credit</span>
        </button>
      )}
    </div>
  )
}

// ─── AI analysis ──────────────────────────────────────────────────────────────
function AIAnalysis({ ai, comp, top5Videos, channelId, checkedIdeas, onToggleIdea }) {
  // showProse gates the text-heavy sections (Intelligence summary,
  // Channel insights, Winning moves bodies). Default closed so the
  // expanded report opens visual-first; user clicks to read prose.
  const [showProse, setShowProse] = useState(false)
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

  // KPI hero values (only render the strip if we have at least one)
  const cs              = ai.postingBehavior?.consistencyScore
  const consistencyCol  = cs == null ? '#0a0a0f' : cs >= 75 ? '#16a34a' : cs >= 55 ? '#d97706' : '#e5251b'
  const avgGap          = ai.postingBehavior?.avgGapDays
  const subs            = comp?.subscribers
  const avgViews        = comp?.avg_views_per_video
  const hasKpi          = subs != null || avgViews != null || avgGap != null || cs != null

  // Topics-to-tackle — pulled out of the old "Your playbook" 3-col card.
  // Lives as a top-level visible section now; the prose angle is dropped
  // from the visible list and moved into the per-row Disclosure below.
  const ideas      = ai.videoIdeas || []
  const doneCount  = ideas.filter(idea => !!checksForChannel[idea.title]).length
  const ideasLeft  = ideas.length - doneCount

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      {/* ─── 1. KPI hero strip ──────────────────────────────────────────────
           Four visual tiles at the top of every expanded report so the
           user can scan the channel's size/cadence/discipline before
           reading anything. Replaces the old "Posting timing" Card. */}
      {hasKpi && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {[
            { label: 'Subscribers',    val: subs     != null ? fmtK(subs)         : '—', col: '#0a0a0f' },
            { label: 'Avg views',      val: avgViews != null ? fmtK(avgViews)     : '—', col: '#0a0a0f' },
            { label: 'Upload cadence', val: avgGap   != null ? `${avgGap}d`       : '—', col: '#0a0a0f' },
            { label: 'Consistency',    val: cs       != null ? `${cs}/100`        : '—', col: consistencyCol },
          ].map(({ label, val, col }) => (
            <div key={label} className="comp-timing-pill">
              <p style={{ fontSize: 20, fontWeight: 800, color: col, letterSpacing: '-0.5px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{val}</p>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#9595a4', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ─── 2. Top videos to study ─────────────────────────────────────────
           Up-to-5 thumbnail grid, click to YouTube. The "why it worked"
           prose is hidden under a per-tile disclosure if AI provided one,
           keeping the row scannable by default. */}
      {top5Videos?.length > 0 && (() => {
        const vids = top5Videos.slice(0, 5)
        const cols = vids.length
        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0a0a0f', letterSpacing: '-0.3px' }}>
                Top videos to study
              </h2>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#9595a4', background: '#f1f1f6',
                padding: '2px 8px', borderRadius: 20, border: '1px solid #e6e6ec' }}>
                {vids.length}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 10 }}>
              {vids.map((v, i) => {
                const thumb = v.thumbnail || v.thumbnail_url || (v.video_id ? `https://i.ytimg.com/vi/${v.video_id}/mqdefault.jpg` : null)
                const ytUrl = v.video_id ? `https://www.youtube.com/watch?v=${v.video_id}` : null
                return (
                  <a key={v.video_id || i}
                    href={ytUrl || '#'} target="_blank" rel="noopener noreferrer"
                    onClick={e => { if (!ytUrl) e.preventDefault() }}
                    className="comp-thumb-tile">
                    <div className="comp-thumb-img">
                      {thumb && <img src={thumb} alt="" referrerPolicy="no-referrer" loading="lazy"/>}
                      {v.views > 0 && <span className="comp-thumb-views">{fmtK(v.views)}</span>}
                    </div>
                    <div className="comp-thumb-text">
                      <p className="comp-thumb-title">{v.title}</p>
                      <p className="comp-thumb-meta">{v.published_at ? relTime(v.published_at) : ''}</p>
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        )
      })()}

      {/* ── intelligence summary — paneled card. Hidden by default; revealed
           via the "Show full analysis" disclosure at the bottom of the
           expanded report. Two analytical panels separated by a 3px amber
           vertical bar (SeoOptimizer.jsx Title Scorecard pattern). */}
      {showProse && (
      <Card topAccent={null}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}>
          <SectionTitle>Intelligence summary</SectionTitle>
          <span style={{ background: threat.bg, color: threat.text, border: `1px solid ${threat.border}`,
            fontSize: 12, fontWeight: 700, padding: '5px 13px', borderRadius: 50, flexShrink: 0,
            display: 'inline-flex', alignItems: 'center', gap: 5, letterSpacing: '0.1px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: threat.dot,
              flexShrink: 0, boxShadow: `0 0 6px ${threat.dot}` }} />
            {threat.label}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'stretch', gap: 24 }}>

          {/* Left panel: Summary — plain text, no tile (symmetric with right) */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#9595a4',
              letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
              Summary
            </p>
            <p style={{ fontSize: 14, color: '#111114', lineHeight: 1.78, fontWeight: 400 }}>
              {ai.competitorSummary}
            </p>
          </div>

          {/* Amber divider — 3px vertical bar, now centered since both panels are flex:1 */}
          <div style={{ width: 3, alignSelf: 'stretch', background: '#d97706', flexShrink: 0, borderRadius: 2 }}/>

          {/* Right panel: Why this threat level */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#9595a4',
              letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
              Why this threat level
            </p>
            <p style={{ fontSize: 14, color: '#111114', lineHeight: 1.78, fontWeight: 400 }}>
              {ai.threatReason}
            </p>
          </div>
        </div>
      </Card>
      )}

      {/* ── channel insights — prose cards. Hidden by default; revealed
           by the "Show full analysis" disclosure at the bottom. */}
      {showProse && (() => {
        const insights = [
          { key: 'videoLengthInsight', label: 'Video length',    val: ai.videoLengthInsight },
          { key: 'engagementInsight',  label: 'Engagement',      val: ai.engagementInsight },
          { key: 'thumbnailPattern',   label: 'Thumbnail style', val: ai.thumbnailPattern },
        ].filter(x => x.val)
        if (insights.length === 0) return null
        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <p style={{ fontSize: 20, fontWeight: 800, color: '#111114', letterSpacing: '-0.5px' }}>
                Channel insights
              </p>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#9595a4', background: '#f1f1f6',
                padding: '2px 8px', borderRadius: 20, border: '1px solid #e6e6ec' }}>
                {insights.length}
              </span>
            </div>

            {insights.map(({ key, label, val }, i) => {
              const match    = val.match(/^(.+?[.!?])\s+(.+)$/s)
              const headline = (match ? match[1] : val).trim()
              const body     = match ? match[2].trim() : null

              return (
                <div key={key} className="comp-card" style={{
                  borderRadius: 14,
                  overflow: 'hidden',
                  marginBottom: 10,
                  borderTop: '3px solid #d97706',
                }}>
                  <div style={{ padding: '16px 22px 18px' }}>

                    {/* Header: amber badge + amber category + bold headline */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: body ? 14 : 0 }}>
                      <div style={{ width: 26, height: 26, borderRadius: 8, background: '#d97706',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                        <span style={{ fontSize: 12, fontWeight: 900, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
                          {i + 1}
                        </span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: '#d97706',
                          letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>
                          {label}
                        </p>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#111114', lineHeight: 1.55 }}>
                          {headline}
                        </p>
                      </div>
                    </div>

                    {/* Divider + full-width blue "Why it works" tile */}
                    {body && (
                      <>
                        <div style={{ height: 1, background: '#e6e6ec', marginBottom: 14, marginLeft: 38 }} />
                        <div style={{ marginLeft: 38, background: 'rgba(79,134,247,0.07)',
                          border: '1px solid rgba(79,134,247,0.12)', borderRadius: 10, padding: '12px 14px' }}>
                          <p style={{ fontSize: 10, fontWeight: 700, color: '#4a7cf7',
                            letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                            Why it works
                          </p>
                          <p style={{ fontSize: 13.5, color: '#111114', lineHeight: 1.72 }}>{body}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )
      })()}

      {/* ── posting timing ── Consistency uses scoreColor (same thresholds as
           Overview's Score breakdown: ≥75 green, 55–74 amber, <55 red). Other
           three tiles are identity/timestamp values and stay neutral. */}
      {false /* posting timing moved into KPI hero strip */ && ai.postingBehavior && (() => {
        const cs = ai.postingBehavior.consistencyScore ?? 0
        const consistencyColor = cs >= 75 ? '#059669' : cs >= 55 ? '#d97706' : '#e5251b'
        return (
        <Card topAccent={null}>
          <SectionTitle>Posting timing</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[
              { label: 'Avg gap',     val: `${ai.postingBehavior.avgGapDays}d`, color: '#111114' },
              { label: 'Best day',    val: ai.postingBehavior.bestDay,          color: '#111114' },
              { label: 'Best hour',   val: ai.postingBehavior.bestHour,         color: '#111114' },
              { label: 'Consistency', val: `${cs}/100`,                         color: consistencyColor },
            ].map(({ label, val, color }) => (
              <div key={label} className="comp-timing-pill">
                <p style={{ fontSize: 20, fontWeight: 800, color, letterSpacing: '-0.5px', lineHeight: 1 }}>{val}</p>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#a0a0b0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
              </div>
            ))}
          </div>
        </Card>
        )
      })()}
      {/* ── Top content topics — faithful copy of SEO Optimizer's "Related phrases"
           card (SeoOptimizer.jsx:1366–1421). Amber 3px top border, eyebrow + hint
           on the left, big tabular count on the right, hairline divider, then
           a 2-col grid of bar rows with a 1px amber vertical divider between
           the two columns (left col padding-right 20, right col padding-left 20
           + border-left amberBdr). Bar width + value colour both driven by
           scoreColor (relative-to-max here since topics aren't absolute scored). */}
      {ai.topTopics?.length > 0 && (() => {
        // Single accent — all bars are "their strongest" so they get one
        // consistent green. Previous version used red on the weakest, which
        // read as an arbitrary alert color in a section about their wins.
        const viewVals = ai.topTopics.map(t => t.avgViews || 0)
        const maxViews = Math.max(...viewVals, 1)
        const BAR_COLOR = '#059669'
        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0a0a0f', letterSpacing: '-0.3px' }}>
                Top content topics
              </h2>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#9595a4', background: '#f1f1f6',
                padding: '2px 8px', borderRadius: 20, border: '1px solid #e6e6ec' }}>
                {ai.topTopics.length}
              </span>
            </div>

            <div className="comp-card" style={{ borderTop: '3px solid #d97706' }}>
              <div style={{ padding: '18px 22px 20px' }}>
                <div style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#9595a4',
                    letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>
                    Topics by reach
                  </p>
                  <p style={{ fontSize: 13, color: '#9595a4', lineHeight: 1.5 }}>
                    Bar width shows each topic's pull relative to their strongest
                  </p>
                </div>

                <div style={{ height: 1, background: '#e6e6ec', margin: '0 0 14px' }}/>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 0, rowGap: 14 }}>
                  {ai.topTopics.map((t, i) => {
                    // Square-root scaling — stops one runaway leader (517K) from
                    // squashing every other topic's bar into a sliver. sqrt(val/max)
                    // compresses the gap so a second-place topic still shows real
                    // bar length while the leader stays at 100%.
                    const ratio = (t.avgViews || 0) / maxViews
                    const pct   = Math.sqrt(ratio) * 100
                    const col   = BAR_COLOR
                    const isRightCol = i % 2 === 1
                    return (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        paddingLeft:  isRightCol ? 20 : 0,
                        paddingRight: isRightCol ? 0 : 20,
                        borderLeft:   isRightCol ? '1px solid #fde68a' : 'none',
                      }}>
                        <span style={{ fontSize: 13, color: '#52525b', fontWeight: 500,
                          flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap' }}>
                          {t.topic}
                        </span>
                        <div style={{ flex: 1, height: 4, background: '#eeeef3', borderRadius: 99,
                          overflow: 'hidden', minWidth: 40 }}>
                          <div style={{ width: `${Math.max(pct, 2)}%`, height: '100%', background: col,
                            borderRadius: 99, transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)' }}/>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: col,
                          fontVariantNumeric: 'tabular-nums', minWidth: 52, textAlign: 'right',
                          flexShrink: 0 }}>
                          {fmtK(t.avgViews)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── Title patterns — Title Scorecard hero layout (SeoOptimizer.jsx:1015-1097)
           Three panels separated by 3px amber vertical bars:
             • Left — big scoreColor'd number + "AVG LENGTH" label + vs-YT-cap delta
             • Middle — "DOMINANT FORMATS" eyebrow + numbered list of format strings
             • Right — "TITLE VOCABULARY" eyebrow + Top keywords (neutral chips) +
               Power words (amber chips) stacked
           H2 + subtitle above the card, matching the Top content topics header. */}
      {ai.titlePatterns && (() => {
        const len      = ai.titlePatterns.avgTitleLength || 0
        const lenCol   = len <= 60 ? '#059669' : len <= 80 ? '#d97706' : '#e5251b'
        const overCap  = len > 100
        const capDelta = 100 - len
        const deltaCol = overCap ? '#e5251b' : '#059669'

        return (
          <div>
            <div style={{ marginBottom: 12 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0a0a0f',
                letterSpacing: '-0.3px' }}>
                Title patterns
              </h2>
            </div>

            <Card topAccent={null}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>

                {/* LEFT — big avg length + label + delta (scoreColor by truncation risk) */}
                <div style={{ flexShrink: 0, textAlign: 'center', minWidth: 120 }}>
                  <p style={{ fontSize: 44, fontWeight: 800, color: lenCol,
                    letterSpacing: '-1.2px', lineHeight: 1 }}>
                    {len}
                    <span style={{ fontSize: 16, color: '#9595a4', fontWeight: 600,
                      letterSpacing: '-0.3px', marginLeft: 2 }}>/100</span>
                  </p>
                  <p style={{ fontSize: 11, color: '#9595a4', fontWeight: 500, marginTop: 4,
                    letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                    Avg title length
                  </p>
                  {capDelta !== 0 && (
                    <p style={{ fontSize: 11, fontWeight: 700, color: deltaCol, marginTop: 3 }}>
                      {overCap ? '▲' : '▼'} {Math.abs(capDelta)} {overCap ? 'over' : 'under'} YT cap
                    </p>
                  )}
                </div>

                {/* AMBER 3px vertical divider */}
                <div style={{ width: 3, alignSelf: 'stretch', background: '#d97706',
                  flexShrink: 0, borderRadius: 2 }}/>

                {/* MIDDLE — dominant formats listed as verdict-style content */}
                <div style={{ flex: 1.3, minWidth: 0 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#9595a4',
                    letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
                    Dominant formats
                  </p>
                  {ai.titlePatterns.dominantFormats?.length > 0 ? (
                    <ol style={{ listStyle: 'none', padding: 0, margin: 0,
                      display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {ai.titlePatterns.dominantFormats.map((f, i) => (
                        <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#d97706',
                            fontVariantNumeric: 'tabular-nums', flexShrink: 0, marginTop: 3,
                            minWidth: 14 }}>
                            {i + 1}
                          </span>
                          <p style={{ fontSize: 13, color: '#111114', lineHeight: 1.6, fontWeight: 400 }}>
                            {f}
                          </p>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p style={{ fontSize: 13, color: '#9595a4' }}>No format patterns detected.</p>
                  )}
                </div>

                {/* AMBER 3px vertical divider */}
                <div style={{ width: 3, alignSelf: 'stretch', background: '#d97706',
                  flexShrink: 0, borderRadius: 2 }}/>

                {/* RIGHT — title vocabulary (keywords + power words) */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#9595a4',
                    letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
                    Title vocabulary
                  </p>

                  {ai.titlePatterns.topKeywords?.length > 0 && (
                    <div style={{ marginBottom: ai.titlePatterns.powerWordsUsed?.length > 0 ? 12 : 0 }}>
                      <p style={{ fontSize: 10, fontWeight: 600, color: '#9595a4',
                        letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>
                        Keywords
                      </p>
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
                      <p style={{ fontSize: 10, fontWeight: 600, color: '#9595a4',
                        letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>
                        Power words
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {ai.titlePatterns.powerWordsUsed.map((w, i) => (
                          <span key={i} className="comp-tag" style={{ background: '#fffbeb',
                            color: '#d97706', border: '1px solid #fde68a' }}>{w}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )
      })()}

      {/* ── winning moves — 2-column grid of Priority-Actions InsightCards ───
           Exact Dashboard.jsx:1063-1155 InsightCard design, arranged 2-per-row.
           Even-count rule: slice to largest even ≤ N, capped at 10 (so 7→6,
           11→10, 8→8) so the 2-col grid has no orphan.
           Body: 2-col grid (Why now + Action), the Expected-outcome slot is
           omitted — Winning moves only has 2 data fields.
           No checkbox (observations, not tickable tasks). */}
      {showProse && ai.winningMoves?.length > 0 && (() => {
        const evenCount = Math.min(10, Math.floor(ai.winningMoves.length / 2) * 2)
        const moves = ai.winningMoves.slice(0, evenCount)
        if (moves.length === 0) return null

        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <p style={{ fontSize: 20, fontWeight: 800, color: '#111114', letterSpacing: '-0.5px' }}>
                Winning moves
              </p>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#9595a4', background: '#f1f1f6',
                padding: '2px 8px', borderRadius: 20, border: '1px solid #e6e6ec' }}>
                {moves.length}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {moves.map((m, i) => {
                const parts  = m.split(/\s+—\s+/)
                const action = (parts[0] || m).trim()
                const why    = parts.length > 1 ? parts.slice(1).join(' — ').trim() : null

                return (
                  <div key={i} className="comp-card" style={{
                    borderRadius: 14,
                    overflow: 'hidden',
                    borderTop: '3px solid #d97706',
                  }}>
                    <div style={{ padding: '16px 22px 18px' }}>

                      {/* Header — rank badge + category eyebrow + bold title */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                        <div style={{ width: 26, height: 26, borderRadius: 8, background: '#d97706',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                          <span style={{ fontSize: 12, fontWeight: 900, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
                            {i + 1}
                          </span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 10, fontWeight: 700, color: '#d97706',
                            letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>
                            Winning move
                          </p>
                          <p style={{ fontSize: 14, fontWeight: 700, color: '#111114', lineHeight: 1.55 }}>
                            {action}
                          </p>
                        </div>
                      </div>

                      {/* Divider — marginLeft:38 past the badge column (no checkbox, so no +8) */}
                      <div style={{ height: 1, background: '#e6e6ec', marginBottom: 14, marginLeft: 38 }} />

                      {/* Body — 2-col grid (Why now + Action); Expected-outcome slot omitted */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginLeft: 38 }}>

                        {/* Why now — blue tint, same palette as Overview's Why-now cell */}
                        <div style={{ background: 'rgba(79,134,247,0.07)',
                          border: '1px solid rgba(79,134,247,0.12)',
                          borderRadius: 10, padding: '12px 14px' }}>
                          <p style={{ fontSize: 10, fontWeight: 700, color: '#4a7cf7',
                            letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                            Why now
                          </p>
                          <p style={{ fontSize: 13.5, color: '#111114', lineHeight: 1.72 }}>
                            {why || '—'}
                          </p>
                        </div>

                        {/* Action — white + amber left bar, same as Overview's Action slot */}
                        <div style={{
                          background: '#ffffff',
                          border: '1px solid #e6e6ec',
                          borderLeft: '3px solid #d97706',
                          borderRadius: '0 10px 10px 0',
                          padding: '12px 16px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                          display: 'flex', flexDirection: 'column',
                        }}>
                          <p style={{ fontSize: 10, fontWeight: 700, color: '#d97706',
                            letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                            Action
                          </p>
                          <p style={{ fontSize: 13.5, color: '#111114', lineHeight: 1.72 }}>{action}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}

      {/* ── Topics to tackle + Top videos — 3-column paneled card ───────────
           Three panels separated by 3px amber vertical bars.
           Topics split BALANCED across cols 1 and 2 — ceil(N/2) | floor(N/2):
             6 ideas → 3+3 · 7 → 4+3 · 10 → 5+5
           No amber top border on the card — only the vertical dividers. */}
      {/* ─── Topics to tackle ───────────────────────────────────────────────
           Actionable list (the actionable verbatim ideas the user can
           check off). Title + small target-keyword chip per row; the
           AI angle paragraph that used to sit under each title is gone
           (it was the page's biggest source of unread prose). */}
      {ideas.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0a0a0f', letterSpacing: '-0.3px' }}>
              Topics to tackle
            </h2>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#9595a4', background: '#f1f1f6',
              padding: '2px 8px', borderRadius: 20, border: '1px solid #e6e6ec' }}>
              {ideasLeft} left
            </span>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column',
            gap: 2, padding: 0, margin: 0 }}>
            {ideas.map((idea, i) => {
              const isDone = !!checksForChannel[idea.title]
              return (
                <li key={i} className="comp-qw-row" style={{ opacity: isDone ? 0.5 : 1 }}>
                  <input
                    type="checkbox"
                    checked={isDone}
                    onChange={() => onToggleIdea && onToggleIdea(channelId, idea.title)}
                    style={{ width: 14, height: 14, accentColor: '#059669', cursor: 'pointer',
                      flexShrink: 0, marginTop: 4 }}
                  />
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <p style={{ fontSize: 13.5, fontWeight: 600,
                      color: isDone ? '#9595a4' : '#0a0a0f', lineHeight: 1.5,
                      letterSpacing: '-0.1px',
                      textDecoration: isDone ? 'line-through' : 'none' }}>
                      {idea.title}
                    </p>
                    {idea.targetKeyword && !isDone && (
                      <span className="comp-tag" style={{ background: '#f4f4f6', color: '#52525b',
                        border: '1px solid rgba(0,0,0,0.09)', whiteSpace: 'nowrap' }}>
                        {idea.targetKeyword}
                      </span>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* ─── Show full analysis ─────────────────────────────────────────────
           Disclosure toggle. Closed by default. When opened, reveals the
           three prose-heavy sections (Intelligence summary, Channel
           insights, Winning moves) that were demoted from the default
           visible layout. The toggle sits on its own row near the bottom
           so the visual report is the dominant experience. */}
      <div style={{ marginTop: 4 }}>
        <button
          type="button"
          onClick={() => setShowProse(p => !p)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '9px 16px', borderRadius: 100,
            border: '1px solid rgba(10,10,15,0.12)',
            background: showProse ? 'rgba(10,10,15,0.04)' : '#ffffff',
            color: showProse ? '#0a0a0f' : 'rgba(10,10,15,0.62)',
            fontFamily: 'inherit',
            fontSize: 12.5, fontWeight: 600, letterSpacing: '-0.01em',
            cursor: 'pointer',
            transition: 'background 140ms ease, color 140ms ease, border-color 140ms ease',
          }}
          onMouseEnter={e => {
            if (showProse) return
            e.currentTarget.style.background = 'rgba(15,15,19,0.03)'
            e.currentTarget.style.color = '#0a0a0f'
            e.currentTarget.style.borderColor = 'rgba(10,10,15,0.20)'
          }}
          onMouseLeave={e => {
            if (showProse) return
            e.currentTarget.style.background = '#ffffff'
            e.currentTarget.style.color = 'rgba(10,10,15,0.62)'
            e.currentTarget.style.borderColor = 'rgba(10,10,15,0.12)'
          }}
        >
          {showProse ? 'Hide full analysis' : 'Show full analysis'}
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none"
            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: showProse ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms ease' }}>
            <polyline points="3,4.5 6,7.5 9,4.5"/>
          </svg>
        </button>
      </div>

    </div>
  )
}

// ─── main page ────────────────────────────────────────────────────────────────
export default function Competitors({ plan, freeTierFeatures }) {
  // Free-tier one-run gate. Pre-loaded from /auth/me; flips to true on a
  // live 403 from /competitors/analyze. Backend remains the source of truth.
  const [gated, setGated] = useState(
    (plan || 'free') === 'free'
    && (freeTierFeatures?.competitors === 'locked' || freeTierFeatures?.competitors === 'used')
  )
  useCompetitorStyles()

  const [searchQuery, setSearchQuery]       = useState('')
  const [searchResults, setSearchResults]   = useState([])
  const [analyses, setAnalyses]             = useState(() => loadTracked())
  const [loadingSearch, setLoadingSearch]   = useState(false)
  const [loadingAnalyze, setLoadingAnalyze] = useState(null)
  const [analyzeError, setAnalyzeError]     = useState('')
  const [creditsOut, setCreditsOut]         = useState(false)
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
    // Client-side short-circuit for free-tier one-run users who've already
    // analysed once this cycle. Avoids the wasted backend call; backend
    // still gates as defense-in-depth.
    if (gated) {
      setCreditsOut(true)
      return
    }
    setLoadingAnalyze(channelId)
    setAnalyzeError('')
    fetch(`/competitors/analyze/${channelId}`, { credentials: 'include' })
      .then(async r => {
        const d = await r.json().catch(() => ({}))
        // 403 "locked" = free-tier one-run gate hit. Flip to upsell; don't
        // show an error banner.
        if (r.status === 403 && (d.error === 'locked' || d.reason === 'used' || d.reason === 'locked')) {
          setGated(true)
          setCreditsOut(true)
          setLoadingAnalyze(null)
          return null
        }
        // 402 = out of credits for paid users. Surface upgrade nudge.
        if (r.status === 402) {
          setCreditsOut(true)
          setLoadingAnalyze(null)
          return null
        }
        return d
      })
      .then(d => {
        if (d === null) return
        if (d && d.competitor) {
          const entry = { ...d, savedAt: new Date().toISOString() }
          setAnalyses(prev => {
            const next = [...prev, entry]
            setExpandedIdx(next.length - 1)
            return next
          })
          setActiveTab('tracked')
          window.dispatchEvent(new CustomEvent('ytg:credits-changed'))
        } else {
          setAnalyzeError((d && d.error) || 'Analysis failed. Please try again.')
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

  // Intent-based paywall: the page always renders. Gated users can still
  // browse Tracked analyses and search channels; clicking Analyze on a new
  // channel triggers the upgrade modal.

  return (
    <div className="comp-page">
      {/* ── header. Confident-but-restrained: 24/500 Geist with looser
            tracking. Subtitle reads as caption, not as a competing line. */}
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 24, fontWeight: 500, color: '#0a0a0f', marginBottom: 6, letterSpacing: '-0.5px', lineHeight: 1.15 }}>
          Competitors
        </h1>
        <p style={{ fontSize: 13.5, color: 'rgba(10,10,15,0.45)', fontWeight: 450, letterSpacing: '-0.005em' }}>
          Track channels in your niche, get the full AI breakdown of what is working for them
        </p>
      </div>

      {/* ── tabs. Quiet pill-nav style. Active = soft tint background,
            inactive = transparent. No red glow, no bold weight, no
            elevation. ── */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 22 }}>
        {TABS.map(({ key, label }) => (
          <button key={key}
            className={`comp-tab-btn ${activeTab === key ? 'active' : 'inactive'}`}
            onClick={() => setActiveTab(key)}>
            {label}
          </button>
        ))}
      </div>

      {/* ══ search tab. Composer-style search input row at top, no
             wrapping card — the input is the focal element by itself
             with its own elevation. ══════════════════════════════════ */}
      {activeTab === 'search' && (
        <div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
            <input
              className="comp-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search a channel by name or paste its URL"
            />
            <button className="comp-btn-primary" onClick={handleSearch} disabled={loadingSearch}>
              {loadingSearch ? 'Searching' : 'Search'}
            </button>
          </div>

          {!searched && (
            <div className="comp-empty-state">
              <div style={{ width: 44, height: 44, borderRadius: 13, background: '#f0f0f3', border: '1px solid rgba(0,0,0,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#a0a0b0" strokeWidth="1.6" strokeLinecap="round"><circle cx="8.5" cy="8.5" r="5.5"/><line x1="13" y1="13" x2="17" y2="17"/></svg>
              </div>
              <p style={{ fontWeight: 500, color: '#0a0a0f', marginBottom: 4, fontSize: 14, letterSpacing: '-0.01em' }}>Search for a channel to compare</p>
              <p style={{ fontSize: 13, color: 'rgba(10,10,15,0.45)', fontWeight: 450, letterSpacing: '-0.005em' }}>Type any YouTube channel name above</p>
            </div>
          )}

          {searched && !loadingSearch && searchResults.length === 0 && (
            <div className="comp-empty-state">
              <div style={{ width: 44, height: 44, borderRadius: 13, background: '#f0f0f3', border: '1px solid rgba(0,0,0,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#a0a0b0" strokeWidth="1.6" strokeLinecap="round"><circle cx="8.5" cy="8.5" r="5.5"/><line x1="13" y1="13" x2="17" y2="17"/><line x1="6.5" y1="8.5" x2="10.5" y2="8.5"/></svg>
              </div>
              <p style={{ fontWeight: 500, color: '#0a0a0f', marginBottom: 4, fontSize: 14, letterSpacing: '-0.01em' }}>No channels found</p>
              <p style={{ fontSize: 13, color: 'rgba(10,10,15,0.45)', fontWeight: 450, letterSpacing: '-0.005em' }}>Try a different name or paste the channel URL</p>
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
              <p style={{ fontWeight: 500, color: '#0a0a0f', marginBottom: 4, fontSize: 14, letterSpacing: '-0.01em' }}>No competitors tracked yet</p>
              <p style={{ fontSize: 13, color: 'rgba(10,10,15,0.45)', fontWeight: 450, letterSpacing: '-0.005em', maxWidth: 320, margin: '0 auto', lineHeight: 1.55 }}>
                Search a channel and click Analyze. It saves here so you can dip back into the report later.
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

              // chevron direction — sole right-side affordance on the row
              const Chevron = () => (
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                  style={{ transition: 'transform 200ms cubic-bezier(0.32, 0.72, 0, 1)', transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                  <path d="M4 6l3.5 3.5L11 6"/>
                </svg>
              )

              // Threat: saturated semantic dot (red/amber/green from THREAT)
              // + small colored label next to the name. Previous version
              // grayed-out medium/low so they were invisible at a glance;
              // the whole point of the threat field is to scan it.
              const threatDot = threat?.dot || null

              return (
                <div key={comp.channel_id} className="comp-accordion-wrapper"
                  style={{ marginBottom: 10, position: 'relative' }}>

                  {/* ── trash: appears on row hover, sits before the chevron ── */}
                  <button className="comp-remove-btn"
                    title="Remove competitor"
                    onClick={e => handleRemove(e, comp.channel_id)}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M2 3.5h10M5.5 3.5V2.5h3v1M5 5.5l.5 5M9 5.5l-.5 5M3 3.5l.7 8.5h6.6L11 3.5"/>
                    </svg>
                  </button>

                  {/* ── card. Stripe + identity row + visual signal row.
                       Whole card is the click target for expand/collapse;
                       thumbnail tiles stop propagation and open YouTube. */}
                  <div className={`comp-accordion-header ${isOpen ? 'open' : 'closed'}`}
                    onClick={() => setExpandedIdx(isOpen ? null : i)}>

                    {/* 3px stripe — threat color (gray when no AI yet) */}
                    <div className="comp-stripe"
                      style={{ background: threatDot || 'rgba(10,10,15,0.10)' }} />

                    {/* Identity row */}
                    <div className="comp-identity-row">
                      {comp.thumbnail && (
                        <img src={comp.thumbnail} alt="" referrerPolicy="no-referrer"
                          style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover',
                            flexShrink: 0, boxShadow: '0 1px 2px rgba(15,15,25,0.10)' }} />
                      )}

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          {threatDot && (
                            <span aria-hidden="true" style={{
                              flexShrink: 0,
                              width: 8, height: 8, borderRadius: 99,
                              background: threatDot,
                              boxShadow: `0 0 0 3px ${threatDot}22`,
                            }}/>
                          )}
                          <p style={{ fontWeight: 500, fontSize: 15, color: '#0a0a0f',
                            letterSpacing: '-0.2px', whiteSpace: 'nowrap', overflow: 'hidden',
                            textOverflow: 'ellipsis' }}>
                            {comp.channel_name}
                          </p>
                          {threat && (
                            <span style={{ flexShrink: 0, fontSize: 12.5, fontWeight: 600,
                              color: threat.text, letterSpacing: '-0.05px' }}>
                              <span style={{ color: 'rgba(10,10,15,0.18)', margin: '0 6px',
                                fontWeight: 400 }}>·</span>
                              {threat.label}
                            </span>
                          )}
                        </div>

                        <div className="comp-meta-line">
                          <span><span className="val">{fmtK(comp.subscribers)}</span> subs</span>
                          <span className="sep">·</span>
                          <span><span className="val">{fmtK(comp.avg_views_per_video)}</span> avg views</span>
                          {ai && (
                            <>
                              <span className="sep">·</span>
                              <span><span className="val">{ai.gapsToExploit?.length || 0}</span> gaps</span>
                            </>
                          )}
                          {savedAt && (
                            <>
                              <span className="sep">·</span>
                              <span>{savedAt}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <button className={`comp-btn-report ${isOpen ? 'open' : ''}`}
                        aria-label={isOpen ? 'Close report' : 'Open report'}
                        onClick={e => { e.stopPropagation(); setExpandedIdx(isOpen ? null : i) }}>
                        <Chevron />
                      </button>
                    </div>

                    {/* Visual signal row — 3 most-recent videos as real
                         thumbnails. Show, not tell. Renders only when we
                         actually have video data on the analysis. */}
                    {(() => {
                      const vids = Array.isArray(comp.top_5_videos) ? comp.top_5_videos.slice(0, 3) : []
                      if (vids.length === 0) return null
                      const topViews = Math.max(...vids.map(v => v.views || 0))
                      const fmtAge = (iso) => {
                        if (!iso) return ''
                        const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
                        if (days < 1)  return 'today'
                        if (days < 7)  return `${days}d ago`
                        if (days < 30) return `${Math.floor(days/7)}w ago`
                        if (days < 365) return `${Math.floor(days/30)}mo ago`
                        return `${Math.floor(days/365)}y ago`
                      }
                      return (
                        <div className="comp-signal-row">
                          <div className="comp-signal-eyebrow">
                            <span className="label">Recent uploads</span>
                            {topViews > 0 && (
                              <span className="perf">
                                <span className="dot"/> Top performer <strong>{fmtK(topViews)} views</strong>
                              </span>
                            )}
                          </div>
                          <div className="comp-thumb-grid">
                            {vids.map((v, vi) => (
                              <a key={v.video_id || vi}
                                href={v.video_id ? `https://www.youtube.com/watch?v=${v.video_id}` : '#'}
                                target="_blank" rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="comp-thumb-tile">
                                <div className="comp-thumb-img">
                                  {v.thumbnail && (
                                    <img src={v.thumbnail} alt="" referrerPolicy="no-referrer" loading="lazy" />
                                  )}
                                  {v.views > 0 && (
                                    <span className="comp-thumb-views">{fmtK(v.views)}</span>
                                  )}
                                </div>
                                <div className="comp-thumb-text">
                                  <p className="comp-thumb-title">{v.title}</p>
                                  <p className="comp-thumb-meta">{fmtAge(v.published_at)}</p>
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )
                    })()}
                  </div>

                  {/* ── expanded report ── */}
                  {isOpen && (
                    <div className="comp-accordion-body">
                      <AIAnalysis
                        ai={ai}
                        comp={comp}
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

      {gated ? (
        <UpsellModal
          open={creditsOut}
          onClose={() => setCreditsOut(false)}
          title="You've used your free Competitor analysis"
          description="Free accounts get one competitor deep-dive per monthly cycle. Upgrade to keep analysing channels, their posting cadence, their title patterns, and the video ideas their audience is asking for."
          bullets={[
            'Unlimited competitor deep-dives every month',
            'Full AI breakdown, posting timing, title patterns, playbook',
            'Video ideas pooled from every competitor you analyse',
          ]}
          showPackLink={false}
        />
      ) : (
        <CreditsEmptyModal
          open={creditsOut}
          onClose={() => setCreditsOut(false)}
          featureName="competitor analyses"
        />
      )}
    </div>
  )
}
