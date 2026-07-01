/*
 * Preview harness for Outliers. Mounts the component standalone with
 * mocked fetch for /outliers/cache + /outliers/reports + /outliers/intent.
 *
 * Query params:
 *   ?state=empty             — landed, no cache, no query (default)
 *   ?state=intent-picker     — user submitted a query, 3 intent routes visible
 *   ?state=results-videos    — full results, Videos tab active
 *   ?state=results-channels  — full results, Channels tab active
 *   ?state=detail-modal      — results + first video opened in modal
 *   ?state=reports           — Reports view with 3 past searches
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import Outliers from './src/pages/Outliers.jsx'

const params = new URLSearchParams(window.location.search)
const stateMode = params.get('state') || 'empty'

// ── mock data ───────────────────────────────────────────────────────────

const VIDS = [
  {
    video_id: 'dQw4w9WgXcQ', title: 'I built a passive-income product in 7 days (real numbers)',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    channel_id: 'UCsoloKitchen', channel_name: 'SoloKitchen', channel_subscribers: 4_800,
    views: 1_240_000, likes: 62_000, published_at: new Date(Date.now() - 86400_000 * 12).toISOString(),
    duration_seconds: 612,
    outlier_score: 6.8, views_per_sub: 258, winnable_score: 84,
    winnable_breakdown: {
      channel_size: { ratio: 0.9, hint: 'Same league as you' },
      niche_overlap: { matches: ['side hustle', 'passive income'], hint: 'Direct niche match' },
      recency:      { days_old: 12, hint: 'Fresh enough to ride' },
    },
    pattern_tag: 'Replicable',
    why_now: 'Search interest for "passive income product 2026" doubled in the last 30 days.',
    why_worked: 'Concrete dollar number in the title + a 7-day deadline creates urgency. The thumbnail uses red text on white for high contrast against typical finance thumbs.',
    quick_actions: ['Lead the title with a concrete number', 'Open with the result, not the journey'],
    is_niche_matched: true,
  },
  {
    video_id: 'dQw4w9WgXcQ', title: 'The boring side hustle making me $4k/mo (no camera needed)',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    channel_id: 'UCbudget', channel_name: 'BudgetEats', channel_subscribers: 11_200,
    views: 812_400, likes: 38_900, published_at: new Date(Date.now() - 86400_000 * 6).toISOString(),
    duration_seconds: 482,
    outlier_score: 4.4, views_per_sub: 72, winnable_score: 71,
    winnable_breakdown: {
      channel_size: { ratio: 1.2, hint: 'Slightly bigger than you' },
      niche_overlap: { matches: ['side hustle'], hint: 'Partial niche match' },
      recency:      { days_old: 6, hint: 'Just dropped, surf it' },
    },
    pattern_tag: 'Trending',
    why_now: 'No competitor has shipped a "no camera" angle this quarter.',
    why_worked: '"Boring" disarms hype-skepticism. The dollar amount is specific not round. "No camera needed" removes the biggest objection upfront.',
    quick_actions: ['Use a specific dollar amount, not "I made money"', 'Address the camera objection in the title'],
    is_niche_matched: true,
  },
  {
    video_id: 'dQw4w9WgXcQ', title: '5 cheap dinners I cook every week (under $4 each)',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    channel_id: 'UCpennyplate', channel_name: 'PennyPlate', channel_subscribers: 28_500,
    views: 480_000, likes: 22_400, published_at: new Date(Date.now() - 86400_000 * 22).toISOString(),
    duration_seconds: 521,
    outlier_score: 3.1, views_per_sub: 17, winnable_score: 64,
    winnable_breakdown: {
      channel_size: { ratio: 2.4, hint: 'A step ahead of you' },
      niche_overlap: { matches: ['budget cooking'], hint: 'Partial niche match' },
      recency:      { days_old: 22, hint: 'Still in the trend window' },
    },
    pattern_tag: 'Lucky',
    why_now: 'Q1 grocery prices are up — the audience is actively searching.',
    why_worked: 'Numbered list + dollar cap is a classic budget cooking pattern. The "I cook every week" framing makes it feel personal not curated.',
    quick_actions: ['Frame as a routine, not a one-off recipe', 'Cap your price in the title'],
    is_niche_matched: false,
  },
  {
    video_id: 'dQw4w9WgXcQ', title: 'My morning routine making $200 a day (Notion template inside)',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    channel_id: 'UCmorning', channel_name: 'MorningProductive', channel_subscribers: 91_000,
    views: 322_000, likes: 14_100, published_at: new Date(Date.now() - 86400_000 * 9).toISOString(),
    duration_seconds: 388,
    outlier_score: 2.7, views_per_sub: 3.5, winnable_score: 52,
    winnable_breakdown: {
      channel_size: { ratio: 7.6, hint: 'Much larger channel' },
      niche_overlap: { matches: ['side hustle'], hint: 'Partial niche match' },
      recency:      { days_old: 9, hint: 'Riding the wave' },
    },
    pattern_tag: 'Replicable',
    why_now: '"Notion template inside" is the new "free download" hook converting at 3-4x normal CTR.',
    why_worked: 'Routine + dollar + free deliverable is the trifecta. Notion templates currently overperform PDFs by ~40% in this niche.',
    quick_actions: ['Pair every video with a tangible deliverable', 'Use Notion not PDF for templates'],
    is_niche_matched: true,
  },
]

const CHANNELS = [
  {
    channel_id: 'UCbreakout1', channel_name: 'IndieCreatorGuide', handle: '@indiecreatorguide',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    description: 'Real numbers from real indie creators. Side hustles, dev tools, weekly drops.',
    subscribers: 18_400, video_count: 64, videos_in_search: 3, avg_views_per_video: 124_000,
    outlier_score: 6.6, top_video_id: 'dQw4w9WgXcQ',
    top_video_thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    why_this_channel: 'Three videos in the top-50 outliers for "passive income product", all from a sub-20K channel — they have a repeatable pattern your size can borrow.',
    what_to_do: ['Borrow the "real numbers" framing on at least one title this quarter', 'Match their weekly cadence for 4 weeks to see if it sticks'],
    why_now: 'Their last 4 videos all 3x+ outliers — this channel is currently surging.',
    is_niche_matched: true,
  },
]

const RESULT = {
  videos: VIDS,
  channels: CHANNELS,
  cohort: { pool_size: 247, vertical: 'Side-hustle / indie business', query: 'passive income product' },
  pattern_synthesis: {
    the_pattern: 'Concrete dollar amount + short deadline + named tool / template / system. Five of the top eight outliers in this cohort follow this scaffold.',
    next_move: {
      title_scaffold: 'I [verb] a [tool] in [N days] (made $X)',
      format_spec:    '6-10 min long-form, hand-held b-roll, numbered chapters',
      opening_hook:   'Open with the result on screen for the first 3 seconds, defer the story.',
      why_now:        'Search demand for "in X days" deadline framings is up 60% QoQ.',
    },
  },
  thumbnail_patterns: {
    dominant_style: 'Red text overlay on white, face top-left, single product shot top-right',
    text_overlay: 'Yes — 2-4 words, red on white, 96-128px caps',
    face_presence: 'Yes — 30-40% of the frame, eyes contacting camera',
    color_palette: 'Red accent + white background + one supporting brand color',
    layout_pattern: 'Two-column: face left, headline + product right',
    recommendations: [
      'Use red on white for any dollar-amount titles',
      'Show the tool/product in-frame, not just talking head',
      'Keep text under 4 words',
    ],
    why_now: 'Audience expects to see the product, not just the creator, since Q1 thumbnails shifted toward product-first.',
    sample_size: 12,
  },
  keyword_scores: { 'passive income product': 0.92, 'side hustle dev tool': 0.78, 'indie creator': 0.71 },
  message: 'Search complete · 247 videos analysed · 4 outliers surfaced',
}

const INTENT_OPTIONS = [
  { keyword: 'passive income product',  label: 'Building digital products',      description: 'Indie creators shipping tools, templates, courses. Engineering + business angle.' },
  { keyword: 'passive income strategy', label: 'Investing for passive income',  description: 'Dividend stocks, real estate, financial-independence audience.' },
  { keyword: 'side hustle income',      label: 'Side hustles + gig work',       description: 'Income-stacking content, freelance gigs, second jobs.' },
]

const REPORTS = [
  { id: 'r1', query: 'passive income product',  confirmed_keyword: 'Building digital products',   updated_at: new Date(Date.now() - 86400_000 * 2).toISOString(),  result: RESULT },
  { id: 'r2', query: 'home gym workout',        confirmed_keyword: 'Bodyweight at-home routines', updated_at: new Date(Date.now() - 86400_000 * 11).toISOString(), result: { ...RESULT, videos: VIDS.slice(0, 2), channels: [] } },
  { id: 'r3', query: 'starting a small business', confirmed_keyword: 'Solo entrepreneur side-hustle', updated_at: new Date(Date.now() - 86400_000 * 30).toISOString(), result: { ...RESULT, videos: VIDS.slice(0, 1), channels: [] } },
]

// ── mock fetch ────────────────────────────────────────────────────────

const origFetch = window.fetch
window.fetch = async (url, opts) => {
  const u = String(url)
  const method = (opts && opts.method) || 'GET'
  if (u.includes('/outliers/cache')) {
    if (stateMode === 'results-videos' || stateMode === 'results-channels' || stateMode === 'detail-modal') {
      // Page expects { cached: <result-with-query> }. setResult(d.cached)
      // and setQuery(d.cached.query) at Outliers.jsx ~577.
      return new Response(JSON.stringify({ cached: { ...RESULT, query: 'passive income product' } }),
        { headers: { 'Content-Type': 'application/json' } })
    }
    return new Response(JSON.stringify({ cached: null }), { headers: { 'Content-Type': 'application/json' } })
  }
  if (u.includes('/outliers/reports') && method !== 'DELETE') {
    return new Response(JSON.stringify({ reports: REPORTS }), { headers: { 'Content-Type': 'application/json' } })
  }
  if (u.includes('/outliers/intent')) {
    return new Response(JSON.stringify({ options: INTENT_OPTIONS }), { headers: { 'Content-Type': 'application/json' } })
  }
  if (u.includes('/outliers/search')) {
    return new Response(JSON.stringify(RESULT), { headers: { 'Content-Type': 'application/json' } })
  }
  return origFetch(url, opts)
}

// ── drive each state ──────────────────────────────────────────────────

if (stateMode === 'results-channels') {
  try { localStorage.setItem('outliers_tab', 'channel') } catch {}
} else {
  try { localStorage.setItem('outliers_tab', 'video') } catch {}
}

setTimeout(() => {
  if (stateMode === 'intent-picker') {
    const inp = document.querySelector('input[type="text"], input:not([type])')
    if (inp) {
      const proto = Object.getPrototypeOf(inp)
      const desc  = Object.getOwnPropertyDescriptor(proto, 'value')
      desc.set.call(inp, 'passive income product')
      inp.dispatchEvent(new Event('input', { bubbles: true }))
      const btn = Array.from(document.querySelectorAll('button')).find(b => /find outliers/i.test(b.textContent || ''))
      if (btn) btn.click()
    }
  } else if (stateMode === 'detail-modal') {
    setTimeout(() => {
      const card = document.querySelector('.out-grid-card, .out-result-card')
      if (card) card.click()
    }, 320)
  } else if (stateMode === 'reports') {
    const btn = Array.from(document.querySelectorAll('button')).find(b => /^reports?\b/i.test(b.textContent || ''))
    if (btn) btn.click()
  }
}, 280)

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement('div', {
    style: { padding: '36px 24px', boxSizing: 'border-box', background: 'var(--yd-paper)', minHeight: '100vh' },
  },
    React.createElement(Outliers, {
      plan: 'pro',
      freeTierFeatures: { outliers: 'allowed' },
      channelData: { channel_id: 'UCdemo', channel_name: 'Demo Channel', subscriber_count: 8_400 },
    })
  )
)
