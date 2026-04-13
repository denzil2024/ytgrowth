import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Initialise Paddle on every page load (public baseline — no customer context yet).
// Authenticated pages call initPaddleRetain() via UsageBar to add pwCustomer.
Paddle.Initialize({ token: 'live_2af860b645fca6f106c9d79f8d2' })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
