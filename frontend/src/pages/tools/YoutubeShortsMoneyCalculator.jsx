import { useEffect, useState, useMemo } from 'react'
import LandingFooter from '../../components/LandingFooter'
import SiteHeader from '../../components/SiteHeader'
import FaqSchema from '../../components/FaqSchema'

/* ─── Free SEO tool: YouTube Shorts Money Calculator ──────────────────────
   /tools/youtube-shorts-money-calculator. Zero YouTube-API cost: runs
   entirely client-side. Visual DNA mirrors YoutubeMoneyCalculator (Landing
   system: DM Sans headlines, Inter body, --ytg-* tokens, eyebrow pills,
   numbered FAQ). Shorts pay from a shared ad pool, so earnings are far lower
   per view than long-form and driven mostly by audience country, not niche. */

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
    if (document.getElementById('ytg-smc-styles')) return

    const style = document.createElement('style')
    style.id = 'ytg-smc-styles'
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
      @keyframes smcFadeUp { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }

      .smc-btn {
        display: inline-flex; align-items: center; gap: 8px;
        background: var(--ytg-accent); color: #fff;
        font-size: 15px; font-weight: 700; font-family: 'Inter', system-ui, sans-serif;
        padding: 14px 28px; border-radius: 100px; border: none;
        cursor: pointer; text-decoration: none; letter-spacing: -0.2px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 4px 14px rgba(229,48,42,0.32);
        transition: filter 0.18s, transform 0.18s, box-shadow 0.18s;
      }
      .smc-btn:hover { filter: brightness(1.07); transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.15), 0 8px 28px rgba(229,48,42,0.42); }
      .smc-btn-lg { font-size: 16px; padding: 17px 36px; }

      .smc-eyebrow { display: inline-flex; align-items: center; gap: 8px; background: #ffffff; border: 1px solid rgba(10,10,15,0.09); border-radius: 100px; padding: 5px 12px 5px 10px; margin-bottom: 20px; box-shadow: 0 1px 2px rgba(10,10,15,0.04); }
      .smc-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--ytg-accent); box-shadow: 0 0 0 3px rgba(229,48,42,0.12); }
      .smc-eyebrow-text { font-size: 11px; font-weight: 700; color: var(--ytg-text-2); text-transform: uppercase; letter-spacing: 0.09em; }

      .smc-input { width: 100%; padding: 12px 14px; font-size: 14px; font-weight: 500; font-family: inherit; color: var(--ytg-text); background: #fafafb; border: 1px solid var(--ytg-border); border-radius: 10px; outline: none; transition: border-color 0.15s, background 0.15s; -webkit-appearance: none; }
      .smc-input:focus { border-color: rgba(10,10,15,0.28); background: #fff; }

      .smc-faq-answer { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease; }
      .smc-faq-answer.open { grid-template-rows: 1fr; opacity: 1; }
      .smc-faq-answer-inner { overflow: hidden; }

      .smc-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 22px; }
      .smc-calc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: stretch; }

      @media (max-width: 900px) { .smc-grid-3 { grid-template-columns: 1fr; } .smc-calc-grid { grid-template-columns: 1fr; } }
      @media (max-width: 768px) { .smc-section-pad { padding-left: 20px !important; padding-right: 20px !important; } .smc-cta-pad { padding: 70px 24px !important; } }
    `
    document.head.appendChild(style)
  }, [])
}

/* ── Shorts RPM ($ per 1,000 Shorts views) by audience country ────────────
   Shorts pay from a shared ad pool (creators get 45% of allocated Shorts ad
   revenue), so RPM is far lower and far flatter across niches than long-form.
   Audience country is the dominant lever. Tier-1 band ~$0.04-$0.10. */
const COUNTRIES = [
  { key: 'tier1', label: 'United States / UK / Canada / Australia', mult: 1.0 },
  { key: 'tier2', label: 'Western Europe (Germany, France, NL...)', mult: 0.72 },
  { key: 'tier3', label: 'Developed Asia (Japan, S. Korea, SG)',    mult: 0.62 },
  { key: 'tier4', label: 'Eastern Europe (Poland, Czech, etc.)',    mult: 0.45 },
  { key: 'tier5', label: 'Latin America (Brazil, Mexico, Arg...)',  mult: 0.32 },
  { key: 'tier6', label: 'India / SE Asia',                         mult: 0.22 },
  { key: 'tier7', label: 'Africa / Other',                          mult: 0.18 },
  { key: 'mixed', label: 'Mixed / Global audience',                 mult: 0.55 },
]
const SHORTS_RPM_LOW = 0.04
const SHORTS_RPM_HIGH = 0.10

function fmtMoney(n) { return '$' + Math.max(0, Math.round(n)).toLocaleString() }
function fmtViews(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K'
  return n.toString()
}

const FAQS = [
  { q: 'How much do YouTube Shorts pay?',
    a: "Far less per view than long-form. Typical Shorts RPM is roughly $0.04 to $0.10 per 1,000 views for a tier-1 audience, versus $3 to $30 for long-form videos. That is because Shorts have no mid-rolls and no skippable in-stream ads. Revenue comes from a shared pool funded by ads running between Shorts in the feed, and creators receive 45% of the portion allocated to them. A Short with 1 million views might earn $40 to $100; the same million views on a long-form video in the right niche could earn thousands." },
  { q: 'How is Shorts revenue calculated?',
    a: "YouTube pools the ad money generated in the Shorts feed, sets aside the share owed to music licensing, and then distributes the rest to eligible creators based on their share of total Shorts views (specifically views on monetizing Shorts). From that allocated pool, creators keep 45%. Because it is a pooled, view-share model rather than ads-on-your-specific-video, your exact RPM moves with overall advertiser demand, your audience country, and how much licensed music your Shorts use." },
  { q: 'Why does audience country change my Shorts earnings so much?',
    a: "Advertiser spending power varies dramatically by region, and the Shorts pool in a high-spend country is simply bigger. Views from the US, UK, Canada, and Australia are worth several times more than views from many tier-3 regions. The same Short, with the same view count, earns very different amounts depending on where the viewers are. This calculator applies a country multiplier on top of the base Shorts RPM so the estimate reflects your real audience mix, which you can check in YouTube Studio under Analytics, Audience, Top geographies." },
  { q: 'Do I need to be in the YouTube Partner Program to earn from Shorts?',
    a: "Yes. To earn ad revenue from Shorts you must be accepted into the YouTube Partner Program. The Shorts path to eligibility is 1,000 subscribers plus 10 million valid public Shorts views in the last 90 days (the long-form path of 4,000 watch hours also qualifies you). Once you are in, you opt into Shorts monetization in YouTube Studio, and you also need an AdSense account in good standing and to live in a country where the program is available." },
  { q: 'Does using popular music lower my Shorts payout?',
    a: "It can. When your Short uses licensed commercial music, a portion of the revenue that Short generates is shared with the music rights holders before your cut is calculated, which reduces your take. Shorts that use no music, original audio, or royalty-free tracks keep the full creator share. If maximizing revenue matters more than trend-chasing, original or license-free audio pays better per view." },
  { q: 'Are Shorts even worth making if they pay so little?',
    a: "Yes, but as a growth tool, not a revenue tool. Shorts are one of the fastest ways to put your channel in front of new viewers, and a Short that goes viral can send a wave of subscribers to your long-form catalogue, which is where the real money is. The smart play is to use Shorts to grow the audience, then monetize that audience with long-form videos, memberships, sponsorships, and your own products. Treat the Shorts ad revenue as a small bonus on top." },
  { q: 'How do I earn more than just Shorts ad revenue?',
    a: "Most creators who grow on Shorts make far more from everything around the ads: brand sponsorships and integrations (often paying many times the ad RPM), affiliate links in the description, selling your own digital products or merch, channel memberships and Patreon, and converting Shorts viewers into long-form watchers who see higher-paying mid-roll ads. A channel earning a few hundred dollars a month from Shorts ads can be earning several times that once you count the rest." },
  { q: 'Why is my real Shorts revenue different from this estimate?',
    a: "A few reasons: the Shorts pool size shifts with advertiser demand and season (Q4 pays more than Q1), your real audience-country mix may differ from what you picked, the share of your Shorts using licensed music changes your cut, and only views on monetizing Shorts count toward the payout. Treat the number here as a realistic range, not a guarantee. Check YouTube Studio, Analytics, Revenue for your actual Shorts RPM once you are monetized." },
  { q: 'Is this calculator free, and do you store my data?',
    a: "Free forever, no signup, no email. The calculator runs entirely in your browser, so nothing you type is sent to or stored on our servers. We built it as a genuine free tool because creators deserve a realistic picture of Shorts earnings before they pour months into the format. If you want a real growth plan that turns Shorts reach into long-form revenue, you can connect your channel for a free AI audit, but that is entirely optional." },
]

function Eyebrow({ children }) {
  return (
    <div className="smc-eyebrow">
      <span aria-hidden="true" className="smc-eyebrow-dot" />
      <span className="smc-eyebrow-text">{children}</span>
    </div>
  )
}

export default function YoutubeShortsMoneyCalculator() {
  useGlobalStyles()
  const { isMobile, isTablet } = useBreakpoint()

  const [views, setViews]     = useState(1_000_000)
  const [country, setCountry] = useState('tier1')
  const [openFaq, setOpenFaq] = useState(0)

  const result = useMemo(() => {
    const c = COUNTRIES.find(x => x.key === country) || COUNTRIES[0]
    const lowRpm  = SHORTS_RPM_LOW  * c.mult
    const highRpm = SHORTS_RPM_HIGH * c.mult
    const monthlyLow  = views * (lowRpm  / 1000)
    const monthlyHigh = views * (highRpm / 1000)
    return { lowRpm, highRpm, monthlyLow, monthlyHigh, annualLow: monthlyLow * 12, annualHigh: monthlyHigh * 12 }
  }, [views, country])

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: 'var(--ytg-bg)', color: 'var(--ytg-text)', overflowX: 'clip' }}>

      <SiteHeader />
      <FaqSchema items={FAQS} />

      {/* ══ HERO ══ */}
      <section className="smc-section-pad" style={{ position: 'relative', padding: isMobile ? '64px 24px 56px' : '110px 48px 84px', textAlign: 'center', background: '#ffffff', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '120vw', maxWidth: 1400, height: 620, background: 'radial-gradient(ellipse at center top, rgba(229,48,42,0.07) 0%, rgba(229,48,42,0.02) 40%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1, animation: 'smcFadeUp 0.5s ease both' }}>
          <Eyebrow>Free tool</Eyebrow>
          <h1 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 34 : isTablet ? 56 : 64, lineHeight: isMobile ? 1.1 : 1.04, letterSpacing: isMobile ? '-0.6px' : '-2.2px', color: 'var(--ytg-text)', marginBottom: 22, textWrap: 'balance' }}>
            How much do YouTube Shorts <span style={{ color: 'var(--ytg-accent)' }}>pay?</span>
          </h1>
          <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 16 : 19, color: 'var(--ytg-text-2)', lineHeight: 1.7, maxWidth: 640, margin: '0 auto 28px', textWrap: 'pretty' }}>
            A realistic YouTube Shorts money calculator built on the real shared-pool RPM, not the inflated numbers most calculators show. Shorts pay far less per view than long-form, and this shows you roughly how much.
          </p>
          <p style={{ fontSize: 13, color: 'var(--ytg-text-3)', fontWeight: 500 }}>No signup. No email. Runs in your browser.</p>
        </div>
      </section>

      {/* ══ CALCULATOR ══ */}
      <section id="calculator" className="smc-section-pad" style={{ padding: isMobile ? '48px 20px 80px' : '72px 48px 110px', background: 'var(--ytg-bg)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div className="smc-calc-grid">

            {/* LEFT: inputs + grow CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ background: 'var(--ytg-card)', borderRadius: 22, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow-lg)', padding: isMobile ? 26 : 36 }}>
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Monthly Shorts views</label>
                    <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--ytg-accent)', letterSpacing: '-0.8px', fontVariantNumeric: 'tabular-nums' }}>{fmtViews(views)}</span>
                  </div>
                  <input type="range" min={10000} max={50000000} step={10000} value={views}
                    onChange={e => setViews(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--ytg-accent)', cursor: 'pointer', height: 4 }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ytg-text-3)', marginTop: 4 }}>
                    <span>10K</span><span>1M</span><span>10M</span><span>50M</span>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--ytg-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Audience country</label>
                  <select className="smc-input" value={country} onChange={e => setCountry(e.target.value)}>
                    {COUNTRIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>

                <p style={{ fontSize: 11.5, color: 'var(--ytg-text-3)', marginTop: 22, lineHeight: 1.6 }}>
                  Shorts earnings come from a shared ad pool (creators receive 45%), so they are far lower per view than long-form and vary with advertiser demand, audience country, and licensed-music usage.
                </p>
              </div>

              <div style={{ flex: 1, background: 'var(--ytg-card)', borderRadius: 22, border: '1px solid var(--ytg-border)', boxShadow: 'var(--ytg-shadow)', padding: 26 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ytg-accent-text)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Turn reach into revenue</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--ytg-text)', lineHeight: 1.5, marginBottom: 8, letterSpacing: '-0.2px' }}>Shorts grow the audience. Long-form pays the bills.</p>
                <p style={{ fontSize: 14, color: 'var(--ytg-text-2)', lineHeight: 1.65, marginBottom: 18 }}>
                  YTGrowth's free AI audit shows you how to convert Shorts viewers into long-form watch time, where the real RPM lives, with prioritized fixes for your titles, thumbnails, and content mix.
                </p>
                <a href="/auth/login" className="smc-btn" style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 14, borderRadius: 14 }}>Get my free audit →</a>
                <p style={{ fontSize: 11.5, color: 'var(--ytg-text-3)', textAlign: 'center', marginTop: 10 }}>Free trial · no card · upgrade anytime</p>
              </div>
            </div>

            {/* RIGHT: result */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--ytg-accent)', borderRadius: 22, color: '#fff', padding: isMobile ? 28 : 36, boxShadow: '0 4px 18px rgba(229,48,42,0.32), 0 24px 60px rgba(229,48,42,0.18)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.78, marginBottom: 12 }}>Estimated monthly Shorts earnings</div>
                <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 36 : 46, fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.05, marginBottom: 8 }}>
                  {fmtMoney(result.monthlyLow)} – {fmtMoney(result.monthlyHigh)}
                </div>
                <div style={{ fontSize: 13.5, opacity: 0.82 }}>{fmtViews(views)} Shorts views/mo · {(COUNTRIES.find(c => c.key === country) || COUNTRIES[0]).label}</div>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.2)', margin: '22px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, opacity: 0.74, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Per year</div>
                    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: '-0.8px' }}>{fmtMoney(result.annualLow)} – {fmtMoney(result.annualHigh)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, opacity: 0.74, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Shorts RPM</div>
                    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: '-0.8px' }}>${result.lowRpm.toFixed(3)} – ${result.highRpm.toFixed(3)}</div>
                  </div>
                </div>
                <div style={{ marginTop: 'auto', paddingTop: 28 }}>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.2)', marginBottom: 18 }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 12.5, opacity: 0.82, lineHeight: 1.5, maxWidth: 360 }}>
                      RPM is per 1,000 Shorts views, after YouTube's pool split and the music-licensing share.
                    </div>
                    <a href="#how-shorts-pay" style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', textDecoration: 'none', whiteSpace: 'nowrap', borderBottom: '1px solid rgba(255,255,255,0.45)', paddingBottom: 1 }}>See the math →</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW SHORTS PAY ══ */}
      <section id="how-shorts-pay" className="smc-section-pad" style={{ padding: isMobile ? '72px 20px' : '110px 48px', background: 'var(--ytg-bg-2)', borderTop: '1px solid var(--ytg-border)', borderBottom: '1px solid var(--ytg-border)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ marginBottom: 48, maxWidth: 720 }}>
            <Eyebrow>How it works</Eyebrow>
            <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: 'var(--ytg-text)', lineHeight: 1.06, textWrap: 'balance' }}>
              How Shorts money <span style={{ color: 'var(--ytg-accent)' }}>works.</span>
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {[
              { h: 'Shorts pay from a shared pool, not from ads on your video', p: "There are no mid-rolls or skippable ads on a Short. YouTube collects the ad money running between Shorts in the feed, sets aside the music-licensing share, and splits the rest among creators by their share of monetizing Shorts views. You keep 45% of what is allocated to you. That pooled model is why Shorts RPM is a fraction of long-form." },
              { h: 'Audience country is the biggest lever', p: "Because the pool is funded by advertisers, views from high-spend countries (US, UK, Canada, Australia) are worth several times more than views from lower-spend regions. The same Short earns wildly different amounts depending on where it is watched. Niche matters far less for Shorts than it does for long-form." },
              { h: 'Licensed music takes a cut before you get paid', p: "If your Short uses popular commercial tracks, the rights holders are paid out of that Short's revenue before your 45% is calculated. Original audio or royalty-free music keeps the full creator share, so music choice quietly changes your effective RPM." },
              { h: 'The real value of Shorts is reach, not the ad cheque', p: "A viral Short can send thousands of new viewers to your channel. The winning strategy is to use Shorts to grow an audience, then earn from that audience through long-form mid-roll ads, sponsorships, and your own products, where the money per viewer is many times higher." },
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
      <section className="smc-section-pad" style={{ padding: isMobile ? '72px 20px' : '110px 48px', background: 'var(--ytg-bg)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ marginBottom: 44, textAlign: 'center', maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
            <Eyebrow>Earn more from Shorts</Eyebrow>
            <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: 'var(--ytg-text)', lineHeight: 1.06, marginBottom: 16, textWrap: 'balance' }}>
              Shorts get the reach. <span style={{ color: 'var(--ytg-accent)' }}>Now bank it.</span>
            </h2>
            <p style={{ fontSize: 16, color: 'var(--ytg-text-2)', lineHeight: 1.7 }}>The money is in turning Shorts viewers into long-form watchers. YTGrowth helps you do exactly that.</p>
          </div>
          <div className="smc-grid-3">
            {[
              { label: 'AI Channel Audit', title: 'Find the leaks', body: 'A 10-dimension audit of your last 20 videos, CTR, and retention, with a prioritized list of what to fix to convert Shorts reach into long-form views.', href: '/features/channel-audit' },
              { label: 'Title Generator', title: 'Write titles that pull', body: 'Generate and score titles for your long-form uploads so the viewers your Shorts send click through and stay.', href: '/tools/youtube-title-generator' },
              { label: 'SEO Studio', title: 'Rank for searches that pay', body: 'Score titles and descriptions against the top-ranking videos in your niche, so your long-form earns the high-RPM search and suggested traffic.', href: '/features/seo-studio' },
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
      <section className="smc-section-pad smc-cta-pad" style={{ padding: isMobile ? '88px 24px' : '120px 48px', background: '#0d0d12', borderTop: '1px solid rgba(255,255,255,0.07)', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: '42%', left: '50%', transform: 'translate(-50%,-50%)', width: 1000, height: isMobile ? 600 : 800, background: 'radial-gradient(ellipse, rgba(229,48,42,0.20) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 100, padding: '5px 12px 5px 10px', marginBottom: 22 }}>
            <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff3b30', boxShadow: '0 0 0 3px rgba(229,48,42,0.18)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.78)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>Free AI audit</span>
          </div>
          <h2 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: isMobile ? 32 : 48, letterSpacing: '-1.5px', color: '#ffffff', lineHeight: 1.06, marginBottom: 16, textWrap: 'balance' }}>
            Stop counting pennies. <span style={{ color: '#ff3b30' }}>Build real revenue.</span>
          </h2>
          <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: isMobile ? 16 : 19, color: 'rgba(255,255,255,0.68)', lineHeight: 1.7, marginBottom: 32, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
            Connect your channel for a free AI audit and get a plan to turn Shorts reach into long-form watch time, the part that pays.
          </p>
          <a href="/auth/login" className="smc-btn smc-btn-lg">Get my free audit →</a>
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
              Everything creators ask about Shorts pay before they commit to the format. Still unsure? <a href="/contact" style={{ color: 'var(--ytg-accent)', fontWeight: 600, textDecoration: 'none' }}>Email us.</a>
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
                  <div className={`smc-faq-answer${isOpen ? ' open' : ''}`}>
                    <div className="smc-faq-answer-inner">
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
