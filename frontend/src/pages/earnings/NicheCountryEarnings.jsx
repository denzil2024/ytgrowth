import { useEffect, useMemo, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import LandingFooter from '../../components/LandingFooter'
import SiteHeader from '../../components/SiteHeader'
import FaqSchema from '../../components/FaqSchema'
import MoneyCalculatorWidget from '../../components/MoneyCalculatorWidget'
import { getCategory } from '../../data/youtubeStatsCategories'
import {
  NICHE_LOOKUP, EARNINGS_COUNTRIES, EARNINGS_COUNTRY_LOOKUP, NICHE_MONETISATION,
  fmtMoney, rpmToCpm,
} from '../../data/youtubeEarnings'

/* ─── /youtube-earnings/:niche/:country ─────────────────────────────────────
   Per-niche-per-country "how much do {niche} YouTubers make in {country}" page.
   Extends the niche earnings page with a country dimension: the RPM is the
   niche's tier-1 rate scaled by the country's own multiplier, so every country
   page shows a distinct number and reads uniquely (US / UK / CA / AU are not
   near-duplicates). Built to answer live GSC geo demand ("finance channel rpm
   in india", "usa finance channel rpm"). Zero YouTube quota (static data). */

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

/* Same style block + id as NicheEarnings so the two pages are visually identical
   and the CSS is injected only once across a session. */
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

      .yte-eyebrow { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 22px; }
      .yte-eyebrow-rule { width: 26px; height: 1px; background: var(--yte-accent); }
      .yte-eyebrow-text { font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-accent); text-transform: uppercase; letter-spacing: 0.18em; }

      .yte-h1 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.04; }
      .yte-h1 em { font-style: italic; color: var(--yte-accent); }
      .yte-h2 { font-family: ${SERIF}; font-weight: 300; letter-spacing: -0.01em; color: var(--yte-ink); line-height: 1.08; }
      .yte-h2 em { font-style: italic; color: var(--yte-accent); }
      .yte-lead { font-family: ${SANS}; color: var(--yte-soft); line-height: 1.75; }

      .yte-stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--yte-line); border: 1px solid var(--yte-line); }
      @media (max-width: 760px) { .yte-stat-grid { grid-template-columns: 1fr; } }
      .yte-stat { background: var(--yte-surface); padding: 28px; }
      .yte-stat-label { font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-muted); text-transform: uppercase; letter-spacing: 0.13em; margin-bottom: 14px; }
      .yte-stat-value { font-family: ${SERIF}; font-size: 34px; font-weight: 400; color: var(--yte-ink); letter-spacing: -0.5px; line-height: 1.02; }
      .yte-stat-value .em { color: var(--yte-accent); }
      .yte-stat-sub { font-family: ${SANS}; font-size: 12.5px; color: var(--yte-muted); margin-top: 10px; line-height: 1.5; }

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

/* One decimal below $10 (e.g. $3.6), whole dollars above (e.g. $18). */
function fmtRpm(v) {
  return '$' + (v < 10 ? v.toFixed(1) : Math.round(v).toString())
}

/* USD amount shown in the country's own currency (null for the US, no line).
   Grouped with English commas (not the local locale) because the page is in
   English: "€11.900" in German grouping reads like 11.9 to an English visitor. */
function localMoney(usd, cur) {
  if (!cur || cur.code === 'USD') return null
  let v = usd * cur.perUsd
  v = v >= 1000 ? Math.round(v / 100) * 100 : Math.round(v)
  return cur.sym + v.toLocaleString('en-US')
}

/* Deterministic hash so each niche+country page selects a genuinely different
   FAQ set and order, while staying stable across renders / prerender. */
function hashKey(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}

function buildCountryCopy(niche, label, country, countrySlug) {
  const lower = label.toLowerCase()
  const lo = niche.low * country.mult
  const hi = niche.high * country.mult
  const loM = Math.round(lo * 1000)
  const hiM = Math.round(hi * 1000)
  const avg = (lo + hi) / 2
  const viewsFor5k = Math.round(5000 / (avg / 1000) / 1000) * 1000
  const isTier1 = !!country.tier1
  const pctOfUs = Math.round(country.mult * 100)
  const cur = country.cur
  const mon = NICHE_MONETISATION[niche.key] || { top: 'its highest-value topics', beyond: 'sponsorships and affiliates' }
  // Correct article for the demonym (an American / an Indian vs a British), with
  // an explicit override for consonant-sound vowels like "a Ukrainian".
  const art = country.article || (/^[aeiou]/i.test(country.demonym) ? 'an' : 'a')
  const Art = art === 'an' ? 'An' : 'A'

  // Local-currency phrasings (empty string for the US so sentences read clean).
  const perMillionLocal = localMoney(loM, cur) && ` (about ${localMoney(loM, cur)} to ${localMoney(hiM, cur)})`
  const fiveKLocal = localMoney(5000, cur) && ` (about ${localMoney(5000, cur)})`
  const rpmLocal = localMoney(lo, cur) && `, or roughly ${localMoney(lo, cur)} to ${localMoney(hi, cur)} in local terms`

  const intro = [
    `${label} channels with an audience in ${country.name} earn an RPM of roughly ${fmtRpm(lo)} to ${fmtRpm(hi)} per 1,000 views. That is ${country.name} specifically, ${country.note}. RPM is what the creator keeps after YouTube's 45% cut and the views that never saw an ad, so it is the only earnings figure that reflects real take-home pay.`,
    `At that rate, one million monthly views from ${country.demonym} viewers works out to roughly ${fmtMoney(loM)} to ${fmtMoney(hiM)}${perMillionLocal || ''} per month from ads alone, before any sponsorship or affiliate income. ${isTier1 ? 'This is one of the highest-paying audiences on YouTube.' : `That is about ${pctOfUs}% of what the same channel would earn from a US audience, because the local ad market pays less per view.`} Use the calculator below to estimate your own channel.`,
  ]

  // Economics section — a varied pool selected per page (like the FAQs) so the
  // "why" block is not the same three bullets with a swapped country name. The
  // first point (country sets the rate) anchors every page; the rest rotate and
  // carry country-currency / niche-specific substance.
  const whyPool = [
    `Niche stacks on top of country. ${label} pays more than entertainment or comedy in every market, so ${art} ${country.demonym} ${lower} channel out-earns ${art} ${country.demonym} vlog of the same size.`,
    `Video length is the free lever. Pushing videos past 8 minutes lets them carry multiple mid-roll ads, the single biggest RPM upgrade ${art} ${country.demonym} ${lower} channel can make without adding a view.`,
    cur.code === 'USD'
      ? `You are paid in US dollars. AdSense deposits your earnings once you clear the $100 threshold, with no conversion step to eat into the total.`
      : `You are paid in US dollars, not ${cur.code}. AdSense reports in dollars and your bank converts to ${cur.code}, so a stronger dollar quietly lifts your ${country.demonym} take-home even when views stay flat.`,
    `Season swings the number. Q4 advertiser budgets push ${lower} RPM 30 to 40% above the Q1 floor, so ${art} ${country.demonym} channel earns noticeably more per view in November than in January.`,
    `The real money sits past AdSense. Established ${country.demonym} ${lower} creators lean on ${mon.beyond}, which is priced on audience and niche rather than on the local ad rate.`,
    isTier1
      ? `Watch time compounds the rate. Longer average view duration means each ${country.demonym} viewer sees more ads, stacking on top of an already high ${lower} RPM.`
      : `A global audience is the multiplier. ${Art} ${country.demonym} ${lower} channel that pulls even a third of its views from the US, UK, Canada and Australia can lift its blended RPM several times over.`,
  ]
  // Spread selection by the country's position in the list so the six pages in a
  // niche each land on a DIFFERENT subset (a plain hash collided across the
  // tier-1 countries). nh varies it by niche too.
  const nh = hashKey(niche.key)
  const ci = Math.max(0, EARNINGS_COUNTRIES.findIndex(c => c.key === countrySlug))
  const takeE = 2 + ((nh + ci) % 2)             // 2 or 3 supporting points
  const startE = (nh + ci + 3) % whyPool.length
  const why = [
    `Audience country sets the ad rate. A ${lower} view from ${art} ${country.demonym} viewer is worth ${isTier1 ? 'close to the platform maximum' : `roughly ${pctOfUs}% of the same view from a US viewer`}, because ${country.note}.`,
    ...whyPool.slice(startE).concat(whyPool.slice(0, startE)).slice(0, takeE),
  ]

  // Anchor: the core-intent question, always first (this is the ranked query).
  const anchor = {
    q: `How much do ${lower} YouTubers make in ${country.name}?`,
    a: `A ${lower} channel with ${art} ${country.demonym} audience typically earns an RPM of ${fmtRpm(lo)} to ${fmtRpm(hi)} per 1,000 views${rpmLocal || ''}, which is what you keep after YouTube's 45% cut and un-monetised views. One million monthly views works out to roughly ${fmtMoney(loM)} to ${fmtMoney(hiM)}${perMillionLocal || ''} a month from ads alone.`,
  }

  // Varied pool — every answer carries page-specific substance (local currency,
  // this country's payment / tax reality, or this niche's monetisation), so no
  // two pages read as the same 7 questions with a swapped country name.
  const pool = [
    { q: isTier1 ? `Why do ${lower} channels in ${country.name} earn so much?` : `Why is ${lower} RPM in ${country.name} lower than in the US?`,
      a: isTier1
        ? `${country.name.replace(/^the /, 'The ')} is ${country.note}. Advertisers bid high to reach viewers with strong buying power and YouTube passes most of that to the creator, so ${lower} RPM sits near the top of the global range.`
        : `It comes down to local advertiser spend. ${country.name.replace(/^the /, 'The ')} is ${country.note}. Brands there pay less per 1,000 impressions than US or UK brands, so the same ${lower} video earns less per view even though the audience is just as engaged.` },
    { q: `How does Google pay ${lower} creators in ${country.name}, and in what currency?`,
      a: `${country.payNote} The RPM figures on this page are the US-dollar amounts AdSense reports${cur.code === 'USD' ? '.' : `, which your bank converts to ${cur.code}, so the local total moves a little with the exchange rate.`}` },
    { q: `Do ${lower} YouTubers in ${country.name} pay tax on their earnings?`,
      a: `${country.taxNote} This is general information, not tax advice, so check your own situation with a local accountant once the channel earns real money.` },
    { q: `How much does a ${lower} YouTuber make per million views in ${country.name}?`,
      a: `At ${art} ${country.demonym} RPM of ${fmtRpm(lo)} to ${fmtRpm(hi)}, one million views earns roughly ${fmtMoney(loM)} to ${fmtMoney(hiM)}${perMillionLocal || ''} from ads. Sponsorships and affiliates usually add more on top, and in ${isTier1 ? 'high-income markets' : 'a lower-RPM market like this one'} those extra streams often matter ${isTier1 ? 'as much as' : 'more than'} the ad revenue.` },
    { q: `Which ${lower} videos pay the most in ${country.name}?`,
      a: `Within ${lower}, ${mon.top} command the highest ad rates because advertisers in those categories bid the most, and that holds in ${country.name} just as it does elsewhere. Pair that with mid-roll ads on 8-minute-plus videos to lift RPM further.` },
    { q: isTier1 ? `Do ${lower} creators in ${country.name} earn more from ads or sponsorships?` : `How can ${art} ${country.demonym} ${lower} channel earn beyond the local ad rate?`,
      a: `Most serious ${lower} creators in ${country.name} earn more from ${mon.beyond} than from AdSense. ${isTier1 ? 'Ads are the floor, not the ceiling' : 'This matters even more in a lower-RPM market, where the ad rate alone is thin'}, and a brand deal is priced on audience and niche, not on the local ad rate.` },
    { q: isTier1 ? `How can ${art} ${country.demonym} ${lower} channel earn even more?` : `How can ${art} ${country.demonym} ${lower} channel earn US-level rates?`,
      a: isTier1
        ? `Lengthen videos past 8 minutes for mid-rolls, lean into ${mon.top}, and stack ${mon.beyond} on top of AdSense. Those move take-home pay more than chasing raw view count.`
        : `Make globally-framed ${lower} content in English so a real share of views come from US, UK, Canada and Australia viewers. ${Art} ${country.demonym} channel that earns half its views from tier-1 countries can multiply its RPM several times over without changing topic.` },
    { q: `How many views does ${art} ${country.demonym} ${lower} channel need to make $5,000${fiveKLocal || ''} a month?`,
      a: `At the middle of the ${country.demonym} ${lower} RPM band, roughly ${viewsFor5k.toLocaleString()} monthly views gets you to $5,000${fiveKLocal || ''} a month from ads. Affiliate links and sponsorships can reach it at fewer views, which is often the faster route ${isTier1 ? 'at this rate' : 'in a lower-RPM market'}.` },
    { q: `Is ${lower} a good niche to start in ${country.name} in 2026?`,
      a: `${niche.high >= 12 ? `Yes. ${label} is one of the higher-paying niches, and even at ${country.demonym} rates of ${fmtRpm(lo)} to ${fmtRpm(hi)} RPM it out-earns most categories per view.` : `It depends on your goal. ${label} sits in the lower half of the RPM table, so at ${country.demonym} rates of ${fmtRpm(lo)} to ${fmtRpm(hi)} the ad money is modest and the real upside is ${mon.beyond}.`} Volume and a globally-framed angle both help a channel based in ${country.name}.` },
  ]

  // Rotate + trim so each page shows a different subset (7 to 8 FAQs total) in a
  // different order. Uses the same niche-hash + country-index spread as the
  // economics block so the six country pages never share a subset.
  const take = 6 + ((nh + ci + 1) % 2)         // 6 or 7 pool items
  const start = (nh + ci * 2) % pool.length
  const rotated = pool.slice(start).concat(pool.slice(0, start)).slice(0, take)
  const faqs = [anchor, ...rotated]

  return { intro, whyHeading: `What ${lower} creators earn in ${country.name}`, why, faqs }
}

export default function NicheCountryEarnings() {
  useGlobalStyles()
  const { isMobile } = useBreakpoint()
  const { niche: slug, country: countrySlug } = useParams()

  const niche = NICHE_LOOKUP[slug]
  const country = EARNINGS_COUNTRY_LOOKUP[countrySlug]
  const category = getCategory(slug)
  const label = category?.label || (niche ? niche.label : '')

  const copy = useMemo(() => {
    if (!niche || !country) return null
    return buildCountryCopy(niche, label, country, countrySlug)
  }, [slug, niche, label, country, countrySlug])

  const seoTitle = (niche && country) ? `How Much Do ${label} YouTubers Make in ${country.name}? (2026)` : ''
  const seoDesc  = (niche && country)
    ? `${label} YouTuber earnings in ${country.name}: real RPM and CPM for ${country.article || (/^[aeiou]/i.test(country.demonym) ? 'an' : 'a')} ${country.demonym} audience, earnings per million views, and a free calculator.`
    : ''

  useEffect(() => {
    if (!niche || !country) return
    document.title = seoTitle
    const meta = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); return m
    })()
    meta.content = seoDesc
  }, [niche, country, seoTitle, seoDesc])

  const [openFaq, setOpenFaq] = useState(0)

  // Unknown niche → send to the calculator; known niche but unknown country → the niche page.
  if (slug && !niche) return <Navigate to="/tools/youtube-money-calculator" replace />
  if (niche && countrySlug && !country) return <Navigate to={`/youtube-earnings/${slug}`} replace />
  if (!niche || !country) return null

  const rpmLow  = niche.low * country.mult
  const rpmHigh = niche.high * country.mult
  const cpmLow  = rpmToCpm(rpmLow)
  const cpmHigh = rpmToCpm(rpmHigh)
  const perMillionLow  = Math.round(rpmLow * 1000)
  const perMillionHigh = Math.round(rpmHigh * 1000)
  // Feed the calculator this country's exact multiplier so its RPM matches the
  // stat cards above (no coarse-tier fallback that would contradict the page).
  const calcCountry = { key: `c_${countrySlug}`, label: `${country.name.replace(/^the /, '')} audience`, mult: country.mult }

  const countryName = country.name.replace(/^the /, '')
  const lower = label.toLowerCase()
  const H1 = isMobile ? 34 : 54
  const H2 = isMobile ? 28 : 40

  // Same niche across every country — the unique comparison + internal-link block.
  const byCountry = EARNINGS_COUNTRIES.map(c => ({
    ...c, lo: niche.low * c.mult, hi: niche.high * c.mult,
  }))
  // Other niches in this same country — cross-link the country column.
  const otherNiches = Object.values(NICHE_LOOKUP).filter(n => n.key !== slug).slice(0, 6)

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
            <a href={`/youtube-earnings/${slug}`} style={{ color: 'var(--yte-soft)', textDecoration: 'none', fontWeight: 600 }}>{label}</a>
            <span style={{ margin: '0 10px', color: 'var(--yte-line-2)' }}>/</span>
            <span style={{ color: 'var(--yte-ink)', fontWeight: 600 }}>{countryName}</span>
          </nav>

          <Eyebrow>Creator earnings · {country.short}</Eyebrow>
          <h1 className="yte-h1" style={{ fontSize: H1, marginBottom: 24, maxWidth: 780, textWrap: 'balance' }}>
            How much do <em>{lower}</em> YouTubers make in {country.name}?
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
              <div className="yte-stat-label">RPM · {country.demonym} audience</div>
              <div className="yte-stat-value"><span className="em">{fmtRpm(rpmLow)}</span> – {fmtRpm(rpmHigh)}</div>
              <div className="yte-stat-sub">per 1,000 views, what you keep</div>
            </div>
            <div className="yte-stat">
              <div className="yte-stat-label">CPM (advertiser gross)</div>
              <div className="yte-stat-value">${cpmLow.toFixed(cpmLow < 10 ? 1 : 0)} – ${cpmHigh.toFixed(cpmHigh < 10 ? 1 : 0)}</div>
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

      {/* ══ CALCULATOR ══ */}
      <section className="yte-section-pad" style={{ padding: isMobile ? '52px 22px 64px' : '68px 48px 88px', background: 'var(--yte-bg)' }}>
        <div className="yte-wrap">
          <div style={{ marginBottom: 26, maxWidth: 640 }}>
            <h2 className="yte-h2" style={{ fontSize: H2, marginBottom: 12 }}>
              Estimate your <em>{lower}</em> channel
            </h2>
            <p className="yte-lead" style={{ fontSize: 17 }}>
              Pre-filled with {lower} RPM at {country.demonym} rates. Type your real monthly views for a realistic range.
            </p>
          </div>
          <MoneyCalculatorWidget key={calcCountry.key} initialNiche={slug} initialCountry={calcCountry.key} extraCountries={[calcCountry]} />
          <div style={{ marginTop: 20, fontFamily: SANS, fontSize: 13.5, color: 'var(--yte-muted)' }}>
            Want every niche and country in one place? Use the{' '}
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

      {/* ══ SAME NICHE BY COUNTRY ══ */}
      <section className="yte-section-pad" style={{ padding: isMobile ? '64px 22px' : '96px 48px', background: 'var(--yte-bg)' }}>
        <div className="yte-wrap">
          <div style={{ marginBottom: 26, maxWidth: 700 }}>
            <Eyebrow>By country</Eyebrow>
            <h2 className="yte-h2" style={{ fontSize: H2 }}><em>{label}</em> RPM around the world.</h2>
          </div>
          <table className="yte-table">
            <thead>
              <tr><th>Country</th><th>RPM per 1,000</th><th>Per 1M views</th></tr>
            </thead>
            <tbody>
              {byCountry.map(c => (
                <tr key={c.key} className={c.key === countrySlug ? 'active' : ''}>
                  <td className="yte-niche-name">
                    {c.key === countrySlug ? countryName : <a href={`/youtube-earnings/${slug}/${c.key}`}>{c.name.replace(/^the /, '')}</a>}
                  </td>
                  <td>{fmtRpm(c.lo)} – {fmtRpm(c.hi)}</td>
                  <td>{fmtMoney(c.lo * 1000)} – {fmtMoney(c.hi * 1000)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--yte-muted)', marginTop: 14, lineHeight: 1.6 }}>
            Same {lower} content, different audience country. The RPM gap is driven by local advertiser spend, not by the channel.
          </p>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <div className="yte-section-pad" style={{ background: 'var(--yte-surface)', borderTop: '1px solid var(--yte-line)', borderBottom: '1px solid var(--yte-line)', padding: isMobile ? '60px 22px' : '104px 48px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '320px 1fr', gap: isMobile ? 36 : 80, alignItems: 'start' }}>
          <div>
            <Eyebrow>Frequently asked</Eyebrow>
            <h2 className="yte-h2" style={{ fontSize: 'clamp(34px, 4.4vw, 54px)', marginBottom: 14, textWrap: 'balance' }}>
              {label} in {country.name}, <em>answered.</em>
            </h2>
            <p className="yte-lead" style={{ fontSize: 14.5, maxWidth: 300 }}>
              What {country.demonym} creators ask before they commit to this niche. Still curious? <a href="/contact" style={{ color: 'var(--yte-accent)', fontWeight: 600, textDecoration: 'none' }}>Get in touch.</a>
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
            <Eyebrow>More niches in {countryName}</Eyebrow>
            <h2 className="yte-h2" style={{ fontSize: isMobile ? 26 : 34 }}>What other niches earn here.</h2>
          </div>
          <div className="yte-related-grid">
            {otherNiches.map(r => (
              <a key={r.key} href={`/youtube-earnings/${r.key}/${countrySlug}`} className="yte-related-card">
                <div className="yte-related-label">{r.label}</div>
                <div className="yte-related-meta">{fmtRpm(r.low * country.mult)}–{fmtRpm(r.high * country.mult)} RPM →</div>
              </a>
            ))}
            <a href={`/youtube-earnings/${slug}`} className="yte-related-card" style={{ background: 'var(--yte-accent-soft)' }}>
              <div className="yte-related-label" style={{ color: 'var(--yte-accent)' }}>{label} worldwide</div>
              <div className="yte-related-meta">All countries →</div>
            </a>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
