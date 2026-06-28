import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'

/* Each route is its own JS chunk via React.lazy. The landing page no longer
   ships dashboard / autopsy / SEO Studio code, dropping cold-load JS from
   ~388 KB gzipped to ~60-100 KB depending on the entry route.

   The prerender pipeline (scripts/prerender.js) still works: Puppeteer
   waits for networkidle0 before snapshotting, which covers the lazy chunk
   fetch. React 19 hydration keeps the prerendered HTML on screen while
   the matching chunk loads, so users see no flash. */

const Landing                          = lazy(() => import('./pages/Landing'))
const Dashboard                        = lazy(() => import('./pages/Dashboard'))
const Terms                            = lazy(() => import('./pages/Terms'))
const Privacy                          = lazy(() => import('./pages/Privacy'))
const Refund                           = lazy(() => import('./pages/Refund'))
const Affiliate                        = lazy(() => import('./pages/Affiliate'))
const Contact                          = lazy(() => import('./pages/Contact'))
const ChannelAudit                     = lazy(() => import('./pages/features/ChannelAudit'))
const CompetitorAnalysis               = lazy(() => import('./pages/features/CompetitorAnalysis'))
const SeoStudio                        = lazy(() => import('./pages/features/SeoStudio'))
const ThumbnailIq                      = lazy(() => import('./pages/features/ThumbnailIq'))
const KeywordResearch                  = lazy(() => import('./pages/features/KeywordResearch'))
const Outliers                         = lazy(() => import('./pages/features/Outliers'))
const YoutubeMoneyCalculator           = lazy(() => import('./pages/tools/YoutubeMoneyCalculator'))
const YoutubeThumbnailDownloader       = lazy(() => import('./pages/tools/YoutubeThumbnailDownloader'))
const YoutubeSubscriberMoneyCalculator = lazy(() => import('./pages/tools/YoutubeSubscriberMoneyCalculator'))
const YoutubeChannelStatsChecker       = lazy(() => import('./pages/tools/YoutubeChannelStatsChecker'))
const YoutubeKeywordResearch           = lazy(() => import('./pages/tools/YoutubeKeywordResearch'))
const YoutubeThumbnailResizer          = lazy(() => import('./pages/tools/YoutubeThumbnailResizer'))
const YoutubeChannelNameGenerator      = lazy(() => import('./pages/tools/YoutubeChannelNameGenerator'))
const YoutubeVideoIdeasGenerator       = lazy(() => import('./pages/tools/YoutubeVideoIdeasGenerator'))
const YoutubeTitleGenerator            = lazy(() => import('./pages/tools/YoutubeTitleGenerator'))
const YoutubeShortsMoneyCalculator     = lazy(() => import('./pages/tools/YoutubeShortsMoneyCalculator'))
const YoutubeDescriptionGenerator      = lazy(() => import('./pages/tools/YoutubeDescriptionGenerator'))
const YoutubeTagGenerator              = lazy(() => import('./pages/tools/YoutubeTagGenerator'))
const YoutubeHashtagGenerator          = lazy(() => import('./pages/tools/YoutubeHashtagGenerator'))
const YoutubeChapterGenerator          = lazy(() => import('./pages/tools/YoutubeChapterGenerator'))
const YoutubeThumbnailTester           = lazy(() => import('./pages/tools/YoutubeThumbnailTester'))
const YoutubeStats                     = lazy(() => import('./pages/YoutubeStats'))
const YoutubeStatsCategory             = lazy(() => import('./pages/YoutubeStatsCategory'))
const YoutubeStatsCountry              = lazy(() => import('./pages/YoutubeStatsCountry'))
const YoutubeStatsCountryCategory      = lazy(() => import('./pages/YoutubeStatsCountryCategory'))
const Blog                             = lazy(() => import('./pages/Blog'))
const BlogPost                         = lazy(() => import('./pages/BlogPost'))

function App() {
  return (
    <BrowserRouter>
      {/* Empty Suspense fallback. We never want to flash a spinner over
          the prerendered HTML; React 19 keeps the existing DOM visible
          while a lazy chunk loads, then hydrates in place. For client-side
          navigation between routes, the brief blank state during chunk
          fetch is acceptable on slow connections (and imperceptible on
          desktop). */}
      <Suspense fallback={null}>
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
          <Route path="/features/outliers"             element={<Outliers />} />
          <Route path="/tools/youtube-money-calculator"            element={<YoutubeMoneyCalculator />} />
          <Route path="/tools/youtube-thumbnail-downloader"        element={<YoutubeThumbnailDownloader />} />
          <Route path="/tools/youtube-subscriber-money-calculator" element={<YoutubeSubscriberMoneyCalculator />} />
          <Route path="/tools/youtube-channel-stats-checker"       element={<YoutubeChannelStatsChecker />} />
          <Route path="/tools/youtube-keyword-research"            element={<YoutubeKeywordResearch />} />
          <Route path="/tools/youtube-thumbnail-resizer"           element={<YoutubeThumbnailResizer />} />
          <Route path="/tools/youtube-channel-name-generator"      element={<YoutubeChannelNameGenerator />} />
          <Route path="/tools/youtube-video-ideas-generator"       element={<YoutubeVideoIdeasGenerator />} />
          <Route path="/tools/youtube-title-generator"             element={<YoutubeTitleGenerator />} />
          <Route path="/tools/youtube-shorts-money-calculator"     element={<YoutubeShortsMoneyCalculator />} />
          <Route path="/tools/youtube-description-generator"        element={<YoutubeDescriptionGenerator />} />
          <Route path="/tools/youtube-tag-generator"               element={<YoutubeTagGenerator />} />
          <Route path="/tools/youtube-hashtag-generator"           element={<YoutubeHashtagGenerator />} />
          <Route path="/tools/youtube-chapter-generator"           element={<YoutubeChapterGenerator />} />
          <Route path="/tools/youtube-thumbnail-tester"            element={<YoutubeThumbnailTester />} />
          <Route path="/youtube-stats"                             element={<YoutubeStats />} />
          <Route path="/youtube-stats/country/:countrySlug/:categorySlug" element={<YoutubeStatsCountryCategory />} />
          <Route path="/youtube-stats/country/:slug"               element={<YoutubeStatsCountry />} />
          <Route path="/youtube-stats/:slug"                       element={<YoutubeStatsCategory />} />
          <Route path="/blog"                                      element={<Blog />} />
          <Route path="/blog/:slug"                                element={<BlogPost />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
