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

/* Monthly subscription prices (USD). Annual subscribers show up under
   the same plan name in the DB; using monthly price slightly inflates
   the MRR estimate, but keeps the math obvious for the admin glance. */
const PLAN_MONTHLY_PRICE = { solo: 19, growth: 49, agency: 149 }

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

        /* Light stat card. Subtle gradient + accent line. No icons. */
        .adm-stat-card {
          background:linear-gradient(165deg, #ffffff 0%, #fafafd 60%, #f6f5fa 100%);
          border:1px solid #e6e6ec; border-radius:20px;
          padding:26px 28px 24px;
          box-shadow:0 1px 2px rgba(0,0,0,0.03),0 6px 18px rgba(0,0,0,0.05);
          transition:box-shadow 0.22s,transform 0.22s,border-color 0.22s;
          cursor:default; position:relative; overflow:hidden;
        }
        .adm-stat-card::before {
          content:''; position:absolute; top:0; left:0; right:0; height:3px;
          background:linear-gradient(90deg, var(--adm-accent, #e5251b) 0%, var(--adm-accent, #e5251b) 55%, rgba(229,37,27,0) 100%);
          opacity:0.9; transition:opacity 0.22s;
        }
        /* Soft red glow blooming behind the corner — gives the card "life" */
        .adm-stat-card::after {
          content:''; position:absolute; top:-40px; right:-40px;
          width:160px; height:160px; border-radius:50%;
          background:radial-gradient(circle, rgba(229,37,27,0.09) 0%, rgba(229,37,27,0.03) 40%, transparent 70%);
          pointer-events:none;
        }
        .adm-stat-card:hover {
          box-shadow:0 6px 18px rgba(0,0,0,0.07),0 24px 50px rgba(0,0,0,0.08);
          transform:translateY(-3px); border-color:rgba(229,37,27,0.18);
        }
        .adm-stat-card:hover::before { opacity:1; }

        /* Hero RED stat card — full gradient background, dot-grid texture */
        .adm-stat-card-red {
          position:relative; overflow:hidden;
          background:
            radial-gradient(circle at 100% 0%, rgba(255,255,255,0.18) 0%, transparent 45%),
            linear-gradient(160deg, #ff3b30 0%, #e5251b 45%, #a50f07 100%);
          border:none; border-radius:20px;
          padding:26px 28px 24px;
          color:#ffffff;
          box-shadow:0 4px 18px rgba(229,37,27,0.34), 0 24px 60px rgba(229,37,27,0.20), inset 0 1px 0 rgba(255,255,255,0.20);
          transition:transform 0.22s, box-shadow 0.22s;
          cursor:default;
        }
        /* Faint dot-grid pattern — gives the red card a tactile, premium texture */
        .adm-stat-card-red::before {
          content:''; position:absolute; inset:0;
          background-image:radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px);
          background-size:14px 14px; background-position:0 0;
          pointer-events:none; opacity:0.55;
        }
        /* Soft white sheen in corner */
        .adm-stat-card-red::after {
          content:''; position:absolute; top:-50px; right:-50px;
          width:220px; height:220px; border-radius:50%;
          background:radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.05) 45%, transparent 70%);
          pointer-events:none;
        }
        .adm-stat-card-red:hover {
          transform:translateY(-3px);
          box-shadow:0 8px 24px rgba(229,37,27,0.42), 0 32px 80px rgba(229,37,27,0.28), inset 0 1px 0 rgba(255,255,255,0.24);
        }

        /* 7-day sparkline. Thin bars, today on the right. */
        .adm-spark { display:flex; align-items:flex-end; gap:3px; height:34px; margin-top:14px; }
        .adm-spark-bar {
          flex:1; min-height:3px; border-radius:2px 2px 1px 1px;
          transition:height 0.35s cubic-bezier(0.34,1.56,0.64,1);
        }
        .adm-spark-axis { display:flex; justify-content:space-between; gap:3px; margin-top:6px; }
        .adm-spark-tick {
          flex:1; text-align:center;
          font-size:9.5px; font-weight:600; letter-spacing:0.05em;
          color:var(--adm-axis, #b8b8c4);
        }

        /* MRR breakdown bars — per-tier horizontal bars on the red hero card */
        .adm-mrr-bars { display:flex; flex-direction:column; gap:9px; margin-top:18px; }
        .adm-mrr-bar-row { display:grid; grid-template-columns: 58px 1fr 60px; align-items:center; gap:10px; }
        .adm-mrr-bar-label {
          font-size:10.5px; font-weight:800; letter-spacing:0.08em;
          text-transform:uppercase; color:rgba(255,255,255,0.78);
        }
        .adm-mrr-bar-track {
          height:6px; border-radius:99px; overflow:hidden;
          background:rgba(255,255,255,0.14);
          box-shadow: inset 0 1px 1px rgba(0,0,0,0.10);
        }
        .adm-mrr-bar-fill {
          height:100%; border-radius:99px;
          background: linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.65) 100%);
          box-shadow: 0 0 8px rgba(255,255,255,0.32), inset 0 1px 0 rgba(255,255,255,0.4);
          transition: width 0.8s cubic-bezier(0.34,1.56,0.64,1);
        }
        .adm-mrr-bar-value {
          font-size:12.5px; font-weight:700; color:#ffffff;
          font-variant-numeric:tabular-nums; letter-spacing:-0.15px;
          text-align:right;
        }

        /* Inline usage bar (Top users row) — gradient + subtle glow */
        .adm-usage-track {
          margin-top:5px; height:5px; border-radius:99px;
          background:#f0f0f4; overflow:hidden;
          box-shadow: inset 0 1px 1px rgba(0,0,0,0.04);
        }
        .adm-usage-fill {
          height:100%; border-radius:99px;
          transition: width 0.8s cubic-bezier(0.34,1.56,0.64,1);
        }

        /* Engagement bar — Active 7d card, single horizontal bar */
        .adm-engage-track {
          margin-top:14px; height:6px; border-radius:99px;
          background:#eaeaef; overflow:hidden;
          box-shadow: inset 0 1px 1px rgba(0,0,0,0.04);
        }
        .adm-engage-fill {
          height:100%; border-radius:99px;
          background: linear-gradient(90deg, #34d399 0%, #059669 100%);
          box-shadow: 0 0 8px rgba(5,150,105,0.30), inset 0 1px 0 rgba(255,255,255,0.30);
          transition: width 0.8s cubic-bezier(0.34,1.56,0.64,1);
        }

        /* Activity feed — vertical event ticker */
        .adm-feed-scroll {
          max-height: 480px; overflow-y: auto; padding: 4px 6px 4px 0;
        }
        .adm-feed-scroll::-webkit-scrollbar { width: 8px }
        .adm-feed-scroll::-webkit-scrollbar-thumb {
          background-color: rgba(10,10,15,0.18); border-radius: 8px;
          border: 2px solid transparent; background-clip: content-box;
        }
        .adm-feed-row {
          display: grid; grid-template-columns: 6px 26px 1fr auto;
          align-items: center; gap: 10px;
          padding: 11px 22px;
          border-bottom: 1px solid #f0f0f4;
          transition: background 0.13s;
        }
        .adm-feed-row:last-child { border-bottom: none; }
        .adm-feed-row:hover { background: #f8f8fb; }
        .adm-feed-dot {
          width: 6px; height: 6px; border-radius: 50%;
          flex-shrink: 0;
        }
        .adm-feed-dot.paid  { background: #059669; box-shadow: 0 0 0 3px rgba(5,150,105,0.18); }
        .adm-feed-dot.free  { background: #b8b8c4; }
        .adm-feed-dot.audit { background: #4a7cf7; box-shadow: 0 0 0 3px rgba(74,124,247,0.18); }
        .adm-feed-name {
          font-size: 13px; font-weight: 700; color: #0f0f13;
          letter-spacing: -0.15px;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .adm-feed-action {
          font-size: 11.5px; color: #9595a4; margin-top: 1px;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .adm-feed-time {
          font-size: 11px; color: #b8b8c4; font-weight: 500;
          font-variant-numeric: tabular-nums; flex-shrink: 0;
          letter-spacing: -0.1px;
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
          font-size:19px; font-weight:800; color:#0f0f13; letter-spacing:-0.5px;
        }
        .adm-section-count {
          font-size:11.5px; font-weight:700; color:#e5251b;
          background:#fff5f5; border:1px solid #fecaca;
          padding:2px 9px; border-radius:100px;
          font-variant-numeric:tabular-nums;
        }
        .adm-section-sub {
          font-size:13.5px; color:#4a4a58; font-weight:500; line-height:1.55;
          margin-top:5px;
        }
        /* Card-embedded section header sits at the top of a SectionCard */
        .adm-section-cardhdr {
          padding:22px 28px;
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

        /* Today's pulse strip — sits above the 4-card stat row */
        .adm-pulse-strip {
          display:flex; align-items:center; gap:18px; flex-wrap:wrap;
          padding:13px 22px; margin-bottom:16px;
          background:linear-gradient(180deg, #ffffff 0%, #fafafc 100%);
          border:1px solid #e6e6ec; border-radius:14px;
          box-shadow:0 1px 2px rgba(0,0,0,0.03);
        }
        .adm-pulse-eyebrow {
          display:flex; align-items:center; gap:8px; flex-shrink:0;
          font-size:11px; font-weight:800; letter-spacing:0.11em;
          text-transform:uppercase; color:#4a4a58;
        }
        .adm-pulse-divider {
          width:1px; height:22px; background:#e6e6ec; flex-shrink:0;
        }
        .adm-pulse-metrics {
          display:flex; gap:22px; flex-wrap:wrap; align-items:baseline;
        }
        .adm-pulse-metric {
          display:inline-flex; align-items:baseline; gap:6px;
        }
        .adm-pulse-num {
          font-size:18px; font-weight:800; color:#0f0f13;
          letter-spacing:-0.4px; font-variant-numeric:tabular-nums;
        }
        .adm-pulse-num.dim { color:#9595a4; }
        .adm-pulse-num.up  { color:#059669; }
        .adm-pulse-label {
          font-size:12px; color:#9595a4; font-weight:500;
        }
        .adm-pulse-quiet {
          font-size:13px; color:#9595a4; font-weight:500;
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
        .adm-empty { padding:64px 24px; text-align:center; }

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

/* ── Sparkline — 7 mini bars, today on the right ───────────────────────── */
function Sparkline({ data, accent, axisColor }) {
  const max = Math.max(1, ...data)
  return (
    <>
      <div className="adm-spark">
        {data.map((v, i) => (
          <div key={i} className="adm-spark-bar" style={{
            height: `${Math.max(8, (v / max) * 100)}%`,
            background: v > 0 ? accent : (axisColor || '#e6e6ec'),
            opacity: v > 0 ? (0.55 + 0.45 * (v / max)) : 0.4,
          }} />
        ))}
      </div>
      <div className="adm-spark-axis" style={{ '--adm-axis': axisColor || '#b8b8c4' }}>
        {data.map((_, i) => {
          const isToday = i === data.length - 1
          const dayLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
          const d = new Date(); d.setDate(d.getDate() - (data.length - 1 - i))
          const idx = (d.getDay() + 6) % 7  // Mon=0
          return <span key={i} className="adm-spark-tick" style={{ opacity: isToday ? 1 : 0.7, fontWeight: isToday ? 800 : 600 }}>{dayLetters[idx]}</span>
        })}
      </div>
    </>
  )
}

/* ── Stat card — solid red variant + light variant ──────────────────────── */
function Stat({ label, value, sub, accent, alert, delta, sparkline, breakdown, breakdownTotal, engagementPct, variant = 'light' }) {
  // variant: 'light' (white gradient card) | 'red' (hero red gradient)
  if (variant === 'red') {
    return (
      <div className="adm-stat-card-red">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.82)', marginBottom: 18 }}>{label}</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
            <p className="num" style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-2.2px', color: '#fff', lineHeight: 0.95 }}>{value}</p>
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
          {sub && <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.86)', fontWeight: 500, marginTop: 14, lineHeight: 1.5, letterSpacing: '-0.1px' }}>{sub}</p>}
          {breakdown && (
            <div className="adm-mrr-bars">
              {breakdown.map((b, i) => {
                const pct = breakdownTotal > 0 ? (b.weight / breakdownTotal) * 100 : 0
                return (
                  <div key={i} className="adm-mrr-bar-row">
                    <span className="adm-mrr-bar-label">{b.label}</span>
                    <div className="adm-mrr-bar-track">
                      {pct > 0 && <div className="adm-mrr-bar-fill" style={{ width: `${pct}%`, opacity: 0.55 + 0.45 * (pct / 100) }} />}
                    </div>
                    <span className="adm-mrr-bar-value" style={{ opacity: pct > 0 ? 1 : 0.55 }}>{b.value}</span>
                  </div>
                )
              })}
            </div>
          )}
          {sparkline && <Sparkline data={sparkline} accent="rgba(255,255,255,0.85)" axisColor="rgba(255,255,255,0.55)" />}
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
        <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.text3, marginBottom: 18 }}>{label}</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, flexWrap: 'wrap' }}>
          <p className="num" style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-1.9px', color: col, lineHeight: 0.95 }}>{value}</p>
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
        {sub && <p style={{ fontSize: 13.5, color: alert ? C.red : C.text2, fontWeight: 500, marginTop: 12, lineHeight: 1.5, letterSpacing: '-0.1px' }}>{sub}</p>}
        {sparkline && <Sparkline data={sparkline} accent={accentVar} />}
        {engagementPct != null && (
          <div className="adm-engage-track">
            <div className="adm-engage-fill" style={{ width: `${Math.min(100, engagementPct)}%` }} />
          </div>
        )}
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

/* ── Conversion funnel — Signups → Active → Paying ─────────────────────── */
/* These three steps aren't strictly nested (a free user can be active,
   a paid user can be inactive), but they're useful parallel slices of
   the same total user base. The bars are scaled to total = 100%. */
function FunnelCard({ stats }) {
  const total = stats.total_users || 0
  const steps = [
    {
      label:    'Signups',
      sub:      'All-time accounts created',
      count:    total,
      barColor: 'linear-gradient(90deg, #c9c9d3 0%, #b8b8c4 100%)',
      isTotal:  true,
    },
    {
      label:    'Active this week',
      sub:      'Audited a channel in the last 7 days',
      count:    stats.active_7d || 0,
      barColor: 'linear-gradient(90deg, #34d399 0%, #059669 100%)',
      accent:   C.green,
      drop:     Math.max(0, total - (stats.active_7d || 0)),
      dropLabel:"haven't audited this week",
    },
    {
      label:    'Paying customers',
      sub:      `${stats.conversion_pct || 0}% conversion rate`,
      count:    stats.paid_users || 0,
      barColor: 'linear-gradient(90deg, #ff5048 0%, #e5251b 100%)',
      accent:   C.red,
      drop:     Math.max(0, total - (stats.paid_users || 0)),
      dropLabel:'still on free plan',
    },
  ]

  return (
    <div style={{ ...CARD, marginBottom: 36, overflow: 'hidden' }}>
      <div className="adm-section-cardhdr">
        <div style={{ minWidth: 0 }}>
          <div className="adm-section-title">
            <h2>Conversion funnel</h2>
          </div>
          <p className="adm-section-sub">From sign-up to active to paying. Each bar is sized against total users.</p>
        </div>
      </div>
      <div style={{ padding: '26px 28px 28px' }}>
        {steps.map((step, i) => {
          const pct = total > 0 ? (step.count / total) * 100 : 0
          const valueColor = step.isTotal ? C.text1 : (step.accent || C.text1)
          return (
            <div key={i} style={{ marginBottom: i === steps.length - 1 ? 0 : 22 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.text1, letterSpacing: '-0.2px', lineHeight: 1.2 }}>{step.label}</p>
                  <p style={{ fontSize: 12, color: C.text3, fontWeight: 500, marginTop: 3 }}>{step.sub}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexShrink: 0 }}>
                  <span className="num" style={{ fontSize: 26, fontWeight: 800, color: valueColor, letterSpacing: '-0.9px', lineHeight: 1 }}>{fmtNum(step.count)}</span>
                  {!step.isTotal && (
                    <span className="num" style={{ fontSize: 12.5, color: C.text3, fontWeight: 600 }}>{pct.toFixed(1)}%</span>
                  )}
                </div>
              </div>
              <div style={{ height: 10, background: '#f0f0f4', borderRadius: 99, overflow: 'hidden', position: 'relative' }}>
                <div style={{
                  width: `${pct}%`, height: '100%',
                  background: step.barColor, borderRadius: 99,
                  transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)',
                  boxShadow: step.isTotal ? 'none' : 'inset 0 1px 0 rgba(255,255,255,0.25)',
                }} />
              </div>
              {step.drop > 0 && (
                <p style={{ fontSize: 11.5, color: C.text3, marginTop: 7, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ color: C.text3 }}>↓</span>
                  <span className="num" style={{ color: C.text2, fontWeight: 700 }}>{fmtNum(step.drop)}</span>
                  <span>{step.dropLabel}</span>
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Empty state ─────────────────────────────────────────────────────────── */
function EmptyState({ eyebrow = 'Empty', children }) {
  return (
    <div className="adm-empty">
      <p style={{ fontSize: 10.5, fontWeight: 700, color: '#9595a4', letterSpacing: '0.11em', textTransform: 'uppercase', marginBottom: 10 }}>{eyebrow}</p>
      <p style={{ fontSize: 14, color: '#4a4a58', lineHeight: 1.65, maxWidth: 360, margin: '0 auto', fontWeight: 500 }}>{children}</p>
    </div>
  )
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

  /* MRR estimate from plan breakdown × monthly price. Lifetime / pack
     plans don't recur, so they contribute $0. */
  const planCount = (key) => {
    const row = data.plan_breakdown.find(r => (r.plan || '').toLowerCase() === key)
    return row ? row.count : 0
  }
  const mrrSolo   = planCount('solo')   * PLAN_MONTHLY_PRICE.solo
  const mrrGrowth = planCount('growth') * PLAN_MONTHLY_PRICE.growth
  const mrrAgency = planCount('agency') * PLAN_MONTHLY_PRICE.agency
  const mrrTotal  = mrrSolo + mrrGrowth + mrrAgency

  /* 7-day sparkline of signups, derived by bucketing recent_signups
     into local-day buckets. recent_signups is already capped at 40 so
     the bucketing is cheap. Today is the rightmost bar. */
  const dayBuckets = (() => {
    const days = 7
    const buckets = Array(days).fill(0)
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    data.recent_signups.forEach(u => {
      if (!u.created_at) return
      const d = new Date(u.created_at)
      const startOfThatDay = new Date(d.getFullYear(), d.getMonth(), d.getDate())
      const dayDiff = Math.round((startOfToday - startOfThatDay) / 86400000)
      if (dayDiff >= 0 && dayDiff < days) buckets[days - 1 - dayDiff]++
    })
    return buckets
  })()
  const signupsToday = dayBuckets[dayBuckets.length - 1]

  /* Today's pulse — derive from recent_signups by filtering created_at
     to local-day. Conversions = users who signed up today AND are on a
     paid plan. MRR added = sum of monthly prices for today's solo /
     growth / agency signups. Lifetime + pack don't recur, so they
     count as conversions but not as recurring revenue. */
  const todayPulse = (() => {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    let conversions = 0
    let mrrAdded = 0
    data.recent_signups.forEach(u => {
      if (!u.created_at) return
      const d = new Date(u.created_at)
      if (d < startOfToday) return
      const p = (u.plan || '').toLowerCase()
      if (p === 'solo' || p === 'growth' || p === 'agency' || p.includes('lifetime') || p === 'pack') {
        conversions += 1
      }
      if (PLAN_MONTHLY_PRICE[p]) mrrAdded += PLAN_MONTHLY_PRICE[p]
    })
    return { signups: signupsToday, conversions, mrrAdded }
  })()

  /* Activity events — merge signups + audits, sort by time desc, take
     top 20. Each event keeps avatar + name + plan + ts so the feed
     row can render without back-references. */
  const activityEvents = (() => {
    const events = []
    data.recent_signups.forEach(u => {
      if (!u.created_at) return
      const p = (u.plan || '').toLowerCase()
      const isPaid = p === 'solo' || p === 'growth' || p === 'agency' || p.includes('lifetime') || p === 'pack'
      events.push({
        type:   isPaid ? 'paid' : 'free',
        kind:   'signup',
        ts:     new Date(u.created_at).getTime(),
        name:   u.display_name || u.channel_name || u.email.split('@')[0],
        plan:   u.plan,
        avatar: u.profile_picture || u.channel_thumbnail,
      })
    })
    data.top_users.forEach(u => {
      if (!u.last_audit_at) return
      events.push({
        type:   'audit',
        kind:   'audit',
        ts:     new Date(u.last_audit_at).getTime(),
        name:   u.channel_name || (u.owner_email || '').split('@')[0],
        plan:   u.plan,
        avatar: u.channel_thumbnail,
      })
    })
    events.sort((a, b) => b.ts - a.ts)
    return events.slice(0, 20)
  })()

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

      {/* ── Today's pulse — thin live strip above the stat row ──────────── */}
      <div className="adm-pulse-strip">
        <div className="adm-pulse-eyebrow">
          <span className="adm-live-dot" />
          <span>Today</span>
        </div>
        <div className="adm-pulse-divider" />
        {(todayPulse.signups + todayPulse.conversions + todayPulse.mrrAdded) === 0 ? (
          <span className="adm-pulse-quiet">Quiet so far. New activity will appear here as it lands.</span>
        ) : (
          <div className="adm-pulse-metrics">
            <span className="adm-pulse-metric">
              <span className={`adm-pulse-num${todayPulse.signups === 0 ? ' dim' : ''}`}>{todayPulse.signups}</span>
              <span className="adm-pulse-label">signup{todayPulse.signups === 1 ? '' : 's'}</span>
            </span>
            <span className="adm-pulse-metric">
              <span className={`adm-pulse-num${todayPulse.mrrAdded > 0 ? ' up' : ' dim'}`}>+${todayPulse.mrrAdded.toLocaleString()}</span>
              <span className="adm-pulse-label">MRR added</span>
            </span>
            <span className="adm-pulse-metric">
              <span className={`adm-pulse-num${todayPulse.conversions > 0 ? ' up' : ' dim'}`}>{todayPulse.conversions}</span>
              <span className="adm-pulse-label">new paid</span>
            </span>
          </div>
        )}
      </div>

      {/* ── Stat row — 2 hero red cards + 2 white secondary cards ─────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 16, marginBottom: 36 }}>
        <Stat
          variant="red"
          label="Total users"
          value={fmtNum(s.total_users)}
          sub={`${fmtNum(s.paid_users)} paid · ${fmtNum(s.free_users)} free`}
          delta={s.conversion_pct > 0 ? { tone: 'up', label: `${s.conversion_pct}% conv` } : null}
          sparkline={dayBuckets}
        />
        <Stat
          variant="red"
          label="Monthly recurring"
          value={`$${mrrTotal.toLocaleString()}`}
          sub={mrrTotal === 0 ? 'Tier breakdown will populate as paid users join' : 'Estimate at full monthly rates'}
          breakdown={[
            { label: 'Solo',   value: `$${mrrSolo.toLocaleString()}`,   weight: mrrSolo },
            { label: 'Growth', value: `$${mrrGrowth.toLocaleString()}`, weight: mrrGrowth },
            { label: 'Agency', value: `$${mrrAgency.toLocaleString()}`, weight: mrrAgency },
          ]}
          breakdownTotal={mrrTotal}
        />
        <Stat
          label="Signups · 7d"
          value={fmtNum(s.signups_7d)}
          accent={s.signups_trend > 0 ? C.green : s.signups_trend < 0 ? C.red : C.amber}
          sub={signupsToday > 0 ? `${signupsToday} today · ${trendSub}` : trendSub}
          delta={s.signups_trend !== 0 ? {
            tone: s.signups_trend > 0 ? 'up' : 'down',
            label: `${s.signups_trend > 0 ? '+' : ''}${s.signups_trend}`,
          } : null}
          sparkline={dayBuckets}
        />
        <Stat
          label="Active · 7d"
          value={fmtNum(s.active_7d)}
          accent={C.green}
          sub={s.total_users > 0 ? `${Math.round((s.active_7d / s.total_users) * 100)}% of users audited a channel` : 'Channels audited in the last 7 days'}
          engagementPct={s.total_users > 0 ? (s.active_7d / s.total_users) * 100 : 0}
        />
      </div>

      {/* ── Conversion funnel ────────────────────────────────────────────── */}
      <FunnelCard stats={s} />

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
            ? <EmptyState eyebrow="No signups">New accounts will appear here as soon as they OAuth in.</EmptyState>
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

      {/* ── Top users (left) + Activity feed (right) ─────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 20, marginBottom: 40, alignItems: 'start' }}>
        <SectionCard
          title="Top users this month"
          count={data.top_users.length}
          sub="Ranked by AI analyses run this billing cycle"
        >
          <ColHeader cols={TOP_COLS} />
          {data.top_users.length === 0
            ? <EmptyState eyebrow="Quiet month">Nobody has run an analysis this month yet. The leaderboard fills as people use the product.</EmptyState>
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
                      <div className="adm-usage-track">
                        <div className="adm-usage-fill" style={{
                          width: `${usagePct}%`,
                          background: usagePct > 80
                            ? 'linear-gradient(90deg, #ff5048 0%, #e5251b 100%)'
                            : usagePct > 55
                              ? 'linear-gradient(90deg, #fbbf24 0%, #d97706 100%)'
                              : 'linear-gradient(90deg, #34d399 0%, #059669 100%)',
                          boxShadow: `0 0 6px ${barClr}55, inset 0 1px 0 rgba(255,255,255,0.30)`,
                        }} />
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

        {/* Activity feed — live ticker of signups + audits */}
        <SectionCard
          title="Activity"
          count={activityEvents.length}
          sub="Live stream of signups + audits across the platform"
        >
          {activityEvents.length === 0 ? (
            <EmptyState eyebrow="No activity">Recent signups + audits will appear here as soon as they happen.</EmptyState>
          ) : (
            <div className="adm-feed-scroll">
              {activityEvents.map((e, i) => {
                const isAudit = e.kind === 'audit'
                const dotCls = e.type === 'paid' ? 'paid' : e.type === 'audit' ? 'audit' : 'free'
                const action = isAudit
                  ? 'ran a channel audit'
                  : e.type === 'paid' ? `signed up · ${planLabel(e.plan)}` : 'signed up'
                return (
                  <div key={`${e.kind}-${e.ts}-${i}`} className="adm-feed-row">
                    <span className={`adm-feed-dot ${dotCls}`} />
                    <Avatar src={e.avatar} name={e.name} size={26} />
                    <div style={{ minWidth: 0 }}>
                      <p className="adm-feed-name">{e.name}</p>
                      <p className="adm-feed-action">{action}</p>
                    </div>
                    <span className="adm-feed-time">{relTime(new Date(e.ts).toISOString())}</span>
                  </div>
                )
              })}
            </div>
          )}
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
                <EmptyState eyebrow={frFilter === 'all' ? 'No requests' : `No "${frFilter}" requests`}>
                  {frFilter === 'all'
                    ? 'No feature requests yet. Share the /feedback link in an email to seed the first one.'
                    : `Nothing in this status right now. Try another filter or wait for new submissions.`}
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
