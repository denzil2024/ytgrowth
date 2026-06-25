import { useEffect, useState, useMemo } from 'react'
import LandingFooter from '../../components/LandingFooter'
import SiteHeader from '../../components/SiteHeader'
import FaqSchema from '../../components/FaqSchema'

/* ─── Free SEO tool: YouTube Description Generator ────────────────────────
   /tools/youtube-description-generator. Zero YouTube-API cost: assembles a
   structured, SEO-friendly description entirely client-side. Visual DNA
   mirrors the other tool pages (Landing system: DM Sans headlines, Inter
   body, --ytg-* tokens, eyebrow pills, numbered FAQ). No emoji, no em-dash. */

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
    if (document.getElementById('ytg-dg-styles')) return
    const link = document.createElement('link')
    link.id = 'ytg-dg-font'
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap'
    document.head.appendChild(link)

    const style = document.createElement('style')
    style.id = 'ytg-dg-styles'
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
      @keyframes dgFadeUp { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }

      .dg-btn {
        display: inline-flex; align-items: center; gap: 8px;
        background: var(--ytg-accent); color: #fff;
        font-size: 15px; font-weight: 700; font-family: 'Inter', system-ui, sans-serif;
        padding: 14px 28px; border-radius: 100px; border: none;
        cursor: pointer; text-decoration: none; letter-spacing: -0.2px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,48,42,0.32);
        transition: filter 0.18s, transform 0.18s, box-shadow 0.18s;
      }
      .dg-btn:hover { filter: brightness(1.07); transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.15), 0 8px 28px rgba(229,48,42,0.42); }
      .dg-btn-lg { font-size: 16px; padding: 17px 36px; }

      .dg-eyebrow { display: inline-flex; align-items: center; gap: 8px; background: #ffffff; border: 1px solid rgba(10,10,15,0.09); border-radius: 100px; padding: 5px 12px 5px 10px; margin-bottom: 20px; box-shadow: 0 1px 2px rgba(10,10,15,0.04); }
      .dg-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--ytg-accent); box-shadow: 0 0 0 3px rgba(229,48,42,0.12); }
      .dg-eyebrow-text { font-size: 11px; font-weight: 700; color: var(--ytg-text-2); text-transform: uppercase; letter-spacing: 0.09em; }

      .dg-input { width: 100%; padding: 12px 14px; font-size: 14px; font-weight: 500; font-family: inherit; color: var(--ytg-text); background: #fafafb; border: 1px solid var(--ytg-border); border-radius: 10px; outline: none; transition: border-color 0.15s, background 0.15s; -webkit-appearance: none; }
      .dg-input:focus { border-color: rgba(10,10,15,0.28); background: #fff; }

      .dg-check { display: flex; align-items: center; gap: 9px; cursor: pointer; user-select: none; font-size: 13.5px; font-weight: 500; color: var(--ytg-text-2); }
      .dg-check input { appearance: none; -webkit-appearance: none; width: 18px; height: 18px; border: 1px solid var(--ytg-border-2); border-radius: 6px; background: #fff; cursor: pointer; position: relative; flex-shrink: 0; transition: background 0.15s, border-color 0.15s; }
      .dg-check input:checked { background: var(--ytg-accent); border-color: var(--ytg-accent); }
      .dg-check input:checked::after { content: ''; position: absolute; left: 5px; top: 2px; width: 5px; height: 9px; border: solid #fff; border-width: 0 2px 2px 0; transform: rotate(45deg); }

      .dg-faq-answer { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease; }
      .dg-faq-answer.open { grid-template-rows: 1fr; opacity: 1; }
      .dg-faq-answer-inner { overflow: hidden; }

      .dg-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 22px; }
      .dg-tool-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: stretch; }

      @media (max-width: 900px) { .dg-grid-3 { grid-template-columns: 1fr; } .dg-tool-grid { grid-template-columns: 1fr; } }
      @media (max-width: 768px) { .dg-section-pad { padding-left: 20px !important; padding-right: 20px !important; } .dg-cta-pad { padding: 70px 24px !important; } }
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

  // First two lines carry the most SEO weight and show in the search snippet.
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
      <span aria-hidden="true" className="dg-eyebrow-dot" />
      <span className="dg-eyebrow-text">{children}</span>
    </div>
  )
}

export default function YoutubeDescriptionGenerator() {
  useGlobalStyles()
  const { isMobile, isTablet } = useBreakpoint()

  const [topic, setTopic]       = useState('')
  const [keyword, setKeyword]   = useState('')
  const [channel, setChannel]   = useState('')
  const [timestamps, setTimestamps] = useState(true)
  const [links, setLinks]       = useState(true)
  const [social, setSocial]     = useState(true)
  const [hashtags, setHashtags] = useState(true)
  const [copied, setCopied]     = useState(false)
  const [openFaq, setOpenFaq]   = useState(0)

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

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: 'var(--ytg-bg)', color: 'var(--ytg-text)', overflowX: 'hidden' }}>

      <SiteHeader />
      <FaqSchema items={FAQS} />

      {/* ══ HERO ══ */}
      <section className="dg-section-pad" style={{ position: 'relative', padding: isMobile ? '64px 24px 56px' : '110px 48px 84px', textAlign: 'center', background: '#ffffff', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '120vw', maxWidth: 1400, height: 620, background: 'radial-gradient(ellipse at center top, rgba(229,48,42,0.07) 0%, rgba(229,48,42,0.02) 40%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1, animation: 'dgFadeUp 0.5s ease both' }}>
          <Eyebrow>Free tool</Eyebrow>
          <h1 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 34 : isTablet ? 56 : 64, lineHeight: isMobile ? 1.1 : 1.04, letterSpacing: isMobile ? '-0.6px' : '-2.2px', color: 'var(--ytg-text)', marginBottom: 22, textWrap: 'balance' }}>
            A YouTube description that <span style={{ color: 'var(--ytg-accent)' }}>ranks and converts.</span>
          </h1>
          <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 16 : 19, color: 'var(--ytg-text-2)', lineHeight: 1.7, maxWidth: 640, margin: '0 auto 28px', textWrap: 'pretty' }}>
            Build a complete, SEO-friendly description in seconds: a keyword-rich hook, timestamps, links, a subscribe prompt, and hashtags, all in the structure YouTube rewards.
          </p>
          <p style={{ fontSize: 13, color: 'var(--ytg-text-3)', fontWeight: 500 }}>No signup. No email. Runs in your browser.</p>
        </div>
      </section>

      {/* ══ TOOL ══ */}
      <section id="tool" className="dg-section-pad" style={{ padding: isMobile ? '48px 20px 80px' : '72px 48px 110px', background: 'var(--ytg-bg)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div className="dg-tool-grid">

            {/* LEFT: inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ background: 'var(--ytg-card)', borderRadius: 22, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-lg)', padding: isMobile ? 26 : 36 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Video topic</label>
                <input className="dg-input" value={topic} placeholder="e.g. how to edit videos in capcut" onChange={(e) => setTopic(e.target.value)} />

                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '18px 0 8px' }}>Main keyword (optional)</label>
                <input className="dg-input" value={keyword} placeholder="e.g. capcut editing" onChange={(e) => setKeyword(e.target.value)} />

                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '18px 0 8px' }}>Channel name (optional)</label>
                <input className="dg-input" value={channel} placeholder="e.g. CreatorHQ" onChange={(e) => setChannel(e.target.value)} />

                <div style={{ marginTop: 22, paddingTop: 20, borderTop: '1px solid var(--ytg-border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <label className="dg-check"><input type="checkbox" checked={timestamps} onChange={(e) => setTimestamps(e.target.checked)} />Timestamps</label>
                  <label className="dg-check"><input type="checkbox" checked={links} onChange={(e) => setLinks(e.target.checked)} />Links section</label>
                  <label className="dg-check"><input type="checkbox" checked={social} onChange={(e) => setSocial(e.target.checked)} />Social links</label>
                  <label className="dg-check"><input type="checkbox" checked={hashtags} onChange={(e) => setHashtags(e.target.checked)} />Hashtags</label>
                </div>
              </div>

              <div style={{ flex: 1, background: 'var(--ytg-card)', borderRadius: 22, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow)', padding: 26 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ytg-accent-text)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Score it against rivals</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--ytg-text)', lineHeight: 1.5, marginBottom: 8, letterSpacing: '-0.2px' }}>A template gets you started. The top results set the bar.</p>
                <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.65, marginBottom: 18 }}>
                  YTGrowth's SEO Studio scores your title and description against the videos already ranking for your keyword, so you optimize toward what is winning in your niche.
                </p>
                <a href="/auth/login" className="dg-btn" style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 14, borderRadius: 14 }}>Get my free audit →</a>
                <p style={{ fontSize: 11.5, color: 'var(--ytg-text-3)', textAlign: 'center', marginTop: 10 }}>Free trial · no card · upgrade anytime</p>
              </div>
            </div>

            {/* RIGHT: output */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1, background: 'var(--ytg-card)', borderRadius: 22, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow)', padding: isMobile ? 20 : 24, display: 'flex', flexDirection: 'column', minHeight: 360 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your description</span>
                  <button onClick={copy} disabled={!description}
                    style={{ fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, color: copied ? '#0f7a43' : 'var(--ytg-accent-text)', background: copied ? 'rgba(26,157,90,0.10)' : 'var(--ytg-accent-light)', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: description ? 'pointer' : 'not-allowed', opacity: description ? 1 : 0.5 }}>
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                {description ? (
                  <pre style={{ flex: 1, margin: 0, fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13.5, lineHeight: 1.6, color: 'var(--ytg-text)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: '#fafafb', border: '1px solid var(--ytg-border)', borderRadius: 12, padding: 16, overflow: 'auto' }}>{description}</pre>
                ) : (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--ytg-text-3)', padding: 24, background: '#fafafb', border: '1px solid var(--ytg-border)', borderRadius: 12 }}>
                    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 17, fontWeight: 700, color: 'var(--ytg-text-2)', marginBottom: 6 }}>Your description will appear here</div>
                    <div style={{ fontSize: 13.5, lineHeight: 1.6, maxWidth: 320 }}>Enter your video topic on the left and the full description builds as you type.</div>
                  </div>
                )}
                {description && (
                  <div style={{ marginTop: 12, fontSize: 11.5, color: 'var(--ytg-text-3)' }}>
                    {description.length} / 5000 characters · the first ~150 show in search, so keep your hook up top.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how-it-works" className="dg-section-pad" style={{ padding: isMobile ? '72px 20px' : '110px 48px', background: 'var(--ytg-bg-2)', borderTop: '1px solid var(--ytg-border)', borderBottom: '1px solid var(--ytg-border)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ marginBottom: 48, maxWidth: 720 }}>
            <Eyebrow>What a description does</Eyebrow>
            <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: 'var(--ytg-text)', lineHeight: 1.06, textWrap: 'balance' }}>
              Why the description <span style={{ color: 'var(--ytg-accent)' }}>earns its keep.</span>
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {[
              { h: 'The first two lines are a search snippet', p: "Only about 150 characters show before the fold and in search results, so your opening lines have to state what the video delivers and carry your main keyword. Treat them like a second title, not a throwaway." },
              { h: 'The body gives YouTube context to rank you', p: "Everything below the fold helps the algorithm understand what your video is about and which searches to match it to. A few hundred relevant words, with your keyword used naturally, gives you far more to rank on than a single line." },
              { h: 'Timestamps lift watch time', p: "Chapters let viewers jump to the part they want instead of bouncing, and they hand YouTube structured context about your content. Three or more timestamps starting at 0:00 unlock clickable chapters on the progress bar." },
              { h: 'Links and CTAs route the viewer onward', p: "A subscribe prompt, your other videos, and your socials turn one view into a follow and a longer session. Keep links relevant and disclose anything affiliate or sponsored." },
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
      <section className="dg-section-pad" style={{ padding: isMobile ? '72px 20px' : '110px 48px', background: 'var(--ytg-bg)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ marginBottom: 44, textAlign: 'center', maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
            <Eyebrow>Beyond the description</Eyebrow>
            <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: 'var(--ytg-text)', lineHeight: 1.06, marginBottom: 16, textWrap: 'balance' }}>
              The description supports. <span style={{ color: 'var(--ytg-accent)' }}>The package sells.</span>
            </h2>
            <p style={{ fontSize: 16, color: 'var(--ytg-text-2)', lineHeight: 1.7 }}>A great description helps you rank, but the title and thumbnail earn the click. YTGrowth scores all three.</p>
          </div>
          <div className="dg-grid-3">
            {[
              { label: 'Title Generator', title: 'Write titles that pull', body: 'Generate and score titles against the CTR signals that matter, then pair the winner with your new description.', href: '/tools/youtube-title-generator' },
              { label: 'SEO Studio', title: 'Rank for searches that pay', body: 'Score your title and description against the videos already ranking for your keyword, so your work targets real demand.', href: '/features/seo-studio' },
              { label: 'AI Channel Audit', title: 'Find what is holding you back', body: 'A 10-dimension audit across your last 20 videos, CTR, and retention, with a prioritized list of what to fix first.', href: '/features/channel-audit' },
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
      <section className="dg-section-pad dg-cta-pad" style={{ padding: isMobile ? '88px 24px' : '120px 48px', background: '#0d0d12', borderTop: '1px solid rgba(255,255,255,0.07)', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: '42%', left: '50%', transform: 'translate(-50%,-50%)', width: 1000, height: isMobile ? 600 : 800, background: 'radial-gradient(ellipse, rgba(229,48,42,0.20) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 100, padding: '5px 12px 5px 10px', marginBottom: 22 }}>
            <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff3b30', boxShadow: '0 0 0 3px rgba(229,48,42,0.18)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.78)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>Free AI audit</span>
          </div>
          <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: '#ffffff', lineHeight: 1.06, marginBottom: 16, textWrap: 'balance' }}>
            A good description is the floor. <span style={{ color: '#ff3b30' }}>Raise the ceiling.</span>
          </h2>
          <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 16 : 19, color: 'rgba(255,255,255,0.68)', lineHeight: 1.7, marginBottom: 32, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
            Connect your channel for a free AI audit and get titles, descriptions, and thumbnails scored against the videos winning in your niche.
          </p>
          <a href="/auth/login" className="dg-btn dg-btn-lg">Get my free audit →</a>
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
              Everything creators ask about writing descriptions that rank. Still unsure? <a href="/contact" style={{ color: 'var(--ytg-accent)', fontWeight: 600, textDecoration: 'none' }}>Email us.</a>
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
                  <div className={`dg-faq-answer${isOpen ? ' open' : ''}`}>
                    <div className="dg-faq-answer-inner">
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
