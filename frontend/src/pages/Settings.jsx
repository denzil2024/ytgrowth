import { useEffect, useState } from 'react'
import { loginUrl } from '../utm.js'

/* ── Design tokens ───────────────────────────────────────────────────────── */
const C = {
  red:     '#e5251b', redBg:   'rgba(229,37,27,0.06)', redBdr:   'rgba(229,37,27,0.20)',
  green:   '#059669', greenBg: 'rgba(5,150,105,0.08)', greenBdr: 'rgba(5,150,105,0.22)',
  amber:   '#d97706', amberBg: 'rgba(217,119,6,0.08)', amberBdr: 'rgba(217,119,6,0.22)',
  text1:   '#0a0a0f',
  text2:   'rgba(10,10,15,0.65)',
  text3:   'rgba(10,10,15,0.45)',
  text4:   'rgba(10,10,15,0.30)',
  border:  'rgba(10,10,15,0.07)',
  borderH: 'rgba(10,10,15,0.10)',  // hover-emphasised
  chipBg:  'rgba(10,10,15,0.04)',
}

/* Page-scoped Geist + new card grammar. Matches every other redesigned page
   (Competitors design north-star). The scoped CSS handles font inheritance,
   card chrome, hover lift, and the quiet-soft-grey toggle pattern. */
function useSettingsStyles() {
  useEffect(() => {
    if (!document.getElementById('ytg-settings-fonts')) {
      const link = document.createElement('link')
      link.id = 'ytg-settings-fonts'
      link.rel = 'stylesheet'
      link.href = 'https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap'
      document.head.appendChild(link)
    }
    if (!document.getElementById('ytg-settings-styles')) {
      const style = document.createElement('style')
      style.id = 'ytg-settings-styles'
      style.textContent = `
        .set-page, .set-page * {
          font-family: 'Geist', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .set-page p, .set-page span, .set-page div, .set-page h1, .set-page h2 { margin: 0; }
        @keyframes settingsSpin { to { transform: rotate(360deg) } }

        /* Card — single grammar across the page */
        .set-card {
          background: #ffffff;
          border: 1px solid ${C.border};
          border-radius: 14px;
          box-shadow: 0 1px 2px rgba(15,15,25,0.04),
                      0 6px 18px rgba(15,15,25,0.05),
                      inset 0 1px 0 rgba(255,255,255,0.7);
          transition: box-shadow 0.2s cubic-bezier(0.2,0.7,0.3,1),
                      border-color 0.2s cubic-bezier(0.2,0.7,0.3,1);
        }
        .set-card.danger {
          border-color: rgba(229,37,27,0.12);
        }

        /* Section header pattern */
        .set-section-head {
          display: flex; align-items: baseline; justify-content: space-between;
          gap: 12px; flex-wrap: wrap;
          margin: 0 0 14px;
        }
        .set-section-head h2 {
          font-size: 22px; font-weight: 700; color: ${C.text1};
          letter-spacing: -0.5px; line-height: 1.2; margin: 0;
        }
        .set-section-head h2.danger { color: ${C.red}; }
        .set-section-head .set-section-meta {
          font-size: 12px; font-weight: 500; color: ${C.text2};
          letter-spacing: -0.05px;
        }

        /* Buttons */
        .set-btn-primary {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 100px;
          border: none; cursor: pointer;
          background: ${C.red}; color: #ffffff;
          font-family: inherit;
          font-size: 12.5px; font-weight: 600; letter-spacing: -0.05px;
          box-shadow: 0 1px 3px rgba(229,37,27,0.28);
          transition: filter 0.18s cubic-bezier(0.2,0.7,0.3,1),
                      transform 0.18s cubic-bezier(0.2,0.7,0.3,1);
        }
        .set-btn-primary:hover:not(:disabled) { filter: brightness(1.08); transform: translateY(-1px); }
        .set-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

        .set-btn-ghost {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 7px 14px; border-radius: 100px;
          border: 1px solid ${C.borderH};
          background: #ffffff; color: ${C.text2};
          font-family: inherit;
          font-size: 12.5px; font-weight: 600; letter-spacing: -0.05px;
          cursor: pointer;
          transition: background 0.18s, color 0.18s, border-color 0.18s;
        }
        .set-btn-ghost:hover { background: ${C.chipBg}; color: ${C.text1}; border-color: ${C.text4}; }
        .set-btn-ghost.danger { color: ${C.red}; border-color: rgba(229,37,27,0.25); }
        .set-btn-ghost.danger:hover { background: rgba(229,37,27,0.05); color: ${C.red}; border-color: rgba(229,37,27,0.40); }

        .set-btn-link {
          background: transparent; border: none;
          color: ${C.text3}; font-family: inherit;
          font-size: 12px; font-weight: 500; letter-spacing: -0.05px;
          cursor: pointer; padding: 6px 4px;
          transition: color 0.15s;
        }
        .set-btn-link:hover { color: ${C.red}; }

        /* Form fields — premium pattern (matches SEO Studio title input) */
        .set-input, .set-textarea {
          width: 100%; box-sizing: border-box;
          padding: 13px 16px;
          font-family: inherit;
          font-size: 14px; font-weight: 500; letter-spacing: -0.05px;
          color: ${C.text1};
          background: #ffffff;
          border: 1px solid ${C.borderH};
          border-radius: 12px;
          outline: none;
          box-shadow: 0 1px 2px rgba(15,15,25,0.03), inset 0 1px 0 rgba(255,255,255,0.7);
          transition: border-color 0.2s cubic-bezier(0.2,0.7,0.3,1),
                      box-shadow 0.2s cubic-bezier(0.2,0.7,0.3,1);
        }
        .set-textarea { resize: vertical; min-height: 100px; line-height: 1.55; }
        .set-input:focus, .set-textarea:focus {
          border-color: rgba(10,10,15,0.30);
          box-shadow: 0 0 0 4px rgba(10,10,15,0.05),
                      0 1px 2px rgba(15,15,25,0.04),
                      inset 0 1px 0 rgba(255,255,255,0.7);
        }

        /* Channel row — inline (no inner card-on-card) */
        .set-channel-row {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 4px;
          border-bottom: 1px solid ${C.border};
          transition: background 0.14s;
        }
        .set-channel-row:last-child { border-bottom: none; }

        /* "Connect another channel" tile */
        .set-connect-tile {
          display: flex; align-items: center; justify-content: center;
          gap: 6px;
          padding: 13px 16px; border-radius: 12px;
          border: 1px dashed ${C.borderH};
          background: transparent;
          text-decoration: none;
          color: ${C.text2};
          font-size: 13px; font-weight: 600; letter-spacing: -0.05px;
          transition: border-color 0.18s, color 0.18s, background 0.18s;
        }
        .set-connect-tile:hover {
          border-color: ${C.red}; color: ${C.red};
          background: rgba(229,37,27,0.02);
        }
      `
      document.head.appendChild(style)
    }
  }, [])
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function planBadgeStyle(plan) {
  const p = (plan || '').toLowerCase()
  if (p.includes('agency')) return { background: C.redBg,   color: C.red,   border: `1px solid ${C.redBdr}` }
  if (p.includes('growth')) return { background: C.greenBg, color: C.green, border: `1px solid ${C.greenBdr}` }
  if (p.includes('solo'))   return { background: C.amberBg, color: C.amber, border: `1px solid ${C.amberBdr}` }
  return { background: C.chipBg, color: C.text2, border: `1px solid ${C.border}` }
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

function billingCycleLabel(me) {
  if (!me) return ''
  if (me.is_lifetime) return 'Lifetime — never expires'
  if (me.plan === 'free') return 'Free plan'
  if (me.billing_cycle === 'monthly' && me.reset_date) return `Monthly · Renews ${fmtDate(me.reset_date)}`
  if (me.billing_cycle === 'annual'  && me.reset_date) return `Annual · Renews ${fmtDate(me.reset_date)}`
  return me.billing_cycle || ''
}

function daysUntilReset(iso) {
  if (!iso) return null
  try {
    const diff = new Date(iso).getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / 86400000))
  } catch { return null }
}

function refillLabel(iso, isLifetime) {
  if (isLifetime) return 'Lifetime plan — monthly reset'
  const d = daysUntilReset(iso)
  if (d == null) return ''
  if (d === 0) return 'Refills today'
  if (d === 1) return 'Refills tomorrow'
  return `Refills in ${d} days`
}

/* ── Small components ─────────────────────────────────────────────────────── */
function SectionHead({ title, danger, meta, children }) {
  return (
    <div className="set-section-head">
      <h2 className={danger ? 'danger' : ''}>{title}</h2>
      {meta && <span className="set-section-meta">{meta}</span>}
      {children}
    </div>
  )
}

function RemainingBar({ remainingPct, accent }) {
  return (
    <div style={{ height: 6, background: 'rgba(10,10,15,0.06)', borderRadius: 99, overflow: 'hidden', margin: '10px 0 0' }}>
      <div style={{
        width: `${Math.min(Math.max(remainingPct, 0), 100)}%`,
        height: '100%', background: accent, borderRadius: 99,
        transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1), background 0.2s',
      }} />
    </div>
  )
}

function Toggle({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width: 44, height: 24, borderRadius: 100,
        background: on ? C.green : 'rgba(10,10,15,0.18)',
        border: 'none', cursor: 'pointer', position: 'relative',
        transition: 'background 0.2s cubic-bezier(0.2,0.7,0.3,1)', flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: on ? 23 : 3,
        width: 18, height: 18, borderRadius: '50%',
        background: '#ffffff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
        transition: 'left 0.2s cubic-bezier(0.2,0.7,0.3,1)',
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
      background: 'rgba(10,10,15,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 16,
    }}>
      <div style={{
        background: '#ffffff', borderRadius: 14,
        padding: '24px 26px', maxWidth: 420, width: '100%',
        boxShadow: '0 24px 60px rgba(10,10,15,0.22)',
        border: `1px solid ${C.border}`,
      }}>
        <p style={{ fontSize: 17, fontWeight: 600, color: C.text1, letterSpacing: '-0.3px', marginBottom: 8 }}>{title}</p>
        <p style={{ fontSize: 13.5, color: C.text2, lineHeight: 1.6, marginBottom: requireTyping ? 16 : 22 }}>{body}</p>
        {requireTyping && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: C.text3, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Type DELETE to confirm</p>
            <input
              autoFocus
              value={typed}
              onChange={e => setTyped(e.target.value)}
              placeholder="DELETE"
              className="set-input"
              style={{
                letterSpacing: '0.10em',
                borderColor: typed === 'DELETE' ? C.red : C.borderH,
              }}
            />
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} className="set-btn-ghost">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={!canConfirm}
            className="set-btn-primary"
          >{confirmLabel || 'Confirm'}</button>
        </div>
      </div>
    </div>
  )
}

/* ── Main component ───────────────────────────────────────────────────────── */
export default function Settings({ channelData }) {
  useSettingsStyles()
  const [me, setMe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [disconnectTarget, setDisconnectTarget] = useState(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [toggleWorking, setToggleWorking] = useState(false)

  // ── Feature request state ──────────────────────────────────────────────
  const [frTitle, setFrTitle]         = useState('')
  const [frDesc, setFrDesc]           = useState('')
  const [frSending, setFrSending]     = useState(false)
  const [frError, setFrError]         = useState('')
  const [frSuccess, setFrSuccess]     = useState(false)
  const [frMine, setFrMine]           = useState([])
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
      <div className="set-page" style={{ maxWidth: 1040, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ width: 28, height: 28, border: '2.5px solid rgba(10,10,15,0.08)', borderTop: `2.5px solid ${C.red}`, borderRadius: '50%', animation: 'settingsSpin 0.7s linear infinite' }} />
      </div>
    )
  }

  const activeChannels = me?.channels || []
  const canAddMore = me?.can_add_more ?? false
  const isTopPlan = me?.plan === 'agency' || me?.plan === 'lifetime_agency'
  const hasActiveSub = me?.status === 'active' && !me?.is_lifetime

  return (
    <div className="set-page" style={{ maxWidth: 1040, margin: '0 auto' }}>

      {/* ── Page heading ────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: C.text1, letterSpacing: '-0.7px', marginBottom: 6, lineHeight: 1.1 }}>Settings</h1>
        <p style={{ fontSize: 13.5, color: C.text2, fontWeight: 500, letterSpacing: '-0.05px', lineHeight: 1.5 }}>
          Account, plan, channels, preferences.
        </p>
      </div>

      {/* ── Account ─────────────────────────────────────────────────────── */}
      <SectionHead title="Account" />
      <div className="set-card" style={{ padding: '20px 24px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 20 }}>
        {(() => {
          const pic = me?.profile_picture || channelData?.channel?.thumbnail || me?.channels?.[0]?.channel_thumbnail
          const fallbackName = me?.display_name || channelData?.channel?.channel_name || me?.channels?.[0]?.channel_name || me?.email
          if (pic) {
            return <img src={pic} alt="" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `1px solid ${C.border}` }} />
          }
          const initial = (fallbackName || '').trim()[0]
          return (
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: C.chipBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 600, color: C.text1, flexShrink: 0, border: `1px solid ${C.border}` }}>
              {initial ? initial.toUpperCase() : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ color: C.text3 }}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>}
            </div>
          )
        })()}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: C.text1, letterSpacing: '-0.25px', lineHeight: 1.25 }}>
            {me?.display_name || channelData?.channel?.channel_name || me?.channels?.[0]?.channel_name || 'Account'}
          </p>
          {me?.email && <p style={{ fontSize: 13.5, color: C.text2, marginTop: 4, fontWeight: 500 }}>{me.email}</p>}
          {me?.member_since && (
            <p style={{ fontSize: 12, color: C.text3, marginTop: 3, fontWeight: 500 }}>Member since {fmtMonthYear(me.member_since)}</p>
          )}
        </div>
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          <span style={{
            ...planBadgeStyle(me?.plan),
            fontSize: 10.5, fontWeight: 700,
            letterSpacing: '0.10em', textTransform: 'uppercase',
            padding: '4px 11px', borderRadius: 100,
            display: 'inline-block',
          }}>{planLabel(me?.plan)}</span>
          <p style={{ fontSize: 12, color: C.text3, marginTop: 6, fontWeight: 500 }}>{billingCycleLabel(me)}</p>
        </div>
      </div>

      {/* ── Connected channels ─────────────────────────────────────────── */}
      <SectionHead title="Connected channels" meta={`${activeChannels.length} of ${me?.channels_allowed ?? 1}`} />
      <div className="set-card" style={{ padding: '8px 24px 18px', marginBottom: 32 }}>
        <div>
          {activeChannels.map(ch => (
            <div key={ch.channel_id} className="set-channel-row">
              {ch.channel_thumbnail
                ? <img src={ch.channel_thumbnail} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `1px solid ${C.border}` }} />
                : <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.chipBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: C.text1, flexShrink: 0, border: `1px solid ${C.border}` }}>
                    {(ch.channel_name || '?')[0].toUpperCase()}
                  </div>
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: C.text1, letterSpacing: '-0.1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.channel_name}</p>
                  {ch.is_current && (
                    <span style={{ background: C.greenBg, color: C.green, border: `1px solid ${C.greenBdr}`, fontSize: 10, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: 100, flexShrink: 0 }}>Active</span>
                  )}
                </div>
                <p style={{ fontSize: 12, color: C.text2, marginTop: 3, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                  {fmtSubs(ch.subscribers)} subscribers · Connected {fmtDate(ch.connected_at)}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                {!ch.is_current && (
                  <button onClick={() => handleSwitch(ch.channel_id)} className="set-btn-ghost">Switch</button>
                )}
                <button onClick={() => setDisconnectTarget(ch)} className="set-btn-link">Disconnect</button>
              </div>
            </div>
          ))}
        </div>

        {/* Connect / upgrade */}
        <div style={{ marginTop: 14 }}>
          {canAddMore
            ? <a href="/auth/login" className="set-connect-tile">
                <span style={{ fontSize: 14, lineHeight: 1, fontWeight: 600, opacity: 0.85 }}>+</span>
                Connect another channel
              </a>
            : <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <p style={{ flex: 1, fontSize: 12.5, color: C.text2, lineHeight: 1.55, fontWeight: 500 }}>
                  You've reached your channel limit. Upgrade to connect more.
                </p>
                <a href="/?tab=monthly#pricing" className="set-btn-primary" style={{ textDecoration: 'none' }}>
                  Upgrade plan
                </a>
              </div>
          }
        </div>
      </div>

      {/* ── Plan and credits ──────────────────────────────────────────── */}
      <SectionHead title="Plan and credits" />
      <div className="set-card" style={{ padding: '22px 26px', marginBottom: 32 }}>
        {(() => {
          const allowance    = me?.monthly_allowance ?? 3
          const used         = me?.monthly_used ?? 0
          const remaining    = Math.max(0, allowance - used)
          const remainingPct = allowance > 0 ? (remaining / allowance) * 100 : 0
          const atLimit      = remaining === 0
          const nearLimit    = !atLimit && remainingPct <= 20
          const accent       = atLimit ? C.red : nearLimit ? C.amber : C.green
          return (
            // Two-up inside the card: AI analyses on the left (hero number +
            // bar + refill copy), pack balance on the right. Single card so
            // the page reads as a list of preference sections, not a grid.
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 28, alignItems: 'start', marginBottom: 18 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 10 }}>
                  AI analyses
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <span style={{ fontSize: 36, fontWeight: 700, color: accent, letterSpacing: '-1.4px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                    {remaining}
                  </span>
                  <span style={{ fontSize: 13.5, fontWeight: 500, color: C.text2 }}>
                    of {allowance} left
                  </span>
                </div>
                <RemainingBar remainingPct={remainingPct} accent={accent} />
                <p style={{ fontSize: 12, color: C.text3, marginTop: 8, fontWeight: 500 }}>
                  {refillLabel(me?.reset_date, me?.is_lifetime)}
                </p>
              </div>
              <div style={{ paddingLeft: 28, borderLeft: `1px solid ${C.border}` }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 10 }}>
                  Credit pack balance
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <span style={{
                    fontSize: 36, fontWeight: 700, color: (me?.pack_balance ?? 0) > 0 ? C.green : C.text1,
                    fontVariantNumeric: 'tabular-nums', letterSpacing: '-1.4px', lineHeight: 1,
                  }}>
                    {me?.pack_balance ?? 0}
                  </span>
                  <span style={{ fontSize: 13.5, fontWeight: 500, color: C.text2 }}>credits</span>
                </div>
                <p style={{ fontSize: 12, color: C.text3, marginTop: 8, fontWeight: 500, lineHeight: 1.5 }}>
                  Never expires — used after the monthly analyses run out.
                </p>
              </div>
            </div>
          )
        })()}

        {/* Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', paddingTop: 18, borderTop: `1px solid ${C.border}` }}>
          <button onClick={() => window.location.href = '/?tab=packs#pricing'} className="set-btn-ghost">
            Top up credits
          </button>
          {!isTopPlan && (
            <button onClick={() => window.location.href = '/?tab=monthly#pricing'} className="set-btn-primary">
              Upgrade plan
            </button>
          )}
          {hasActiveSub && (
            <a href="mailto:support@ytgrowth.io?subject=Manage%20billing" className="set-btn-link" style={{ textDecoration: 'none' }}>
              Manage billing
            </a>
          )}
        </div>
      </div>

      {/* ── Email preferences ─────────────────────────────────────────── */}
      <SectionHead title="Email" />
      <div className="set-card" style={{ padding: '18px 24px', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: C.text1, letterSpacing: '-0.15px' }}>Weekly channel report</p>
            <p style={{ fontSize: 13, color: C.text2, marginTop: 4, fontWeight: 500, lineHeight: 1.55 }}>
              A summary of your channel performance sent every 7 days.
            </p>
          </div>
          <Toggle on={me?.weekly_report_enabled ?? true} onChange={handleToggleReport} />
        </div>
        {!(me?.weekly_report_enabled ?? true) && (
          <p style={{ fontSize: 12, color: C.text3, marginTop: 12, fontWeight: 500 }}>You can resubscribe anytime.</p>
        )}
      </div>

      {/* ── Feature requests ─────────────────────────────────────────── */}
      <div id="feedback-section">
        <SectionHead title="Feature requests">
          <button onClick={copyShareLink} className="set-btn-link"
            style={{ color: frShareCopied ? C.green : C.text2, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {frShareCopied ? (
              <>
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1.5,5.5 4.5,8.5 9.5,2.5"/></svg>
                Link copied
              </>
            ) : (
              <>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 7.5L7 5.5M4.5 4.5L3 6a2 2 0 0 0 2.83 2.83L7 7.5M7.5 7.5L9 6a2 2 0 0 0-2.83-2.83L5 4.5"/></svg>
                Copy share link
              </>
            )}
          </button>
        </SectionHead>
      </div>
      <div className="set-card" style={{ padding: '24px 26px', marginBottom: 32 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: C.text1, letterSpacing: '-0.15px', marginBottom: 4 }}>Tell us what to build next</p>
        <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.6, fontWeight: 500, marginBottom: 18 }}>
          We read every request. Be specific: what's missing, who it's for, why it matters.
        </p>

        {/* Title */}
        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.text3, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 6 }}>
          Title
        </label>
        <input
          type="text"
          value={frTitle}
          onChange={e => setFrTitle(e.target.value.slice(0, FR_TITLE_MAX))}
          placeholder="e.g. Bulk-edit video tags"
          className="set-input"
        />

        {/* Description */}
        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.text3, letterSpacing: '0.10em', textTransform: 'uppercase', margin: '16px 0 6px' }}>
          What would you like to see?
        </label>
        <textarea
          value={frDesc}
          onChange={e => setFrDesc(e.target.value.slice(0, FR_DESC_MAX))}
          rows={4}
          placeholder="Describe the feature, the problem it solves, and how you'd use it."
          className="set-textarea"
        />

        {/* Footer row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 14 }}>
          <div style={{ fontSize: 12, color: frError ? C.red : C.text3, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
            {frError
              ? frError
              : frSuccess
                ? <span style={{ color: C.green, fontWeight: 600 }}>✓ Sent — thanks for the suggestion.</span>
                : `${frDesc.length} / ${FR_DESC_MAX}`}
          </div>
          <button
            onClick={submitFeatureRequest}
            disabled={frSending || !frTitle.trim() || !frDesc.trim()}
            className="set-btn-primary"
          >{frSending ? 'Sending…' : 'Send feature request'}</button>
        </div>

        {/* Past submissions */}
        {frMine.length > 0 && (
          <div style={{ marginTop: 24, paddingTop: 18, borderTop: `1px solid ${C.border}` }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 12 }}>
              Your previous requests
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {frMine.map(r => {
                const sty = (() => {
                  if (r.status === 'shipped')  return { c: C.green, bg: C.greenBg, b: C.greenBdr, label: 'Shipped' }
                  if (r.status === 'planned')  return { c: C.amber, bg: C.amberBg, b: C.amberBdr, label: 'Planned' }
                  if (r.status === 'declined') return { c: C.text3, bg: C.chipBg,  b: C.border,   label: 'Declined' }
                  return { c: C.text2, bg: C.chipBg, b: C.border, label: 'Under review' }
                })()
                return (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', background: '#ffffff', border: `1px solid ${C.border}`, borderRadius: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: C.text1, letterSpacing: '-0.1px' }}>{r.title}</p>
                      <p style={{ fontSize: 12, color: C.text3, marginTop: 2, fontWeight: 500 }}>{fmtDate(r.created_at)}</p>
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: sty.c, background: sty.bg,
                      border: `1px solid ${sty.b}`, padding: '3px 9px', borderRadius: 100,
                      letterSpacing: '0.10em', textTransform: 'uppercase', flexShrink: 0,
                    }}>{sty.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Support ─────────────────────────────────────────────────── */}
      <SectionHead title="Support" />
      <div className="set-card" style={{ padding: '20px 24px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: C.text1, letterSpacing: '-0.15px' }}>Contact support</p>
          <p style={{ fontSize: 13, color: C.text2, marginTop: 5, lineHeight: 1.6, fontWeight: 500 }}>
            Failed run, billing question, or feature request? Email us and we'll get back to you.
          </p>
        </div>
        <a href="mailto:support@ytgrowth.io" className="set-btn-primary" style={{ textDecoration: 'none' }}>
          support@ytgrowth.io
        </a>
      </div>

      {/* ── Danger zone ─────────────────────────────────────────────── */}
      <SectionHead title="Danger zone" danger />
      <div className="set-card danger" style={{ padding: '20px 24px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: C.red, letterSpacing: '-0.15px' }}>Delete account</p>
          <p style={{ fontSize: 13, color: C.text2, marginTop: 5, lineHeight: 1.6, fontWeight: 500 }}>
            This will permanently delete your account, all channel data, analyses, and reports. This cannot be undone.
          </p>
        </div>
        <button onClick={() => setShowDeleteDialog(true)} className="set-btn-ghost danger">
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
