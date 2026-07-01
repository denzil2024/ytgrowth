import { useEffect, useMemo, useState } from 'react'
import LandingFooter from '../../components/LandingFooter'
import SiteHeader from '../../components/SiteHeader'
import FaqSchema from '../../components/FaqSchema'

/* ─── Free tool: YouTube Tag Generator ─────────────────────────────────────
   /tools/youtube-tag-generator. Generates relevant tags client-side (zero
   API), trimmed to YouTube's 500-char cap. Migrated to the editorial design
   language; stacked layout (input bar on top, results panel below) because
   tag chips wrap best full-width. All logic + content preserved.
   See project_design_language_editorial. */

const SERIF = "'Fraunces', Georgia, serif"
const SANS  = "'Barlow', system-ui, sans-serif"

const SUFFIXES = ['tutorial', '2026', 'tips', 'for beginners', 'guide', 'explained', 'review', 'step by step', 'tricks', 'hacks', 'basics', 'full guide', 'how to', 'tutorial 2026']
const PREFIXES = ['how to', 'best', 'easy', 'free']
const TAG_LIMIT = 500

function generateTags(topic) {
  const t = topic.trim().toLowerCase().replace(/\s+/g, ' ')
  if (!t) return []
  const words = t.split(' ').filter((w) => w.length > 2)
  const raw = [t]
  if (words.length > 1) words.forEach((w) => raw.push(w))
  SUFFIXES.forEach((s) => raw.push(`${t} ${s}`))
  PREFIXES.forEach((p) => raw.push(`${p} ${t}`))
  if (words.length > 1) {
    raw.push(`${words[0]} tutorial`)
    raw.push(`${words[0]} tips`)
  }
  const seen = new Set()
  const tags = []
  let len = 0
  for (const r of raw) {
    const tag = r.trim()
    if (!tag || seen.has(tag)) continue
    const add = (tags.length ? 2 : 0) + tag.length
    if (len + add > TAG_LIMIT) break
    seen.add(tag)
    tags.push(tag)
    len += add
  }
  return tags
}

function useBreakpoint() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280)
  useEffect(() => {
    const h = () => setW(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return { isMobile: w <= 768 }
}

function useGlobalStyles() {
  useEffect(() => {
    if (document.getElementById('tag-styles')) return
    const style = document.createElement('style')
    style.id = 'tag-styles'
    style.textContent = `
      :root {
        --yte-bg: #f6f4ef; --yte-bg-2: #efece4; --yte-surface: #ffffff;
        --yte-ink: #14130f; --yte-soft: #5c574e; --yte-muted: #8a8378;
        --yte-line: rgba(20,19,15,0.12); --yte-line-2: rgba(20,19,15,0.22);
        --yte-accent: #e5302a; --yte-accent-soft: rgba(229,48,42,0.07); --yte-dark: #0d0d12;
      }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; scroll-padding-top: 84px; }
      body { background: var(--yte-bg); color: var(--yte-ink); font-family: ${SANS}; overflow-x: hidden; -webkit-font-smoothing: antialiased; }
      @keyframes tagFadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }

      .tag-wrap { max-width: 920px; margin: 0 auto; }
      .tag-eyebrow { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 22px; }
      .tag-eyebrow-rule { width: 26px; height: 1px; background: var(--yte-accent); }
      .tag-eyebrow-text { font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-accent); text-transform: uppercase; letter-spacing: 0.18em; }
      .tag-h1 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.04; }
      .tag-h1 em { font-style: italic; color: var(--yte-accent); }
      .tag-h2 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.08; }
      .tag-h2 em { font-style: italic; color: var(--yte-accent); }
      .tag-lead { font-family: ${SANS}; color: var(--yte-soft); line-height: 1.75; }

      .tag-label { display: block; font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-muted); text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 9px; }
      .tag-input { width: 100%; padding: 14px 15px; font-size: 16px; font-weight: 500; font-family: ${SANS}; color: var(--yte-ink); background: var(--yte-bg); border: 1px solid var(--yte-line); border-radius: 0; outline: none; transition: border-color 0.15s, background 0.15s; -webkit-appearance: none; }
      .tag-input:focus { border-color: var(--yte-accent); background: #fff; }

      .tag-card { background: var(--yte-surface); border: 1px solid var(--yte-line); padding: 28px; }
      .tag-out { background: var(--yte-ink); padding: 26px; color: #fff; }
      .tag-chip { display: inline-flex; align-items: center; gap: 8px; font-family: ${SANS}; font-size: 13.5px; font-weight: 500; color: #fff; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.14); padding: 7px 8px 7px 13px; }
      .tag-chip button { background: none; border: none; color: rgba(255,255,255,0.55); font-size: 16px; line-height: 1; cursor: pointer; padding: 0 2px; transition: color 0.15s; }
      .tag-chip button:hover { color: #fff; }
      .tag-copy { font-family: ${SANS}; font-size: 11.5px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; border: 1px solid rgba(255,255,255,0.22); background: transparent; color: #fff; padding: 6px 14px; cursor: pointer; transition: background 0.15s; }
      .tag-copy:hover { background: rgba(255,255,255,0.1); }
      .tag-copy:disabled { opacity: 0.4; cursor: not-allowed; }

      .tag-grow-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--yte-line); border: 1px solid var(--yte-line); }
      @media (max-width: 760px) { .tag-grow-grid { grid-template-columns: 1fr; } }
      .tag-grow-card { display: block; text-decoration: none; background: var(--yte-surface); padding: 28px; transition: background 0.15s; }
      .tag-grow-card:hover { background: var(--yte-bg-2); }

      .tag-faq-answer { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease; }
      .tag-faq-answer.open { grid-template-rows: 1fr; opacity: 1; }
      .tag-faq-answer-inner { overflow: hidden; }

      @media (max-width: 768px) { .tag-section-pad { padding-left: 22px !important; padding-right: 22px !important; } .tag-cta-pad { padding: 76px 24px !important; } }
    `
    document.head.appendChild(style)
  }, [])
}

function Eyebrow({ children }) {
  return (
    <div className="tag-eyebrow">
      <span aria-hidden="true" className="tag-eyebrow-rule" />
      <span className="tag-eyebrow-text">{children}</span>
    </div>
  )
}

const HOW_IT_WORKS = [
  { h: 'Tags help YouTube disambiguate, not rank', p: "Tags are private metadata that help YouTube understand what your video is about, which is most useful when your topic is misspelled or ambiguous. They are a minor signal. Your title, thumbnail, and content decide ranking far more than tags ever will." },
  { h: 'Relevance beats volume', p: "A handful of accurate, on-topic tags is better than a stuffed box of loosely related phrases. Irrelevant tags can confuse YouTube about who to show your video to, so this tool keeps the set tight and lets you remove anything that does not fit." },
  { h: 'Stay under the 500-character limit', p: "YouTube caps the combined length of all your tags at 500 characters. The generator stops adding once you reach the limit, so you never paste a set that gets truncated. Remove the weaker tags and the stronger ones get more room." },
  { h: 'Tags are not hashtags', p: "Tags are private and only the algorithm sees them. Hashtags are public, clickable, and help viewers find you. Use both: a tight tag set for YouTube, three to five hashtags for people." },
]

const GROW = [
  { label: 'Title Generator', title: 'Write titles that pull', body: 'Generate and score titles against the CTR signals that move clicks, then pair the winner with these tags.', href: '/tools/youtube-title-generator' },
  { label: 'Description Generator', title: 'Build a ranking description', body: 'Assemble a keyword-rich description with timestamps, links, and hashtags in seconds, the part that helps you rank.', href: '/tools/youtube-description-generator' },
  { label: 'SEO Studio', title: 'Score against the top results', body: 'See how your title and description stack up against the videos already ranking for your keyword, and fix the gaps.', href: '/features/seo-studio' },
]

const FAQS = [
  { q: 'Do YouTube tags still matter for ranking?',
    a: "They are a minor signal, not a magic bullet. YouTube has said tags play a limited role in discovery and are most useful when your topic is commonly misspelled or ambiguous (for example a product name spelled several ways). Your title, thumbnail, description, and the actual content do the heavy lifting for ranking. Treat tags as a small, free optimization that helps YouTube disambiguate your video, and do not expect them to move views on their own." },
  { q: 'How many tags should I add to a video?',
    a: "Add enough to cover your topic and its close variations without padding, which usually means somewhere between 5 and 20 relevant tags. YouTube caps the combined length of all your tags at 500 characters, so this generator stops adding once you hit that limit. Quality beats quantity: a handful of accurate, on-topic tags is better than stuffing the box with loosely related phrases." },
  { q: 'What is the difference between tags and hashtags?',
    a: "Tags are private metadata you add in the upload settings; viewers never see them, and they only help YouTube understand and categorize your video. Hashtags are public, clickable links that appear above your title or in the description and help viewers find related content. They serve different jobs, so use both: a tight set of tags for the algorithm, and three to five relevant hashtags for viewers." },
  { q: 'Where do I add these tags on YouTube?',
    a: "In YouTube Studio, open the video, go to Details, then click Show more, and you will find the Tags field near the bottom. Paste your comma-separated tags there. You can add or edit tags on existing videos at any time without affecting their performance history, so it is safe to revisit older uploads and tidy their tags." },
  { q: 'Should I copy the tags my competitors use?',
    a: "Borrowing a few relevant tags from a video that ranks for your exact topic is reasonable, but copying a competitor's full tag list wholesale rarely helps and can dilute your relevance with terms that do not match your content. Use their tags as inspiration to spot variations you missed, then keep only the ones that genuinely describe your video. Relevance is the whole point of a tag." },
  { q: 'Will more tags get me more views?',
    a: "No. Adding dozens of tags does not increase reach, and irrelevant tags can confuse YouTube about who to show your video to. The lever that moves views is packaging (title and thumbnail) plus retention. Tags are a tidy-up step that helps the algorithm place you correctly; they are worth doing well, but they are not where growth comes from." },
  { q: 'Is this tag generator free, and do you store my data?',
    a: "Free forever, no signup, no email. The generator runs entirely in your browser, so nothing you type is sent to or stored on our servers. We built it as a genuine free tool to save you a few minutes per upload. If you want your titles and descriptions scored against the videos already ranking for your keyword, which matters far more than tags, you can connect your channel for a free AI audit, but that is entirely optional." },
]

export default function YoutubeTagGenerator() {
  useGlobalStyles()
  const { isMobile } = useBreakpoint()

  const [topic, setTopic]     = useState('')
  const [removed, setRemoved] = useState([])
  const [copied, setCopied]   = useState(false)
  const [openFaq, setOpenFaq] = useState(0)

  const allTags = useMemo(() => generateTags(topic), [topic])
  const tags = useMemo(() => allTags.filter((t) => !removed.includes(t)), [allTags, removed])
  const joined = tags.join(', ')

  const copy = () => {
    if (!joined) return
    try { navigator.clipboard.writeText(joined) } catch (e) { /* no-op */ }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const H1 = isMobile ? 34 : 56
  const H2 = isMobile ? 28 : 40

  return (
    <div style={{ fontFamily: SANS, background: 'var(--yte-bg)', color: 'var(--yte-ink)', overflowX: 'clip' }}>
      <SiteHeader />
      <FaqSchema items={FAQS} />

      {/* ══ HERO ══ */}
      <section className="tag-section-pad" style={{ padding: isMobile ? '60px 22px 40px' : '104px 48px 48px', background: 'var(--yte-bg)' }}>
        <div className="tag-wrap" style={{ animation: 'tagFadeUp 0.5s ease both' }}>
          <Eyebrow>Free tool</Eyebrow>
          <h1 className="tag-h1" style={{ fontSize: H1, marginBottom: 22, maxWidth: 740, textWrap: 'balance' }}>
            YouTube tags in <em>one click.</em>
          </h1>
          <div style={{ maxWidth: 620 }}>
            <p className="tag-lead" style={{ fontSize: isMobile ? 16 : 17.5, marginBottom: 14, textWrap: 'pretty' }}>
              Enter your topic and get a clean set of relevant tags and variations, trimmed to fit YouTube's 500-character limit. Remove what does not fit, then copy the set.
            </p>
            <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>No signup. No email. Free forever.</p>
          </div>
        </div>
      </section>

      {/* ══ TOOL (stacked) ══ */}
      <section className="tag-section-pad" style={{ padding: isMobile ? '8px 22px 64px' : '0 48px 88px', background: 'var(--yte-bg)' }}>
        <div className="tag-wrap" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Input */}
          <div className="tag-card">
            <label className="tag-label" htmlFor="tag-topic">Your video topic or keyword</label>
            <input id="tag-topic" className="tag-input" value={topic} placeholder="e.g. capcut editing" onChange={(e) => { setTopic(e.target.value); setRemoved([]) }} />
            <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-muted)', marginTop: 12, lineHeight: 1.6 }}>
              Tags build as you type. Remove any that do not fit by tapping the x on the chip, then copy the set. Keep only what genuinely describes the video.
            </p>
          </div>

          {/* Output */}
          <div className="tag-out">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
                Your tags{tags.length ? ` · ${tags.length}` : ''}
              </span>
              <button className="tag-copy" onClick={copy} disabled={!joined}>{copied ? 'Copied' : 'Copy all'}</button>
            </div>
            {tags.length ? (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {tags.map((t) => (
                    <span key={t} className="tag-chip">
                      {t}
                      <button aria-label={`Remove ${t}`} onClick={() => setRemoved((r) => [...r, t])}>×</button>
                    </span>
                  ))}
                </div>
                <div style={{ marginTop: 18, fontFamily: SANS, fontSize: 11.5, color: 'rgba(255,255,255,0.5)' }}>
                  {joined.length} / {TAG_LIMIT} characters used
                </div>
              </>
            ) : (
              <div style={{ minHeight: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 400, color: '#fff', marginBottom: 8 }}>Your tags appear here</div>
                <div style={{ fontFamily: SANS, fontSize: 13.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, maxWidth: 320 }}>Enter your topic above and the tags build instantly, trimmed to the 500-character limit.</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section className="tag-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div className="tag-wrap">
          <div style={{ marginBottom: 40, maxWidth: 680 }}>
            <Eyebrow>What tags do</Eyebrow>
            <h2 className="tag-h2" style={{ fontSize: H2, textWrap: 'balance' }}>What tags do, and <em>what they do not.</em></h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {HOW_IT_WORKS.map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '300px 1fr', gap: isMobile ? 10 : 48, padding: '26px 0', borderTop: i === 0 ? 'none' : '1px solid var(--yte-line)' }}>
                <h3 style={{ fontFamily: SERIF, fontSize: isMobile ? 21 : 23, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.3px', lineHeight: 1.2 }}>{row.h}</h3>
                <p style={{ fontFamily: SANS, fontSize: isMobile ? 15 : 16, color: 'var(--yte-soft)', lineHeight: 1.72 }}>{row.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ WHERE RANKING IS WON (grow cards) ══ */}
      <section className="tag-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-bg)' }}>
        <div className="tag-wrap">
          <div style={{ marginBottom: 32, maxWidth: 680 }}>
            <Eyebrow>Where ranking is won</Eyebrow>
            <h2 className="tag-h2" style={{ fontSize: H2, marginBottom: 12, textWrap: 'balance' }}>Tags are the tidy-up. <em>Win the hard part.</em></h2>
            <p className="tag-lead" style={{ fontSize: 17 }}>Tags help YouTube place you. Your title, description, and thumbnail decide whether anyone clicks. Get those right too.</p>
          </div>
          <div className="tag-grow-grid">
            {GROW.map((c, i) => (
              <a key={i} href={c.href} className="tag-grow-card">
                <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'var(--yte-accent)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 14 }}>{c.label}</div>
                <h3 style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.3px', marginBottom: 12, lineHeight: 1.2 }}>{c.title}</h3>
                <p style={{ fontFamily: SANS, fontSize: 14.5, color: 'var(--yte-soft)', lineHeight: 1.65 }}>{c.body}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <div className="tag-section-pad" style={{ background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)', padding: isMobile ? '60px 22px' : '104px 48px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '320px 1fr', gap: isMobile ? 36 : 80, alignItems: 'start' }}>
          <div>
            <Eyebrow>Frequently asked</Eyebrow>
            <h2 className="tag-h2" style={{ fontSize: 'clamp(34px, 4.4vw, 54px)', marginBottom: 14, textWrap: 'balance' }}>Tags, <em>answered.</em></h2>
            <p className="tag-lead" style={{ fontSize: 14.5, maxWidth: 300 }}>
              What creators ask about tags and how much they matter. Still unsure? <a href="/contact" style={{ color: 'var(--yte-accent)', fontWeight: 600, textDecoration: 'none' }}>Email us.</a>
            </p>
          </div>
          <div style={{ borderTop: '1px solid var(--yte-line)' }}>
            {FAQS.map((item, i) => {
              const isOpen = openFaq === i
              return (
                <div key={i} style={{ borderBottom: '1px solid var(--yte-line)' }}>
                  <div onClick={() => setOpenFaq(isOpen ? null : i)} role="button" tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenFaq(isOpen ? null : i) } }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, padding: isMobile ? '20px 0' : '24px 0', cursor: 'pointer', userSelect: 'none' }}
                  >
                    <span style={{ flex: 1, fontFamily: SERIF, fontSize: isMobile ? 18 : 20, fontWeight: 400, color: isOpen ? 'var(--yte-accent)' : 'var(--yte-ink)', lineHeight: 1.3, letterSpacing: '-0.2px', transition: 'color 0.2s' }}>{item.q}</span>
                    <span aria-hidden="true" style={{ flexShrink: 0, fontFamily: SANS, fontSize: 26, fontWeight: 300, color: 'var(--yte-accent)', lineHeight: 1, transform: isOpen ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
                  </div>
                  <div className={`tag-faq-answer${isOpen ? ' open' : ''}`}>
                    <div className="tag-faq-answer-inner">
                      <div style={{ paddingBottom: isMobile ? 22 : 26, maxWidth: 680 }}>
                        <p style={{ fontFamily: SANS, fontSize: isMobile ? 14.5 : 15.5, color: 'var(--yte-soft)', lineHeight: 1.78, margin: 0 }}>{item.a}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <LandingFooter />
    </div>
  )
}
