import { useParams, Navigate } from 'react-router-dom'

/* Retired 2026-07-09. The country x category combo pages (e.g. "Top 50 gaming
   channels in the United States") were thin content: an aggregated leaderboard
   wrapped in templated copy that repeated across every sibling page. They were a
   Mediavine thin-content liability and pulled almost no traffic, so they now
   redirect to the country hub, which carries the same leaderboards with more
   context. See MEDIAVINE.md for the full rationale. */
export default function YoutubeStatsCountryCategory() {
  const { countrySlug } = useParams()
  return <Navigate to={countrySlug ? `/youtube-stats/country/${countrySlug}` : '/youtube-stats'} replace />
}
