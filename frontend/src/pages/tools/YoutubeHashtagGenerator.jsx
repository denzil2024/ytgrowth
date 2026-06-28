import { useEffect, useState, useMemo } from 'react'
import LandingFooter from '../../components/LandingFooter'
import SiteHeader from '../../components/SiteHeader'
import FaqSchema from '../../components/FaqSchema'

/* ─── Free SEO tool: YouTube Hashtag Generator ────────────────────────────
   /tools/youtube-hashtag-generator. Zero YouTube-API cost: builds relevant
   hashtags client-side from a seed topic. Visual DNA mirrors the other tool
   pages (Landing system: DM Sans headlines, Inter body, --ytg-* tokens,
   eyebrow pills, numbered FAQ). No emoji, no em-dash, no filler word. */

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
    if (document.getElementById('ytg-hg-styles')) return

    const style = document.createElement('style')
    style.id = 'ytg-hg-styles'
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
      @keyframes hgFadeUp { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }

      .hg-btn {
        display: inline-flex; align-items: center; gap: 8px;
        background: var(--ytg-accent); color: #fff;
        font-size: 15px; font-weight: 700; font-family: 'Inter', system-ui, sans-serif;
        padding: 14px 28px; border-radius: 100px; border: none;
        cursor: pointer; text-decoration: none; letter-spacing: -0.2px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,48,42,0.32);
        transition: filter 0.18s, transform 0.18s, box-shadow 0.18s;
      }
      .hg-btn:hover { filter: brightness(1.07); transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.15), 0 8px 28px rgba(229,48,42,0.42); }
      .hg-btn-lg { font-size: 16px; padding: 17px 36px; }

      .hg-eyebrow { display: inline-flex; align-items: center; gap: 8px; background: #ffffff; border: 1px solid rgba(10,10,15,0.09); border-radius: 100px; padding: 5px 12px 5px 10px; margin-bottom: 20px; box-shadow: 0 1px 2px rgba(10,10,15,0.04); }
      .hg-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--ytg-accent); box-shadow: 0 0 0 3px rgba(229,48,42,0.12); }
      .hg-eyebrow-text { font-size: 11px; font-weight: 700; color: var(--ytg-text-2); text-transform: uppercase; letter-spacing: 0.09em; }

      .hg-input { width: 100%; padding: 12px 14px; font-size: 14px; font-weight: 500; font-family: inherit; color: var(--ytg-text); background: #fafafb; border: 1px solid var(--ytg-border); border-radius: 10px; outline: none; transition: border-color 0.15s, background 0.15s; -webkit-appearance: none; }
      .hg-input:focus { border-color: rgba(10,10,15,0.28); background: #fff; }

      .hg-chip { display: inline-flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 600; color: var(--ytg-accent-text); background: var(--ytg-accent-light); border: 1px solid rgba(229,48,42,0.14); border-radius: 100px; padding: 6px 8px 6px 13px; }
      .hg-chip button { display: inline-flex; align-items: center; justify-content: center; width: 16px; height: 16px; border: none; background: rgba(229,48,42,0.12); color: var(--ytg-accent-text); border-radius: 50%; cursor: pointer; font-size: 12px; line-height: 1; padding: 0; transition: background 0.15s; }
      .hg-chip button:hover { background: rgba(229,48,42,0.22); }

      .hg-faq-answer { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease; }
      .hg-faq-answer.open { grid-template-rows: 1fr; opacity: 1; }
      .hg-faq-answer-inner { overflow: hidden; }

      .hg-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 22px; }
      .hg-tool-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: stretch; }

      @media (max-width: 900px) { .hg-grid-3 { grid-template-columns: 1fr; } .hg-tool-grid { grid-template-columns: 1fr; } }
      @media (max-width: 768px) { .hg-section-pad { padding-left: 20px !important; padding-right: 20px !important; } .hg-cta-pad { padding: 70px 24px !important; } }
    `
    document.head.appendChild(style)
  }, [])
}

/* ── Hashtag generation (client-side, zero API) ──────────────────────────── */
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

function Eyebrow({ children }) {
  return (
    <div className="hg-eyebrow">
      <span aria-hidden="true" className="hg-eyebrow-dot" />
      <span className="hg-eyebrow-text">{children}</span>
    </div>
  )
}

export default function YoutubeHashtagGenerator() {
  useGlobalStyles()
  const { isMobile, isTablet } = useBreakpoint()

  const [topic, setTopic]     = useState('')
  const [removed, setRemoved] = useState([])
  const [copied, setCopied]   = useState(false)
  const [openFaq, setOpenFaq] = useState(0)

  const allTags = useMemo(() => generateHashtags(topic), [topic])
  const tags = useMemo(() => allTags.filter((t) => !removed.includes(t)), [allTags, removed])
  const joined = tags.join(' ')

  const copy = () => {
    if (!joined) return
    try { navigator.clipboard.writeText(joined) } catch (e) { /* no-op */ }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: 'var(--ytg-bg)', color: 'var(--ytg-text)', overflowX: 'hidden' }}>

      <SiteHeader />
      <FaqSchema items={FAQS} />

      {/* ══ HERO ══ */}
      <section className="hg-section-pad" style={{ position: 'relative', padding: isMobile ? '64px 24px 56px' : '110px 48px 84px', textAlign: 'center', background: '#ffffff', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '120vw', maxWidth: 1400, height: 620, background: 'radial-gradient(ellipse at center top, rgba(229,48,42,0.07) 0%, rgba(229,48,42,0.02) 40%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1, animation: 'hgFadeUp 0.5s ease both' }}>
          <Eyebrow>Free tool</Eyebrow>
          <h1 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 34 : isTablet ? 56 : 64, lineHeight: isMobile ? 1.1 : 1.04, letterSpacing: isMobile ? '-0.6px' : '-2.2px', color: 'var(--ytg-text)', marginBottom: 22, textWrap: 'balance' }}>
            YouTube hashtags that <span style={{ color: 'var(--ytg-accent)' }}>get found.</span>
          </h1>
          <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 16 : 19, color: 'var(--ytg-text-2)', lineHeight: 1.7, maxWidth: 640, margin: '0 auto 28px', textWrap: 'pretty' }}>
            Enter your topic and get relevant hashtags to drop in your title or description. Keep the best three to five, copy, and paste.
          </p>
          <p style={{ fontSize: 13, color: 'var(--ytg-text-3)', fontWeight: 500 }}>No signup. No email. Runs in your browser.</p>
        </div>
      </section>

      {/* ══ TOOL ══ */}
      <section id="tool" className="hg-section-pad" style={{ padding: isMobile ? '48px 20px 80px' : '72px 48px 110px', background: 'var(--ytg-bg)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div className="hg-tool-grid">

            {/* LEFT: input + grow CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ background: 'var(--ytg-card)', borderRadius: 22, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-lg)', padding: isMobile ? 26 : 36 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Your video topic or keyword</label>
                <input className="hg-input" value={topic} placeholder="e.g. capcut editing" onChange={(e) => { setTopic(e.target.value); setRemoved([]) }} />
                <p style={{ fontSize: 11.5, color: 'var(--ytg-text-3)', marginTop: 16, lineHeight: 1.6 }}>
                  Hashtags build as you type. Keep your strongest three to five, since YouTube shows the first three above your title, and remove the rest by tapping the x.
                </p>
              </div>

              <div style={{ flex: 1, background: 'var(--ytg-card)', borderRadius: 22, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow)', padding: 26 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ytg-accent-text)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Where views come from</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--ytg-text)', lineHeight: 1.5, marginBottom: 8, letterSpacing: '-0.2px' }}>Hashtags help discovery. Packaging wins the click.</p>
                <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.65, marginBottom: 18 }}>
                  YTGrowth scores your title, description, and thumbnail against the videos already ranking for your keyword, so your effort lands where views are decided.
                </p>
                <a href="/auth/login" className="hg-btn" style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 14, borderRadius: 14 }}>Get my free audit →</a>
                <p style={{ fontSize: 11.5, color: 'var(--ytg-text-3)', textAlign: 'center', marginTop: 10 }}>Free trial · no card · upgrade anytime</p>
              </div>
            </div>

            {/* RIGHT: output */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1, background: 'var(--ytg-card)', borderRadius: 22, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow)', padding: isMobile ? 20 : 24, display: 'flex', flexDirection: 'column', minHeight: 360 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your hashtags{tags.length ? ` (${tags.length})` : ''}</span>
                  <button onClick={copy} disabled={!joined}
                    style={{ fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, color: copied ? '#0f7a43' : 'var(--ytg-accent-text)', background: copied ? 'rgba(26,157,90,0.10)' : 'var(--ytg-accent-light)', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: joined ? 'pointer' : 'not-allowed', opacity: joined ? 1 : 0.5 }}>
                    {copied ? 'Copied' : 'Copy all'}
                  </button>
                </div>
                {tags.length ? (
                  <>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignContent: 'flex-start' }}>
                      {tags.map((t) => (
                        <span key={t} className="hg-chip">
                          {t}
                          <button aria-label={`Remove ${t}`} onClick={() => setRemoved((r) => [...r, t])}>×</button>
                        </span>
                      ))}
                    </div>
                    <div style={{ marginTop: 'auto', paddingTop: 16, fontSize: 11.5, color: 'var(--ytg-text-3)' }}>
                      {tags.length > 15 ? 'Over 15 hashtags makes YouTube ignore them all. Trim down to your best 3 to 5.' : 'Tip: lead with your most important hashtag, the first 3 show above your title.'}
                    </div>
                  </>
                ) : (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--ytg-text-3)', padding: 24 }}>
                    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 17, fontWeight: 700, color: 'var(--ytg-text-2)', marginBottom: 6 }}>Your hashtags will appear here</div>
                    <div style={{ fontSize: 13.5, lineHeight: 1.6, maxWidth: 320 }}>Enter your topic on the left and the hashtags build instantly.</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how-it-works" className="hg-section-pad" style={{ padding: isMobile ? '72px 20px' : '110px 48px', background: 'var(--ytg-bg-2)', borderTop: '1px solid var(--ytg-border)', borderBottom: '1px solid var(--ytg-border)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ marginBottom: 48, maxWidth: 720 }}>
            <Eyebrow>How hashtags work</Eyebrow>
            <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: 'var(--ytg-text)', lineHeight: 1.06, textWrap: 'balance' }}>
              Use hashtags right, <span style={{ color: 'var(--ytg-accent)' }}>get the lift.</span>
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {[
              { h: 'The first three show above your title', p: "YouTube displays the first three hashtags from your description as clickable links right above your video title. Order matters, so lead with the most important and relevant one. The rest still help categorize the video even though they are not shown." },
              { h: 'Keep it to three to five', p: "A tight, on-topic set beats a wall of hashtags every time. YouTube ignores all of them if you use more than 15, and irrelevant hashtags can confuse who your video gets shown to. Pick the few that genuinely match the video." },
              { h: 'Relevance keeps you safe', p: "Adding hashtags unrelated to your content to chase a trend breaks YouTube's rules and can get your hashtags ignored or your video penalized. Match the hashtag to the video and you are both safe and more effective." },
              { h: 'Mix channel and video hashtags', p: "Keep one or two consistent hashtags tied to your niche, then swap in video-specific ones for each upload. The video-specific tags are what help a particular video get found by people browsing that exact topic." },
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
      <section className="hg-section-pad" style={{ padding: isMobile ? '72px 20px' : '110px 48px', background: 'var(--ytg-bg)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ marginBottom: 44, textAlign: 'center', maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
            <Eyebrow>Where growth comes from</Eyebrow>
            <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: 'var(--ytg-text)', lineHeight: 1.06, marginBottom: 16, textWrap: 'balance' }}>
              Hashtags are a finishing touch. <span style={{ color: 'var(--ytg-accent)' }}>Build the rest.</span>
            </h2>
            <p style={{ fontSize: 16, color: 'var(--ytg-text-2)', lineHeight: 1.7 }}>Discovery starts with a title and thumbnail people click. YTGrowth scores both.</p>
          </div>
          <div className="hg-grid-3">
            {[
              { label: 'Title Generator', title: 'Write titles that pull', body: 'Generate and score titles against the CTR signals that move clicks, then add your hashtags underneath.', href: '/tools/youtube-title-generator' },
              { label: 'Description Generator', title: 'Build a ranking description', body: 'Assemble a keyword-rich description with timestamps, links, and hashtags in seconds, in the structure YouTube rewards.', href: '/tools/youtube-description-generator' },
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
      <section className="hg-section-pad hg-cta-pad" style={{ padding: isMobile ? '88px 24px' : '120px 48px', background: '#0d0d12', borderTop: '1px solid rgba(255,255,255,0.07)', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: '42%', left: '50%', transform: 'translate(-50%,-50%)', width: 1000, height: isMobile ? 600 : 800, background: 'radial-gradient(ellipse, rgba(229,48,42,0.20) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 100, padding: '5px 12px 5px 10px', marginBottom: 22 }}>
            <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff3b30', boxShadow: '0 0 0 3px rgba(229,48,42,0.18)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.78)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>Free AI audit</span>
          </div>
          <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: '#ffffff', lineHeight: 1.06, marginBottom: 16, textWrap: 'balance' }}>
            Hashtags are set. <span style={{ color: '#ff3b30' }}>Now get the views.</span>
          </h2>
          <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 16 : 19, color: 'rgba(255,255,255,0.68)', lineHeight: 1.7, marginBottom: 32, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
            Connect your channel for a free AI audit and get titles, descriptions, and thumbnails scored against the videos winning in your niche.
          </p>
          <a href="/auth/login" className="hg-btn hg-btn-lg">Get my free audit →</a>
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
              Everything creators ask about YouTube hashtags. Still unsure? <a href="/contact" style={{ color: 'var(--ytg-accent)', fontWeight: 600, textDecoration: 'none' }}>Email us.</a>
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
                  <div className={`hg-faq-answer${isOpen ? ' open' : ''}`}>
                    <div className="hg-faq-answer-inner">
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
