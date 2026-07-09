import { useParams, Navigate } from 'react-router-dom'

/* Retired 2026-07-09. The niche x country earnings combo pages (e.g. "How much
   do finance YouTubers make in Canada") were a templated layer and a Mediavine
   thin-content liability that pulled almost no traffic. They now redirect to the
   niche earnings hub, which holds the hand-written per-niche content. See
   MEDIAVINE.md for the full rationale. */
export default function NicheCountryEarnings() {
  const { niche } = useParams()
  return <Navigate to={niche ? `/youtube-earnings/${niche}` : '/tools/youtube-money-calculator'} replace />
}
