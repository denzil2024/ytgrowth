/* ChatCoach — AI Coach surface for the Chat verb.

   Plumbing:
   - GET  /chat/state  on mount → hydrates messages + allowance/used.
   - POST /chat/send   sends a message, waits for the Haiku response,
                       appends both turns to the local message list,
                       updates the quota meter.
   - POST /chat/new    clears the conversation server-side and locally.

   UI:
   - Centered 760px column inside the main area
   - Sticky meter header (X / Y messages this month, plan, new chat)
   - Empty state with 4 suggested prompts as clickable chips
   - Streaming-style message list (user right, assistant left)
   - Tinted-circle Lucide icon avatar on assistant messages
   - Sticky composer at the bottom with Send button + Enter shortcut
   - Inline upgrade pitch when the quota empties.
*/

import { useEffect, useRef, useState } from 'react'
import {
  Bot,             // Coach avatar in the header
  Database,        // Data sources indicator
  Send,            // Composer send button
  Plus,            // New chat
  ArrowRight,      // CTA
  Sparkles,        // Empty-state hero mark, sits cleaner than Bot at large sizes
  Calendar,        // Starter prompt: "what should I post"
  TrendingDown,    // Starter prompt: "why are my CTRs dropping"
  Zap,             // Starter prompt: "biggest growth lever"
  GitCompare,      // Starter prompt: "compare to competitor"
} from 'lucide-react'

// Page-scoped font load. Geist Variable (Vercel's open-source UI font) is a
// premium step up from Inter for the look-and-feel we're targeting on Chat.
// Loaded inside this file only so the swap is isolated to this page while we
// evaluate it. Once approved, this same loader pattern moves to a global hook.
if (typeof document !== 'undefined' && !document.getElementById('ytg-chat-geist-font')) {
  const link = document.createElement('link')
  link.id = 'ytg-chat-geist-font'
  link.rel = 'stylesheet'
  link.href = 'https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@400..700&display=swap'
  document.head.appendChild(link)
}

const FONT_STACK = "'Geist', 'Inter', system-ui, -apple-system, sans-serif"
const FONT_MONO  = "'Geist Mono', ui-monospace, SFMono-Regular, monospace"

const C = {
  bg:         '#f5f5f9',
  surface:    '#ffffff',
  // Hairlines are pure-black alpha, not solid gray. Black-alpha sits on the
  // surface; solid gray sits on top of it. Reads premium at one pixel.
  border:     'rgba(10,10,15,0.07)',
  borderSoft: 'rgba(10,10,15,0.04)',
  borderActive: 'rgba(10,10,15,0.20)',
  text1:      '#0a0a0f',
  text2:      'rgba(10,10,15,0.62)',
  text3:      'rgba(10,10,15,0.42)',
  text4:      'rgba(10,10,15,0.28)',
  // Single CTA color. The inset highlight on top of the pill is the trick
  // that makes the button feel dimensional without adding a second color.
  red:        '#e5251b',
  redSoft:    'rgba(229,37,27,0.06)',
  redBdr:     'rgba(229,37,27,0.16)',
  redShadow:  '0 1px 2px rgba(229,37,27,0.22), inset 0 1px 0 rgba(255,255,255,0.16)',
  // Forest green for the "healthy quota" state. Grass green reads retail,
  // forest reads expensive.
  green:      '#15803d',
  // Neutral avatar tint, used by both the header avatar and per-message
  // coach avatar so the icon doesn't read as a red alert badge.
  avatarBg:   'rgba(15,15,19,0.05)',
  avatarBdr:  'rgba(15,15,19,0.09)',
  avatarFg:   '#0a0a0f',
  // The one shadow stack the page uses. Outer drop is barely there; inner
  // highlight is the iOS card trick that makes white surfaces feel lit.
  cardShadow:     '0 1px 2px rgba(15,15,25,0.04), inset 0 1px 0 rgba(255,255,255,0.7)',
  cardShadowLift: '0 4px 18px rgba(15,15,25,0.06), inset 0 1px 0 rgba(255,255,255,0.7)',
  spring:         'cubic-bezier(0.32, 0.72, 0, 1)',
}

// Starter prompts pair semantically-fitting Lucide icons (never emoji) with
// each suggestion. Icons render inside a soft charcoal-tinted circle so the
// cards read as one design grammar with the header avatar.
const STARTER_PROMPTS = [
  { label: 'What should I post this week?',               Icon: Calendar     },
  { label: 'Why are my CTRs dropping?',                   Icon: TrendingDown },
  { label: 'What is my biggest growth lever right now?',  Icon: Zap          },
  { label: 'Compare me to my top competitor',             Icon: GitCompare   },
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

// Render assistant prose with paragraph breaks. The model is told to
// avoid bullet lists, so plain newline → <br/> is enough.
function AssistantBody({ text }) {
  const parts = (text || '').split(/\n{2,}/g)
  return (
    <>
      {parts.map((p, i) => (
        <p key={i} style={{
          margin: i === 0 ? 0 : '10px 0 0 0',
          fontSize: 14, fontWeight: 400, color: C.text1,
          letterSpacing: '-0.005em', lineHeight: 1.65,
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
      .catch(err => {
        if (cancelled) return
        setState({ loading: false, error: 'Could not load your coach. Refresh the page.' })
      })
    return () => { cancelled = true }
  }, [])

  // Scroll to bottom when a new message arrives
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

    // Optimistic user-message append
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
        // Roll back the optimistic message on failure
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
      // Keep focus on the input so user can keep typing
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

  // Meter is bichromatic: charcoal when there's quota left, red when truly
  // empty. We deliberately don't introduce an amber "near empty" state —
  // mid-tier alarm colors read as nagging and undercut the premium feel.
  // The bar's own length already communicates urgency.
  const meterColor = remaining === 0 ? C.red : C.text1
  const usedPct = allowance > 0 ? Math.min(100, (used / allowance) * 100) : 0

  return (
    <div style={{
      maxWidth: 760, margin: '0 auto',
      display: 'flex', flexDirection: 'column',
      height: 'calc(100vh - 52px - 72px)', // topbar 52 + page paddingTop 36 + paddingBottom 36
      minHeight: 500,
      // Geist takes over the whole Chat surface. Children that use
      // fontFamily: 'inherit' pick this up automatically.
      fontFamily: FONT_STACK,
    }}>
      {/* ── Header. Avatar uses a softer charcoal tint than the v1 card,
            and the H1 drops from 800 to 600 so the title sits as a label
            for the surface rather than shouting at the user. ─────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 14, padding: '6px 2px 22px', flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 38, height: 38, borderRadius: 11,
            background: C.avatarBg,
            border: `1px solid ${C.avatarBdr}`,
            color: C.avatarFg, flexShrink: 0,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
          }}>
            <Bot size={18} strokeWidth={1.7} />
          </span>
          <div>
            <h1 style={{
              fontSize: 22, fontWeight: 600, color: C.text1,
              letterSpacing: '-0.5px', lineHeight: 1.15,
            }}>AI Coach</h1>
            <p style={{
              fontSize: 12.5, color: C.text3, fontWeight: 500,
              marginTop: 3, letterSpacing: '-0.01em',
            }}>
              {availableSources.length > 0
                ? `Reading ${availableSources.join(' · ')}`
                : 'Trained on your channel data'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Quota meter. The bar IS the meter, the number is the label.
              No "messages" word, no amber state — both add noise. */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            padding: '8px 14px', borderRadius: 100,
            background: '#fff',
            border: `1px solid ${C.border}`,
            boxShadow: C.cardShadow,
            fontVariantNumeric: 'tabular-nums',
          }}>
            <span style={{
              fontSize: 12.5, fontWeight: 500, color: meterColor,
              letterSpacing: '-0.02em',
            }}>
              <span style={{ color: meterColor }}>{used}</span>
              <span style={{ color: C.text4, margin: '0 4px' }}>/</span>
              <span style={{ color: C.text3 }}>{allowance}</span>
            </span>
            <div style={{
              width: 64, height: 3,
              background: 'rgba(10,10,15,0.06)',
              borderRadius: 99, overflow: 'hidden',
            }}>
              <div style={{
                width: `${usedPct}%`, height: '100%',
                background: meterColor,
                transition: `width 0.8s ${C.spring}`,
              }}/>
            </div>
          </div>

          {/* New chat. Same hairline + inset highlight as the meter so
              the two pills read as siblings. */}
          <button
            type="button"
            onClick={newChat}
            disabled={sending || messages.length === 0}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 100,
              border: `1px solid ${C.border}`,
              background: messages.length === 0 || sending ? 'rgba(10,10,15,0.025)' : '#fff',
              color: messages.length === 0 || sending ? C.text4 : C.text2,
              fontFamily: 'inherit',
              fontSize: 12.5, fontWeight: 500, letterSpacing: '-0.01em',
              cursor: messages.length === 0 || sending ? 'default' : 'pointer',
              boxShadow: messages.length === 0 || sending ? 'none' : C.cardShadow,
              transition: `background 180ms ${C.spring}, color 180ms ${C.spring}, border-color 180ms ${C.spring}`,
            }}
            onMouseEnter={e => { if (!(messages.length === 0 || sending)) { e.currentTarget.style.background = 'rgba(15,15,19,0.03)'; e.currentTarget.style.color = C.text1; e.currentTarget.style.borderColor = C.borderActive } }}
            onMouseLeave={e => { if (!(messages.length === 0 || sending)) { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = C.text2; e.currentTarget.style.borderColor = C.border } }}
          >
            <Plus size={13} strokeWidth={1.9} />
            New chat
          </button>
        </div>
      </div>

      {/* ── Message stream ─────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        style={{
          flex: 1, overflowY: 'auto',
          padding: '4px 4px 14px',
          scrollBehavior: 'smooth',
        }}
      >
        {state.loading ? (
          <div style={{ padding: '64px 0', textAlign: 'center' }}>
            <div style={{
              width: 24, height: 24, margin: '0 auto 14px',
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
            background: C.redSoft,
            border: `1px solid ${C.redBdr}`,
            borderRadius: 12, padding: '14px 18px',
          }}>
            <p style={{ fontSize: 13, color: C.red, fontWeight: 500, letterSpacing: '-0.01em' }}>
              {state.error}
            </p>
          </div>
        ) : messages.length === 0 ? (
          <EmptyState onPick={(text) => send(text)} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {messages.map((m, i) => (
              <MessageBubble key={i} role={m.role} content={m.content} sources={m.sources} />
            ))}
            {sending && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{
                  flexShrink: 0,
                  width: 32, height: 32, borderRadius: 10,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: C.avatarBg, border: `1px solid ${C.avatarBdr}`, color: C.avatarFg,
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
                }}>
                  <Bot size={15} strokeWidth={1.7} />
                </span>
                <div style={{
                  background: '#fff', border: `1px solid ${C.border}`,
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
                      fontSize: 12, color: C.text3, fontWeight: 500, letterSpacing: '-0.01em',
                    }}>
                      Reading {availableSources.slice(0, 3).join(', ')}
                      {availableSources.length > 3 ? `, +${availableSources.length - 3} more` : ''}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Composer (sticky bottom). Treated as a single tactile object:
            hairline border, single soft shadow with inner highlight, focus
            state darkens the border subtly without changing surface. ─── */}
      <div style={{
        marginTop: 4,
        background: C.bg,
        paddingTop: 10,
      }}>
        {/* Inline error. No alarm icon, no shouty weight — just the
            tinted strip and the tone of voice the rest of the app uses. */}
        {sendError && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
            marginBottom: 10,
            background: C.redSoft,
            border: `1px solid ${C.redBdr}`,
            borderRadius: 12, padding: '11px 14px',
          }}>
            <p style={{
              fontSize: 12.5, color: C.red, fontWeight: 500,
              flex: 1, lineHeight: 1.5, letterSpacing: '-0.01em',
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
                  fontSize: 12, fontWeight: 600, letterSpacing: '-0.01em',
                  boxShadow: C.redShadow,
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
        )}

        <form
          onSubmit={(e) => { e.preventDefault(); send() }}
          style={{
            display: 'flex', alignItems: 'flex-end', gap: 10,
            background: '#fff',
            border: `1px solid ${input.length > 0 || sending ? C.borderActive : C.border}`,
            borderRadius: 14, padding: '10px 10px 10px 18px',
            boxShadow: C.cardShadow,
            transition: `border-color 200ms ${C.spring}`,
          }}
        >
          <textarea
            ref={inputRef}
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
            placeholder={outOfMessages ? 'You have used all messages this month' : 'Ask your coach anything'}
            style={{
              flex: 1, minWidth: 0,
              border: 'none', outline: 'none',
              background: 'transparent',
              fontFamily: FONT_STACK,
              fontSize: 14.5, fontWeight: 400, color: C.text1,
              letterSpacing: '-0.005em', lineHeight: 1.55,
              resize: 'none',
              maxHeight: 140,
              paddingTop: 7, paddingBottom: 7,
            }}
            onInput={(e) => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px'
            }}
          />
          <button
            type="submit"
            disabled={sending || outOfMessages || input.trim().length === 0}
            aria-label="Send"
            style={{
              flexShrink: 0,
              width: 40, height: 40, borderRadius: 11,
              border: 'none',
              background: (sending || outOfMessages || input.trim().length === 0) ? 'rgba(10,10,15,0.05)' : C.red,
              color: (sending || outOfMessages || input.trim().length === 0) ? C.text4 : '#fff',
              cursor: (sending || outOfMessages || input.trim().length === 0) ? 'default' : 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: (sending || outOfMessages || input.trim().length === 0) ? 'none' : C.redShadow,
              transition: `filter 160ms ${C.spring}, background 160ms ${C.spring}`,
            }}
            onMouseEnter={e => { if (!(sending || outOfMessages || input.trim().length === 0)) e.currentTarget.style.filter = 'brightness(1.06)' }}
            onMouseLeave={e => { if (!(sending || outOfMessages || input.trim().length === 0)) e.currentTarget.style.filter = 'none' }}
          >
            <Send size={16} strokeWidth={2} />
          </button>
        </form>

        <p style={{
          fontSize: 11, color: C.text4, fontWeight: 500,
          letterSpacing: '-0.005em', marginTop: 10, textAlign: 'center',
        }}>
          <kbd style={{
            background: 'rgba(10,10,15,0.045)',
            border: `1px solid ${C.border}`,
            padding: '1px 6px', borderRadius: 4,
            fontFamily: FONT_MONO, fontSize: 10, fontWeight: 500,
            color: C.text2,
          }}>Enter</kbd>{' '}to send,{' '}
          <kbd style={{
            background: 'rgba(10,10,15,0.045)',
            border: `1px solid ${C.border}`,
            padding: '1px 6px', borderRadius: 4,
            fontFamily: FONT_MONO, fontSize: 10, fontWeight: 500,
            color: C.text2,
          }}>Shift</kbd>{' + '}
          <kbd style={{
            background: 'rgba(10,10,15,0.045)',
            border: `1px solid ${C.border}`,
            padding: '1px 6px', borderRadius: 4,
            fontFamily: FONT_MONO, fontSize: 10, fontWeight: 500,
            color: C.text2,
          }}>Enter</kbd>{' '}for newline
        </p>
      </div>
    </div>
  )
}


/* ─── Empty state ──────────────────────────────────────────────────────
   This is the conversion surface — what the user sees first when they
   open Chat. The layout is deliberately typographic: a small eyebrow
   sets context, an oversized question anchors the screen, a single line
   of body explains the data scope, four polished prompt cards offer
   one-tap entries. No gradients on the avatar, no double shadows, no
   emoji icons. The cards earn their weight from spacing and the soft
   tinted circle behind each Lucide glyph, not from chrome.
   ────────────────────────────────────────────────────────────────── */
function EmptyState({ onPick }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      paddingTop: 52, paddingBottom: 24,
    }}>
      {/* Hero mark. A single Sparkles glyph in a soft tinted square sits
          in for the bigger Bot. Sparkles is more "what should we make"
          and less "robot assistant" — better tone for the coaching
          frame the page is selling. */}
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: C.avatarBg,
        border: `1px solid ${C.avatarBdr}`,
        color: C.text1, marginBottom: 22,
        boxShadow: C.cardShadow,
      }}>
        <Sparkles size={22} strokeWidth={1.6} />
      </div>

      {/* Eyebrow: tiny context label. Tracking opens it up so it reads
          as a typographic flourish, not as shouty UI text. */}
      <p style={{
        fontSize: 10.5, fontWeight: 500,
        color: C.text3, letterSpacing: '0.12em', textTransform: 'uppercase',
        marginBottom: 10,
      }}>AI Coach</p>

      {/* Hero question. Big, soft weight, tight tracking — the move that
          carries the whole screen. 28/600 is the new display token; the
          old H2 was 22/800 which read as a heading, not a moment. */}
      <h2 style={{
        fontSize: 28, fontWeight: 600, color: C.text1,
        letterSpacing: '-0.6px', lineHeight: 1.18, marginBottom: 10,
        textAlign: 'center', maxWidth: 460,
      }}>What do you want to figure out?</h2>

      {/* Single-line subhead. The 4 data sources were spelled out before
          (stats, videos, audit results, competitor data). That was 5
          things stacked into one sentence — too much. The new line is
          one beat: this knows you. */}
      <p style={{
        fontSize: 13.5, color: C.text3, fontWeight: 500,
        letterSpacing: '-0.01em', lineHeight: 1.55, textAlign: 'center',
        maxWidth: 380, marginBottom: 36,
      }}>
        Trained on your channel, audits, and tracked competitors.
      </p>

      {/* Starter prompts. Two columns, generous gap, each card is a
          tactile object: hairline border, soft inset highlight at rest,
          tile lifts 1px on hover with shadow growth + border darken.
          The Lucide glyph sits in a soft charcoal-tinted circle so the
          cards read as one coherent system, not coloured tags. */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
        width: '100%', maxWidth: 560,
      }}>
        {STARTER_PROMPTS.map((p, i) => {
          const Icon = p.Icon
          return (
            <button
              key={i}
              type="button"
              onClick={() => onPick(p.label)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px', borderRadius: 14,
                background: '#fff',
                border: `1px solid ${C.border}`,
                color: C.text1,
                fontFamily: 'inherit',
                fontSize: 13.5, fontWeight: 500, letterSpacing: '-0.01em',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: C.cardShadow,
                transition: `transform 200ms ${C.spring}, box-shadow 200ms ${C.spring}, border-color 200ms ${C.spring}`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = C.cardShadowLift
                e.currentTarget.style.borderColor = C.borderActive
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = C.cardShadow
                e.currentTarget.style.borderColor = C.border
              }}
            >
              <span style={{
                flexShrink: 0,
                width: 32, height: 32, borderRadius: 9,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: C.avatarBg,
                border: `1px solid ${C.avatarBdr}`,
                color: C.text1,
              }}>
                <Icon size={15} strokeWidth={1.7} />
              </span>
              <span style={{ flex: 1, lineHeight: 1.4, color: C.text1 }}>{p.label}</span>
              <ArrowRight size={14} strokeWidth={1.9} color={C.text4} style={{ flexShrink: 0 }}/>
            </button>
          )
        })}
      </div>
    </div>
  )
}


/* ─── Message bubble ───────────────────────────────────────────────────
   User bubble (right side): red surface with a subtle white inset
   highlight along the top edge, the "glass" trick that gives the pill
   dimension without adding a second color.
   Assistant bubble (left side): white surface with hairline + the same
   single-shadow + inset-highlight stack as the rest of the page, so all
   white surfaces feel lit from above.
   ────────────────────────────────────────────────────────────────── */
function MessageBubble({ role, content, sources }) {
  if (role === 'user') {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{
          maxWidth: '78%',
          background: C.red,
          color: '#fff',
          borderRadius: '14px 14px 4px 14px',
          padding: '12px 16px',
          boxShadow: '0 1px 2px rgba(229,37,27,0.22), inset 0 1px 0 rgba(255,255,255,0.18)',
          fontFamily: FONT_STACK,
          fontSize: 14, fontWeight: 400, letterSpacing: '-0.005em', lineHeight: 1.5,
          whiteSpace: 'pre-wrap',
        }}>{content}</div>
      </div>
    )
  }
  // assistant
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <span style={{
        flexShrink: 0,
        width: 32, height: 32, borderRadius: 10,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: C.avatarBg, border: `1px solid ${C.avatarBdr}`, color: C.avatarFg,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
      }}>
        <Bot size={15} strokeWidth={1.7} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          background: '#fff', border: `1px solid ${C.border}`,
          borderRadius: '4px 14px 14px 14px',
          padding: '13px 18px',
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


/* ─── Typing-indicator dot ─────────────────────────────────────────── */
function Dot({ delay }) {
  return (
    <>
      <style>{`
        @keyframes ytgDotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4 }
          40% { transform: translateY(-4px); opacity: 1 }
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
