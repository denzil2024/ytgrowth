import { useEffect, useState, useMemo } from 'react'
import LandingFooter from '../../components/LandingFooter'
import SiteHeader from '../../components/SiteHeader'
import FaqSchema from '../../components/FaqSchema'

/* ─── Free SEO tool: YouTube Tag Generator ────────────────────────────────
   /tools/youtube-tag-generator. Zero YouTube-API cost: builds relevant tags
   entirely client-side from a seed topic. Visual DNA mirrors the other tool
   pages (Landing system: DM Sans headlines, Inter body, --ytg-* tokens,
   eyebrow pills, numbered FAQ). No emoji, no em-dash, no filler "actually". */

function useBreakpoint() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280)
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return { isMobile: width <= 768, isTablet: width <= 1024 }
}

function useGlobalStyles() {
  useEffect(() => {
    if (document.getElementById('ytg-tag-styles')) return

    const style = document.createElement('style')
    style.id = 'ytg-tag-styles'
    style.textContent = `
      :root {
        --ytg-bg:           #f4f4f6;
        --ytg-bg-2:         #ecedf1;
        --ytg-bg-3:         #e6e7ec;
        --ytg-text:         #0a0a0f;
        --ytg-text-2:       rgba(10,10,15,0.62);
        --ytg-text-3:       rgba(10,10,15,0.40);
        --ytg-card:         #ffffff;
        --ytg-border:       rgba(10,10,15,0.09);
        --ytg-border-2:     rgba(10,10,15,0.16);
        --ytg-accent:       #e5302a;
        --ytg-accent-text:  #c22b25;
        --ytg-accent-light: rgba(229,48,42,0.07);
        --ytg-shadow-sm:    0 1px 3px rgba(0,0,0,0.07), 0 4px 14px rgba(0,0,0,0.07);
        --ytg-shadow:       0 2px 6px rgba(0,0,0,0.08), 0 10px 32px rgba(0,0,0,0.11);
        --ytg-shadow-lg:    0 4px 16px rgba(0,0,0,0.11), 0 24px 60px rgba(0,0,0,0.14);
      }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body { background: var(--ytg-bg); color: var(--ytg-text); font-family: 'Inter', system-ui, sans-serif; overflow-x: hidden; scrollbar-width: auto; scrollbar-color: rgba(10,10,15,0.28) transparent; }
      ::-webkit-scrollbar { width: 12px; height: 12px }
      ::-webkit-scrollbar-track { background: transparent }
      ::-webkit-scrollbar-thumb { background-color: rgba(10,10,15,0.28); border-radius: 10px; border: 3px solid transparent; background-clip: content-box; }
      ::-webkit-scrollbar-thumb:hover { background-color: rgba(10,10,15,0.48); background-clip: content-box; }
      @keyframes tagFadeUp { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }

      .tag-btn {
        display: inline-flex; align-items: center; gap: 8px;
        background: var(--ytg-accent); color: #fff;
        font-size: 15px; font-weight: 700; font-family: 'Inter', system-ui, sans-serif;
        padding: 14px 28px; border-radius: 100px; border: none;
        cursor: pointer; text-decoration: none; letter-spacing: -0.2px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,48,42,0.32);
        transition: filter 0.18s, transform 0.18s, box-shadow 0.18s;
      }
      .tag-btn:hover { filter: brightness(1.07); transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.15), 0 8px 28px rgba(229,48,42,0.42); }
      .tag-btn-lg { font-size: 16px; padding: 17px 36px; }

      .tag-eyebrow { display: inline-flex; align-items: center; gap: 8px; background: #ffffff; border: 1px solid rgba(10,10,15,0.09); border-radius: 100px; padding: 5px 12px 5px 10px; margin-bottom: 20px; box-shadow: 0 1px 2px rgba(10,10,15,0.04); }
      .tag-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--ytg-accent); box-shadow: 0 0 0 3px rgba(229,48,42,0.12); }
      .tag-eyebrow-text { font-size: 11px; font-weight: 700; color: var(--ytg-text-2); text-transform: uppercase; letter-spacing: 0.09em; }

      .tag-input { width: 100%; padding: 12px 14px; font-size: 14px; font-weight: 500; font-family: inherit; color: var(--ytg-text); background: #fafafb; border: 1px solid var(--ytg-border); border-radius: 10px; outline: none; transition: border-color 0.15s, background 0.15s; -webkit-appearance: none; }
      .tag-input:focus { border-color: rgba(10,10,15,0.28); background: #fff; }

      .tag-chip { display: inline-flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 500; color: var(--ytg-text); background: #fafafb; border: 1px solid var(--ytg-border); border-radius: 100px; padding: 6px 8px 6px 13px; }
      .tag-chip button { display: inline-flex; align-items: center; justify-content: center; width: 16px; height: 16px; border: none; background: rgba(10,10,15,0.06); color: var(--ytg-text-3); border-radius: 50%; cursor: pointer; font-size: 12px; line-height: 1; padding: 0; transition: background 0.15s, color 0.15s; }
      .tag-chip button:hover { background: var(--ytg-accent-light); color: var(--ytg-accent-text); }

      .tag-faq-answer { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease; }
      .tag-faq-answer.open { grid-template-rows: 1fr; opacity: 1; }
      .tag-faq-answer-inner { overflow: hidden; }

      .tag-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 22px; }
      .tag-tool-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: stretch; }

      @media (max-width: 900px) { .tag-grid-3 { grid-template-columns: 1fr; } .tag-tool-grid { grid-template-columns: 1fr; } }
      @media (max-width: 768px) { .tag-section-pad { padding-left: 20px !important; padding-right: 20px !important; } .tag-cta-pad { padding: 70px 24px !important; } }
    `
    document.head.appendChild(style)
  }, [])
}

/* ── Tag generation (client-side, zero API) ──────────────────────────────── */
const SUFFIXES = ['tutorial', '2026', 'tips', 'for beginners', 'guide', 'explained', 'review', 'step by step', 'tricks', 'hacks', 'basics', 'full guide', 'how to', 'tutorial 2026']
const PREFIXES = ['how to', 'best', 'easy', 'free']
const TAG_LIMIT = 500 // YouTube's combined tag character cap.

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
    const add = (tags.length ? 2 : 0) + tag.length // ", " joiner + tag
    if (len + add > TAG_LIMIT) break
    seen.add(tag)
    tags.push(tag)
    len += add
  }
  return tags
}

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

function Eyebrow({ children }) {
  return (
    <div className="tag-eyebrow">
      <span aria-hidden="true" className="tag-eyebrow-dot" />
      <span className="tag-eyebrow-text">{children}</span>
    </div>
  )
}

export default function YoutubeTagGenerator() {
  useGlobalStyles()
  const { isMobile, isTablet } = useBreakpoint()

  const [topic, setTopic]   = useState('')
  const [removed, setRemoved] = useState([])
  const [copied, setCopied] = useState(false)
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

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: 'var(--ytg-bg)', color: 'var(--ytg-text)', overflowX: 'clip' }}>

      <SiteHeader />
      <FaqSchema items={FAQS} />

      {/* ══ HERO ══ */}
      <section className="tag-section-pad" style={{ position: 'relative', padding: isMobile ? '64px 24px 56px' : '110px 48px 84px', textAlign: 'center', background: '#ffffff', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '120vw', maxWidth: 1400, height: 620, background: 'radial-gradient(ellipse at center top, rgba(229,48,42,0.07) 0%, rgba(229,48,42,0.02) 40%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1, animation: 'tagFadeUp 0.5s ease both' }}>
          <Eyebrow>Free tool</Eyebrow>
          <h1 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 34 : isTablet ? 56 : 64, lineHeight: isMobile ? 1.1 : 1.04, letterSpacing: isMobile ? '-0.6px' : '-2.2px', color: 'var(--ytg-text)', marginBottom: 22, textWrap: 'balance' }}>
            YouTube tags in <span style={{ color: 'var(--ytg-accent)' }}>one click.</span>
          </h1>
          <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 16 : 19, color: 'var(--ytg-text-2)', lineHeight: 1.7, maxWidth: 640, margin: '0 auto 28px', textWrap: 'pretty' }}>
            Enter your topic and get a clean set of relevant tags and variations, trimmed to fit YouTube's 500-character limit. Copy, paste, done.
          </p>
          <p style={{ fontSize: 13, color: 'var(--ytg-text-3)', fontWeight: 500 }}>No signup. No email. Runs in your browser.</p>
        </div>
      </section>

      {/* ══ TOOL ══ */}
      <section id="tool" className="tag-section-pad" style={{ padding: isMobile ? '48px 20px 80px' : '72px 48px 110px', background: 'var(--ytg-bg)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div className="tag-tool-grid">

            {/* LEFT: input + grow CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ background: 'var(--ytg-card)', borderRadius: 22, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-lg)', padding: isMobile ? 26 : 36 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Your video topic or keyword</label>
                <input className="tag-input" value={topic} placeholder="e.g. capcut editing" onChange={(e) => { setTopic(e.target.value); setRemoved([]) }} />
                <p style={{ fontSize: 11.5, color: 'var(--ytg-text-3)', marginTop: 16, lineHeight: 1.6 }}>
                  Tags build as you type. Remove any that do not fit your video by tapping the x on the chip, then copy the set. Keep only what genuinely describes the video.
                </p>
              </div>

              <div style={{ flex: 1, background: 'var(--ytg-card)', borderRadius: 22, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow)', padding: 26 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ytg-accent-text)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Where ranking is won</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--ytg-text)', lineHeight: 1.5, marginBottom: 8, letterSpacing: '-0.2px' }}>Tags are a tidy-up. Title and thumbnail are the win.</p>
                <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.65, marginBottom: 18 }}>
                  YTGrowth scores your title, description, and thumbnail against the videos already ranking for your keyword, so your effort goes where views are decided.
                </p>
                <a href="/auth/login" className="tag-btn" style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 14, borderRadius: 14 }}>Get my free audit →</a>
                <p style={{ fontSize: 11.5, color: 'var(--ytg-text-3)', textAlign: 'center', marginTop: 10 }}>Free trial · no card · upgrade anytime</p>
              </div>
            </div>

            {/* RIGHT: output */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1, background: 'var(--ytg-card)', borderRadius: 22, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow)', padding: isMobile ? 20 : 24, display: 'flex', flexDirection: 'column', minHeight: 360 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your tags{tags.length ? ` (${tags.length})` : ''}</span>
                  <button onClick={copy} disabled={!joined}
                    style={{ fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, color: copied ? '#0f7a43' : 'var(--ytg-accent-text)', background: copied ? 'rgba(26,157,90,0.10)' : 'var(--ytg-accent-light)', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: joined ? 'pointer' : 'not-allowed', opacity: joined ? 1 : 0.5 }}>
                    {copied ? 'Copied' : 'Copy all'}
                  </button>
                </div>
                {tags.length ? (
                  <>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignContent: 'flex-start' }}>
                      {tags.map((t) => (
                        <span key={t} className="tag-chip">
                          {t}
                          <button aria-label={`Remove ${t}`} onClick={() => setRemoved((r) => [...r, t])}>×</button>
                        </span>
                      ))}
                    </div>
                    <div style={{ marginTop: 'auto', paddingTop: 16, fontSize: 11.5, color: 'var(--ytg-text-3)' }}>
                      {joined.length} / {TAG_LIMIT} characters used
                    </div>
                  </>
                ) : (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--ytg-text-3)', padding: 24 }}>
                    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 17, fontWeight: 700, color: 'var(--ytg-text-2)', marginBottom: 6 }}>Your tags will appear here</div>
                    <div style={{ fontSize: 13.5, lineHeight: 1.6, maxWidth: 320 }}>Enter your topic on the left and the tags build instantly.</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how-it-works" className="tag-section-pad" style={{ padding: isMobile ? '72px 20px' : '110px 48px', background: 'var(--ytg-bg-2)', borderTop: '1px solid var(--ytg-border)', borderBottom: '1px solid var(--ytg-border)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ marginBottom: 48, maxWidth: 720 }}>
            <Eyebrow>What tags do</Eyebrow>
            <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: 'var(--ytg-text)', lineHeight: 1.06, textWrap: 'balance' }}>
              What tags do, and <span style={{ color: 'var(--ytg-accent)' }}>what they do not.</span>
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {[
              { h: 'Tags help YouTube disambiguate, not rank', p: "Tags are private metadata that help YouTube understand what your video is about, which is most useful when your topic is misspelled or ambiguous. They are a minor signal. Your title, thumbnail, and content decide ranking far more than tags ever will." },
              { h: 'Relevance beats volume', p: "A handful of accurate, on-topic tags is better than a stuffed box of loosely related phrases. Irrelevant tags can confuse YouTube about who to show your video to, so this tool keeps the set tight and lets you remove anything that does not fit." },
              { h: 'Stay under the 500-character limit', p: "YouTube caps the combined length of all your tags at 500 characters. The generator stops adding once you reach the limit, so you never paste a set that gets truncated. Remove the weaker tags and the stronger ones get more room." },
              { h: 'Tags are not hashtags', p: "Tags are private and only the algorithm sees them. Hashtags are public, clickable, and help viewers find you. Use both: a tight tag set for YouTube, three to five hashtags for people." },
            ].map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '300px 1fr', gap: isMobile ? 12 : 56, paddingTop: i === 0 ? 0 : 28, borderTop: i === 0 ? 'none' : '1px solid var(--ytg-border)' }}>
                <h3 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 20 : 22, fontWeight: 800, color: 'var(--ytg-text)', letterSpacing: '-0.5px', lineHeight: 1.25 }}>{row.h}</h3>
                <p style={{ fontSize: 15.5, color: 'var(--ytg-text-2)', lineHeight: 1.75 }}>{row.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW TO GROW (3 cards) ══ */}
      <section className="tag-section-pad" style={{ padding: isMobile ? '72px 20px' : '110px 48px', background: 'var(--ytg-bg)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ marginBottom: 44, textAlign: 'center', maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
            <Eyebrow>Where growth comes from</Eyebrow>
            <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: 'var(--ytg-text)', lineHeight: 1.06, marginBottom: 16, textWrap: 'balance' }}>
              Tags are the easy part. <span style={{ color: 'var(--ytg-accent)' }}>Win the hard part.</span>
            </h2>
            <p style={{ fontSize: 16, color: 'var(--ytg-text-2)', lineHeight: 1.7 }}>Views are decided by packaging and relevance. YTGrowth helps you nail both.</p>
          </div>
          <div className="tag-grid-3">
            {[
              { label: 'Title Generator', title: 'Write titles that pull', body: 'Generate and score titles against the CTR signals that move clicks, then pair the winner with these tags.', href: '/tools/youtube-title-generator' },
              { label: 'Description Generator', title: 'Build a ranking description', body: 'Assemble a keyword-rich description with timestamps, links, and hashtags in seconds, the part that helps you rank.', href: '/tools/youtube-description-generator' },
              { label: 'SEO Studio', title: 'Score against the top results', body: 'See how your title and description stack up against the videos already ranking for your keyword, and fix the gaps.', href: '/features/seo-studio' },
            ].map((card, i) => (
              <a key={i} href={card.href} style={{ display: 'block', background: 'var(--ytg-card)', border: '1px solid var(--ytg-border)', borderRadius: 22, padding: 30, boxShadow: 'var(--ytg-shadow-sm)', textDecoration: 'none', transition: 'transform 0.18s, box-shadow 0.18s, border-color 0.18s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--ytg-shadow)'; e.currentTarget.style.borderColor = 'var(--ytg-border-2)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--ytg-shadow-sm)'; e.currentTarget.style.borderColor = 'var(--ytg-border)' }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ytg-accent-text)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>{card.label}</p>
                <h3 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 20, fontWeight: 800, color: 'var(--ytg-text)', letterSpacing: '-0.4px', marginBottom: 12, lineHeight: 1.25 }}>{card.title}</h3>
                <p style={{ fontSize: 14.5, color: 'var(--ytg-text-2)', lineHeight: 1.65 }}>{card.body}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══ DARK CTA ══ */}
      <section className="tag-section-pad tag-cta-pad" style={{ padding: isMobile ? '88px 24px' : '120px 48px', background: '#0d0d12', borderTop: '1px solid rgba(255,255,255,0.07)', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: '42%', left: '50%', transform: 'translate(-50%,-50%)', width: 1000, height: isMobile ? 600 : 800, background: 'radial-gradient(ellipse, rgba(229,48,42,0.20) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 100, padding: '5px 12px 5px 10px', marginBottom: 22 }}>
            <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff3b30', boxShadow: '0 0 0 3px rgba(229,48,42,0.18)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.78)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>Free AI audit</span>
          </div>
          <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: '#ffffff', lineHeight: 1.06, marginBottom: 16, textWrap: 'balance' }}>
            Tagged and ready. <span style={{ color: '#ff3b30' }}>Now get found.</span>
          </h2>
          <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 16 : 19, color: 'rgba(255,255,255,0.68)', lineHeight: 1.7, marginBottom: 32, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
            Connect your channel for a free AI audit and get titles, descriptions, and thumbnails scored against the videos winning in your niche.
          </p>
          <a href="/auth/login" className="tag-btn tag-btn-lg">Get my free audit →</a>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', marginTop: 16 }}>Free trial · no card · upgrade anytime</p>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <div style={{ background: '#f4f4f6', borderTop: '1px solid rgba(10,10,15,0.08)', borderBottom: '1px solid rgba(10,10,15,0.08)', padding: isMobile ? '60px 20px' : '110px 64px', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: '-10%', left: '-5%', width: 700, height: 600, background: 'radial-gradient(ellipse, rgba(229,48,42,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1160, margin: '0 auto', position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '340px 1fr', gap: isMobile ? 40 : 88, alignItems: 'start' }}>
          <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
            <Eyebrow>Frequently asked</Eyebrow>
            <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: 'var(--ytg-text)', lineHeight: 1.05, marginBottom: 14, textWrap: 'balance' }}>
              Questions <span style={{ color: 'var(--ytg-accent)' }}>answered.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'var(--ytg-text-2)', lineHeight: 1.7, margin: 0, maxWidth: isMobile ? 520 : 320, marginLeft: isMobile ? 'auto' : 0, marginRight: isMobile ? 'auto' : 0 }}>
              Everything creators ask about YouTube tags and what they are worth. Still unsure? <a href="/contact" style={{ color: 'var(--ytg-accent)', fontWeight: 600, textDecoration: 'none' }}>Email us.</a>
            </p>
          </div>
          <div style={{ borderTop: '1px solid rgba(10,10,15,0.10)' }}>
            {FAQS.map((item, i) => {
              const isOpen = openFaq === i
              const num = String(i + 1).padStart(2, '0')
              return (
                <div key={i} style={{ borderBottom: '1px solid rgba(10,10,15,0.10)', position: 'relative' }}>
                  {isOpen && <div aria-hidden="true" style={{ position: 'absolute', left: 0, top: 6, bottom: 6, width: 2, background: 'var(--ytg-accent)', borderRadius: 2 }} />}
                  <div onClick={() => setOpenFaq(isOpen ? null : i)} role="button" tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenFaq(isOpen ? null : i) } }}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: isMobile ? 14 : 20, padding: isMobile ? '20px 0' : '24px 0', paddingLeft: isOpen ? (isMobile ? 16 : 22) : 0, cursor: 'pointer', transition: 'padding-left 0.25s ease', userSelect: 'none' }}>
                    <span style={{ fontSize: isMobile ? 12 : 13, fontWeight: 700, color: isOpen ? 'var(--ytg-accent)' : 'var(--ytg-text-3)', fontVariantNumeric: 'tabular-nums', lineHeight: 1.5, flexShrink: 0, width: isMobile ? 22 : 28, paddingTop: 2, transition: 'color 0.2s' }}>{num}</span>
                    <span style={{ flex: 1, fontSize: isMobile ? 15 : 16, fontWeight: 600, color: 'var(--ytg-text)', lineHeight: 1.45, letterSpacing: '-0.2px' }}>{item.q}</span>
                    <span aria-hidden="true" style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isOpen ? 'var(--ytg-accent)' : 'rgba(10,10,15,0.05)', border: `1px solid ${isOpen ? 'var(--ytg-accent)' : 'rgba(10,10,15,0.10)'}`, transition: 'background 0.2s, border-color 0.2s', marginTop: 1 }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1 5h8" stroke={isOpen ? '#ffffff' : 'var(--ytg-text-2)'} strokeWidth="1.8" strokeLinecap="round" />
                        {!isOpen && <path d="M5 1v8" stroke="var(--ytg-text-2)" strokeWidth="1.8" strokeLinecap="round" />}
                      </svg>
                    </span>
                  </div>
                  <div className={`tag-faq-answer${isOpen ? ' open' : ''}`}>
                    <div className="tag-faq-answer-inner">
                      <div style={{ paddingLeft: isMobile ? 36 : 48, paddingRight: isMobile ? 40 : 48, paddingBottom: isMobile ? 22 : 26 }}>
                        <p style={{ fontSize: isMobile ? 14 : 15, color: 'var(--ytg-text-2)', lineHeight: 1.72, margin: 0 }}>{item.a}</p>
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
