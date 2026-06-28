/*
 * Preview harness for the public YoutubeKeywordResearch tool.
 * Mocks /api/keyword-tool/lookup and /api/keyword-tool/popular so every
 * state renders without a backend.
 *
 * Query params:
 *   ?state=empty    — landed, hero + search only (default)
 *   ?state=results  — full research output for a sample keyword
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import YoutubeKeywordResearch from './src/pages/tools/YoutubeKeywordResearch.jsx'

const params = new URLSearchParams(window.location.search)
const stateMode = params.get('state') || 'empty'

const daysAgo = (d) => new Date(Date.now() - 86400_000 * d).toISOString()

const LOOKUP = {
  keyword: 'stock market for beginners',
  has_volume: true,
  overview: {
    opportunity: 78,
    volume: 40_000,
    competition: 'Medium',
    view_ceiling: 320_000,
    days_since_newest: 240,
    trend: [22, 24, 23, 26, 28, 27, 30, 33, 31, 36, 38, 41],
    top_videos: [
      { video_id: 'a', title: 'Stock Market For Beginners: The Complete 2026 Starter Guide', views: 410_000, published_at: daysAgo(240), thumbnail_url: 'https://i.ytimg.com/vi/Xn7KWR9EOGQ/mqdefault.jpg' },
      { video_id: 'b', title: 'How To Invest In Stocks, Step By Step For Total Beginners', views: 288_000, published_at: daysAgo(330), thumbnail_url: 'https://i.ytimg.com/vi/86Z9Mc3Dn-4/mqdefault.jpg' },
      { video_id: 'c', title: 'Investing 101: Everything A Beginner Needs To Know First', views: 1_100_000, published_at: daysAgo(510), thumbnail_url: 'https://i.ytimg.com/vi/lNdOtlpwH4U/mqdefault.jpg' },
      { video_id: 'd', title: 'The Stock Market Explained Simply In 12 Minutes', views: 196_000, published_at: daysAgo(270), thumbnail_url: 'https://i.ytimg.com/vi/p7HKvqRI_Bo/mqdefault.jpg' },
    ],
  },
  suggestions: [
    { keyword: 'stock market for beginners over 40', volume: 6_600,  competition: 'Low',    opportunity: 86, specificity: 'long-tail', highIntent: true },
    { keyword: 'how to read stock charts for beginners', volume: 12_000, competition: 'Low', opportunity: 81, specificity: 'long-tail' },
    { keyword: 'stock market basics for dummies', volume: 8_100, competition: 'Low', opportunity: 79, specificity: 'long-tail' },
    { keyword: 'stock market for beginners', volume: 40_000, competition: 'Medium', opportunity: 78, specificity: 'specific' },
    { keyword: 'how does the stock market work', volume: 27_000, competition: 'Low', opportunity: 74, specificity: 'specific' },
    { keyword: 'investing for beginners', volume: 60_000, competition: 'Medium', opportunity: 70, specificity: 'specific' },
    { keyword: 'index funds explained', volume: 22_000, competition: 'Low', opportunity: 69, specificity: 'specific' },
    { keyword: 'stock market for teenagers', volume: 5_400, competition: 'Low', opportunity: 68, specificity: 'long-tail' },
    { keyword: 'how to buy your first stock', volume: 14_000, competition: 'Medium', opportunity: 66, specificity: 'long-tail', highIntent: true },
    { keyword: 'stock market explained', volume: 33_000, competition: 'Medium', opportunity: 64, specificity: 'specific' },
    { keyword: 'what is a dividend', volume: 18_000, competition: 'Low', opportunity: 63, specificity: 'specific' },
    { keyword: 'stock market crash explained', volume: 9_900, competition: 'Medium', opportunity: 61, specificity: 'long-tail' },
    { keyword: 'how to start investing with little money', volume: 21_000, competition: 'Medium', opportunity: 58, specificity: 'long-tail', highIntent: true },
    { keyword: 'best investing apps', volume: 49_000, competition: 'High', opportunity: 54, specificity: 'specific' },
    { keyword: 'compound interest explained', volume: 16_000, competition: 'Medium', opportunity: 52, specificity: 'specific' },
    { keyword: 'how to invest in stocks', volume: 90_000, competition: 'High', opportunity: 48, specificity: 'specific', highIntent: true },
    { keyword: 'roth ira for beginners', volume: 31_000, competition: 'Medium', opportunity: 46, specificity: 'specific' },
    { keyword: 'day trading for beginners', volume: 74_000, competition: 'High', opportunity: 41, specificity: 'specific' },
    { keyword: 'how to make money in stocks', volume: 40_000, competition: 'High', opportunity: 38, specificity: 'specific' },
    { keyword: 'best stocks to buy now', volume: 110_000, competition: 'High', opportunity: 34, specificity: 'broad' },
    { keyword: 'penny stocks to watch', volume: 55_000, competition: 'High', opportunity: 29, specificity: 'specific' },
    { keyword: 'stock market today', volume: 240_000, competition: 'High', opportunity: 22, specificity: 'broad' },
  ],
  questions: [
    'how does the stock market work',
    'is the stock market a good investment',
    'how much money do i need to start investing',
    'what is a good first stock to buy',
    'can you lose all your money in stocks',
  ],
}

const POPULAR = [
  { keyword: 'how to start a podcast',          competition: 'Low',    top_views_median: 180_000 },
  { keyword: 'faceless youtube channel ideas',  competition: 'Medium', top_views_median: 240_000 },
  { keyword: 'how to edit videos',              competition: 'Low',    top_views_median: 95_000 },
  { keyword: 'best camera for youtube',         competition: 'High',   top_views_median: 410_000 },
  { keyword: 'passive income ideas',            competition: 'High',   top_views_median: 520_000 },
  { keyword: 'home workout no equipment',       competition: 'Low',    top_views_median: 130_000 },
  { keyword: 'study with me',                   competition: 'Medium', top_views_median: 88_000 },
  { keyword: 'ai tools for beginners',          competition: 'Medium', top_views_median: 160_000 },
  { keyword: 'minecraft building ideas',        competition: 'High',   top_views_median: 300_000 },
]

// Production today: Keyword Planner is pending, so volume/opportunity/trend are
// null; competition/view-ceiling/top-videos exist only for cached popular terms.
// ?state=prod  -> cached popular seed (comp + ceiling + videos, no volume/score)
// ?state=bare  -> nothing cached (keyword ideas only)
function shapeForState(mode) {
  if (mode !== 'prod' && mode !== 'bare') return LOOKUP
  const strip = s => ({ ...s, volume: null, opportunity: null, competition: null })
  const ov = { ...LOOKUP.overview, volume: null, opportunity: null, trend: [] }
  if (mode === 'bare') {
    return { ...LOOKUP, has_volume: false,
      overview: { ...ov, competition: null, view_ceiling: null, days_since_newest: null, top_videos: [] },
      suggestions: LOOKUP.suggestions.map(strip) }
  }
  // prod: seed is a cached popular term
  return { ...LOOKUP, has_volume: false, overview: ov,
    suggestions: LOOKUP.suggestions.map((s, i) => i % 3 === 0 ? { ...s, volume: null, opportunity: null } : strip(s)) }
}

const origFetch = window.fetch
window.fetch = async (url, opts) => {
  const u = String(url)
  if (u.includes('/api/keyword-tool/popular')) {
    return new Response(JSON.stringify({ keywords: POPULAR }), { headers: { 'Content-Type': 'application/json' } })
  }
  if (u.includes('/api/keyword-tool/lookup')) {
    return new Response(JSON.stringify(shapeForState(stateMode)), { headers: { 'Content-Type': 'application/json' } })
  }
  return origFetch(url, opts)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement(YoutubeKeywordResearch)
)

// Drive into results state after mount.
if (stateMode !== 'empty') {
  setTimeout(() => {
    const inp = document.querySelector('.kwt-input')
    if (inp) {
      const proto = Object.getPrototypeOf(inp)
      const desc = Object.getOwnPropertyDescriptor(proto, 'value')
      desc.set.call(inp, 'stock market for beginners')
      inp.dispatchEvent(new Event('input', { bubbles: true }))
      const btn = document.querySelector('.kwt-btn')
      if (btn) btn.click()
    }
  }, 300)
}
