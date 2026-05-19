/* ChatCoach — the AI Coach surface.

   This page renders inside the normal (light) app shell. The shell,
   sidebar and topbar are NOT touched. Only this content panel is dark:
   one self-contained dark workspace docked into the page, with its own
   conversation history rail. Visual reference: VidIQ AI Coach — calm
   neutral dark, plain messages (no coloured bubbles), restrained type.

   Plumbing (unchanged):
   - GET  /chat/state            on mount → messages + allowance/used.
   - GET  /chat/state?conversation_id=…   switch thread.
   - POST /chat/send             send a message.
   - POST /chat/new              start a fresh thread.
   - DEL  /chat/conversations/:id  delete a thread.
*/

import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Sparkles,         // Assistant mark (reads as "AI")
  Database,         // Sources line on assistant replies
  Send,             // Composer send
  SquarePen,        // New chat (compose) affordance on the page
  ArrowRight,       // Upgrade CTA glyph
  // Starter-prompt icons
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  ImageIcon,
  Lightbulb,
  Type,
  GitCompare,
  Search,
} from 'lucide-react'

/* Geist — already the chosen face across the redesigned surfaces. Same
   class of neutral grotesque VidIQ renders, so the type reads calm and
   modern without adding a new dependency. */
if (typeof document !== 'undefined' && !document.getElementById('ytg-chat-geist-font')) {
  const link = document.createElement('link')
  link.id = 'ytg-chat-geist-font'
  link.rel = 'stylesheet'
  link.href = 'https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@400..700&display=swap'
  document.head.appendChild(link)
}

/* Scrollbar + placeholder + markdown list markers, scoped to this page. */
if (typeof document !== 'undefined' && !document.getElementById('ytg-chat-scrollbar')) {
  const s = document.createElement('style')
  s.id = 'ytg-chat-scrollbar'
  s.textContent = `
    .ytg-chat-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.10) transparent }
    .ytg-chat-scroll::-webkit-scrollbar { width: 6px; height: 6px }
    .ytg-chat-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.10); border-radius: 99px }
    .ytg-chat-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18) }
    .ytg-chat-scroll::-webkit-scrollbar-track, .ytg-chat-scroll::-webkit-scrollbar-button { background: transparent; display: none }
    .ytg-chat-textarea::placeholder { color: #6b6b73 }
    @keyframes ytgFadeUp { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }
    @media (prefers-reduced-motion: reduce) { .ytg-fade-up { animation: none !important } }
    .md-list-ul > li::before {
      content: '•'; position: absolute; left: 4px; top: 0;
      font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.32); line-height: inherit;
    }
    .md-list-ol > li { counter-increment: mdlist }
    .md-list-ol > li::before {
      content: counter(mdlist) '.'; position: absolute; left: 0; top: 0;
      font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.32);
      font-variant-numeric: tabular-nums; line-height: inherit;
    }
  `
  document.head.appendChild(s)
}

const FONT_STACK = "'Geist', 'Inter', system-ui, -apple-system, sans-serif"
const FONT_MONO  = "'Geist Mono', ui-monospace, SFMono-Regular, monospace"

/* ─── One neutral-zinc dark system. Three surface steps, a five-step
       text ramp, and brand red used in exactly two places: the enabled
       send button and the active history-row marker. Nowhere else. ─── */
const C = {
  base:        '#0e0e10',                 // dark panel base (locked content shade)
  rail:        '#131316',                 // history rail (one step off base)
  raised:      '#18181b',                 // composer, user chip, avatar
  raisedHover: '#1f1f23',                 // hover on raised elements
  hair:        'rgba(255,255,255,0.06)',  // resting hairline
  hairStrong:  'rgba(255,255,255,0.11)',  // focus / active hairline
  t1:          '#f4f4f5',                 // strong text
  t2:          '#d4d4d8',                 // body text
  t3:          '#b8b8c0',                 // muted text
  t4:          '#6b6b73',                 // faint (placeholder, footnotes)
  t5:          '#6b6b73',                 // faintest (labels, idle icons)
  red:         '#e5251b',                 // accent — send + active marker only
  redText:     '#f87171',                 // error copy on dark
  spring:      'cubic-bezier(0.32, 0.72, 0, 1)',
}

/* Eight starter prompts. Click sends the label straight through. */
const STARTER_PROMPTS = [
  { label: 'Get more views',       Icon: TrendingUp   },
  { label: 'Fix my CTR',           Icon: TrendingDown },
  { label: 'Channel audit',        Icon: CheckCircle2 },
  { label: 'Thumbnail tips',       Icon: ImageIcon    },
  { label: 'Video ideas',          Icon: Lightbulb    },
  { label: 'Better titles',        Icon: Type         },
  { label: 'Compare a competitor', Icon: GitCompare   },
  { label: 'Find keywords',        Icon: Search       },
]

/* Assistant prose. Calm body: one regular weight, generous leading,
   soft-white on the dark base. Emphasis is weight, never italics. */
function AssistantBody({ text }) {
  return (
    <div style={{
      fontSize: 15, fontWeight: 400, color: C.t2,
      letterSpacing: '-0.006em', lineHeight: 1.7,
    }}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
        {text || ''}
      </ReactMarkdown>
    </div>
  )
}

const MARKDOWN_COMPONENTS = {
  p: ({ children }) => (
    <p style={{ margin: '0 0 12px 0', fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit', letterSpacing: 'inherit', lineHeight: 'inherit' }}>{children}</p>
  ),
  strong: ({ children }) => (
    <strong style={{ fontWeight: 600, color: C.t1 }}>{children}</strong>
  ),
  em: ({ children }) => (
    <span style={{ fontWeight: 600, color: C.t1 }}>{children}</span>
  ),
  ul: ({ children }) => (
    <ul className="md-list-ul" style={{ margin: '8px 0 14px 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="md-list-ol" style={{ margin: '8px 0 14px 0', padding: 0, listStyle: 'none', counterReset: 'mdlist', display: 'flex', flexDirection: 'column', gap: 7 }}>{children}</ol>
  ),
  li: ({ children }) => (
    <li style={{ position: 'relative', paddingLeft: 22 }}>{children}</li>
  ),
  code: ({ inline, children }) => {
    if (inline === false) {
      return (
        <pre style={{
          margin: '10px 0 14px 0', padding: '12px 14px',
          background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.hair}`,
          borderRadius: 10, fontSize: 13, fontFamily: FONT_MONO,
          lineHeight: 1.6, color: C.t2, overflow: 'auto',
        }}><code>{children}</code></pre>
      )
    }
    return (
      <code style={{
        fontFamily: FONT_MONO, fontSize: '0.86em', fontWeight: 500,
        color: C.t1, letterSpacing: '-0.01em',
      }}>{children}</code>
    )
  },
  blockquote: ({ children }) => (
    <blockquote style={{
      margin: '10px 0 14px 0', padding: '2px 0 2px 14px',
      borderLeft: `2px solid ${C.hairStrong}`, color: C.t3, fontWeight: 400,
    }}>{children}</blockquote>
  ),
  h1: ({ children }) => (
    <h3 style={{ margin: '20px 0 8px 0', fontSize: 16, fontWeight: 600, color: C.t1, letterSpacing: '-0.015em', lineHeight: 1.35 }}>{children}</h3>
  ),
  h2: ({ children }) => (
    <h3 style={{ margin: '20px 0 8px 0', fontSize: 15.5, fontWeight: 600, color: C.t1, letterSpacing: '-0.015em', lineHeight: 1.35 }}>{children}</h3>
  ),
  h3: ({ children }) => (
    <h3 style={{ margin: '18px 0 6px 0', fontSize: 15, fontWeight: 600, color: C.t1, letterSpacing: '-0.01em', lineHeight: 1.35 }}>{children}</h3>
  ),
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer"
      style={{ color: C.t1, textDecoration: 'none', fontWeight: 500, borderBottom: `1px solid ${C.hairStrong}` }}>{children}</a>
  ),
  hr: () => (
    <hr style={{ margin: '16px 0', border: 'none', height: 1, background: C.hair }}/>
  ),
}


export default function ChatCoach({ onNavigate, billingPlan, chatMode, chatTargetId, chatNonce, onChatState }) {
  const [state, setState] = useState({ loading: true, error: null })
  const [messages, setMessages] = useState([])
  const [allowance, setAllowance] = useState(0)
  const [used, setUsed] = useState(0)
  const [plan, setPlan] = useState('free')
  const [availableSources, setAvailableSources] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState(null)
  // Conversation history. activeConversationId === null when the user
  // has no conversations yet (truly first-time empty state).
  const [conversations, setConversations] = useState([])
  const [activeConversationId, setActiveConversationId] = useState(null)
  const [switchingConv, setSwitchingConv] = useState(false)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)
  const cmdConsumed = useRef(0)

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
        setConversations(d.conversations || [])
        setActiveConversationId(d.conversation_id ?? null)
        setState({ loading: false, error: null })
      })
      .catch(() => {
        if (cancelled) return
        setState({ loading: false, error: 'Could not load your coach. Refresh the page.' })
      })
    return () => { cancelled = true }
  }, [])

  async function switchConversation(targetId) {
    if (targetId === activeConversationId || sending || switchingConv) return
    setSwitchingConv(true)
    setSendError(null)
    try {
      const r = await fetch(`/chat/state?conversation_id=${targetId}`, { credentials: 'include' })
      if (!r.ok) throw new Error('switch failed')
      const d = await r.json()
      setMessages(d.messages || [])
      setActiveConversationId(d.conversation_id ?? targetId)
      setConversations(d.conversations || conversations)
      setAvailableSources(d.sources || availableSources)
    } catch {
      setSendError("Couldn't load that conversation. Try again.")
    } finally {
      setSwitchingConv(false)
    }
  }

  async function deleteConversation(targetId) {
    if (sending) return
    try {
      const r = await fetch(`/chat/conversations/${targetId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!r.ok) return
      const d = await r.json()
      const next = d.conversations || conversations.filter(c => c.id !== targetId)
      setConversations(next)
      // If we deleted the active conversation, switch to the next one
      // (most recent) or clear if none left.
      if (targetId === activeConversationId) {
        if (next.length > 0) {
          await switchConversation(next[0].id)
        } else {
          setActiveConversationId(null)
          setMessages([])
        }
      }
    } catch {}
  }

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
        body: JSON.stringify({
          message: text,
          // Pass active conversation_id so the backend writes to the
          // same thread the user is viewing. Null means "use current
          // or create one" on the backend.
          conversation_id: activeConversationId,
        }),
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
      // Conversation id may have been created server-side (first send
      // from a fresh state). Conversations list is refreshed so the
      // rail picks up the new/updated title immediately.
      if (d.conversation_id) setActiveConversationId(d.conversation_id)
      if (Array.isArray(d.conversations)) setConversations(d.conversations)
    } catch (e) {
      setMessages(prev => prev.slice(0, -1))
      setSendError("Couldn't reach the coach. Check your connection and try again.")
    } finally {
      setSending(false)
      setTimeout(() => inputRef.current?.focus(), 60)
    }
  }

  async function newChat() {
    if (sending || switchingConv) return
    try {
      const r = await fetch('/chat/new', { method: 'POST', credentials: 'include' })
      if (!r.ok) return
      const d = await r.json()
      setActiveConversationId(d.conversation_id ?? null)
      setMessages([])
      setSendError(null)
      if (Array.isArray(d.conversations)) setConversations(d.conversations)
      setTimeout(() => inputRef.current?.focus(), 80)
    } catch {}
  }

  // Report conversation state up so the sidebar Chat group stays in sync.
  // Skipped while loading so the sidebar never flickers to an empty list.
  useEffect(() => {
    if (state.loading) return
    onChatState?.({ conversations, activeConversationId })
  }, [conversations, activeConversationId, state.loading])  // eslint-disable-line react-hooks/exhaustive-deps

  // Commands dispatched from the sidebar (open a recent chat / new chat).
  // Runs after hydrate (state.loading false) so it never races the mount
  // fetch, and once per nonce so it does not re-fire on re-render.
  useEffect(() => {
    if (state.loading || !chatNonce || cmdConsumed.current === chatNonce) return
    cmdConsumed.current = chatNonce
    if (chatMode === 'open' && chatTargetId != null && chatTargetId !== activeConversationId) {
      switchConversation(chatTargetId)
    } else if (chatMode === 'new') {
      newChat()
    }
  }, [state.loading, chatNonce])  // eslint-disable-line react-hooks/exhaustive-deps

  /* ─── Composer. One raised surface: textarea, then a quiet utility row.
         The send button is the only red on the page. Disabled state is
         neutral, never washed red. ──────────────────────────────────── */
  const isOff = sending || outOfMessages || input.trim().length === 0
  const [composerFocus, setComposerFocus] = useState(false)
  const composerForm = (
    <form
      onSubmit={(e) => { e.preventDefault(); send() }}
      style={{
        display: 'flex', flexDirection: 'column',
        background: C.raised,
        border: `1px solid ${composerFocus ? C.hairStrong : C.hair}`,
        borderRadius: 16, padding: '16px 16px 12px 20px',
        boxShadow: composerFocus
          ? '0 0 0 4px rgba(255,255,255,0.025), 0 10px 30px -12px rgba(0,0,0,0.5)'
          : '0 6px 22px -14px rgba(0,0,0,0.5)',
        transition: `border-color 200ms ${C.spring}, box-shadow 200ms ${C.spring}`,
      }}
    >
      <textarea
        ref={inputRef}
        className="ytg-chat-textarea"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onFocus={() => setComposerFocus(true)}
        onBlur={() => setComposerFocus(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            send()
          }
        }}
        disabled={sending || outOfMessages}
        rows={1}
        placeholder={outOfMessages ? 'You have used all your messages this month' : 'How can I help you grow?'}
        style={{
          width: '100%',
          border: 'none', outline: 'none', background: 'transparent',
          fontFamily: FONT_STACK,
          fontSize: 15.5, fontWeight: 400, color: C.t1,
          letterSpacing: '-0.011em', lineHeight: 1.5,
          resize: 'none', maxHeight: 172,
          paddingTop: 2, paddingBottom: 2,
        }}
        onInput={(e) => {
          e.target.style.height = 'auto'
          e.target.style.height = Math.min(e.target.scrollHeight, 168) + 'px'
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 10 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
          {allowance > 0 && (
            <span style={{
              fontSize: 12, color: C.t4, fontWeight: 400,
              fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.005em',
            }}>
              {remaining} {remaining === 1 ? 'message left' : 'messages left'}
            </span>
          )}
          <button
            type="submit"
            disabled={isOff}
            aria-label="Send message"
            style={{
              flexShrink: 0,
              width: 38, height: 38, borderRadius: 999,
              border: 'none',
              background: isOff ? 'rgba(255,255,255,0.05)' : C.red,
              color: isOff ? C.t5 : '#fff',
              cursor: isOff ? 'default' : 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              transition: `background 160ms ${C.spring}, filter 160ms ${C.spring}, transform 160ms ${C.spring}`,
            }}
            onMouseEnter={e => { if (!isOff) { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.transform = 'scale(1.05)' } }}
            onMouseLeave={e => { if (!isOff) { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'scale(1)' } }}
          >
            <Send size={15} strokeWidth={2.1} />
          </button>
        </div>
      </div>
    </form>
  )

  const errorBanner = sendError && (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      marginBottom: 12,
      background: 'rgba(229,37,27,0.09)',
      border: `1px solid rgba(229,37,27,0.22)`,
      borderRadius: 12, padding: '10px 14px',
    }}>
      <p style={{ fontSize: 13, color: C.redText, fontWeight: 400, flex: 1, lineHeight: 1.5, letterSpacing: '-0.005em' }}>
        {sendError}
      </p>
      {outOfMessages && (
        <button
          type="button"
          onClick={() => onNavigate?.('Settings')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '7px 13px', borderRadius: 10,
            border: 'none', cursor: 'pointer',
            background: C.red, color: '#fff',
            fontFamily: 'inherit', fontSize: 12, fontWeight: 500, letterSpacing: '-0.01em',
            flexShrink: 0, transition: `filter 140ms ${C.spring}`,
          }}
          onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.08)'}
          onMouseLeave={e => e.currentTarget.style.filter = 'none'}
        >
          Upgrade
          <ArrowRight size={12} strokeWidth={2.2} />
        </button>
      )}
    </div>
  )

  return (
    <div style={{
      // NOT a card. The dark area bleeds out of the shell's content
      // padding (36/40/72, set by Dashboard — not edited here) so it
      // fills the whole region under the light topbar edge to edge. No
      // radius, no shadow, no float. The remaining light topbar goes
      // away properly when the shell itself goes dark (next phase).
      margin: '-36px -40px -72px -40px',
      height: 'calc(100vh - 52px)', minHeight: 540,
      display: 'flex', flexDirection: 'column',
      fontFamily: FONT_STACK, color: C.t1,
      background: C.base,
      overflow: 'hidden',
      position: 'relative',
    }}>
      {!state.loading && !state.error && messages.length > 0 && (
        <button
          type="button"
          onClick={newChat}
          aria-label="New chat"
          title="New chat"
          style={{
            position: 'absolute', top: 14, right: 18, zIndex: 5,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, borderRadius: 9,
            border: `1px solid ${C.hair}`, background: C.base, cursor: 'pointer',
            color: C.t3,
            transition: `color 140ms ${C.spring}, border-color 140ms ${C.spring}`,
          }}
          onMouseEnter={e => { e.currentTarget.style.color = C.t1; e.currentTarget.style.borderColor = C.hairStrong }}
          onMouseLeave={e => { e.currentTarget.style.color = C.t3; e.currentTarget.style.borderColor = C.hair }}
        >
          <SquarePen size={16} strokeWidth={1.9} />
        </button>
      )}
      {state.loading ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            width: 22, height: 22, marginBottom: 14,
            border: `2px solid rgba(255,255,255,0.08)`,
            borderTop: `2px solid ${C.t2}`,
            borderRadius: '50%', animation: 'spin 0.8s linear infinite',
          }}/>
          <p style={{ fontSize: 13, color: C.t4, fontWeight: 400, letterSpacing: '-0.005em' }}>
            Loading your coach
          </p>
        </div>
      ) : state.error ? (
        <div style={{
          margin: 'auto', maxWidth: 420,
          background: 'rgba(229,37,27,0.09)', border: `1px solid rgba(229,37,27,0.22)`,
          borderRadius: 12, padding: '14px 18px',
        }}>
          <p style={{ fontSize: 13.5, color: C.redText, fontWeight: 400, letterSpacing: '-0.005em' }}>
            {state.error}
          </p>
        </div>
      ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
            {messages.length === 0 ? (
              /* ── Empty state. Calm centred composition, composer just
                    below true centre. No page header. ──────────────── */
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '32px 32px 104px',
              }}>
                <div style={{ width: '100%', maxWidth: 680, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <p className="ytg-fade-up" style={{
                    fontSize: 30, fontWeight: 600, color: '#f4f4f5',
                    letterSpacing: '-0.022em', lineHeight: 1.15,
                    textAlign: 'center', margin: '0 0 9px',
                    animation: `ytgFadeUp 0.45s ${C.spring} both`, animationDelay: '40ms',
                  }}>Where should we start?</p>
                  <p className="ytg-fade-up" style={{
                    fontSize: 14.5, fontWeight: 400, color: C.t3,
                    letterSpacing: '-0.005em', lineHeight: 1.5,
                    textAlign: 'center', margin: '0 0 30px',
                    animation: `ytgFadeUp 0.45s ${C.spring} both`, animationDelay: '70ms',
                  }}>Ask anything about growing your channel — views, titles, thumbnails, ideas.</p>

                  <div className="ytg-fade-up" style={{
                    width: '100%',
                    animation: `ytgFadeUp 0.45s ${C.spring} both`, animationDelay: '110ms',
                  }}>
                    {errorBanner}
                    {composerForm}
                  </div>

                  <p className="ytg-fade-up" style={{
                    alignSelf: 'center', textAlign: 'center',
                    fontSize: 11, fontWeight: 600, color: C.t4,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    margin: '28px 0 14px',
                    animation: `ytgFadeUp 0.45s ${C.spring} both`, animationDelay: '160ms',
                  }}>Try asking</p>
                  <div className="ytg-fade-up" style={{
                    display: 'flex', flexWrap: 'wrap', gap: 8,
                    width: '100%', justifyContent: 'center',
                    animation: `ytgFadeUp 0.45s ${C.spring} both`, animationDelay: '180ms',
                  }}>
                    {STARTER_PROMPTS.map((p, i) => {
                      const Icon = p.Icon
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => send(p.label)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 7,
                            padding: '9px 16px', borderRadius: 999,
                            background: 'rgba(255,255,255,0.025)',
                            border: `1px solid ${C.hair}`,
                            color: C.t3, fontFamily: 'inherit',
                            fontSize: 12.5, fontWeight: 400, letterSpacing: '-0.005em',
                            cursor: 'pointer', whiteSpace: 'nowrap',
                            transition: `background 160ms ${C.spring}, border-color 160ms ${C.spring}, color 160ms ${C.spring}, transform 160ms ${C.spring}`,
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = C.raised
                            e.currentTarget.style.borderColor = C.hairStrong
                            e.currentTarget.style.color = C.t1
                            e.currentTarget.style.transform = 'translateY(-1px)'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.025)'
                            e.currentTarget.style.borderColor = C.hair
                            e.currentTarget.style.color = C.t3
                            e.currentTarget.style.transform = 'translateY(0)'
                          }}
                        >
                          <Icon size={14} strokeWidth={1.8} color={C.t5} />
                          {p.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* ── Active conversation. Messages flow from the top;
                    composer docked at the bottom. ──────────────────── */
              <>
                <div
                  ref={scrollRef}
                  className="ytg-chat-scroll"
                  style={{
                    flex: 1, overflowY: 'auto',
                    padding: '28px 8px 28px',
                    scrollBehavior: 'smooth',
                    display: 'flex', flexDirection: 'column',
                  }}
                >
                  <div className="ytg-fade-up" style={{
                    display: 'flex', flexDirection: 'column', gap: 30,
                    maxWidth: 820, width: '100%', margin: '0 auto', padding: '0 24px',
                    animation: `ytgFadeUp 0.4s ${C.spring} both`,
                  }}>
                    {messages.map((m, i) => (
                      <Message key={i} role={m.role} content={m.content} sources={m.sources} />
                    ))}
                    {sending && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 13 }}>
                        <Avatar />
                        <div style={{
                          flex: 1, minWidth: 0, paddingTop: 4,
                          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                        }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            <Dot delay="0s"/><Dot delay="0.15s"/><Dot delay="0.3s"/>
                          </span>
                          {availableSources.length > 0 && (
                            <span style={{ fontSize: 12.5, color: C.t4, fontWeight: 400, letterSpacing: '-0.005em' }}>
                              Reading {availableSources.slice(0, 3).join(', ')}
                              {availableSources.length > 3 ? `, +${availableSources.length - 3} more` : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ flexShrink: 0, padding: '12px 8px 18px' }}>
                  <div style={{ maxWidth: 820, width: '100%', margin: '0 auto', padding: '0 24px' }}>
                    {errorBanner}
                    {composerForm}
                  </div>
                </div>
              </>
            )}
          </div>
      )}
    </div>
  )
}


/* ─── Assistant mark. Quiet raised circle, neutral icon. ──────────── */
function Avatar() {
  return (
    <span style={{
      flexShrink: 0,
      width: 28, height: 28, borderRadius: 8,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      background: C.raised, border: `1px solid ${C.hair}`, color: C.t3,
    }}>
      <Sparkles size={15} strokeWidth={1.8} />
    </span>
  )
}

/* ─── A turn. Assistant text sits directly on the surface (no bubble).
       User text is a quiet neutral chip — never red. ───────────────── */
function Message({ role, content, sources }) {
  if (role === 'user') {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{
          maxWidth: '76%',
          background: C.raised,
          border: `1px solid ${C.hair}`,
          color: C.t1,
          borderRadius: '14px 14px 4px 14px',
          padding: '12px 16px',
          fontFamily: FONT_STACK,
          fontSize: 15, fontWeight: 400, letterSpacing: '-0.006em', lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
        }}>{content}</div>
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 13 }}>
      <Avatar />
      <div style={{ flex: 1, minWidth: 0, paddingTop: 3 }}>
        <AssistantBody text={content} />
        {sources && sources.length > 0 && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            marginTop: 10,
            fontSize: 11.5, color: C.t4, fontWeight: 400, letterSpacing: '-0.005em',
          }}>
            <Database size={11} strokeWidth={1.7} />
            <span>{sources.join('  ·  ')}</span>
          </div>
        )}
      </div>
    </div>
  )
}


/* Typing dots — neutral, no alarm colour, calm bounce. */
function Dot({ delay }) {
  return (
    <>
      <style>{`
        @keyframes ytgDotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.35 }
          40%           { transform: translateY(-3px); opacity: 0.9 }
        }
      `}</style>
      <span style={{
        width: 5, height: 5, borderRadius: 99, background: C.t3,
        animation: `ytgDotBounce 0.9s ease-in-out infinite`, animationDelay: delay,
      }}/>
    </>
  )
}
