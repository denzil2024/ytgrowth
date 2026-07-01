import { useEffect, useMemo, useState } from 'react'
import {
  NICHES, NICHE_LOOKUP, COUNTRIES, COUNTRY_LOOKUP,
  fmtMoney, fmtViews, rpmToCpm,
} from '../data/youtubeEarnings'

/* Reusable YouTube earnings calculator. Typed monthly-views input (no
   slider), niche + audience-country selects, live result card. Used on the
   /tools/youtube-money-calculator page and embedded, niche pre-filled, on
   every /youtube-earnings/:niche page. Self-contained styles (mcw-*) so it
   renders identically wherever it is dropped in. */

const QUICK_VIEWS = [50_000, 250_000, 1_000_000, 5_000_000]

function useWidgetStyles() {
  useEffect(() => {
    if (document.getElementById('mcw-styles')) return
    const el = document.createElement('style')
    el.id = 'mcw-styles'
    el.textContent = `
      .mcw-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; align-items: stretch; background: var(--yte-line, rgba(20,19,15,0.12)); border: 1px solid var(--yte-line, rgba(20,19,15,0.12)); }
      @media (max-width: 760px) { .mcw-grid { grid-template-columns: 1fr; } }
      .mcw-card {
        background: var(--yte-surface, #fff); padding: 30px;
      }
      .mcw-label {
        display: block; font-family: 'Barlow', system-ui, sans-serif;
        font-size: 11px; font-weight: 600; color: var(--yte-muted, #8a8378);
        text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 9px;
      }
      .mcw-input {
        width: 100%; padding: 13px 14px; font-size: 16px; font-weight: 500;
        font-family: 'Barlow', system-ui, sans-serif; color: var(--yte-ink, #14130f);
        background: var(--yte-bg, #f6f4ef);
        border: 1px solid var(--yte-line, rgba(20,19,15,0.14)); border-radius: 0; outline: none;
        transition: border-color 0.15s, background 0.15s; -webkit-appearance: none;
        font-variant-numeric: tabular-nums;
      }
      .mcw-input:focus { border-color: var(--yte-accent, #e5302a); background: #fff; }
      select.mcw-input { font-size: 14px; }
      .mcw-chips { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 11px; }
      .mcw-chip {
        font-family: 'Barlow', system-ui, sans-serif;
        font-size: 12px; font-weight: 600;
        color: var(--yte-soft, #5c574e); background: transparent;
        border: 1px solid var(--yte-line, rgba(20,19,15,0.16)); border-radius: 0;
        padding: 6px 13px; cursor: pointer; transition: all 0.15s; letter-spacing: 0.02em;
      }
      .mcw-chip:hover { border-color: var(--yte-ink, #14130f); color: var(--yte-ink, #14130f); }
      .mcw-chip.active { background: var(--yte-ink, #14130f); border-color: var(--yte-ink, #14130f); color: #fff; }
      .mcw-result {
        display: flex; flex-direction: column; background: var(--yte-ink, #14130f);
        color: #fff; padding: 32px;
      }
      .mcw-serif { font-family: 'Fraunces', Georgia, serif; }
    `
    document.head.appendChild(el)
  }, [])
}

export default function MoneyCalculatorWidget({
  initialNiche = 'tech',
  initialCountry = 'tier1',
  initialViews = 250_000,
  extraCountries = [],   // exact-country options prepended to the tier list, so a
                         // page can pin a precise multiplier (e.g. India 0.20)
                         // and the calculator matches its own stat cards exactly.
}) {
  useWidgetStyles()
  // Merge any page-supplied exact countries ahead of the standard tier buckets.
  const countryOpts   = useMemo(() => [...extraCountries, ...COUNTRIES], [extraCountries])
  const countryLookup = useMemo(
    () => ({ ...COUNTRY_LOOKUP, ...Object.fromEntries(extraCountries.map(c => [c.key, c])) }),
    [extraCountries],
  )
  const [views, setViews]     = useState(initialViews)
  const [niche, setNiche]     = useState(NICHE_LOOKUP[initialNiche] ? initialNiche : 'tech')
  const [country, setCountry] = useState(countryLookup[initialCountry] ? initialCountry : 'tier1')

  const r = useMemo(() => {
    const n = NICHE_LOOKUP[niche] || NICHES[0]
    const c = countryLookup[country] || COUNTRIES[0]
    const lowRpm  = n.low  * c.mult
    const highRpm = n.high * c.mult
    return {
      lowRpm, highRpm,
      monthlyLow:  views * (lowRpm  / 1000),
      monthlyHigh: views * (highRpm / 1000),
      annualLow:   views * (lowRpm  / 1000) * 12,
      annualHigh:  views * (highRpm / 1000) * 12,
      label: n.label,
    }
  }, [views, niche, country, countryLookup])

  function onViewsChange(e) {
    const digits = e.target.value.replace(/[^0-9]/g, '')
    setViews(digits === '' ? 0 : Math.min(Number(digits), 1_000_000_000))
  }

  return (
    <div className="mcw-grid">
      {/* Inputs */}
      <div className="mcw-card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label className="mcw-label" htmlFor="mcw-views">Monthly views</label>
          <input
            id="mcw-views" className="mcw-input" type="text" inputMode="numeric"
            value={views ? views.toLocaleString() : ''}
            onChange={onViewsChange}
            placeholder="e.g. 250,000"
            aria-label="Monthly views"
          />
          <div className="mcw-chips">
            {QUICK_VIEWS.map(v => (
              <button
                key={v} type="button"
                className={'mcw-chip' + (views === v ? ' active' : '')}
                onClick={() => setViews(v)}
              >{fmtViews(v)}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="mcw-label" htmlFor="mcw-niche">Niche</label>
          <select id="mcw-niche" className="mcw-input" value={niche} onChange={e => setNiche(e.target.value)}>
            {NICHES.map(n => <option key={n.key} value={n.key}>{n.label}</option>)}
          </select>
        </div>

        <div>
          <label className="mcw-label" htmlFor="mcw-country">Audience country</label>
          <select id="mcw-country" className="mcw-input" value={country} onChange={e => setCountry(e.target.value)}>
            {countryOpts.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </div>
      </div>

      {/* Result */}
      <div className="mcw-result">
        <div style={{ fontFamily: "'Barlow', system-ui, sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.62, marginBottom: 14 }}>
          Estimated monthly earnings
        </div>
        <div className="mcw-serif" style={{ fontSize: 46, fontWeight: 400, letterSpacing: '-1px', lineHeight: 1.02, marginBottom: 10 }}>
          {fmtMoney(r.monthlyLow)} – {fmtMoney(r.monthlyHigh)}
        </div>
        <div style={{ fontFamily: "'Barlow', system-ui, sans-serif", fontSize: 13, opacity: 0.7 }}>
          {fmtViews(views)} views/mo · {r.label}
        </div>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.16)', margin: '24px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ fontFamily: "'Barlow', system-ui, sans-serif", fontSize: 10.5, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 7 }}>Per year</div>
            <div className="mcw-serif" style={{ fontSize: 22, fontWeight: 400, letterSpacing: '-0.3px' }}>
              {fmtMoney(r.annualLow)} – {fmtMoney(r.annualHigh)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'Barlow', system-ui, sans-serif", fontSize: 10.5, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 7 }}>RPM range</div>
            <div className="mcw-serif" style={{ fontSize: 22, fontWeight: 400, letterSpacing: '-0.3px' }}>
              ${r.lowRpm.toFixed(2)} – ${r.highRpm.toFixed(2)}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 'auto', paddingTop: 26, fontFamily: "'Barlow', system-ui, sans-serif", fontSize: 12.5, opacity: 0.7, lineHeight: 1.55 }}>
          RPM is what hits your AdSense after YouTube's 45% cut and unmonetized views. CPM (advertiser gross) runs roughly ${rpmToCpm(r.lowRpm).toFixed(0)}–${rpmToCpm(r.highRpm).toFixed(0)}.
        </div>
      </div>
    </div>
  )
}
