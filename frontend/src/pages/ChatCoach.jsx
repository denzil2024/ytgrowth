/* ChatCoach — single-purpose chat surface for the AI Coach.

   Layout reference: VidIQ's chat empty state — vertically centered hero
   question, single big composer, pill prompts below, no chrome above.
   Light surface. The chrome is the conversation itself.

   Plumbing:
   - GET  /chat/state  on mount → hydrates messages + allowance/used.
   - POST /chat/send   sends a message, waits for the Haiku response.
   - POST /chat/new    clears the conversation server-side.
*/

import { useEffect, useRef, useState } from 'react'
import {
  Bot,              // Per-message assistant avatar
  Database,         // Source pill on assistant replies
  Send,             // Composer send button
  Plus,             // New chat icon button
  ArrowRight,       // Upgrade CTA glyph
  // Starter-prompt icons. Eight imperative prompts, two rows.
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  ImageIcon,
  Lightbulb,
  Type,
  GitCompare,
  Search,
} from 'lucide-react'

// Page-scoped Inter load. Inter Variable for body, kept consistent with the
// rest of the app. The earlier Geist experiment didn't earn its keep.
if (typeof document !== 'undefined' && !document.getElementById('ytg-chat-inter-font')) {
  const link = document.createElement('link')
  link.id = 'ytg-chat-inter-font'
  link.rel = 'stylesheet'
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'
  document.head.appendChild(link)
}

// Custom scrollbar — thin, near-invisible, no default chevrons.
if (typeof document !== 'undefined' && !document.getElementById('ytg-chat-scrollbar')) {
  const s = document.createElement('style')
  s.id = 'ytg-chat-scrollbar'
  s.textContent = `
    .ytg-chat-scroll {
      scrollbar-width: thin;
      scrollbar-color: rgba(10,10,15,0.14) transparent;
    }
    .ytg-chat-scroll::-webkit-scrollbar { width: 6px; height: 6px }
    .ytg-chat-scroll::-webkit-scrollbar-thumb {
      background: rgba(10,10,15,0.14);
      border-radius: 99px;
    }
    .ytg-chat-scroll::-webkit-scrollbar-thumb:hover {
      background: rgba(10,10,15,0.22);
    }
    .ytg-chat-scroll::-webkit-scrollbar-track,
    .ytg-chat-scroll::-webkit-scrollbar-button {
      background: transparent;
      display: none;
    }
    .ytg-chat-textarea::placeholder {
      color: rgba(10,10,15,0.38);
    }
    @keyframes ytgPulseSoft {
      0%, 100% { opacity: 0.55 }
      50%      { opacity: 1    }
    }
  `
  document.head.appendChild(s)
}

const FONT_STACK = "'Inter', system-ui, -apple-system, sans-serif"
const FONT_MONO  = "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace"

/* ─── Light palette. Two surfaces (page wash + raised cards), neutral
       text stack, brand red as the only saturated colour. Hairlines are
       pure-black alpha so they sit ON the surface (the move that pushes
       light cards from "drawn" to "physical"). ────────────────────── */
const C = {
  bg:           '#fafafb',           // page wash, marginally off-white
  surface:      '#ffffff',           // composer, pills, assistant bubble
  surfaceLift:  '#f4f4f7',           // hover state on raised elements
  hair:         'rgba(10,10,15,0.07)',
  hairActive:   'rgba(10,10,15,0.20)',
  text1:        '#0a0a0f',
  text2:        'rgba(10,10,15,0.66)',
  text3:        'rgba(10,10,15,0.42)',
  text4:        'rgba(10,10,15,0.26)',
  red:          '#e5251b',
  redHi:        '#ef3a31',
  redLo:        '#c81d14',
  redSoft:      'rgba(229,37,27,0.06)',
  redBdr:       'rgba(229,37,27,0.22)',
  // Single soft elevation + the inner white highlight on the top edge
  // (the iOS card trick). One shadow value used across every raised
  // surface so the elevation system reads coherent.
  cardShadow:     '0 1px 2px rgba(15,15,25,0.04), inset 0 1px 0 rgba(255,255,255,0.7)',
  cardShadowLift: '0 6px 24px rgba(15,15,25,0.07), inset 0 1px 0 rgba(255,255,255,0.7)',
  spring:         'cubic-bezier(0.32, 0.72, 0, 1)',
}

/* ─── Eight starter prompts. Imperative voice, two-row wrap layout,
       semantic Lucide icons. Click sends the prompt straight through
       the same pipeline as a typed message. ───────────────────────── */
const STARTER_PROMPTS = [
  { label: 'Get more views',       Icon: TrendingUp   },
  { label: 'Review my CTR',        Icon: TrendingDown },
  { label: 'Channel audit',        Icon: CheckCircle2 },
  { label: 'Thumbnail tips',       Icon: ImageIcon    },
  { label: 'Video ideas',          Icon: Lightbulb    },
  { label: 'Better titles',        Icon: Type         },
  { label: 'Compare competitor',   Icon: GitCompare   },
  { label: 'Find keywords',        Icon: Search       },
]

function fmtAge(iso) {
  if (!iso) return ''
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return ''
  const sec = Math.floor((Date.now() - t) / 1000)
  if (sec < 60) return 'just now'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  return `${Math.floor(hr / 24)}d ago`
}

/* Assistant prose. Geist 450 + tight tracking + generous line-height
   reads as editorial copy, not a chat dump. */
function AssistantBody({ text }) {
  const parts = (text || '').split(/\n{2,}/g)
  return (
    <>
      {parts.map((p, i) => (
        <p key={i} style={{
          margin: i === 0 ? 0 : '12px 0 0 0',
          fontSize: 14.5, fontWeight: 450, color: C.text1,
          letterSpacing: '-0.005em', lineHeight: 1.68,
          whiteSpace: 'pre-wrap',
        }}>{p}</p>
      ))}
    </>
  )
}


export default function ChatCoach({ onNavigate, billingPlan }) {
  const [state, setState] = useState({ loading: true, error: null })
  const [messages, setMessages] = useState([])
  const [allowance, setAllowance] = useState(0)
  const [used, setUsed] = useState(0)
  const [plan, setPlan] = useState('free')
  const [availableSources, setAvailableSources] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState(null)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  const remaining = Math.max(0, allowance - used)
  const outOfMessages = remaining === 0 && !state.loading

  // Hydrate on mount
  useEffect(() => {
    let cancelled = false
    fetch('/chat/state', { credentials: 'include' })
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(d => {
        if (cancelled) return
        setMessages(d.messages || [])
        setAllowance(d.allowance || 0)
        setUsed(d.used || 0)
        setPlan(d.plan || 'free')
        setAvailableSources(d.sources || [])
        setState({ loading: false, error: null })
      })
      .catch(() => {
        if (cancelled) return
        setState({ loading: false, error: 'Could not load your coach. Refresh the page.' })
      })
    return () => { cancelled = true }
  }, [])

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [messages, sending])

  async function send(messageText) {
    const text = (messageText ?? input).trim()
    if (!text || sending || outOfMessages) return
    setInput('')
    setSendError(null)
    setSending(true)

    const localUser = { role: 'user', content: text, created_at: new Date().toISOString() }
    setMessages(prev => [...prev, localUser])

    try {
      const r = await fetch('/chat/send', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      const d = await r.json()
      if (!r.ok) {
        setMessages(prev => prev.slice(0, -1))
        if (d.error === 'out_of_messages') {
          setSendError(`You've used all ${d.allowance} messages this month. Upgrade to keep chatting.`)
          setAllowance(d.allowance || allowance)
          setUsed(d.used || used)
        } else {
          setSendError(d.error || 'Something went wrong. Try again.')
        }
        return
      }
      setMessages(prev => [...prev, d.message])
      setAllowance(d.allowance ?? allowance)
      setUsed(d.used ?? (used + 1))
      if (d.sources) setAvailableSources(d.sources)
    } catch (e) {
      setMessages(prev => prev.slice(0, -1))
      setSendError("Couldn't reach the coach. Check your connection and try again.")
    } finally {
      setSending(false)
      setTimeout(() => inputRef.current?.focus(), 60)
    }
  }

  async function newChat() {
    if (sending) return
    if (messages.length === 0) return
    try {
      await fetch('/chat/new', { method: 'POST', credentials: 'include' })
      setMessages([])
      setSendError(null)
    } catch {}
  }

  /* ─── Composer. Shared between empty + active states. ~60px tall min,
         rounded 16, white surface, hairline border that warms to soft red
         when focused, integrated send button. The focal element on every
         layout. ─────────────────────────────────────────────────────── */
  const isOff = sending || outOfMessages || input.trim().length === 0
  const composerForm = (
    <form
      onSubmit={(e) => { e.preventDefault(); send() }}
      style={{
        display: 'flex', alignItems: 'flex-end', gap: 10,
        background: C.surface,
        border: `1px solid ${input.length > 0 || sending ? C.redBdr : C.hair}`,
        borderRadius: 16, padding: '12px 12px 12px 20px',
        boxShadow: input.length > 0 || sending
          ? `0 0 0 4px ${C.redSoft}, 0 1px 2px rgba(15,15,25,0.04), inset 0 1px 0 rgba(255,255,255,0.7)`
          : C.cardShadow,
        transition: `border-color 200ms ${C.spring}, box-shadow 200ms ${C.spring}`,
        minHeight: 60,
      }}
    >
      <textarea
        ref={inputRef}
        className="ytg-chat-textarea"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            send()
          }
        }}
        disabled={sending || outOfMessages}
        rows={1}
        placeholder={outOfMessages ? 'You have used all messages this month' : 'How can I help you grow?'}
        style={{
          flex: 1, minWidth: 0,
          border: 'none', outline: 'none',
          background: 'transparent',
          fontFamily: FONT_STACK,
          fontSize: 15, fontWeight: 450, color: C.text1,
          letterSpacing: '-0.005em', lineHeight: 1.55,
          resize: 'none',
          maxHeight: 160,
          paddingTop: 8, paddingBottom: 8,
        }}
        onInput={(e) => {
          e.target.style.height = 'auto'
          e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
        }}
      />
      <button
        type="submit"
        disabled={isOff}
        aria-label="Send"
        style={{
          flexShrink: 0,
          width: 38, height: 38, borderRadius: 11,
          border: 'none',
          background: isOff
            ? 'rgba(229,37,27,0.20)'
            : `linear-gradient(180deg, ${C.redHi} 0%, ${C.red} 100%)`,
          color: isOff ? 'rgba(255,255,255,0.85)' : '#fff',
          cursor: isOff ? 'default' : 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: isOff
            ? 'inset 0 1px 0 rgba(255,255,255,0.20)'
            : '0 1px 2px rgba(229,37,27,0.34), inset 0 1px 0 rgba(255,255,255,0.24)',
          transition: `filter 160ms ${C.spring}, transform 160ms ${C.spring}`,
        }}
        onMouseEnter={e => { if (!isOff) { e.currentTarget.style.filter = 'brightness(1.06)'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
        onMouseLeave={e => { if (!isOff) { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)' } }}
      >
        <Send size={15} strokeWidth={2} />
      </button>
    </form>
  )

  const errorBanner = sendError && (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      marginBottom: 12,
      background: C.redSoft,
      border: `1px solid ${C.redBdr}`,
      borderRadius: 12, padding: '11px 14px',
    }}>
      <p style={{
        fontSize: 12.5, color: C.red, fontWeight: 500,
        flex: 1, lineHeight: 1.5, letterSpacing: '-0.005em',
      }}>{sendError}</p>
      {outOfMessages && (
        <button
          type="button"
          onClick={() => onNavigate?.('Settings')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '7px 14px', borderRadius: 100,
            border: 'none', cursor: 'pointer',
            background: C.red, color: '#fff',
            fontFamily: 'inherit',
            fontSize: 12, fontWeight: 500, letterSpacing: '-0.01em',
            boxShadow: '0 1px 2px rgba(229,37,27,0.30), inset 0 1px 0 rgba(255,255,255,0.20)',
            flexShrink: 0,
            transition: `filter 160ms ${C.spring}`,
          }}
          onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.06)'}
          onMouseLeave={e => e.currentTarget.style.filter = 'none'}
        >
          Upgrade
          <ArrowRight size={11} strokeWidth={2.2} />
        </button>
      )}
    </div>
  )

  /* ─── Floating top-right cluster. Quota meter is ALWAYS visible when
         the user has an allowance so usage is never hidden. New-chat
         icon button shows when there's a conversation to clear. The
         meter colour-shifts to red only when truly out. ──────────── */
  const usedPct = allowance > 0 ? Math.min(100, (used / allowance) * 100) : 0
  const meterEmpty = remaining === 0 && allowance > 0
  const topRightControls = (
    <div style={{
      position: 'absolute', top: 4, right: 2,
      display: 'flex', alignItems: 'center', gap: 8,
      zIndex: 3,
    }}>
      {allowance > 0 && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          background: meterEmpty ? C.redSoft : C.surface,
          border: `1px solid ${meterEmpty ? C.redBdr : C.hair}`,
          padding: '6px 12px 6px 11px', borderRadius: 100,
          boxShadow: C.cardShadow,
          fontVariantNumeric: 'tabular-nums',
        }}>
          <span style={{
            fontSize: 12, fontWeight: 600,
            color: meterEmpty ? C.red : C.text1,
            letterSpacing: '-0.02em',
          }}>
            <span>{used}</span>
            <span style={{ color: C.text4, margin: '0 4px', fontWeight: 400 }}>/</span>
            <span style={{ color: C.text3, fontWeight: 500 }}>{allowance}</span>
          </span>
          <div style={{
            width: 56, height: 4,
            background: 'rgba(10,10,15,0.07)',
            borderRadius: 99, overflow: 'hidden',
            boxShadow: 'inset 0 1px 0 rgba(0,0,0,0.04)',
          }}>
            <div style={{
              width: `${usedPct}%`, height: '100%',
              background: meterEmpty
                ? `linear-gradient(90deg, ${C.red} 0%, ${C.redLo} 100%)`
                : `linear-gradient(90deg, ${C.text2} 0%, ${C.text1} 100%)`,
              borderRadius: 99,
              transition: `width 0.8s ${C.spring}`,
            }}/>
          </div>
        </div>
      )}
      {messages.length > 0 && (
        <button
          type="button"
          onClick={newChat}
          disabled={sending}
          aria-label="New chat"
          title="New chat"
          style={{
            width: 34, height: 34, borderRadius: 10,
            border: `1px solid ${C.hair}`,
            background: C.surface, color: C.text2,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            cursor: sending ? 'default' : 'pointer',
            boxShadow: C.cardShadow,
            transition: `background 180ms ${C.spring}, color 180ms ${C.spring}, border-color 180ms ${C.spring}`,
          }}
          onMouseEnter={e => { if (!sending) { e.currentTarget.style.background = C.surfaceLift; e.currentTarget.style.color = C.text1; e.currentTarget.style.borderColor = C.hairActive } }}
          onMouseLeave={e => { if (!sending) { e.currentTarget.style.background = C.surface; e.currentTarget.style.color = C.text2; e.currentTarget.style.borderColor = C.hair } }}
        >
          <Plus size={15} strokeWidth={2} />
        </button>
      )}
    </div>
  )

  return (
    <div style={{
      maxWidth: 1040, margin: '0 auto',
      display: 'flex', flexDirection: 'column',
      height: 'calc(100vh - 52px - 72px)',
      minHeight: 540,
      fontFamily: FONT_STACK,
      position: 'relative',
      // Light surface with a near-invisible warm radial wash from the
      // top. Brand red at ~3% bleeds down and dies before reaching the
      // composer. Gives the page atmosphere without colour.
      background: `${C.bg} radial-gradient(120% 60% at 50% -10%, rgba(229,37,27,0.035) 0%, rgba(229,37,27,0) 55%)`,
      color: C.text1,
    }}>
      {topRightControls}

      {state.loading ? (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 24, height: 24, marginBottom: 14,
            border: `2px solid rgba(10,10,15,0.08)`,
            borderTop: `2px solid ${C.text1}`,
            borderRadius: '50%', animation: 'spin 0.8s linear infinite',
          }}/>
          <p style={{ fontSize: 12.5, color: C.text3, fontWeight: 500, letterSpacing: '-0.01em' }}>
            Loading your coach
          </p>
        </div>
      ) : state.error ? (
        <div style={{
          margin: 'auto', maxWidth: 420,
          background: C.redSoft, border: `1px solid ${C.redBdr}`,
          borderRadius: 12, padding: '14px 18px',
        }}>
          <p style={{ fontSize: 13, color: C.red, fontWeight: 500, letterSpacing: '-0.01em' }}>
            {state.error}
          </p>
        </div>
      ) : messages.length === 0 ? (
        /* ── EMPTY STATE. Vertically centered hero + composer + pills.
              No header, no avatar, no chips. The whole top of the page
              breathes. ─────────────────────────────────────────────── */
        <div style={{
          flex: 1,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '40px 24px',
          gap: 32,
        }}>
          <h1 style={{
            fontSize: 38, fontWeight: 500, color: C.text1,
            letterSpacing: '-0.9px', lineHeight: 1.1,
            textAlign: 'center', maxWidth: 560,
            margin: 0,
          }}>What do you want to figure out?</h1>

          <div style={{ width: '100%', maxWidth: 660 }}>
            {errorBanner}
            {composerForm}
          </div>

          {/* Pill prompts. Two rows, wrap layout, 8 imperative prompts.
              Each pill: white surface, hairline border, Lucide glyph
              (text3) + label (text2). Hover lifts to surfaceLift. */}
          <div style={{
            display: 'flex', flexWrap: 'wrap',
            gap: 8, justifyContent: 'center',
            maxWidth: 660, width: '100%',
          }}>
            {STARTER_PROMPTS.map((p, i) => {
              const Icon = p.Icon
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => send(p.label)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '9px 16px', borderRadius: 100,
                    background: C.surface,
                    border: `1px solid ${C.hair}`,
                    color: C.text2,
                    fontFamily: 'inherit',
                    fontSize: 13, fontWeight: 500, letterSpacing: '-0.005em',
                    cursor: 'pointer',
                    boxShadow: C.cardShadow,
                    transition: `background 200ms ${C.spring}, color 200ms ${C.spring}, border-color 200ms ${C.spring}, transform 200ms ${C.spring}`,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = C.surfaceLift
                    e.currentTarget.style.color = C.text1
                    e.currentTarget.style.borderColor = C.hairActive
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = C.surface
                    e.currentTarget.style.color = C.text2
                    e.currentTarget.style.borderColor = C.hair
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <Icon size={13} strokeWidth={1.8} color={C.text3} />
                  {p.label}
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        /* ── ACTIVE CONVERSATION. Messages occupy the column.
              Composer pinned to bottom. No header. ─────────────────── */
        <>
          <div
            ref={scrollRef}
            className="ytg-chat-scroll"
            style={{
              flex: 1, overflowY: 'auto',
              padding: '52px 4px 18px',  // top padding clears the floating controls
              scrollBehavior: 'smooth',
            }}
          >
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 16,
              maxWidth: 760, margin: '0 auto', padding: '0 8px',
            }}>
              {messages.map((m, i) => (
                <MessageBubble key={i} role={m.role} content={m.content} sources={m.sources} />
              ))}
              {sending && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span style={{
                    flexShrink: 0,
                    width: 32, height: 32, borderRadius: 10,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    background: C.surface,
                    border: `1px solid ${C.hair}`,
                    color: C.text1,
                    boxShadow: C.cardShadow,
                  }}>
                    <Bot size={15} strokeWidth={1.7} />
                  </span>
                  <div style={{
                    background: C.surface,
                    border: `1px solid ${C.hair}`,
                    borderRadius: '4px 14px 14px 14px',
                    padding: '13px 16px',
                    boxShadow: C.cardShadow,
                    display: 'inline-flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                  }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <Dot delay="0s"/><Dot delay="0.15s"/><Dot delay="0.30s"/>
                    </span>
                    {availableSources.length > 0 && (
                      <span style={{
                        fontSize: 12, color: C.text3, fontWeight: 500, letterSpacing: '-0.005em',
                      }}>
                        Reading {availableSources.slice(0, 3).join(', ')}
                        {availableSources.length > 3 ? `, +${availableSources.length - 3} more` : ''}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Composer pinned to bottom */}
          <div style={{
            padding: '12px 8px 16px',
            maxWidth: 776, width: '100%', margin: '0 auto',
          }}>
            {errorBanner}
            {composerForm}
          </div>
        </>
      )}
    </div>
  )
}


/* ─── Message bubble. User bubble = brand red gradient with white inset
       highlight (catches light). Assistant bubble = white surface with
       hairline border. Both feel like real objects on the page. ───── */
function MessageBubble({ role, content, sources }) {
  if (role === 'user') {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{
          maxWidth: '78%',
          background: `linear-gradient(180deg, ${C.redHi} 0%, ${C.red} 60%, ${C.redLo} 100%)`,
          color: '#fff',
          borderRadius: '14px 14px 4px 14px',
          padding: '12px 16px',
          boxShadow: '0 1px 2px rgba(229,37,27,0.28), inset 0 1px 0 rgba(255,255,255,0.22)',
          fontFamily: FONT_STACK,
          fontSize: 14, fontWeight: 450, letterSpacing: '-0.005em', lineHeight: 1.5,
          whiteSpace: 'pre-wrap',
        }}>{content}</div>
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <span style={{
        flexShrink: 0,
        width: 32, height: 32, borderRadius: 10,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: C.surface,
        border: `1px solid ${C.hair}`,
        color: C.text1,
        boxShadow: C.cardShadow,
      }}>
        <Bot size={15} strokeWidth={1.7} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #fafafc 100%)',
          border: `1px solid ${C.hair}`,
          borderRadius: '4px 14px 14px 14px',
          padding: '14px 18px',
          boxShadow: C.cardShadow,
        }}>
          <AssistantBody text={content} />
        </div>
        {sources && sources.length > 0 && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            marginTop: 8, marginLeft: 6,
            fontSize: 11, color: C.text3, fontWeight: 500,
            letterSpacing: '-0.005em',
          }}>
            <Database size={11} strokeWidth={1.7} color={C.text4} />
            <span>{sources.join(' · ')}</span>
          </div>
        )}
      </div>
    </div>
  )
}


/* Typing-indicator dot. Charcoal on white — neutral, no alarm colour. */
function Dot({ delay }) {
  return (
    <>
      <style>{`
        @keyframes ytgDotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4 }
          40%           { transform: translateY(-4px); opacity: 1 }
        }
      `}</style>
      <span style={{
        width: 6, height: 6, borderRadius: 99, background: C.text2,
        animation: `ytgDotBounce 0.9s ease-in-out infinite`,
        animationDelay: delay,
      }}/>
    </>
  )
}
