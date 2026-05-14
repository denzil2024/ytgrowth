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
  Bot,             // Coach avatar — less generic than Sparkles, less awkward on tint
  Database,        // Data sources indicator
  Send,            // Composer send button
  Plus,            // New chat
  ArrowRight,      // CTA
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
  border:     '#e6e6ec',
  borderSoft: '#f0f0f4',
  text1:      '#0a0a0f',
  text2:      'rgba(10,10,15,0.62)',
  text3:      'rgba(10,10,15,0.40)',
  red:        '#e5251b',
  redSoft:    'rgba(229,37,27,0.07)',
  redBdr:     'rgba(229,37,27,0.20)',
  green:      '#059669',
  amber:      '#d97706',
  // Neutral avatar tint. Charcoal soft + 1px charcoal-soft border. Used
  // on both the header avatar and per-message coach avatar so the icon
  // doesn't read as a red alert badge.
  avatarBg:   'rgba(15,15,19,0.06)',
  avatarBdr:  'rgba(15,15,19,0.10)',
  avatarFg:   '#0a0a0f',
}

const STARTER_PROMPTS = [
  { label: 'What should I post this week?', icon: '📝' },
  { label: 'Why are my CTRs dropping?', icon: '📉' },
  { label: 'What is my biggest growth lever right now?', icon: '🎯' },
  { label: 'Compare me to my top competitor', icon: '⚔️' },
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
          fontSize: 14, fontWeight: 450, color: C.text1,
          letterSpacing: '-0.01em', lineHeight: 1.65,
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

  // Quota color depending on how close they are to empty.
  const meterColor = remaining === 0 ? C.red
    : remaining <= allowance * 0.20 ? C.amber
    : C.text2
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
      {/* ── Header — quota meter + new chat ───────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 14, padding: '4px 4px 18px', flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: 10,
            background: C.avatarBg,
            border: `1px solid ${C.avatarBdr}`,
            color: C.avatarFg, flexShrink: 0,
          }}>
            <Bot size={18} strokeWidth={1.9} />
          </span>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text1, letterSpacing: '-0.4px', lineHeight: 1.15 }}>
              AI Coach
            </h1>
            <p style={{ fontSize: 12, color: C.text3, fontWeight: 500, marginTop: 2, letterSpacing: '-0.01em' }}>
              {availableSources.length > 0
                ? `Reading ${availableSources.join(' · ')}`
                : 'Trained on your channel data, ready when you are'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Quota meter */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '8px 14px', borderRadius: 100,
            background: '#fff',
            border: `1px solid ${C.border}`,
            fontVariantNumeric: 'tabular-nums',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: meterColor, letterSpacing: '-0.1px' }}>
                {used} / {allowance}
              </span>
              <span style={{ fontSize: 11, color: C.text3, fontWeight: 500 }}>messages</span>
            </div>
            <div style={{ width: 56, height: 4, background: '#eef0f4', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                width: `${usedPct}%`, height: '100%',
                background: meterColor,
                transition: 'width 0.5s ease',
              }}/>
            </div>
          </div>

          {/* New chat */}
          <button
            type="button"
            onClick={newChat}
            disabled={sending || messages.length === 0}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 100,
              border: `1px solid ${C.border}`,
              background: messages.length === 0 || sending ? '#f6f6f9' : '#fff',
              color: messages.length === 0 || sending ? C.text3 : C.text2,
              fontFamily: 'inherit',
              fontSize: 12, fontWeight: 600, letterSpacing: '-0.01em',
              cursor: messages.length === 0 || sending ? 'default' : 'pointer',
              transition: 'background 0.14s ease, color 0.14s ease, border-color 0.14s ease',
            }}
            onMouseEnter={e => { if (!(messages.length === 0 || sending)) { e.currentTarget.style.background = 'rgba(15,15,19,0.04)'; e.currentTarget.style.color = C.text1; e.currentTarget.style.borderColor = '#d0d0d8' } }}
            onMouseLeave={e => { if (!(messages.length === 0 || sending)) { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = C.text2; e.currentTarget.style.borderColor = C.border } }}
          >
            <Plus size={13} strokeWidth={2.4} />
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
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <div style={{
              width: 28, height: 28, margin: '0 auto 12px',
              border: `2.5px solid ${C.border}`, borderTop: `2.5px solid ${C.red}`,
              borderRadius: '50%', animation: 'spin 0.7s linear infinite',
            }}/>
            <p style={{ fontSize: 12, color: C.text3, fontWeight: 500 }}>Loading your coach…</p>
          </div>
        ) : state.error ? (
          <div style={{
            background: 'rgba(229,37,27,0.06)',
            border: '1px solid rgba(229,37,27,0.18)',
            borderRadius: 12, padding: '14px 18px',
          }}>
            <p style={{ fontSize: 13, color: C.red, fontWeight: 600 }}>{state.error}</p>
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
                }}>
                  <Bot size={15} strokeWidth={1.9} />
                </span>
                <div style={{
                  background: '#fff', border: `1px solid ${C.border}`,
                  borderRadius: '4px 14px 14px 14px',
                  padding: '12px 16px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  display: 'inline-flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
                }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <Dot delay="0s"/><Dot delay="0.15s"/><Dot delay="0.30s"/>
                  </span>
                  {availableSources.length > 0 && (
                    <span style={{
                      fontSize: 11.5, color: C.text3, fontWeight: 500, letterSpacing: '-0.01em',
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

      {/* ── Composer (sticky bottom) ───────────────────────────────── */}
      <div style={{
        marginTop: 4,
        background: C.bg,
        paddingTop: 8,
      }}>
        {/* Inline error */}
        {sendError && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
            marginBottom: 10,
            background: 'rgba(229,37,27,0.06)',
            border: '1px solid rgba(229,37,27,0.18)',
            borderRadius: 10, padding: '10px 14px',
          }}>
            <p style={{ fontSize: 12.5, color: C.red, fontWeight: 600, flex: 1, lineHeight: 1.5 }}>{sendError}</p>
            {outOfMessages && (
              <button
                type="button"
                onClick={() => onNavigate?.('Settings')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '6px 12px', borderRadius: 100,
                  border: 'none', cursor: 'pointer',
                  background: C.red, color: '#fff',
                  fontFamily: 'inherit',
                  fontSize: 11.5, fontWeight: 700, letterSpacing: '-0.01em',
                  boxShadow: '0 1px 3px rgba(229,37,27,0.30)',
                  flexShrink: 0,
                }}
              >
                Upgrade
                <ArrowRight size={11} strokeWidth={2.4} />
              </button>
            )}
          </div>
        )}

        <form
          onSubmit={(e) => { e.preventDefault(); send() }}
          style={{
            display: 'flex', alignItems: 'flex-end', gap: 10,
            background: '#fff',
            border: `1px solid ${input.length > 0 || sending ? '#d0d0d8' : C.border}`,
            borderRadius: 14, padding: '10px 12px 10px 16px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.05)',
            transition: 'border-color 0.14s ease',
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
            placeholder={outOfMessages ? 'You’ve used all messages this month' : 'Ask your coach anything…'}
            style={{
              flex: 1, minWidth: 0,
              border: 'none', outline: 'none',
              background: 'transparent',
              fontFamily: FONT_STACK,
              fontSize: 14, fontWeight: 500, color: C.text1,
              letterSpacing: '-0.01em', lineHeight: 1.55,
              resize: 'none',
              maxHeight: 140,
              paddingTop: 6, paddingBottom: 6,
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
              width: 38, height: 38, borderRadius: 10,
              border: 'none',
              background: (sending || outOfMessages || input.trim().length === 0) ? '#eef0f4' : C.red,
              color: (sending || outOfMessages || input.trim().length === 0) ? C.text3 : '#fff',
              cursor: (sending || outOfMessages || input.trim().length === 0) ? 'default' : 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: (sending || outOfMessages || input.trim().length === 0) ? 'none' : '0 1px 3px rgba(229,37,27,0.30)',
              transition: 'background 0.14s ease, transform 0.14s ease',
            }}
            onMouseEnter={e => { if (!(sending || outOfMessages || input.trim().length === 0)) e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { if (!(sending || outOfMessages || input.trim().length === 0)) e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <Send size={16} strokeWidth={2.2} />
          </button>
        </form>

        <p style={{
          fontSize: 10.5, color: C.text3, fontWeight: 500,
          letterSpacing: '0.01em', marginTop: 8, textAlign: 'center',
        }}>
          Press <kbd style={{ background: '#f0f0f4', padding: '1px 5px', borderRadius: 4, fontFamily: 'inherit', fontSize: 10, fontWeight: 700, color: C.text2 }}>Enter</kbd> to send, <kbd style={{ background: '#f0f0f4', padding: '1px 5px', borderRadius: 4, fontFamily: 'inherit', fontSize: 10, fontWeight: 700, color: C.text2 }}>Shift+Enter</kbd> for newline
        </p>
      </div>
    </div>
  )
}


/* ─── Empty state ──────────────────────────────────────────────────── */
function EmptyState({ onPick }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      paddingTop: 40, paddingBottom: 20,
    }}>
      {/* Big avatar — neutral charcoal so it reads as a Coach mark,
          not a notification badge. */}
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, rgba(15,15,19,0.07) 0%, rgba(15,15,19,0.02) 100%)',
        border: '1px solid rgba(15,15,19,0.10)',
        color: C.text1, marginBottom: 16,
        boxShadow: '0 8px 24px rgba(15,15,19,0.06)',
      }}>
        <Bot size={28} strokeWidth={1.8} />
      </div>

      <h2 style={{
        fontSize: 22, fontWeight: 800, color: C.text1,
        letterSpacing: '-0.5px', lineHeight: 1.2, marginBottom: 8,
        textAlign: 'center',
      }}>What do you want to figure out?</h2>
      <p style={{
        fontSize: 13.5, color: C.text2, fontWeight: 500,
        letterSpacing: '-0.01em', lineHeight: 1.55, textAlign: 'center',
        maxWidth: 420, marginBottom: 28,
      }}>
        Your channel stats, recent videos, audit results, and competitor data are loaded. Ask me anything.
      </p>

      {/* Starter prompts grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
        width: '100%', maxWidth: 540,
      }}>
        {STARTER_PROMPTS.map((p, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onPick(p.label)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '14px 16px', borderRadius: 12,
              background: '#fff',
              border: `1px solid ${C.border}`,
              color: C.text1,
              fontFamily: 'inherit',
              fontSize: 13, fontWeight: 600, letterSpacing: '-0.1px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.14s ease, border-color 0.14s ease, transform 0.14s ease, box-shadow 0.14s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fafafb'; e.currentTarget.style.borderColor = '#d6d6dc'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>{p.icon}</span>
            <span style={{ flex: 1, lineHeight: 1.4 }}>{p.label}</span>
            <ArrowRight size={13} strokeWidth={2.4} color={C.text3} style={{ flexShrink: 0 }}/>
          </button>
        ))}
      </div>
    </div>
  )
}


/* ─── Message bubble ───────────────────────────────────────────────── */
function MessageBubble({ role, content, sources }) {
  if (role === 'user') {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{
          maxWidth: '78%',
          background: C.red,
          color: '#fff',
          borderRadius: '14px 14px 4px 14px',
          padding: '11px 16px',
          boxShadow: '0 1px 3px rgba(229,37,27,0.25)',
          fontFamily: FONT_STACK,
          fontSize: 14, fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.5,
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
      }}>
        <Bot size={15} strokeWidth={1.9} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          background: '#fff', border: `1px solid ${C.border}`,
          borderRadius: '4px 14px 14px 14px',
          padding: '12px 16px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        }}>
          <AssistantBody text={content} />
        </div>
        {sources && sources.length > 0 && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            marginTop: 8, marginLeft: 4,
            fontSize: 10.5, color: C.text3, fontWeight: 600,
            letterSpacing: '0.03em',
          }}>
            <Database size={10} strokeWidth={2} />
            <span>Pulled from: {sources.join(' · ')}</span>
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
        width: 6, height: 6, borderRadius: 99, background: C.red,
        animation: `ytgDotBounce 0.9s ease-in-out infinite`,
        animationDelay: delay,
      }}/>
    </>
  )
}
