/*
 * Preview harness for WeeklyReport. Mounts the component standalone with
 * mocked /api/reports/* fetches so every state can be screenshot before
 * shipping a design change. Dark ground (the page is on the dark system).
 *
 *   ?state=reports (default) — paid plan, latest + previous reports
 *   ?state=empty             — paid plan, no reports yet
 *   ?state=free              — free plan, gated blurred preview
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import WeeklyReport from './src/pages/WeeklyReport.jsx'

const params = new URLSearchParams(window.location.search)
const state  = params.get('state') || 'reports'

const REPORT = {
  id: 'r1',
  weekStart: 'May 12', weekEnd: 'May 18',
  reportData: {
    reportTitle: 'Your Week on YouTube — May 12 – 18',
    weeklySummary: 'You grew 9% this week on the back of the budget-meal series, but a 12-day posting gap is starting to cost you recommendation surfaces — here is what is working and the one thing to fix next.',
    watchOut: 'Posting frequency dropped to one video in 12 days and the algorithm is deprioritising the channel on the home feed.',
    priorityAction: 'Film two budget-meal videos this week — it is your repeatable winner, and a second upload inside 7 days compounds the algorithm boost.',
    biggestWin: 'The 5K-budget-meals video hit 41,200 views and pulled 318 new subscribers — your best single video this quarter.',
    motivationalClose: 'You are one consistent week away from the channel compounding on its own. Keep the cadence.',
    metrics: {
      subscribers:  { value: 41200, delta: 318,   direction: 'up' },
      weeklyViews:  { value: 96400, delta: 9.1,    direction: 'up', },
      avgRetention: { value: 47,    delta: -3.2,   direction: 'down' },
      channelScore: { value: 78,    delta: 4,      direction: 'up' },
    },
  },
}
const PREV = [
  { id: 'r2', weekStart: 'May 5', weekEnd: 'May 11', reportData: {
      reportTitle: 'Your Week on YouTube — May 5 – 11',
      weeklySummary: 'A quieter week — one upload, steady views, retention held.',
      watchOut: 'No new uploads in the back half of the week.',
      priorityAction: 'Lock a two-a-week cadence before the algorithm cools.',
      biggestWin: 'Retention on the cafe review stayed above 50% to the 6-minute mark.',
      metrics: {
        subscribers:  { value: 40882, delta: 120, direction: 'up' },
        weeklyViews:  { value: 71300, delta: -4.0, direction: 'down' },
        avgRetention: { value: 50,   delta: 0,    direction: 'flat' },
        channelScore: { value: 74,   delta: -2,   direction: 'down' },
      },
  } },
  { id: 'r3', weekStart: 'Apr 28', weekEnd: 'May 4', reportData: {
      reportTitle: 'Your Week on YouTube — Apr 28 – May 4',
      weeklySummary: 'Launch week for the budget series — strong start.',
      biggestWin: 'First budget-meal video broke 20K in 48 hours.',
      metrics: {
        subscribers:  { value: 40762, delta: 540, direction: 'up' },
        weeklyViews:  { value: 88100, delta: 22.0, direction: 'up' },
        avgRetention: { value: 52,   delta: 5.0,  direction: 'up' },
        channelScore: { value: 76,   delta: 6,    direction: 'up' },
      },
  } },
]

const origFetch = window.fetch
window.fetch = async (url, opts) => {
  const u = String(url)
  if (u.includes('/api/reports/history')) {
    const data = state === 'empty' ? [] : [REPORT, ...PREV]
    return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } })
  }
  if (u.includes('/api/reports/email-preference')) {
    return new Response(JSON.stringify({ weekly_report: true, success: true }), { headers: { 'Content-Type': 'application/json' } })
  }
  if (u.includes('/api/reports/status')) {
    return new Response(JSON.stringify({ should_show_credit_notice: false }), { headers: { 'Content-Type': 'application/json' } })
  }
  return origFetch(url, opts)
}

const props = {
  channelId: 'UCdemo',
  channelEmail: 'demo@ytgrowth.app',
  plan: state === 'free' ? 'free' : 'growth',
  channelStats: { subscribers: 41200, total_views: 3_180_000, channel_name: 'Life with Nthenya' },
  analytics: { avg_retention_percent: 47 },
  healthScore: 78,
}

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement('div', {
    style: { padding: '36px 24px', boxSizing: 'border-box', background: 'var(--yd-paper)', minHeight: '100vh' },
  },
    React.createElement(WeeklyReport, props)
  )
)
