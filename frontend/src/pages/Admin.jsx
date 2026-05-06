import { useEffect, useState } from 'react'

/* ── Design tokens — exact match to Dashboard.jsx / SeoOptimizer.jsx ───── */
const C = {
  red:      '#e5251b', redBg:    '#fff5f5', redBdr:    '#fecaca',
  green:    '#059669', greenBg:  '#ecfdf5', greenBdr:  '#a7f3d0',
  amber:    '#d97706', amberBg:  '#fffbeb', amberBdr:  '#fde68a',
  text1:    '#0f0f13',
  text2:    '#4a4a58',
  text3:    '#9595a4',
  border:   '#e6e6ec',
  bg:       '#f5f5f9',
  surface:  '#ffffff',
}

const CARD = {
  background:   C.surface,
  border:       `1px solid ${C.border}`,
  borderRadius: 16,
  boxShadow:    '0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.06)',
}

const PAGE_SIZE_SIGNUPS = 8
const PAGE_SIZE_TOP     = 5

const COUNTRY_FLAGS = {
  "Afghanistan":"🇦🇫","Albania":"🇦🇱","Algeria":"🇩🇿","Argentina":"🇦🇷",
  "Australia":"🇦🇺","Austria":"🇦🇹","Bangladesh":"🇧🇩","Belgium":"🇧🇪",
  "Brazil":"🇧🇷","Canada":"🇨🇦","Chile":"🇨🇱","China":"🇨🇳",
  "Colombia":"🇨🇴","Croatia":"🇭🇷","Czech Republic":"🇨🇿","Denmark":"🇩🇰",
  "Egypt":"🇪🇬","Ethiopia":"🇪🇹","Finland":"🇫🇮","France":"🇫🇷",
  "Germany":"🇩🇪","Ghana":"🇬🇭","Greece":"🇬🇷","Hungary":"🇭🇺",
  "India":"🇮🇳","Indonesia":"🇮🇩","Iran":"🇮🇷","Iraq":"🇮🇶",
  "Ireland":"🇮🇪","Israel":"🇮🇱","Italy":"🇮🇹","Japan":"🇯🇵",
  "Jordan":"🇯🇴","Kenya":"🇰🇪","Malaysia":"🇲🇾","Mexico":"🇲🇽",
  "Morocco":"🇲🇦","Netherlands":"🇳🇱","New Zealand":"🇳🇿","Nigeria":"🇳🇬",
  "Norway":"🇳🇴","Pakistan":"🇵🇰","Peru":"🇵🇪","Philippines":"🇵🇭",
  "Poland":"🇵🇱","Portugal":"🇵🇹","Romania":"🇷🇴","Russia":"🇷🇺",
  "Saudi Arabia":"🇸🇦","Serbia":"🇷🇸","Singapore":"🇸🇬","South Africa":"🇿🇦",
  "South Korea":"🇰🇷","Spain":"🇪🇸","Sri Lanka":"🇱🇰","Sweden":"🇸🇪",
  "Switzerland":"🇨🇭","Taiwan":"🇹🇼","Tanzania":"🇹🇿","Thailand":"🇹🇭",
  "Turkey":"🇹🇷","Uganda":"🇺🇬","Ukraine":"🇺🇦","United Arab Emirates":"🇦🇪",
  "United Kingdom":"🇬🇧","United States":"🇺🇸","Venezuela":"🇻🇪",
  "Vietnam":"🇻🇳","Zimbabwe":"🇿🇼",
}

/* ── Styles ─────────────────────────────────────────────────────────────── */
function useAdminStyles() {
  useEffect(() => {
    if (!document.getElementById('ytg-admin-fonts')) {
      const link = document.createElement('link')
      link.id  = 'ytg-admin-fonts'
      link.rel = 'stylesheet'
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'
      document.head.appendChild(link)
    }
    if (!document.getElementById('ytg-admin-styles')) {
      const style = document.createElement('style')
      style.id = 'ytg-admin-styles'
      style.textContent = `
        .adm, .adm * { font-family:'Inter',system-ui,sans-serif; -webkit-font-smoothing:antialiased; box-sizing:border-box; }
        .adm p,.adm span,.adm div,.adm h1,.adm h2,.adm h3 { margin:0; }
        .adm .num { font-variant-numeric:tabular-nums; }

        /* Light stat card — subtle gradient bg + radial glow + accent line */
        .adm-stat-card {
          background:linear-gradient(165deg, #ffffff 0%, #fafafd 60%, #f6f5fa 100%);
          border:1px solid #e6e6ec; border-radius:20px;
          padding:24px 26px 22px;
          box-shadow:0 1px 2px rgba(0,0,0,0.03),0 6px 18px rgba(0,0,0,0.05);
          transition:box-shadow 0.22s,transform 0.22s,border-color 0.22s;
          cursor:default; position:relative; overflow:hidden;
        }
        .adm-stat-card::before {
          content:''; position:absolute; top:0; left:0; right:0; height:3px;
          background:linear-gradient(90deg, var(--adm-accent, #e5251b) 0%, var(--adm-accent, #e5251b) 55%, rgba(229,37,27,0) 100%);
          opacity:0.9; transition:opacity 0.22s;
        }
        /* Soft red glow blooming behind the icon corner — gives the card "life" */
        .adm-stat-card::after {
          content:''; position:absolute; top:-30px; right:-30px;
          width:140px; height:140px; border-radius:50%;
          background:radial-gradient(circle, rgba(229,37,27,0.10) 0%, rgba(229,37,27,0.04) 40%, transparent 70%);
          pointer-events:none;
        }
        .adm-stat-card:hover {
          box-shadow:0 6px 18px rgba(0,0,0,0.07),0 24px 50px rgba(0,0,0,0.08);
          transform:translateY(-3px); border-color:rgba(229,37,27,0.18);
        }
        .adm-stat-card:hover::before { opacity:1; }

        /* Branded red gradient icon badge (matches paywall + auth modal) */
        .adm-stat-icon {
          width:34px; height:34px; border-radius:10px;
          display:flex; align-items:center; justify-content:center;
          background:linear-gradient(180deg, #e5251b 0%, #a50f07 100%);
          color:#ffffff;
          box-shadow:0 4px 10px rgba(229,37,27,0.32), inset 0 1px 0 rgba(255,255,255,0.18);
          transition:transform 0.18s, box-shadow 0.18s;
        }
        .adm-stat-card:hover .adm-stat-icon {
          transform:scale(1.05);
          box-shadow:0 6px 14px rgba(229,37,27,0.42), inset 0 1px 0 rgba(255,255,255,0.22);
        }

        /* Hero RED stat card — full gradient background (matches money calc result card + affiliate annual card) */
        .adm-stat-card-red {
          position:relative; overflow:hidden;
          background:linear-gradient(160deg, #ff3b30 0%, #e5251b 45%, #a50f07 100%);
          border:none; border-radius:20px;
          padding:24px 26px 22px;
          color:#ffffff;
          box-shadow:0 4px 18px rgba(229,37,27,0.34), 0 24px 60px rgba(229,37,27,0.20), inset 0 1px 0 rgba(255,255,255,0.18);
          transition:transform 0.22s, box-shadow 0.22s;
          cursor:default;
        }
        /* Soft white sheen in corner — gives the red card movement */
        .adm-stat-card-red::after {
          content:''; position:absolute; top:-40px; right:-40px;
          width:180px; height:180px; border-radius:50%;
          background:radial-gradient(circle, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.06) 45%, transparent 70%);
          pointer-events:none;
        }
        .adm-stat-card-red:hover {
          transform:translateY(-3px);
          box-shadow:0 8px 24px rgba(229,37,27,0.42), 0 32px 80px rgba(229,37,27,0.28), inset 0 1px 0 rgba(255,255,255,0.22);
        }
        /* Icon inside the red card flips to a translucent white plate */
        .adm-stat-icon-red {
          width:34px; height:34px; border-radius:10px;
          display:flex; align-items:center; justify-content:center;
          background:rgba(255,255,255,0.16);
          border:1px solid rgba(255,255,255,0.22);
          color:#ffffff;
          backdrop-filter:blur(6px);
          -webkit-backdrop-filter:blur(6px);
        }

        /* Delta chip — replaces inline trend text */
        .adm-delta {
          display:inline-flex; align-items:center; gap:3px;
          padding:2px 8px; border-radius:100px;
          font-size:11px; font-weight:700; line-height:1;
          font-variant-numeric:tabular-nums; letter-spacing:-0.05px;
        }

        /* Section title block — bigger, bolder, with a real subhead "vibe" */
        .adm-section-title {
          display:flex; align-items:center; gap:10px;
        }
        .adm-section-title h2 {
          font-size:18px; font-weight:800; color:#0f0f13; letter-spacing:-0.4px;
        }
        .adm-section-count {
          font-size:11.5px; font-weight:700; color:#e5251b;
          background:#fff5f5; border:1px solid #fecaca;
          padding:2px 9px; border-radius:100px;
          font-variant-numeric:tabular-nums;
        }
        .adm-section-sub {
          font-size:14px; color:#4a4a58; font-weight:500; line-height:1.55;
          margin-top:5px;
        }
        /* Card-embedded section header sits at the top of a SectionCard */
        .adm-section-cardhdr {
          padding:20px 26px;
          border-bottom:1px solid #e6e6ec;
          display:flex; align-items:flex-start; justify-content:space-between; gap:14px;
          background:linear-gradient(180deg, #ffffff 0%, #fafafc 100%);
        }

        /* Live indicator dot pulses softly */
        .adm-live-dot {
          width:7px; height:7px; border-radius:50%;
          background:#16a34a; flex-shrink:0;
          box-shadow:0 0 0 0 rgba(22,163,74,0.45);
          animation:admPulse 2.2s ease-in-out infinite;
        }

        .adm-row { transition:background 0.13s; }
        .adm-row:hover { background:#f8f8fb !important; }
        .adm-pg-btn { transition:background 0.13s,color 0.13s,border-color 0.13s; }
        .adm-pg-btn:not(:disabled):hover { background:#f4f4f8 !important; border-color:rgba(0,0,0,0.18) !important; color:#0f0f13 !important; }
        .adm-sec-btn { transition:all 0.18s; }
        .adm-sec-btn:hover { border-color:rgba(0,0,0,0.18) !important; color:#0f0f13 !important; box-shadow:0 2px 8px rgba(0,0,0,0.10),0 8px 28px rgba(0,0,0,0.10) !important; transform:translateY(-1px); }

        /* Red primary refresh button (matches ytg-dash-btn-primary on Dashboard) */
        .adm-refresh-btn:hover:not(:disabled) {
          filter:brightness(1.07); transform:translateY(-1px);
          box-shadow:0 2px 8px rgba(0,0,0,0.15), 0 8px 28px rgba(229,37,27,0.42) !important;
        }

        /* Empty state */
        .adm-empty { padding:48px 24px; text-align:center; }
        .adm-empty-icon {
          width:44px; height:44px; border-radius:12px;
          background:#f4f4f7; color:#9595a4;
          display:flex; align-items:center; justify-content:center;
          margin:0 auto 12px;
        }
        .adm-empty-text { font-size:13px; color:#9595a4; line-height:1.55; max-width:300px; margin:0 auto; }

        @keyframes admSpin { to { transform:rotate(360deg) } }
        @keyframes admPulse {
          0%,100% { box-shadow:0 0 0 0 rgba(22,163,74,0.45) }
          50%     { box-shadow:0 0 0 5px rgba(22,163,74,0) }
        }
        @keyframes admFade { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        .adm-fade { animation:admFade 0.3s ease both; }
      `
      document.head.appendChild(style)
    }
  }, [])
}

/* ── Helpers ────────────────────────────────────────────────────────────── */
function relTime(iso) {
  if (!iso) return '—'
  const d    = new Date(iso)
  const diff = Math.max(0, (Date.now() - d.getTime()) / 1000)
  if (diff < 60)         return 'just now'
  if (diff < 3600)       return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)      return `${Math.floor(diff / 3600)}h ago`
  if (diff < 86400 * 7)  return `${Math.floor(diff / 86400)}d ago`
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400 / 7)}w ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtNum(n) {
  if (n == null) return '0'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return n.toLocaleString()
}

function planLabel(plan) {
  const map = {
    free: 'Free', solo: 'Solo', growth: 'Growth', agency: 'Agency',
    lifetime_solo: 'LT Solo', lifetime_growth: 'LT Growth',
    lifetime_agency: 'LT Agency', pack: 'Pack',
  }
  return map[plan] || plan || 'Free'
}

function planBadge(plan) {
  const p = (plan || '').toLowerCase()
  if (p.includes('agency'))   return { bg: C.redBg,    color: C.red,   bdr: C.redBdr }
  if (p.includes('growth'))   return { bg: C.greenBg,  color: C.green, bdr: C.greenBdr }
  if (p.includes('solo'))     return { bg: C.amberBg,  color: C.amber, bdr: C.amberBdr }
  if (p.includes('lifetime')) return { bg: C.greenBg,  color: C.green, bdr: C.greenBdr }
  if (p.includes('pack'))     return { bg: C.amberBg,  color: C.amber, bdr: C.amberBdr }
  return { bg: '#f4f4f6', color: C.text2, bdr: C.border }
}

/* plan bar accent: 3 tiers — paid plans get vivid green/amber/red, free is neutral */
function planBarAccent(plan) {
  const p = (plan || '').toLowerCase()
  if (p.includes('agency'))   return C.red
  if (p.includes('growth'))   return C.green
  if (p.includes('solo'))     return C.amber
  if (p.includes('lifetime')) return C.green
  if (p.includes('pack'))     return C.amber
  return '#d1d1d8'  // free → muted
}

/* ── Atoms ──────────────────────────────────────────────────────────────── */
function PlanBadge({ plan }) {
  const b = planBadge(plan)
  return (
    <span style={{
      display: 'inline-block',
      background: b.bg, color: b.color, border: `1px solid ${b.bdr}`,
      fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
      padding: '3px 9px', borderRadius: 100, whiteSpace: 'nowrap',
    }}>{planLabel(plan)}</span>
  )
}

function Avatar({ src, name, size = 30 }) {
  const initial = (name || '?').trim()[0]?.toUpperCase() || '?'
  const fs = Math.round(size * 0.42)
  if (src) return (
    <img src={src} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `1px solid ${C.border}` }} />
  )
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: '#f0f0f4', color: C.text1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: fs, fontWeight: 700, flexShrink: 0, border: `1px solid ${C.border}` }}>
      {initial}
    </div>
  )
}

/* ── Stat card — solid red variant + light variant ──────────────────────── */
function Stat({ label, value, sub, accent, alert, icon, delta, variant = 'light' }) {
  // variant: 'light' (white gradient card) | 'red' (hero red gradient)
  if (variant === 'red') {
    return (
      <div className="adm-stat-card-red">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
            <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.82)' }}>{label}</p>
            {icon && <div className="adm-stat-icon-red">{icon}</div>}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
            <p className="num" style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-1.8px', color: '#fff', lineHeight: 1 }}>{value}</p>
            {delta && (
              <span className="adm-delta" style={{
                color: '#fff',
                background: 'rgba(255,255,255,0.18)',
                border: '1px solid rgba(255,255,255,0.28)',
              }}>
                <span style={{ fontSize: 9 }}>{delta.tone === 'up' ? '▲' : delta.tone === 'down' ? '▼' : '·'}</span>
                {delta.label}
              </span>
            )}
          </div>
          {sub && <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.85)', fontWeight: 500, marginTop: 16, lineHeight: 1.5, letterSpacing: '-0.1px' }}>{sub}</p>}
        </div>
      </div>
    )
  }

  // Light variant — white card with red accent
  const col = alert ? C.red : (accent || C.text1)
  const accentVar = accent || C.red
  return (
    <div className={`adm-stat-card${alert ? ' alert' : ''}`}
      style={{
        '--adm-accent': accentVar,
        ...(alert ? { borderColor: 'rgba(229,37,27,0.22)', background: '#fff8f8' } : {}),
      }}>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.text3 }}>{label}</p>
          {icon && <div className="adm-stat-icon">{icon}</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, flexWrap: 'wrap' }}>
          <p className="num" style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1.6px', color: col, lineHeight: 1 }}>{value}</p>
          {delta && (
            <span className="adm-delta" style={{
              color: delta.tone === 'up' ? C.green : delta.tone === 'down' ? C.red : C.text2,
              background: delta.tone === 'up' ? C.greenBg : delta.tone === 'down' ? C.redBg : '#f4f4f6',
              border: `1px solid ${delta.tone === 'up' ? C.greenBdr : delta.tone === 'down' ? C.redBdr : C.border}`,
            }}>
              <span style={{ fontSize: 9 }}>{delta.tone === 'up' ? '▲' : delta.tone === 'down' ? '▼' : '·'}</span>
              {delta.label}
            </span>
          )}
        </div>
        {sub && <p style={{ fontSize: 14.5, color: alert ? C.red : C.text2, fontWeight: 500, marginTop: 14, lineHeight: 1.5, letterSpacing: '-0.1px' }}>{sub}</p>}
      </div>
    </div>
  )
}

/* ── Section header (replaces SectionLabel) — title + count + optional sub */
function SectionHeader({ title, count, sub, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
      <div style={{ minWidth: 0 }}>
        <div className="adm-section-title">
          <h2>{title}</h2>
          {count != null && <span className="adm-section-count">{count}</span>}
        </div>
        {sub && <p className="adm-section-sub">{sub}</p>}
      </div>
      {right}
    </div>
  )
}

/* Backwards-compat: keep SectionLabel as an alias mapping to SectionHeader title */
function SectionLabel({ children }) {
  return <SectionHeader title={children} />
}

/* ── SectionCard — title sits INSIDE the card header, body below ────────── */
function SectionCard({ title, count, sub, right, children, padBody = 0 }) {
  return (
    <div style={{ ...CARD, overflow: 'hidden' }}>
      <div className="adm-section-cardhdr">
        <div style={{ minWidth: 0 }}>
          <div className="adm-section-title">
            <h2>{title}</h2>
            {count != null && <span className="adm-section-count">{count}</span>}
          </div>
          {sub && <p className="adm-section-sub">{sub}</p>}
        </div>
        {right && <div style={{ flexShrink: 0 }}>{right}</div>}
      </div>
      <div style={{ padding: padBody === 0 ? 0 : padBody }}>
        {children}
      </div>
    </div>
  )
}

/* ── Empty state ─────────────────────────────────────────────────────────── */
function EmptyState({ icon, children }) {
  return (
    <div className="adm-empty">
      {icon && <div className="adm-empty-icon">{icon}</div>}
      <p className="adm-empty-text">{children}</p>
    </div>
  )
}

/* ── Stat-card icons ─────────────────────────────────────────────────────── */
const Icons = {
  users: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="5" r="2.5"/>
      <path d="M1 12c0-2.2 1.8-4 4-4s4 1.8 4 4"/>
      <circle cx="10.5" cy="5.5" r="2"/>
      <path d="M13 11.5c0-1.7-1.1-3.1-2.5-3.45"/>
    </svg>
  ),
  paid: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="3" width="11" height="8" rx="1.5"/>
      <path d="M1.5 6h11"/>
      <path d="M3.5 9h2"/>
    </svg>
  ),
  trend: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1.5,9.5 5.5,5.5 8,8 12.5,3.5"/>
      <polyline points="9,3.5 12.5,3.5 12.5,7"/>
    </svg>
  ),
  bolt: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.5 1L2 8h4l-.5 5L11 6H7l.5-5z"/>
    </svg>
  ),
  inbox: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 11l3-7h8l3 7"/>
      <path d="M2 11h4l1 2h4l1-2h4v4a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z"/>
    </svg>
  ),
}

/* ── Bar row — green/amber accent palette ────────────────────────────────── */
function BarRow({ label, count, total, accent, prefix, muted }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: muted ? C.text3 : C.text2, display: 'flex', alignItems: 'center', gap: 7, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {prefix && <span style={{ fontSize: 15, flexShrink: 0 }}>{prefix}</span>}
          {label}
        </span>
        <span className="num" style={{ fontSize: 12.5, fontWeight: 700, color: muted ? C.text3 : C.text1, flexShrink: 0 }}>
          {fmtNum(count)}{' '}
          <span style={{ fontSize: 11, fontWeight: 500, color: C.text3 }}>· {pct.toFixed(0)}%</span>
        </span>
      </div>
      <div style={{ height: 6, background: '#f0f0f4', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: muted ? '#d1d1d8' : accent, borderRadius: 99, transition: 'width 0.7s cubic-bezier(0.34,1.56,0.64,1)', opacity: muted ? 0.5 : 1 }} />
      </div>
    </div>
  )
}

/* ── Pagination ─────────────────────────────────────────────────────────── */
function Pager({ page, total, onPage, pageSize = PAGE_SIZE_SIGNUPS }) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null
  const btnStyle = (disabled) => ({
    padding: '5px 16px', borderRadius: 100,
    border: '1px solid rgba(0,0,0,0.1)',
    background: C.surface, color: disabled ? C.text3 : C.text2,
    fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit',
    cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.45 : 1,
    boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 4px 14px rgba(0,0,0,0.07)',
  })
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderTop: `1px solid ${C.border}`, background: '#fafafc' }}>
      <button className="adm-pg-btn" disabled={page === 0} onClick={() => onPage(page - 1)} style={btnStyle(page === 0)}>← Prev</button>
      <span style={{ fontSize: 12, color: C.text3, fontWeight: 500 }}>Page <strong style={{ color: C.text1 }}>{page + 1}</strong> of {totalPages}</span>
      <button className="adm-pg-btn" disabled={page >= totalPages - 1} onClick={() => onPage(page + 1)} style={btnStyle(page >= totalPages - 1)}>Next →</button>
    </div>
  )
}

/* ── Table column header row ─────────────────────────────────────────────── */
function ColHeader({ cols }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: cols.map(c => c.w).join(' '),
      padding: '10px 24px', borderBottom: `1px solid ${C.border}`, background: '#fafafc',
    }}>
      {cols.map(c => (
        <div key={c.l} style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.text3, textAlign: c.r ? 'right' : 'left' }}>{c.l}</div>
      ))}
    </div>
  )
}

/* ── Tabbed Breakdowns card (plan / source / country in one widget) ────── */
const BREAKDOWN_TABS = [
  { key: 'plan',    label: 'Plan' },
  { key: 'source',  label: 'Source' },
  { key: 'country', label: 'Country' },
]

function BreakdownsCard({ plans, sources, countries, totalForPlan, totalForUtm, countryTotal, unknownCount, knownCountriesLen }) {
  const [tab, setTab] = useState('plan')

  const tabSubs = {
    plan:    'Active subscriptions split by tier',
    source:  'Where signups came from (UTM + direct)',
    country: 'Resolved from signup IP at sign-up time',
  }
  const counts = {
    plan: plans.length,
    source: sources.length,
    country: countries.filter(c => !c.unknown).length,
  }

  return (
    <div style={{ ...CARD, overflow: 'hidden' }}>
      <div className="adm-section-cardhdr">
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="adm-section-title">
            <h2>Breakdown</h2>
            <span className="adm-section-count">{counts[tab]}</span>
          </div>
          <p className="adm-section-sub">{tabSubs[tab]}</p>
        </div>
      </div>

      {/* Tab strip */}
      <div style={{ display: 'flex', gap: 6, padding: '12px 18px 0', borderBottom: `1px solid ${C.border}` }}>
        {BREAKDOWN_TABS.map(t => {
          const active = tab === t.key
          return (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '8px 14px',
              fontSize: 13, fontWeight: 600,
              fontFamily: 'inherit',
              color: active ? C.red : C.text3,
              background: 'transparent', border: 'none', cursor: 'pointer',
              borderBottom: `2px solid ${active ? C.red : 'transparent'}`,
              marginBottom: -1,
              transition: 'color 0.15s, border-color 0.15s',
            }}>
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Tab body */}
      <div style={{ padding: '20px 24px' }}>
        {tab === 'plan' && (
          plans.length === 0
            ? <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.6 }}>No subscriptions yet.</p>
            : plans.map(row => (
                <BarRow key={row.plan}
                  label={planLabel(row.plan)}
                  count={row.count}
                  total={totalForPlan}
                  accent={planBarAccent(row.plan)}
                  muted={(row.plan || 'free') === 'free'}
                />
              ))
        )}
        {tab === 'source' && (
          sources.length === 0
            ? <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.6 }}>Nothing tracked yet. Share a UTM-tagged link to start collecting attribution.</p>
            : sources.map((row, i) => (
                <BarRow key={row.source}
                  label={row.source}
                  count={row.count}
                  total={totalForUtm}
                  accent={i % 2 === 0 ? C.green : C.amber}
                />
              ))
        )}
        {tab === 'country' && (
          countryTotal === 0
            ? <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.6 }}>Country data is collected automatically on each new signup.</p>
            : <>
                {countries.slice(0, 12).map(row => (
                  <BarRow
                    key={row.country}
                    label={row.country}
                    count={row.count}
                    total={countryTotal}
                    accent={C.red}
                    prefix={row.unknown ? '🌍' : (COUNTRY_FLAGS[row.country] || '🌍')}
                    muted={!!row.unknown}
                  />
                ))}
                {unknownCount > 0 && knownCountriesLen > 0 && (
                  <p style={{ fontSize: 11.5, color: C.text3, marginTop: 8, lineHeight: 1.55 }}>
                    Country detection started recently. {unknownCount.toLocaleString()} existing {unknownCount === 1 ? 'user' : 'users'} signed up before tracking began.
                  </p>
                )}
              </>
        )}
      </div>
    </div>
  )
}

/* ── Main component ─────────────────────────────────────────────────────── */
export default function Admin() {
  useAdminStyles()
  const [data,       setData]       = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [signupPage, setSignupPage] = useState(0)
  const [topPage,    setTopPage]    = useState(0)

  // Feature requests
  const [frData,     setFrData]     = useState(null)
  const [frFilter,   setFrFilter]   = useState('all')  // all|new|planned|shipped|declined
  const [frExpanded, setFrExpanded] = useState(null)   // request id of opened body
  const [frBusy,     setFrBusy]     = useState(null)   // request id currently saving

  // TOPUP30 campaign
  const [topupData,    setTopupData]    = useState(null)   // { eligible_count, sample[] }
  const [topupSending, setTopupSending] = useState(false)
  const [topupResult,  setTopupResult]  = useState(null)   // { queued, sent_at }
  const [topupError,   setTopupError]   = useState('')

  function loadTopupPreview() {
    fetch('/admin/topup-offer/preview', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setTopupData(d) })
      .catch(() => {})
  }

  function fireTopupCampaign() {
    if (!topupData || topupData.eligible_count === 0) return
    const ok = window.confirm(
      `Send the TOPUP30 offer email to ${topupData.eligible_count} ${topupData.eligible_count === 1 ? 'user' : 'users'}?\n\n` +
      `This is idempotent — already-sent users are excluded.\n` +
      `Emails fire in a background thread at ~6/sec.`
    )
    if (!ok) return
    setTopupSending(true)
    setTopupError('')
    setTopupResult(null)
    fetch('/admin/topup-offer/send', { method: 'POST', credentials: 'include' })
      .then(async r => {
        const body = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(body.error || `Error ${r.status}`)
        return body
      })
      .then(d => {
        setTopupResult({ queued: d.queued, sentAt: Date.now() })
        // Refresh preview after a few seconds so the count drops as the
        // background thread marks recipients sent.
        setTimeout(loadTopupPreview, 8000)
      })
      .catch(e => setTopupError(e.message || 'Send failed.'))
      .finally(() => setTopupSending(false))
  }

  function loadFeatureRequests() {
    fetch('/feedback/admin/list', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setFrData(d) })
      .catch(() => {})
  }

  function setFrStatus(id, status) {
    setFrBusy(id)
    fetch(`/feedback/admin/${id}/status`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
      .then(r => r.ok ? r.json() : null)
      .then(() => loadFeatureRequests())
      .finally(() => setFrBusy(null))
  }

  useEffect(() => { loadFeatureRequests(); loadTopupPreview() }, [])

  function load(initial = false) {
    if (initial) setLoading(true); else setRefreshing(true)
    setError('')
    fetch('/admin/overview', { credentials: 'include' })
      .then(async r => {
        const body = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(body.error || `Error ${r.status}`)
        return body
      })
      .then(d => { setData(d); setLoading(false); setRefreshing(false); setSignupPage(0); setTopPage(0) })
      .catch(e => { setError(e.message); setLoading(false); setRefreshing(false) })
  }

  useEffect(() => { load(true) }, [])

  if (loading) return (
    <div className="adm" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 14 }}>
      <div style={{ width: 28, height: 28, border: `2.5px solid ${C.border}`, borderTop: `2.5px solid ${C.red}`, borderRadius: '50%', animation: 'admSpin 0.7s linear infinite' }} />
      <p style={{ fontSize: 13, color: C.text3, fontWeight: 500 }}>Loading…</p>
    </div>
  )

  if (error) return (
    <div className="adm" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12, textAlign: 'center' }}>
      <div style={{ width: 48, height: 48, borderRadius: 13, background: C.redBg, border: `1px solid ${C.redBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚠</div>
      <p style={{ fontSize: 15, fontWeight: 700, color: C.text1 }}>{error}</p>
      <button onClick={() => load(true)} style={{ padding: '8px 20px', borderRadius: 100, border: `1px solid ${C.border}`, background: C.surface, color: C.text2, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Try again</button>
    </div>
  )

  const s             = data.stats
  const trendSub      = s.signups_prev_7d > 0 ? `vs ${s.signups_prev_7d} previous week` : 'no signups previous week'
  const totalForPlan  = data.plan_breakdown.reduce((a, r) => a + r.count, 0)
  const totalForUtm   = data.utm_breakdown.reduce((a, r) => a + r.count, 0)

  /* Country — always show; append "not tracked" for existing users */
  const knownCountries  = data.country_breakdown || []
  const unknownCount    = data.unknown_country_count ?? 0
  const countryTotal    = knownCountries.reduce((a, r) => a + r.count, 0) + unknownCount
  const countryRows     = unknownCount > 0
    ? [...knownCountries, { country: 'Not tracked yet', count: unknownCount, unknown: true }]
    : knownCountries

  const signupSlice     = data.recent_signups.slice(signupPage * PAGE_SIZE_SIGNUPS, (signupPage + 1) * PAGE_SIZE_SIGNUPS)
  const topSlice        = data.top_users.slice(topPage * PAGE_SIZE_TOP, (topPage + 1) * PAGE_SIZE_TOP)

  /* Source bar accents — cycle green / amber for visual variety */
  const UTM_ACCENTS = [C.green, C.amber, C.green, C.amber, C.green, C.amber]

  const SIGNUP_COLS = [
    { l: 'User',   w: '1fr' },
    { l: 'Plan',   w: '88px' },
    { l: 'Source', w: '96px' },
    { l: 'Joined', w: '76px', r: true },
  ]
  const TOP_COLS = [
    { l: 'Channel',    w: '1fr' },
    { l: 'Plan',       w: '88px' },
    { l: 'Usage',      w: '120px', r: true },
    { l: 'Subscribers',w: '90px',  r: true },
    { l: 'Last audit', w: '96px',  r: true },
  ]

  return (
    <div className="adm adm-fade">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: C.text1, letterSpacing: '-0.7px' }}>Admin</h1>
            <span style={{
              fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: C.red, background: C.redBg, border: `1px solid ${C.redBdr}`,
              padding: '3px 9px', borderRadius: 100,
            }}>Internal</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: C.text2, fontWeight: 500 }}>
            <span className="adm-live-dot" aria-hidden="true" />
            <span>{data.generated_at ? `Updated ${relTime(data.generated_at)}` : 'Live'}</span>
          </div>
        </div>
        <button
          className="adm-refresh-btn"
          disabled={refreshing}
          onClick={() => load(false)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 22px', borderRadius: 100, border: 'none',
            background: C.red, color: '#ffffff', fontSize: 13, fontWeight: 700,
            cursor: refreshing ? 'wait' : 'pointer', fontFamily: 'inherit',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,37,27,0.32)',
            opacity: refreshing ? 0.65 : 1,
            transition: 'filter 0.18s, transform 0.18s, box-shadow 0.18s',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            style={{ animation: refreshing ? 'admSpin 0.7s linear infinite' : 'none' }}>
            <path d="M11 6.5a4.5 4.5 0 0 1-8 2.85M2 6.5a4.5 4.5 0 0 1 8-2.85"/>
            <path d="M11 1v3h-3M2 12V9h3"/>
          </svg>
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* ── Stat row — 2 hero red cards + 2 white secondary cards ─────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 16, marginBottom: 36 }}>
        <Stat
          variant="red"
          label="Total users"
          value={fmtNum(s.total_users)}
          sub="All-time signups across the platform"
          icon={Icons.users}
        />
        <Stat
          variant="red"
          label="Paid"
          value={fmtNum(s.paid_users)}
          sub={`${fmtNum(s.free_users)} still on free plan`}
          icon={Icons.paid}
          delta={s.conversion_pct > 0 ? { tone: 'up', label: `${s.conversion_pct}% conv` } : null}
        />
        <Stat
          label="Signups (7d)"
          value={fmtNum(s.signups_7d)}
          accent={s.signups_trend > 0 ? C.green : s.signups_trend < 0 ? C.red : C.amber}
          sub={trendSub}
          icon={Icons.trend}
          delta={s.signups_trend !== 0 ? {
            tone: s.signups_trend > 0 ? 'up' : 'down',
            label: `${s.signups_trend > 0 ? '+' : ''}${s.signups_trend}`,
          } : null}
        />
        <Stat
          label="Active (7d)"
          value={fmtNum(s.active_7d)}
          sub="Channels audited in the last 7 days"
          icon={Icons.bolt}
        />
      </div>

      {/* ── Two-column body: Recent signups | Tabbed Breakdowns ────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.65fr 1fr', gap: 20, marginBottom: 40 }}>

        {/* LEFT — Recent signups, title now lives inside the card header */}
        <SectionCard
          title="Recent signups"
          count={data.recent_signups.length}
          sub="The 40 most recent accounts that completed sign-up"
        >
          <ColHeader cols={SIGNUP_COLS} />
          {data.recent_signups.length === 0
            ? <EmptyState icon={Icons.users}>No signups yet. New accounts will appear here as soon as they OAuth in.</EmptyState>
            : signupSlice.map((u, i) => {
                const name  = u.display_name || u.channel_name || u.email.split('@')[0]
                const pic   = u.profile_picture || u.channel_thumbnail
                const last  = i === signupSlice.length - 1
                return (
                  <div key={u.email + i} className="adm-row" style={{
                    display: 'grid', gridTemplateColumns: SIGNUP_COLS.map(c => c.w).join(' '),
                    padding: '13px 26px', alignItems: 'center',
                    borderBottom: last ? 'none' : `1px solid ${C.border}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                      <Avatar src={pic} name={name} size={30} />
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 13.5, fontWeight: 600, color: C.text1, letterSpacing: '-0.15px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
                        <p style={{ fontSize: 11.5, color: C.text3, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</p>
                      </div>
                    </div>
                    <div><PlanBadge plan={u.plan} /></div>
                    <div style={{ fontSize: 12, color: u.utm_source ? C.text2 : C.text3, fontWeight: u.utm_source ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.utm_source || '(direct)'}
                    </div>
                    <div className="num" style={{ fontSize: 12, color: C.text3, textAlign: 'right' }}>{relTime(u.created_at)}</div>
                  </div>
                )
              })
          }
          <Pager page={signupPage} total={data.recent_signups.length} onPage={setSignupPage} />
        </SectionCard>

        {/* RIGHT — Tabbed Breakdowns (plan / source / country in one card) */}
        <BreakdownsCard
          plans={data.plan_breakdown}
          sources={data.utm_breakdown}
          countries={countryRows}
          totalForPlan={totalForPlan}
          totalForUtm={totalForUtm}
          countryTotal={countryTotal}
          unknownCount={unknownCount}
          knownCountriesLen={knownCountries.length}
        />
      </div>

      {/* ── Top users by monthly usage (top 10, 5 per page) ──────────────── */}
      <div style={{ marginBottom: 40 }}>
        <SectionCard
          title="Top users this month"
          count={data.top_users.length}
          sub="Ranked by AI analyses run this billing cycle"
        >
          <ColHeader cols={TOP_COLS} />
          {data.top_users.length === 0
            ? <EmptyState icon={Icons.bolt}>Nobody has run an analysis this month yet. The leaderboard fills as people use the product.</EmptyState>
            : topSlice.map((u, i) => {
                const usagePct = u.monthly_allowance > 0 ? Math.min(100, (u.monthly_used / u.monthly_allowance) * 100) : 0
                const barClr   = usagePct > 80 ? C.red : usagePct > 55 ? C.amber : C.green
                const last     = i === topSlice.length - 1
                return (
                  <div key={u.channel_id + i} className="adm-row" style={{
                    display: 'grid', gridTemplateColumns: TOP_COLS.map(c => c.w).join(' '),
                    padding: '13px 26px', alignItems: 'center',
                    borderBottom: last ? 'none' : `1px solid ${C.border}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                      <Avatar src={u.channel_thumbnail} name={u.channel_name} size={30} />
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 13.5, fontWeight: 600, color: C.text1, letterSpacing: '-0.15px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.channel_name || '(unnamed)'}</p>
                        <p style={{ fontSize: 11.5, color: C.text3, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.owner_email}</p>
                      </div>
                    </div>
                    <div><PlanBadge plan={u.plan} /></div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="num" style={{ fontSize: 13, fontWeight: 700, color: C.text1 }}>{u.monthly_used}</span>
                      <span style={{ fontSize: 11, color: C.text3, fontWeight: 500 }}> / {u.monthly_allowance || '∞'}</span>
                      <div style={{ marginTop: 5, height: 4, background: '#f0f0f4', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ width: `${usagePct}%`, height: '100%', background: barClr, borderRadius: 99 }} />
                      </div>
                    </div>
                    <div className="num" style={{ fontSize: 12, color: C.text2, textAlign: 'right' }}>{fmtNum(u.subscribers)}</div>
                    <div className="num" style={{ fontSize: 12, color: C.text3, textAlign: 'right' }}>{relTime(u.last_audit_at)}</div>
                  </div>
                )
              })
          }
          <Pager page={topPage} total={data.top_users.length} onPage={setTopPage} pageSize={PAGE_SIZE_TOP} />
        </SectionCard>
      </div>

      {/* ── TOPUP30 campaign ─────────────────────────────────────────────── */}
      {topupData && (
        <div style={{ marginBottom: 36 }}>
          <SectionCard
            title="TOPUP30 campaign"
            count={topupData.eligible_count}
            sub="Free users who used 2 or 3 of 3 monthly analyses. Already-sent users are excluded automatically."
            right={
              <button
                onClick={fireTopupCampaign}
                disabled={topupSending || topupData.eligible_count === 0}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 22px', borderRadius: 100, border: 'none',
                  background: topupData.eligible_count === 0 ? '#d1d1d8' : C.red,
                  color: '#ffffff', fontSize: 13, fontWeight: 700,
                  cursor: (topupSending || topupData.eligible_count === 0) ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', whiteSpace: 'nowrap',
                  boxShadow: topupData.eligible_count === 0 ? 'none' : '0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,37,27,0.32)',
                  opacity: topupSending ? 0.65 : 1,
                  transition: 'filter 0.18s, transform 0.18s',
                }}
                onMouseEnter={e => { if (!topupSending && topupData.eligible_count > 0) { e.currentTarget.style.filter = 'brightness(1.07)'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
                onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 7h10M8 3l4 4-4 4"/>
                </svg>
                {topupSending
                  ? 'Sending…'
                  : topupData.eligible_count === 0
                    ? 'No eligible users'
                    : `Send to ${topupData.eligible_count} ${topupData.eligible_count === 1 ? 'user' : 'users'}`
                }
              </button>
            }
          >
            {/* Sample list of recipients */}
            <div style={{ padding: '20px 26px' }}>
              {topupData.eligible_count === 0 ? (
                <p style={{ fontSize: 13.5, color: C.text2, lineHeight: 1.6, margin: 0 }}>
                  Nobody's sitting at 2/3 or 3/3 right now. The list will repopulate as free users approach their monthly limit.
                </p>
              ) : (
                <>
                  <p style={{ fontSize: 12, fontWeight: 700, color: C.text3, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
                    Recipients ({topupData.sample.length} of {topupData.eligible_count} shown)
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {topupData.sample.map((u, i) => {
                      const name = u.display_name || u.email.split('@')[0]
                      return (
                        <div key={u.email + i} style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '8px 12px', borderRadius: 10,
                          background: '#fafafc', border: `1px solid ${C.border}`,
                        }}>
                          <Avatar name={name} size={28} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: C.text1, letterSpacing: '-0.1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
                            <p style={{ fontSize: 11.5, color: C.text3, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</p>
                          </div>
                          <span style={{
                            fontSize: 10.5, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
                            color: u.used >= 3 ? C.red : C.amber,
                            background: u.used >= 3 ? C.redBg : C.amberBg,
                            border: `1px solid ${u.used >= 3 ? C.redBdr : C.amberBdr}`,
                            padding: '2px 8px', borderRadius: 100, flexShrink: 0,
                          }}>
                            {u.used} / 3 used
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  {topupData.eligible_count > topupData.sample.length && (
                    <p style={{ fontSize: 12, color: C.text3, marginTop: 14, textAlign: 'center' }}>
                      … and {topupData.eligible_count - topupData.sample.length} more
                    </p>
                  )}
                </>
              )}

              {/* Result / error feedback */}
              {topupResult && (
                <div style={{ marginTop: 18, padding: '12px 14px', background: C.greenBg, border: `1px solid ${C.greenBdr}`, borderRadius: 10, color: C.green, fontSize: 13, fontWeight: 600, lineHeight: 1.5 }}>
                  ✓ Queued {topupResult.queued} {topupResult.queued === 1 ? 'email' : 'emails'}. Sending in the background — refresh in a few seconds to see the count drop as recipients are marked sent.
                </div>
              )}
              {topupError && (
                <div style={{ marginTop: 18, padding: '12px 14px', background: C.redBg, border: `1px solid ${C.redBdr}`, borderRadius: 10, color: C.red, fontSize: 13, fontWeight: 600, lineHeight: 1.5 }}>
                  {topupError}
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      )}

      {/* ── Feature requests ─────────────────────────────────────────────── */}
      {frData && (() => {
        const counts = frData.counts || {}
        const all    = frData.requests || []
        const filtered = frFilter === 'all' ? all : all.filter(r => r.status === frFilter)

        const FILTERS = [
          { key: 'all',      label: 'All',       count: all.length },
          { key: 'new',      label: 'New',       count: counts.new      || 0 },
          { key: 'planned',  label: 'Planned',   count: counts.planned  || 0 },
          { key: 'shipped',  label: 'Shipped',   count: counts.shipped  || 0 },
          { key: 'declined', label: 'Declined',  count: counts.declined || 0 },
        ]

        const statusStyle = (s) => {
          if (s === 'shipped')  return { c: C.green, bg: '#ecfdf5', b: '#a7f3d0', label: 'Shipped' }
          if (s === 'planned')  return { c: C.amber, bg: '#fffbeb', b: '#fde68a', label: 'Planned' }
          if (s === 'declined') return { c: C.text3, bg: '#f4f4f6', b: C.border,  label: 'Declined' }
          return                       { c: C.text2, bg: '#f4f4f6', b: C.border,  label: 'New' }
        }

        return (
          <div style={{ marginBottom: 28 }}>
            <SectionCard
              title="Feature requests"
              count={all.length}
              sub="Submitted via Settings or the /feedback share link"
              right={
                <span style={{ fontSize: 11.5, color: C.text3, fontWeight: 500 }}>
                  Share link: <code style={{ background: '#f4f4f6', border: `1px solid ${C.border}`, padding: '2px 7px', borderRadius: 6, fontSize: 11.5, color: C.text2 }}>/feedback</code>
                </span>
              }
            >

            {/* Filter chips */}
            <div style={{ display: 'flex', gap: 7, padding: '14px 24px', flexWrap: 'wrap', borderBottom: `1px solid ${C.border}`, background: '#fafafc' }}>
              {FILTERS.map(f => {
                const active = frFilter === f.key
                return (
                  <button
                    key={f.key}
                    onClick={() => setFrFilter(f.key)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '6px 13px', borderRadius: 100,
                      border: active ? '1px solid transparent' : `1px solid ${C.border}`,
                      background: active ? C.red : C.surface,
                      color: active ? '#fff' : C.text2,
                      fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
                      cursor: 'pointer',
                      boxShadow: active ? '0 1px 3px rgba(0,0,0,0.10), 0 4px 14px rgba(229,37,27,0.28)' : 'none',
                      transition: 'all 0.15s',
                    }}
                  >
                    {f.label}
                    <span style={{
                      fontSize: 10.5, fontWeight: 700,
                      background: active ? 'rgba(255,255,255,0.22)' : '#f4f4f6',
                      color: active ? '#fff' : C.text3,
                      padding: '1px 7px', borderRadius: 100,
                    }}>{f.count}</span>
                  </button>
                )
              })}
            </div>

            <div>
              {filtered.length === 0 ? (
                <EmptyState icon={Icons.inbox}>
                  {frFilter === 'all'
                    ? 'No feature requests yet. Share the /feedback link in an email to seed the first one.'
                    : `No requests with status "${frFilter}".`}
                </EmptyState>
              ) : (
                filtered.map((r, i) => {
                  const sty = statusStyle(r.status)
                  const open = frExpanded === r.id
                  const last = i === filtered.length - 1
                  const NEXT_STATUS = { new: 'planned', planned: 'shipped', shipped: 'declined', declined: 'new' }
                  return (
                    <div key={r.id} style={{ borderBottom: last ? 'none' : `1px solid ${C.border}` }}>
                      <div className="adm-row"
                        onClick={() => setFrExpanded(open ? null : r.id)}
                        style={{
                          padding: '14px 24px', display: 'flex', alignItems: 'flex-start', gap: 14,
                          cursor: 'pointer',
                        }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 3 }}>
                            <p style={{ fontSize: 13.5, fontWeight: 700, color: C.text1, letterSpacing: '-0.15px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</p>
                            <span style={{
                              fontSize: 10, fontWeight: 700, color: sty.c, background: sty.bg,
                              border: `1px solid ${sty.b}`, padding: '2px 8px', borderRadius: 100,
                              letterSpacing: '0.05em', textTransform: 'uppercase', flexShrink: 0,
                            }}>{sty.label}</span>
                          </div>
                          <p style={{ fontSize: 11.5, color: C.text3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {r.display_name || r.email.split('@')[0]} · {r.email} · {relTime(r.created_at)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setFrStatus(r.id, NEXT_STATUS[r.status] || 'new') }}
                          disabled={frBusy === r.id}
                          style={{
                            padding: '5px 13px', borderRadius: 100,
                            border: `1px solid ${C.border}`, background: C.surface,
                            color: C.text2, fontSize: 11.5, fontWeight: 600,
                            cursor: frBusy === r.id ? 'wait' : 'pointer', fontFamily: 'inherit',
                            opacity: frBusy === r.id ? 0.55 : 1, flexShrink: 0,
                            whiteSpace: 'nowrap',
                          }}
                          title={`Move to ${NEXT_STATUS[r.status] || 'new'}`}
                        >
                          → {NEXT_STATUS[r.status] || 'new'}
                        </button>
                      </div>
                      {open && (
                        <div style={{ padding: '0 24px 16px', display: 'flex', gap: 12 }}>
                          <div style={{ flex: 1, padding: '13px 15px', background: '#fafafc', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13, color: C.text2, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
                            {r.description}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
            </SectionCard>
          </div>
        )
      })()}

    </div>
  )
}
