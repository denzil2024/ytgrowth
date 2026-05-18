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
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Sparkles,         // Per-message assistant avatar (reads as "AI" clearly)
  Database,         // Source pill on assistant replies
  Send,             // Composer send button
  SquarePen,        // "New chat" icon — the ChatGPT/Linear compose glyph,
                    // reads as "start fresh" not "generic add"
  ArrowRight,       // Upgrade CTA glyph
  Plus,             // Composer toolbar affordance (focuses the input)
  X,                // Delete icon on conversation rows
  // Starter-pill icons. Eight quick options, wrap layout.
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  ImageIcon,
  Lightbulb,
  Type,
  GitCompare,
  Search,
} from 'lucide-react'

// Page-scoped Geist load. Geist Variable (Vercel's open-source UI typeface)
// is the chosen face for this redesigned surface. Inter — the default
// startup font — was reverted to once during the iteration, but Geist
// sits cleaner on the structural moves we made (glass composer, centered
// hero, light-weight headings) and Geist Mono gives us premium tabular
// figures on the meter and any inline code in markdown messages.
if (typeof document !== 'undefined' && !document.getElementById('ytg-chat-geist-font')) {
  const link = document.createElement('link')
  link.id = 'ytg-chat-geist-font'
  link.rel = 'stylesheet'
  link.href = 'https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@400..700&display=swap'
  document.head.appendChild(link)
}

// Custom scrollbar — thin, near-invisible, no default chevrons.
if (typeof document !== 'undefined' && !document.getElementById('ytg-chat-scrollbar')) {
  const s = document.createElement('style')
  s.id = 'ytg-chat-scrollbar'
  s.textContent = `
    .ytg-chat-scroll {
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.10) transparent;
    }
    .ytg-chat-scroll::-webkit-scrollbar { width: 5px; height: 5px }
    .ytg-chat-scroll::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.10);
      border-radius: 99px;
    }
    .ytg-chat-scroll::-webkit-scrollbar-thumb:hover {
      background: rgba(255,255,255,0.18);
    }
    .ytg-chat-scroll::-webkit-scrollbar-track,
    .ytg-chat-scroll::-webkit-scrollbar-button {
      background: transparent;
      display: none;
    }
    .ytg-chat-textarea::placeholder {
      color: rgba(255,255,255,0.22);
    }
    @keyframes ytgPulseSoft {
      0%, 100% { opacity: 0.55 }
      50%      { opacity: 1    }
    }
    @keyframes ytgFadeUp {
      from { opacity: 0; transform: translateY(10px) }
      to   { opacity: 1; transform: none }
    }
    @media (prefers-reduced-motion: reduce) {
      .ytg-fade-up { animation: none !important }
    }
    /* Markdown list markers. react-markdown v10 dropped the per-li
       'ordered' prop, so we infer from the parent class: ul = bullet,
       ol = counter. Marker sits in the 22px left-pad gutter of each li
       and uses tabular numerals so ordered markers line up cleanly. */
    .md-list-ul > li::before {
      content: '•';
      position: absolute; left: 6px; top: 0;
      font-size: 14.5px; font-weight: 600;
      color: rgba(255,255,255,0.40);
      line-height: inherit;
    }
    .md-list-ol > li {
      counter-increment: mdlist;
    }
    .md-list-ol > li::before {
      content: counter(mdlist) '.';
      position: absolute; left: 0; top: 0;
      font-size: 13.5px; font-weight: 600;
      color: rgba(255,255,255,0.40);
      font-variant-numeric: tabular-nums;
      line-height: inherit;
    }
  `
  document.head.appendChild(s)
}

const FONT_STACK = "'Geist', 'Inter', system-ui, -apple-system, sans-serif"
const FONT_MONO  = "'Geist Mono', ui-monospace, SFMono-Regular, monospace"

/* ─── Neutral dark palette (experiment). Two surfaces (page base + raised
       cards) + an elevated step, light text stack, brand red as the only
       saturated colour and only on CTAs / active / score. Hairlines are
       white alpha so they sit ON the dark surface, barely visible, just
       enough to separate planes. ────────────────────────────────────── */
const C = {
  bg:           '#0e0e10',           // page base
  surface:      '#18181b',           // composer, pills, assistant bubble
  surfaceLift:  '#222226',           // hover / elevated raised elements
  hair:         'rgba(255,255,255,0.08)',
  hairActive:   'rgba(255,255,255,0.16)',
  text1:        '#f4f4f5',
  text2:        '#71717a',
  text3:        '#3f3f46',
  text4:        '#3f3f46',
  red:          '#e5251b',
  redHi:        '#ef3a31',
  redLo:        '#c81d14',
  redSoft:      'rgba(229,37,27,0.12)',
  redBdr:       'rgba(229,37,27,0.30)',
  // Single dark elevation shadow used across every raised surface so the
  // elevation system reads coherent. The light-mode inner-white-highlight
  // trick is dropped (it reads as a seam on dark).
  cardShadow:     '0 1px 3px rgba(0,0,0,0.4)',
  cardShadowLift: '0 6px 20px rgba(0,0,0,0.55)',
  spring:         'cubic-bezier(0.32, 0.72, 0, 1)',
}

/* ─── Eight starter pills. Short option labels, semantic icon, wrap
       layout. Click sends the label straight through the pipeline. ─── */
const STARTER_PROMPTS = [
  { label: 'Get more views',      Icon: TrendingUp   },
  { label: 'Fix my CTR',          Icon: TrendingDown },
  { label: 'Channel audit',       Icon: CheckCircle2 },
  { label: 'Thumbnail tips',      Icon: ImageIcon    },
  { label: 'Video ideas',         Icon: Lightbulb    },
  { label: 'Better titles',       Icon: Type         },
  { label: 'Compare a competitor', Icon: GitCompare  },
  { label: 'Find keywords',       Icon: Search       },
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

/* Assistant prose. Renders markdown via react-markdown + GFM. Each
   element is styled to match the design system: charcoal text, Inter
   weights tuned for legibility, lists with proper hanging indents,
   inline code in tinted background, blockquotes with a left rail.
   Bold is the visual emphasis (italics retire per design system). */
function AssistantBody({ text }) {
  return (
    <div style={{
      // Tuned for Geist: 450 reads confident on Geist's geometric forms
      // where the same weight on Inter would look thin. Tracking pulled
      // in slightly because Geist runs a hair narrower than Inter.
      fontSize: 14.5, fontWeight: 400, color: '#e4e4e7',
      letterSpacing: '-0.005em', lineHeight: 1.75,
    }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={MARKDOWN_COMPONENTS}
      >
        {text || ''}
      </ReactMarkdown>
    </div>
  )
}

/* Markdown component overrides. Each element renders inline so the
   surrounding bubble padding controls outer spacing; component-internal
   spacing is tight. */
const MARKDOWN_COMPONENTS = {
  // Paragraphs: tight margin between, none on first / last.
  p: ({ children }) => (
    <p style={{
      margin: '0 0 10px 0',
      fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit',
      letterSpacing: 'inherit', lineHeight: 'inherit',
    }}>{children}</p>
  ),
  // Bold: weight bumps to 700 (a real beat heavier than the 500 body)
  // so emphasis lands without italics (italics are retired in our system).
  strong: ({ children }) => (
    <strong style={{ fontWeight: 600, color: C.text1 }}>{children}</strong>
  ),
  // Italics map to bold + subtle color shift so the reader still senses
  // emphasis without using a font style we've banned in the system.
  em: ({ children }) => (
    <span style={{ fontWeight: 600, color: C.text1 }}>{children}</span>
  ),
  // Bullet list. Class drives the ::before marker (CSS) so we don't need
  // react-markdown to pass an ordered prop (it dropped that in v10).
  ul: ({ children }) => (
    <ul className="md-list-ul" style={{
      margin: '6px 0 12px 0',
      padding: 0,
      listStyle: 'none',
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>{children}</ul>
  ),
  // Ordered list. counter-reset on the OL, counter-increment + content
  // happen on the li via CSS.
  ol: ({ children }) => (
    <ol className="md-list-ol" style={{
      margin: '6px 0 12px 0',
      padding: 0,
      listStyle: 'none',
      counterReset: 'mdlist',
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>{children}</ol>
  ),
  li: ({ children }) => (
    <li style={{
      position: 'relative',
      paddingLeft: 22,
    }}>{children}</li>
  ),
  // Inline code. Soft tinted background, monospace stack, tight padding.
  code: ({ inline, children }) => {
    if (inline === false) {
      return (
        <pre style={{
          margin: '8px 0 12px 0',
          padding: '12px 14px',
          background: 'rgba(255,255,255,0.05)',
          border: `1px solid ${C.hair}`,
          borderRadius: 10,
          fontSize: 13, fontFamily: FONT_MONO,
          lineHeight: 1.55, color: C.text1,
          overflow: 'auto',
        }}><code>{children}</code></pre>
      )
    }
    return (
      <code style={{
        background: 'rgba(255,255,255,0.06)',
        padding: '1.5px 5px',
        borderRadius: 4,
        fontSize: '0.92em', fontFamily: FONT_MONO,
        color: C.text1,
      }}>{children}</code>
    )
  },
  // Blockquote. Charcoal left rail, slightly muted text. Used when the
  // assistant cites a stat directly.
  blockquote: ({ children }) => (
    <blockquote style={{
      margin: '8px 0 12px 0',
      padding: '4px 0 4px 14px',
      borderLeft: `2px solid rgba(255,255,255,0.18)`,
      color: C.text2,
      fontWeight: 500,
    }}>{children}</blockquote>
  ),
  // Headings. Three levels max; h3+ collapse to h3. Bold weight, slight
  // top margin so they break sections cleanly.
  h1: ({ children }) => (
    <h3 style={{
      margin: '16px 0 8px 0', fontSize: 15, fontWeight: 700, color: C.text1,
      letterSpacing: '-0.015em', lineHeight: 1.3,
    }}>{children}</h3>
  ),
  h2: ({ children }) => (
    <h3 style={{
      margin: '16px 0 8px 0', fontSize: 15, fontWeight: 700, color: C.text1,
      letterSpacing: '-0.015em', lineHeight: 1.3,
    }}>{children}</h3>
  ),
  h3: ({ children }) => (
    <h3 style={{
      margin: '16px 0 8px 0', fontSize: 15, fontWeight: 700, color: C.text1,
      letterSpacing: '-0.01em', lineHeight: 1.3,
    }}>{children}</h3>
  ),
  // Links. Brand red, no underline at rest, underline on hover.
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer"
      style={{
        color: C.red, textDecoration: 'none', fontWeight: 600,
        borderBottom: `1px solid rgba(229,37,27,0.20)`,
      }}>{children}</a>
  ),
  // Horizontal rule. Hairline, generous breathing room.
  hr: () => (
    <hr style={{
      margin: '14px 0', border: 'none',
      height: 1, background: C.hair,
    }}/>
  ),
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
  // Conversation history. activeConversationId === null when the user
  // has no conversations yet (truly first-time empty state).
  const [conversations, setConversations] = useState([])
  const [activeConversationId, setActiveConversationId] = useState(null)
  const [switchingConv, setSwitchingConv] = useState(false)
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

  /* ─── Composer. Shared between empty + active states. ~60px tall min,
         rounded 16, white surface, hairline border that warms to soft red
         when focused, integrated send button. The focal element on every
         layout. ─────────────────────────────────────────────────────── */
  const isOff = sending || outOfMessages || input.trim().length === 0
  // Active = user is typing or a send is in flight. Drives the red focus
  // border + ring. Derived from existing state — no new state added.
  const composerActive = input.length > 0 || sending
  const composerForm = (
    <form
      onSubmit={(e) => { e.preventDefault(); send() }}
      style={{
        // One flat dark material. Textarea on top, a toolbar row beneath
        // it carrying the compose affordance, the remaining-count, and
        // the send button. The commanding element of the page.
        display: 'flex', flexDirection: 'column',
        background: '#111113',
        border: `1px solid ${composerActive ? 'rgba(229,37,27,0.30)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 16, padding: '14px 16px 10px 20px',
        boxShadow: composerActive ? '0 0 0 3px rgba(229,37,27,0.07)' : 'none',
        transition: `border-color 220ms ${C.spring}, box-shadow 220ms ${C.spring}`,
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
          width: '100%',
          border: 'none', outline: 'none',
          background: 'transparent',
          fontFamily: FONT_STACK,
          fontSize: 15.5, fontWeight: 400, color: C.text1,
          letterSpacing: '-0.2px', lineHeight: 1.55,
          resize: 'none',
          maxHeight: 160,
          paddingTop: 2, paddingBottom: 2,
        }}
        onInput={(e) => {
          e.target.style.height = 'auto'
          e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
        }}
      />
      {/* Toolbar row inside the composer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
        <button
          type="button"
          onClick={() => inputRef.current?.focus()}
          aria-label="Compose"
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            padding: 4, borderRadius: 6,
            border: 'none', background: 'transparent', cursor: 'pointer',
            color: '#52525b',
            transition: `color 140ms ${C.spring}`,
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#a1a1aa' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#52525b' }}
        >
          <Plus size={16} strokeWidth={2} />
        </button>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
          {allowance > 0 && (
            <span style={{
              fontSize: 12, color: '#52525b', fontWeight: 500,
              fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em',
            }}>
              {remaining} {remaining === 1 ? 'message left' : 'messages left'}
            </span>
          )}
          <button
            type="submit"
            disabled={isOff}
            aria-label="Send"
            style={{
              flexShrink: 0,
              width: 38, height: 38, borderRadius: 10,
              border: 'none',
              // Disabled state is neutral, NOT washed red (red-at-low-
              // opacity reads as cheap pink). Off but present.
              background: isOff
                ? 'rgba(255,255,255,0.06)'
                : `linear-gradient(180deg, ${C.redHi} 0%, ${C.red} 100%)`,
              color: isOff ? C.text4 : '#fff',
              cursor: isOff ? 'default' : 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: isOff
                ? '0 1px 3px rgba(0,0,0,0.4)'
                : '0 0 0 3px rgba(229,37,27,0.18), 0 2px 8px rgba(229,37,27,0.45), inset 0 1px 0 rgba(255,255,255,0.22)',
              transition: `filter 160ms ${C.spring}, transform 160ms ${C.spring}, background 200ms ${C.spring}`,
            }}
            onMouseEnter={e => { if (!isOff) { e.currentTarget.style.filter = 'brightness(1.06)'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
            onMouseLeave={e => { if (!isOff) { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)' } }}
          >
            <Send size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
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

  /* ─── Floating top-right cluster. Only renders when there's NO rail
         (true first-time empty state). Once the rail exists, the meter
         lives at the bottom of the rail instead — the ChatGPT sidebar
         pattern. Keeps usage info anchored to a real UI element rather
         than floating alone in the corner. ────────────────────────── */
  const usedPct = allowance > 0 ? Math.min(100, (used / allowance) * 100) : 0
  const meterEmpty = remaining === 0 && allowance > 0
  const showFloatingMeter = conversations.length === 0 && allowance > 0
  const topRightControls = (
    <div style={{
      position: 'absolute', top: 4, right: 2,
      display: 'flex', alignItems: 'center', gap: 8,
      zIndex: 3,
    }}>
      {showFloatingMeter && (
        <div style={{
          // The number IS the meter. A tiny bar at the trailing edge was
          // just visual noise. Status dot + count is more legible.
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: meterEmpty ? C.redSoft : 'transparent',
          border: meterEmpty ? `1px solid ${C.redBdr}` : '1px solid transparent',
          padding: '6px 14px', borderRadius: 100,
          boxShadow: meterEmpty ? C.cardShadow : 'none',
          fontVariantNumeric: 'tabular-nums',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: 99,
            background: meterEmpty ? C.red : remaining < allowance * 0.25 ? C.red : '#22c55e',
            boxShadow: meterEmpty
              ? '0 0 0 3px rgba(229,37,27,0.16)'
              : remaining < allowance * 0.25
                ? '0 0 0 3px rgba(229,37,27,0.12)'
                : '0 0 0 3px rgba(22,163,74,0.16)',
            animation: meterEmpty ? 'none' : 'ytgPulseSoft 3s ease-in-out infinite',
            flexShrink: 0,
          }}/>
          <span style={{
            fontSize: 12.5, fontWeight: 600,
            color: meterEmpty ? C.red : C.text1,
            letterSpacing: '-0.01em',
          }}>
            <span>{remaining}</span>
            <span style={{ color: C.text3, fontWeight: 500, marginLeft: 5 }}>
              {remaining === 1 ? 'message left' : 'messages left'}
            </span>
          </span>
        </div>
      )}
      {/* The floating top-right "+ New chat" is now hidden — the rail on
          the left holds the only "+ New chat" entry. We keep the meter
          chip up here because users need to see usage at all times. */}
    </div>
  )

  const hasRail = conversations.length >= 1

  return (
    <div style={{
      width: '100%', margin: 0,
      display: 'flex', flexDirection: 'column',
      // Full-bleed inside the dark app shell (the light sidebar is hidden
      // on Chat; a slim 48px dark topbar sits above). One flat dark
      // material, no page header — VidIQ-style.
      height: 'calc(100vh - 49px)',
      minHeight: 540,
      fontFamily: FONT_STACK,
      color: C.text1,
      background: '#0e0e10',
    }}>
      {state.loading ? (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 24, height: 24, marginBottom: 14,
            border: `2px solid rgba(255,255,255,0.08)`,
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
      ) : (
        /* ── Body. Rail (when conversations exist) + content column. ── */
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          {hasRail && (
            <ConversationRail
              conversations={conversations}
              activeId={activeConversationId}
              onSelect={switchConversation}
              onNew={newChat}
              onDelete={deleteConversation}
              sending={sending}
              switching={switchingConv}
              used={used}
              allowance={allowance}
              remaining={remaining}
            />
          )}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            minWidth: 0, minHeight: 0,
            paddingLeft: hasRail ? 16 : 0,
          }}>
        {messages.length === 0 ? (
        /* ── EMPTY STATE. Settled composition (the page H1 above owns the
              title): a modest prompt line, the composer as the focal
              element, then four suggestion cards. Each group fades up on
              a short stagger so it arrives with life, not blunt. ─────── */
        <div style={{
          flex: 1,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '24px 24px 80px',
          gap: 0,
        }}>
          <p className="ytg-fade-up" style={{
            fontSize: 24, fontWeight: 600, color: '#f4f4f5',
            letterSpacing: '-0.5px', lineHeight: 1.2,
            textAlign: 'center', margin: '0 0 32px',
            animation: `ytgFadeUp 0.5s ${C.spring} both`,
            animationDelay: '40ms',
          }}>Where should we start?</p>

          <div className="ytg-fade-up" style={{
            width: '100%', maxWidth: 660,
            animation: `ytgFadeUp 0.5s ${C.spring} both`,
            animationDelay: '90ms',
          }}>
            {errorBanner}
            {composerForm}
          </div>

          {/* Starter pills. Light, fast to scan, eight options in a
              centered wrap. Suite grammar: surface, hairline, soft
              shadow, spring hover-lift. Secondary to the composer. */}
          <div className="ytg-fade-up" style={{
            display: 'flex', flexWrap: 'wrap',
            gap: 8, justifyContent: 'center',
            maxWidth: 660, width: '100%', marginTop: 24,
            animation: `ytgFadeUp 0.5s ${C.spring} both`,
            animationDelay: '150ms',
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
                    padding: '8px 14px', borderRadius: 100,
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${C.hair}`,
                    boxShadow: C.cardShadow,
                    color: C.text2,
                    fontFamily: 'inherit',
                    fontSize: 12.5, fontWeight: 500, letterSpacing: '-0.005em',
                    cursor: 'pointer', whiteSpace: 'nowrap',
                    transition: `transform 200ms ${C.spring}, box-shadow 200ms ${C.spring}, border-color 200ms ${C.spring}, color 200ms ${C.spring}`,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = C.cardShadowLift
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'
                    e.currentTarget.style.color = C.text1
                    const ic = e.currentTarget.querySelector('svg')
                    if (ic) ic.style.color = C.text2
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = C.cardShadow
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                    e.currentTarget.style.borderColor = C.hair
                    e.currentTarget.style.color = C.text2
                    const ic = e.currentTarget.querySelector('svg')
                    if (ic) ic.style.color = C.text3
                  }}
                >
                  <Icon size={14} strokeWidth={1.9} color={C.text3} />
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
              padding: '24px 8px 32px',
              scrollBehavior: 'smooth',
              display: 'flex', flexDirection: 'column',
            }}
          >
            <div className="ytg-fade-up" style={{
              display: 'flex', flexDirection: 'column', gap: 24,
              maxWidth: 740, margin: '0 auto', padding: '0 16px',
              width: '100%',
              // Messages flow from the top naturally (VidIQ/Perplexity),
              // not bottom-anchored.
              animation: `ytgFadeUp 0.5s ${C.spring} both`,
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
                    background: 'linear-gradient(180deg, #1e1e24 0%, #18181c 100%)',
                    border: `1px solid rgba(255,255,255,0.08)`,
                    color: 'rgba(229,37,27,0.65)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                  }}>
                    <Sparkles size={17} strokeWidth={1.8} />
                  </span>
                  <div style={{
                    flex: 1, minWidth: 0, paddingTop: 2,
                    display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
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

          {/* Composer pinned to bottom — width matches the message column */}
          <div style={{
            padding: '12px 16px 20px',
            maxWidth: 740, width: '100%', margin: '0 auto',
          }}>
            {errorBanner}
            {composerForm}
          </div>
        </>
      )}
          </div>
        </div>
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
          maxWidth: '72%',
          background: 'linear-gradient(160deg, #ef3a31 0%, #e5251b 50%, #c81d14 100%)',
          color: '#fff',
          borderRadius: '16px 16px 4px 16px',
          padding: '11px 16px',
          boxShadow: '0 1px 2px rgba(229,37,27,0.28), inset 0 1px 0 rgba(255,255,255,0.18)',
          fontFamily: FONT_STACK,
          fontSize: 14, fontWeight: 500, letterSpacing: '-0.005em', lineHeight: 1.5,
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
        background: 'linear-gradient(180deg, #1e1e24 0%, #18181c 100%)',
        border: `1px solid rgba(255,255,255,0.08)`,
        color: 'rgba(229,37,27,0.65)',
        boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
      }}>
        <Sparkles size={17} strokeWidth={1.8} />
      </span>
      <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
        <AssistantBody text={content} />
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


/* ─── Conversation rail. Sidebar of past chats; only renders when the
       channel has at least one conversation. Top button creates a new
       conversation; each row switches to it on click; hover reveals a
       delete X. Bottom-aligned via flex-end so short lists hug the
       composer area. ─────────────────────────────────────────────── */
function ConversationRail({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  sending,
  switching,
  // Meter footer props — rail owns the meter when it's present.
  used,
  allowance,
  remaining,
}) {
  const groups = groupConversationsByRecency(conversations)
  const meterEmpty = remaining === 0 && allowance > 0
  const meterLow   = remaining > 0 && remaining < allowance * 0.25
  const dotColor   = meterEmpty ? C.red : meterLow ? C.red : '#22c55e'
  return (
    <aside style={{
      width: 220,
      flexShrink: 0,
      display: 'flex', flexDirection: 'column',
      paddingRight: 12,
      background: '#080809',
      boxShadow: '1px 0 0 rgba(255,255,255,0.04)',
      minHeight: 0,
    }}>
      {/* New chat — its own affordance, not row zero of the list. Quiet
          surface pill (hairline + soft card elevation) so it reads as
          "the action" and the list below can be pure titles. */}
      <button
        type="button"
        onClick={onNew}
        disabled={sending || switching}
        style={{
          display: 'flex', alignItems: 'center', gap: 9,
          width: '100%',
          padding: '9px 12px',
          marginBottom: 16,
          background: '#111113',
          border: `1px solid rgba(255,255,255,0.08)`,
          boxShadow: C.cardShadow,
          color: '#a1a1aa',
          fontFamily: 'inherit',
          fontSize: 13, fontWeight: 500, letterSpacing: '-0.01em',
          cursor: sending || switching ? 'default' : 'pointer',
          borderRadius: 10,
          textAlign: 'left',
          transition: `border-color 140ms ${C.spring}, box-shadow 140ms ${C.spring}`,
        }}
        onMouseEnter={e => { if (!(sending || switching)) { e.currentTarget.style.borderColor = C.hairActive; e.currentTarget.style.boxShadow = C.cardShadowLift } }}
        onMouseLeave={e => { if (!(sending || switching)) { e.currentTarget.style.borderColor = C.hair; e.currentTarget.style.boxShadow = C.cardShadow } }}
      >
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, width: 18, height: 18,
          color: C.text2,
        }}>
          <SquarePen size={14} strokeWidth={1.9} />
        </span>
        New chat
      </button>

      {/* Conversation list, grouped by date */}
      <div className="ytg-chat-scroll" style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden',
        paddingRight: 4,
        minHeight: 0,
      }}>
        {groups.map(group => (
          <div key={group.label} style={{ marginBottom: 16 }}>
            <p style={{
              fontSize: 11, fontWeight: 600, color: '#3f3f46',
              letterSpacing: '0.06em', textTransform: 'uppercase',
              margin: '0 0 6px 12px',
            }}>{group.label}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {group.items.map(c => (
                <ConversationRow
                  key={c.id}
                  conversation={c}
                  active={c.id === activeId}
                  onSelect={() => onSelect(c.id)}
                  onDelete={() => onDelete(c.id)}
                  switching={switching}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Meter footer. Lives at the bottom of the rail (ChatGPT-style
          sidebar pattern). Hairline divider above sets it off from the
          scrolling conversation list. The full pill is built inline so
          its anchor is locked to the rail bottom, not floating in the
          page corner without context. */}
      {allowance > 0 && (
        <div style={{
          marginTop: 10, paddingTop: 12,
          borderTop: `1px solid ${C.hair}`,
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '7px 12px 7px 11px', borderRadius: 100,
            background: meterEmpty ? C.redSoft : 'transparent',
            border: meterEmpty ? `1px solid ${C.redBdr}` : '1px solid transparent',
            fontVariantNumeric: 'tabular-nums',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: 99,
              background: dotColor,
              boxShadow: `0 0 0 3px ${dotColor === C.red ? 'rgba(229,37,27,0.14)' : 'rgba(22,163,74,0.14)'}`,
              animation: meterEmpty ? 'none' : 'ytgPulseSoft 3s ease-in-out infinite',
              flexShrink: 0,
            }}/>
            <span style={{
              fontSize: 12, fontWeight: 600,
              color: meterEmpty ? C.red : C.text1,
              letterSpacing: '-0.01em',
            }}>
              <span>{remaining}</span>
              <span style={{ color: C.text3, fontWeight: 500, marginLeft: 5 }}>
                {remaining === 1 ? 'message left' : 'messages left'}
              </span>
            </span>
          </div>
        </div>
      )}
    </aside>
  )
}

function ConversationRow({ conversation, active, onSelect, onDelete, switching }) {
  const [hover, setHover] = useState(false)
  const title = conversation.title || 'New chat'
  // Active = subtle background tint (no border, no shadow — was reading
  // as a card; should read as a list selection). Hover = even lighter
  // tint. Inactive = transparent so the list breathes.
  const bg = active
    ? 'rgba(255,255,255,0.06)'
    : hover
      ? 'rgba(255,255,255,0.035)'
      : 'transparent'
  return (
    <div
      onClick={active || switching ? undefined : onSelect}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        display: 'flex', alignItems: 'center', gap: 9,
        padding: '7px 10px 7px 12px',
        borderRadius: 8,
        background: bg,
        cursor: active || switching ? 'default' : 'pointer',
        transition: `background 140ms ${C.spring}`,
      }}
    >
      {active && (
        <span aria-hidden style={{
          position: 'absolute', left: 0, top: 6, bottom: 6,
          width: 2, borderRadius: 2, background: C.red,
        }}/>
      )}
      <span style={{
        flex: 1, minWidth: 0,
        fontSize: 13, fontWeight: active ? 600 : 400,
        color: active ? '#f4f4f5' : '#71717a',
        letterSpacing: '-0.01em',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{title}</span>
      {hover && !active && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          aria-label="Delete conversation"
          title="Delete"
          style={{
            flexShrink: 0,
            width: 22, height: 22, borderRadius: 6,
            border: 'none', background: 'transparent',
            color: C.text3,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            transition: `background 140ms ${C.spring}, color 140ms ${C.spring}`,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(229,37,27,0.08)'; e.currentTarget.style.color = C.red }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.text3 }}
        >
          <X size={12} strokeWidth={2} />
        </button>
      )}
    </div>
  )
}

function groupConversationsByRecency(conversations) {
  const now = Date.now()
  const DAY = 86400_000
  const buckets = { today: [], yesterday: [], week: [], older: [] }
  for (const c of conversations) {
    const t = c.last_message_at ? new Date(c.last_message_at).getTime() : 0
    const age = now - t
    if (age < DAY)       buckets.today.push(c)
    else if (age < 2*DAY) buckets.yesterday.push(c)
    else if (age < 7*DAY) buckets.week.push(c)
    else                  buckets.older.push(c)
  }
  const out = []
  if (buckets.today.length)     out.push({ label: 'Today',         items: buckets.today })
  if (buckets.yesterday.length) out.push({ label: 'Yesterday',     items: buckets.yesterday })
  if (buckets.week.length)      out.push({ label: 'Last 7 days',   items: buckets.week })
  if (buckets.older.length)     out.push({ label: 'Older',         items: buckets.older })
  return out
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
