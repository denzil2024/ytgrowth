/* ─── Dashboard pure utilities ──────────────────────────────────────────────
   Pure functions only. No JSX, no React, no hooks. Anything that returns
   an event handler (e.g. makeThumbOnError) still counts as pure because
   the handler closes over plain values, not React state. */
import {
  C,
  SEV,
  MILESTONE_TIERS,
  METAL,
} from './tokens'

/* Picks the metal palette for a given milestone tier. Bronze for the
   lowest 25% of tiers, then silver / gold / platinum at 50% and 85%. */
export function tierMetal(category, tier) {
  const tiers = MILESTONE_TIERS[category] || []
  const idx = tiers.indexOf(tier)
  if (idx < 0) return METAL.bronze
  const pct = tiers.length > 1 ? idx / (tiers.length - 1) : 0
  if (pct < 0.26) return METAL.bronze
  if (pct < 0.51) return METAL.silver
  if (pct < 0.85) return METAL.gold
  return METAL.platinum
}

export function sev(severity) { return SEV[severity] || SEV.critical }

/* YouTube thumbnail cascade — prefers maxresdefault (1280x720), falls back to
   hqdefault (always present at 480x360), finally to the stored thumbnail URL.
   Also detects YouTube's 120x90 grey placeholder (HTTP 200 — onError never
   fires) via onLoad dimension check so broken thumbs don't render. Identical
   to the Outliers page helpers, kept local here to avoid cross-page imports. */
export function ytMaxThumbUrl(videoId) {
  return videoId ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : null
}
function _advanceThumb(target, videoId, fallbackUrl) {
  const step = target.dataset.thumbStep || 'max'
  if (step === 'max' && videoId) {
    target.dataset.thumbStep = 'hq'
    target.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
  } else if (step !== 'done' && fallbackUrl) {
    target.dataset.thumbStep = 'done'
    target.src = fallbackUrl
  } else {
    target.onerror = null
  }
}
export function makeThumbOnError(videoId, fallbackUrl) {
  return (e) => _advanceThumb(e.target, videoId, fallbackUrl)
}
export function makeThumbOnLoad(videoId, fallbackUrl) {
  return (e) => {
    const step = e.target.dataset.thumbStep || 'max'
    if (step === 'max' && e.target.naturalWidth === 120 && e.target.naturalHeight === 90) {
      _advanceThumb(e.target, videoId, fallbackUrl)
    }
  }
}

/* Plan badge helper */
export function planBadge(plan) {
  if (!plan || plan === 'free') return { label: 'Free', color: '#6b7280', bg: 'rgba(107,114,128,0.08)', bdr: 'rgba(107,114,128,0.18)' }
  const isLife = plan.startsWith('lifetime_')
  const base   = isLife ? plan.replace('lifetime_', '') : plan
  const label  = base.charAt(0).toUpperCase() + base.slice(1) + (isLife ? ' ∞' : '')
  if (base === 'solo')   return { label, color: '#2563eb', bg: 'rgba(37,99,235,0.07)',   bdr: 'rgba(37,99,235,0.18)' }
  if (base === 'growth') return { label, color: '#34d27b', bg: 'rgba(5,150,105,0.07)',   bdr: 'rgba(5,150,105,0.18)' }
  if (base === 'agency') return { label, color: '#7c3aed', bg: 'rgba(124,58,237,0.07)', bdr: 'rgba(124,58,237,0.18)' }
  return { label, color: '#6b7280', bg: 'rgba(107,114,128,0.08)', bdr: 'rgba(107,114,128,0.18)' }
}

export function healthScore(insights) {
  let s = 100
  insights.forEach(i => {
    if (i.severity === 'critical') s -= 20
    else if (i.severity === 'high') s -= 10
    else if (i.severity === 'medium') s -= 5
  })
  return Math.max(Math.min(s, 100), 0)
}

/* Normalise backend timestamps — Python omits 'Z'; JS treats no-tz strings as local time */
export function parseUTC(str) {
  if (!str) return null
  const s = str.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(str) ? str : str + 'Z'
  return new Date(s)
}

export function relTime(str) {
  const d = parseUTC(str)
  if (!d || isNaN(d)) return ''
  const diff = Math.round((Date.now() - d.getTime()) / 60000)
  if (diff < 1)  return 'just now'
  if (diff < 60) return `${diff}m ago`
  const h = Math.round(diff / 60)
  if (h < 24)   return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}

export function relTimeLong(str) {
  const d = parseUTC(str)
  if (!d || isNaN(d)) return ''
  const days = Math.floor((Date.now() - d.getTime()) / 86400000)
  if (days < 1)   return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7)   return `${days} days ago`
  if (days < 30)  { const w = Math.floor(days / 7); return w === 1 ? 'a week ago' : `${w} weeks ago` }
  if (days < 365) { const m = Math.floor(days / 30); return m === 1 ? 'a month ago' : `${m} months ago` }
  const y = Math.floor(days / 365)
  return y === 1 ? 'a year ago' : `${y} years ago`
}

export function formatAchievedDate(iso) {
  if (!iso) return ''
  const d = parseUTC(iso)
  if (!d || isNaN(d)) return ''
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function scoreColor(s) { return s >= 75 ? C.green : s >= 50 ? C.amber : C.red }
export function scoreLabel(s) { return s >= 75 ? 'Healthy' : s >= 50 ? 'Needs work' : 'Critical' }
export function fmtSecs(s)    { return `${Math.floor(s / 60)}m ${s % 60}s` }
export function fmtNum(n) {
  if (n == null) return '—'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return n.toLocaleString()
}

export function nextSubMilestone(n) {
  if (n < 100)     return 100
  if (n < 1_000)   return Math.ceil(n / 100) * 100
  if (n < 10_000)  return Math.ceil(n / 1_000) * 1_000
  if (n < 100_000) return Math.ceil(n / 10_000) * 10_000
  if (n < 1_000_000) return Math.ceil(n / 100_000) * 100_000
  return Math.ceil(n / 1_000_000) * 1_000_000
}
export function nextViewMilestone(n) {
  if (n < 1_000)    return 1_000
  if (n < 10_000)   return Math.ceil(n / 1_000) * 1_000
  if (n < 100_000)  return Math.ceil(n / 10_000) * 10_000
  if (n < 1_000_000) return Math.ceil(n / 100_000) * 100_000
  return Math.ceil(n / 1_000_000) * 1_000_000
}

/* Compute posting cadence stats from the channel's videos array. All
   counts use the past 28 days. Returns the per-day upload grid (28
   entries, oldest first), the current streak (consecutive days from
   today backwards with at least one upload), the longest 28-day
   streak, and the simple count + pace numbers. */
export function computePostingStats(videos) {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const dayMs = 86400000
  const daysBack = 28

  // Bin uploads per day, keyed by days-ago (0 = today).
  const perDay = new Array(daysBack).fill(0)
  for (const v of videos || []) {
    if (!v.published_at) continue
    const t = new Date(v.published_at).getTime()
    if (Number.isNaN(t)) continue
    const daysAgo = Math.floor((now.getTime() - t) / dayMs)
    if (daysAgo >= 0 && daysAgo < daysBack) perDay[daysAgo] += 1
  }

  const count = perDay.reduce((s, n) => s + n, 0)
  const pacePerWeek = (count / (daysBack / 7))

  // Current streak: walk back from today (allowing today to be empty).
  let currentStreak = 0
  for (let i = 0; i < daysBack; i++) {
    if (perDay[i] > 0) currentStreak += 1
    else if (i === 0) continue // skip today if empty so a yesterday-upload still counts as 1d streak
    else break
  }

  // Longest streak inside the 28-day window.
  let longestStreak = 0
  let run = 0
  for (let i = 0; i < daysBack; i++) {
    if (perDay[i] > 0) { run += 1; longestStreak = Math.max(longestStreak, run) }
    else run = 0
  }

  // Grid for rendering: oldest -> newest (left to right when 7 cols x 4 rows
  // with rows = weeks). We return 28 entries in REVERSE of perDay so index 0
  // is 27 days ago and index 27 is today.
  const gridOldestFirst = perDay.slice().reverse()

  return {
    count,
    pacePerWeek: Number(pacePerWeek.toFixed(1)),
    currentStreak,
    longestStreak,
    gridOldestFirst,
  }
}

/* Compute per-hour and per-(day,hour) average views from the channel's
   videos. Bins by upload time (published_at). Used by BestTimeCard to
   surface the slot when the user's audience watches most. */
export function computeBestTime(videos) {
  if (!videos || videos.length < 5) return null

  // Per-hour aggregate: views and count across all days.
  const hourViews = new Array(24).fill(0)
  const hourCount = new Array(24).fill(0)
  // Per (dayOfWeek, hour) for the headline best slot.
  const slotViews = {}
  const slotCount = {}
  // Per dayOfWeek aggregate so we can hint "your audience is most active
  // on Sundays" even if hour-of-day data is thin.
  const dayViews = new Array(7).fill(0)
  const dayCount = new Array(7).fill(0)

  for (const v of videos) {
    if (!v.published_at) continue
    const d = new Date(v.published_at)
    if (Number.isNaN(d.getTime())) continue
    const h = d.getHours()
    const dow = d.getDay() // 0=Sun, 1=Mon...6=Sat
    const views = v.views || 0
    hourViews[h] += views
    hourCount[h] += 1
    dayViews[dow] += views
    dayCount[dow] += 1
    const key = `${dow}-${h}`
    slotViews[key] = (slotViews[key] || 0) + views
    slotCount[key] = (slotCount[key] || 0) + 1
  }

  const hourAvg = hourViews.map((v, i) => (hourCount[i] > 0 ? v / hourCount[i] : 0))
  const dayAvg  = dayViews.map((v, i) => (dayCount[i] > 0 ? v / dayCount[i] : 0))

  // Top slots: rank (day,hour) buckets with at least 1 video by avg views.
  const slotEntries = Object.keys(slotViews).map(key => {
    const [dow, h] = key.split('-').map(Number)
    return {
      dow, h,
      avg: slotViews[key] / slotCount[key],
      count: slotCount[key],
    }
  })
  slotEntries.sort((a, b) => b.avg - a.avg)
  const top = slotEntries[0] || null
  const second = slotEntries.find(s => !(s.dow === top?.dow && s.h === top?.h)) || null
  const worst = slotEntries.length > 2 ? slotEntries[slotEntries.length - 1] : null

  return {
    hourAvg,
    dayAvg,
    top,
    second,
    worst,
    sampleSize: videos.length,
  }
}

export function formatHour12(h) {
  const suf = h < 12 ? 'AM' : 'PM'
  const hh  = h % 12 === 0 ? 12 : h % 12
  return `${hh} ${suf}`
}

/* Map an insight's category/problem text to the corresponding nav target.
   Used by the Insight card's "Fix this" button. */
export function categoryToNav(category, problem) {
  const c = (category || '').toLowerCase()
  const p = (problem || '').toLowerCase()
  if (c.includes('thumbnail') || p.includes('thumbnail')) return 'Thumbnail Score'
  if (c.includes('competitor') || p.includes('competitor')) return 'Competitors'
  if (c.includes('keyword') || p.includes('keyword')) return 'Keywords'
  if (c.includes('content') || c.includes('posting') || c.includes('frequency') || p.includes('content strategy') || p.includes('video idea')) return 'Video Ideas'
  if (c.includes('seo') || c.includes('ctr') || p.includes('title') || p.includes('description') || p.includes('tag')) return 'SEO Studio'
  return 'SEO Studio'
}
