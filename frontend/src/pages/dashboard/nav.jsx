/* ─── Sidebar nav + What’s-new card + channel switcher ───────────────────
   The dark app shell. SHELL palette only here; pages stay on the light C
   palette. NAV_ICONS holds the lucide icons used in the primary verb row;
   NavBtn / NavSubBtn / NavGroup are the button shells; ChatNav reuses the
   grammar for the in-app chat history; WhatsNewCard and ChannelSwitcher
   are the two raised surfaces docked at the bottom of the rail. */
import { useState, useEffect, useRef } from 'react'
import {
  LayoutDashboard, Sparkles, Telescope, MessageCircle,
  Settings as SettingsIcon, ShieldCheck,
  X as XIcon, ArrowRight,
} from 'lucide-react'
import {
  C, SHELL,
  ICON_SIZE, ICON_STROKE,
  NAV_ICON_COL, NAV_GUTTER, NAV_PAD_X, SUB_INDENT,
} from './tokens'
import { sev, scoreColor, scoreLabel } from './utils'

export const NAV_ICONS = {
  Feed:     <LayoutDashboard size={ICON_SIZE} strokeWidth={ICON_STROKE} />,
  Optimize: <Sparkles        size={ICON_SIZE} strokeWidth={ICON_STROKE} />,
  Research: <Telescope       size={ICON_SIZE} strokeWidth={ICON_STROKE} />,
  Chat:     <MessageCircle   size={ICON_SIZE} strokeWidth={ICON_STROKE} />,
  Settings: <SettingsIcon    size={ICON_SIZE} strokeWidth={ICON_STROKE} />,
  Admin:    <ShieldCheck     size={ICON_SIZE} strokeWidth={ICON_STROKE} />,
}

// Primary verb button.
export function NavBtn({ label, active, onClick, badge, dot }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative',
        margin: `1px ${NAV_GUTTER}px`,
        width: `calc(100% - ${NAV_GUTTER * 2}px)`,
        background: active ? SHELL.activeBg : 'transparent',
        color: active ? SHELL.text1 : SHELL.text2,
        fontWeight: active ? 600 : 500,
        fontSize: 14,
        letterSpacing: '-0.01em',
        border: 'none',
        padding: `9px ${NAV_PAD_X}px`,
        borderRadius: 10,
        textAlign: 'left',
        cursor: 'pointer',
        fontFamily: "'Geist', 'Inter', system-ui, sans-serif",
        display: 'flex', alignItems: 'center', gap: 12,
        transition: 'background 0.14s ease, color 0.14s ease',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = SHELL.hoverBg; e.currentTarget.style.color = SHELL.text1 } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = SHELL.text2 } }}
    >
      {active && (
        <span aria-hidden style={{
          position: 'absolute', left: -NAV_GUTTER, top: 8, bottom: 8,
          width: 3, borderRadius: 100,
          background: C.red,
        }}/>
      )}
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: NAV_ICON_COL, height: NAV_ICON_COL, flexShrink: 0,
        color: active ? C.red : SHELL.iconIdle,
      }}>{NAV_ICONS[label]}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {typeof badge === 'string' && badge && (
        <span style={{
          background: 'rgba(229,37,27,0.10)', color: '#fb6a60',
          fontSize: 9.5, fontWeight: 700, padding: '2px 7px',
          borderRadius: 20, letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>{badge}</span>
      )}
      {typeof badge === 'number' && badge > 0 && (
        <span style={{
          background: 'rgba(229,37,27,0.10)', color: '#fb6a60',
          fontSize: 10.5, fontWeight: 700, padding: '1px 7px',
          borderRadius: 20, minWidth: 18, textAlign: 'center',
          letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums',
          lineHeight: 1.45,
        }}>{badge}</span>
      )}
      {dot && (typeof badge === 'undefined' || badge === null || badge === '' || badge === 0) && (
        <span aria-label="new" style={{
          width: 7, height: 7, borderRadius: '50%',
          background: C.red,
          boxShadow: `0 0 0 3px rgba(229,37,27,0.16)`,
          flexShrink: 0,
        }}/>
      )}
    </button>
  )
}

// Sub-item button. No icon. Indented under the parent verb, aligned to
// the icon column so the visual gutter is consistent.
export function NavSubBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative',
        margin: `1px ${NAV_GUTTER}px 1px ${NAV_GUTTER + SUB_INDENT}px`,
        width: `calc(100% - ${NAV_GUTTER * 2 + SUB_INDENT}px)`,
        background: 'transparent',
        color: active ? SHELL.text1 : SHELL.text2,
        fontWeight: active ? 600 : 450,
        fontSize: 13.5,
        letterSpacing: '-0.01em',
        border: 'none',
        padding: '7px 10px 7px 12px',
        borderRadius: 8,
        textAlign: 'left',
        cursor: 'pointer',
        fontFamily: "'Geist', 'Inter', system-ui, sans-serif",
        display: 'flex', alignItems: 'center', gap: 10,
        transition: 'background 0.14s ease, color 0.14s ease',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = SHELL.hoverBg; e.currentTarget.style.color = SHELL.text1 } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = SHELL.text2 } }}
    >
      <span style={{
        width: 5, height: 5, borderRadius: '50%',
        background: active ? C.red : SHELL.iconIdle,
        flexShrink: 0,
        boxShadow: active ? `0 0 0 3px rgba(229,37,27,0.10)` : 'none',
        transition: 'background 0.14s ease, box-shadow 0.14s ease',
      }}/>
      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
    </button>
  )
}

// Expandable verb group (Optimize / Research). Click parent toggles open.
// Open state persists in localStorage. Auto-opens when a child becomes
// active so the user is never lost.
export function NavGroup({ label, children, anyChildActive, defaultOpen = true, badge, dot }) {
  const storageKey = `ytg_nav_group_open:${label}`
  const [open, setOpen] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw === '0') return false
      if (raw === '1') return true
    } catch {}
    return defaultOpen
  })
  useEffect(() => {
    if (anyChildActive && !open) setOpen(true)
  }, [anyChildActive])  // eslint-disable-line react-hooks/exhaustive-deps
  function toggle() {
    setOpen(o => {
      const next = !o
      try { localStorage.setItem(storageKey, next ? '1' : '0') } catch {}
      return next
    })
  }
  return (
    <>
      <button
        onClick={toggle}
        style={{
          position: 'relative',
          margin: `1px ${NAV_GUTTER}px`,
          width: `calc(100% - ${NAV_GUTTER * 2}px)`,
          background: 'transparent',
          color: anyChildActive ? SHELL.text1 : SHELL.text2,
          fontWeight: anyChildActive ? 600 : 500,
          fontSize: 14,
          letterSpacing: '-0.01em',
          border: 'none',
          padding: `9px ${NAV_PAD_X}px`,
          borderRadius: 10,
          textAlign: 'left',
          cursor: 'pointer',
          fontFamily: "'Geist', 'Inter', system-ui, sans-serif",
          display: 'flex', alignItems: 'center', gap: 12,
          transition: 'background 0.14s ease, color 0.14s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = SHELL.hoverBg; e.currentTarget.style.color = SHELL.text1 }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = anyChildActive ? SHELL.text1 : SHELL.text2 }}
      >
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: NAV_ICON_COL, height: NAV_ICON_COL, flexShrink: 0,
          color: anyChildActive ? C.red : SHELL.iconIdle,
        }}>{NAV_ICONS[label]}</span>
        <span style={{ flex: 1 }}>{label}</span>
        {typeof badge === 'number' && badge > 0 && (
          <span style={{
            background: 'rgba(229,37,27,0.10)', color: '#fb6a60',
            fontSize: 10.5, fontWeight: 700, padding: '1px 7px',
            borderRadius: 20, minWidth: 18, textAlign: 'center',
            letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums',
            lineHeight: 1.45,
          }}>{badge}</span>
        )}
        {dot && (typeof badge === 'undefined' || badge === null || badge === 0) && (
          <span aria-label="new" style={{
            width: 7, height: 7, borderRadius: '50%',
            background: C.red,
            boxShadow: `0 0 0 3px rgba(229,37,27,0.16)`,
            flexShrink: 0,
          }}/>
        )}
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
          style={{
            color: SHELL.iconIdle,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div style={{ position: 'relative', paddingTop: 2, paddingBottom: 4 }}>
          {/* Vertical guideline that visually groups the children, aligned
              to the icon column. */}
          <span aria-hidden style={{
            position: 'absolute',
            left: NAV_GUTTER + NAV_PAD_X + (NAV_ICON_COL / 2),
            top: 4, bottom: 6,
            width: 1, background: SHELL.hair,
          }}/>
          {children}
        </div>
      )}
    </>
  )
}

/* ─── Chat nav. Mirrors the verb-group grammar (same gutters, type,
       hover, active red) but: clicking the row opens a NEW chat and
       navigates to the Chat page; the caret alone toggles the list;
       children are real conversations only, each with the message
       icon. The dedicated "New chat" action lives on the Chat page. */
export function ChatNav({ nav, recent, activeId, onNew, onOpen }) {
  const active = nav === 'Chat'
  const storageKey = 'ytg_nav_group_open:Chat'
  const [open, setOpen] = useState(() => {
    try { const raw = localStorage.getItem(storageKey); if (raw === '0') return false; if (raw === '1') return true } catch {}
    return false
  })
  useEffect(() => { if (active && !open) setOpen(true) }, [active])  // eslint-disable-line react-hooks/exhaustive-deps
  function toggle(e) {
    e.stopPropagation()
    setOpen(o => { const n = !o; try { localStorage.setItem(storageKey, n ? '1' : '0') } catch {} ; return n })
  }
  return (
    <>
      <div
        style={{
          position: 'relative',
          margin: `1px ${NAV_GUTTER}px`,
          width: `calc(100% - ${NAV_GUTTER * 2}px)`,
          display: 'flex', alignItems: 'center',
          borderRadius: 10,
          background: active ? SHELL.activeBg : 'transparent',
          transition: 'background 0.14s ease',
        }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = SHELL.hoverBg }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
      >
        {active && (
          <span aria-hidden style={{ position: 'absolute', left: -NAV_GUTTER, top: 8, bottom: 8, width: 3, borderRadius: 100, background: C.red }}/>
        )}
        <button
          onClick={onNew}
          title="New chat"
          style={{
            flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 12,
            background: 'transparent', border: 'none', cursor: 'pointer',
            padding: `9px 4px 9px ${NAV_PAD_X}px`,
            color: active ? SHELL.text1 : SHELL.text2,
            fontWeight: active ? 600 : 500, fontSize: 14, letterSpacing: '-0.01em',
            fontFamily: "'Geist', 'Inter', system-ui, sans-serif", textAlign: 'left',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: NAV_ICON_COL, height: NAV_ICON_COL, flexShrink: 0, color: active ? C.red : SHELL.iconIdle }}>{NAV_ICONS['Chat']}</span>
          <span style={{ flex: 1 }}>Chat</span>
        </button>
        <button
          onClick={toggle}
          aria-label={open ? 'Collapse chats' : 'Expand chats'}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', border: 'none', cursor: 'pointer',
            padding: `9px ${NAV_PAD_X}px 9px 6px`, color: SHELL.iconIdle,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      </div>
      {open && (
        <div style={{ position: 'relative', paddingTop: 2, paddingBottom: 4 }}>
          <span aria-hidden style={{ position: 'absolute', left: NAV_GUTTER + NAV_PAD_X + (NAV_ICON_COL / 2), top: 4, bottom: 6, width: 1, background: SHELL.hair }}/>
          {recent.length === 0 ? (
            <p style={{ margin: `2px ${NAV_GUTTER}px 4px ${NAV_GUTTER + SUB_INDENT}px`, padding: '6px 10px', fontSize: 12.5, color: SHELL.text3, fontFamily: "'Geist', 'Inter', system-ui, sans-serif" }}>No chats yet</p>
          ) : recent.map(c => {
            const on = nav === 'Chat' && c.id === activeId
            return (
              <button
                key={c.id}
                onClick={() => onOpen(c.id)}
                style={{
                  position: 'relative',
                  margin: `1px ${NAV_GUTTER}px 1px ${NAV_GUTTER + SUB_INDENT}px`,
                  width: `calc(100% - ${NAV_GUTTER * 2 + SUB_INDENT}px)`,
                  background: on ? SHELL.activeBg : 'transparent',
                  color: on ? SHELL.text1 : SHELL.text2,
                  fontWeight: on ? 600 : 450, fontSize: 13.5, letterSpacing: '-0.01em',
                  border: 'none', padding: '7px 10px', borderRadius: 8,
                  textAlign: 'left', cursor: 'pointer',
                  fontFamily: "'Geist', 'Inter', system-ui, sans-serif",
                  display: 'flex', alignItems: 'center', gap: 9,
                  transition: 'background 0.14s ease, color 0.14s ease',
                }}
                onMouseEnter={e => { if (!on) { e.currentTarget.style.background = SHELL.hoverBg; e.currentTarget.style.color = SHELL.text1 } }}
                onMouseLeave={e => { if (!on) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = SHELL.text2 } }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, flexShrink: 0, color: on ? C.red : SHELL.iconIdle }}>
                  <MessageCircle size={14} strokeWidth={1.9} />
                </span>
                <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title || 'Untitled chat'}</span>
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}

/* ─── What's new promo card ─────────────────────────────────────────────────
   Sells features the user hasn't dismissed, one card at a time. This is the
   in-product feature-discovery surface — same role VidIQ's "vidIQ for
   Instagram" launch card plays in their sidebar. Rotates among undismissed
   features; when all are dismissed, nothing renders.
*/
export const WHATS_NEW = [
  {
    id: 'niche-outlier-interactive',
    headline: 'Your niche outlier card is now interactive',
    body: 'Switch between Videos, Thumbnails, and Breakout Channels from one card.',
    cta: 'See it on Feed',
    target: 'Overview',
  },
  {
    id: 'tracked-optimizations',
    headline: 'We measure whether your changes worked',
    body: 'Edit a title or thumbnail. We track the views delta and show the lift.',
    cta: 'Open My Videos',
    target: 'Videos',
  },
  {
    id: 'thumbnail-score',
    headline: 'Score your thumbnail before you ship',
    body: 'Drop in your design, get a score against winning thumbnails in your niche.',
    cta: 'Try Thumbnail Score',
    target: 'Thumbnail Score',
  },
  {
    id: 'video-review',
    headline: 'See where viewers drop off',
    body: 'Per-video retention curve + the exact second you lost the room.',
    cta: 'Open Video Review',
    target: 'Autopsy',
  },
]

export function WhatsNewCard({ channelId, onNavigate }) {
  const storageKey = `ytg_whatsnew_dismissed:${channelId || 'unknown'}`
  const [dismissed, setDismissedState] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (!raw) return {}
      const parsed = JSON.parse(raw)
      return parsed && typeof parsed === 'object' ? parsed : {}
    } catch { return {} }
  })

  // Pick the first feature this user hasn't dismissed. Static order so a
  // refresh doesn't surprise the user with a different card mid-session.
  const feature = WHATS_NEW.find(f => !dismissed[f.id])
  if (!feature) return null

  function dismiss() {
    const next = { ...dismissed, [feature.id]: Date.now() }
    setDismissedState(next)
    try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch {}
  }

  function activate() {
    onNavigate?.(feature.target)
    dismiss()
  }

  return (
    <div style={{
      position: 'relative',
      background: SHELL.cardBg,
      border: `1px solid ${SHELL.hair}`,
      borderRadius: 11,
      padding: '13px 14px 14px 14px',
      boxShadow: SHELL.cardShadow,
      fontFamily: "'Geist', 'Inter', system-ui, sans-serif",
    }}>
      {/* Dismiss × */}
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          position: 'absolute', top: 8, right: 8,
          width: 22, height: 22, borderRadius: 6,
          border: 'none', background: 'transparent',
          color: SHELL.text3,
          cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.14s ease, color 0.14s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = SHELL.hoverBg; e.currentTarget.style.color = SHELL.text1 }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = SHELL.text3 }}
      >
        <XIcon size={12} strokeWidth={2} />
      </button>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
        {/* Sparkle icon in a brand-tinted circle */}
        <span style={{
          flexShrink: 0,
          width: 28, height: 28, borderRadius: 8,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(229,37,27,0.08)',
          color: '#fb6a60',
          marginTop: 1,
        }}>
          <Sparkles size={15} strokeWidth={2} />
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{
            fontSize: 9.5, fontWeight: 600, color: '#fb6a60',
            letterSpacing: '0.11em', textTransform: 'uppercase',
            marginBottom: 5,
          }}>
            What's new
          </p>
          <p style={{
            fontSize: 13.5, fontWeight: 600, color: SHELL.text1,
            letterSpacing: '-0.012em', lineHeight: 1.35,
            paddingRight: 22,  // clear the dismiss x
            marginBottom: 5,
          }}>
            {feature.headline}
          </p>
          <p style={{
            fontSize: 12.5, fontWeight: 450, color: SHELL.text2,
            letterSpacing: '-0.01em', lineHeight: 1.55,
            marginBottom: 10,
          }}>
            {feature.body}
          </p>
          <button
            type="button"
            onClick={activate}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: 0, border: 'none', background: 'transparent',
              cursor: 'pointer',
              color: '#fb6a60',
              fontSize: 13, fontWeight: 600,
              letterSpacing: '-0.01em',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ff5a4f' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#e5251b' }}
          >
            {feature.cta}
            <ArrowRight size={13} strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Channel switcher dropdown ─────────────────────────────────────────── */
export function ChannelSwitcher({ channels, channelsAllowed, canAddMore, currentChannelId }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const current = channels.find(c => c.is_current) || channels[0]

  function scoreColor(s) { return s >= 75 ? '#16a34a' : s >= 50 ? '#d97706' : '#e5251b' }

  function doSwitch(channelId) {
    setOpen(false)
    fetch('/channels/switch', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel_id: channelId }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) window.location.reload()
        else if (d.needs_auth) window.location.href = loginUrl()
      })
  }

  function fmtSubs(n) {
    if (!n) return '0'
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
    return n.toLocaleString()
  }

  if (!current) return null

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          cursor: 'pointer', userSelect: 'none',
        }}
      >
        {current.channel_thumbnail
          ? <img src={current.channel_thumbnail} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `1.5px solid ${SHELL.hair}` }} />
          : <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(251,106,96,0.13)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: '#fb6a60', flexShrink: 0 }}>{(current.channel_name || '?')[0].toUpperCase()}</div>
        }
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: SHELL.text1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.2px' }}>{current.channel_name}</p>
          <p style={{ fontSize: 12, color: SHELL.text2, marginTop: 2 }}>{fmtSubs(current.subscribers)} subscribers</p>
        </div>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={SHELL.iconIdle} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <polyline points="2,4 6,8 10,4" />
        </svg>
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
          background: SHELL.cardBg,
          border: `0.5px solid ${SHELL.hair}`,
          borderRadius: 12,
          boxShadow: SHELL.popShadow,
          padding: 6,
          zIndex: 100,
        }}>
          {channels.map(ch => (
            <div
              key={ch.channel_id}
              onClick={() => !ch.is_current && doSwitch(ch.channel_id)}
              style={{
                padding: '8px 10px', borderRadius: 8,
                display: 'flex', alignItems: 'center', gap: 10,
                cursor: ch.is_current ? 'default' : 'pointer',
                background: 'transparent',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (!ch.is_current) e.currentTarget.style.background = SHELL.hoverBg }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              {ch.channel_thumbnail
                ? <img src={ch.channel_thumbnail} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                : <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(251,106,96,0.13)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#fb6a60', flexShrink: 0 }}>{(ch.channel_name || '?')[0].toUpperCase()}</div>
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: SHELL.text1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.channel_name}</p>
                <p style={{ fontSize: 12, color: SHELL.text2 }}>{fmtSubs(ch.subscribers)} subscribers</p>
              </div>
              {ch.is_current
                ? <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', flexShrink: 0 }} />
                : ch.channel_score > 0
                  ? <span style={{ fontSize: 12, fontWeight: 500, color: scoreColor(ch.channel_score), background: SHELL.hoverBg, border: `0.5px solid ${SHELL.hair}`, borderRadius: 20, padding: '2px 7px', flexShrink: 0 }}>{ch.channel_score}</span>
                  : null
              }
            </div>
          ))}

          <div style={{ height: '0.5px', background: SHELL.hair, margin: '4px 4px' }} />

          {canAddMore
            ? <div
                onClick={() => { setOpen(false); window.location.href = loginUrl() }}
                style={{ padding: '8px 10px', borderRadius: 8, cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = SHELL.hoverBg }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: 14, color: '#fb6a60', fontWeight: 500 }}>+ Connect another channel</span>
              </div>
            : <div
                onClick={() => { setOpen(false); window.location.href = '/#pricing' }}
                style={{ padding: '8px 10px', borderRadius: 8, cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = SHELL.hoverBg }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: 14, color: SHELL.text2 }}>Upgrade to connect more channels</span>
              </div>
          }
        </div>
      )}
    </div>
  )
}

/* ─── First-time welcome banner ─────────────────────────────────────────── */
