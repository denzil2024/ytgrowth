/* UpsellGate — shared free-tier gate modal. Visual is a direct lift of
   Weekly Report's upsell card (lock icon → title → description → optional
   note → bullets → primary CTA → pack link → trust stack). Used as the
   single source of truth so every gated feature reads identically.

   Props:
     title         — h2 headline (e.g. "Unlock Outlier Scoring")
     description   — p body under the title
     bullets       — string[] of 2–4 value props
     note          — optional small amber note under description
                     (e.g. "Outlier Scoring requires 3 credits.")
     showPackLink  — default true; pass false for the one-run gates
                     (per product spec: only Weekly Report offers the pack
                     link as a secondary option)
     primaryCta    — default "See monthly plans" */

const C = {
  red: '#e5251b', green: '#059669', amber: '#d97706',
  text1: '#0f0f13', text2: '#4a4a58', text3: '#9595a4',
  border: '#e6e6ec',
}

export default function UpsellGate({
  title,
  description,
  bullets = [],
  note = null,
  showPackLink = true,
  primaryCta = 'See monthly plans',
}) {
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid rgba(229,37,27,0.2)',
      borderRadius: 20,
      boxShadow: '0 20px 50px rgba(0,0,0,0.16)',
      padding: '30px 36px 28px',
      maxWidth: 540, width: '100%',
      textAlign: 'center',
      fontFamily: "'Inter', system-ui, sans-serif",
      margin: '0 auto',
    }}>
      {/* Lock icon — red gradient square */}
      <div style={{
        width: 50, height: 50, borderRadius: 14,
        background: `linear-gradient(180deg, ${C.red} 0%, #a50f07 100%)`,
        margin: '0 auto 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 8px 22px ${C.red}55, inset 0 1px 0 rgba(255,255,255,0.25)`,
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text1, letterSpacing: '-0.5px', marginBottom: 10 }}>
        {title}
      </h2>
      <p style={{ fontSize: 14, color: C.text2, lineHeight: 1.6, marginBottom: note ? 10 : 22, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
        {description}
      </p>

      {/* Optional note — small amber line, e.g. "Outlier Scoring requires 3 credits." */}
      {note && (
        <p style={{ fontSize: 12.5, color: C.amber, fontWeight: 600, marginBottom: 22, letterSpacing: '-0.05px' }}>
          {note}
        </p>
      )}

      {/* Bullets */}
      {bullets.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24, textAlign: 'left', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
          {bullets.map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 20, height: 20, borderRadius: '50%',
                background: `${C.green}18`, flexShrink: 0, marginTop: 1,
              }}>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke={C.green} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1.5,6.5 5,10 10.5,2"/>
                </svg>
              </span>
              <span style={{ fontSize: 13.5, color: C.text2, lineHeight: 1.55 }}>{t}</span>
            </div>
          ))}
        </div>
      )}

      {/* Primary CTA */}
      <a
        href="/?tab=monthly#pricing"
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          width: '100%', maxWidth: 360,
          background: `linear-gradient(180deg, ${C.red} 0%, #a50f07 100%)`,
          color: '#ffffff',
          fontSize: 14, fontWeight: 700,
          padding: '13px 24px', borderRadius: 999,
          textDecoration: 'none', letterSpacing: '-0.1px',
          boxShadow: `0 8px 22px ${C.red}50, inset 0 1px 0 rgba(255,255,255,0.22)`,
        }}
      >
        {primaryCta}
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
        </svg>
      </a>
      <div style={{ fontSize: 12.5, color: C.text3, fontWeight: 500, marginTop: 10, marginBottom: showPackLink ? 8 : 0 }}>
        Plans from <span style={{ fontWeight: 700, color: C.text2 }}>$19/mo</span> · cancel anytime
      </div>

      {/* Secondary pack link — only on Weekly Report (per product spec). */}
      {showPackLink && (
        <div>
          <a
            href="/?tab=packs#pricing"
            style={{ fontSize: 12.5, fontWeight: 600, color: C.text3, textDecoration: 'none' }}
          >
            Or grab a one-time credit pack →
          </a>
        </div>
      )}

      {/* Trust stack */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
        marginTop: 22, paddingTop: 20,
        borderTop: `1px solid ${C.border}`,
      }}>
        <div style={{ display: 'flex' }}>
          {['sophie', 'james', 'priya', 'amara', 'marcus'].map((name, i, arr) => (
            <img
              key={name}
              src={`/avatars/${name}.jpg`}
              alt=""
              style={{
                width: 28, height: 28, borderRadius: '50%',
                border: '2px solid #ffffff',
                marginLeft: i === 0 ? 0 : -9,
                objectFit: 'cover',
                boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                zIndex: arr.length - i,
                position: 'relative',
              }}
            />
          ))}
        </div>
        <span style={{ fontSize: 12.5, color: C.text3, fontWeight: 500, textAlign: 'left', lineHeight: 1.4 }}>
          Trusted by creators growing<br/>their channels every week
        </span>
      </div>
    </div>
  )
}
