/*
 * Preview harness for Competitors. Mounts the component standalone with
 * mocked fetch + localStorage so I can render every state and screenshot
 * via Playwright before shipping any design change.
 *
 * Query params:
 *   ?state=search-empty     — search tab, never searched
 *   ?state=search-results   (default) — search tab with results
 *   ?state=tracked-empty    — tracked tab, no tracked competitors
 *   ?state=tracked          — tracked tab with 3 mocked tracked competitors (closed)
 *   ?state=tracked-open     — tracked tab, first competitor expanded
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import Competitors from './src/pages/Competitors.jsx'

const params    = new URLSearchParams(window.location.search)
const stateMode = params.get('state') || 'search-results'

// ── mocked tracked analyses (rich AI shape) ──
function trackedSeed() {
  return [
    {
      competitor: {
        channel_id: 'UCabc1',
        channel_name: 'Moureen Ngigi',
        thumbnail: 'https://yt3.googleusercontent.com/ytc/AIdro_kMR-4cElBYJtJZW6jJ2v9G2YBOe2qj1y3WUJZxR4ldNw=s176-c-k-c0x00ffffff-no-rj',
        subscribers: 268_000,
        avg_views_per_video: 56_300,
        top_5_videos: [
          { video_id: 'v1', title: 'I spent 24 hours in a Nairobi 2-bedroom — what no one tells you', views: 412_000, published_at: new Date(Date.now() - 86400_000 * 6).toISOString(), thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg' },
          { video_id: 'v2', title: 'Why every Kenyan creator is moving to TikTok in 2026', views: 287_000, published_at: new Date(Date.now() - 86400_000 * 16).toISOString(), thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg' },
          { video_id: 'v3', title: 'My honest review of working from Westlands cafés', views: 198_400, published_at: new Date(Date.now() - 86400_000 * 28).toISOString(), thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg' },
          { video_id: 'v4', title: 'Living alone in Nairobi at 24 — the real cost', views: 156_800, published_at: new Date(Date.now() - 86400_000 * 42).toISOString(), thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg' },
          { video_id: 'v5', title: 'A week of meals on a 5K budget (Kenya 2026)', views: 124_700, published_at: new Date(Date.now() - 86400_000 * 60).toISOString(), thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg' },
        ],
      },
      ai_analysis: {
        threatLevel: 'high',
        competitorSummary: 'Moureen runs a high-cadence Nairobi lifestyle channel. Her audience overlap with yours is roughly 65 percent based on shared title patterns and tracked competitor signals.',
        threatReason: 'She is publishing 2x a week and pulling consistent algorithmic spikes on Nairobi-living content, the exact niche your channel sits in.',
        gapsToExploit: [
          { gap: 'Budget meal series', howToCapture: 'Pair recipe walkthrough with a weekly cost breakdown' },
          { gap: 'Apartment tours under 50K rent', howToCapture: 'Walk through 3 listings, name landlords, share contacts' },
          { gap: 'Honest cafe reviews with wifi speed tests', howToCapture: 'Speedtest screenshot in the thumbnail' },
        ],
        topVideosToStudy: [
          { title: 'I spent 24 hours in a Nairobi 2-bedroom', whyItWorked: 'Specific number in the title plus the city anchor pulls click-through above 8 percent in this niche.' },
          { title: 'Why every Kenyan creator is moving to TikTok', whyItWorked: 'Polarising framing on a peer-group anxiety, picked up by algorithm.' },
        ],
        topTopics: [
          { topic: 'Apartment + city life', avgViews: 234_000, videoCount: 8 },
          { topic: 'Budgeting + cost transparency', avgViews: 168_500, videoCount: 6 },
          { topic: 'Productivity from cafes', avgViews: 92_000, videoCount: 4 },
        ],
        postingBehavior: { avgGapDays: 4, bestDay: 'Sat', bestHour: '6pm', consistencyScore: 82 },
        videoIdeas: [
          { title: 'I lived in a Kilimani 1-bed for 30 days, here is the real cost', targetKeyword: 'kilimani apartment cost', angle: 'Beats her without competing on volume' },
          { title: 'The 5 cafes in Nairobi actually worth working from (with wifi speeds)', targetKeyword: 'nairobi cafe wifi', angle: 'Speedtest screenshots = unbeatable thumbnail' },
          { title: 'Honest review: 3 budget apartment tours under 50K rent', targetKeyword: 'nairobi apartment under 50k', angle: 'Specific price anchor' },
          { title: 'A week of meals on a 5K Kenyan budget', targetKeyword: 'budget meals kenya', angle: 'Numeric promise + relatable cost' },
        ],
        titlePatterns: {
          avgTitleLength: 58,
          dominantFormats: ['Specific-number + city anchor', '"Honest review" framing', 'Peer-group anxiety hooks'],
          topKeywords: ['nairobi', 'kenya', 'apartment', 'budget', 'review'],
          powerWordsUsed: ['honest', 'real', 'actually', 'every'],
        },
        videoLengthInsight: 'Videos average 11 minutes. Long enough for ad breaks, short enough to retain.',
        engagementInsight: 'Comments per 1K views run 2.3x niche median. She replies in the first 6 hours.',
        thumbnailPattern: 'Faces + bold yellow caption + price/number anchor. Same template 4 out of 5 uploads.',
        winningMoves: [
          'Cluster around Nairobi-living cost transparency — She owns this angle and viewers come back weekly',
          'Publish twice a week minimum — Her consistency floor is what keeps her in algorithmic favor',
        ],
      },
      savedAt: new Date(Date.now() - 86400_000 * 3).toISOString(),
    },
    {
      competitor: {
        channel_id: 'UCabc2',
        channel_name: 'Nairofey Official',
        thumbnail: 'https://yt3.googleusercontent.com/ytc/AIdro_kMR-4cElBYJtJZW6jJ2v9G2YBOe2qj1y3WUJZxR4ldNw=s176-c-k-c0x00ffffff-no-rj',
        subscribers: 84_400,
        avg_views_per_video: 18_900,
        top_5_videos: [],
      },
      ai_analysis: {
        threatLevel: 'medium',
        competitorSummary: 'Lifestyle and beauty channel with strong consistency.',
        threatReason: '',
        gapsToExploit: [{ gap: 'Skincare routines under 1K', howToCapture: '' }, { gap: 'Apartment styling', howToCapture: '' }],
        topVideosToStudy: [],
        topTopics: [],
      },
      savedAt: new Date(Date.now() - 86400_000 * 12).toISOString(),
    },
    {
      competitor: {
        channel_id: 'UCabc3',
        channel_name: 'Wanjeri Mbugua',
        thumbnail: '',
        subscribers: 12_300,
        avg_views_per_video: 4_200,
        top_5_videos: [],
      },
      ai_analysis: {
        threatLevel: 'low',
        competitorSummary: 'Smaller channel, niche audience.',
        threatReason: '',
        gapsToExploit: [{ gap: 'Pet care in Kenya', howToCapture: '' }],
        topVideosToStudy: [],
        topTopics: [],
      },
      savedAt: new Date(Date.now() - 86400_000 * 30).toISOString(),
    },
  ]
}

// Seed localStorage for the tracked states so the page boots into them.
const LS_KEY = 'ytgrowth_tracked_competitors'
if (stateMode === 'tracked' || stateMode === 'tracked-open') {
  localStorage.setItem(LS_KEY, JSON.stringify(trackedSeed()))
} else if (stateMode === 'tracked-empty') {
  localStorage.setItem(LS_KEY, '[]')
} else {
  // Search states — start with empty tracked.
  localStorage.setItem(LS_KEY, '[]')
}

// Mock fetch for /competitors/* endpoints.
const origFetch = window.fetch
window.fetch = async (url, opts) => {
  const u = String(url)
  if (u.includes('/competitors/tracked')) {
    return new Response(JSON.stringify({ tracked: [] }), { headers: { 'Content-Type': 'application/json' } })
  }
  if (u.includes('/competitors/search')) {
    if (stateMode === 'search-empty') {
      return new Response(JSON.stringify({ results: [] }), { headers: { 'Content-Type': 'application/json' } })
    }
    return new Response(JSON.stringify({
      results: [
        { channel_id: 'UCres1', channel_name: 'Moureen Ngigi',     thumbnail: 'https://yt3.googleusercontent.com/ytc/AIdro_kMR-4cElBYJtJZW6jJ2v9G2YBOe2qj1y3WUJZxR4ldNw=s176-c-k-c0x00ffffff-no-rj', description: 'Nairobi lifestyle, budget tips, apartment tours' },
        { channel_id: 'UCres2', channel_name: 'Nairofey Official',  thumbnail: 'https://yt3.googleusercontent.com/ytc/AIdro_kMR-4cElBYJtJZW6jJ2v9G2YBOe2qj1y3WUJZxR4ldNw=s176-c-k-c0x00ffffff-no-rj', description: 'Beauty and lifestyle from Nairobi' },
        { channel_id: 'UCres3', channel_name: 'Wanjeri Mbugua',     thumbnail: '',                                                                                                                            description: 'Pet care, Kenyan home tips' },
      ],
    }), { headers: { 'Content-Type': 'application/json' } })
  }
  return origFetch(url, opts)
}

// Helper to click a tab by its visible label. Used to swap to the
// Tracked tab for tracked-* states since the component itself defaults
// to 'search'.
function clickTabContaining(text) {
  const tabs = Array.from(document.querySelectorAll('.comp-tab-btn'))
  const target = tabs.find(b => (b.textContent || '').includes(text))
  if (target) target.click()
}

// After mount: drive the page into the requested state.
setTimeout(() => {
  if (stateMode === 'search-results') {
    const inp = document.querySelector('.comp-input')
    if (inp) {
      inp.value = 'nairobi'
      inp.dispatchEvent(new Event('input', { bubbles: true }))
      const btn = document.querySelector('.comp-btn-primary')
      if (btn) btn.click()
    }
  } else if (stateMode === 'tracked' || stateMode === 'tracked-empty') {
    clickTabContaining('Tracked')
  } else if (stateMode === 'tracked-open') {
    clickTabContaining('Tracked')
    // Wait for the tab swap to render, then click the first row.
    setTimeout(() => {
      const firstHeader = document.querySelector('.comp-accordion-header')
      if (firstHeader) firstHeader.click()
    }, 180)
  }
}, 200)

// Preview wrapper: gray bg + vertical padding only. No max-width here —
// the Competitors page constrains itself via .comp-page (1040 max).
ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement('div', {
    style: { padding: '36px 24px', boxSizing: 'border-box', background: '#0a0a0c', minHeight: '100vh' }
  },
    React.createElement(Competitors, {
      plan: 'pro',
      freeTierFeatures: { competitors: 'allowed' },
    })
  )
)
