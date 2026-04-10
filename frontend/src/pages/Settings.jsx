import { useEffect, useState } from 'react'

/* ── Design tokens matching the dashboard ─────────────────────────────────── */
const C = {
  red:     '#e5251b',
  redBg:   '#fef2f2',
  redBdr:  'rgba(229,37,27,0.2)',
  green:   '#16a34a',
  greenBg: '#dcfce7',
  text1:   '#111114',
  text2:   '#6b7280',
  text3:   '#9ca3af',
  border:  'rgba(0,0,0,0.09)',
  bg:      '#f4f4f6',
}

/* Matches .ytg-stat-card shadow from Dashboard */
const CARD = {
  background:   '#ffffff',
  border:       '1px solid rgba(0,0,0,0.09)',
  borderRadius: 20,
  boxShadow:    '0 1px 3px rgba(0,0,0,0.07), 0 6px 24px rgba(0,0,0,0.09)',
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function planBadgeStyle(plan) {
  const p = (plan || '').toLowerCase()
  if (p.includes('agency'))  return { background: '#faf5ff', color: '#7c3aed' }
  if (p.includes('growth'))  return { background: '#f0fdf4', color: '#16a34a' }
  if (p.includes('solo'))    return { background: '#eff6ff', color: '#1d4ed8' }
  if (p.includes('lifetime'))return { background: '#fffbeb', color: '#d97706' }
  return { background: '#f3f4f6', color: '#374151' }
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
      fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: danger ? C.red : '#a0a0b0',
      marginBottom: 10,
    }}>{children}</p>
  )
}

function ProgressBar({ pct }) {
  const color = pct < 60 ? '#16a34a' : pct < 80 ? '#d97706' : '#e5251b'
  return (
    <div style={{ height: 4, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden', margin: '6px 0' }}>
      <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.8s' }} />
    </div>
  )
}

function Toggle({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width: 44, height: 24, borderRadius: 12,
        background: on ? '#16a34a' : '#d1d5db',
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
        <p style={{ fontSize: 15, fontWeight: 600, color: C.text1, marginBottom: 8 }}>{title}</p>
        <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.65, marginBottom: requireTyping ? 16 : 22 }}>{body}</p>
        {requireTyping && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 12, color: C.text3, marginBottom: 6 }}>Type DELETE to confirm</p>
            <input
              autoFocus
              value={typed}
              onChange={e => setTyped(e.target.value)}
              placeholder="DELETE"
              style={{
                width: '100%', padding: '9px 12px',
                border: `1px solid ${typed === 'DELETE' ? C.red : C.border}`,
                borderRadius: 8, fontSize: 13, fontFamily: 'inherit',
                outline: 'none', letterSpacing: '0.05em',
              }}
            />
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ padding: '8px 18px', borderRadius: 8, border: `1px solid ${C.border}`, background: '#fff', color: C.text2, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!canConfirm}
            style={{
              padding: '8px 18px', borderRadius: 8, border: 'none',
              background: canConfirm ? C.red : '#e5e7eb',
              color: canConfirm ? '#fff' : '#9ca3af',
              fontSize: 13, fontWeight: 500, cursor: canConfirm ? 'pointer' : 'not-allowed',
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ width: 28, height: 28, border: '2.5px solid #e5e7eb', borderTop: '2.5px solid #e5251b', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      </div>
    )
  }

  const activeChannels = me?.channels || []
  const canAddMore = me?.can_add_more ?? false
  const usagePct = me?.usage_pct ?? 0
  const isTopPlan = me?.plan === 'agency' || me?.plan === 'lifetime_agency'
  const hasActiveSub = me?.status === 'active' && !me?.is_lifetime

  return (
    <>
      {/* ── Page heading ──────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0a0a0f', letterSpacing: '-0.7px', marginBottom: 5 }}>Settings</h1>
      </div>

      {/* ── Row 1: Account — full width ───────────────────────────────────── */}
      <div style={{ marginBottom: 10 }}>
        <SectionHeading>Account</SectionHeading>
      </div>
      <div style={{ ...CARD, padding: '20px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
        {me?.profile_picture
          ? <img src={me.profile_picture} alt="" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1.5px solid rgba(0,0,0,0.09)' }} />
          : <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: C.red, flexShrink: 0 }}>
              {(me?.display_name || me?.email || '?')[0].toUpperCase()}
            </div>
        }
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: C.text1, letterSpacing: '-0.3px' }}>{me?.display_name || 'Account'}</p>
          <p style={{ fontSize: 13, color: C.text2, marginTop: 3 }}>{me?.email || ''}</p>
          {me?.member_since && (
            <p style={{ fontSize: 12, color: C.text3, marginTop: 3 }}>Member since {fmtMonthYear(me.member_since)}</p>
          )}
        </div>
        {/* Plan badge on the right of account card */}
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          <span style={{
            ...planBadgeStyle(me?.plan),
            fontSize: 12, fontWeight: 600,
            padding: '5px 14px', borderRadius: 20,
            display: 'inline-block',
          }}>{planLabel(me?.plan)}</span>
          <p style={{ fontSize: 12, color: C.text3, marginTop: 5 }}>{billingCycleLabel(me)}</p>
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
                    ? <img src={ch.channel_thumbnail} alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(0,0,0,0.08)' }} />
                    : <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: C.red, flexShrink: 0 }}>
                        {(ch.channel_name || '?')[0].toUpperCase()}
                      </div>
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: C.text1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.channel_name}</p>
                      {ch.is_current && (
                        <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 20, flexShrink: 0 }}>Active</span>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: C.text2, marginTop: 1 }}>{fmtSubs(ch.subscribers)} subscribers</p>
                    <p style={{ fontSize: 11, color: C.text3, marginTop: 1 }}>Connected {fmtDate(ch.connected_at)}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {!ch.is_current && (
                      <button
                        onClick={() => handleSwitch(ch.channel_id)}
                        style={{
                          fontSize: 12, fontWeight: 500, cursor: 'pointer',
                          border: `1px solid ${C.border}`, background: '#fff',
                          color: C.text2, borderRadius: 7, padding: '5px 11px',
                          fontFamily: 'inherit',
                        }}
                      >Switch</button>
                    )}
                    <button
                      onClick={() => setDisconnectTarget(ch)}
                      style={{ fontSize: 12, fontWeight: 500, cursor: 'pointer', background: 'transparent', border: 'none', color: C.red, fontFamily: 'inherit', padding: '5px 2px' }}
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
                    border: '1px dashed rgba(0,0,0,0.15)', borderRadius: 10,
                    padding: '13px 16px', textDecoration: 'none',
                  }}>
                    <span style={{ fontSize: 13, color: C.red, fontWeight: 500 }}>+ Connect another channel</span>
                  </a>
                : <div style={{ background: '#fef2f2', border: `0.5px solid rgba(229,37,27,0.15)`, borderRadius: 10, padding: '13px 16px' }}>
                    <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.55, marginBottom: 10 }}>
                      You have reached your channel limit. Upgrade your plan to connect more channels.
                    </p>
                    <a href="/#pricing" style={{ display: 'inline-block', background: C.red, color: '#fff', fontSize: 12, fontWeight: 500, padding: '6px 14px', borderRadius: 7, textDecoration: 'none' }}>
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
                    <span style={{ fontSize: 13, color: C.text1, fontWeight: 500 }}>Monthly analyses</span>
                    <span style={{ fontSize: 13, color: C.text2 }}>{me?.monthly_used ?? 0} / {me?.monthly_allowance ?? 5} used</span>
                  </div>
                  <ProgressBar pct={usagePct} />
                  <p style={{ fontSize: 11, color: C.text3 }}>
                    {me?.is_lifetime || me?.plan === 'free'
                      ? 'Free plan — no reset'
                      : me?.reset_date ? `Resets ${fmtDate(me.reset_date)}` : ''
                    }
                  </p>
                </div>

                {/* Pack balance */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 14, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  <div>
                    <p style={{ fontSize: 13, color: C.text1, fontWeight: 500 }}>Credit pack balance</p>
                    <p style={{ fontSize: 11, color: C.text3, marginTop: 3, lineHeight: 1.5 }}>Never expires — used after monthly analyses run out</p>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.text1 }}>{me?.pack_balance ?? 0}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={() => window.location.href = '/#pricing'}
                  style={{ fontSize: 12, fontWeight: 500, cursor: 'pointer', border: `1px solid ${C.border}`, background: '#fff', color: C.text2, borderRadius: 7, padding: '7px 14px', fontFamily: 'inherit' }}
                >Top Up Credits</button>
                {!isTopPlan && (
                  <button
                    onClick={() => window.location.href = '/#pricing'}
                    style={{ fontSize: 12, fontWeight: 500, cursor: 'pointer', border: 'none', background: C.red, color: '#fff', borderRadius: 7, padding: '7px 14px', fontFamily: 'inherit' }}
                  >Upgrade Plan</button>
                )}
                {hasActiveSub && (
                  <button
                    onClick={() => window.open('https://app.lemonsqueezy.com/my-orders', '_blank')}
                    style={{ fontSize: 12, fontWeight: 500, cursor: 'pointer', background: 'none', border: 'none', color: C.text2, padding: '7px 2px', fontFamily: 'inherit', textDecoration: 'underline' }}
                  >Manage Billing</button>
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
                <p style={{ fontSize: 11, color: C.text3, marginTop: 12 }}>You can resubscribe anytime</p>
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
        border: `1px solid rgba(229,37,27,0.2)`,
        background: '#fffafa',
        padding: '20px 24px',
        display: 'flex', alignItems: 'center', gap: 20,
      }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: C.red }}>Delete account</p>
          <p style={{ fontSize: 13, color: C.text2, marginTop: 5, lineHeight: 1.6 }}>
            This will permanently delete your account, all channel data, analyses, and reports. This cannot be undone.
          </p>
        </div>
        <button
          onClick={() => setShowDeleteDialog(true)}
          style={{
            fontSize: 12, fontWeight: 500, cursor: 'pointer',
            background: 'transparent', border: `0.5px solid ${C.red}`,
            color: C.red, borderRadius: 7, padding: '8px 16px',
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
    </>
  )
}
