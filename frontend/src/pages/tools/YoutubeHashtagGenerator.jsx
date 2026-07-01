import { useEffect, useMemo, useState } from 'react'
import LandingFooter from '../../components/LandingFooter'
import SiteHeader from '../../components/SiteHeader'
import FaqSchema from '../../components/FaqSchema'

/* ─── Free tool: YouTube Hashtag Generator ─────────────────────────────────
   /tools/youtube-hashtag-generator. Generates relevant hashtags client-side
   (zero API). Migrated to the editorial design language; stacked layout
   (input bar on top, chips panel below) like the Tag Generator. All logic +
   content preserved. See project_design_language_editorial. */

const SERIF = "'Fraunces', Georgia, serif"
const SANS  = "'Barlow', system-ui, sans-serif"

const PLATFORM = ['#youtube', '#youtubeshorts', '#shorts', '#youtubetips', '#contentcreator', '#creator', '#youtuber', '#subscribe']

function generateHashtags(topic) {
  const t = topic.trim().toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim()
  if (!t) return []
  const words = t.split(' ').filter((w) => w.length > 2)
  const phrase = words.join('')
  const raw = []
  if (phrase.length > 2) raw.push('#' + phrase)
  words.forEach((w) => raw.push('#' + w))
  if (phrase.length > 2 && phrase.length <= 18) {
    raw.push('#' + phrase + 'tips')
    raw.push('#' + phrase + 'tutorial')
  }
  raw.push(...PLATFORM)

  const seen = new Set()
  const out = []
  for (const r of raw) {
    const h = r.toLowerCase()
    if (h.length < 3 || seen.has(h)) continue
    seen.add(h)
    out.push(h)
    if (out.length >= 18) break
  }
  return out
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
    if (document.getElementById('hg-styles')) return
    const style = document.createElement('style')
    style.id = 'hg-styles'
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
      @keyframes hgFadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }

      .hg-wrap { max-width: 920px; margin: 0 auto; }
      .hg-eyebrow { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 22px; }
      .hg-eyebrow-rule { width: 26px; height: 1px; background: var(--yte-accent); }
      .hg-eyebrow-text { font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-accent); text-transform: uppercase; letter-spacing: 0.18em; }
      .hg-h1 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.04; }
      .hg-h1 em { font-style: italic; color: var(--yte-accent); }
      .hg-h2 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.08; }
      .hg-h2 em { font-style: italic; color: var(--yte-accent); }
      .hg-lead { font-family: ${SANS}; color: var(--yte-soft); line-height: 1.75; }

      .hg-label { display: block; font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-muted); text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 9px; }
      .hg-input { width: 100%; padding: 14px 15px; font-size: 16px; font-weight: 500; font-family: ${SANS}; color: var(--yte-ink); background: var(--yte-bg); border: 1px solid var(--yte-line); border-radius: 0; outline: none; transition: border-color 0.15s, background 0.15s; -webkit-appearance: none; }
      .hg-input:focus { border-color: var(--yte-accent); background: #fff; }

      .hg-card { background: var(--yte-surface); border: 1px solid var(--yte-line); padding: 28px; }
      .hg-out { background: var(--yte-ink); padding: 26px; color: #fff; }
      .hg-chip { display: inline-flex; align-items: center; gap: 8px; font-family: ${SANS}; font-size: 13.5px; font-weight: 500; color: #fff; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.14); padding: 7px 8px 7px 13px; }
      .hg-chip button { background: none; border: none; color: rgba(255,255,255,0.55); font-size: 16px; line-height: 1; cursor: pointer; padding: 0 2px; transition: color 0.15s; }
      .hg-chip button:hover { color: #fff; }
      .hg-copy { font-family: ${SANS}; font-size: 11.5px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; border: 1px solid rgba(255,255,255,0.22); background: transparent; color: #fff; padding: 6px 14px; cursor: pointer; transition: background 0.15s; }
      .hg-copy:hover { background: rgba(255,255,255,0.1); }
      .hg-copy:disabled { opacity: 0.4; cursor: not-allowed; }

      .hg-grow-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--yte-line); border: 1px solid var(--yte-line); }
      @media (max-width: 760px) { .hg-grow-grid { grid-template-columns: 1fr; } }
      .hg-grow-card { display: block; text-decoration: none; background: var(--yte-surface); padding: 28px; transition: background 0.15s; }
      .hg-grow-card:hover { background: var(--yte-bg-2); }

      .hg-faq-answer { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease; }
      .hg-faq-answer.open { grid-template-rows: 1fr; opacity: 1; }
      .hg-faq-answer-inner { overflow: hidden; }

      @media (max-width: 768px) { .hg-section-pad { padding-left: 22px !important; padding-right: 22px !important; } .hg-cta-pad { padding: 76px 24px !important; } }
    `
    document.head.appendChild(style)
  }, [])
}

function Eyebrow({ children }) {
  return (
    <div className="hg-eyebrow">
      <span aria-hidden="true" className="hg-eyebrow-rule" />
      <span className="hg-eyebrow-text">{children}</span>
    </div>
  )
}

const HOW_IT_WORKS = [
  { h: 'The first three show above your title', p: "YouTube displays the first three hashtags from your description as clickable links right above your video title. Order matters, so lead with the most important and relevant one. The rest still help categorize the video even though they are not shown." },
  { h: 'Keep it to three to five', p: "A tight, on-topic set beats a wall of hashtags every time. YouTube ignores all of them if you use more than 15, and irrelevant hashtags can confuse who your video gets shown to. Pick the few that genuinely match the video." },
  { h: 'Relevance keeps you safe', p: "Adding hashtags unrelated to your content to chase a trend breaks YouTube's rules and can get your hashtags ignored or your video penalized. Match the hashtag to the video and you are both safe and more effective." },
  { h: 'Mix channel and video hashtags', p: "Keep one or two consistent hashtags tied to your niche, then swap in video-specific ones for each upload. The video-specific tags are what help a particular video get found by people browsing that exact topic." },
]

const GROW = [
  { label: 'Title Generator', title: 'Write titles that pull', body: 'Generate and score titles against the CTR signals that move clicks, then add your hashtags underneath.', href: '/tools/youtube-title-generator' },
  { label: 'Description Generator', title: 'Build a ranking description', body: 'Assemble a keyword-rich description with timestamps, links, and hashtags in seconds, in the structure YouTube rewards.', href: '/tools/youtube-description-generator' },
  { label: 'SEO Studio', title: 'Score against the top results', body: 'See how your title and description stack up against the videos already ranking for your keyword, and fix the gaps.', href: '/features/seo-studio' },
]

const FAQS = [
  { q: 'How many hashtags should I use on a YouTube video?',
    a: "Keep it to three to five relevant hashtags. YouTube shows the first three hashtags from your description above your video title, so the order matters: lead with the most important. You can technically add more, but YouTube ignores all of them if you use more than 15, and a tight, on-topic set always beats a wall of tags. Pick the few that genuinely describe the video, remove the rest." },
  { q: 'Where do hashtags appear, and where do I put them?',
    a: "Add hashtags in your video description (or at the end of your title, though the description is the standard place). The first three hashtags in the description become clickable links displayed just above your video title, where viewers can tap them to find related content. The rest still help YouTube categorize the video even though they are not shown above the title." },
  { q: 'Do hashtags help my video get more views?',
    a: "They help with discovery and categorization, not as a direct ranking boost. Clicking a hashtag takes viewers to a feed of videos using it, so a relevant hashtag can surface your video to people browsing that topic. They also signal context to YouTube. They are a useful, free addition, but your title, thumbnail, and retention are what drive views; treat hashtags as a small bonus, not the engine." },
  { q: 'What is the difference between hashtags and tags?',
    a: "Hashtags are public and clickable: viewers see them above your title and can tap them to find related videos. Tags are private metadata in your upload settings that only YouTube reads, used mostly to disambiguate misspellings and ambiguous topics. Use both, for different jobs: three to five hashtags for viewers, a tight tag set for the algorithm." },
  { q: 'Can a hashtag get my video removed or demoted?',
    a: "It can if you misuse it. Adding hashtags that are unrelated to your content (to chase a trend), or using more than 15, violates YouTube's hashtag rules and can cause your hashtags to be ignored or, in egregious cases, your video to be removed. Stick to hashtags that genuinely match the video and you have nothing to worry about. Relevance keeps you safe and works better anyway." },
  { q: 'Should every video use the same hashtags?',
    a: "Use a couple of consistent ones tied to your channel or niche, then swap in video-specific hashtags for each upload. The video-specific ones are what help a particular video get found by people browsing that exact topic. Reusing the identical generic set on every video wastes the slots that could be matching each video to its real audience." },
  { q: 'Is this hashtag generator free, and do you store my data?',
    a: "Free forever, no signup, no email. The generator runs entirely in your browser, so nothing you type is sent to or stored on our servers. We built it as a genuine free tool to save you time per upload. If you want your titles and descriptions scored against the videos already ranking for your keyword, which moves views far more than hashtags, you can connect your channel for a free AI audit, but that is entirely optional." },
]

export default function YoutubeHashtagGenerator() {
  useGlobalStyles()
  const { isMobile } = useBreakpoint()

  const [topic, setTopic]     = useState('')
  const [removed, setRemoved] = useState([])
  const [copied, setCopied]   = useState(false)
  const [openFaq, setOpenFaq] = useState(0)

  const all = useMemo(() => generateHashtags(topic), [topic])
  const tags = useMemo(() => all.filter((t) => !removed.includes(t)), [all, removed])
  const joined = tags.join(' ')

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
      <section className="hg-section-pad" style={{ padding: isMobile ? '60px 22px 40px' : '104px 48px 48px', background: 'var(--yte-bg)' }}>
        <div className="hg-wrap" style={{ animation: 'hgFadeUp 0.5s ease both' }}>
          <Eyebrow>Free tool</Eyebrow>
          <h1 className="hg-h1" style={{ fontSize: H1, marginBottom: 22, maxWidth: 740, textWrap: 'balance' }}>
            YouTube hashtags that get you <em>found.</em>
          </h1>
          <div style={{ maxWidth: 620 }}>
            <p className="hg-lead" style={{ fontSize: isMobile ? 16 : 17.5, marginBottom: 14, textWrap: 'pretty' }}>
              Enter your topic and get relevant hashtags to drop in your title or description. Keep the best three to five, remove the rest, copy, and paste.
            </p>
            <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>No signup. No email. Free forever.</p>
          </div>
        </div>
      </section>

      {/* ══ TOOL (stacked) ══ */}
      <section className="hg-section-pad" style={{ padding: isMobile ? '8px 22px 64px' : '0 48px 88px', background: 'var(--yte-bg)' }}>
        <div className="hg-wrap" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="hg-card">
            <label className="hg-label" htmlFor="hg-topic">Your video topic or keyword</label>
            <input id="hg-topic" className="hg-input" value={topic} placeholder="e.g. capcut editing" onChange={(e) => { setTopic(e.target.value); setRemoved([]) }} />
            <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-muted)', marginTop: 12, lineHeight: 1.6 }}>
              Hashtags build as you type. Remove any that do not fit by tapping the x, then copy. Lead with your best three, which are the ones shown above your title.
            </p>
          </div>

          <div className="hg-out">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
                Your hashtags{tags.length ? ` · ${tags.length}` : ''}
              </span>
              <button className="hg-copy" onClick={copy} disabled={!joined}>{copied ? 'Copied' : 'Copy all'}</button>
            </div>
            {tags.length ? (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {tags.map((t) => (
                    <span key={t} className="hg-chip">
                      {t}
                      <button aria-label={`Remove ${t}`} onClick={() => setRemoved((r) => [...r, t])}>×</button>
                    </span>
                  ))}
                </div>
                <div style={{ marginTop: 18, fontFamily: SANS, fontSize: 11.5, color: 'rgba(255,255,255,0.5)' }}>
                  The first three appear above your title. Use three to five, never more than 15.
                </div>
              </>
            ) : (
              <div style={{ minHeight: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 400, color: '#fff', marginBottom: 8 }}>Your hashtags appear here</div>
                <div style={{ fontFamily: SANS, fontSize: 13.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, maxWidth: 320 }}>Enter your topic above and a relevant set builds instantly.</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section className="hg-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div className="hg-wrap">
          <div style={{ marginBottom: 40, maxWidth: 680 }}>
            <Eyebrow>Using hashtags well</Eyebrow>
            <h2 className="hg-h2" style={{ fontSize: H2, textWrap: 'balance' }}>How to use hashtags <em>the right way.</em></h2>
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

      {/* ══ GROW cards ══ */}
      <section className="hg-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-bg)' }}>
        <div className="hg-wrap">
          <div style={{ marginBottom: 32, maxWidth: 680 }}>
            <Eyebrow>Where ranking is won</Eyebrow>
            <h2 className="hg-h2" style={{ fontSize: H2, marginBottom: 12, textWrap: 'balance' }}>Hashtags help discovery. <em>Packaging wins.</em></h2>
            <p className="hg-lead" style={{ fontSize: 17 }}>Hashtags surface you to browsers. Your title, description, and thumbnail decide whether they click. Get those right too.</p>
          </div>
          <div className="hg-grow-grid">
            {GROW.map((c, i) => (
              <a key={i} href={c.href} className="hg-grow-card">
                <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'var(--yte-accent)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 14 }}>{c.label}</div>
                <h3 style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.3px', marginBottom: 12, lineHeight: 1.2 }}>{c.title}</h3>
                <p style={{ fontFamily: SANS, fontSize: 14.5, color: 'var(--yte-soft)', lineHeight: 1.65 }}>{c.body}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <div className="hg-section-pad" style={{ background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)', padding: isMobile ? '60px 22px' : '104px 48px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '320px 1fr', gap: isMobile ? 36 : 80, alignItems: 'start' }}>
          <div>
            <Eyebrow>Frequently asked</Eyebrow>
            <h2 className="hg-h2" style={{ fontSize: 'clamp(34px, 4.4vw, 54px)', marginBottom: 14, textWrap: 'balance' }}>Hashtags, <em>answered.</em></h2>
            <p className="hg-lead" style={{ fontSize: 14.5, maxWidth: 300 }}>
              What creators ask about hashtags and how to use them. Still unsure? <a href="/contact" style={{ color: 'var(--yte-accent)', fontWeight: 600, textDecoration: 'none' }}>Email us.</a>
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
                  <div className={`hg-faq-answer${isOpen ? ' open' : ''}`}>
                    <div className="hg-faq-answer-inner">
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
