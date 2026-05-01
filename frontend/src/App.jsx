import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Refund from './pages/Refund'
import Affiliate from './pages/Affiliate'
import Contact from './pages/Contact'
import ChannelAudit from './pages/features/ChannelAudit'
import CompetitorAnalysis from './pages/features/CompetitorAnalysis'
import SeoStudio from './pages/features/SeoStudio'
import ThumbnailIq from './pages/features/ThumbnailIq'
import KeywordResearch from './pages/features/KeywordResearch'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/refund" element={<Refund />} />
        <Route path="/affiliate" element={<Affiliate />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/features/channel-audit"        element={<ChannelAudit />} />
        <Route path="/features/competitor-analysis"  element={<CompetitorAnalysis />} />
        <Route path="/features/seo-studio"           element={<SeoStudio />} />
        <Route path="/features/thumbnail-iq"         element={<ThumbnailIq />} />
        <Route path="/features/keyword-research"     element={<KeywordResearch />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App