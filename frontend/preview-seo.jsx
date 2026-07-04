/* SEO Studio standalone preview — light editorial.
   URL param drives which state renders:
     (none)          → idle editor
     ?view=results   → full analysis results (hero, momentum, intent, niche heat, suggestions, keywords)
     ?view=desc      → results + description optimizer with generated descriptions
     ?tab=reports     → Reports list (harness also clicks the tab)
   Results are seeded straight into localStorage so loadSaved() restores them
   with zero fetch, which is why the whole results view renders offline. */
import React from 'react'
import ReactDOM from 'react-dom/client'
import './src/index.css' // real --yd-* theme tokens so gold buttons + hairlines render faithfully
import SeoOptimizer from './src/pages/SeoOptimizer.jsx'

const J = (o) => new Response(JSON.stringify(o), { headers: { 'Content-Type': 'application/json' } })
const of_ = window.fetch

const params = new URLSearchParams(window.location.search)
const view = params.get('view') || ''

// Real video IDs so i.ytimg thumbnails render in the shot (fallback handles 404s).
const VID = ['tCDvOQI3pco', 'YbJOTdZBX1g', '3AtDnEC4zak', 'e-ORhEE9VVg', 'kJQP7kiw5Fk', 'JGwWNGJdvx8', 'OPf0YbXqDm0', 'fRh_vgS2dFE', 'CevxZvSJLk8', '2Vv-BfVoq4g', 'hT_nvWreIhg', 'lp-EO5I60KA']
const CH = ['Broke Kitchen', 'Frugal Living', 'The Dollar Diaries', 'Budget Bites', 'Penny Pantry', 'Thrift & Thrive']
const daysAgo = (d) => new Date(Date.now() - d * 86400e3).toISOString()

const mkVid = (title, i, views) => ({
  title, video_id: VID[i % VID.length], view_count: views,
  channel: CH[i % CH.length], published_at: daysAgo(4 + i * 9),
})

const RESULT = {
  score: 57,
  analyzed_at: new Date().toISOString(),
  breakdown: { length: 18, keyword_relevance: 7, power_words: 8, numbers: 0, viral_format: 6, front_loading: 9, question: 0, hook_format: 6 },
  primary_phrase: 'budget challenge',
  videos_found: 12,
  suggestion_error: null,
  suggestions: [
    { title: 'I Survived 24 Hours On A $1 Food Budget', seo_score: 82, ctr_score: 88, hook_score: 79, length: 39, primary_keyword: 'budget challenge',
      why_it_works: 'the time constraint plus an extreme low number opens a curiosity loop viewers need to close', angle: 'browse and suggested feed, the emotional hook travels well beyond search' },
    { title: '$1 vs $100 Grocery Challenge (Brutal Results)', seo_score: 74, ctr_score: 81, hook_score: 72, length: 45, primary_keyword: 'grocery challenge',
      why_it_works: 'price contrast triggers value-seeking and the parenthetical promises a payoff', angle: 'hybrid, ranks for the challenge term and still gets clicked in the feed' },
    { title: 'Living On $1 A Day: Everything I Learned', seo_score: 66, ctr_score: 61, hook_score: 64, length: 40, primary_keyword: 'living on a dollar',
      why_it_works: 'transformation framing signals a lesson-driven payoff that keeps retention high', angle: 'search-leaning, strong keyword match at the front of the title' },
  ],
  top_videos: [
    mkVid('I Tried Living On $1 For 24 Hours (Brutal)', 0, 2_400_000),
    mkVid('$1 vs $500 Grocery Budget Challenge', 1, 1_180_000),
    mkVid('Feeding My Family On $20 A Week', 2, 860_000),
    mkVid('Extreme Budget Meal Prep For 7 Days', 3, 540_000),
    mkVid('I Lived On Ramen For A Month, Here Is What Happened', 4, 410_000),
    mkVid('The Cheapest Meals That Actually Taste Good', 5, 305_000),
    mkVid('$5 Whole Day Of Eating Challenge', 6, 190_000),
    mkVid('How I Eat Healthy On A Tiny Budget', 7, 96_000),
  ],
  top_shorts: [
    { ...mkVid('$1 breakfast that slaps', 8, 720_000), },
    { ...mkVid('POV: broke college week', 9, 430_000), },
    { ...mkVid('cheapest protein hack', 10, 260_000), },
    { ...mkVid('dollar store dinner', 11, 88_000), },
  ],
  intent_analysis: {
    search_intent: 'viewers want proof an extreme budget is survivable for real',
    viewer_profile: 'budget-conscious students and young adults',
    emotional_driver: 'vicarious struggle and relief',
    gap_opportunity: 'nobody covers the mental toll of a full week on a $1 budget',
    overused_angle: 'generic cheap-meal recipe roundups with no personal stakes',
  },
  keyword_scores: [
    { phrase: 'budget challenge', score: 88, volume: 'HIGH', competition: 'MED' },
    { phrase: '$1 food challenge', score: 81, volume: 'HIGH', competition: 'LOW' },
    { phrase: 'cheap meals', score: 73, volume: 'HIGH', competition: 'HIGH' },
    { phrase: 'living on a dollar', score: 69, volume: 'MED', competition: 'LOW' },
    { phrase: 'grocery budget', score: 64, volume: 'MED', competition: 'MED' },
    { phrase: 'broke college meals', score: 58, volume: 'MED', competition: 'LOW' },
    { phrase: 'extreme frugal living', score: 51, volume: 'LOW', competition: 'MED' },
    { phrase: 'ramen only diet', score: 44, volume: 'LOW', competition: 'HIGH' },
  ],
  autocomplete_terms: ['budget challenge', '$1 food challenge', 'cheap meals for a week', 'living on a dollar a day', 'grocery budget challenge', 'broke college student meals', 'extreme frugal living', 'dollar store meal prep'],
  top_tags: ['budget challenge', 'cheap meals', 'frugal living', 'meal prep', 'save money', 'grocery haul', 'college budget', '$1 challenge'],
}

const DESC_RESULT = [
  { type: 'story', preview: 'Seven days. One dollar a day. I documented every meal and the moment I nearly gave up on day four.',
    why_it_works: 'opens on personal stakes so the viewer is invested before the first tip lands',
    full: 'Seven days. One dollar a day. I documented every meal and the exact moment I nearly gave up on day four.\n\nIn this video I break down how I planned each meal, where the budget almost broke, and the three cheap staples that carried the whole week.\n\nTimestamps:\n00:00 The rules\n01:20 Grocery haul\n04:10 Day four hits hard\n08:30 What I would do differently\n\n#budgetchallenge #cheapmeals #frugalliving' },
  { type: 'value', preview: 'Everything you need to eat for a week on almost nothing, including the shopping list and the meal plan.',
    why_it_works: 'front-loads the payoff so viewers who want the plan stay for it',
    full: 'Everything you need to eat well for a week on almost nothing.\n\nInside: the full shopping list, a day-by-day meal plan, and the swaps that keep it from getting miserable.\n\nGrab the free printable meal plan in the description and let me know your cheapest meal in the comments.\n\n#budgetchallenge #mealprep #savemoney' },
  { type: 'keyword', preview: 'Budget challenge: how to live on a $1 a day food budget with cheap meals that actually taste good.',
    why_it_works: 'leads with the exact search phrases the ranking videos use',
    full: 'Budget challenge: how to live on a $1 a day food budget with cheap meals that actually taste good.\n\nThis grocery budget challenge covers frugal living staples, broke college student meals, and dollar store meal prep ideas.\n\n#budgetchallenge #cheapmeals #frugalliving #mealprep' },
]
const DESC_KEYWORDS = ['budget challenge', 'cheap meals', 'a dollar a day', 'grocery budget', 'meal prep', 'frugal living']

// Seed localStorage so loadSaved() restores the chosen state with no fetch.
const seed = {}
if (view === 'results' || view === 'desc') {
  seed.title = 'Living On $1 A Day For A Whole Week'
  seed.result = RESULT
  seed.selectedKeyword = 'budget challenge'
}
if (view === 'desc') {
  seed.selectedTitle = RESULT.suggestions[0].title
  seed.descResult = DESC_RESULT
  seed.descKeywords = DESC_KEYWORDS
}
if (view === 'intent') {
  // Intent picker: title present, options seeded, no result yet.
  seed.title = 'How I Grew My Channel To 10k Subscribers'
  seed.intentOptions = [
    { label: 'YouTube growth for small creators', keyword: 'youtube growth tips', description: 'Creators under 10k subs looking for a repeatable growth playbook.' },
    { label: 'Channel case studies', keyword: 'grew my channel', description: 'Viewers who want the behind-the-scenes numbers of a real channel run.' },
    { label: 'Subscriber milestones', keyword: '10k subscribers', description: 'People chasing a specific subscriber milestone and the tactics to hit it.' },
  ]
}
try { localStorage.setItem('seoOptimizer_v1', JSON.stringify(seed)) } catch {}

const REPORTS = [
  { id: 1, title: 'I Tried Living On $1 For 24 Hours (Brutal)', confirmed_keyword: 'budget challenge',
    result: { suggestions: ['a', 'b', 'c', 'd'] }, desc_result: { text: 'x' },
    updated_at: new Date(Date.now() - 3 * 3600e3).toISOString() },
  { id: 2, title: 'How I Grew My Channel From 0 to 50K In 90 Days', confirmed_keyword: 'channel growth',
    result: { suggestions: ['a', 'b'] }, desc_result: null,
    updated_at: new Date(Date.now() - 2 * 86400e3).toISOString() },
  { id: 3, title: 'The Truth About YouTube Automation Nobody Tells You',
    result: { suggestions: [] }, desc_result: { text: 'y' },
    updated_at: new Date(Date.now() - 6 * 86400e3).toISOString() },
]
window.fetch = async (url, opts) => {
  const s = String(url)
  if (s.includes('/seo/reports')) return J({ reports: REPORTS })
  if (s.includes('/seo/intent-options')) return J({ options: [] })
  if (s.startsWith('http')) return of_(url, opts)
  return J({})
}

// Recent videos carry hashtags so the "Featured hashtags" block populates in the desc view.
const MY_VIDEOS = [
  { description: 'Cheap eats! #budgetchallenge #cheapmeals #mealprep', views: 120000 },
  { description: 'Weekly plan #budgetchallenge #frugalliving #savemoney', views: 84000 },
  { description: 'Dollar meals #cheapmeals #budgetchallenge', views: 51000 },
]

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement('div', { style: { padding: '36px 24px', minHeight: '100vh', background: 'var(--yd-paper)' } },
    React.createElement(SeoOptimizer, {
      onNavigate: () => {}, plan: 'growth', freeTierFeatures: {}, videos: MY_VIDEOS,
    })
  )
)
