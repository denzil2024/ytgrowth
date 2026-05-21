/* ─── Feed (Home) cards ───────────────────────────────────────────────────
   Phase 1 of the Home rebuild. Replaces the giant audit wall with a card
   stream organised by category. The card pattern: tinted-icon eyebrow row,
   one headline, one body line, one primary CTA. Mirrors the What’s New card
   structure used in the sidebar so the design language is consistent. */
import { useState } from 'react'
import {
  ArrowDown, ArrowRight, ChevronDown, ExternalLink, Eye, Flame,
  RefreshCw, Users,
  Target, Trophy, BarChart3, Activity, CalendarDays,
  Clock, TrendingUp, Lightbulb, UserPlus,
  X as XIcon,
} from 'lucide-react'
import { C, SHELL, DAYS_SHORT, DAYS_LONG } from './tokens'
import {
  sev,
  ytMaxThumbUrl, makeThumbOnError, makeThumbOnLoad,
  fmtNum,
  computePostingStats, computeBestTime, formatHour12,
  categoryToNav,
} from './utils'
import { StatTile } from './primitives'

export function FeedFilterPills({ value, counts, onChange }) {
  const TABS = [
    { key: 'all',         label: 'All' },
    { key: 'actions',     label: 'Actions' },
    { key: 'insights',    label: 'Insights' },
    { key: 'achievements', label: 'Achievements' },
  ]
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
      {TABS.map(t => {
        const active = value === t.key
        const count = counts?.[t.key] ?? null
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange?.(t.key)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '7px 14px', borderRadius: 100,
              border: `1px solid ${active ? SHELL.hair : 'transparent'}`,
              background: active ? SHELL.activeBg : 'transparent',
              color: active ? SHELL.text1 : SHELL.text2,
              fontSize: 13, fontWeight: active ? 600 : 500, letterSpacing: '-0.05px',
              cursor: 'pointer',
              boxShadow: 'none',
              transition: 'background 0.18s cubic-bezier(0.2,0.7,0.3,1), color 0.18s, border-color 0.18s',
            }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = SHELL.hoverBg; e.currentTarget.style.color = SHELL.text1 } }}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = SHELL.text2 } }}
          >
            {t.label}
            {count != null && count > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                minWidth: 18, height: 18, padding: '0 6px',
                borderRadius: 100,
                fontSize: 10.5, fontWeight: 600,
                background: active ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
                color: active ? SHELL.text1 : SHELL.text2,
                fontVariantNumeric: 'tabular-nums',
              }}>{count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// Generic Feed card wrapper. Eyebrow row (tinted-circle Lucide icon +
// category label + age) on top, body slot below, optional dismiss x.
// Every card on the Feed shares this shell so the design language reads
// as one system, not a pile of bespoke surfaces.
export function FeedCard({
  Icon,                // Lucide icon component
  iconColor = '#e5251b',
  iconBg = 'rgba(229,37,27,0.08)',
  category,
  age,
  onDismiss,
  rightSlot,
  children,
  fillHeight = false,  // true when card lives in a 2-up grid row so both
                       // cards match heights and the bottom action row
                       // stays anchored to the card's bottom.
}) {
  return (
    <article style={{
      background: SHELL.cardFlat,
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 14,
      padding: '14px 18px 16px 18px',
      boxShadow: '0 1px 2px rgba(255,255,255,0.04), 0 6px 18px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.7)',
      marginBottom: 12,
      transition: 'box-shadow 0.2s cubic-bezier(0.2,0.7,0.3,1), transform 0.2s cubic-bezier(0.2,0.7,0.3,1), border-color 0.2s',
      height: fillHeight ? '100%' : 'auto',
      display: fillHeight ? 'flex' : 'block',
      flexDirection: fillHeight ? 'column' : undefined,
    }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 2px 6px rgba(255,255,255,0.06), 0 12px 32px rgba(255,255,255,0.07), inset 0 1px 0 rgba(255,255,255,0.7)'
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 1px 2px rgba(255,255,255,0.04), 0 6px 18px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.7)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 9,
        marginBottom: 10,
      }}>
        <span style={{
          flexShrink: 0,
          width: 24, height: 24, borderRadius: 7,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: iconBg,
          color: iconColor,
        }}>
          <Icon size={13} strokeWidth={2.1} />
        </span>
        <span style={{
          fontSize: 11, fontWeight: 600, color: SHELL.text2,
          letterSpacing: '0.10em', textTransform: 'uppercase',
        }}>{category}</span>
        {age && (
          <span style={{ fontSize: 11, color: SHELL.text3, fontWeight: 500, letterSpacing: '-0.01em' }}>
            · {age}
          </span>
        )}
        <div style={{ flex: 1 }}/>
        {rightSlot}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            style={{
              width: 22, height: 22, borderRadius: 6,
              border: 'none', background: 'transparent',
              color: 'rgba(255,255,255,0.36)',
              cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.14s ease, color 0.14s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = SHELL.text1 }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.36)' }}
          >
            <XIcon size={12} strokeWidth={2.1} />
          </button>
        )}
      </div>
      {fillHeight ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      ) : children}
    </article>
  )
}

// Priority Action card. Collapsed first: lighter headline + meta + CTAs.
// The impact pill in the eyebrow already signals weight, so no redundant
// impact bar. Prose lives behind Detail.
// One card, three compact rows. Replaces the wall of three stacked
// PriorityActionCards that each rendered the full analytical `problem`
// paragraph as a bold headline. Each row here shows ONE short action line
// (action.action, falling back to a clamped problem). Click a row to expand
// the diagnostic prose + "why this works"; otherwise nothing is shown.
export function ActionsRailCard({ items, totalCount }) {
  const [openKey, setOpenKey] = useState(null)
  if (!items || items.length === 0) return null

  const impactColor = (impact) => {
    const k = (impact || 'med').toLowerCase()
    // Dark-mode text variants of the brand red/amber. The saturated brand
    // values (#e5251b / #d97706) are reserved for CTA backgrounds; using
    // them as small label text on dark shimmers/halates. #fb6a60 / #f0a23b
    // are the canonical text-on-dark equivalents used elsewhere in the app.
    return k === 'high' ? '#fb6a60' : k === 'low' ? SHELL.text3 : '#f0a23b'
  }
  const impactLabel = (impact) => {
    const k = (impact || 'med').toLowerCase()
    return k === 'high' ? 'High' : k === 'low' ? 'Low' : 'Medium'
  }

  // Short, scannable one-liner. action.action is usually a verb phrase ("Add
  // chapters to your three newest uploads"). If the API only sent a long
  // `problem` diagnosis, take the first clause and clamp it - the whole
  // paragraph belongs in the expander, not the always-visible row.
  const headlineFor = (a) => {
    const raw = (a.action && a.action.length > 8 ? a.action : a.problem) || ''
    const clean = raw.replace(/\s+/g, ' ').trim()
    if (clean.length <= 120) return clean
    const cut = clean.slice(0, 117)
    return cut.replace(/\s+\S*$/, '') + '…'
  }

  return (
    <article style={{
      background: SHELL.cardFlat,
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 14,
      boxShadow: '0 1px 2px rgba(255,255,255,0.04), 0 6px 18px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.7)',
      overflow: 'hidden',
      marginBottom: 12,
    }}>
      {/* Header — single eyebrow line, no big bold paragraph */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 18px',
        borderBottom: '1px solid rgba(255,255,255,0.10)',
      }}>
        <span style={{
          fontSize: 11, fontWeight: 600, color: SHELL.text2,
          letterSpacing: '0.10em', textTransform: 'uppercase',
        }}>Priority actions</span>
        <span style={{
          fontSize: 11, fontWeight: 600, color: SHELL.text3,
          background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 99,
          fontVariantNumeric: 'tabular-nums',
        }}>{items.length} of {totalCount}</span>
      </div>

      {/* Rows */}
      <div>
        {items.map((it, i) => {
          const isOpen = openKey === it.key
          const label = impactLabel(it.impact)
          const showFix = it.action.action && it.action.action !== it.action.problem
          const showWhy = !!it.action.expected_outcome
          return (
            <div key={it.key} style={{
              borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.10)',
              transition: 'background 0.14s',
              background: isOpen ? 'rgba(255,255,255,0.015)' : 'transparent',
            }}>
              {/* Row */}
              <div
                role="button" tabIndex={0}
                onClick={() => setOpenKey(o => o === it.key ? null : it.key)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenKey(o => o === it.key ? null : it.key) } }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '13px 18px', cursor: 'pointer', userSelect: 'none',
                }}>
                <span style={{
                  flexShrink: 0, width: 22, height: 22, borderRadius: 7,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(255,255,255,0.06)',
                  fontSize: 11, fontWeight: 600, color: SHELL.text1,
                  fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.2px',
                }}>{i + 1}</span>

                <p style={{
                  flex: 1, minWidth: 0,
                  fontSize: 13.5, fontWeight: 450, color: SHELL.text1,
                  letterSpacing: '-0.1px', lineHeight: 1.45,
                  margin: 0,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>{headlineFor(it.action)}</p>

                <span style={{
                  flexShrink: 0,
                  fontSize: 10.5, fontWeight: 600, color: impactColor(it.impact),
                  letterSpacing: '-0.05px',
                  whiteSpace: 'nowrap',
                }}>{label}</span>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); it.onAct() }}
                  style={{
                    flexShrink: 0,
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '7px 14px', borderRadius: 99,
                    border: 'none', cursor: 'pointer',
                    background: '#e5251b', color: '#fff',
                    fontFamily: 'inherit',
                    fontSize: 12, fontWeight: 600, letterSpacing: '-0.05px',
                    boxShadow: '0 1px 3px rgba(229,37,27,0.30)',
                    transition: 'filter 0.14s, transform 0.14s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  {it.ctaLabel}
                  <ArrowRight size={11} strokeWidth={2.4}/>
                </button>

                <ChevronDown size={14} strokeWidth={2}
                  style={{
                    flexShrink: 0, color: SHELL.text3,
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}/>
              </div>

              {/* Expanded detail (per row) */}
              {isOpen && (
                <div style={{ padding: '0 18px 14px 60px' }}>
                  {it.action.problem && (
                    <p style={{
                      fontSize: 12.5, fontWeight: 400, color: 'rgba(255,255,255,0.65)',
                      lineHeight: 1.6, letterSpacing: '-0.02em',
                      marginBottom: (showFix || showWhy) ? 10 : 8,
                    }}>{it.action.problem}</p>
                  )}
                  {(showFix || showWhy) && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: showFix && showWhy ? '1fr 1fr' : '1fr',
                      gap: 8, marginBottom: 8,
                    }}>
                      {showFix && (
                        <div style={{
                          background: 'rgba(229,37,27,0.04)',
                          border: '1px solid rgba(229,37,27,0.10)',
                          borderLeft: '3px solid #e5251b',
                          borderRadius: '0 8px 8px 0',
                          padding: '8px 12px',
                        }}>
                          <p style={{ fontSize: 9.5, fontWeight: 600, color: '#fb6a60', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 4 }}>Fix</p>
                          <p style={{ fontSize: 12, fontWeight: 500, color: SHELL.text1, lineHeight: 1.55 }}>{it.action.action}</p>
                        </div>
                      )}
                      {showWhy && (
                        <div style={{
                          background: 'rgba(5,150,105,0.04)',
                          border: '1px solid rgba(5,150,105,0.12)',
                          borderLeft: '3px solid #059669',
                          borderRadius: '0 8px 8px 0',
                          padding: '8px 12px',
                        }}>
                          <p style={{ fontSize: 9.5, fontWeight: 600, color: '#34d27b', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 4 }}>Why this works</p>
                          <p style={{ fontSize: 12, fontWeight: 500, color: SHELL.text1, lineHeight: 1.55 }}>{it.action.expected_outcome}</p>
                        </div>
                      )}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); it.onDone() }}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '6px 12px', borderRadius: 99,
                        border: '1px solid rgba(255,255,255,0.12)',
                        background: SHELL.cardFlat, color: 'rgba(255,255,255,0.65)',
                        fontFamily: 'inherit',
                        fontSize: 11.5, fontWeight: 600, letterSpacing: '-0.05px',
                        cursor: 'pointer',
                        transition: 'background 0.14s, color 0.14s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = SHELL.text1 }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)' }}
                    >Mark done</button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); it.onDismiss() }}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '6px 12px', borderRadius: 99,
                        border: '1px solid rgba(255,255,255,0.12)',
                        background: SHELL.cardFlat, color: SHELL.text2,
                        fontFamily: 'inherit',
                        fontSize: 11.5, fontWeight: 600, letterSpacing: '-0.05px',
                        cursor: 'pointer',
                        transition: 'background 0.14s, color 0.14s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = SHELL.text1 }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.78)' }}
                    >Dismiss</button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </article>
  )
}

export function PriorityActionCard({ action, rank, total, impact, onAct, onDone, onDismiss, ctaLabel }) {
  const [open, setOpen] = useState(false)
  const impactKey = (impact || 'med').toLowerCase()
  const impactClr = impactKey === 'high' ? '#fb6a60' : impactKey === 'low' ? SHELL.text3 : '#f0a23b'
  const impactBg  = impactKey === 'high' ? 'rgba(229,37,27,0.07)' : impactKey === 'low' ? 'rgba(255,255,255,0.04)' : 'rgba(217,119,6,0.08)'
  const impactBdr = impactKey === 'high' ? 'rgba(229,37,27,0.18)' : impactKey === 'low' ? 'rgba(255,255,255,0.10)' : 'rgba(217,119,6,0.18)'

  const cat = action.category || categoryToNav(action.category, action.problem)

  return (
    <FeedCard
      Icon={Target}
      iconColor={C.red}
      iconBg="rgba(229,37,27,0.08)"
      category={`Priority Action · ${rank} of ${total}`}
      onDismiss={onDismiss}
      rightSlot={
        <span style={{
          fontSize: 9.5, fontWeight: 600, color: impactClr,
          background: impactBg, border: `1px solid ${impactBdr}`,
          padding: '3px 8px', borderRadius: 100,
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>{impactKey} impact</span>
      }
    >
      {/* Headline — lighter weight so the Actions tab doesn't read like a
          wall of bold. The eyebrow chip already signals the weight. */}
      <h3 style={{
        fontSize: 13.5, fontWeight: 450, color: SHELL.text1,
        letterSpacing: '-0.1px', lineHeight: 1.5,
        marginBottom: 10,
      }}>{action.problem || action.action || 'Action'}</h3>

      {/* Meta row + CTAs + Detail chevron */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: 11, fontWeight: 500, color: SHELL.text3,
          letterSpacing: '-0.01em',
        }}>
          <span style={{ width: 5, height: 5, borderRadius: 99, background: impactClr }}/>
          {cat}
        </span>

        <div style={{ flex: 1 }}/>

        <button
          type="button"
          onClick={onAct}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '7px 13px', borderRadius: 100,
            border: 'none', cursor: 'pointer',
            background: C.red, color: '#fff',
            fontFamily: 'inherit',
            fontSize: 12, fontWeight: 600, letterSpacing: '-0.01em',
            boxShadow: '0 1px 3px rgba(229,37,27,0.30)',
            transition: 'filter 0.14s ease, transform 0.14s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          {ctaLabel || 'Open tool'}
          <ArrowRight size={12} strokeWidth={2.4} />
        </button>

        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Hide detail' : 'Show detail'}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '6px 11px', borderRadius: 100,
            border: '1px solid rgba(255,255,255,0.08)',
            background: SHELL.cardFlat, color: SHELL.text2,
            fontFamily: 'inherit',
            fontSize: 11.5, fontWeight: 600, letterSpacing: '-0.01em',
            cursor: 'pointer',
            transition: 'background 0.14s ease, color 0.14s ease, border-color 0.14s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = SHELL.text1; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = SHELL.text2; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
        >
          Detail
          <ChevronDown size={11} strokeWidth={2.4} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}/>
        </button>
      </div>

      {/* Detail (collapsed by default). The Fix and Why blocks each get
          a tinted card so they don't sit on plain white. Fix = red tint
          (this is the action, matches the card's brand identity); Why =
          green tint (the positive outcome). Mirrors the Insight Card
          pattern in the legacy audit detail. */}
      {open && (
        <div style={{
          marginTop: 14, paddingTop: 14,
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          {(() => {
            const showFix = action.action && action.action !== action.problem
            const showWhy = !!action.expected_outcome
            if (!showFix && !showWhy) return null
            return (
              <div style={{
                display: 'grid',
                gridTemplateColumns: showFix && showWhy ? '1fr 1fr' : '1fr',
                gap: 10, marginBottom: 14,
              }}>
                {showFix && (
                  <div style={{
                    background: 'rgba(229,37,27,0.05)',
                    border: '1px solid rgba(229,37,27,0.12)',
                    borderLeft: `3px solid ${C.red}`,
                    borderRadius: '0 10px 10px 0',
                    padding: '11px 14px',
                  }}>
                    <p style={{
                      fontSize: 9.5, fontWeight: 600, color: '#fb6a60',
                      letterSpacing: '0.10em', textTransform: 'uppercase',
                      marginBottom: 6,
                    }}>Fix</p>
                    <p style={{
                      fontSize: 12.5, fontWeight: 450, color: SHELL.text1,
                      letterSpacing: '-0.01em', lineHeight: 1.65,
                    }}>{action.action}</p>
                  </div>
                )}
                {showWhy && (
                  <div style={{
                    background: 'rgba(22,163,74,0.14)',
                    border: '1px solid rgba(5,150,105,0.14)',
                    borderLeft: `3px solid ${'#34d27b'}`,
                    borderRadius: '0 10px 10px 0',
                    padding: '11px 14px',
                  }}>
                    <p style={{
                      fontSize: 9.5, fontWeight: 600, color: '#34d27b',
                      letterSpacing: '0.10em', textTransform: 'uppercase',
                      marginBottom: 6,
                    }}>Why this works</p>
                    <p style={{
                      fontSize: 12.5, fontWeight: 450, color: SHELL.text1,
                      letterSpacing: '-0.01em', lineHeight: 1.65,
                    }}>{action.expected_outcome}</p>
                  </div>
                )}
              </div>
            )
          })()}
          <button
            type="button"
            onClick={onDone}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '6px 12px', borderRadius: 100,
              border: '1px solid rgba(255,255,255,0.08)',
              background: SHELL.cardFlat, color: SHELL.text2,
              fontFamily: 'inherit',
              fontSize: 11.5, fontWeight: 600, letterSpacing: '-0.01em',
              cursor: 'pointer',
              transition: 'background 0.14s ease, color 0.14s ease, border-color 0.14s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = SHELL.text1; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = SHELL.text2; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
          >
            Mark done
          </button>
        </div>
      )}
    </FeedCard>
  )
}

// Milestone Unlocked card. Collapsed first: headline + a "100% bar" visual
// confirming the threshold was crossed + Share CTA. The celebration line
// lives behind a Detail chevron.
export function MilestoneFeedCard({ milestone, onShare, onDownload, onDismiss }) {
  const [open, setOpen] = useState(false)
  return (
    <FeedCard
      Icon={Trophy}
      iconColor={'#f0a23b'}
      iconBg="rgba(217,119,6,0.10)"
      category="Milestone Unlocked"
      age={milestone.earned_age || ''}
      onDismiss={onDismiss}
    >
      <h3 style={{
        fontSize: 14, fontWeight: 600, color: SHELL.text1,
        letterSpacing: '-0.25px', lineHeight: 1.35,
        marginBottom: 12,
      }}>{milestone.headline}</h3>

      {/* Visual band: filled-to-100 bar in amber, signalling crossed */}
      <div style={{ marginBottom: 12 }}>
        <div style={{
          position: 'relative',
          background: 'rgba(255,255,255,0.08)', borderRadius: 99, height: 6,
          overflow: 'hidden',
        }}>
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(90deg, rgba(217,119,6,0.55) 0%, #d97706 100%)',
            borderRadius: 99,
          }}/>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{
          fontSize: 11.5, fontWeight: 500, color: SHELL.text3, letterSpacing: '-0.01em',
        }}>Achievement unlocked</span>
        <div style={{ flex: 1 }}/>
        {onShare && (
          <button
            type="button"
            onClick={onShare}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '7px 13px', borderRadius: 100,
              border: 'none', cursor: 'pointer',
              background: C.red, color: '#fff',
              fontFamily: 'inherit',
              fontSize: 12, fontWeight: 600, letterSpacing: '-0.01em',
              boxShadow: '0 1px 3px rgba(229,37,27,0.30)',
              transition: 'filter 0.14s ease, transform 0.14s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            Share milestone
            <ArrowRight size={12} strokeWidth={2.4} />
          </button>
        )}
        {milestone.body && (
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Hide detail' : 'Show detail'}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '6px 11px', borderRadius: 100,
              border: '1px solid rgba(255,255,255,0.08)',
              background: SHELL.cardFlat, color: SHELL.text2,
              fontFamily: 'inherit',
              fontSize: 11.5, fontWeight: 600, letterSpacing: '-0.01em',
              cursor: 'pointer',
              transition: 'background 0.14s ease, color 0.14s ease, border-color 0.14s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = SHELL.text1; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = SHELL.text2; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
          >
            Detail
            <ChevronDown size={11} strokeWidth={2.4} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}/>
          </button>
        )}
      </div>

      {open && milestone.body && (
        <div style={{
          marginTop: 14, paddingTop: 14,
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          <p style={{
            fontSize: 12.5, fontWeight: 500, color: SHELL.text2,
            letterSpacing: '-0.01em', lineHeight: 1.65,
          }}>{milestone.body}</p>
        </div>
      )}
    </FeedCard>
  )
}

// Content Mix card. Collapsed first: headline + stacked Shorts-vs-Long
// bar + a single-line recommendation. The AI insight prose lives behind
// Detail. Uses fillHeight so it pairs cleanly with Channel Health in a
// 2-up grid row.
export function ContentMixFeedCard({ patterns, mix, onDismiss, fillHeight = false }) {
  const [open, setOpen] = useState(false)
  if (!patterns) return null
  const sCount = mix?.shortsCount ?? null
  const lCount = mix?.longsCount ?? null
  const total = (sCount ?? 0) + (lCount ?? 0)
  const sPct = total > 0 ? Math.round(((sCount || 0) / total) * 100) : 50
  const lPct = 100 - sPct

  // Short recommendation that fills the visual gap and tells the user what
  // to do next. Picked from real signals (shorts vs long performance, or
  // the mix balance if performance is unknown).
  const shortAvg = patterns.shortAvg || 0
  const longAvg  = patterns.longAvg  || 0
  let recommendation
  if (shortAvg > longAvg * 1.5) {
    recommendation = 'Shorts are pulling new viewers. Add 2-3 per week.'
  } else if (longAvg > shortAvg * 1.5) {
    recommendation = 'Long-form is your strength. Keep building depth.'
  } else if (sPct < 15 && total > 5) {
    recommendation = 'Almost no Shorts. Test the format for discovery reach.'
  } else if (sPct > 85 && total > 5) {
    recommendation = 'Heavy on Shorts. Add long-form to deepen retention.'
  } else {
    recommendation = 'Healthy mix. Lean into whichever format wins this month.'
  }

  return (
    <FeedCard
      Icon={BarChart3}
      iconColor={SHELL.text1}
      iconBg="rgba(255,255,255,0.06)"
      category="Content Mix"
      onDismiss={onDismiss}
      fillHeight={fillHeight}
    >
      <h3 style={{
        fontSize: 14, fontWeight: 600, color: SHELL.text1,
        letterSpacing: '-0.25px', lineHeight: 1.35,
        marginBottom: 12,
      }}>{patterns.headline || 'Your content mix'}</h3>

      <div style={{ marginBottom: 10 }}>
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.08)', borderRadius: 99, height: 7,
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${sPct}%`, height: '100%',
            background: 'linear-gradient(90deg, rgba(229,37,27,0.55) 0%, #e5251b 100%)',
          }}/>
          <div style={{
            width: `${lPct}%`, height: '100%',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.72) 100%)',
          }}/>
        </div>
      </div>

      {/* Legend row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 14 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 11.5, fontWeight: 500, color: SHELL.text2, letterSpacing: '-0.01em',
          fontVariantNumeric: 'tabular-nums',
        }}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: '#e5251b' }}/>
          Shorts {sCount != null && (<><strong style={{ color: SHELL.text1, fontWeight: 600 }}> {sCount}</strong> · {sPct}%</>)}
        </span>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 11.5, fontWeight: 500, color: SHELL.text2, letterSpacing: '-0.01em',
          fontVariantNumeric: 'tabular-nums',
        }}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: 'rgba(255,255,255,0.72)' }}/>
          Long {lCount != null && (<><strong style={{ color: SHELL.text1, fontWeight: 600 }}> {lCount}</strong> · {lPct}%</>)}
        </span>
      </div>

      {/* Recommendation line — fills the height gap with real signal */}
      <p style={{
        fontSize: 12.5, fontWeight: 500, color: SHELL.text2,
        letterSpacing: '-0.01em', lineHeight: 1.55,
        marginBottom: 14,
      }}>
        <span style={{ fontWeight: 600, color: SHELL.text1 }}>Recommendation: </span>
        {recommendation}
      </p>

      {/* Action row — pinned to the bottom when fillHeight is on */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        marginTop: fillHeight ? 'auto' : 0,
        paddingTop: fillHeight ? 4 : 0,
      }}>
        <div style={{ flex: 1 }}/>
        {(patterns.body || patterns.text) && (
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Hide detail' : 'Show detail'}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '6px 11px', borderRadius: 100,
              border: '1px solid rgba(255,255,255,0.08)',
              background: SHELL.cardFlat, color: SHELL.text2,
              fontFamily: 'inherit',
              fontSize: 11.5, fontWeight: 600, letterSpacing: '-0.01em',
              cursor: 'pointer',
              transition: 'background 0.14s ease, color 0.14s ease, border-color 0.14s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = SHELL.text1; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = SHELL.text2; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
          >
            Detail
            <ChevronDown size={11} strokeWidth={2.4} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}/>
          </button>
        )}
      </div>

      {open && (patterns.body || patterns.text) && (
        <div style={{
          marginTop: 14, paddingTop: 14,
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          <p style={{
            fontSize: 12.5, fontWeight: 500, color: SHELL.text2,
            letterSpacing: '-0.01em', lineHeight: 1.65,
          }}>{patterns.body || patterns.text || ''}</p>
        </div>
      )}
    </FeedCard>
  )
}

// Channel Health card. Collapsed first: one bold line of state + a row of
// per-category score dots (visual), with the score chip on the right of
// the eyebrow. The full audit (priority actions checklist, category bars,
// quick wins, biggest risk) renders below when expanded.
export function ChannelHealthFeedCard({ score, categories, weakest, children, open, onToggle, fillHeight = false }) {
  const scoreClr =
    score >= 75 ? '#34d27b' : score >= 50 ? '#f0a23b' : C.red
  const scoreBdr =
    score >= 75 ? 'rgba(5,150,105,0.25)' : score >= 50 ? 'rgba(217,119,6,0.22)' : 'rgba(229,37,27,0.22)'
  const scoreBg =
    score >= 75 ? 'rgba(22,163,74,0.14)' : score >= 50 ? 'rgba(217,119,6,0.06)' : 'rgba(229,37,27,0.05)'

  // Map each category score to a dot color. We surface the 5 categories
  // VidIQ users instantly recognise: CTR, retention, strategy,
  // consistency, engagement. Hover reveals the label + score.
  const dotFor = (v) => {
    if (v == null) return { c: 'rgba(255,255,255,0.20)', bdr: 'rgba(255,255,255,0.20)' }
    if (v >= 75) return { c: '#34d27b', bdr: 'rgba(5,150,105,0.35)' }
    if (v >= 50) return { c: '#f0a23b', bdr: 'rgba(217,119,6,0.35)' }
    return { c: C.red, bdr: 'rgba(229,37,27,0.30)' }
  }
  const dots = (categories || []).map(([label, value]) => ({ label, value, ...dotFor(value) }))

  return (
    <FeedCard
      Icon={Activity}
      iconColor={scoreClr}
      iconBg={scoreBg}
      category="Channel Health"
      fillHeight={fillHeight}
      rightSlot={
        <span style={{
          display: 'inline-flex', alignItems: 'baseline', gap: 2,
          padding: '3px 10px', borderRadius: 100,
          border: `1px solid ${scoreBdr}`,
          background: scoreBg,
          fontVariantNumeric: 'tabular-nums',
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: scoreClr, letterSpacing: '-0.3px', lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: SHELL.text3 }}>/100</span>
        </span>
      }
    >
      <h3 style={{
        fontSize: 14, fontWeight: 600, color: SHELL.text1,
        letterSpacing: '-0.25px', lineHeight: 1.35,
        marginBottom: 12,
      }}>
        {score >= 75 ? 'Your channel is healthy. Keep doing what works.'
          : score >= 50 ? "Solid, with clear room to improve."
          : 'Underperforming for your size. Fix list below.'}
      </h3>

      {/* Visual band: per-category dots */}
      {dots.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
          marginBottom: 12,
        }}>
          {dots.map(d => (
            <span
              key={d.label}
              title={`${d.label}: ${d.value ?? '—'}`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
            >
              <span style={{
                width: 10, height: 10, borderRadius: 99,
                background: d.c, border: `1px solid ${d.bdr}`,
              }}/>
              <span style={{ fontSize: 11.5, fontWeight: 500, color: SHELL.text3, letterSpacing: '-0.01em' }}>{d.label}</span>
            </span>
          ))}
        </div>
      )}

      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        marginTop: fillHeight ? 'auto' : 0,
        paddingTop: fillHeight ? 4 : 0,
      }}>
        {weakest && weakest.length > 0 && (
          <span style={{ fontSize: 11.5, fontWeight: 500, color: SHELL.text3, letterSpacing: '-0.01em' }}>
            Weakest: <span style={{ color: SHELL.text2, fontWeight: 600 }}>{weakest.join(', ')}</span>
          </span>
        )}
        <div style={{ flex: 1 }}/>
        <button
          type="button"
          onClick={onToggle}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '6px 11px', borderRadius: 100,
            border: '1px solid rgba(255,255,255,0.08)',
            background: SHELL.cardFlat, color: SHELL.text2,
            fontFamily: 'inherit',
            fontSize: 11.5, fontWeight: 600, letterSpacing: '-0.01em',
            cursor: 'pointer',
            transition: 'background 0.14s ease, color 0.14s ease, border-color 0.14s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = SHELL.text1; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = SHELL.text2; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
        >
          {open ? 'Hide audit' : 'See full audit'}
          <ChevronDown size={11} strokeWidth={2.4} style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}/>
        </button>
      </div>

      {open && (
        <div style={{ marginTop: 18 }}>
          {children}
        </div>
      )}
    </FeedCard>
  )
}

// Top Performer card. Celebrates the user's strongest video this month
// instead of only nagging about problems. Real thumbnail on the left, the
// title + a "X.Xx your average" multiplier on the right. This is the
// single most powerful retention card we ship: the user sees a win.
export function TopPerformerCard({ video, channelAvgViews, onOpen, onDismiss }) {
  if (!video) return null
  const multiplier = channelAvgViews > 0 ? (video.views / channelAvgViews) : 0
  const mDisplay = multiplier >= 10 ? `${multiplier.toFixed(0)}x`
    : multiplier >= 1 ? `${multiplier.toFixed(1)}x`
    : null
  const engagement = video.views > 0
    ? Number(((video.likes || 0) / video.views * 100).toFixed(2))
    : 0
  const ageDays = video.published_at
    ? Math.floor((Date.now() - new Date(video.published_at).getTime()) / 86400000)
    : null
  const ageStr = ageDays == null ? '' : ageDays === 0 ? 'today' : ageDays === 1 ? 'yesterday' : `${ageDays}d ago`

  return (
    <FeedCard
      Icon={Trophy}
      iconColor={'#34d27b'}
      iconBg="rgba(22,163,74,0.14)"
      category="Top Performer"
      age={ageStr}
      onDismiss={onDismiss}
      rightSlot={mDisplay && (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 3,
          fontSize: 10.5, fontWeight: 700, color: '#34d27b',
          background: 'rgba(22,163,74,0.14)', border: '1px solid rgba(5,150,105,0.22)',
          padding: '3px 8px', borderRadius: 100,
          letterSpacing: '-0.05px',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {mDisplay} your avg
        </span>
      )}
    >
      <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
        {/* Thumbnail */}
        {video.thumbnail ? (
          <div style={{
            flexShrink: 0, width: 200, aspectRatio: '16/9',
            borderRadius: 10, overflow: 'hidden',
            background: '#26262b',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 6px 18px rgba(0,0,0,0.08)',
          }}>
            <img
              src={video.thumbnail}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        ) : (
          <div style={{
            flexShrink: 0, width: 200, aspectRatio: '16/9',
            borderRadius: 10, background: '#26262b',
          }}/>
        )}

        {/* Right side: title + metrics */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{
            fontSize: 14, fontWeight: 600, color: SHELL.text1,
            letterSpacing: '-0.25px', lineHeight: 1.4,
            marginBottom: 12,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>{video.title}</h3>

          {/* Three-stat row */}
          <div style={{ display: 'flex', gap: 22, marginBottom: 'auto', alignItems: 'flex-end' }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, color: SHELL.text3, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 5 }}>Views</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: SHELL.text1, letterSpacing: '-0.5px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{fmtNum(video.views || 0)}</p>
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, color: SHELL.text3, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 5 }}>Likes</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: SHELL.text1, letterSpacing: '-0.5px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{fmtNum(video.likes || 0)}</p>
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, color: SHELL.text3, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 5 }}>Engagement</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: engagement >= 3 ? '#34d27b' : SHELL.text1, letterSpacing: '-0.5px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{engagement}%</p>
            </div>
          </div>

          {/* CTA row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
            <span style={{ fontSize: 11.5, fontWeight: 500, color: SHELL.text3, letterSpacing: '-0.01em' }}>
              Replicate this format
            </span>
            <div style={{ flex: 1 }}/>
            {onOpen && (
              <button
                type="button"
                onClick={onOpen}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '7px 13px', borderRadius: 100,
                  border: 'none', cursor: 'pointer',
                  background: C.red, color: '#fff',
                  fontFamily: 'inherit',
                  fontSize: 12, fontWeight: 600, letterSpacing: '-0.01em',
                  boxShadow: '0 1px 3px rgba(229,37,27,0.30)',
                  transition: 'filter 0.14s ease, transform 0.14s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                Study video
                <ArrowRight size={12} strokeWidth={2.4} />
              </button>
            )}
          </div>
        </div>
      </div>
    </FeedCard>
  )
}


// Posting timeline chart. Real SVG cumulative line chart, not a tile of
// squares. Shows the climb each upload day with soft red area fill, white
// dots at each upload event, and real date labels along the bottom.
export function PostingTimeline({ uploadDays }) {
  const width = 720
  const height = 110
  const padX = 6
  const padTop = 8
  const padBot = 22 // room for date labels
  const usableW = width - padX * 2
  const usableH = height - padTop - padBot

  // Cumulative uploads array (28 entries).
  const cumulative = []
  let total = 0
  for (const c of uploadDays) { total += c; cumulative.push(total) }

  // If zero uploads, render a flat baseline with "no activity" label.
  if (total === 0) {
    return (
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ display: 'block' }}>
        <line x1={padX} y1={height - padBot} x2={width - padX} y2={height - padBot} stroke="rgba(255,255,255,0.08)" strokeWidth="1.2"/>
        <text x={width / 2} y={height / 2} textAnchor="middle" fontSize="12" fontWeight="600" fill="rgba(255,255,255,0.40)">No uploads in this window</text>
      </svg>
    )
  }

  const maxY = Math.max(total, 1)
  const points = cumulative.map((v, i) => {
    const x = padX + (i / (cumulative.length - 1)) * usableW
    const y = padTop + (1 - v / maxY) * usableH
    return [x, y]
  })
  const uploadIdxes = uploadDays.reduce((acc, c, i) => (c > 0 ? [...acc, i] : acc), [])

  const pathLine = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ')
  const pathArea = `${pathLine} L${points[points.length - 1][0]} ${height - padBot} L${points[0][0]} ${height - padBot} Z`

  // Date labels: 5 points across (today, ~week ago, ~2wk ago, ~3wk ago, 28d ago).
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const labelIdxes = [0, 7, 14, 21, 27]
  const labels = labelIdxes.map(idx => {
    const d = new Date(today.getTime() - (27 - idx) * 86400000)
    const x = padX + (idx / 27) * usableW
    return {
      x,
      label: idx === 27 ? 'Today' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      anchor: idx === 0 ? 'start' : idx === 27 ? 'end' : 'middle',
    }
  })

  // Y-axis tick marks (faint horizontal guides) at quartiles.
  const guides = [0.25, 0.5, 0.75].map(p => padTop + (1 - p) * usableH)

  const gradId = `posting_grad_${Math.random().toString(36).slice(2, 8)}`

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(229,37,27,0.22)"/>
          <stop offset="100%" stopColor="rgba(229,37,27,0)"/>
        </linearGradient>
      </defs>

      {/* Faint horizontal guides */}
      {guides.map((y, i) => (
        <line key={i} x1={padX} y1={y} x2={width - padX} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="2 4"/>
      ))}

      {/* Baseline */}
      <line x1={padX} y1={height - padBot} x2={width - padX} y2={height - padBot} stroke="rgba(255,255,255,0.10)" strokeWidth="1"/>

      {/* Area + line */}
      <path d={pathArea} fill={`url(#${gradId})`}/>
      <path d={pathLine} fill="none" stroke="#e5251b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>

      {/* Upload-day dots */}
      {uploadIdxes.map(i => (
        <circle key={i} cx={points[i][0]} cy={points[i][1]} r="3.6" fill="#fff" stroke="#e5251b" strokeWidth="2"/>
      ))}

      {/* X-axis date labels */}
      {labels.map((l, i) => (
        <text
          key={i}
          x={l.x}
          y={height - 6}
          textAnchor={l.anchor}
          fontSize="9.5"
          fontWeight="600"
          fill="rgba(255,255,255,0.40)"
          letterSpacing="0.04em"
        >{l.label}</text>
      ))}
    </svg>
  )
}

// Small stat tile used in card-bottom strips. Tight, uppercase label,
// chunky value, single-line hint underneath.

// Posting Consistency card v2. Real SaaS chart (cumulative line) as the
// primary visual, 4-stat strip across the bottom. The legacy 28-day
// heatmap lives in Detail-expanded state for users who want the
// per-day breakdown.
export function PostingConsistencyCard({ videos, onDismiss }) {
  const [open, setOpen] = useState(false)
  const stats = computePostingStats(videos)
  const { count, pacePerWeek, currentStreak, longestStreak, gridOldestFirst } = stats

  if (count === 0) return null

  const verdict = pacePerWeek >= 3 ? 'Strong pace for your size'
    : pacePerWeek >= 1 ? 'Healthy weekly cadence'
    : pacePerWeek > 0 ? 'Posting irregularly'
    : 'No recent uploads'
  const verdictClr = pacePerWeek >= 3 ? '#34d27b'
    : pacePerWeek >= 1 ? SHELL.text2
    : '#f0a23b'

  const headline = currentStreak >= 7 ? `${currentStreak}-day posting streak`
    : currentStreak >= 3 ? `On a ${currentStreak}-day streak`
    : count >= 8 ? `${count} videos in 28 days`
    : pacePerWeek >= 1 ? `Posting ${pacePerWeek}× per week`
    : `${count} ${count === 1 ? 'video' : 'videos'} in 28 days`

  // Cell color for the (now collapsed) detail heatmap.
  const cellColor = (n) => {
    if (n === 0) return 'rgba(255,255,255,0.08)'
    if (n === 1) return 'rgba(229,37,27,0.40)'
    if (n === 2) return 'rgba(229,37,27,0.70)'
    return '#e5251b'
  }

  return (
    <FeedCard
      Icon={CalendarDays}
      iconColor={SHELL.text1}
      iconBg="rgba(255,255,255,0.06)"
      category="Posting Consistency · 28 days"
      onDismiss={onDismiss}
      rightSlot={currentStreak >= 2 && (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 10.5, fontWeight: 700, color: '#fb6a60',
          background: 'rgba(229,37,27,0.07)', border: '1px solid rgba(229,37,27,0.20)',
          padding: '3px 8px', borderRadius: 100,
          letterSpacing: '-0.05px', fontVariantNumeric: 'tabular-nums',
        }}>
          <Flame size={10} strokeWidth={2.4} />
          {currentStreak}d streak
        </span>
      )}
    >
      {/* Headline + verdict on one row */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <h3 style={{
          fontSize: 18, fontWeight: 600, color: SHELL.text1,
          letterSpacing: '-0.4px', lineHeight: 1.2,
        }}>{headline}</h3>
        <span style={{
          fontSize: 12, fontWeight: 500, color: verdictClr, letterSpacing: '-0.01em',
        }}>{verdict}</span>
      </div>

      {/* The chart */}
      <div style={{ marginBottom: 16 }}>
        <PostingTimeline uploadDays={gridOldestFirst} />
      </div>

      {/* Stat strip — 4 tiles edge to edge across the card */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16,
        paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)',
      }}>
        <StatTile
          label="Uploads"
          value={count}
          hint="in 28 days"
        />
        <StatTile
          label="Pace"
          value={`${pacePerWeek}/wk`}
          hint={pacePerWeek >= 1 ? 'weekly cadence' : 'below weekly'}
          valueColor={verdictClr}
        />
        <StatTile
          label="Streak"
          value={`${currentStreak}d`}
          hint={currentStreak >= 3 ? 'active now' : 'inactive'}
          valueColor={currentStreak >= 3 ? C.red : null}
        />
        <StatTile
          label="Best run"
          value={`${longestStreak}d`}
          hint="in window"
        />
      </div>

      {/* Detail toggle */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Hide heatmap' : 'Show daily heatmap'}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '6px 11px', borderRadius: 100,
            border: '1px solid rgba(255,255,255,0.08)',
            background: SHELL.cardFlat, color: SHELL.text2,
            fontFamily: 'inherit',
            fontSize: 11.5, fontWeight: 600, letterSpacing: '-0.01em',
            cursor: 'pointer',
            transition: 'background 0.14s ease, color 0.14s ease, border-color 0.14s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = SHELL.text1; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = SHELL.text2; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
        >
          {open ? 'Hide heatmap' : 'Daily heatmap'}
          <ChevronDown size={11} strokeWidth={2.4} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}/>
        </button>
      </div>

      {/* Daily heatmap inside the detail expansion */}
      {open && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: SHELL.text3, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 12 }}>
            Daily uploads — last 28 days
          </p>
          {/* Horizontal strip: 28 cells in a single row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(28, 1fr)', gap: 4 }}>
            {gridOldestFirst.map((c, i) => (
              <div
                key={i}
                title={c === 0 ? 'No upload' : c === 1 ? '1 upload' : `${c} uploads`}
                style={{
                  aspectRatio: '1 / 1',
                  borderRadius: 4,
                  background: cellColor(c),
                  border: c === 0 ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(229,37,27,0.10)',
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10 }}>
            <span style={{ fontSize: 10, color: SHELL.text3, fontWeight: 600, letterSpacing: '0.04em', marginRight: 4 }}>Less</span>
            {[0, 1, 2, 3].map(n => (
              <span key={n} style={{
                width: 11, height: 11, borderRadius: 3,
                background: cellColor(n),
                border: n === 0 ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(229,37,27,0.10)',
              }}/>
            ))}
            <span style={{ fontSize: 10, color: SHELL.text3, fontWeight: 600, letterSpacing: '0.04em', marginLeft: 4 }}>More</span>
          </div>
        </div>
      )}
    </FeedCard>
  )
}


// Best Time to Publish card. Bins all the channel's videos by hour of
// day and surfaces the slot with the highest avg views. The visual: a
// 24-bar mini chart of avg views per hour with the peak bar highlighted
// in brand red, plus three stat tiles below (Best, Runner-up, Avoid).
export function BestTimeCard({ videos, onDismiss }) {
  const [open, setOpen] = useState(false)
  const data = computeBestTime(videos)
  if (!data || !data.top) return null

  const { hourAvg, dayAvg, top, second, worst, sampleSize } = data
  const peakHour = top.h
  const maxBar = Math.max(...hourAvg, 1)

  // Headline: best slot named in natural English.
  const headline = `Audience peaks ${DAYS_LONG[top.dow]}s around ${formatHour12(top.h)}`

  // Verdict line below the headline.
  const verdict = `Based on ${sampleSize} uploads. ${
    second
      ? `Runner-up: ${DAYS_SHORT[second.dow]} ${formatHour12(second.h)}.`
      : 'Need more uploads for a runner-up.'
  }`

  // 24-bar chart geometry.
  const chartW = 720
  const chartH = 90
  const padX = 4
  const padTop = 8
  const padBot = 22
  const barW = (chartW - padX * 2) / 24 - 2
  const usableH = chartH - padTop - padBot

  return (
    <FeedCard
      Icon={Clock}
      iconColor={SHELL.text1}
      iconBg="rgba(255,255,255,0.06)"
      category="Best Time To Publish · your data"
      onDismiss={onDismiss}
      rightSlot={
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 10.5, fontWeight: 700, color: '#fb6a60',
          background: 'rgba(229,37,27,0.07)', border: '1px solid rgba(229,37,27,0.20)',
          padding: '3px 8px', borderRadius: 100,
          letterSpacing: '0.05em', textTransform: 'uppercase',
        }}>
          {DAYS_SHORT[top.dow]} · {formatHour12(top.h)}
        </span>
      }
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
        <h3 style={{
          fontSize: 18, fontWeight: 600, color: SHELL.text1,
          letterSpacing: '-0.4px', lineHeight: 1.25,
        }}>{headline}</h3>
      </div>
      <p style={{
        fontSize: 12, fontWeight: 500, color: SHELL.text3,
        letterSpacing: '-0.01em', marginBottom: 16,
      }}>{verdict}</p>

      {/* 24-bar chart of avg views per hour-of-day */}
      <div style={{ marginBottom: 16 }}>
        <svg width="100%" viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="none" style={{ display: 'block' }}>
          {/* Baseline */}
          <line x1={padX} y1={chartH - padBot} x2={chartW - padX} y2={chartH - padBot} stroke="rgba(255,255,255,0.10)" strokeWidth="1"/>
          {/* Bars */}
          {hourAvg.map((v, h) => {
            const heightPct = v / maxBar
            const barH = Math.max(2, heightPct * usableH)
            const x = padX + h * ((chartW - padX * 2) / 24) + 1
            const y = chartH - padBot - barH
            const isPeak = h === peakHour
            return (
              <rect
                key={h}
                x={x.toFixed(2)} y={y.toFixed(2)}
                width={barW.toFixed(2)} height={barH.toFixed(2)}
                rx="2" ry="2"
                fill={isPeak ? '#e5251b' : 'rgba(255,255,255,0.12)'}
              >
                <title>{`${formatHour12(h)}: ${fmtNum(Math.round(v))} avg views`}</title>
              </rect>
            )
          })}
          {/* X-axis hour labels at 0, 6, 12, 18 */}
          {[0, 6, 12, 18].map(h => {
            const x = padX + h * ((chartW - padX * 2) / 24) + barW / 2 + 1
            return (
              <text key={h} x={x} y={chartH - 6} textAnchor="middle" fontSize="9.5" fontWeight="600" fill="rgba(255,255,255,0.40)" letterSpacing="0.04em">
                {formatHour12(h).replace(' ', '')}
              </text>
            )
          })}
          <text x={chartW - padX} y={chartH - 6} textAnchor="end" fontSize="9.5" fontWeight="600" fill="rgba(255,255,255,0.40)" letterSpacing="0.04em">
            11PM
          </text>
        </svg>
      </div>

      {/* Stat strip: Best, Runner-up, Avoid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
        paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div>
          <p style={{ fontSize: 9.5, fontWeight: 600, color: '#fb6a60', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 5 }}>Best time</p>
          <p style={{ fontSize: 16, fontWeight: 600, color: SHELL.text1, letterSpacing: '-0.3px', lineHeight: 1.15, marginBottom: 4 }}>
            {DAYS_SHORT[top.dow]} · {formatHour12(top.h)}
          </p>
          <p style={{ fontSize: 11, fontWeight: 500, color: SHELL.text3, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}>
            {fmtNum(Math.round(top.avg))} avg views
          </p>
        </div>
        <div>
          <p style={{ fontSize: 9.5, fontWeight: 600, color: SHELL.text3, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 5 }}>Runner-up</p>
          <p style={{ fontSize: 16, fontWeight: 600, color: SHELL.text1, letterSpacing: '-0.3px', lineHeight: 1.15, marginBottom: 4 }}>
            {second ? `${DAYS_SHORT[second.dow]} · ${formatHour12(second.h)}` : '—'}
          </p>
          <p style={{ fontSize: 11, fontWeight: 500, color: SHELL.text3, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}>
            {second ? `${fmtNum(Math.round(second.avg))} avg views` : 'Need more uploads'}
          </p>
        </div>
        <div>
          <p style={{ fontSize: 9.5, fontWeight: 600, color: '#f0a23b', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 5 }}>Avoid</p>
          <p style={{ fontSize: 16, fontWeight: 600, color: SHELL.text1, letterSpacing: '-0.3px', lineHeight: 1.15, marginBottom: 4 }}>
            {worst ? `${DAYS_SHORT[worst.dow]} · ${formatHour12(worst.h)}` : '—'}
          </p>
          <p style={{ fontSize: 11, fontWeight: 500, color: SHELL.text3, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}>
            {worst ? `${fmtNum(Math.round(worst.avg))} avg views` : 'Need more uploads'}
          </p>
        </div>
      </div>

      {/* Detail: per-day-of-week breakdown */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Hide weekly breakdown' : 'Show weekly breakdown'}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '6px 11px', borderRadius: 100,
            border: '1px solid rgba(255,255,255,0.08)',
            background: SHELL.cardFlat, color: SHELL.text2,
            fontFamily: 'inherit',
            fontSize: 11.5, fontWeight: 600, letterSpacing: '-0.01em',
            cursor: 'pointer',
            transition: 'background 0.14s ease, color 0.14s ease, border-color 0.14s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = SHELL.text1; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = SHELL.text2; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
        >
          {open ? 'Hide weekly view' : 'Weekly view'}
          <ChevronDown size={11} strokeWidth={2.4} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}/>
        </button>
      </div>

      {open && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: SHELL.text3, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 12 }}>
            Avg views per upload by day of week
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
            {dayAvg.map((avg, i) => {
              const maxDay = Math.max(...dayAvg, 1)
              const heightPct = avg / maxDay
              const isTop = i === top.dow
              return (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{
                    height: 60, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                    marginBottom: 6,
                  }}>
                    <div style={{
                      width: '60%',
                      height: `${Math.max(4, heightPct * 100)}%`,
                      background: isTop ? '#e5251b' : 'rgba(255,255,255,0.12)',
                      borderRadius: 3,
                      transition: 'height 0.6s cubic-bezier(0.34,1.56,0.64,1)',
                    }} title={`${DAYS_LONG[i]}: ${fmtNum(Math.round(avg))} avg views`}/>
                  </div>
                  <p style={{ fontSize: 10, fontWeight: 600, color: isTop ? C.red : SHELL.text3, letterSpacing: '0.04em' }}>
                    {DAYS_SHORT[i].slice(0, 1)}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </FeedCard>
  )
}


// Tracked Optimization Lift card. The proof loop: shows the user's best
// SEO Optimizer win. Real thumbnail on the left, title-change diff on
// the right, big +Δ views chip in the eyebrow. Single card per channel
// surfaces the strongest win; the rest live on the SEO Studio page.
export function TrackedLiftCard({ win, moreCount, onOpenAll, onDismiss }) {
  if (!win) return null
  const beforeViews = win.before_views || 0
  const currentViews = win.current_views || 0
  const deltaViews = win.delta_views || 0
  const deltaPct = win.delta_pct || 0

  const titleChanged = win.before_title && win.after_title && win.before_title !== win.after_title

  const ageDays = win.optimized_at
    ? Math.floor((Date.now() - new Date(win.optimized_at).getTime()) / 86400000)
    : null
  const ageStr = ageDays == null ? '' : ageDays === 0 ? 'today' : ageDays === 1 ? 'yesterday' : `${ageDays}d ago`

  return (
    <FeedCard
      Icon={TrendingUp}
      iconColor={'#34d27b'}
      iconBg="rgba(22,163,74,0.14)"
      category="Tracked Lift · SEO Optimizer"
      age={ageStr}
      onDismiss={onDismiss}
      rightSlot={
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 10.5, fontWeight: 700, color: '#34d27b',
          background: 'rgba(22,163,74,0.14)', border: '1px solid rgba(5,150,105,0.22)',
          padding: '3px 8px', borderRadius: 100,
          letterSpacing: '-0.05px', fontVariantNumeric: 'tabular-nums',
        }}>
          +{fmtNum(deltaViews)} views · +{deltaPct}%
        </span>
      }
    >
      <h3 style={{
        fontSize: 14, fontWeight: 600, color: SHELL.text1,
        letterSpacing: '-0.3px', lineHeight: 1.3,
        marginBottom: 14,
      }}>Your update is outperforming the old version</h3>

      <div style={{ display: 'flex', gap: 16, alignItems: 'stretch', marginBottom: 14 }}>
        {/* Thumbnail */}
        {win.thumbnail_url ? (
          <div style={{
            flexShrink: 0, width: 180, aspectRatio: '16/9',
            borderRadius: 10, overflow: 'hidden',
            background: '#26262b',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 6px 18px rgba(0,0,0,0.08)',
          }}>
            <img
              src={win.thumbnail_url}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        ) : (
          <div style={{
            flexShrink: 0, width: 180, aspectRatio: '16/9',
            borderRadius: 10, background: '#26262b',
          }}/>
        )}

        {/* Diff + numbers */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Title diff */}
          {titleChanged && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <p style={{
                fontSize: 10, fontWeight: 600, color: SHELL.text3,
                letterSpacing: '0.10em', textTransform: 'uppercase',
              }}>Title change</p>
              <p style={{
                fontSize: 12, fontWeight: 500, color: SHELL.text3,
                letterSpacing: '-0.01em', lineHeight: 1.4,
                textDecoration: 'line-through',
                display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>{win.before_title}</p>
              <p style={{
                fontSize: 13, fontWeight: 600, color: SHELL.text1,
                letterSpacing: '-0.15px', lineHeight: 1.4,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>{win.after_title}</p>
            </div>
          )}

          {/* Stat row: before -> after views */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'auto auto 1fr', gap: 14, alignItems: 'flex-end',
            marginTop: 'auto',
          }}>
            <div>
              <p style={{ fontSize: 9.5, fontWeight: 600, color: SHELL.text3, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 4 }}>Before</p>
              <p style={{ fontSize: 17, fontWeight: 600, color: SHELL.text2, letterSpacing: '-0.4px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{fmtNum(beforeViews)}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', paddingTop: 14 }}>
              <ArrowRight size={16} strokeWidth={2.4} color={SHELL.text3} />
            </div>
            <div>
              <p style={{ fontSize: 9.5, fontWeight: 600, color: '#34d27b', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 4 }}>Now</p>
              <p style={{ fontSize: 17, fontWeight: 600, color: SHELL.text1, letterSpacing: '-0.4px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{fmtNum(currentViews)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row: more wins + CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <span style={{ fontSize: 11.5, fontWeight: 500, color: SHELL.text3, letterSpacing: '-0.01em' }}>
          {moreCount > 0 ? `+ ${moreCount} more win${moreCount === 1 ? '' : 's'} this month` : 'Single tracked win'}
        </span>
        <div style={{ flex: 1 }}/>
        {onOpenAll && (
          <button
            type="button"
            onClick={onOpenAll}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '7px 13px', borderRadius: 100,
              border: 'none', cursor: 'pointer',
              background: C.red, color: '#fff',
              fontFamily: 'inherit',
              fontSize: 12, fontWeight: 600, letterSpacing: '-0.01em',
              boxShadow: '0 1px 3px rgba(229,37,27,0.30)',
              transition: 'filter 0.14s ease, transform 0.14s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            See all wins
            <ArrowRight size={12} strokeWidth={2.4} />
          </button>
        )}
      </div>
    </FeedCard>
  )
}


// Daily Ideas card. Three fresh video idea concepts the user can act on
// today. Reads from the existing /video-ideas cache so the data flow
// matches the standalone Video Ideas page. Each idea row shows the
// title + angle + a single CTA that drops the title into SEO Studio so
// the user can start writing in one click.
export function DailyIdeasCard({ ideas, lastUpdated, isStale, isFree, refreshing, onRefresh, onUse, onOpenAll, onDismiss }) {
  const [open, setOpen] = useState(false)
  const top3 = (ideas || []).slice(0, 3)
  if (top3.length === 0) return null

  // Subline pulled from the most recent data point. "today" feels active;
  // anything older nudges a refresh.
  const subline = isStale
    ? 'These look stale, hit refresh for fresh angles'
    : lastUpdated === 'today' ? 'Fresh ideas, generated today'
    : `Last refreshed ${lastUpdated || 'recently'}`

  return (
    <FeedCard
      Icon={Lightbulb}
      iconColor={'#f0a23b'}
      iconBg="rgba(217,119,6,0.10)"
      category="Daily Ideas"
      onDismiss={onDismiss}
      rightSlot={
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: 10.5, fontWeight: 600, color: '#34d27b',
          background: 'rgba(22,163,74,0.14)', border: '1px solid rgba(5,150,105,0.22)',
          padding: '3px 9px', borderRadius: 100,
          letterSpacing: '0.10em', textTransform: 'uppercase',
        }}>
          <span style={{ width: 5, height: 5, borderRadius: 99, background: '#34d27b' }}/>
          {top3.length} ready
        </span>
      }
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <h3 style={{
          fontSize: 14, fontWeight: 600, color: SHELL.text1,
          letterSpacing: '-0.15px', lineHeight: 1.3, margin: 0,
        }}>Start shooting one of these today</h3>
        <span style={{
          fontSize: 12, fontWeight: 500, color: isStale ? '#f0a23b' : 'rgba(255,255,255,0.78)',
          letterSpacing: '-0.05px',
        }}>{subline}</span>
      </div>

      {/* Idea rows. Each row: rank chip + title + angle + Use CTA. White
          backgrounds + readable text (not faint) for legibility. */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        {top3.map((idea, i) => {
          const score = idea.opportunityScore != null
            ? idea.opportunityScore
            : Math.max(65, 85 - i * 4)
          const scoreClr = score >= 80 ? '#34d27b' : score >= 65 ? '#f0a23b' : 'rgba(255,255,255,0.78)'
          return (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '12px 14px',
                background: SHELL.cardFlat,
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10,
                transition: 'background 0.14s, border-color 0.14s, transform 0.14s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = SHELL.cardFlat; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {/* Rank badge — neutral charcoal, no amber tint */}
              <div style={{
                flexShrink: 0,
                width: 24, height: 24, borderRadius: 7,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.06)',
                fontSize: 11.5, fontWeight: 600, color: SHELL.text1,
                letterSpacing: '-0.2px',
                fontVariantNumeric: 'tabular-nums',
              }}>{i + 1}</div>

              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Title */}
                <p style={{
                  fontSize: 13.5, fontWeight: 450, color: SHELL.text1,
                  letterSpacing: '-0.1px', lineHeight: 1.45,
                  marginBottom: 4,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>{idea.title}</p>
                {/* Angle (one-line truncated) — text2 for readability, not faint text3 */}
                {idea.angle && (
                  <p style={{
                    fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.65)',
                    letterSpacing: '-0.05px', lineHeight: 1.5,
                    display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>{idea.angle}</p>
                )}
                {/* Meta: keyword + score */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                  {idea.targetKeyword && (
                    <span style={{
                      fontSize: 10.5, fontWeight: 500, color: SHELL.text2,
                      letterSpacing: '-0.01em',
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                    }}>
                      <span style={{ width: 4, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.35)' }}/>
                      {idea.targetKeyword}
                    </span>
                  )}
                  <span style={{
                    fontSize: 10.5, fontWeight: 600, color: scoreClr,
                    letterSpacing: '-0.05px',
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    Score {score}
                  </span>
                </div>
              </div>

              {/* Use CTA */}
              <button
                type="button"
                onClick={() => onUse?.(idea)}
                style={{
                  flexShrink: 0, alignSelf: 'center',
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '7px 14px', borderRadius: 100,
                  border: 'none', cursor: 'pointer',
                  background: '#e5251b', color: '#fff',
                  fontFamily: 'inherit',
                  fontSize: 12, fontWeight: 600, letterSpacing: '-0.05px',
                  boxShadow: '0 1px 3px rgba(229,37,27,0.28)',
                  transition: 'filter 0.14s, transform 0.14s',
                }}
                onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                Use idea
                <ArrowRight size={11} strokeWidth={2.4} />
              </button>
            </div>
          )
        })}
      </div>

      {/* Bottom row: refresh + open full ideas */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <span style={{ fontSize: 11.5, fontWeight: 500, color: SHELL.text3, letterSpacing: '-0.01em' }}>
          {isFree ? 'Free plan shows top 3, upgrade for the full feed' : 'Full feed in Video Ideas'}
        </span>
        <div style={{ flex: 1 }}/>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '6px 11px', borderRadius: 100,
              border: '1px solid rgba(255,255,255,0.08)',
              background: refreshing ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
              color: refreshing ? SHELL.text3 : SHELL.text2,
              fontFamily: 'inherit',
              fontSize: 11.5, fontWeight: 600, letterSpacing: '-0.01em',
              cursor: refreshing ? 'wait' : 'pointer',
              transition: 'background 0.14s ease, color 0.14s ease, border-color 0.14s ease',
            }}
            onMouseEnter={e => { if (!refreshing) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = SHELL.text1; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)' } }}
            onMouseLeave={e => { if (!refreshing) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = SHELL.text2; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' } }}
          >
            <RefreshCw size={11} strokeWidth={2.4} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }}/>
            {refreshing ? 'Refreshing…' : 'Refresh ideas'}
          </button>
        )}
        {onOpenAll && (
          <button
            type="button"
            onClick={onOpenAll}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '7px 13px', borderRadius: 100,
              border: 'none', cursor: 'pointer',
              background: SHELL.text1, color: '#0e0e10',
              fontFamily: 'inherit',
              fontSize: 12, fontWeight: 600, letterSpacing: '-0.01em',
              boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
              transition: 'filter 0.14s ease, transform 0.14s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.10)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            Open Video Ideas
            <ArrowRight size={12} strokeWidth={2.4} />
          </button>
        )}
      </div>
    </FeedCard>
  )
}

// Suggested Competitors card. Auto-curated discovery surface: pulls
// channels from top_channel_cache (curated category leaderboards) and
// from comp:<niche_kw> rows in the cross-user youtube_search_cache.
// Zero new YouTube quota — everything comes from caches that were
// already populated by other features.
//
// Each row: avatar + name + sub count + Track CTA. The Track CTA stashes
// the channel name in sessionStorage and switches to the Competitors
// page, which reads the prefill and pre-runs the search. The user then
// hits the actual Track button there (which IS the analyze call). This
// avoids surprise credit burn from a one-click track on the Feed.
export function TitleSuggestionCard({ video, suggestions, ageLabel, applyingIdx, appliedIdx, applyError, onApply, onOpenStudio, onDismiss }) {
  const [activeIdx, setActiveIdx] = useState(0)
  if (!video || !suggestions?.length) return null
  const thumbAspect = video.is_short ? '9 / 16' : '16 / 9'
  const thumbWidth  = video.is_short ? 150 : 280
  const idx     = Math.max(0, Math.min(suggestions.length - 1, activeIdx))
  const focused = suggestions[idx]
  const score   = Math.max(0, Math.min(100, Math.round(Number(focused?.score || 0))))
  const tone    = score >= 80 ? { bg: 'rgba(22,163,74,0.16)',  text: '#34d27b', bdr: 'rgba(22,163,74,0.32)' }
                : score >= 50 ? { bg: 'rgba(217,118,6,0.16)',  text: '#f0a23b', bdr: 'rgba(217,118,6,0.32)' }
                :                { bg: 'rgba(229,37,27,0.13)', text: '#fb6a60', bdr: 'rgba(229,37,27,0.32)' }
  const isApplying = applyingIdx === idx
  const isApplied  = appliedIdx  === idx
  const ctaLabel   = isApplied ? 'Applied to YouTube' : isApplying ? 'Applying…' : 'Apply Title'
  const canCycle   = suggestions.length > 1

  return (
    <article style={{
      background: SHELL.cardFlat,
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 14,
      padding: '14px 18px 16px 18px',
      boxShadow: '0 1px 2px rgba(255,255,255,0.04), 0 6px 18px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.7)',
      marginBottom: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <h3 style={{
          fontSize: 16, fontWeight: 600, color: SHELL.text1,
          letterSpacing: '-0.2px', lineHeight: 1.3, margin: 0,
        }}>Title Suggestion</h3>
        {ageLabel && (
          <span style={{
            fontSize: 12.5, fontWeight: 450, color: SHELL.text3,
            letterSpacing: '-0.01em',
          }}>· {ageLabel}</span>
        )}
        <div style={{ flex: 1 }}/>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            style={{
              width: 28, height: 28, borderRadius: 8,
              border: 'none', background: 'transparent',
              color: 'rgba(255,255,255,0.36)',
              cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.14s, color 0.14s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = SHELL.text1 }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.36)' }}
          >
            <XIcon size={14} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Inset compare panel: HD thumb LEFT, current → rewrite stack RIGHT */}
      <div style={{
        display: 'flex',
        gap: 18,
        alignItems: 'stretch',
        padding: 14,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12,
        marginBottom: 14,
      }}>
        <div style={{ flexShrink: 0, width: thumbWidth }}>
          {(video.video_id || video.thumbnail) ? (
            <img
              src={ytMaxThumbUrl(video.video_id) || video.thumbnail}
              alt=""
              loading="lazy"
              onLoad={makeThumbOnLoad(video.video_id, video.thumbnail)}
              onError={makeThumbOnError(video.video_id, video.thumbnail)}
              style={{
                display: 'block',
                width: '100%', aspectRatio: thumbAspect,
                objectFit: 'cover',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            />
          ) : (
            <div style={{
              width: '100%', aspectRatio: thumbAspect,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}/>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0 }}>
          {/* Current title (no score; SEO Studio doesn't score the original) */}
          <div style={{ minWidth: 0 }}>
            <p style={{
              margin: '0 0 4px',
              fontSize: 11, fontWeight: 600, color: SHELL.text3,
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>Your title now</p>
            <p style={{
              margin: 0, fontSize: 13.5, fontWeight: 600, color: SHELL.text2,
              letterSpacing: '-0.1px', lineHeight: 1.4,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{video.title}</p>
          </div>

          {/* Divider with centered arrow circle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }}/>
            <span style={{
              flexShrink: 0,
              width: 22, height: 22, borderRadius: 99,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.10)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: SHELL.text3,
            }}>
              <ArrowDown size={12} strokeWidth={2.2} />
            </span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }}/>
          </div>

          {/* Focused rewrite (score chip + title) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <span style={{
              flexShrink: 0,
              width: 34, height: 34, borderRadius: 99,
              background: tone.bg, color: tone.text,
              border: `1px solid ${tone.bdr}`,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12.5, fontWeight: 600,
              letterSpacing: '-0.02em',
              fontVariantNumeric: 'tabular-nums',
            }}>{score}</span>
            <p style={{
              flex: 1, minWidth: 0, margin: 0,
              fontSize: 14, fontWeight: 600, color: SHELL.text1,
              letterSpacing: '-0.15px', lineHeight: 1.4,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{focused.title}</p>
          </div>

          {/* Why this works */}
          {focused.why_it_works && (
            <p style={{
              margin: '8px 0 0 46px',
              fontSize: 12.5, fontWeight: 450, color: SHELL.text3,
              letterSpacing: '-0.01em', lineHeight: 1.45,
            }}>{focused.why_it_works}</p>
          )}
        </div>
      </div>

      {/* Pagination dots — only when there are multiple suggestions */}
      {canCycle && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
          {suggestions.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIdx(i)}
              aria-label={`Suggestion ${i + 1} of ${suggestions.length}`}
              style={{
                width: i === idx ? 18 : 6, height: 6,
                borderRadius: 99,
                border: 'none',
                background: i === idx ? '#e5251b' : 'rgba(255,255,255,0.18)',
                cursor: 'pointer',
                padding: 0,
                transition: 'width 0.2s, background 0.2s',
              }}
            />
          ))}
        </div>
      )}

      {/* Bottom action row: Regenerate (cycle) + Apply Title (primary) */}
      <div style={{ display: 'grid', gridTemplateColumns: canCycle ? '1fr 1fr' : '1fr', gap: 10 }}>
        {canCycle && (
          <button
            type="button"
            onClick={() => setActiveIdx((idx + 1) % suggestions.length)}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              padding: '10px 14px', borderRadius: 100,
              border: '1px solid rgba(255,255,255,0.10)',
              background: 'rgba(255,255,255,0.03)',
              color: SHELL.text1,
              fontFamily: 'inherit',
              fontSize: 13, fontWeight: 600, letterSpacing: '-0.05px',
              cursor: 'pointer',
              transition: 'background 0.14s, border-color 0.14s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)' }}
          >
            <RefreshCw size={13} strokeWidth={2.1} />
            Next suggestion
          </button>
        )}

        <button
          type="button"
          disabled={isApplying || isApplied}
          onClick={() => onApply?.(focused, idx, video)}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            padding: '10px 14px', borderRadius: 100,
            border: 'none',
            background: isApplied ? 'rgba(22,163,74,0.85)' : '#e5251b',
            color: '#fff',
            fontFamily: 'inherit',
            fontSize: 13, fontWeight: 600, letterSpacing: '-0.05px',
            boxShadow: isApplied ? 'none' : '0 1px 3px rgba(229,37,27,0.28)',
            cursor: (isApplying || isApplied) ? 'default' : 'pointer',
            transition: 'filter 0.14s, transform 0.14s, background 0.2s',
          }}
          onMouseEnter={e => { if (!isApplying && !isApplied) { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
          onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          {isApplying && <RefreshCw size={13} strokeWidth={2.1} style={{ animation: 'spin 1s linear infinite' }} />}
          {ctaLabel}
        </button>
      </div>

      {applyError && (
        <p style={{ margin: '8px 2px 0', fontSize: 12, fontWeight: 500, color: '#fb6a60' }}>
          {applyError}
        </p>
      )}
    </article>
  )
}

// Add Missing Description card. Mirrors TitleSuggestionCard's chassis (dark
// surface, inset compare panel, two-up action row) but features a single
// AI-drafted description because descriptions are too long to compare
// side-by-side. Auto-curated: the backend picks the user's most-recent
// video with a sub-80-character description, so the card hides itself when
// there is nothing meaningful to action.
export function MissingDescriptionCard({
  video, drafts, ageLabel,
  publishing, published, publishError,
  onPublish, onDismiss,
}) {
  const [draftIdx, setDraftIdx] = useState(0)
  if (!video || !drafts?.length) return null
  const idx   = Math.max(0, Math.min(drafts.length - 1, draftIdx))
  const draft = drafts[idx] || ''
  if (!draft) return null
  const canCycle = drafts.length > 1
  const thumbAspect = video.is_short ? '9 / 16' : '16 / 9'
  const thumbWidth  = video.is_short ? 150 : 280
  const ctaLabel = published ? 'Published to YouTube' : publishing ? 'Publishing…' : 'Publish Description'
  const currentLen = Number(video.current_description_length || 0)
  const lenLabel = currentLen === 0
    ? 'no description'
    : currentLen <= 8
      ? `only ${currentLen} chars`
      : `${currentLen} chars`

  return (
    <article style={{
      background: SHELL.cardFlat,
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 14,
      padding: '14px 18px 16px 18px',
      boxShadow: '0 1px 2px rgba(255,255,255,0.04), 0 6px 18px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.7)',
      marginBottom: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <h3 style={{
          fontSize: 16, fontWeight: 600, color: SHELL.text1,
          letterSpacing: '-0.2px', lineHeight: 1.3, margin: 0,
        }}>Add Description</h3>
        {ageLabel && (
          <span style={{
            fontSize: 12.5, fontWeight: 450, color: SHELL.text3,
            letterSpacing: '-0.01em',
          }}>· {ageLabel}</span>
        )}
        <div style={{ flex: 1 }}/>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            style={{
              width: 28, height: 28, borderRadius: 8,
              border: 'none', background: 'transparent',
              color: 'rgba(255,255,255,0.36)',
              cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.14s, color 0.14s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = SHELL.text1 }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.36)' }}
          >
            <XIcon size={14} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Inset compare panel: HD thumb LEFT, explainer + AI draft RIGHT */}
      <div style={{
        display: 'flex',
        gap: 18,
        alignItems: 'stretch',
        padding: 14,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12,
        marginBottom: 14,
      }}>
        <div style={{ flexShrink: 0, width: thumbWidth }}>
          {(video.video_id || video.thumbnail) ? (
            <img
              src={ytMaxThumbUrl(video.video_id) || video.thumbnail}
              alt=""
              loading="lazy"
              onLoad={makeThumbOnLoad(video.video_id, video.thumbnail)}
              onError={makeThumbOnError(video.video_id, video.thumbnail)}
              style={{
                display: 'block',
                width: '100%', aspectRatio: thumbAspect,
                objectFit: 'cover',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            />
          ) : (
            <div style={{
              width: '100%', aspectRatio: thumbAspect,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}/>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
          {/* Explainer line. References the specific gap, not a generic nag. */}
          <p style={{
            margin: 0, fontSize: 13.5, fontWeight: 450, color: SHELL.text2,
            letterSpacing: '-0.05px', lineHeight: 1.45,
          }}>
            Your {video.is_short ? 'last short' : 'latest video'} has {lenLabel}.
            YouTube uses descriptions to match your video to search queries.
          </p>

          {/* AI draft preview */}
          <div style={{
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            background: 'rgba(0,0,0,0.16)',
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '7px 12px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.02)',
            }}>
              <span style={{
                fontSize: 11, fontWeight: 600, color: SHELL.text3,
                letterSpacing: '0.10em', textTransform: 'uppercase',
              }}>AI draft</span>
              <span style={{
                fontSize: 11, fontWeight: 600, color: SHELL.text3,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.01em',
              }}>{draft.length} chars</span>
            </div>
            <p style={{
              margin: 0, padding: '10px 12px',
              fontSize: 13.5, fontWeight: 450, color: SHELL.text1,
              letterSpacing: '-0.05px', lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 4,
              overflow: 'hidden',
            }}>{draft}</p>
          </div>
        </div>
      </div>

      {/* Bottom action row: Regenerate cycles through the cached drafts
          (no extra Claude call) + Publish (primary CTA). */}
      <div style={{ display: 'grid', gridTemplateColumns: canCycle ? '1fr 1fr' : '1fr', gap: 10 }}>
        {canCycle && (
          <button
            type="button"
            disabled={publishing || published}
            onClick={() => setDraftIdx((idx + 1) % drafts.length)}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              padding: '10px 14px', borderRadius: 100,
              border: '1px solid rgba(255,255,255,0.10)',
              background: 'rgba(255,255,255,0.03)',
              color: SHELL.text1,
              fontFamily: 'inherit',
              fontSize: 13, fontWeight: 600, letterSpacing: '-0.05px',
              cursor: (publishing || published) ? 'default' : 'pointer',
              opacity: (publishing || published) ? 0.5 : 1,
              transition: 'background 0.14s, border-color 0.14s',
            }}
            onMouseEnter={e => { if (!publishing && !published) { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)' } }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)' }}
          >
            <RefreshCw size={13} strokeWidth={2.1} />
            Next draft
          </button>
        )}

        <button
          type="button"
          disabled={publishing || published}
          onClick={() => onPublish?.(draft, video)}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            padding: '10px 14px', borderRadius: 100,
            border: 'none',
            background: published ? 'rgba(22,163,74,0.85)' : '#e5251b',
            color: '#fff',
            fontFamily: 'inherit',
            fontSize: 13, fontWeight: 600, letterSpacing: '-0.05px',
            boxShadow: published ? 'none' : '0 1px 3px rgba(229,37,27,0.28)',
            cursor: (publishing || published) ? 'default' : 'pointer',
            transition: 'filter 0.14s, transform 0.14s, background 0.2s',
          }}
          onMouseEnter={e => { if (!publishing && !published) { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
          onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          {publishing && <RefreshCw size={13} strokeWidth={2.1} style={{ animation: 'spin 1s linear infinite' }} />}
          {ctaLabel}
        </button>
      </div>

      {publishError && (
        <p style={{ margin: '8px 2px 0', fontSize: 12, fontWeight: 500, color: '#fb6a60' }}>
          {publishError}
        </p>
      )}
    </article>
  )
}

// Trending Keyword card. Surfaces ONE active-momentum keyword from cached
// research (either the user's own or the cross-user niche-warmer pool).
// Single CTA: route to Keyword Research with the term pre-filled. Score
// badge uses the same green/amber/red palette as ScoreRing so the visual
// language stays one system. Minimal v1: no sparkline, no VPH gauge —
// those land in the Phase-2 holistic Feed polish pass.
export function TrendingKeywordCard({ keyword, score, momentum, subsLabel, freshLabel, ageLabel, onResearch, onDismiss }) {
  if (!keyword) return null
  const s = Math.max(0, Math.min(100, Number(score) || 0))
  const tone = s >= 75 ? { bg: 'rgba(22,163,74,0.20)', text: '#34d27b', bdr: 'rgba(22,163,74,0.35)' }
             : s >= 50 ? { bg: 'rgba(217,118,6,0.20)', text: '#f0a23b', bdr: 'rgba(217,118,6,0.35)' }
             :          { bg: 'rgba(229,37,27,0.16)', text: '#fb6a60', bdr: 'rgba(229,37,27,0.35)' }
  const momLabel = momentum === 'active' ? 'active'
                 : momentum === 'unclaimed' ? 'unclaimed'
                 : momentum === 'steady' ? 'steady'
                 : ''

  return (
    <article style={{
      background: SHELL.cardFlat,
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 14,
      padding: '14px 18px 16px 18px',
      boxShadow: '0 1px 2px rgba(255,255,255,0.04), 0 6px 18px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.7)',
      marginBottom: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <h3 style={{
          fontSize: 16, fontWeight: 600, color: SHELL.text1,
          letterSpacing: '-0.2px', lineHeight: 1.3, margin: 0,
        }}>Trending Keyword</h3>
        {ageLabel && (
          <span style={{
            fontSize: 12.5, fontWeight: 450, color: SHELL.text3,
            letterSpacing: '-0.01em',
          }}>· {ageLabel}</span>
        )}
        <div style={{ flex: 1 }}/>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            style={{
              width: 28, height: 28, borderRadius: 8,
              border: 'none', background: 'transparent',
              color: 'rgba(255,255,255,0.36)',
              cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.14s, color 0.14s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = SHELL.text1 }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.36)' }}
          >
            <XIcon size={14} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Inset panel: score LEFT, keyword + context RIGHT */}
      <div style={{
        display: 'flex',
        gap: 16,
        alignItems: 'center',
        padding: 14,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12,
        marginBottom: 14,
      }}>
        <div style={{
          flexShrink: 0,
          width: 64, height: 64, borderRadius: 14,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: tone.bg,
          border: `1px solid ${tone.bdr}`,
          color: tone.text,
          fontSize: 22, fontWeight: 600, letterSpacing: '-1px',
          fontVariantNumeric: 'tabular-nums',
        }}>{s}</div>

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p style={{
            margin: 0, fontSize: 18, fontWeight: 600, color: SHELL.text1,
            letterSpacing: '-0.3px', lineHeight: 1.25,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{keyword}</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 10px' }}>
            {momLabel && (
              <span style={{
                fontSize: 11, fontWeight: 600,
                padding: '2px 9px', borderRadius: 100,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.10)',
                color: SHELL.text2,
                letterSpacing: '-0.01em',
              }}>{momLabel}</span>
            )}
            {subsLabel && (
              <span style={{ fontSize: 12.5, fontWeight: 450, color: SHELL.text2, letterSpacing: '-0.01em' }}>
                · {subsLabel}
              </span>
            )}
          </div>

          {freshLabel && (
            <p style={{
              margin: 0, fontSize: 12.5, fontWeight: 450, color: SHELL.text3,
              letterSpacing: '-0.01em',
            }}>{freshLabel}</p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onResearch?.(keyword)}
        style={{
          width: '100%',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          padding: '10px 14px', borderRadius: 100,
          border: 'none',
          background: '#e5251b',
          color: '#fff',
          fontFamily: 'inherit',
          fontSize: 13, fontWeight: 600, letterSpacing: '-0.05px',
          boxShadow: '0 1px 3px rgba(229,37,27,0.28)',
          cursor: 'pointer',
          transition: 'filter 0.14s, transform 0.14s',
        }}
        onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
        onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
      >
        Research this keyword
        <ArrowRight size={13} strokeWidth={2.1} />
      </button>
    </article>
  )
}

// Missing Tags card. Same chassis as Missing Description: thumb LEFT,
// explainer + AI tag chips RIGHT, Next set / Publish actions. Cycles
// through up to 3 AI-generated tag sets via the secondary button.
export function MissingTagsCard({
  video, tagSets, ageLabel,
  publishing, published, publishError,
  onPublish, onDismiss,
}) {
  const [setIdx, setSetIdx] = useState(0)
  if (!video || !tagSets?.length) return null
  const idx     = Math.max(0, Math.min(tagSets.length - 1, setIdx))
  const tags    = tagSets[idx] || []
  if (!tags.length) return null
  const canCycle = tagSets.length > 1
  const thumbAspect = video.is_short ? '9 / 16' : '16 / 9'
  const thumbWidth  = video.is_short ? 150 : 280
  const ctaLabel = published ? 'Published to YouTube' : publishing ? 'Publishing…' : 'Publish Tags'
  const currentCount = Number(video.current_tag_count || 0)
  const countLabel = currentCount === 0
    ? 'no tags'
    : currentCount === 1
      ? '1 tag'
      : `only ${currentCount} tags`

  return (
    <article style={{
      background: SHELL.cardFlat,
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 14,
      padding: '14px 18px 16px 18px',
      boxShadow: '0 1px 2px rgba(255,255,255,0.04), 0 6px 18px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.7)',
      marginBottom: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <h3 style={{
          fontSize: 16, fontWeight: 600, color: SHELL.text1,
          letterSpacing: '-0.2px', lineHeight: 1.3, margin: 0,
        }}>Add Tags</h3>
        {ageLabel && (
          <span style={{
            fontSize: 12.5, fontWeight: 450, color: SHELL.text3,
            letterSpacing: '-0.01em',
          }}>· {ageLabel}</span>
        )}
        <div style={{ flex: 1 }}/>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            style={{
              width: 28, height: 28, borderRadius: 8,
              border: 'none', background: 'transparent',
              color: 'rgba(255,255,255,0.36)',
              cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.14s, color 0.14s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = SHELL.text1 }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.36)' }}
          >
            <XIcon size={14} strokeWidth={2} />
          </button>
        )}
      </div>

      <div style={{
        display: 'flex',
        gap: 18,
        alignItems: 'stretch',
        padding: 14,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12,
        marginBottom: 14,
      }}>
        <div style={{ flexShrink: 0, width: thumbWidth }}>
          {(video.video_id || video.thumbnail) ? (
            <img
              src={ytMaxThumbUrl(video.video_id) || video.thumbnail}
              alt=""
              loading="lazy"
              onLoad={makeThumbOnLoad(video.video_id, video.thumbnail)}
              onError={makeThumbOnError(video.video_id, video.thumbnail)}
              style={{
                display: 'block',
                width: '100%', aspectRatio: thumbAspect,
                objectFit: 'cover',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            />
          ) : (
            <div style={{
              width: '100%', aspectRatio: thumbAspect,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}/>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{
            margin: 0, fontSize: 13.5, fontWeight: 450, color: SHELL.text2,
            letterSpacing: '-0.05px', lineHeight: 1.45,
          }}>
            Your {video.is_short ? 'last short' : 'latest video'} has {countLabel}.
            YouTube uses tags to match your video to search queries and related-video suggestions.
          </p>

          <div style={{
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            background: 'rgba(0,0,0,0.16)',
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '7px 12px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.02)',
            }}>
              <span style={{
                fontSize: 11, fontWeight: 600, color: SHELL.text3,
                letterSpacing: '0.10em', textTransform: 'uppercase',
              }}>AI tags</span>
              <span style={{
                fontSize: 11, fontWeight: 600, color: SHELL.text3,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.01em',
              }}>{tags.length} tags</span>
            </div>
            <div style={{
              padding: '10px 12px',
              display: 'flex', flexWrap: 'wrap', gap: 6,
            }}>
              {tags.map((t, i) => (
                <span key={`${idx}-${i}-${t}`} style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '4px 10px', borderRadius: 100,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: SHELL.text1,
                  fontSize: 12, fontWeight: 500,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.3,
                }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: canCycle ? '1fr 1fr' : '1fr', gap: 10 }}>
        {canCycle && (
          <button
            type="button"
            disabled={publishing || published}
            onClick={() => setSetIdx((idx + 1) % tagSets.length)}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              padding: '10px 14px', borderRadius: 100,
              border: '1px solid rgba(255,255,255,0.10)',
              background: 'rgba(255,255,255,0.03)',
              color: SHELL.text1,
              fontFamily: 'inherit',
              fontSize: 13, fontWeight: 600, letterSpacing: '-0.05px',
              cursor: (publishing || published) ? 'default' : 'pointer',
              opacity: (publishing || published) ? 0.5 : 1,
              transition: 'background 0.14s, border-color 0.14s',
            }}
            onMouseEnter={e => { if (!publishing && !published) { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)' } }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)' }}
          >
            <RefreshCw size={13} strokeWidth={2.1} />
            Next set
          </button>
        )}

        <button
          type="button"
          disabled={publishing || published}
          onClick={() => onPublish?.(tags, video)}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            padding: '10px 14px', borderRadius: 100,
            border: 'none',
            background: published ? 'rgba(22,163,74,0.85)' : '#e5251b',
            color: '#fff',
            fontFamily: 'inherit',
            fontSize: 13, fontWeight: 600, letterSpacing: '-0.05px',
            boxShadow: published ? 'none' : '0 1px 3px rgba(229,37,27,0.28)',
            cursor: (publishing || published) ? 'default' : 'pointer',
            transition: 'filter 0.14s, transform 0.14s, background 0.2s',
          }}
          onMouseEnter={e => { if (!publishing && !published) { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
          onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          {publishing && <RefreshCw size={13} strokeWidth={2.1} style={{ animation: 'spin 1s linear infinite' }} />}
          {ctaLabel}
        </button>
      </div>

      {publishError && (
        <p style={{ margin: '8px 2px 0', fontSize: 12, fontWeight: 500, color: '#fb6a60' }}>
          {publishError}
        </p>
      )}
    </article>
  )
}

// Pinned AI input at the bottom of the Feed. Single line: text input +
// brand-red Ask CTA. On submit, the consumer stashes the query in
// sessionStorage and routes to Chat; ChatCoach reads it on mount and
// auto-sends once its state has hydrated. Sticky-bottom inside .ov-page
// so it stays visible as the user scrolls the Feed.
export function PinnedAIInput({ onAsk }) {
  const [value, setValue] = useState('')
  const submit = () => {
    const q = (value || '').trim()
    if (!q) return
    setValue('')
    onAsk?.(q)
  }
  return (
    <div style={{
      position: 'sticky', bottom: 16, zIndex: 5,
      marginTop: 18,
      padding: '10px 12px',
      background: 'linear-gradient(180deg, rgba(20,20,24,0.92) 0%, rgba(12,12,14,0.96) 100%)',
      backdropFilter: 'blur(14px)',
      border: '1px solid rgba(255,255,255,0.10)',
      borderRadius: 14,
      boxShadow: '0 4px 18px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.06)',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }}
        placeholder="How can I help you grow?"
        aria-label="Ask the AI coach"
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none', outline: 'none',
          color: SHELL.text1,
          fontFamily: 'inherit',
          fontSize: 14, fontWeight: 450,
          letterSpacing: '-0.05px',
          padding: '6px 4px',
        }}
      />
      <button
        type="button"
        onClick={submit}
        disabled={!value.trim()}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '8px 16px', borderRadius: 100,
          border: 'none',
          background: value.trim() ? '#e5251b' : 'rgba(255,255,255,0.08)',
          color: '#fff',
          fontFamily: 'inherit',
          fontSize: 13, fontWeight: 600, letterSpacing: '-0.05px',
          boxShadow: value.trim() ? '0 1px 3px rgba(229,37,27,0.28)' : 'none',
          cursor: value.trim() ? 'pointer' : 'default',
          opacity: value.trim() ? 1 : 0.6,
          transition: 'filter 0.14s, transform 0.14s, background 0.2s, opacity 0.2s',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => { if (value.trim()) { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
        onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
      >
        Ask
        <ArrowRight size={13} strokeWidth={2.1} />
      </button>
    </div>
  )
}

// Unanswered Comment card. Surfaces ONE real viewer comment from one of
// the creator's recent videos that they haven't replied to, plus 3 AI
// reply drafts. The "Post Reply" CTA hits /dashboard/post-comment-reply
// which calls YouTube comments.insert (50 quota units per click).
export function UnansweredCommentCard({
  video, comment, replies,
  posting, posted, postError,
  onPost, onDismiss,
}) {
  const [replyIdx, setReplyIdx] = useState(0)
  if (!comment || !replies?.length) return null
  const idx       = Math.max(0, Math.min(replies.length - 1, replyIdx))
  const reply     = replies[idx] || ''
  if (!reply) return null
  const canCycle  = replies.length > 1
  const ctaLabel  = posted ? 'Reply posted' : posting ? 'Posting…' : 'Post Reply'
  const authorName = (comment.author_name || '@viewer').replace(/^@?/, '@')

  let ageLabel = ''
  try {
    if (comment.published_at) {
      const ts = new Date(comment.published_at).getTime()
      const days = Math.max(0, Math.floor((Date.now() - ts) / 86400000))
      ageLabel = days === 0 ? 'today' : days === 1 ? '1d ago' : `${days}d ago`
    }
  } catch {}

  return (
    <article style={{
      background: SHELL.cardFlat,
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 14,
      padding: '14px 18px 16px 18px',
      boxShadow: '0 1px 2px rgba(255,255,255,0.04), 0 6px 18px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.7)',
      marginBottom: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <h3 style={{
          fontSize: 16, fontWeight: 600, color: SHELL.text1,
          letterSpacing: '-0.2px', lineHeight: 1.3, margin: 0,
        }}>Unanswered Comment</h3>
        {ageLabel && (
          <span style={{
            fontSize: 12.5, fontWeight: 450, color: SHELL.text3,
            letterSpacing: '-0.01em',
          }}>· {ageLabel}</span>
        )}
        <div style={{ flex: 1 }}/>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            style={{
              width: 28, height: 28, borderRadius: 8,
              border: 'none', background: 'transparent',
              color: 'rgba(255,255,255,0.36)',
              cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.14s, color 0.14s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = SHELL.text1 }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.36)' }}
          >
            <XIcon size={14} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Comment block: avatar + author + text + on-video subline */}
      <div style={{
        padding: 14,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12,
        marginBottom: 10,
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          {comment.author_image ? (
            <img
              src={comment.author_image}
              alt=""
              referrerPolicy="no-referrer"
              style={{
                flexShrink: 0,
                width: 38, height: 38, borderRadius: '50%',
                objectFit: 'cover',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.10)',
              }}
            />
          ) : (
            <div style={{
              flexShrink: 0,
              width: 38, height: 38, borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.10)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: SHELL.text3, fontSize: 14, fontWeight: 600,
            }}>{(authorName || '@').replace(/^@/, '').slice(0, 1).toUpperCase() || '@'}</div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 13, fontWeight: 600, color: SHELL.text1,
                letterSpacing: '-0.05px',
              }}>{authorName}</span>
              {video?.title && (
                <span style={{ fontSize: 12, fontWeight: 450, color: SHELL.text3, letterSpacing: '-0.01em' }}>
                  · on "{video.title.length > 48 ? video.title.slice(0, 46) + '…' : video.title}"
                </span>
              )}
            </div>
            <p style={{
              margin: 0, fontSize: 13.5, fontWeight: 450, color: SHELL.text1,
              letterSpacing: '-0.05px', lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 4,
              overflow: 'hidden',
            }}>{comment.text || ''}</p>
          </div>
        </div>
      </div>

      {/* AI reply draft */}
      <div style={{
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10,
        background: 'rgba(0,0,0,0.16)',
        overflow: 'hidden',
        marginBottom: 14,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '7px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.02)',
        }}>
          <span style={{
            fontSize: 11, fontWeight: 600, color: SHELL.text3,
            letterSpacing: '0.10em', textTransform: 'uppercase',
          }}>AI reply</span>
          <span style={{
            fontSize: 11, fontWeight: 600, color: SHELL.text3,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.01em',
          }}>{reply.length} chars</span>
        </div>
        <p style={{
          margin: 0, padding: '10px 12px',
          fontSize: 13.5, fontWeight: 450, color: SHELL.text1,
          letterSpacing: '-0.05px', lineHeight: 1.5,
          whiteSpace: 'pre-wrap',
        }}>{reply}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: canCycle ? '1fr 1fr' : '1fr', gap: 10 }}>
        {canCycle && (
          <button
            type="button"
            disabled={posting || posted}
            onClick={() => setReplyIdx((idx + 1) % replies.length)}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              padding: '10px 14px', borderRadius: 100,
              border: '1px solid rgba(255,255,255,0.10)',
              background: 'rgba(255,255,255,0.03)',
              color: SHELL.text1,
              fontFamily: 'inherit',
              fontSize: 13, fontWeight: 600, letterSpacing: '-0.05px',
              cursor: (posting || posted) ? 'default' : 'pointer',
              opacity: (posting || posted) ? 0.5 : 1,
              transition: 'background 0.14s, border-color 0.14s',
            }}
            onMouseEnter={e => { if (!posting && !posted) { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)' } }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)' }}
          >
            <RefreshCw size={13} strokeWidth={2.1} />
            Next draft
          </button>
        )}

        <button
          type="button"
          disabled={posting || posted}
          onClick={() => onPost?.(reply, comment)}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            padding: '10px 14px', borderRadius: 100,
            border: 'none',
            background: posted ? 'rgba(22,163,74,0.85)' : '#e5251b',
            color: '#fff',
            fontFamily: 'inherit',
            fontSize: 13, fontWeight: 600, letterSpacing: '-0.05px',
            boxShadow: posted ? 'none' : '0 1px 3px rgba(229,37,27,0.28)',
            cursor: (posting || posted) ? 'default' : 'pointer',
            transition: 'filter 0.14s, transform 0.14s, background 0.2s',
          }}
          onMouseEnter={e => { if (!posting && !posted) { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
          onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          {posting && <RefreshCw size={13} strokeWidth={2.1} style={{ animation: 'spin 1s linear infinite' }} />}
          {ctaLabel}
        </button>
      </div>

      {postError && (
        <p style={{ margin: '8px 2px 0', fontSize: 12, fontWeight: 500, color: '#fb6a60' }}>
          {postError}
        </p>
      )}
    </article>
  )
}

// Top Search Terms card. Real YouTube Analytics data: the actual queries
// viewers typed to find this creator's videos in the last 28 days. Each
// row is a query + view count from that query. No AI, no scoring guesses
// — just the raw signal. CTA opens Keyword Research with the top term
// pre-filled so the user can act on the highest-volume query that's
// already bringing them viewers.
export function TopSearchTermsCard({ items, refreshedAt, onResearch, onDismiss }) {
  if (!items || items.length < 1) return null
  const visible = items.slice(0, 5)
  const topTerm = visible[0]?.term || ''
  const maxViews = Math.max(1, ...visible.map(it => Number(it.views) || 0))

  let ageLabel = ''
  try {
    if (refreshedAt) {
      const ts = new Date(refreshedAt).getTime()
      const days = Math.max(0, Math.floor((Date.now() - ts) / 86400000))
      ageLabel = days === 0 ? 'today' : days === 1 ? '1d ago' : `${days}d ago`
    }
  } catch {}

  return (
    <article style={{
      background: SHELL.cardFlat,
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 14,
      padding: '14px 18px 16px 18px',
      boxShadow: '0 1px 2px rgba(255,255,255,0.04), 0 6px 18px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.7)',
      marginBottom: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <h3 style={{
          fontSize: 16, fontWeight: 600, color: SHELL.text1,
          letterSpacing: '-0.2px', lineHeight: 1.3, margin: 0,
        }}>Top Search Terms</h3>
        <span style={{
          fontSize: 12.5, fontWeight: 450, color: SHELL.text3,
          letterSpacing: '-0.01em',
        }}>· last 28 days{ageLabel ? ` · refreshed ${ageLabel}` : ''}</span>
        <div style={{ flex: 1 }}/>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            style={{
              width: 28, height: 28, borderRadius: 8,
              border: 'none', background: 'transparent',
              color: 'rgba(255,255,255,0.36)',
              cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.14s, color 0.14s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = SHELL.text1 }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.36)' }}
          >
            <XIcon size={14} strokeWidth={2} />
          </button>
        )}
      </div>

      <p style={{
        margin: '0 0 12px 0', fontSize: 13.5, fontWeight: 450, color: SHELL.text2,
        letterSpacing: '-0.05px', lineHeight: 1.45,
      }}>
        How viewers are finding you on YouTube search.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
        {visible.map((it, i) => {
          const views = Number(it.views) || 0
          const pct = Math.max(4, Math.round((views / maxViews) * 100))
          return (
            <div key={`${it.term}-${i}`} style={{
              position: 'relative',
              padding: '9px 12px',
              borderRadius: 10,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              overflow: 'hidden',
            }}>
              {/* Subtle volume bar behind the row, brand-red tinted */}
              <div style={{
                position: 'absolute', inset: 0,
                width: `${pct}%`,
                background: 'linear-gradient(90deg, rgba(229,37,27,0.10) 0%, rgba(229,37,27,0.03) 100%)',
                pointerEvents: 'none',
              }}/>
              <div style={{
                position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
              }}>
                <span style={{
                  fontSize: 13.5, fontWeight: 500, color: SHELL.text1,
                  letterSpacing: '-0.05px', lineHeight: 1.3,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  flex: 1, minWidth: 0,
                }}>{it.term}</span>
                <span style={{
                  fontSize: 12, fontWeight: 600, color: SHELL.text2,
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '-0.01em',
                  flexShrink: 0,
                }}>{views.toLocaleString()} views</span>
              </div>
            </div>
          )
        })}
      </div>

      {topTerm && (
        <button
          type="button"
          onClick={() => onResearch?.(topTerm)}
          style={{
            width: '100%',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            padding: '10px 14px', borderRadius: 100,
            border: 'none',
            background: '#e5251b',
            color: '#fff',
            fontFamily: 'inherit',
            fontSize: 13, fontWeight: 600, letterSpacing: '-0.05px',
            boxShadow: '0 1px 3px rgba(229,37,27,0.28)',
            cursor: 'pointer',
            transition: 'filter 0.14s, transform 0.14s',
          }}
          onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          Research top term: {topTerm.length > 32 ? topTerm.slice(0, 30) + '…' : topTerm}
          <ArrowRight size={13} strokeWidth={2.1} />
        </button>
      )}
    </article>
  )
}

export function SuggestedCompetitorsCard({ suggestions, category, onTrack, onDismiss, onOpenAll }) {
  // Show 2-3 suggestions. Lowered from "<3 -> hide" because for many
  // creators (especially geographic or thin niches) the candidate pool
  // is small after own-channel + already-tracked filtering. A single
  // suggestion isn't enough to feel like a "list", but two is.
  const top = (suggestions || []).slice(0, 3)
  if (top.length < 2) return null

  const subline = category
    ? `Based on your top niche: ${category.replace(/-/g, ' ')}`
    : 'Based on the keywords your channel ranks for'

  return (
    <FeedCard
      Icon={UserPlus}
      iconColor={'#fb6a60'}
      iconBg="rgba(229,37,27,0.10)"
      category="Suggested Competitors"
      onDismiss={onDismiss}
      rightSlot={
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: 10.5, fontWeight: 600, color: SHELL.text2,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '3px 9px', borderRadius: 100,
          letterSpacing: '0.10em', textTransform: 'uppercase',
        }}>
          <span style={{ width: 5, height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.45)' }}/>
          {top.length} picks
        </span>
      }
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <h3 style={{
          fontSize: 14, fontWeight: 600, color: SHELL.text1,
          letterSpacing: '-0.15px', lineHeight: 1.3, margin: 0,
        }}>Channels in your niche worth tracking</h3>
        <span style={{
          fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.78)',
          letterSpacing: '-0.05px',
        }}>{subline}</span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
        gap: 10,
        marginBottom: 12,
      }}>
        {top.map((c, i) => {
          const subs = Number(c.subscribers || 0)
          const subsLabel = subs > 0 ? `${fmtNum(subs)} subs` : ''
          const handle = c.handle ? (c.handle.startsWith('@') ? c.handle : `@${c.handle}`) : ''
          return (
            <div
              key={c.channel_id || i}
              style={{
                display: 'flex', flexDirection: 'column', gap: 10,
                padding: '14px 14px 12px',
                background: SHELL.cardFlat,
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10,
                transition: 'background 0.14s, border-color 0.14s, transform 0.14s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = SHELL.cardFlat; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {/* Avatar row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {c.thumbnail ? (
                  <img
                    src={c.thumbnail}
                    alt=""
                    loading="lazy"
                    onError={e => { e.currentTarget.style.visibility = 'hidden' }}
                    style={{
                      flexShrink: 0,
                      width: 36, height: 36, borderRadius: 99,
                      objectFit: 'cover',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  />
                ) : (
                  <div style={{
                    flexShrink: 0,
                    width: 36, height: 36, borderRadius: 99,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: SHELL.text3,
                  }}>
                    <Users size={15} strokeWidth={2} />
                  </div>
                )}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{
                    fontSize: 13, fontWeight: 600, color: SHELL.text1,
                    letterSpacing: '-0.15px', lineHeight: 1.25,
                    margin: 0,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{c.channel_name || 'Unknown channel'}</p>
                  {(subsLabel || handle) && (
                    <p style={{
                      fontSize: 11.5, fontWeight: 500, color: SHELL.text3,
                      letterSpacing: '-0.01em', lineHeight: 1.3,
                      margin: '3px 0 0',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {[subsLabel, handle].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
              </div>

              {/* Track CTA */}
              <button
                type="button"
                onClick={() => onTrack?.(c)}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  padding: '7px 14px', borderRadius: 100,
                  border: 'none', cursor: 'pointer',
                  background: '#e5251b', color: '#fff',
                  fontFamily: 'inherit',
                  fontSize: 12, fontWeight: 600, letterSpacing: '-0.05px',
                  boxShadow: '0 1px 3px rgba(229,37,27,0.28)',
                  transition: 'filter 0.14s, transform 0.14s',
                }}
                onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                Track
                <ArrowRight size={11} strokeWidth={2.4} />
              </button>
            </div>
          )
        })}
      </div>

      {/* Bottom row: open Competitors */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <span style={{ fontSize: 11.5, fontWeight: 500, color: SHELL.text3, letterSpacing: '-0.01em' }}>
          Picked from caches, no new search burned
        </span>
        <div style={{ flex: 1 }}/>
        {onOpenAll && (
          <button
            type="button"
            onClick={onOpenAll}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '6px 11px', borderRadius: 100,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.02)',
              color: SHELL.text2,
              fontFamily: 'inherit',
              fontSize: 11.5, fontWeight: 600, letterSpacing: '-0.05px',
              cursor: 'pointer',
              transition: 'background 0.14s, border-color 0.14s, color 0.14s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'; e.currentTarget.style.color = SHELL.text1 }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = SHELL.text2 }}
          >
            Open Competitors
            <ArrowRight size={11} strokeWidth={2.4} />
          </button>
        )}
      </div>
    </FeedCard>
  )
}

// Competitor Activity card. Shows recent uploads from the channels the
// Related Traffic card. Auto-curated, zero-credit. Shows up to 6 OTHER
// videos on YouTube that recently sent views to this creator (via the
// "Suggested videos" surface), surfaced from Analytics. Visual model
// mirrors the VidIQ Feed reference: large HD thumbnails in a 2-up grid,
// duration badge bottom-right of each thumb, title 2-line clamp, stats
// row showing the source video's total views with an arrow to a brand-
// red "N views to you" pill. Click anywhere on a tile opens the video
// on YouTube in a new tab.
export function RelatedTrafficCard({ items, ageLabel, reason, rawSourceCount, onOpen, onDismiss }) {
  const top = (items || []).slice(0, 6)
  // Empty-state explainer. Renders the card head with a clear "why
  // nothing showed" message instead of silently disappearing.
  const reasonCopy = top.length === 0 ? (() => {
    if (reason === 'no_analytics_traffic') return 'No suggested-video traffic recorded for your channel in the last 14 days. As your watch time grows, YouTube will start surfacing your videos as suggestions and this card will populate.'
    if (reason === 'all_filtered')         return `Found ${rawSourceCount || 0} source video${rawSourceCount === 1 ? '' : 's'} sending traffic, but none cleared the 10K-view quality floor. Either the sources are tiny channels, or your own uploads, so we are hiding them.`
    if (reason === 'resolve_failed')       return 'Could not resolve the source videos via YouTube. We will retry on the next refresh.'
    if (reason === 'no_source_ids')        return 'No source video IDs in the Analytics response. Common when a channel is brand new or has zero suggested-video traffic.'
    if (reason === 'not_authenticated')    return 'Sign in again to load related-traffic data. Your session may have expired.'
    if (reason === 'request_failed')       return 'The Analytics request failed. Reload the Feed to try again.'
    if (reason === 'network_error')        return 'Network error reaching the server. Check your connection and reload.'
    return null
  })() : null
  if (top.length === 0 && !reasonCopy) return null

  function fmtDuration(sec) {
    sec = Math.max(0, Math.floor(Number(sec || 0)))
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${m}:${String(s).padStart(2, '0')}`
  }

  return (
    <article style={{
      background: SHELL.cardFlat,
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 14,
      padding: '14px 18px 16px 18px',
      boxShadow: '0 1px 2px rgba(255,255,255,0.04), 0 6px 18px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.7)',
      marginBottom: 12,
    }}>
      {/* Plain head: title + age + dismiss */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <h3 style={{
          fontSize: 16, fontWeight: 600, color: SHELL.text1,
          letterSpacing: '-0.2px', lineHeight: 1.3, margin: 0,
        }}>{top.length > 0
          ? `New Traffic From ${top.length} Related ${top.length === 1 ? 'Video' : 'Videos'}`
          : 'New Traffic From Related Videos'}</h3>
        {ageLabel && (
          <span style={{
            fontSize: 12.5, fontWeight: 450, color: SHELL.text3,
            letterSpacing: '-0.01em',
          }}>· {ageLabel}</span>
        )}
        <div style={{ flex: 1 }}/>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            style={{
              width: 28, height: 28, borderRadius: 8,
              border: 'none', background: 'transparent',
              color: 'rgba(255,255,255,0.36)',
              cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.14s, color 0.14s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = SHELL.text1 }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.36)' }}
          >
            <XIcon size={14} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Empty-state explainer — silent failures become visible failures. */}
      {top.length === 0 && reasonCopy && (
        <div style={{
          padding: '16px 18px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px dashed rgba(255,255,255,0.10)',
          borderRadius: 12,
          color: SHELL.text2,
          fontSize: 13, fontWeight: 450, lineHeight: 1.55,
          letterSpacing: '-0.01em',
        }}>{reasonCopy}</div>
      )}

      {/* 2-up grid (auto-fill, collapses to 1-up on narrow widths) */}
      {top.length > 0 && <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 14,
      }}>
        {top.map((it, i) => {
          const dur = fmtDuration(it.duration_seconds)
          return (
            <button
              key={it.video_id || i}
              type="button"
              onClick={() => onOpen?.(it)}
              aria-label={`Open ${it.title} on YouTube`}
              style={{
                display: 'flex', flexDirection: 'column', gap: 0,
                padding: 0,
                background: 'transparent',
                border: 'none',
                borderRadius: 12,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'transform 0.18s cubic-bezier(0.2,0.7,0.3,1)',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {/* HD thumbnail with duration badge */}
              <div style={{ position: 'relative', width: '100%' }}>
                {(it.video_id || it.thumbnail) ? (
                  <img
                    src={ytMaxThumbUrl(it.video_id) || it.thumbnail}
                    alt=""
                    loading="lazy"
                    onLoad={makeThumbOnLoad(it.video_id, it.thumbnail)}
                    onError={makeThumbOnError(it.video_id, it.thumbnail)}
                    style={{
                      display: 'block',
                      width: '100%', aspectRatio: '16 / 9',
                      objectFit: 'cover',
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%', aspectRatio: '16 / 9',
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}/>
                )}
                {dur && dur !== '0:00' && (
                  <span style={{
                    position: 'absolute', right: 8, bottom: 8,
                    padding: '3px 7px', borderRadius: 6,
                    background: 'rgba(0,0,0,0.82)',
                    color: '#fff',
                    fontSize: 11.5, fontWeight: 600,
                    letterSpacing: '-0.01em',
                    fontVariantNumeric: 'tabular-nums',
                    lineHeight: 1.1,
                  }}>{dur}</span>
                )}
              </div>

              {/* Title */}
              <p style={{
                margin: '10px 2px 0',
                fontSize: 13.5, fontWeight: 600, color: SHELL.text1,
                letterSpacing: '-0.1px', lineHeight: 1.35,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                overflow: 'hidden', textOverflow: 'ellipsis',
                minHeight: 36,
              }}>{it.title || 'Untitled'}</p>

              {/* Channel name (subtle) */}
              {it.channel_name && (
                <p style={{
                  margin: '4px 2px 0',
                  fontSize: 12, fontWeight: 450, color: SHELL.text3,
                  letterSpacing: '-0.01em', lineHeight: 1.3,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{it.channel_name}</p>
              )}

              {/* Stats row: eye + view count → "N views to you" pill */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                margin: '8px 2px 0',
              }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  color: SHELL.text3,
                  fontSize: 12, fontWeight: 500,
                  letterSpacing: '-0.01em',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  <Eye size={12} strokeWidth={2.2} />
                  {fmtNum(it.view_count || 0)}
                </span>
                <ArrowRight size={12} strokeWidth={2.2} style={{ color: SHELL.text3 }}/>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '3px 9px', borderRadius: 100,
                  background: 'rgba(229,37,27,0.13)',
                  border: '1px solid rgba(229,37,27,0.32)',
                  color: '#fb6a60',
                  fontSize: 11.5, fontWeight: 600,
                  letterSpacing: '-0.01em',
                  fontVariantNumeric: 'tabular-nums',
                }}>{fmtNum(it.views_to_you || 0)} {it.views_to_you === 1 ? 'view to you' : 'views to you'}</span>
              </div>
            </button>
          )
        })}
      </div>}
    </article>
  )
}


export function CompetitorActivityCard({ items, refreshing, onRefresh, onOpen, onOpenAll, onDismiss }) {
  const top3 = (items || []).slice(0, 3)
  if (top3.length === 0) return null

  return (
    <FeedCard
      Icon={Users}
      iconColor={SHELL.text1}
      iconBg="rgba(255,255,255,0.06)"
      category="Competitor Moves · last 7 days"
      onDismiss={onDismiss}
      rightSlot={
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 10.5, fontWeight: 600, color: SHELL.text2,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)',
          padding: '3px 8px', borderRadius: 100,
          letterSpacing: '0.05em', textTransform: 'uppercase',
        }}>
          {top3.length} new
        </span>
      }
    >
      <h3 style={{
        fontSize: 14, fontWeight: 600, color: SHELL.text1,
        letterSpacing: '-0.3px', lineHeight: 1.25,
        marginBottom: 14,
      }}>What your competition just posted</h3>

      {/* 3-up grid of recent uploads */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
        {top3.map((item, i) => (
          <a
            key={i}
            href={item.video_id ? `https://www.youtube.com/watch?v=${item.video_id}` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => { if (onOpen) { e.preventDefault(); onOpen(item) } }}
            style={{
              display: 'block',
              background: SHELL.cardFlat,
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10,
              overflow: 'hidden',
              textDecoration: 'none',
              transition: 'background 0.14s ease, border-color 0.14s ease, transform 0.14s ease, box-shadow 0.14s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            {/* Thumbnail */}
            <div style={{ position: 'relative', aspectRatio: '16/9', background: '#26262b', overflow: 'hidden' }}>
              {item.thumbnail && (
                <img src={item.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
              )}
              {/* Channel avatar overlay (bottom-left of thumb) */}
              {item.channel_thumbnail && (
                <div style={{
                  position: 'absolute', left: 8, bottom: 8,
                  width: 26, height: 26, borderRadius: '50%',
                  overflow: 'hidden',
                  boxShadow: '0 0 0 2px #fff, 0 2px 8px rgba(0,0,0,0.30)',
                }}>
                  <img src={item.channel_thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
                </div>
              )}
              {/* External link badge top-right */}
              <div style={{
                position: 'absolute', top: 8, right: 8,
                background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
                color: '#fff', width: 22, height: 22, borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ExternalLink size={11} strokeWidth={2.4}/>
              </div>
            </div>

            {/* Title + meta */}
            <div style={{ padding: '10px 12px' }}>
              <p style={{
                fontSize: 12.5, fontWeight: 600, color: SHELL.text1,
                letterSpacing: '-0.15px', lineHeight: 1.35,
                marginBottom: 6,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                minHeight: 34,
              }}>{item.title}</p>
              <p style={{
                fontSize: 10.5, fontWeight: 600, color: SHELL.text2,
                letterSpacing: '-0.05px', lineHeight: 1.3,
                marginBottom: 4,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{item.channel_name}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, fontWeight: 500, color: SHELL.text3, fontVariantNumeric: 'tabular-nums' }}>
                <span>{fmtNum(item.views || 0)} views</span>
                <span style={{ color: 'rgba(255,255,255,0.20)' }}>·</span>
                <span>{item.age_label || ''}</span>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Bottom row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <span style={{ fontSize: 11.5, fontWeight: 500, color: SHELL.text3, letterSpacing: '-0.01em' }}>
          From the channels you track
        </span>
        <div style={{ flex: 1 }}/>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '6px 11px', borderRadius: 100,
              border: '1px solid rgba(255,255,255,0.08)',
              background: refreshing ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
              color: refreshing ? SHELL.text3 : SHELL.text2,
              fontFamily: 'inherit',
              fontSize: 11.5, fontWeight: 600, letterSpacing: '-0.01em',
              cursor: refreshing ? 'wait' : 'pointer',
              transition: 'background 0.14s ease, color 0.14s ease, border-color 0.14s ease',
            }}
            onMouseEnter={e => { if (!refreshing) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = SHELL.text1; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)' } }}
            onMouseLeave={e => { if (!refreshing) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = SHELL.text2; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' } }}
          >
            <RefreshCw size={11} strokeWidth={2.4} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }}/>
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        )}
        {onOpenAll && (
          <button
            type="button"
            onClick={onOpenAll}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '7px 13px', borderRadius: 100,
              border: 'none', cursor: 'pointer',
              background: SHELL.text1, color: '#0e0e10',
              fontFamily: 'inherit',
              fontSize: 12, fontWeight: 600, letterSpacing: '-0.01em',
              boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
              transition: 'filter 0.14s ease, transform 0.14s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.10)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            Open Competitors
            <ArrowRight size={12} strokeWidth={2.4} />
          </button>
        )}
      </div>
    </FeedCard>
  )
}


/* ─── Insight card (legacy, still used by collapsed audit detail) ────────── */
export function InsightCard({ insight, index, checked, onToggle, onDelete, onNavigate }) {
  const { color } = sev(insight.impact || insight.severity)
  return (
    <div className={`ytg-insight-card${checked ? ' done' : ''}`} style={{
      transition: 'opacity 0.2s', marginBottom: 10,
      borderTop: `3px solid ${checked ? 'rgba(255,255,255,0.08)' : color}`,
    }}>
      <div style={{ padding: '16px 22px 18px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: checked ? 0 : 14 }}>

          {/* Checkbox + solid rank badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, paddingTop: 2 }}>
            <input
              type="checkbox"
              checked={!!checked}
              onChange={onToggle}
              style={{ width: 15, height: 15, accentColor: '#34d27b', cursor: 'pointer', flexShrink: 0 }}
            />
            <div style={{ width: 26, height: 26, borderRadius: 8, background: checked ? 'rgba(22,163,74,0.14)' : color, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {checked
                ? <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke={'#34d27b'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1.5,6.5 5,10 10.5,2"/></svg>
                : <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{insight.rank ?? index + 1}</span>
              }
            </div>
          </div>

          {/* Category label above problem */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {insight.category && (
              <p style={{ fontSize: 10, fontWeight: 600, color: checked ? SHELL.text3 : color, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>{insight.category}</p>
            )}
            <p style={{ fontSize: 14, fontWeight: 600, color: checked ? SHELL.text3 : SHELL.text1, lineHeight: 1.55, textDecoration: checked ? 'line-through' : 'none' }}>{insight.problem}</p>
          </div>

          {/* Severity badge + delete */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color, padding: '3px 9px', borderRadius: 20, letterSpacing: '0.06em', textTransform: 'uppercase', border: `1.5px solid ${color}` }}>
              {insight.impact || insight.severity || 'issue'}
            </span>
            {checked && onDelete && (
              <button className="ytg-del-btn" onClick={onDelete} title="Remove task">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#e5251b" strokeWidth="1.8" strokeLinecap="round">
                  <line x1="2" y1="2" x2="8" y2="8"/><line x1="8" y1="2" x2="2" y2="8"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Divider between header and body */}
        {!checked && <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 14, marginLeft: 46 }} />}

        {/* ── Body — hidden when done ── */}
        {!checked && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: 8, marginLeft: 46 }}>

            {/* Why now */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: SHELL.text2, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Why now</p>
              <p style={{ fontSize: 13.5, color: SHELL.text1, lineHeight: 1.72 }}>{insight.whyNow || insight.cause}</p>
            </div>

            {/* Action */}
            <div style={{
              background: SHELL.cardFlat,
              border: `1px solid ${'rgba(255,255,255,0.08)'}`,
              borderLeft: `3px solid ${color}`,
              borderRadius: '0 10px 10px 0',
              padding: '12px 16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              display: 'flex', flexDirection: 'column',
            }}>
              <p style={{ fontSize: 10, fontWeight: 600, color, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Action</p>
              <p style={{ fontSize: 13.5, color: SHELL.text1, lineHeight: 1.72 }}>{insight.action}</p>
            </div>

            {/* Expected outcome */}
            {insight.expectedOutcome
              ? <div style={{ background: 'rgba(5,150,105,0.07)', border: '1px solid rgba(5,150,105,0.14)', borderRadius: 10, padding: '12px 14px' }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: '#34d27b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Expected outcome</p>
                  <p style={{ fontSize: 13.5, color: SHELL.text1, lineHeight: 1.72 }}>{insight.expectedOutcome}</p>
                </div>
              : <div />
            }

          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Nav icons ─────────────────────────────────────────────────────────── */
// Lucide icons across the whole nav. Single visual language, consistent
// stroke weight (1.75) and size (18px primary, 16px footer). Replaces the
// previous hand-drawn 14px SVGs that read as amateur.
