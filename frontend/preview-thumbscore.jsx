/* Thumbnail Score standalone preview.
   Default = idle upload state.
   ?state=results = full Layer-2 results view (drives the component through its
   own ytg_score_this auto-load path against a mocked /thumbnail/upload). */
import React from 'react'
import ReactDOM from 'react-dom/client'
import ThumbnailScore from './src/pages/ThumbnailScore.jsx'

const J = (o) => new Response(JSON.stringify(o), { headers: { 'Content-Type': 'application/json' } })
const of_ = window.fetch

const wantResults = new URLSearchParams(location.search).get('state') === 'results'

// A full ready2 analysis payload, mirrors the real /thumbnail/upload shape the
// results view reads (layer1_scores, layer2_scores, benchmark_comparison, etc).
// Scores deliberately span strong/amber/weak so every color state renders.
const ANALYSIS = {
  id: 42,
  confirmed_keyword: 'how to save money in your 20s',
  format: 'long-form',
  size_bracket: 'small',
  algorithm_score: 46,
  final_score: 74,
  niche_avg_score: 41,
  user_percentile: 68,
  thumbnail_b64: null, // grey placeholder, no fabricated image
  layer1_scores: {
    dimensions:       { score: 5 },
    file_size:        { score: 5 },
    contrast:         { score: 10 },
    face:             { score: 6 },
    text_presence:    { score: 10 },
    text_readability: { score: 7 },
    vibrancy:         { score: 3 },
  },
  benchmark_comparison: {
    benchmark_face_rate: 82,
    benchmark_text_rate: 71,
    contrast:      { benchmark: 12, pct_diff: -16 },
    face:          { benchmark: 9,  pct_diff: -33 },
    text_presence: { benchmark: 8,  pct_diff: 25 },
    vibrancy:      { benchmark: 4,  pct_diff: -25 },
  },
  layer2_scores: {
    claude_score: 28,
    overallVerdict: 'A clean, readable thumbnail that reads well at feed size. The face carries the frame but sits too small to land the expression, and the colors run a touch muted next to the top performers in this niche.',
    emotionLabel: 'Curiosity',
    feedPosition: 'stands out',
    clickPrediction: 'above niche average',
    biggestWin: 'Your text overlay is bold, short, and readable at mobile size, exactly what the top thumbnails in this niche do.',
    biggestFix: 'Crop tighter on the face so it fills the left half of the frame. Small faces lose the expression that drives clicks.',
    scores: {
      facialEmotion:      { score: 6, verdict: 'A face is present but the expression is soft and reads small at thumbnail size.', vs_benchmark: 'Top performers use a larger, higher-intensity expression.', fix: 'Zoom in and exaggerate the expression, wide eyes or open mouth.' },
      textPsychology:     { score: 8, verdict: 'The number "in your 20s" creates a clear age hook.', vs_benchmark: 'On par with the strongest titles in the set.', fix: null },
      colorPsychology:    { score: 5, verdict: 'Palette is slightly muted and blends with common finance backgrounds.', vs_benchmark: 'Top thumbnails lean on one saturated accent color.', fix: 'Add a single bold accent color behind the subject.' },
      composition:        { score: 7, verdict: 'Balanced layout with a clear focal point.', vs_benchmark: 'Comparable to niche leaders.', fix: null },
      titleRelationship:  { score: 8, verdict: 'Thumbnail and title reinforce each other without repeating.', vs_benchmark: 'Strong pairing.', fix: null },
      feedDistinctiveness:{ score: 4, verdict: 'Would sit quietly next to higher-contrast competitors in the same row.', vs_benchmark: 'Below the distinctiveness of the top 10.', fix: 'Raise overall contrast and pick a background that no competitor is using.' },
    },
  },
}

window.fetch = async (url, opts) => {
  const s = String(url)
  if (s.startsWith('data:')) return of_(url, opts) // let the auto-load blob resolve
  if (s.includes('/thumbnail/video-ideas')) return J({ has_ideas: false, ideas: [] })
  if (s.includes('/thumbnail/history'))     return J({ analyses: [], history: [], items: [] })
  if (s.includes('/thumbnail/upload'))       return J({ analysis: ANALYSIS })
  if (s.startsWith('http')) return of_(url, opts)
  return J({})
}

// Drive the results view via the component's own preload path.
if (wantResults) {
  localStorage.setItem('ytg_score_this', JSON.stringify({
    dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    title: 'how to save money in your 20s',
  }))
}

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement('div', { style: { padding: '36px 24px', minHeight: '100vh', background: 'var(--yd-paper)' } },
    React.createElement(ThumbnailScore, {
      channelData: { channel: { channel_id: 'UCdemo', channel_name: 'Life with Nthenya', subscribers: 41200 } },
      onNavigate: () => {}, plan: 'growth', freeTierFeatures: {},
    })
  )
)
