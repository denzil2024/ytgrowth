import { useEffect, useState } from 'react'
import { supportEmail } from '../brandHost'
import { Plus, ArrowRight, Check, Link2 } from 'lucide-react'
import { loginUrl } from '../utm.js'
import { startUpgrade, startTopUp } from '../checkout'

// Editorial app faces: Cormorant = display H1, Barlow Condensed = labels/buttons.
const SERIF = "'Cormorant Garamond', Georgia, serif"
const COND  = "'Barlow Condensed', system-ui, sans-serif"

/* ── Design tokens ──────────────────────────────────────────────────────────
   Aligned with the Competitors design north-star, dark theme. Geist font,
   1040 centered, dark gradient cards + single shadow, hairline
   rgba(20,19,15,0.08) borders, 14px radius, 11/600/0.10em eyebrows,
   canonical dark text ramp, weights capped at 700 (headings 600). */
const C = {
  red:      '#c9a030',
  redLight: '#d4af3f',
  redBg:    'rgba(201,160,48,0.13)',
  redBdr:   'rgba(201,160,48,0.32)',
  green:    '#2d7a4f',
  greenBg:  'rgba(22,163,74,0.16)',
  greenBdr: 'rgba(22,163,74,0.34)',
  amber:    '#7a5b14',
  amberBg:  'rgba(201,160,48,0.13)',
  amberBdr: 'rgba(201,160,48,0.32)',
  ink:      '#14130f',
  ink60:    '#6b6862',
  ink55:    '#6b6862',
  ink50:    '#6b6862',
  ink45:    '#6b6862',
  ink30:    '#8a8378',
  hairline: 'rgba(20,19,15,0.08)',
  chipBg:   'rgba(20,19,15,0.06)',
}

/* Credit-state accent. Green when healthy, amber under 20%, red at zero.
   Each returns a solid, a lighter top-of-gradient, a glow and a soft tint. */
function creditAccent(state) {
  if (state === 'empty') return { solid: '#c9a030', light: '#d4af3f', glow: 'rgba(201,160,48,0.30)' }
  if (state === 'low')   return { solid: '#7a5b14', light: '#c9a030', glow: 'rgba(201,160,48,0.32)' }
  return                        { solid: '#2d7a4f', light: '#22c55e', glow: 'rgba(22,163,74,0.32)' }
}

/* ── Page-scoped styles. Geist load, base typography, card grammar, button
      styles, input styles. Same pattern as Competitors / Chat. ───────────── */
function useSettingsStyles() {
  useEffect(() => {
    if (!document.getElementById('ytg-set-editorial-font')) {
      const link = document.createElement('link')
      link.id = 'ytg-set-editorial-font'
      link.rel = 'stylesheet'
      link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@500;600;700&display=swap'
      document.head.appendChild(link)
    }
    if (document.getElementById('ytg-set-styles-v3')) return
    const style = document.createElement('style')
    style.id = 'ytg-set-styles-v3'
    style.textContent = `
      .set-page { max-width: 1040px; margin: 0 auto; }
      .set-page, .set-page * {
        box-sizing: border-box;
        font-family: 'Barlow', system-ui, sans-serif;
        -webkit-font-smoothing: antialiased;
      }
      .set-page p, .set-page span, .set-page div, .set-page h1, .set-page label { margin: 0; }

      /* Staggered entrance. Applied to content children only so the
         position:fixed modals (outside .set-content) keep viewport anchoring. */
      .set-content > * { animation: setFade 0.5s cubic-bezier(0.32,0.72,0,1) both; }
      .set-content > *:nth-child(1) { animation-delay: 20ms; }
      .set-content > *:nth-child(2) { animation-delay: 70ms; }
      .set-content > *:nth-child(3) { animation-delay: 120ms; }
      .set-content > *:nth-child(4) { animation-delay: 170ms; }
      .set-content > *:nth-child(5) { animation-delay: 210ms; }
      .set-content > *:nth-child(6) { animation-delay: 245ms; }
      .set-content > *:nth-child(7) { animation-delay: 275ms; }
      @keyframes setFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      @media (prefers-reduced-motion: reduce) {
        .set-content > * { animation: none; }
      }

      /* H1 + subtitle match the shared standard across every redesigned
         page (Competitors / Outliers / Keywords / Video Ideas / SEO). */
      .set-h1 {
        font-family: ${SERIF};
        font-size: 32px; font-weight: 500; color: ${C.ink};
        letter-spacing: -0.01em; line-height: 1.12;
      }
      .set-subtitle {
        font-size: 14px; font-weight: 500; color: ${C.ink55};
        margin-top: 6px !important; letter-spacing: -0.005em;
      }

      /* Flat editorial cards: hairline, radius 0, no shadow. */
      .set-card {
        background: var(--yd-surface);
        border: 1px solid ${C.hairline};
        border-radius: 0;
        box-shadow: none;
      }
      .set-card-hero {
        background: var(--yd-surface);
        border: 1px solid ${C.hairline};
        border-radius: 0;
        box-shadow: none;
      }

      .set-divider { height: 1px; background: ${C.hairline}; width: 100%; }

      .set-eyebrow {
        font-size: 11px; font-weight: 600;
        letter-spacing: 0.10em; text-transform: uppercase;
        color: ${C.ink45};
      }

      /* SectionTitle grammar, identical to Competitors' SectionTitle:
         15/700/-0.3px title, 12/#6b6862 hint, block marginBottom 14. */
      .set-section { margin-bottom: 14px; }
      .set-card-title {
        font-size: 15px; font-weight: 600; color: #14130f;
        letter-spacing: -0.3px;
      }
      .set-card-sub {
        font-size: 12px; font-weight: 400; color: #6b6862;
        margin-top: 3px !important; line-height: 1.5;
      }

      /* ── Buttons ──────────────────────────────────────────────────────── */
      .set-btn-primary {
        background: ${C.red};
        color: var(--yd-on-gold); border: none; border-radius: 0;
        padding: 9px 18px; font-size: 12px; font-weight: 600;
        font-family: ${COND}; text-transform: uppercase; letter-spacing: 0.06em;
        cursor: pointer; white-space: nowrap; text-decoration: none;
        display: inline-flex; align-items: center; gap: 6px;
        box-shadow: none;
        transition: filter 160ms cubic-bezier(0.32,0.72,0,1);
      }
      .set-btn-primary:hover:not(:disabled) { filter: brightness(1.07); }
      .set-btn-primary:active:not(:disabled) { filter: brightness(0.98); }
      .set-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

      .set-btn-secondary {
        background: transparent; color: ${C.ink};
        border: 1px solid rgba(20,19,15,0.16); border-radius: 0;
        padding: 8px 16px; font-size: 12px; font-weight: 600;
        font-family: ${COND}; text-transform: uppercase; letter-spacing: 0.06em;
        cursor: pointer; white-space: nowrap;
        box-shadow: none;
        transition: background 160ms cubic-bezier(0.32,0.72,0,1), border-color 160ms cubic-bezier(0.32,0.72,0,1);
      }
      .set-btn-secondary:hover { background: rgba(20,19,15,0.05); border-color: rgba(20,19,15,0.28); }

      .set-btn-text {
        background: transparent; color: ${C.ink55};
        border: none; padding: 6px 4px;
        font-size: 13px; font-weight: 500;
        font-family: 'Barlow', system-ui, sans-serif;
        cursor: pointer; text-decoration: none;
        letter-spacing: -0.01em;
        display: inline-flex; align-items: center; gap: 5px;
        transition: color 160ms cubic-bezier(0.32,0.72,0,1), gap 160ms cubic-bezier(0.32,0.72,0,1);
      }
      .set-btn-text:hover { color: ${C.ink}; gap: 7px; }

      .set-btn-danger-outline {
        background: transparent; color: #7a5b14;
        border: 1px solid rgba(201,160,48,0.40); border-radius: 0;
        padding: 8px 16px; font-size: 12px; font-weight: 600;
        font-family: ${COND}; text-transform: uppercase; letter-spacing: 0.06em;
        cursor: pointer; white-space: nowrap;
        box-shadow: none;
        transition: background 160ms cubic-bezier(0.32,0.72,0,1), border-color 160ms cubic-bezier(0.32,0.72,0,1);
      }
      .set-btn-danger-outline:hover { background: rgba(201,160,48,0.10); border-color: rgba(201,160,48,0.60); }

      .set-btn-row-disconnect {
        background: transparent; color: ${C.ink45};
        border: none; padding: 5px 8px; border-radius: 0;
        font-size: 12.5px; font-weight: 600;
        font-family: 'Barlow', system-ui, sans-serif;
        cursor: pointer; letter-spacing: -0.01em;
        transition: color 160ms cubic-bezier(0.32,0.72,0,1), background 160ms cubic-bezier(0.32,0.72,0,1);
      }
      .set-btn-row-disconnect:hover { color: ${C.red}; background: rgba(201,160,48,0.07); }

      .set-page button:focus-visible,
      .set-page a:focus-visible {
        outline: 2px solid rgba(201,160,48,0.45);
        outline-offset: 2px;
      }

      /* ── Inputs ───────────────────────────────────────────────────────── */
      .set-input {
        width: 100%; padding: 11px 14px;
        background: var(--yd-surface);
        border: 1px solid rgba(20,19,15,0.16);
        border-radius: 0;
        font-size: 14px; font-weight: 400; color: ${C.ink};
        font-family: 'Barlow', system-ui, sans-serif;
        outline: none; letter-spacing: -0.005em;
        box-shadow: none;
        transition: border-color 180ms cubic-bezier(0.32,0.72,0,1), box-shadow 180ms cubic-bezier(0.32,0.72,0,1);
      }
      .set-input::placeholder { color: rgba(20,19,15,0.34); font-weight: 400; }
      .set-input:focus {
        border-color: rgba(201,160,48,0.55);
        box-shadow: 0 0 0 3px rgba(201,160,48,0.12);
      }

      .set-textarea {
        width: 100%; padding: 12px 14px;
        background: var(--yd-surface);
        border: 1px solid rgba(20,19,15,0.16);
        border-radius: 0;
        font-size: 14px; font-weight: 400; color: ${C.ink};
        font-family: 'Barlow', system-ui, sans-serif;
        outline: none; letter-spacing: -0.005em; line-height: 1.55;
        resize: vertical; min-height: 104px;
        box-shadow: none;
        transition: border-color 180ms cubic-bezier(0.32,0.72,0,1), box-shadow 180ms cubic-bezier(0.32,0.72,0,1);
      }
      .set-textarea::placeholder { color: rgba(20,19,15,0.34); font-weight: 400; }
      .set-textarea:focus {
        border-color: rgba(201,160,48,0.55);
        box-shadow: 0 0 0 3px rgba(201,160,48,0.12);
      }

      /* Channel row, hover wash bleeds into the card padding via the
         negative margin, then rounds, so it feels like a real list. */
      .set-channel-row {
        display: flex; align-items: center; gap: 14px;
        padding: 13px 12px; margin: 0 -12px;
        border-radius: 0;
        transition: background 160ms cubic-bezier(0.32,0.72,0,1);
      }
      .set-channel-row:hover { background: rgba(20,19,15,0.04); }

      .set-connect-row {
        display: flex; align-items: center; gap: 8px;
        padding: 13px 12px; margin: 0 -12px;
        border-radius: 0;
        text-decoration: none;
        color: ${C.red}; font-size: 14px; font-weight: 600;
        letter-spacing: -0.01em; cursor: pointer;
        transition: background 160ms cubic-bezier(0.32,0.72,0,1);
      }
      .set-connect-row:hover { background: rgba(201,160,48,0.12); }

      @keyframes settingsSpin { to { transform: rotate(360deg) } }
    `
    document.head.appendChild(style)
  }, [])
}

/* ── Helpers ────────────────────────────────────────────────────────────── */
function planBadgeStyle(plan) {
  const p = (plan || '').toLowerCase()
  if (p.includes('agency')) return { background: C.redBg,   color: C.red,   border: `1px solid ${C.redBdr}` }
  if (p.includes('growth')) return { background: C.greenBg, color: C.green, border: `1px solid ${C.greenBdr}` }
  if (p.includes('solo'))   return { background: C.amberBg, color: C.amber, border: `1px solid ${C.amberBdr}` }
  return { background: C.chipBg, color: C.ink60, border: `1px solid ${C.hairline}` }
}

function planLabel(plan) {
  const map = {
    free:            'Free',
    solo:            'Solo',
    growth:          'Growth',
    agency:          'Agency',
    lifetime_solo:   'Lifetime Solo',
    lifetime_growth: 'Lifetime Growth',
    lifetime_agency: 'Lifetime Agency',
  }
  return map[plan] || plan || 'Free'
}

function fmtDate(iso) {
  if (!iso) return ''
  try { return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }
  catch { return iso }
}

function fmtMonthYear(iso) {
  if (!iso) return ''
  try { return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) }
  catch { return iso }
}

function fmtSubs(n) {
  if (!n) return '0'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return n.toLocaleString()
}

/* Right-column line under the plan pill. Short and confident. */
function compactBillingLabel(me) {
  if (!me) return ''
  if (me.is_lifetime) return 'Lifetime plan'
  if (me.plan === 'free') return ''
  if (me.reset_date) return `Renews ${fmtDate(me.reset_date)}`
  return ''
}

function daysUntilReset(iso) {
  if (!iso) return null
  try {
    const diff = new Date(iso).getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / 86400000))
  } catch { return null }
}

function refillLabel(iso, isLifetime) {
  if (isLifetime) return 'Lifetime plan, monthly reset'
  const d = daysUntilReset(iso)
  if (d == null) return ''
  if (d === 0) return 'Refills today'
  if (d === 1) return 'Refills tomorrow'
  return `Refills in ${d} days`
}

/* ── Small components ───────────────────────────────────────────────────── */
/* Card header. Identical grammar to Competitors' SectionTitle: bold text
   title, optional grey hint, no icon. Right slot holds an inline control
   (Competitors puts the threat pill there). */
function SectionTitle({ children, hint, right }) {
  return (
    <div className="set-section" style={right ? { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 } : undefined}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p className="set-card-title">{children}</p>
        {hint && <p className="set-card-sub">{hint}</p>}
      </div>
      {right}
    </div>
  )
}

function Toggle({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      aria-pressed={on}
      style={{
        width: 46, height: 26, borderRadius: 100,
        background: on ? 'linear-gradient(180deg,#22c55e 0%,#16a34a 100%)' : 'rgba(20,19,15,0.16)',
        border: 'none', cursor: 'pointer', position: 'relative',
        transition: 'background 0.25s cubic-bezier(0.32,0.72,0,1)',
        flexShrink: 0,
        boxShadow: on
          ? 'inset 0 1px 2px rgba(0,0,0,0.10), 0 1px 2px rgba(22,163,74,0.30)'
          : 'inset 0 1px 2px rgba(0,0,0,0.10)',
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: on ? 23 : 3,
        width: 20, height: 20, borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.25), 0 0 0 0.5px rgba(0,0,0,0.04)',
        transition: 'left 0.25s cubic-bezier(0.34,1.56,0.64,1)',
      }} />
    </button>
  )
}

function ConfirmDialog({ title, body, confirmLabel, onConfirm, onCancel, requireTyping }) {
  const [typed, setTyped] = useState('')
  const canConfirm = requireTyping ? typed === 'DELETE' : true

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.62)',
      backdropFilter: 'blur(2px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: 'var(--yd-surface)', borderRadius: 0,
        padding: '24px 26px', maxWidth: 400, width: '90%',
        boxShadow: '0 20px 48px -12px rgba(0,0,0,0.25)',
        border: `1px solid ${C.hairline}`,
      }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: C.ink, letterSpacing: '-0.01em', marginBottom: 8 }}>{title}</p>
        <p style={{ fontSize: 14, color: C.ink60, lineHeight: 1.6, marginBottom: requireTyping ? 16 : 22, letterSpacing: '-0.005em' }}>{body}</p>
        {requireTyping && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 12, color: C.ink45, marginBottom: 6, letterSpacing: '-0.005em' }}>Type DELETE to confirm</p>
            <input
              autoFocus
              value={typed}
              onChange={e => setTyped(e.target.value)}
              placeholder="DELETE"
              className="set-input"
              style={{ letterSpacing: '0.05em' }}
            />
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} className="set-btn-secondary">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={!canConfirm}
            className="set-btn-primary"
            style={!canConfirm ? { background: '#e5e7eb', color: C.ink45, boxShadow: 'none' } : {}}
          >{confirmLabel || 'Confirm'}</button>
        </div>
      </div>
    </div>
  )
}

/* ── Main component ─────────────────────────────────────────────────────── */
export default function Settings({ channelData }) {
  useSettingsStyles()
  const [me, setMe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [disconnectTarget, setDisconnectTarget] = useState(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [toggleWorking, setToggleWorking] = useState(false)

  // Feature requests
  const [frTitle, setFrTitle]   = useState('')
  const [frDesc, setFrDesc]     = useState('')
  const [frSending, setFrSending] = useState(false)
  const [frError, setFrError]   = useState('')
  const [frSuccess, setFrSuccess] = useState(false)
  const [frMine, setFrMine]     = useState([])
  const [frShareCopied, setFrShareCopied] = useState(false)
  const [billingBusy, setBillingBusy] = useState(false)
  const FR_TITLE_MAX = 120
  const FR_DESC_MAX  = 2000

  function loadFrMine() {
    fetch('/feedback/mine', { credentials: 'include' })
      .then(r => r.ok ? r.json() : { requests: [] })
      .then(d => setFrMine(d.requests || []))
      .catch(() => {})
  }

  function submitFeatureRequest() {
    setFrError('')
    if (!frTitle.trim() || !frDesc.trim()) {
      setFrError('Both fields are required.')
      return
    }
    setFrSending(true)
    fetch('/feedback/submit', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: frTitle.trim(), description: frDesc.trim() }),
    })
      .then(async r => {
        const d = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(d.error || 'Could not submit')
        setFrTitle('')
        setFrDesc('')
        setFrSuccess(true)
        setTimeout(() => setFrSuccess(false), 3500)
        loadFrMine()
      })
      .catch(e => setFrError(e.message))
      .finally(() => setFrSending(false))
  }

  function copyShareLink() {
    const url = `${window.location.origin}/feedback`
    try {
      navigator.clipboard.writeText(url)
      setFrShareCopied(true)
      setTimeout(() => setFrShareCopied(false), 1800)
    } catch {}
  }

  function loadMe() {
    fetch('/auth/me', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { setMe(d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    loadMe()
    const refresh = () => loadMe()
    window.addEventListener('ytg:credits-changed', refresh)
    return () => window.removeEventListener('ytg:credits-changed', refresh)
  }, [])

  useEffect(() => {
    loadFrMine()
    try {
      const params = new URLSearchParams(window.location.search)
      if (params.get('focus') === 'feedback') {
        setTimeout(() => {
          const el = document.getElementById('feedback-section')
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          params.delete('focus')
          const qs = params.toString()
          window.history.replaceState({}, '', window.location.pathname + (qs ? `?${qs}` : ''))
        }, 120)
      }
    } catch {}
  }, [])

  function handleSwitch(channelId) {
    fetch('/channels/switch', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel_id: channelId }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) window.location.reload()
        else if (d.needs_auth) window.location.href = loginUrl()
      })
  }

  function handleDisconnectConfirm() {
    if (!disconnectTarget) return
    fetch('/channels/disconnect', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel_id: disconnectTarget.channel_id }),
    })
      .then(r => r.json())
      .then(d => {
        setDisconnectTarget(null)
        if (d.success) loadMe()
        else alert(d.error || 'Failed to disconnect channel')
      })
  }

  function handleToggleReport(val) {
    if (toggleWorking) return
    setToggleWorking(true)
    const channelId = me?.channels?.find(c => c.is_current)?.channel_id || ''
    fetch('/api/reports/email-preference', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel_id: channelId, weekly_report: val }),
    })
      .then(r => r.json())
      .then(() => { loadMe(); setToggleWorking(false) })
      .catch(() => setToggleWorking(false))
  }

  function handleDeleteAccount() {
    fetch('/auth/delete-account', { method: 'DELETE', credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.success) window.location.href = '/'
        else alert(d.error || 'Failed to delete account')
      })
  }

  if (loading) {
    return (
      <div className="set-page">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{ width: 28, height: 28, border: `2.5px solid #e5e7eb`, borderTop: `2.5px solid ${C.red}`, borderRadius: '50%', animation: 'settingsSpin 0.7s linear infinite' }} />
        </div>
      </div>
    )
  }

  const activeChannels = me?.channels || []
  const canAddMore     = me?.can_add_more ?? false
  const isTopPlan      = me?.plan === 'agency' || me?.plan === 'lifetime_agency'
  const hasActiveSub   = me?.status === 'active' && !me?.is_lifetime

  // Manage billing → Paddle hosted customer portal. On any failure, fall
  // back to the support mailto so the button never dead-ends.
  async function openBillingPortal() {
    if (billingBusy) return
    setBillingBusy(true)
    try {
      const r = await fetch('/billing/portal', { credentials: 'include' })
      const d = await r.json().catch(() => ({}))
      if (r.ok && d.url) {
        window.location.href = d.url
        return
      }
      window.location.href = 'mailto:' + supportEmail() + '?subject=Manage%20billing'
    } catch {
      window.location.href = 'mailto:' + supportEmail() + '?subject=Manage%20billing'
    } finally {
      setBillingBusy(false)
    }
  }

  const allowance    = me?.monthly_allowance ?? 5
  const used         = me?.monthly_used ?? 0
  const remaining    = Math.max(0, allowance - used)
  const remainingPct = allowance > 0 ? (remaining / allowance) * 100 : 0
  const creditState  = remaining === 0 ? 'empty' : remainingPct <= 20 ? 'low' : 'ok'
  const accent       = creditAccent(creditState)
  const packBalance  = me?.pack_balance ?? 0

  // Avatar: Google profile → connected channel thumb → first letter
  const avatarPic    = me?.profile_picture || channelData?.channel?.thumbnail || me?.channels?.[0]?.channel_thumbnail
  const displayName  = me?.display_name || channelData?.channel?.channel_name || me?.channels?.[0]?.channel_name || 'Account'
  const initial      = (displayName || me?.email || '').trim()[0]?.toUpperCase() || ''

  return (
    <div className="set-page">

      {/* ── Page heading ────────────────────────────────────────────────── */}
      <div style={{ marginTop: 24, marginBottom: 26 }}>
        <h1 className="set-h1">Settings</h1>
        <p className="set-subtitle">Account, channels, and notifications.</p>
      </div>

      <div className="set-content">

      {/* ── Hero: identity + credits + actions, three shelves ───────────── */}
      <div className="set-card-hero" style={{ padding: '20px 24px', marginBottom: 16 }}>

        {/* Shelf 1: identity */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          {avatarPic ? (
            <img src={avatarPic} alt="" style={{
              width: 44, height: 44, borderRadius: '50%',
              objectFit: 'cover', flexShrink: 0,
              boxShadow: '0 0 0 1px rgba(20,19,15,0.10)',
            }} />
          ) : (
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: C.chipBg, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 15, fontWeight: 600, color: C.ink,
              flexShrink: 0,
              boxShadow: '0 0 0 1px rgba(20,19,15,0.10)',
            }}>
              {initial || (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ color: C.ink45 }}>
                  <circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>
                </svg>
              )}
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
            <p style={{ fontSize: 15.5, fontWeight: 600, color: C.ink, letterSpacing: '-0.01em' }}>
              {displayName}
            </p>
            {me?.email && (
              <p style={{ fontSize: 14, fontWeight: 400, color: C.ink60, marginTop: 3, letterSpacing: '-0.005em' }}>
                {me.email}
              </p>
            )}
            {me?.member_since && (
              <p style={{ fontSize: 12, fontWeight: 400, color: C.ink45, marginTop: 3, letterSpacing: '-0.005em' }}>
                Member since {fmtMonthYear(me.member_since)}
              </p>
            )}
          </div>

          <div style={{ flexShrink: 0, textAlign: 'right' }}>
            <span style={{
              ...planBadgeStyle(me?.plan),
              fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
              textTransform: 'uppercase', padding: '4px 11px',
              borderRadius: 0, display: 'inline-block',
            }}>{planLabel(me?.plan)}</span>
            {compactBillingLabel(me) && (
              <p style={{ fontSize: 12, fontWeight: 400, color: C.ink55, marginTop: 8, letterSpacing: '-0.005em' }}>
                {compactBillingLabel(me)}
              </p>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="set-divider" style={{ margin: '22px 0' }} />

        {/* Shelf 2: AI analyses + pack balance */}
        <div>
          <p className="set-eyebrow">AI analyses</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 11 }}>
            <span style={{
              fontSize: 42, fontWeight: 600, color: accent.solid,
              letterSpacing: '-0.03em', lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}>{remaining}</span>
            <span style={{ fontSize: 14, fontWeight: 400, color: C.ink60, letterSpacing: '-0.005em' }}>
              of {allowance} left
            </span>
          </div>

          <div style={{
            height: 7, background: 'rgba(20,19,15,0.10)', borderRadius: 99,
            overflow: 'hidden', marginTop: 14,
            boxShadow: 'inset 0 1px 1.5px rgba(0,0,0,0.35)',
          }}>
            <div style={{
              width: `${Math.min(Math.max(remainingPct, 0), 100)}%`,
              height: '100%', borderRadius: 99,
              background: `linear-gradient(180deg, ${accent.light} 0%, ${accent.solid} 100%)`,
              boxShadow: `0 0 8px ${accent.glow}`,
              transition: 'width 0.85s cubic-bezier(0.34,1.56,0.64,1)',
            }} />
          </div>
          <p style={{ fontSize: 12.5, fontWeight: 400, color: C.ink55, marginTop: 10, letterSpacing: '-0.005em' }}>
            {refillLabel(me?.reset_date, me?.is_lifetime)}
          </p>

          {/* Pack balance row */}
          <div style={{
            display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between', gap: 16, marginTop: 22,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 500, color: C.ink, letterSpacing: '-0.005em' }}>
                Credit pack balance
              </p>
              <p style={{ fontSize: 12, fontWeight: 400, color: C.ink55, marginTop: 4, lineHeight: 1.55, letterSpacing: '-0.005em' }}>
                Never expires. Used after monthly analyses run out.
              </p>
            </div>
            <span style={{
              fontSize: 20, fontWeight: 600,
              color: packBalance > 0 ? C.green : C.ink,
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.01em', flexShrink: 0,
            }}>
              {packBalance}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="set-divider" style={{ margin: '22px 0' }} />

        {/* Shelf 3: actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {!isTopPlan && (
            <button className="set-btn-primary" onClick={startUpgrade}>
              Upgrade plan
            </button>
          )}
          <button className="set-btn-secondary" onClick={startTopUp}>
            Top up credits
          </button>
          {hasActiveSub && (
            <button
              className="set-btn-text"
              onClick={openBillingPortal}
              disabled={billingBusy}
              style={{ background: 'none', border: 'none', cursor: billingBusy ? 'wait' : 'pointer' }}
            >
              {billingBusy ? 'Opening…' : 'Manage billing'}
              <ArrowRight size={13} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* ── Channels card ───────────────────────────────────────────────── */}
      <div className="set-card" style={{ padding: '20px 24px 8px', marginBottom: 16 }}>
        <SectionTitle hint={`${activeChannels.length} of ${me?.channels_allowed ?? 1} connected`}>
          Connected channels
        </SectionTitle>

        <div>
          {activeChannels.map((ch, idx) => (
            <div key={ch.channel_id}>
              {idx > 0 && <div className="set-divider" />}
              <div className="set-channel-row">
                {ch.channel_thumbnail ? (
                  <img src={ch.channel_thumbnail} alt="" style={{
                    width: 38, height: 38, borderRadius: '50%',
                    objectFit: 'cover', flexShrink: 0,
                    boxShadow: '0 0 0 1px rgba(20,19,15,0.10)',
                  }} />
                ) : (
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: C.chipBg, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 600, color: C.ink,
                    flexShrink: 0, boxShadow: '0 0 0 1px rgba(20,19,15,0.10)',
                  }}>{(ch.channel_name || '?')[0].toUpperCase()}</div>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <p style={{
                      fontSize: 14, fontWeight: 600, color: C.ink,
                      letterSpacing: '-0.01em',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{ch.channel_name}</p>
                    {ch.is_current && (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        background: C.greenBg, color: C.green,
                        border: `1px solid ${C.greenBdr}`,
                        fontSize: 10, fontWeight: 600, letterSpacing: '0.06em',
                        textTransform: 'uppercase', padding: '2px 8px 2px 7px',
                        borderRadius: 0, flexShrink: 0,
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.green }} />
                        Active
                      </span>
                    )}
                  </div>
                  <p style={{
                    fontSize: 12.5, fontWeight: 400,
                    color: C.ink55, marginTop: 3, letterSpacing: '-0.005em',
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {fmtSubs(ch.subscribers)} subscribers, connected {fmtDate(ch.connected_at)}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  {!ch.is_current && (
                    <button
                      className="set-btn-secondary"
                      style={{ padding: '5px 13px', fontSize: 12 }}
                      onClick={() => handleSwitch(ch.channel_id)}
                    >Switch</button>
                  )}
                  <button className="set-btn-row-disconnect" onClick={() => setDisconnectTarget(ch)}>
                    Disconnect
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Trailing row: + Connect another channel, or upgrade prompt */}
          {activeChannels.length > 0 && <div className="set-divider" />}
          {canAddMore ? (
            <a href="/auth/login" className="set-connect-row">
              <Plus size={15} strokeWidth={2.4} color={C.red} />
              Connect another channel
            </a>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 400, color: C.ink60, lineHeight: 1.55, letterSpacing: '-0.005em' }}>
                  You have reached your channel limit. Upgrade to connect more.
                </p>
              </div>
              <button className="set-btn-primary" onClick={startUpgrade}>
                Upgrade plan
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Feature requests card ───────────────────────────────────────── */}
      <div id="feedback-section" className="set-card" style={{ padding: '20px 24px', marginBottom: 16 }}>
        <SectionTitle
          hint="We read every request. Be specific: what's missing, who it's for, why it matters."
          right={
            <button
              onClick={copyShareLink}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 12, fontWeight: 500,
                color: frShareCopied ? C.green : C.ink45,
                background: 'transparent', border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', padding: '2px 0', flexShrink: 0,
                letterSpacing: '-0.005em',
                transition: 'color 0.15s',
              }}
              title="Copy a public link you can share via email"
            >
              {frShareCopied ? (
                <><Check size={12} strokeWidth={2.4} /> Link copied</>
              ) : (
                <><Link2 size={12} strokeWidth={2} /> Copy share link</>
              )}
            </button>
          }
        >
          Tell us what to build next
        </SectionTitle>

        <label className="set-eyebrow" style={{ display: 'block', marginBottom: 8 }}>
          Title
        </label>
        <input
          type="text"
          value={frTitle}
          onChange={e => setFrTitle(e.target.value.slice(0, FR_TITLE_MAX))}
          placeholder="e.g. Bulk-edit video tags"
          className="set-input"
        />

        <label className="set-eyebrow" style={{ display: 'block', marginBottom: 8, marginTop: 18 }}>
          What would you like to see?
        </label>
        <textarea
          value={frDesc}
          onChange={e => setFrDesc(e.target.value.slice(0, FR_DESC_MAX))}
          rows={4}
          placeholder="Describe the feature, the problem it solves, and how you'd use it."
          className="set-textarea"
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 14 }}>
          <div style={{ fontSize: 12, color: frError ? C.red : C.ink45, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.005em' }}>
            {frError
              ? frError
              : frSuccess
                ? <span style={{ color: '#2d7a4f', fontWeight: 600 }}>Sent. Thanks for the suggestion.</span>
                : `${frDesc.length} / ${FR_DESC_MAX}`}
          </div>
          <button
            onClick={submitFeatureRequest}
            disabled={frSending || !frTitle.trim() || !frDesc.trim()}
            className="set-btn-primary"
          >{frSending ? 'Sending' : 'Send feature request'}</button>
        </div>

        {frMine.length > 0 && (
          <>
            <div className="set-divider" style={{ marginTop: 22 }} />
            <p className="set-eyebrow" style={{ marginTop: 18, marginBottom: 14 }}>
              Your previous requests
            </p>
            <div>
              {frMine.map((r, idx) => {
                const sty = (() => {
                  if (r.status === 'shipped')  return { c: C.green, bg: C.greenBg, b: C.greenBdr, label: 'Shipped' }
                  if (r.status === 'planned')  return { c: C.amber, bg: C.amberBg, b: C.amberBdr, label: 'Planned' }
                  if (r.status === 'declined') return { c: C.ink55, bg: C.chipBg,  b: C.hairline,  label: 'Declined' }
                  return { c: C.ink60, bg: C.chipBg, b: C.hairline, label: 'Under review' }
                })()
                return (
                  <div key={r.id}>
                    {idx > 0 && <div className="set-divider" />}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 500, color: C.ink, letterSpacing: '-0.005em' }}>{r.title}</p>
                        <p style={{ fontSize: 12, fontWeight: 400, color: C.ink45, marginTop: 3, letterSpacing: '-0.005em' }}>{fmtDate(r.created_at)}</p>
                      </div>
                      <span style={{
                        fontSize: 10, fontWeight: 600, color: sty.c, background: sty.bg,
                        border: `1px solid ${sty.b}`, padding: '3px 9px', borderRadius: 0,
                        letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0,
                      }}>{sty.label}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Notifications card ──────────────────────────────────────────── */}
      <div className="set-card" style={{ padding: '20px 24px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="set-card-title">Weekly channel report</p>
          <p className="set-card-sub">Summary of your channel performance every 7 days.</p>
        </div>
        <Toggle on={me?.weekly_report_enabled ?? true} onChange={handleToggleReport} />
      </div>

      {/* ── Support card ────────────────────────────────────────────────── */}
      <div className="set-card" style={{ padding: '20px 24px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="set-card-title">Contact support</p>
          <p className="set-card-sub">Failed run, billing question, or anything else.</p>
        </div>
        <a href={'mailto:' + supportEmail()} className="set-btn-secondary">
          {supportEmail()}
        </a>
      </div>

      {/* ── Danger zone ─────────────────────────────────────────────────── */}
      <div style={{
        background: 'rgba(201,160,48,0.03)',
        border: '1px solid rgba(201,160,48,0.20)',
        borderRadius: 0,
        boxShadow: 'none',
        padding: '20px 24px',
        marginBottom: 48,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="set-card-title" style={{ color: '#7a5b14' }}>Delete account</p>
          <p className="set-card-sub">Permanently deletes account, channels, analyses, and reports.</p>
        </div>
        <button className="set-btn-danger-outline" onClick={() => setShowDeleteDialog(true)}>
          Delete account
        </button>
      </div>

      </div>{/* /.set-content */}

      {/* Disconnect dialog */}
      {disconnectTarget && (
        <ConfirmDialog
          title={`Disconnect ${disconnectTarget.channel_name}?`}
          body="Your data will be preserved. You can reconnect this channel anytime."
          confirmLabel="Disconnect"
          onConfirm={handleDisconnectConfirm}
          onCancel={() => setDisconnectTarget(null)}
        />
      )}

      {/* Delete account dialog */}
      {showDeleteDialog && (
        <ConfirmDialog
          title="Delete your account?"
          body="This will permanently delete your account and all associated data. This cannot be undone."
          confirmLabel="Delete account"
          requireTyping
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteDialog(false)}
        />
      )}
    </div>
  )
}
