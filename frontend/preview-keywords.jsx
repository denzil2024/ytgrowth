/*
 * Preview harness for Keywords. Mounts the component standalone with
 * mocked fetch and intercepts the various API routes so every visible
 * state renders without a backend.
 *
 * Query params:
 *   ?state=empty            — landed, no keyword typed yet (default)
 *   ?state=intent-picker    — user submitted a keyword, intent options visible
 *   ?state=results          — full research output (top pick, ranked, clusters)
 *   ?state=detail-modal     — results state + first keyword row clicked open
 *   ?state=reports          — reports tab with 3 past reports
 *   ?state=reports-empty    — reports tab with nothing saved
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import Keywords from './src/pages/Keywords.jsx'

const params = new URLSearchParams(window.location.search)
const stateMode = params.get('state') || 'empty'

// ── full mocked result (used by results, detail-modal, reports states) ──
const RESULT = {
  topPick: {
    keyword: 'budget cooking for one',
    opportunityScore: 78,
    whyThisOne: 'High exact-intent match with low subscriber competition in the top 5 — momentum signals show the niche is rising.',
  },
  seedIntent: {
    primaryIntent: 'Discovery',
    contentTypeExpected: 'Recipe walkthrough',
    funnelStage: 'Awareness',
    intentSummary: 'Viewers are early-funnel, looking for ideas they can replicate this week.',
  },
  keywords: [
    {
      keyword: 'budget cooking for one', opportunityScore: 78, intentMatch: 'exact', momentum: 'active',
      competition: {
        top_subs_median: 180_000, top_views_median: 780_000, all_views_median: 65_000, days_since_newest: 14,
        top_videos: [
          { video_id: 'dQw4w9WgXcQ', title: '$20 Grocery Haul + 5 Easy Dinners for One', channel_title: 'SoloKitchen', published_at: new Date(Date.now() - 86400_000 * 6).toISOString(),  views: 412_000, thumbnail_url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
          { video_id: 'dQw4w9WgXcQ', title: 'I Cooked Every Meal for Myself for a Week — Here is the Cost', channel_title: 'BudgetEats', published_at: new Date(Date.now() - 86400_000 * 14).toISOString(), views: 287_000, thumbnail_url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
          { video_id: 'dQw4w9WgXcQ', title: 'Honest Single-Person Meal Plan: 7 dinners under $4', channel_title: 'PennyPlate', published_at: new Date(Date.now() - 86400_000 * 28).toISOString(), views: 198_400, thumbnail_url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
        ],
        // 12-week weekly bucket counts. Rising trend so the chart paints green
        // and the caption reads "niche heating up".
        publishing_timeline: (() => {
          const counts = [2, 3, 1, 4, 3, 5, 4, 6, 5, 7, 8, 6]
          const monday = new Date()
          monday.setUTCHours(0, 0, 0, 0)
          monday.setUTCDate(monday.getUTCDate() - monday.getUTCDay() + 1)
          return counts.map((c, i) => {
            const d = new Date(monday)
            d.setUTCDate(monday.getUTCDate() - (11 - i) * 7)
            return { week_start: d.toISOString().slice(0, 10), count: c }
          })
        })(),
      },
    },
    { keyword: 'cheap meals one person',         opportunityScore: 71, intentMatch: 'strong',  momentum: 'unclaimed', competition: { top_subs_median: 95_000,  top_views_median: 46_000,  days_since_newest: 210, top_videos: [] } },
    { keyword: 'one pot meals on a budget',      opportunityScore: 68, intentMatch: 'exact',   momentum: 'steady',    competition: { top_subs_median: 320_000, top_views_median: 124_000, days_since_newest: 36,  top_videos: [] } },
    { keyword: 'student dinners under 5 dollars', opportunityScore: 64, intentMatch: 'strong', momentum: 'active',    competition: { top_subs_median: 60_000,  top_views_median: 28_000,  days_since_newest: 22,  top_videos: [] } },
    { keyword: 'budget meal prep',                opportunityScore: 58, intentMatch: 'partial', momentum: 'steady',   competition: { top_subs_median: 1_200_000, top_views_median: 412_000, days_since_newest: 7, top_videos: [] } },
    { keyword: '5 dollar dinner ideas',           opportunityScore: 52, intentMatch: 'strong', momentum: 'unclaimed', competition: { top_subs_median: 78_000,  top_views_median: 34_000, days_since_newest: 190, top_videos: [] } },
    { keyword: 'pantry cooking ideas',            opportunityScore: 49, intentMatch: 'partial', momentum: 'steady',   competition: { top_subs_median: 240_000, top_views_median: 88_000,  days_since_newest: 51,  top_videos: [] } },
    { keyword: 'broke college student meals',     opportunityScore: 46, intentMatch: 'strong', momentum: 'active',    competition: { top_subs_median: 42_000,  top_views_median: 21_000,  days_since_newest: 18,  top_videos: [] } },
    { keyword: 'cooking on $20 a week',           opportunityScore: 41, intentMatch: 'exact',  momentum: 'unclaimed', competition: { top_subs_median: 110_000, top_views_median: 52_000,  days_since_newest: 240, top_videos: [] } },
    { keyword: 'no money grocery haul',           opportunityScore: 36, intentMatch: 'partial', momentum: 'steady',   competition: { top_subs_median: 1_800_000, top_views_median: 680_000, days_since_newest: 11, top_videos: [] } },
  ],
  clusters: [
    { clusterName: 'Single-person recipes',  keywords: ['budget cooking for one', 'cheap meals one person', 'cooking for yourself'] },
    { clusterName: 'Student-budget meals',    keywords: ['student dinners under 5 dollars', 'broke college student meals', 'dorm room cooking'] },
    { clusterName: 'Pantry-only cooking',     keywords: ['pantry cooking ideas', 'use what you have meals', 'no grocery cooking'] },
    { clusterName: 'Weekly meal-prep packs',  keywords: ['budget meal prep', 'meal prep on a tight budget', 'one-week meal plan'] },
  ],
}

const INTENT_OPTIONS = [
  { keyword: 'budget cooking for one',        label: 'Cooking for one person',  description: 'Recipes and meal ideas scaled for single-serving cooking on a budget.' },
  { keyword: 'cheap meals to cook at home',   label: 'Cheap home cooking',      description: 'General budget cooking content, family-sized portions.' },
  { keyword: 'budget grocery shopping tips',  label: 'Grocery shopping advice', description: 'Money-saving tips for grocery runs, not cooking-focused.' },
]

const REPORTS = [
  { id: 'r1', keyword: 'budget cooking for one',    confirmed_keyword: 'Cooking for one person', updated_at: new Date(Date.now() - 86400_000 * 2).toISOString(), result: RESULT },
  { id: 'r2', keyword: 'home gym workout no equipment', confirmed_keyword: 'Bodyweight-only routines', updated_at: new Date(Date.now() - 86400_000 * 9).toISOString(), result: { ...RESULT, keywords: RESULT.keywords.slice(0, 6), clusters: RESULT.clusters.slice(0, 3) } },
  { id: 'r3', keyword: 'starting a small business',  confirmed_keyword: 'Solo entrepreneur side-hustle', updated_at: new Date(Date.now() - 86400_000 * 24).toISOString(), result: { ...RESULT, keywords: RESULT.keywords.slice(0, 4), clusters: RESULT.clusters.slice(0, 2) } },
]

// Pre-seed localStorage so the results state boots with a result.
const LS_KEY = 'ytg_keywords_v1'
if (stateMode === 'results' || stateMode === 'detail-modal') {
  localStorage.setItem(LS_KEY, JSON.stringify({ keyword: 'budget cooking for one', result: RESULT }))
} else {
  localStorage.removeItem(LS_KEY)
}

// Mock fetch for /keywords/* endpoints.
const origFetch = window.fetch
window.fetch = async (url, opts) => {
  const u = String(url)
  if (u.includes('/keywords/reports') && (!opts || opts.method !== 'DELETE')) {
    const payload = stateMode === 'reports-empty' ? { reports: [] } : { reports: REPORTS }
    return new Response(JSON.stringify(payload), { headers: { 'Content-Type': 'application/json' } })
  }
  if (u.includes('/keywords/intent-options')) {
    return new Response(JSON.stringify({ options: INTENT_OPTIONS }), { headers: { 'Content-Type': 'application/json' } })
  }
  if (u.includes('/keywords/research')) {
    return new Response(JSON.stringify(RESULT), { headers: { 'Content-Type': 'application/json' } })
  }
  return origFetch(url, opts)
}

// Drive the page into the requested state after mount.
setTimeout(() => {
  if (stateMode === 'intent-picker') {
    const inp = document.querySelector('.kw-input')
    if (inp) {
      // Use the native value setter so React's controlled-input tracker
      // picks up the change. inp.value = 'x' alone won't trigger setState.
      const proto = Object.getPrototypeOf(inp)
      const desc  = Object.getOwnPropertyDescriptor(proto, 'value')
      desc.set.call(inp, 'budget cooking for one')
      inp.dispatchEvent(new Event('input', { bubbles: true }))
      const btn = document.querySelector('.kw-btn-primary')
      if (btn) btn.click()
    }
  } else if (stateMode === 'detail-modal') {
    // Click the first keyword row to open the playbook modal.
    setTimeout(() => {
      const row = document.querySelector('.kw-row-seo')
      if (row) row.click()
    }, 240)
  } else if (stateMode === 'reports' || stateMode === 'reports-empty') {
    const tabs = Array.from(document.querySelectorAll('.kw-tab-btn'))
    const reports = tabs.find(b => (b.textContent || '').toLowerCase().includes('report'))
    if (reports) reports.click()
  }
}, 240)

// Preview wrapper: gray bg + vertical padding. No max-width — the
// Keywords page should self-cap (it does not today; that's part of the
// rebuild brief and one of the things this harness will surface).
ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement('div', {
    style: { padding: '36px 24px', boxSizing: 'border-box', background: '#0e0e10', minHeight: '100vh' },
  },
    React.createElement(Keywords, {
      plan: 'pro',
      freeTierFeatures: { keywords: 'allowed' },
    })
  )
)
