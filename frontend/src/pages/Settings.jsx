import { useEffect, useState } from 'react'
import { loginUrl } from '../utm.js'

/* ── Design tokens ──────────────────────────────────────────────────────────
   Aligned with the Competitors design north-star. Geist font, 1040 centered,
   single-shadow + inset-from-above highlight cards, hairline
   rgba(10,10,15,0.07) borders, 14px radius, 11/700/0.10em eyebrows, 800
   reserved for big stat values only. */
const C = {
  red:      '#e5251b',
  redLight: '#ef3a31',
  redBg:    '#fff5f5',
  redBdr:   '#fecaca',
  green:    '#16a34a',
  greenBg:  '#f0fdf4',
  greenBdr: '#bbf7d0',
  amber:    '#d97706',
  amberBg:  '#fffbeb',
  amberBdr: '#fde68a',
  ink:      '#0a0a0f',
  ink60:    'rgba(10,10,15,0.60)',
  ink55:    'rgba(10,10,15,0.55)',
  ink45:    'rgba(10,10,15,0.45)',
  ink30:    'rgba(10,10,15,0.30)',
  hairline: 'rgba(10,10,15,0.07)',
  chipBg:   '#f4f4f6',
}

/* ── Page-scoped styles. Geist load, base typography, card grammar, button
      styles, input styles. Same pattern as Competitors / Chat. ───────────── */
function useSettingsStyles() {
  useEffect(() => {
    if (!document.getElementById('ytg-set-geist-font')) {
      const link = document.createElement('link')
      link.id = 'ytg-set-geist-font'
      link.rel = 'stylesheet'
      link.href = 'https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap'
      document.head.appendChild(link)
    }
    if (document.getElementById('ytg-set-styles-v2')) return
    const style = document.createElement('style')
    style.id = 'ytg-set-styles-v2'
    style.textContent = `
      .set-page { max-width: 1040px; margin: 0 auto; }
      .set-page, .set-page * {
        box-sizing: border-box;
        font-family: 'Geist', 'Inter', system-ui, sans-serif;
        -webkit-font-smoothing: antialiased;
      }
      .set-page p, .set-page span, .set-page div, .set-page h1, .set-page label { margin: 0; }

      .set-h1 {
        font-size: 28px; font-weight: 600; color: ${C.ink};
        letter-spacing: -0.02em; line-height: 1.15;
      }
      .set-subtitle {
        font-size: 14px; font-weight: 450; color: ${C.ink55};
        margin-top: 6px !important; letter-spacing: -0.005em;
      }

      .set-card {
        background: #ffffff;
        border: 1px solid ${C.hairline};
        border-radius: 14px;
        box-shadow: 0 1px 2px rgba(15,15,25,0.04), inset 0 1px 0 rgba(255,255,255,0.7);
      }

      .set-divider { height: 1px; background: ${C.hairline}; width: 100%; }

      .set-eyebrow {
        font-size: 11px; font-weight: 700;
        letter-spacing: 0.10em; text-transform: uppercase;
        color: ${C.ink45};
      }

      .set-card-title {
        font-size: 15px; font-weight: 600; color: ${C.ink};
        letter-spacing: -0.01em;
      }
      .set-card-sub {
        font-size: 13px; font-weight: 450; color: ${C.ink55};
        margin-top: 4px !important; line-height: 1.55;
        letter-spacing: -0.005em;
      }

      /* ── Buttons ──────────────────────────────────────────────────────── */
      .set-btn-primary {
        background: linear-gradient(180deg, ${C.redLight} 0%, ${C.red} 100%);
        color: #fff; border: none; border-radius: 100px;
        padding: 8px 18px; font-size: 13px; font-weight: 600;
        font-family: 'Geist', 'Inter', system-ui, sans-serif;
        cursor: pointer; white-space: nowrap;
        letter-spacing: -0.01em; text-decoration: none;
        display: inline-flex; align-items: center; gap: 6px;
        box-shadow: 0 1px 2px rgba(229,37,27,0.30), inset 0 1px 0 rgba(255,255,255,0.22);
        transition: filter 160ms cubic-bezier(0.32,0.72,0,1), transform 160ms cubic-bezier(0.32,0.72,0,1);
      }
      .set-btn-primary:hover:not(:disabled) { filter: brightness(1.06); transform: translateY(-1px); }
      .set-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

      .set-btn-secondary {
        background: #ffffff; color: ${C.ink};
        border: 1px solid rgba(10,10,15,0.10); border-radius: 100px;
        padding: 7px 16px; font-size: 13px; font-weight: 600;
        font-family: 'Geist', 'Inter', system-ui, sans-serif;
        cursor: pointer; white-space: nowrap;
        letter-spacing: -0.01em;
        box-shadow: 0 1px 2px rgba(15,15,25,0.04), inset 0 1px 0 rgba(255,255,255,0.7);
        transition: background 160ms cubic-bezier(0.32,0.72,0,1), border-color 160ms cubic-bezier(0.32,0.72,0,1);
      }
      .set-btn-secondary:hover { background: rgba(10,10,15,0.025); border-color: rgba(10,10,15,0.18); }

      .set-btn-text {
        background: transparent; color: ${C.ink55};
        border: none; padding: 6px 4px;
        font-size: 13px; font-weight: 500;
        font-family: 'Geist', 'Inter', system-ui, sans-serif;
        cursor: pointer; text-decoration: none;
        letter-spacing: -0.01em;
        display: inline-flex; align-items: center; gap: 5px;
        transition: color 160ms cubic-bezier(0.32,0.72,0,1);
      }
      .set-btn-text:hover { color: ${C.ink}; }

      .set-btn-danger-outline {
        background: #ffffff; color: ${C.red};
        border: 1px solid rgba(229,37,27,0.25); border-radius: 100px;
        padding: 7px 16px; font-size: 13px; font-weight: 600;
        font-family: 'Geist', 'Inter', system-ui, sans-serif;
        cursor: pointer; white-space: nowrap;
        letter-spacing: -0.01em;
        box-shadow: 0 1px 2px rgba(229,37,27,0.06);
        transition: background 160ms cubic-bezier(0.32,0.72,0,1), border-color 160ms cubic-bezier(0.32,0.72,0,1);
      }
      .set-btn-danger-outline:hover { background: rgba(229,37,27,0.04); border-color: rgba(229,37,27,0.40); }

      .set-btn-row-disconnect {
        background: transparent; color: ${C.red};
        border: none; padding: 5px 6px;
        font-size: 12.5px; font-weight: 600;
        font-family: 'Geist', 'Inter', system-ui, sans-serif;
        cursor: pointer; letter-spacing: -0.01em;
        transition: color 160ms cubic-bezier(0.32,0.72,0,1);
      }
      .set-btn-row-disconnect:hover { color: ${C.redLight}; }

      /* ── Inputs ───────────────────────────────────────────────────────── */
      .set-input {
        width: 100%; padding: 10px 14px;
        background: #ffffff;
        border: 1px solid rgba(10,10,15,0.10);
        border-radius: 12px;
        font-size: 13.5px; font-weight: 450; color: ${C.ink};
        font-family: 'Geist', 'Inter', system-ui, sans-serif;
        outline: none; letter-spacing: -0.005em;
        box-shadow: 0 1px 2px rgba(15,15,25,0.03), inset 0 1px 0 rgba(255,255,255,0.7);
        transition: border-color 180ms cubic-bezier(0.32,0.72,0,1), box-shadow 180ms cubic-bezier(0.32,0.72,0,1);
      }
      .set-input::placeholder { color: rgba(10,10,15,0.40); font-weight: 450; }
      .set-input:focus {
        border-color: rgba(229,37,27,0.30);
        box-shadow: 0 0 0 4px rgba(229,37,27,0.06), 0 1px 2px rgba(15,15,25,0.03), inset 0 1px 0 rgba(255,255,255,0.7);
      }

      .set-textarea {
        width: 100%; padding: 12px 14px;
        background: #ffffff;
        border: 1px solid rgba(10,10,15,0.10);
        border-radius: 12px;
        font-size: 13.5px; font-weight: 450; color: ${C.ink};
        font-family: 'Geist', 'Inter', system-ui, sans-serif;
        outline: none; letter-spacing: -0.005em; line-height: 1.55;
        resize: vertical; min-height: 104px;
        box-shadow: 0 1px 2px rgba(15,15,25,0.03), inset 0 1px 0 rgba(255,255,255,0.7);
        transition: border-color 180ms cubic-bezier(0.32,0.72,0,1), box-shadow 180ms cubic-bezier(0.32,0.72,0,1);
      }
      .set-textarea::placeholder { color: rgba(10,10,15,0.40); font-weight: 450; }
      .set-textarea:focus {
        border-color: rgba(229,37,27,0.30);
        box-shadow: 0 0 0 4px rgba(229,37,27,0.06), 0 1px 2px rgba(15,15,25,0.03), inset 0 1px 0 rgba(255,255,255,0.7);
      }

      /* Channel row hover lift — subtle, matches Competitors */
      .set-channel-row {
        display: flex; align-items: center; gap: 14px;
        padding: 14px 0;
        transition: opacity 160ms cubic-bezier(0.32,0.72,0,1);
      }

      /* Connect-another row — soft red text + tinted plus circle */
      .set-connect-row {
        display: flex; align-items: center; gap: 12px;
        padding: 14px 0; text-decoration: none;
        color: ${C.red}; font-size: 13.5px; font-weight: 500;
        letter-spacing: -0.01em; cursor: pointer;
        transition: opacity 160ms cubic-bezier(0.32,0.72,0,1);
      }
      .set-connect-row:hover { opacity: 0.78; }

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
function Toggle({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width: 44, height: 24, borderRadius: 100,
        background: on ? C.green : '#d4d4dc',
        border: 'none', cursor: 'pointer', position: 'relative',
        transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: on ? 23 : 3,
        width: 18, height: 18, borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        transition: 'left 0.2s',
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
      background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: '#fff', borderRadius: 14,
        padding: '24px 26px', maxWidth: 400, width: '90%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        border: `1px solid ${C.hairline}`,
      }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: C.ink, letterSpacing: '-0.01em', marginBottom: 8 }}>{title}</p>
        <p style={{ fontSize: 13.5, color: C.ink60, lineHeight: 1.6, marginBottom: requireTyping ? 16 : 22, letterSpacing: '-0.005em' }}>{body}</p>
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

  const allowance    = me?.monthly_allowance ?? 3
  const used         = me?.monthly_used ?? 0
  const remaining    = Math.max(0, allowance - used)
  const remainingPct = allowance > 0 ? (remaining / allowance) * 100 : 0
  const atLimit      = remaining === 0
  const nearLimit    = !atLimit && remainingPct <= 20
  const accent       = atLimit ? C.red : nearLimit ? C.amber : C.green

  // Avatar: Google profile → connected channel thumb → first letter
  const avatarPic    = me?.profile_picture || channelData?.channel?.thumbnail || me?.channels?.[0]?.channel_thumbnail
  const displayName  = me?.display_name || channelData?.channel?.channel_name || me?.channels?.[0]?.channel_name || 'Account'
  const initial      = (displayName || me?.email || '').trim()[0]?.toUpperCase() || ''

  return (
    <div className="set-page">

      {/* ── Page heading ────────────────────────────────────────────────── */}
      <div style={{ marginTop: 24, marginBottom: 28 }}>
        <h1 className="set-h1">Settings</h1>
        <p className="set-subtitle">Account, channels, and notifications.</p>
      </div>

      {/* ── Hero: identity + credits + actions, three shelves ───────────── */}
      <div className="set-card" style={{ padding: '26px 28px', marginBottom: 16 }}>

        {/* Shelf 1: identity */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          {avatarPic ? (
            <img src={avatarPic} alt="" style={{
              width: 40, height: 40, borderRadius: '50%',
              objectFit: 'cover', flexShrink: 0,
              border: `1px solid ${C.hairline}`,
            }} />
          ) : (
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: C.chipBg, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: C.ink,
              flexShrink: 0, border: `1px solid ${C.hairline}`,
            }}>
              {initial || (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ color: C.ink45 }}>
                  <circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>
                </svg>
              )}
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: C.ink, letterSpacing: '-0.01em' }}>
              {displayName}
            </p>
            {me?.email && (
              <p style={{ fontSize: 13.5, fontWeight: 450, color: C.ink60, marginTop: 3, letterSpacing: '-0.005em' }}>
                {me.email}
              </p>
            )}
            {me?.member_since && (
              <p style={{ fontSize: 12, fontWeight: 450, color: C.ink45, marginTop: 3, letterSpacing: '-0.005em' }}>
                Member since {fmtMonthYear(me.member_since)}
              </p>
            )}
          </div>

          <div style={{ flexShrink: 0, textAlign: 'right' }}>
            <span style={{
              ...planBadgeStyle(me?.plan),
              fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
              textTransform: 'uppercase', padding: '4px 11px',
              borderRadius: 100, display: 'inline-block',
            }}>{planLabel(me?.plan)}</span>
            {compactBillingLabel(me) && (
              <p style={{ fontSize: 12, fontWeight: 450, color: C.ink55, marginTop: 7, letterSpacing: '-0.005em' }}>
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
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 10 }}>
            <span style={{
              fontSize: 40, fontWeight: 700, color: accent,
              letterSpacing: '-0.025em', lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}>{remaining}</span>
            <span style={{ fontSize: 14, fontWeight: 450, color: C.ink60, letterSpacing: '-0.005em' }}>
              of {allowance} left
            </span>
          </div>

          <div style={{
            height: 6, background: '#eef0f3', borderRadius: 99,
            overflow: 'hidden', marginTop: 14,
          }}>
            <div style={{
              width: `${Math.min(Math.max(remainingPct, 0), 100)}%`,
              height: '100%', background: accent, borderRadius: 99,
              transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1), background 0.2s',
            }} />
          </div>
          <p style={{ fontSize: 12.5, fontWeight: 450, color: C.ink55, marginTop: 10, letterSpacing: '-0.005em' }}>
            {refillLabel(me?.reset_date, me?.is_lifetime)}
          </p>

          {/* Pack balance row */}
          <div style={{
            display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between', gap: 16, marginTop: 22,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13.5, fontWeight: 500, color: C.ink, letterSpacing: '-0.005em' }}>
                Credit pack balance
              </p>
              <p style={{ fontSize: 12, fontWeight: 450, color: C.ink55, marginTop: 4, lineHeight: 1.55, letterSpacing: '-0.005em' }}>
                Never expires. Used after monthly analyses run out.
              </p>
            </div>
            <span style={{
              fontSize: 20, fontWeight: 700,
              color: (me?.pack_balance ?? 0) > 0 ? C.green : C.ink,
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.01em', flexShrink: 0,
            }}>
              {me?.pack_balance ?? 0}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="set-divider" style={{ margin: '22px 0' }} />

        {/* Shelf 3: actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {!isTopPlan && (
            <button className="set-btn-primary" onClick={() => window.location.href = '/?tab=monthly#pricing'}>
              Upgrade plan
            </button>
          )}
          <button className="set-btn-secondary" onClick={() => window.location.href = '/?tab=packs#pricing'}>
            Top up credits
          </button>
          {hasActiveSub && (
            <a className="set-btn-text" href="mailto:support@ytgrowth.io?subject=Manage%20billing">
              Manage billing
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h6M7 3l3 3-3 3"/>
              </svg>
            </a>
          )}
        </div>
      </div>

      {/* ── Channels card ───────────────────────────────────────────────── */}
      <div className="set-card" style={{ padding: '24px 28px 8px', marginBottom: 16 }}>
        <div style={{ marginBottom: 4 }}>
          <p className="set-card-title">Connected channels</p>
          <p className="set-card-sub">{activeChannels.length} of {me?.channels_allowed ?? 1} connected</p>
        </div>

        <div style={{ marginTop: 18 }}>
          {activeChannels.map((ch, idx) => (
            <div key={ch.channel_id}>
              {idx > 0 && <div className="set-divider" />}
              <div className="set-channel-row">
                {ch.channel_thumbnail ? (
                  <img src={ch.channel_thumbnail} alt="" style={{
                    width: 36, height: 36, borderRadius: '50%',
                    objectFit: 'cover', flexShrink: 0,
                    border: `1px solid ${C.hairline}`,
                  }} />
                ) : (
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: C.chipBg, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: C.ink,
                    flexShrink: 0, border: `1px solid ${C.hairline}`,
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
                        background: C.greenBg, color: C.green,
                        border: `1px solid ${C.greenBdr}`,
                        fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                        textTransform: 'uppercase', padding: '2px 8px',
                        borderRadius: 100, flexShrink: 0,
                      }}>Active</span>
                    )}
                  </div>
                  <p style={{
                    fontSize: 12.5, fontWeight: 450,
                    color: C.ink55, marginTop: 3, letterSpacing: '-0.005em',
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
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(229,37,27,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="3" x2="8" y2="13"/><line x1="3" y1="8" x2="13" y2="8"/>
                </svg>
              </div>
              Connect another channel
            </a>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13.5, fontWeight: 450, color: C.ink60, lineHeight: 1.55, letterSpacing: '-0.005em' }}>
                  You have reached your channel limit. Upgrade to connect more.
                </p>
              </div>
              <button className="set-btn-primary" onClick={() => window.location.href = '/?tab=monthly#pricing'}>
                Upgrade plan
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Feature requests card ───────────────────────────────────────── */}
      <div id="feedback-section" className="set-card" style={{ padding: '26px 28px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="set-card-title">Tell us what to build next</p>
            <p className="set-card-sub">We read every request. Be specific: what's missing, who it's for, why it matters.</p>
          </div>
          <button
            onClick={copyShareLink}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 12, fontWeight: 500,
              color: frShareCopied ? C.green : C.ink45,
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', padding: '4px 0', flexShrink: 0,
              letterSpacing: '-0.005em',
              transition: 'color 0.15s',
            }}
            title="Copy a public link you can share via email"
          >
            {frShareCopied ? (
              <>
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1.5,5.5 4.5,8.5 9.5,2.5"/></svg>
                Link copied
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.71"/></svg>
                Copy share link
              </>
            )}
          </button>
        </div>

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
                ? <span style={{ color: C.green, fontWeight: 600 }}>Sent. Thanks for the suggestion.</span>
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
                        <p style={{ fontSize: 13.5, fontWeight: 500, color: C.ink, letterSpacing: '-0.005em' }}>{r.title}</p>
                        <p style={{ fontSize: 12, fontWeight: 450, color: C.ink45, marginTop: 3, letterSpacing: '-0.005em' }}>{fmtDate(r.created_at)}</p>
                      </div>
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: sty.c, background: sty.bg,
                        border: `1px solid ${sty.b}`, padding: '3px 9px', borderRadius: 100,
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
      <div className="set-card" style={{ padding: '20px 28px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: C.ink, letterSpacing: '-0.005em' }}>
            Weekly channel report
          </p>
          <p style={{ fontSize: 12.5, fontWeight: 450, color: C.ink55, marginTop: 4, lineHeight: 1.55, letterSpacing: '-0.005em' }}>
            Summary of your channel performance every 7 days.
          </p>
        </div>
        <Toggle on={me?.weekly_report_enabled ?? true} onChange={handleToggleReport} />
      </div>

      {/* ── Support card ────────────────────────────────────────────────── */}
      <div className="set-card" style={{ padding: '20px 28px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: C.ink, letterSpacing: '-0.005em' }}>
            Contact support
          </p>
          <p style={{ fontSize: 12.5, fontWeight: 450, color: C.ink55, marginTop: 4, lineHeight: 1.55, letterSpacing: '-0.005em' }}>
            Failed run, billing question, or anything else.
          </p>
        </div>
        <a href="mailto:support@ytgrowth.io" className="set-btn-primary">
          support@ytgrowth.io
        </a>
      </div>

      {/* ── Danger zone ─────────────────────────────────────────────────── */}
      <div style={{
        background: 'rgba(229,37,27,0.025)',
        border: '1px solid rgba(229,37,27,0.10)',
        borderRadius: 14,
        boxShadow: '0 1px 2px rgba(15,15,25,0.04), inset 0 1px 0 rgba(255,255,255,0.7)',
        padding: '20px 28px',
        marginBottom: 48,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: C.red, letterSpacing: '-0.005em' }}>
            Delete account
          </p>
          <p style={{ fontSize: 12.5, fontWeight: 450, color: C.ink55, marginTop: 4, lineHeight: 1.55, letterSpacing: '-0.005em' }}>
            Permanently deletes account, channels, analyses, and reports.
          </p>
        </div>
        <button className="set-btn-danger-outline" onClick={() => setShowDeleteDialog(true)}>
          Delete account
        </button>
      </div>

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
