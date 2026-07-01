import { useEffect, useMemo, useState } from 'react'
import LandingFooter from '../../components/LandingFooter'
import SiteHeader from '../../components/SiteHeader'
import FaqSchema from '../../components/FaqSchema'

/* ─── Free tool: YouTube Description Generator ─────────────────────────────
   /tools/youtube-description-generator. Builds a full SEO description
   client-side (zero API). Migrated to the editorial design language
   (Fraunces + Barlow, sharp flat cards, warm paper, restrained red); all
   build logic and content preserved. See project_design_language_editorial. */

const SERIF = "'Fraunces', Georgia, serif"
const SANS  = "'Barlow', system-ui, sans-serif"

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
    if (document.getElementById('dg-styles')) return
    const style = document.createElement('style')
    style.id = 'dg-styles'
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
      @keyframes dgFadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }

      .dg-wrap { max-width: 920px; margin: 0 auto; }
      .dg-eyebrow { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 22px; }
      .dg-eyebrow-rule { width: 26px; height: 1px; background: var(--yte-accent); }
      .dg-eyebrow-text { font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-accent); text-transform: uppercase; letter-spacing: 0.18em; }
      .dg-h1 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.04; }
      .dg-h1 em { font-style: italic; color: var(--yte-accent); }
      .dg-h2 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.08; }
      .dg-h2 em { font-style: italic; color: var(--yte-accent); }
      .dg-lead { font-family: ${SANS}; color: var(--yte-soft); line-height: 1.75; }

      .dg-label { display: block; font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-muted); text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 9px; }
      .dg-input { width: 100%; padding: 13px 14px; font-size: 15px; font-weight: 500; font-family: ${SANS}; color: var(--yte-ink); background: var(--yte-bg); border: 1px solid var(--yte-line); border-radius: 0; outline: none; transition: border-color 0.15s, background 0.15s; -webkit-appearance: none; }
      .dg-input:focus { border-color: var(--yte-accent); background: #fff; }
      .dg-check { display: flex; align-items: center; gap: 9px; font-family: ${SANS}; font-size: 13.5px; font-weight: 500; color: var(--yte-soft); cursor: pointer; }
      .dg-check input { width: 16px; height: 16px; accent-color: var(--yte-ink); cursor: pointer; }

      .dg-tool { display: grid; grid-template-columns: 0.85fr 1.15fr; gap: 12px; align-items: stretch; }
      @media (max-width: 820px) { .dg-tool { grid-template-columns: 1fr; } }
      .dg-pane { background: var(--yte-surface); border: 1px solid var(--yte-line); padding: 28px; }
      .dg-pane-dark { background: var(--yte-ink); padding: 26px; color: #fff; display: flex; flex-direction: column; min-height: 0; }
      .dg-pre { flex: 1; min-height: 0; max-height: 280px; margin: 0; font-family: 'Barlow', ui-monospace, monospace; font-size: 13.5px; line-height: 1.62; color: rgba(255,255,255,0.9); white-space: pre-wrap; word-break: break-word; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12); padding: 16px; overflow: auto; }
      .dg-copy { font-family: ${SANS}; font-size: 11.5px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; border: 1px solid rgba(255,255,255,0.22); background: transparent; color: #fff; padding: 6px 14px; cursor: pointer; transition: background 0.15s; }
      .dg-copy:hover { background: rgba(255,255,255,0.1); }
      .dg-copy:disabled { opacity: 0.4; cursor: not-allowed; }

      .dg-grow-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--yte-line); border: 1px solid var(--yte-line); }
      @media (max-width: 760px) { .dg-grow-grid { grid-template-columns: 1fr; } }
      .dg-grow-card { display: block; text-decoration: none; background: var(--yte-surface); padding: 28px; transition: background 0.15s; }
      .dg-grow-card:hover { background: var(--yte-bg-2); }

      .dg-faq-answer { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease; }
      .dg-faq-answer.open { grid-template-rows: 1fr; opacity: 1; }
      .dg-faq-answer-inner { overflow: hidden; }

      @media (max-width: 768px) { .dg-section-pad { padding-left: 22px !important; padding-right: 22px !important; } .dg-cta-pad { padding: 76px 24px !important; } }
    `
    document.head.appendChild(style)
  }, [])
}

function cap(s) { return s.replace(/\b\w/g, (c) => c.toUpperCase()) }

function buildHashtags(topic, keyword) {
  const words = (keyword + ' ' + topic).toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 2)
  const tags = Array.from(new Set(words)).slice(0, 4).map(w => '#' + w)
  tags.push('#youtube', '#youtubetips')
  return Array.from(new Set(tags)).slice(0, 6).join(' ')
}

function buildDescription({ topic, keyword, channel, timestamps, links, social, hashtags }) {
  const t = topic.trim()
  if (!t) return ''
  const kw = keyword.trim().toLowerCase()
  const name = channel.trim()
  const L = []

  L.push(kw ? `${cap(t)}: your complete guide to ${kw}.` : `${cap(t)}: everything you need to know.`)
  L.push('')
  L.push(`In this video we break down ${t.toLowerCase()}${kw ? `, with practical ${kw} tips you can use right away` : ', step by step'}. Whether you are just getting started or looking to level up, you will leave with a clear plan you can act on today.`)
  L.push('')

  if (timestamps) {
    L.push('TIMESTAMPS')
    L.push('0:00 Intro')
    L.push('0:00 [Section one]')
    L.push('0:00 [Section two]')
    L.push('0:00 [Section three]')
    L.push('0:00 Recap and next steps')
    L.push('')
  }
  if (links) {
    L.push('LINKS AND RESOURCES')
    L.push('- [Tool or resource mentioned]: [link]')
    L.push('- [Free guide or download]: [link]')
    L.push('')
  }
  L.push(name ? `Subscribe to ${name} for more videos like this: [your channel link]` : 'Subscribe for more videos like this: [your channel link]')
  L.push('')
  if (social) {
    L.push('CONNECT')
    L.push('- Instagram: ')
    L.push('- TikTok: ')
    L.push('- X / Twitter: ')
    L.push('')
  }
  if (hashtags) L.push(buildHashtags(t, keyword))

  return L.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

const HOW_IT_WORKS = [
  { h: 'The first two lines are a search snippet', p: "Only about 150 characters show before the fold and in search results, so your opening lines have to state what the video delivers and carry your main keyword. Treat them like a second title, not a throwaway." },
  { h: 'The body gives YouTube context to rank you', p: "Everything below the fold helps the algorithm understand what your video is about and which searches to match it to. A few hundred relevant words, with your keyword used naturally, gives you far more to rank on than a single line." },
  { h: 'Timestamps lift watch time', p: "Chapters let viewers jump to the part they want instead of bouncing, and they hand YouTube structured context about your content. Three or more timestamps starting at 0:00 unlock clickable chapters on the progress bar." },
  { h: 'Links and CTAs route the viewer onward', p: "A subscribe prompt, your other videos, and your socials turn one view into a follow and a longer session. Keep links relevant and disclose anything affiliate or sponsored." },
]

const GROW = [
  { label: 'Title Generator', title: 'Write titles that pull', body: 'Generate and score titles against the CTR signals that matter, then pair the winner with your new description.', href: '/tools/youtube-title-generator' },
  { label: 'SEO Studio', title: 'Rank for searches that pay', body: 'Score your title and description against the videos already ranking for your keyword, so your work targets real demand.', href: '/features/seo-studio' },
  { label: 'AI Channel Audit', title: 'Find what is holding you back', body: 'A 10-dimension audit across your last 20 videos, CTR, and retention, with a prioritized list of what to fix first.', href: '/features/channel-audit' },
]

const FAQS = [
  { q: 'What makes a good YouTube description?',
    a: "A good description does two jobs at once. The first one or two lines work like a search snippet and a hook, so they should state what the video delivers and include your main keyword naturally, because only the first 150 or so characters show before the fold. Below that, a full description gives YouTube and Google the context to rank you, helps viewers navigate with timestamps, and routes them to your other content, links, and socials. This generator lays out that structure for you so nothing important gets left out." },
  { q: 'How long should a YouTube description be?',
    a: "Use the space. YouTube allows up to 5,000 characters, and longer, well-structured descriptions give the algorithm more context to understand and recommend your video. You do not need to hit the cap, but a few hundred well-chosen words beat a single line every time. Front-load the part that matters (hook plus keyword in the first two lines), then add your summary, timestamps, links, and a subscribe prompt underneath." },
  { q: 'Where should I put keywords in the description?',
    a: "Put your main keyword in the first sentence, then use it and close variations naturally two or three more times through the body. Do not stuff it. YouTube reads the description to match your video to searches, so genuine, relevant keyword use helps, while repeating the same phrase ten times reads as spam and can hurt you. Write for the viewer first, then make sure the keyword is present where it fits." },
  { q: 'Do timestamps in the description help?',
    a: "Yes. Adding timestamps (also called chapters) creates clickable chapter markers on the progress bar, which improves the viewing experience and can lift watch time because viewers jump to what they want instead of bouncing. They also give YouTube extra structured context about your content. To enable chapters, the first timestamp must be 0:00 and you need at least three timestamps, each at least 10 seconds apart, which is exactly the format this tool sets up." },
  { q: 'Should every video description be different?',
    a: "The hook, summary, timestamps, and keywords should be unique to each video, because that is the part YouTube reads for ranking and that viewers read to decide. The boilerplate at the bottom (your subscribe line, social links, and recurring resources) can stay the same across videos to save time. The generator separates the two, so you write the unique top fresh each time and keep a consistent footer." },
  { q: 'Where do hashtags go and how many should I use?',
    a: "Add three to five relevant hashtags, either at the very end of the description or worked into the text. The first three hashtags in your description appear as clickable links above your video title. Use too many (YouTube counts more than 15 as a violation and may ignore them all) and you weaken the signal, so keep it tight and relevant to the video's topic." },
  { q: 'Will links in my description hurt the video?',
    a: "No, links are fine and expected. Adding your socials, a resource list, or affiliate links is standard practice and does not penalize the video. Two notes: disclose affiliate or sponsored links to stay within YouTube and FTC rules, and avoid linking out so aggressively that you pull viewers off the platform before they have watched, since watch time still matters most." },
  { q: 'How is this different from an AI description writer?',
    a: "This tool is deterministic and runs entirely in your browser. It builds a proven description structure (hook, keyword-rich summary, timestamps, links, subscribe prompt, hashtags) from your inputs, instantly, with no hallucination and nothing sent to a server. Treat the output as a strong, ready-to-edit template: drop in your real timestamps and links, adjust the wording to your voice, and publish." },
  { q: 'Is this free, and do you store what I type?',
    a: "Free forever, no signup, no email. The generator runs entirely in your browser, so nothing you type is sent to or stored on our servers. We built it as a genuine free tool because a good description is one of the easiest ranking wins creators leave on the table. If you want your titles and descriptions scored against the videos already ranking for your keyword, you can connect your channel for a free AI audit, but that is entirely optional." },
]

function Eyebrow({ children }) {
  return (
    <div className="dg-eyebrow">
      <span aria-hidden="true" className="dg-eyebrow-rule" />
      <span className="dg-eyebrow-text">{children}</span>
    </div>
  )
}

export default function YoutubeDescriptionGenerator() {
  useGlobalStyles()
  const { isMobile } = useBreakpoint()

  const [topic, setTopic]           = useState('')
  const [keyword, setKeyword]       = useState('')
  const [channel, setChannel]       = useState('')
  const [timestamps, setTimestamps] = useState(true)
  const [links, setLinks]           = useState(true)
  const [social, setSocial]         = useState(true)
  const [hashtags, setHashtags]     = useState(true)
  const [copied, setCopied]         = useState(false)
  const [openFaq, setOpenFaq]       = useState(0)

  const description = useMemo(
    () => buildDescription({ topic, keyword, channel, timestamps, links, social, hashtags }),
    [topic, keyword, channel, timestamps, links, social, hashtags],
  )

  const copy = () => {
    if (!description) return
    try { navigator.clipboard.writeText(description) } catch (e) { /* no-op */ }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const H1 = isMobile ? 34 : 54
  const H2 = isMobile ? 28 : 40

  return (
    <div style={{ fontFamily: SANS, background: 'var(--yte-bg)', color: 'var(--yte-ink)', overflowX: 'clip' }}>
      <SiteHeader />
      <FaqSchema items={FAQS} />

      {/* ══ HERO ══ */}
      <section className="dg-section-pad" style={{ padding: isMobile ? '60px 22px 40px' : '104px 48px 48px', background: 'var(--yte-bg)' }}>
        <div className="dg-wrap" style={{ animation: 'dgFadeUp 0.5s ease both' }}>
          <Eyebrow>Free tool</Eyebrow>
          <h1 className="dg-h1" style={{ fontSize: H1, marginBottom: 22, maxWidth: 780, textWrap: 'balance' }}>
            A YouTube description that <em>ranks and converts.</em>
          </h1>
          <div style={{ maxWidth: 640 }}>
            <p className="dg-lead" style={{ fontSize: isMobile ? 16 : 17.5, marginBottom: 14, textWrap: 'pretty' }}>
              Build a complete, SEO-friendly description in seconds: a keyword-rich hook, timestamps, links, a subscribe prompt, and hashtags, all in the structure YouTube rewards.
            </p>
            <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>No signup. No email. Free forever.</p>
          </div>
        </div>
      </section>

      {/* ══ TOOL ══ */}
      <section className="dg-section-pad" style={{ padding: isMobile ? '8px 22px 64px' : '0 48px 88px', background: 'var(--yte-bg)' }}>
        <div className="dg-wrap">
          <div className="dg-tool">
            {/* INPUTS */}
            <div className="dg-pane" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="dg-label">Video topic</label>
                <input className="dg-input" value={topic} placeholder="e.g. how to edit videos in capcut" onChange={(e) => setTopic(e.target.value)} />
              </div>
              <div>
                <label className="dg-label">Main keyword (optional)</label>
                <input className="dg-input" value={keyword} placeholder="e.g. capcut editing" onChange={(e) => setKeyword(e.target.value)} />
              </div>
              <div>
                <label className="dg-label">Channel name (optional)</label>
                <input className="dg-input" value={channel} placeholder="e.g. CreatorHQ" onChange={(e) => setChannel(e.target.value)} />
              </div>
              <div style={{ marginTop: 6, paddingTop: 18, borderTop: '1px solid var(--yte-line)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
                <label className="dg-check"><input type="checkbox" checked={timestamps} onChange={(e) => setTimestamps(e.target.checked)} />Timestamps</label>
                <label className="dg-check"><input type="checkbox" checked={links} onChange={(e) => setLinks(e.target.checked)} />Links section</label>
                <label className="dg-check"><input type="checkbox" checked={social} onChange={(e) => setSocial(e.target.checked)} />Social links</label>
                <label className="dg-check"><input type="checkbox" checked={hashtags} onChange={(e) => setHashtags(e.target.checked)} />Hashtags</label>
              </div>
            </div>

            {/* OUTPUT (dark) */}
            <div className="dg-pane-dark">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>Your description</span>
                <button className="dg-copy" onClick={copy} disabled={!description}>{copied ? 'Copied' : 'Copy'}</button>
              </div>
              {description ? (
                <pre className="dg-pre">{description}</pre>
              ) : (
                <div style={{ flex: 1, minHeight: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                  <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 400, color: '#fff', marginBottom: 8 }}>Your description appears here</div>
                  <div style={{ fontFamily: SANS, fontSize: 13.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, maxWidth: 300 }}>Enter your video topic and the full description builds as you type.</div>
                </div>
              )}
              {description && (
                <div style={{ marginTop: 12, fontFamily: SANS, fontSize: 11.5, color: 'rgba(255,255,255,0.5)' }}>
                  {description.length} / 5000 characters · the first ~150 show in search, so keep your hook up top.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section className="dg-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div className="dg-wrap">
          <div style={{ marginBottom: 40, maxWidth: 680 }}>
            <Eyebrow>What a description does</Eyebrow>
            <h2 className="dg-h2" style={{ fontSize: H2, textWrap: 'balance' }}>Why the description <em>earns its keep.</em></h2>
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

      {/* ══ BEYOND THE DESCRIPTION (grow cards) ══ */}
      <section className="dg-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-bg)' }}>
        <div className="dg-wrap">
          <div style={{ marginBottom: 32, maxWidth: 680 }}>
            <Eyebrow>Beyond the description</Eyebrow>
            <h2 className="dg-h2" style={{ fontSize: H2, marginBottom: 12, textWrap: 'balance' }}>The description supports. <em>The package sells.</em></h2>
            <p className="dg-lead" style={{ fontSize: 17 }}>A great description helps you rank, but the title and thumbnail earn the click. YTGrowth scores all three.</p>
          </div>
          <div className="dg-grow-grid">
            {GROW.map((c, i) => (
              <a key={i} href={c.href} className="dg-grow-card">
                <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: 'var(--yte-accent)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 14 }}>{c.label}</div>
                <h3 style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 400, color: 'var(--yte-ink)', letterSpacing: '-0.3px', marginBottom: 12, lineHeight: 1.2 }}>{c.title}</h3>
                <p style={{ fontFamily: SANS, fontSize: 14.5, color: 'var(--yte-soft)', lineHeight: 1.65 }}>{c.body}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <div className="dg-section-pad" style={{ background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)', padding: isMobile ? '60px 22px' : '104px 48px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '320px 1fr', gap: isMobile ? 36 : 80, alignItems: 'start' }}>
          <div>
            <Eyebrow>Frequently asked</Eyebrow>
            <h2 className="dg-h2" style={{ fontSize: 'clamp(34px, 4.4vw, 54px)', marginBottom: 14, textWrap: 'balance' }}>Descriptions, <em>answered.</em></h2>
            <p className="dg-lead" style={{ fontSize: 14.5, maxWidth: 300 }}>
              Everything creators ask about descriptions that rank. Still unsure? <a href="/contact" style={{ color: 'var(--yte-accent)', fontWeight: 600, textDecoration: 'none' }}>Email us.</a>
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
                  <div className={`dg-faq-answer${isOpen ? ' open' : ''}`}>
                    <div className="dg-faq-answer-inner">
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
