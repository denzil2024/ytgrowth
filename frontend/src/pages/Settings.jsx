import { useEffect, useState } from 'react'

/* ── Design tokens — strict palette matching Dashboard/Keywords/Competitors */
const C = {
  red:     '#e5251b', redBg:   '#fff5f5', redBdr:   '#fecaca',
  green:   '#16a34a', greenBg: '#f0fdf4', greenBdr: '#bbf7d0',
  amber:   '#d97706', amberBg: '#fffbeb', amberBdr: '#fde68a',
  text1:   '#111114',
  text2:   '#52525b',
  text3:   '#9595a4',
  text4:   '#c0c0cc',
  border:  'rgba(0,0,0,0.09)',
  borderHex: '#e6e6ec',
  chipBg:  '#f4f4f6',
}

/* System elevation — matches Dashboard / Keywords / Competitors */
const CARD = {
  background:   '#ffffff',
  border:       `1px solid ${C.borderHex}`,
  borderRadius: 16,
  boxShadow:    '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)',
}

/* Page-scoped Inter + font smoothing. Matches the pattern used by
   Dashboard / Keywords / Competitors / Outliers — never loaded globally. */
function useSettingsStyles() {
  useEffect(() => {
    if (document.getElementById('ytg-settings-fonts')) return
    const link = document.createElement('link')
    link.id = 'ytg-settings-fonts'
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'
    document.head.appendChild(link)
    if (document.getElementById('ytg-settings-styles')) return
    const style = document.createElement('style')
    style.id = 'ytg-settings-styles'
    style.textContent = `
      .settings-page, .settings-page * { font-family: 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
      .settings-page p, .settings-page span, .settings-page div, .settings-page h1 { margin: 0; }
      @keyframes settingsSpin { to { transform: rotate(360deg) } }
    `
    document.head.appendChild(style)
  }, [])
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */
/* Plan badge — mapped to strict red/amber/green + neutral palette.
   Tier hierarchy: Free=neutral → Solo=amber → Growth=green → Agency=red. */
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

/* ── Small components ─────────────────────────────────────────────────────── */
function SectionHeading({ children, danger }) {
  return (
    <p style={{
      fontSize: 12, fontWeight: 700, letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: danger ? C.red : '#a0a0b0',
      marginBottom: 10,
    }}>{children}</p>
  )
}

function ProgressBar({ pct }) {
  const color = pct < 60 ? C.green : pct < 80 ? C.amber : C.red
  return (
    <div style={{ height: 4, background: '#eeeef3', borderRadius: 99, overflow: 'hidden', margin: '6px 0' }}>
      <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)' }} />
    </div>
  )
}

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
        background: '#fff', borderRadius: 16,
        padding: '26px 28px', maxWidth: 400, width: '90%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        border: '1px solid rgba(0,0,0,0.08)',
      }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: C.text1, marginBottom: 8 }}>{title}</p>
        <p style={{ fontSize: 14, color: C.text2, lineHeight: 1.65, marginBottom: requireTyping ? 16 : 22 }}>{body}</p>
        {requireTyping && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 12, color: C.text3, marginBottom: 6 }}>Type DELETE to confirm</p>
            <input
              autoFocus
              value={typed}
              onChange={e => setTyped(e.target.value)}
              placeholder="DELETE"
              style={{
                width: '100%', padding: '9px 14px',
                border: `1px solid ${typed === 'DELETE' ? C.red : C.border}`,
                borderRadius: 100, fontSize: 14, fontFamily: 'inherit',
                outline: 'none', letterSpacing: '0.05em',
              }}
            />
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ padding: '8px 18px', borderRadius: 100, border: `1px solid ${C.border}`, background: '#fff', color: C.text2, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!canConfirm}
            style={{
              padding: '8px 18px', borderRadius: 100, border: 'none',
              background: canConfirm ? C.red : '#e5e7eb',
              color: canConfirm ? '#fff' : C.text3,
              fontSize: 13, fontWeight: 700, cursor: canConfirm ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit',
            }}
          >{confirmLabel || 'Confirm'}</button>
        </div>
      </div>
    </div>
  )
}

/* ── Main component ───────────────────────────────────────────────────────── */
export default function Settings() {
  useSettingsStyles()
  const [me, setMe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [disconnectTarget, setDisconnectTarget] = useState(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [toggleWorking, setToggleWorking] = useState(false)

  function loadMe() {
    fetch('/auth/me', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { setMe(d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { loadMe() }, [])

  function handleSwitch(channelId) {
    fetch('/channels/switch', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel_id: channelId }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) window.location.reload()
        else if (d.needs_auth) window.location.href = '/auth/login'
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
      <div className="settings-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ width: 28, height: 28, border: '2.5px solid #e5e7eb', borderTop: `2.5px solid ${C.red}`, borderRadius: '50%', animation: 'settingsSpin 0.7s linear infinite' }} />
      </div>
    )
  }

  const activeChannels = me?.channels || []
  const canAddMore = me?.can_add_more ?? false
  const usagePct = me?.usage_pct ?? 0
  const isTopPlan = me?.plan === 'agency' || me?.plan === 'lifetime_agency'
  const hasActiveSub = me?.status === 'active' && !me?.is_lifetime

  return (
    <div className="settings-page">
      {/* ── Page heading ──────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text1, letterSpacing: '-0.6px', marginBottom: 4 }}>Settings</h1>
        <p style={{ fontSize: 13, color: C.text3, lineHeight: 1.5 }}>Account · plan · channels · preferences</p>
      </div>

      {/* ── Row 1: Account — full width ───────────────────────────────────── */}
      <div style={{ marginBottom: 10 }}>
        <SectionHeading>Account</SectionHeading>
      </div>
      <div style={{ ...CARD, padding: '20px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
        {me?.profile_picture
          ? <img src={me.profile_picture} alt="" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `1px solid ${C.border}` }} />
          : <div style={{ width: 52, height: 52, borderRadius: '50%', background: C.chipBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: C.text1, flexShrink: 0, border: `1px solid ${C.border}` }}>
              {(me?.display_name || me?.email || '?')[0].toUpperCase()}
            </div>
        }
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: C.text1, letterSpacing: '-0.3px' }}>{me?.display_name || 'Account'}</p>
          <p style={{ fontSize: 14, color: C.text2, marginTop: 3 }}>{me?.email || ''}</p>
          {me?.member_since && (
            <p style={{ fontSize: 12, color: C.text3, marginTop: 3 }}>Member since {fmtMonthYear(me.member_since)}</p>
          )}
        </div>
        {/* Plan badge on the right of account card */}
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          <span style={{
            ...planBadgeStyle(me?.plan),
            fontSize: 11, fontWeight: 700,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            padding: '4px 12px', borderRadius: 100,
            display: 'inline-block',
          }}>{planLabel(me?.plan)}</span>
          <p style={{ fontSize: 12, color: C.text3, marginTop: 6 }}>{billingCycleLabel(me)}</p>
        </div>
      </div>

      {/* ── Row 2: two columns ────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* ── LEFT: Connected Channels ──────────────────────────────────── */}
        <div>
          <SectionHeading>Connected Channels</SectionHeading>
          <div style={{ ...CARD, padding: '20px 22px' }}>
            <p style={{ fontSize: 12, color: C.text3, marginBottom: 16 }}>
              {activeChannels.length} of {me?.channels_allowed ?? 1} channels connected
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activeChannels.map(ch => (
                <div key={ch.channel_id} style={{
                  background: '#f7f7fa',
                  border: '1px solid rgba(0,0,0,0.07)',
                  borderRadius: 12, padding: '12px 14px',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  {ch.channel_thumbnail
                    ? <img src={ch.channel_thumbnail} alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `1px solid ${C.border}` }} />
                    : <div style={{ width: 34, height: 34, borderRadius: '50%', background: C.chipBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: C.text1, flexShrink: 0, border: `1px solid ${C.border}` }}>
                        {(ch.channel_name || '?')[0].toUpperCase()}
                      </div>
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: C.text1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.channel_name}</p>
                      {ch.is_current && (
                        <span style={{ background: C.greenBg, color: C.green, border: `1px solid ${C.greenBdr}`, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: 100, flexShrink: 0 }}>Active</span>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: C.text2, marginTop: 2 }}>{fmtSubs(ch.subscribers)} subscribers</p>
                    <p style={{ fontSize: 12, color: C.text3, marginTop: 2 }}>Connected {fmtDate(ch.connected_at)}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {!ch.is_current && (
                      <button
                        onClick={() => handleSwitch(ch.channel_id)}
                        style={{
                          fontSize: 12, fontWeight: 600, cursor: 'pointer',
                          border: `1px solid ${C.border}`, background: '#fff',
                          color: C.text2, borderRadius: 100, padding: '6px 14px',
                          fontFamily: 'inherit',
                        }}
                      >Switch</button>
                    )}
                    <button
                      onClick={() => setDisconnectTarget(ch)}
                      style={{ fontSize: 12, fontWeight: 600, cursor: 'pointer', background: 'transparent', border: 'none', color: C.red, fontFamily: 'inherit', padding: '6px 4px' }}
                    >Disconnect</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Connect / upgrade */}
            <div style={{ marginTop: 14 }}>
              {canAddMore
                ? <a href="/auth/login" style={{
                    display: 'block', textAlign: 'center',
                    border: `1px dashed ${C.border}`, borderRadius: 12,
                    padding: '13px 16px', textDecoration: 'none',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}>
                    <span style={{ fontSize: 13, color: C.red, fontWeight: 700 }}>+ Connect another channel</span>
                  </a>
                : <div style={{ background: '#f7f7fa', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 12, padding: '13px 16px' }}>
                    <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.55, marginBottom: 10 }}>
                      You have reached your channel limit. Upgrade your plan to connect more channels.
                    </p>
                    <a href="/?tab=monthly#pricing" style={{ display: 'inline-block', background: C.red, color: '#fff', fontSize: 12, fontWeight: 700, padding: '7px 16px', borderRadius: 100, textDecoration: 'none' }}>
                      Upgrade Plan
                    </a>
                  </div>
              }
            </div>
          </div>
        </div>

        {/* ── RIGHT: Plan & Credits + Email Prefs ───────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Plan and Credits */}
          <div>
            <SectionHeading>Plan and Credits</SectionHeading>
            <div style={{ ...CARD, padding: '20px 22px' }}>
              {/* Credits inner block */}
              <div style={{ background: '#f7f7fa', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
                {/* Monthly analyses */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 14, color: C.text1, fontWeight: 500 }}>Monthly analyses</span>
                    <span style={{ fontSize: 14, color: C.text2 }}>{me?.monthly_used ?? 0} / {me?.monthly_allowance ?? 3} used</span>
                  </div>
                  <ProgressBar pct={usagePct} />
                  <p style={{ fontSize: 12, color: C.text3 }}>
                    {me?.is_lifetime
                      ? 'Lifetime plan — monthly reset'
                      : me?.reset_date ? `Resets ${fmtDate(me.reset_date)}` : ''
                    }
                  </p>
                </div>

                {/* Pack balance */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 14, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  <div>
                    <p style={{ fontSize: 14, color: C.text1, fontWeight: 500 }}>Credit pack balance</p>
                    <p style={{ fontSize: 12, color: C.text3, marginTop: 3, lineHeight: 1.5 }}>Never expires — used after monthly analyses run out</p>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.text1 }}>{me?.pack_balance ?? 0}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={() => window.location.href = '/?tab=packs#pricing'}
                  style={{ fontSize: 12, fontWeight: 700, cursor: 'pointer', border: `1px solid ${C.border}`, background: '#fff', color: C.text1, borderRadius: 100, padding: '7px 16px', fontFamily: 'inherit' }}
                >Top up credits</button>
                {!isTopPlan && (
                  <button
                    onClick={() => window.location.href = '/?tab=monthly#pricing'}
                    style={{ fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none', background: C.red, color: '#fff', borderRadius: 100, padding: '7px 16px', fontFamily: 'inherit' }}
                  >Upgrade plan</button>
                )}
                {hasActiveSub && (
                  <a
                    href="mailto:support@ytgrowth.io?subject=Manage%20billing"
                    style={{ fontSize: 12, fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', color: C.text2, padding: '7px 4px', fontFamily: 'inherit', textDecoration: 'underline' }}
                  >Manage billing</a>
                )}
              </div>
            </div>
          </div>

          {/* Email Preferences */}
          <div>
            <SectionHeading>Email Preferences</SectionHeading>
            <div style={{ ...CARD, padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: C.text1 }}>Weekly channel report</p>
                  <p style={{ fontSize: 12, color: C.text2, marginTop: 4, lineHeight: 1.55 }}>
                    A summary of your channel performance sent every 7 days
                  </p>
                </div>
                <Toggle on={me?.weekly_report_enabled ?? true} onChange={handleToggleReport} />
              </div>
              {!(me?.weekly_report_enabled ?? true) && (
                <p style={{ fontSize: 12, color: C.text3, marginTop: 12 }}>You can resubscribe anytime</p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── Row 3: Danger Zone — full width ───────────────────────────────── */}
      <div style={{ marginBottom: 10 }}>
        <SectionHeading danger>Danger Zone</SectionHeading>
      </div>
      <div style={{
        ...CARD,
        border: `1px solid ${C.redBdr}`,
        background: C.redBg,
        padding: '20px 24px',
        display: 'flex', alignItems: 'center', gap: 20,
      }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.red }}>Delete account</p>
          <p style={{ fontSize: 13, color: C.text2, marginTop: 5, lineHeight: 1.6 }}>
            This will permanently delete your account, all channel data, analyses, and reports. This cannot be undone.
          </p>
        </div>
        <button
          onClick={() => setShowDeleteDialog(true)}
          style={{
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
            background: '#fff', border: `1px solid ${C.redBdr}`,
            color: C.red, borderRadius: 100, padding: '7px 16px',
            fontFamily: 'inherit', flexShrink: 0,
          }}
        >Delete account</button>
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
