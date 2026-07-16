/*
 * Preview harness for AuditProgress. Renders it in the Overview slot it
 * occupies in the app: the .ov-page 1040 column on the editorial paper
 * background, with the real dashboard styles (fonts + --yd-* variables)
 * injected via useDashboardStyles so tokens resolve exactly as in prod.
 *
 * Query params (?state=):
 *   running (default) — audit in flight, stages advancing
 *   done              — insights landed, "Almost ready" outro
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import AuditProgress from './src/components/AuditProgress.jsx'
import { useDashboardStyles } from './src/pages/dashboard/styles.js'

const MODE = new URLSearchParams(window.location.search).get('state') || 'running'

function Preview() {
  useDashboardStyles()
  return (
    <div style={{ minHeight: '100vh', background: 'var(--yd-paper)', boxSizing: 'border-box' }}>
      <div style={{ padding: '36px 40px 72px' }}>
        <div className="ov-page" style={{ maxWidth: 1040, margin: '0 auto' }}>
          <AuditProgress done={MODE === 'done'} onDone={() => console.log('[preview] onDone')} />
          <div style={{ height: 120, border: '1px dashed rgba(20,19,15,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(20,19,15,0.30)', fontSize: 13 }}>
            your Feed continues here …
          </div>
        </div>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<Preview />)
