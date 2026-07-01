import { useEffect, useMemo, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import LandingFooter from '../../components/LandingFooter'
import SiteHeader from '../../components/SiteHeader'
import FaqSchema from '../../components/FaqSchema'
import MoneyCalculatorWidget from '../../components/MoneyCalculatorWidget'
import EzoicSlot from '../../components/EzoicSlot'
import { getCategory } from '../../data/youtubeStatsCategories'
import {
  NICHES, NICHE_LOOKUP, COUNTRY_LOOKUP, EARNINGS_META, NICHE_COUNTRY_SPLITS,
  fmtMoney, rpmToCpm,
} from '../../data/youtubeEarnings'

/* ─── /youtube-earnings/:niche ──────────────────────────────────────────────
   Per-niche "how much do {niche} YouTubers make" page. This page is the pilot
   for a sharper design language: Fraunces serif display against DM Sans UI,
   flat sharp-edged cards, a warm paper palette, and red used with restraint.
   RPM comes from the shared youtubeEarnings table so the stat cards and the
   embedded calculator never disagree. Zero YouTube quota (static data). */

const SERIF = "'Fraunces', Georgia, serif"
const SANS  = "'Barlow', system-ui, sans-serif"

function useBreakpoint() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280)
  useEffect(() => {
    const h = () => setW(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return { isMobile: w <= 768, isTablet: w <= 1024 }
}

function useGlobalStyles() {
  useEffect(() => {
    if (document.getElementById('yte-styles')) return
    const style = document.createElement('style')
    style.id = 'yte-styles'
    style.textContent = `
      :root {
        --yte-bg: #f6f4ef; --yte-bg-2: #efece4; --yte-surface: #ffffff;
        --yte-ink: #14130f; --yte-soft: #5c574e; --yte-muted: #8a8378;
        --yte-line: rgba(20,19,15,0.12); --yte-line-2: rgba(20,19,15,0.20);
        --yte-accent: #e5302a; --yte-accent-soft: rgba(229,48,42,0.07);
        --yte-dark: #0d0d12;
      }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; scroll-padding-top: 84px; }
      body { background: var(--yte-bg); color: var(--yte-ink); font-family: ${SANS}; overflow-x: hidden; -webkit-font-smoothing: antialiased; }
      @keyframes yteFadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }

      .yte-wrap { max-width: 920px; margin: 0 auto; }

      .yte-btn {
        display: inline-flex; align-items: center; justify-content: center; gap: 9px;
        background: var(--yte-accent); color: #fff;
        font-family: ${SANS}; font-size: 12.5px; font-weight: 700;
        letter-spacing: 0.1em; text-transform: uppercase;
        padding: 15px 30px; border: none; border-radius: 0;
        cursor: pointer; text-decoration: none; white-space: nowrap;
        transition: filter 0.18s, transform 0.18s;
      }
      .yte-btn:hover { filter: brightness(1.06); transform: translateY(-2px); }
      .yte-btn-lg { font-size: 13px; padding: 18px 40px; }

      /* Eyebrow: bare editorial label with a leading rule, no pill */
      .yte-eyebrow { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 22px; }
      .yte-eyebrow-rule { width: 26px; height: 1px; background: var(--yte-accent); }
      .yte-eyebrow-text { font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-accent); text-transform: uppercase; letter-spacing: 0.18em; }

      .yte-h1 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.04; }
      .yte-h1 em { font-style: italic; color: var(--yte-accent); }
      .yte-h2 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.08; }
      .yte-h2 em { font-style: italic; color: var(--yte-accent); }
      .yte-lead { font-family: ${SANS}; color: var(--yte-soft); line-height: 1.75; }

      /* Stat cards: connected hairline row, flat, serif numbers */
      .yte-stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--yte-line); border: 1px solid var(--yte-line); }
      @media (max-width: 760px) { .yte-stat-grid { grid-template-columns: 1fr; } }
      .yte-stat { background: var(--yte-surface); padding: 28px; }
      .yte-stat-label { font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-muted); text-transform: uppercase; letter-spacing: 0.13em; margin-bottom: 14px; }
      .yte-stat-value { font-family: ${SERIF}; font-size: 34px; font-weight: 400; color: var(--yte-ink); letter-spacing: -0.5px; line-height: 1.02; }
      .yte-stat-value .em { color: var(--yte-accent); }
      .yte-stat-sub { font-family: ${SANS}; font-size: 12.5px; color: var(--yte-muted); margin-top: 10px; line-height: 1.5; }

      /* Table: sharp, hairline */
      .yte-table { width: 100%; border-collapse: collapse; background: var(--yte-surface); border: 1px solid var(--yte-line); }
      .yte-table th, .yte-table td { text-align: left; padding: 14px 18px; font-size: 14px; border-bottom: 1px solid var(--yte-line); }
      .yte-table th { font-family: ${SANS}; font-size: 10.5px; font-weight: 600; color: var(--yte-muted); text-transform: uppercase; letter-spacing: 0.12em; }
      .yte-table td { font-family: ${SANS}; color: var(--yte-soft); font-variant-numeric: tabular-nums; }
      .yte-table tr:last-child td { border-bottom: none; }
      .yte-table tr.active td { background: var(--yte-accent-soft); color: var(--yte-ink); }
      .yte-niche-name { font-family: ${SERIF}; font-size: 16px; font-weight: 400; color: var(--yte-ink); letter-spacing: -0.2px; }
      .yte-table tr.active .yte-niche-name { color: var(--yte-accent); }
      .yte-table a { color: inherit; text-decoration: none; }
      .yte-table a:hover { color: var(--yte-accent); }

      /* Numbered economics list */
      .yte-num { font-family: ${SERIF}; font-size: 30px; font-weight: 300; color: var(--yte-accent); letter-spacing: -0.5px; line-height: 1; }

      .yte-faq-answer { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease; }
      .yte-faq-answer.open { grid-template-rows: 1fr; opacity: 1; }
      .yte-faq-answer-inner { overflow: hidden; }

      .yte-related-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1px; background: var(--yte-line); border: 1px solid var(--yte-line); }
      .yte-related-card { display: block; text-decoration: none; padding: 18px 18px; background: var(--yte-surface); transition: background 0.15s; }
      .yte-related-card:hover { background: var(--yte-bg-2); }
      .yte-related-label { font-family: ${SERIF}; font-size: 16px; font-weight: 400; color: var(--yte-ink); letter-spacing: -0.2px; line-height: 1.2; }
      .yte-related-meta { font-family: ${SANS}; font-size: 11.5px; color: var(--yte-muted); font-weight: 500; margin-top: 6px; letter-spacing: 0.04em; }

      @media (max-width: 768px) {
        .yte-section-pad { padding-left: 22px !important; padding-right: 22px !important; }
        .yte-cta-pad { padding: 76px 24px !important; }
      }
    `
    document.head.appendChild(style)
  }, [])
}

function Eyebrow({ children }) {
  return (
    <div className="yte-eyebrow">
      <span aria-hidden="true" className="yte-eyebrow-rule" />
      <span className="yte-eyebrow-text">{children}</span>
    </div>
  )
}

function buildFallbackCopy(niche, label) {
  const lower = label.toLowerCase()
  const lowM = Math.round(niche.low * 1000)
  const highM = Math.round(niche.high * 1000)
  const avg = (niche.low + niche.high) / 2
  const viewsFor5k = Math.round(5000 / (avg / 1000) / 1000) * 1000
  return {
    intro: [
      `${label} channels on YouTube earn an RPM of roughly $${niche.low} to $${niche.high} per 1,000 views for a tier-1 (US, UK, Canada, Australia) audience, against a platform-wide average of about $3 to $8. RPM is what you keep after YouTube's 45% cut and the views that never saw an ad, so it is the only earnings number that matters to your wallet.`,
      `At that rate, one million monthly views works out to roughly ${fmtMoney(lowM)} to ${fmtMoney(highM)} per month from ads alone, before any sponsorship or affiliate income. Use the calculator below to estimate your own channel by view count, niche, and audience country.`,
    ],
    whyHeading: `What drives ${label.toLowerCase()} earnings`,
    why: [
      `Niche sets the ad rate. ${label} sits where it does because of how much advertisers will pay to reach its audience, which is a bigger lever on income than raw view count.`,
      `Audience country multiplies everything. The same video earns several times more from a tier-1 viewer than a tier-3 one, so a global audience earns less per view than a US-heavy one.`,
      `Video length and mid-rolls matter. Videos over 8 minutes can run multiple ad slots, which is the single biggest free RPM upgrade available in any niche.`,
    ],
    faqs: [
      { q: `How much do ${lower} YouTubers make per 1,000 views?`,
        a: `A ${lower} channel with a tier-1 (US, UK, Canada, Australia) audience typically earns an RPM of $${niche.low} to $${niche.high} per 1,000 views. RPM is what you keep after YouTube's 45% cut and the views that never saw an ad. The figure inside that band depends on watch time, mid-roll placement, season, and your exact audience country mix.` },
      { q: `How much does a ${lower} YouTuber make per million views?`,
        a: `At a tier-1 RPM of $${niche.low} to $${niche.high}, one million monthly views works out to roughly ${fmtMoney(lowM)} to ${fmtMoney(highM)} per month from ads alone. Sponsorship and affiliate income typically add more on top, often more than the ads themselves.` },
      { q: `Is ${lower} a high-CPM niche on YouTube?`,
        a: `${label} sits ${niche.high >= 14 ? 'near the top of' : niche.high >= 8 ? 'in the upper-middle of' : 'in the lower half of'} the RPM table, with tier-1 rates of $${niche.low} to $${niche.high} per 1,000 views against a platform average of about $3 to $8. ${niche.high >= 14 ? 'Advertisers pay a premium to reach this audience.' : niche.high >= 8 ? 'It earns above the YouTube average without topping it.' : 'Volume and sponsorships, not the ad rate, do most of the earning here.'}` },
      { q: `Why does ${lower} RPM sit where it does?`,
        a: `The ad rate is set by how much advertisers will pay to reach this audience, which is a bigger lever on income than raw view count. ${label} commands $${niche.low} to $${niche.high} per 1,000 tier-1 views because of the value of the products marketed against it and the buying power of its typical viewer.` },
      { q: `How much does audience country change ${lower} earnings?`,
        a: `A lot. A tier-1 (US, UK, Canada, Australia) audience earns the full $${niche.low} to $${niche.high} RPM; a tier-3 or global audience earns a fraction of that for the same video. India or much of Africa can be 5 to 10x lower per view. English content aimed at global tier-1 niches scales revenue fastest.` },
      { q: `How many views does a ${lower} channel need to make $5,000 a month?`,
        a: `At the middle of the ${lower} RPM band, roughly ${viewsFor5k.toLocaleString()} monthly views gets you to $5,000 a month from ads. Affiliate links and sponsorships can get you there at fewer views.` },
      { q: `Do ${lower} YouTubers earn more from ads or sponsorships?`,
        a: `Most full-time ${lower} creators earn more from sponsorships, affiliates, and their own products than from AdSense. Ads are the floor, not the ceiling. A channel earning a few thousand a month from ads is often earning several times that once brand deals and other streams are counted.` },
      { q: `How can a ${lower} channel increase its RPM?`,
        a: `Three high-impact moves: lengthen videos past 8 minutes so they qualify for mid-roll ads; shift your audience mix toward tier-1 countries with globally-framed content; and lean into the higher-paying corners of the niche. None of these require more views, they earn more from the views you already have.` },
    ],
  }
}

export default function NicheEarnings() {
  useGlobalStyles()
  const { isMobile } = useBreakpoint()
  const { niche: slug } = useParams()

  const niche = NICHE_LOOKUP[slug]
  const category = getCategory(slug)
  const label = category?.label || (niche ? niche.label : '')

  const copy = useMemo(() => {
    if (!niche) return null
    return EARNINGS_META[slug] || buildFallbackCopy(niche, label)
  }, [slug, niche, label])

  const seoTitle = niche ? `How Much Do ${label} YouTubers Make in 2026?` : ''
  const seoDesc  = niche
    ? `What ${label.toLowerCase()} YouTubers earn in 2026: real RPM and CPM by niche, earnings per million views, and a free calculator.`
    : ''

  useEffect(() => {
    if (!niche) return
    document.title = seoTitle
    const meta = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); return m
    })()
    meta.content = seoDesc
  }, [niche, seoTitle, seoDesc])

  const [openFaq, setOpenFaq] = useState(0)

  if (slug && !niche) return <Navigate to="/tools/youtube-money-calculator" replace />
  if (!niche) return null

  const cpmLow  = rpmToCpm(niche.low)
  const cpmHigh = rpmToCpm(niche.high)
  const perMillionLow  = Math.round(niche.low * 1000)
  const perMillionHigh = Math.round(niche.high * 1000)

  const ranked = useMemo(() => [...NICHES].sort((a, b) => b.high - a.high), [])
  const related = useMemo(() => NICHES.filter(n => n.key !== slug).slice(0, 6), [slug])
  const splitTiers = NICHE_COUNTRY_SPLITS[slug] || null

  const lower = label.toLowerCase()
  const H1 = isMobile ? 36 : 60
  const H2 = isMobile ? 28 : 40

  return (
    <div style={{ fontFamily: SANS, background: 'var(--yte-bg)', color: 'var(--yte-ink)', overflowX: 'clip' }}>
      <SiteHeader />
      <FaqSchema items={copy.faqs} />

      {/* ══ HERO ══ */}
      <section className="yte-section-pad" style={{ padding: isMobile ? '60px 22px 44px' : '104px 48px 56px', background: 'var(--yte-bg)' }}>
        <div className="yte-wrap" style={{ animation: 'yteFadeUp 0.5s ease both' }}>
          <nav aria-label="Breadcrumb" style={{ marginBottom: 22, fontFamily: SANS, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--yte-muted)' }}>
            <a href="/tools/youtube-money-calculator" style={{ color: 'var(--yte-soft)', textDecoration: 'none', fontWeight: 600 }}>Earnings</a>
            <span style={{ margin: '0 10px', color: 'var(--yte-line-2)' }}>/</span>
            <span style={{ color: 'var(--yte-ink)', fontWeight: 600 }}>{label}</span>
          </nav>

          <Eyebrow>Creator earnings</Eyebrow>
          <h1 className="yte-h1" style={{ fontSize: H1, marginBottom: 24, maxWidth: 760, textWrap: 'balance' }}>
            How much do <em>{lower}</em> YouTubers make?
          </h1>
          <div style={{ maxWidth: 660 }}>
            {copy.intro.map((para, i) => (
              <p key={i} className="yte-lead" style={{ fontSize: isMobile ? 16 : 17.5, marginBottom: 16, textWrap: 'pretty' }}>{para}</p>
            ))}
          </div>
        </div>
      </section>

      {/* ══ STAT CARDS ══ */}
      <section className="yte-section-pad" style={{ padding: isMobile ? '8px 22px 0' : '0 48px', background: 'var(--yte-bg)' }}>
        <div className="yte-wrap">
          <div className="yte-stat-grid">
            <div className="yte-stat">
              <div className="yte-stat-label">RPM (what you keep)</div>
              <div className="yte-stat-value"><span className="em">${niche.low}</span> – ${niche.high}</div>
              <div className="yte-stat-sub">per 1,000 views, tier-1 audience</div>
            </div>
            <div className="yte-stat">
              <div className="yte-stat-label">CPM (advertiser gross)</div>
              <div className="yte-stat-value">${cpmLow.toFixed(0)} – ${cpmHigh.toFixed(0)}</div>
              <div className="yte-stat-sub">before YouTube's 45% cut</div>
            </div>
            <div className="yte-stat">
              <div className="yte-stat-label">Per 1M views / month</div>
              <div className="yte-stat-value">{fmtMoney(perMillionLow)}+</div>
              <div className="yte-stat-sub">from ads alone, up to {fmtMoney(perMillionHigh)}</div>
            </div>
          </div>
        </div>
      </section>

      <EzoicSlot id={101} />

      {/* ══ CALCULATOR ══ */}
      <section className="yte-section-pad" style={{ padding: isMobile ? '52px 22px 64px' : '68px 48px 88px', background: 'var(--yte-bg)' }}>
        <div className="yte-wrap">
          <div style={{ marginBottom: 26, maxWidth: 640 }}>
            <h2 className="yte-h2" style={{ fontSize: H2, marginBottom: 12 }}>
              Estimate your <em>{lower}</em> channel
            </h2>
            <p className="yte-lead" style={{ fontSize: 17 }}>
              Pre-filled with {lower} RPM. Type your real monthly views and audience country for a realistic range.
            </p>
          </div>
          <MoneyCalculatorWidget initialNiche={slug} initialCountry="tier1" />
          <div style={{ marginTop: 20, fontFamily: SANS, fontSize: 13.5, color: 'var(--yte-muted)' }}>
            Want every niche and the full breakdown? Use the{' '}
            <a href="/tools/youtube-money-calculator" style={{ color: 'var(--yte-accent)', fontWeight: 600, textDecoration: 'none' }}>full YouTube money calculator →</a>
          </div>
        </div>
      </section>

      {/* ══ ECONOMICS ══ */}
      <section className="yte-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)' }}>
        <div className="yte-wrap">
          <div style={{ marginBottom: 40, maxWidth: 680 }}>
            <Eyebrow>The economics</Eyebrow>
            <h2 className="yte-h2" style={{ fontSize: H2, textWrap: 'balance' }}>{copy.whyHeading}.</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {copy.why.map((h, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: isMobile ? '44px 1fr' : '60px 1fr', gap: isMobile ? 16 : 28, alignItems: 'baseline', padding: '22px 0', borderTop: i === 0 ? 'none' : '1px solid var(--yte-line)' }}>
                <span className="yte-num">{String(i + 1).padStart(2, '0')}</span>
                <p style={{ fontFamily: SANS, fontSize: isMobile ? 15 : 16.5, color: 'var(--yte-soft)', lineHeight: 1.7 }}>{h}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ RPM COMPARISON ══ */}
      <section className="yte-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-bg)' }}>
        <div className="yte-wrap">
          <div style={{ marginBottom: 26, maxWidth: 700 }}>
            <Eyebrow>Niche ranking</Eyebrow>
            <h2 className="yte-h2" style={{ fontSize: H2 }}>Where <em>{lower}</em> ranks for RPM.</h2>
          </div>
          <table className="yte-table">
            <thead>
              <tr><th>Niche</th><th>RPM (tier-1)</th><th>Per 1M views</th></tr>
            </thead>
            <tbody>
              {ranked.map(n => (
                <tr key={n.key} className={n.key === slug ? 'active' : ''}>
                  <td className="yte-niche-name">
                    {n.key === slug ? n.label : <a href={`/youtube-earnings/${n.key}`}>{n.label}</a>}
                  </td>
                  <td>${n.low} – ${n.high}</td>
                  <td>{fmtMoney(n.low * 1000)} – {fmtMoney(n.high * 1000)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-muted)', marginTop: 14, lineHeight: 1.6 }}>
            RPM ranges are for a tier-1 (US, UK, Canada, Australia) audience. A global or tier-3 audience earns a fraction of these rates.
          </p>
        </div>
      </section>

      {/* ══ COUNTRY SPLIT ══ */}
      {splitTiers && (
        <section className="yte-section-pad" style={{ padding: isMobile ? '0 22px 64px' : '0 48px 96px', background: 'var(--yte-bg)' }}>
          <div className="yte-wrap">
            <div style={{ marginBottom: 22, maxWidth: 700 }}>
              <Eyebrow>By country</Eyebrow>
              <h2 className="yte-h2" style={{ fontSize: isMobile ? 24 : 32 }}>{label} RPM by audience country.</h2>
            </div>
            <div className="yte-stat-grid" style={{ gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
              {splitTiers.map(tierKey => {
                const c = COUNTRY_LOOKUP[tierKey]
                const lo = niche.low * c.mult
                const hi = niche.high * c.mult
                return (
                  <div key={tierKey} className="yte-stat">
                    <div className="yte-stat-label">{c.label}</div>
                    <div className="yte-stat-value">${lo.toFixed(1)} – ${hi.toFixed(1)}</div>
                    <div className="yte-stat-sub">RPM per 1,000 views · {fmtMoney(lo * 1000)} – {fmtMoney(hi * 1000)} per 1M views</div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      <EzoicSlot id={102} />

      {/* ══ FAQ ══ */}
      <div className="yte-section-pad" style={{ background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)', padding: isMobile ? '60px 22px' : '104px 48px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '320px 1fr', gap: isMobile ? 36 : 80, alignItems: 'start' }}>
          <div>
            <Eyebrow>Frequently asked</Eyebrow>
            <h2 className="yte-h2" style={{ fontSize: 'clamp(34px, 4.4vw, 54px)', marginBottom: 14, textWrap: 'balance' }}>
              {label} earnings, <em>answered.</em>
            </h2>
            <p className="yte-lead" style={{ fontSize: 14.5, maxWidth: 300 }}>
              The numbers creators ask about before they pick this niche. Still curious? <a href="/contact" style={{ color: 'var(--yte-accent)', fontWeight: 600, textDecoration: 'none' }}>Get in touch.</a>
            </p>
          </div>
          <div style={{ borderTop: '1px solid var(--yte-line)' }}>
            {copy.faqs.map((item, i) => {
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
                  <div className={`yte-faq-answer${isOpen ? ' open' : ''}`}>
                    <div className="yte-faq-answer-inner">
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

      {/* ══ RELATED ══ */}
      <section className="yte-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-bg)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ marginBottom: 30 }}>
            <Eyebrow>More niches</Eyebrow>
            <h2 className="yte-h2" style={{ fontSize: isMobile ? 26 : 34 }}>What other niches earn.</h2>
          </div>
          <div className="yte-related-grid">
            {related.map(r => (
              <a key={r.key} href={`/youtube-earnings/${r.key}`} className="yte-related-card">
                <div className="yte-related-label">{r.label}</div>
                <div className="yte-related-meta">${r.low}–${r.high} RPM →</div>
              </a>
            ))}
            <a href={`/youtube-stats/${slug}`} className="yte-related-card" style={{ background: 'var(--yte-accent-soft)' }}>
              <div className="yte-related-label" style={{ color: 'var(--yte-accent)' }}>Top {lower} channels</div>
              <div className="yte-related-meta">Leaderboard →</div>
            </a>
          </div>
        </div>
      </section>

      <EzoicSlot id={103} />

      <LandingFooter />
    </div>
  )
}
