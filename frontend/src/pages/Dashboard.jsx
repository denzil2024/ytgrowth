import { Fragment, useEffect, useState } from 'react'
import {
  Gift,
  LogOut,
  Activity,
} from 'lucide-react'
import Competitors from './Competitors'
import Settings from './Settings'
import SeoOptimizer from './SeoOptimizer'
import VideoOptimizePanel from './VideoOptimizePanel'
import Keywords from './Keywords'
import VideoIdeas from './VideoIdeas'
import ThumbnailScore from './ThumbnailScore'
import Outliers from './Outliers'
import Autopsy from './Autopsy'
import WeeklyReport from './WeeklyReport'
import Referrals from './Referrals'
import Admin from './Admin'
import NicheHeroCard from '../components/NicheHeroCard'
import ChatCoach from './ChatCoach'
import AuditProgress from '../components/AuditProgress'
import { loginUrl } from '../utm.js'
import { openCheckout } from '../checkout'
import UsageBar from '../components/UsageBar'
import CreditsEmptyModal from '../components/CreditsEmptyModal'
import OnboardingCard from '../components/OnboardingCard'
import { C, SHELL, CATEGORY_GRADIENT } from './dashboard/tokens'
import {
  ytMaxThumbUrl, makeThumbOnError, makeThumbOnLoad,
  planBadge, healthScore,
  parseUTC, relTime, relTimeLong,
  scoreColor, scoreLabel, fmtNum,
  nextSubMilestone, nextViewMilestone,
  categoryToNav,
} from './dashboard/utils'
import { useDashboardStyles } from './dashboard/styles'
import {
  YTGLogo, Logo, ScoreRing, Sparkline,
} from './dashboard/primitives'
import {
  StarBadge,
  MilestoneShareModal,
  MilestoneCelebrationModal,
} from './dashboard/milestone'
import {
  FeedFilterPills, ActionsRailCard, PriorityActionCard,
  MilestoneFeedCard, ContentMixFeedCard, ChannelHealthFeedCard,
  PostingConsistencyCard, BestTimeCard,
  TrackedLiftCard, DailyIdeasCard, TitleSuggestionCard,
  MissingDescriptionCard, MissingTagsCard, UnansweredCommentCard, TopSearchTermsCard,
  PinnedAIInput,
  SuggestedCompetitorsCard, RelatedTrafficCard, CompetitorActivityCard,
} from './dashboard/feedCards'
import {
  NavBtn, NavGroup, NavSubBtn,
  ChatNav, WhatsNewCard, ChannelSwitcher,
} from './dashboard/nav'

export default function Dashboard() {
  useDashboardStyles()

  const [data,    setData]   = useState(null)
  const [videos,       setVideos]       = useState(null)
  const [videoSort,    setVideoSort]    = useState('date')   // 'date' | 'views' | 'likes'
  const [videosTab,    setVideosTab]    = useState('all')    // 'all' | 'tracked'
  const [videoFlash,   setVideoFlash]   = useState(null)     // 'ok' | 'err' | null
  const [error,   setError]  = useState(null)
  const [loading, setLoad]   = useState(true)
  const [nav,     setNav]    = useState('Overview')
  const [selectedVideoId, setSelectedVideoId] = useState(null)
  const [analyzingAI, setAnalyzingAI] = useState(false)
  const [reAuditError, setReAuditError] = useState('')
  const [refreshingStats, setRefreshingStats] = useState(false)
  const [creditsOut, setCreditsOut] = useState(false)
  const [checked,  setChecked]  = useState({})
  const [deleted,  setDeleted]  = useState({})
  const [channels, setChannels] = useState([])
  const [channelsAllowed, setChannelsAllowed] = useState(1)
  const [canAddMore, setCanAddMore] = useState(false)
  const [, setObVer] = useState(0)  // bump to re-derive onboarding flags from localStorage
  const [billingPlan, setBillingPlan] = useState(null)
  const [isAdmin,     setIsAdmin]     = useState(false)
  // Sidebar live signals. Drive the nav badges so the sidebar reads as a
  // status surface, not just a list of links.
  const [freshOutlier, setFreshOutlier] = useState(false)
  // Latest niche-outlier bundle handed up by NicheHeroCard. Lets
  // navigateTo mark the current outlier as seen without firing its
  // own fetch (the card already loaded it).
  const [outlierBundleSeed, setOutlierBundleSeed] = useState(null)
  // Chat history, surfaced in the sidebar (Chat group). Dashboard seeds
  // the list once from /chat/state (chat DB only, no YouTube quota);
  // ChatCoach reports back via onChatState so the sidebar stays the
  // single source of truth as chats are created / switched / deleted.
  const [chatConvos, setChatConvos]   = useState([])
  const [chatActiveId, setChatActiveId] = useState(null)
  const [chatMode, setChatMode]       = useState(null)   // 'open' | 'new' | null
  const [chatTargetId, setChatTargetId] = useState(null)
  const [chatNonce, setChatNonce]     = useState(0)       // bump to dispatch a command
  useEffect(() => {
    let cancelled = false
    fetch('/chat/state', { credentials: 'include' })
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(d => { if (!cancelled) { setChatConvos(d.conversations || []); setChatActiveId(d.conversation_id ?? null) } })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])
  const openChatConversation = (id) => { setChatMode('open'); setChatTargetId(id); setChatNonce(n => n + 1); setNav('Chat') }
  const startNewChat = () => { setChatMode('new'); setChatTargetId(null); setChatNonce(n => n + 1); setNav('Chat') }
  const onChatState = ({ conversations, activeConversationId }) => {
    setChatConvos(conversations || [])
    setChatActiveId(activeConversationId ?? null)
  }
  const recentChats = [...chatConvos]
    .sort((a, b) => new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0))
    .slice(0, 7)
  // Feed state.
  const [feedFilter, setFeedFilter] = useState(() => {
    try { return localStorage.getItem('ytg_feed_filter') || 'all' } catch { return 'all' }
  })
  const [auditOpen, setAuditOpen] = useState(false)
  // Tracked Optimization Lift — the proof loop card. Fetched on mount when
  // the user is on the Overview. Null while loading or when there's no
  // meaningful win to surface yet.
  const [trackedLift, setTrackedLift] = useState(null)
  // Daily Ideas (Video Ideas top 3 surfaced on the Feed).
  const [dailyIdeas, setDailyIdeas] = useState(null)
  const [suggestedCompetitors, setSuggestedCompetitors] = useState(null)
  const [titleSuggestion, setTitleSuggestion] = useState(null)
  const [titleApplyingIdx, setTitleApplyingIdx] = useState(null)
  const [titleAppliedIdx, setTitleAppliedIdx] = useState(null)
  const [titleApplyError, setTitleApplyError] = useState('')
  // Missing Description card. Same auto-curated pattern as title-suggestion:
  // backend picks one video with a thin description and returns up to 3 AI
  // drafts. Publish state is binary (success hides the card next refresh).
  const [missingDescription, setMissingDescription] = useState(null)
  const [descPublishing, setDescPublishing] = useState(false)
  const [descPublished, setDescPublished] = useState(false)
  const [descPublishError, setDescPublishError] = useState('')
  // Missing Tags card. Same auto-curated pattern as Missing Description:
  // backend picks one video with < 5 tags and returns up to 3 AI tag sets.
  const [missingTags, setMissingTags] = useState(null)
  const [tagsPublishing, setTagsPublishing] = useState(false)
  const [tagsPublished, setTagsPublished] = useState(false)
  const [tagsPublishError, setTagsPublishError] = useState('')
  // Unanswered Comment card. Backend surfaces one comment the user hasn't
  // replied to on a recent video + 3 AI reply drafts. Post fires
  // comments.insert via /dashboard/post-comment-reply (50 quota units per
  // user click).
  const [unansweredComment, setUnansweredComment] = useState(null)
  const [replyPosting, setReplyPosting] = useState(false)
  const [replyPosted, setReplyPosted] = useState(false)
  const [replyPostError, setReplyPostError] = useState('')
  // Top Search Terms card. Real YouTube Analytics data — the queries
  // viewers actually typed to find the user's videos in the last 28 days.
  // Cached per-channel for 24h. Null while loading or when there's no
  // search traffic.
  const [topSearchTerms, setTopSearchTerms] = useState(null)
  const [relatedTraffic, setRelatedTraffic] = useState(null)
  const [refreshingIdeas, setRefreshingIdeas] = useState(false)
  // Competitor Activity (recent uploads from tracked competitors).
  const [competitorActivity, setCompetitorActivity] = useState(null)
  const [refreshingCompActivity, setRefreshingCompActivity] = useState(false)
  const setFeedFilterPersist = (k) => {
    setFeedFilter(k)
    try { localStorage.setItem('ytg_feed_filter', k) } catch {}
  }
  // Free-tier per-feature gate status. Map of feature id → 'allowed' | 'locked' | 'used'.
  // Fetched from /auth/me on mount; empty {} for paid plans. Passed to gated
  // child pages so they can show the upsell modal on first render.
  const [freeTierFeatures, setFreeTierFeatures] = useState({})
  const [prevScore,   setPrevScore]   = useState(null)
  const [statsFlash,  setStatsFlash]  = useState(null)  // 'ok' | 'err' | null
  const [usagePct,    setUsagePct]    = useState(0)
  const [milestones,  setMilestones]  = useState(null)  // { earned: [...], upcoming: [...] }
  const [shareMilestone, setShareMilestone] = useState(null) // { category, tier, achieved_at }
  const [celebrateQueue, setCelebrateQueue] = useState([])   // [{ category, tier, achieved_at }]
  // Result tracking — videos the user optimized via /seo/update-video, fetched when Videos tab opens
  const [optimizations, setOptimizations] = useState([])

  // Admin check — fire-and-forget. Determines whether the Admin nav item
  // appears in the sidebar. Returns { is_admin: false } for everyone whose
  // session email isn't in the ADMIN_EMAILS env var.
  useEffect(() => {
    fetch('/admin/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : { is_admin: false })
      .then(d => setIsAdmin(!!d.is_admin))
      .catch(() => {})
  }, [])

  // Fresh-outlier "● new" dot on the Outliers nav. Computed from the
  // bundle NicheHeroCard already fetches (via onBundleLoaded below) so
  // we don't double-hit /dashboard/niche-outlier on every Feed load.
  const handleOutlierBundleLoaded = (d) => {
    if (!d?.ok) return
    setOutlierBundleSeed(d)
    const refreshed = d.bundle?.refreshed_at || d.outlier?.refreshed_at
    if (!refreshed) return
    const ageMs = Date.now() - new Date(refreshed).getTime()
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000
    if (!Number.isFinite(ageMs) || ageMs > SEVEN_DAYS) return
    const channelId = d.outlier?.channel_id || d.creator || 'unknown'
    // Suppress the dot once the user has visited Outliers since this
    // exact refresh appeared. Key on refreshed_at first so a fresh
    // outlier_cache refresh always resets the seen flag (even if the
    // top video_id happens to be unchanged across the refresh).
    const seenKey = `ytg_outlier_seen:${channelId}:${refreshed || d.bundle?.videos?.[0]?.video_id || d.outlier?.video_id || 'unknown'}`
    try { if (localStorage.getItem(seenKey)) return } catch {}
    setFreshOutlier(true)
  }

  // Onboarding step signals: mark "optimized a video" / "found an idea"
  // when the user actually visits those surfaces (by any path), so the
  // getting-started flow checks them off. Bump obVer to re-derive.
  useEffect(() => {
    const cid = data?.channel?.channel_id
    if (!cid) return
    let changed = false
    if (nav === 'Competitors' && localStorage.getItem(`ytg_ob_comp_${cid}`) !== '1') {
      try { localStorage.setItem(`ytg_ob_comp_${cid}`, '1'); changed = true } catch {}
    }
    if (nav === 'SEO Studio' && localStorage.getItem(`ytg_ob_seo_${cid}`) !== '1') {
      try { localStorage.setItem(`ytg_ob_seo_${cid}`, '1'); changed = true } catch {}
    }
    if ((nav === 'Video Ideas' || nav === 'Outliers') && localStorage.getItem(`ytg_ob_idea_${cid}`) !== '1') {
      try { localStorage.setItem(`ytg_ob_idea_${cid}`, '1'); changed = true } catch {}
    }
    if (changed) setObVer(v => v + 1)
  }, [nav, data])

  useEffect(() => {
    fetch('/auth/data', { credentials: 'include' })
      .then(r => {
        // Auth expired — bounce to login rather than showing a broken dashboard.
        if (r.status === 401) { window.location = '/'; throw new Error('Auth expired') }
        if (!r.ok) throw new Error('No data')
        return r.json()
      })
      .then(d => {
        if (d.error) throw new Error(d.error)
        setData(d)
        setVideos(d.videos || [])
        setLoad(false)
        // Resume checkout if the user picked a paid plan on the landing page
        // before signing in. The plan key was stashed by openCheckout() before
        // the redirect to /auth/login; consume it once and open Paddle now
        // that they're authenticated.
        let pending = null
        try { pending = sessionStorage.getItem('ytg_pending_plan') } catch {}
        if (pending) {
          try { sessionStorage.removeItem('ytg_pending_plan') } catch {}
          openCheckout(pending)
        }
        if (d.insights === null) setAnalyzingAI(true)
        // Mark genuinely new users (no audit yet) as in onboarding. Only
        // they ever see the getting-started flow; established users never
        // get the flag, so the flow never spams them.
        if ((d.insights === null || d.insights === undefined) && d.channel?.channel_id) {
          try { localStorage.setItem(`ytg_ob_started_${d.channel.channel_id}`, '1') } catch {}
        }
        if (d.channel?.channel_id) {
          const saved = localStorage.getItem(`ytg_checked_${d.channel.channel_id}`)
          if (saved) setChecked(JSON.parse(saved))
          const savedDel = localStorage.getItem(`ytg_deleted_${d.channel.channel_id}`)
          if (savedDel) setDeleted(JSON.parse(savedDel))
        }
      })
      .catch(e => { setError(e.message); setLoad(false) })

    // Load channel list for switcher
    fetch('/channels/list', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) {
          setChannels(d.channels || [])
          setChannelsAllowed(d.channels_allowed || 1)
          setCanAddMore(d.can_add_more || false)
        }
      })
      .catch(() => {})

    // Load milestones
    fetch('/auth/milestones', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && !d.error) setMilestones(d) })
      .catch(() => {})

    // Load tracked optimization lift (proof loop). Returns null when the
    // user hasn't optimized any videos yet or no wins have materialized.
    fetch('/dashboard/tracked-lift', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && !d.error && d.top) setTrackedLift(d) })
      .catch(() => {})

    // Load Daily Ideas (top 3 from the channel's video idea cache). The
    // backend pools ideas from competitor analyses + AI generations.
    fetch('/video-ideas', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && !d.error) setDailyIdeas(d) })
      .catch(() => {})

    // Load Competitor Activity (recent uploads from tracked competitors).
    // The endpoint reads CompetitorAnalysisCache for the tracked list and
    // fetches their latest videos via the YouTube Data API.
    fetch('/dashboard/competitor-activity', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      // Set state when there are items OR when the user has tracked
      // competitors but no recent uploads. The empty-state branch in
      // CompetitorActivityCard renders the latter as "quiet week" copy
      // instead of vanishing silently.
      .then(d => { if (d && !d.error && ((d.items?.length || 0) > 0 || (d.competitor_count || 0) > 0)) setCompetitorActivity(d) })
      .catch(() => {})

    // Load Suggested Competitors (auto-curated from cross-user caches, zero
    // new YouTube quota). Card hides itself when fewer than ~3 suggestions
    // come back, so a low-signal response just means a quiet Feed.
    fetch('/dashboard/suggested-competitors', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && d.ok && d.suggestions?.length) setSuggestedCompetitors(d) })
      .catch(() => {})

    // Load Title Suggestion: backend walks the user's videos most-recent
    // first and returns the first one that already has a SeoAnalysisCache
    // row. The suggestions are copied verbatim from that cached SEO Studio
    // analysis, so the Feed reuses Studio's output (no new Claude / quota).
    fetch('/dashboard/title-suggestion', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && d.ok && d.video && d.suggestions?.length) setTitleSuggestion(d) })
      .catch(() => {})

    // Load Missing Description: backend walks the user's videos most-recent
    // first, picks the first one with a sub-80-char description, and returns
    // up to 3 AI drafts (either from SEO Studio cache or a fresh cross-user
    // cached Claude call). Card hides itself if no candidate.
    fetch('/dashboard/missing-description', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && d.ok && d.video && d.drafts?.length) setMissingDescription(d) })
      .catch(() => {})

    // Load Missing Tags: same auto-curated pattern as Missing Description.
    // Backend picks the first video with < 5 tags and returns up to 3 AI
    // tag-set drafts. Card hides itself if no candidate.
    fetch('/dashboard/missing-tags', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && d.ok && d.video && d.tag_sets?.length) setMissingTags(d) })
      .catch(() => {})

    // Load Unanswered Comment: backend picks the most recent unreplied
    // comment on one of the user's recent videos + up to 3 AI reply
    // drafts. Cached per-channel for 12h; invalidated after a successful
    // reply post so the next Feed load picks a different comment.
    fetch('/dashboard/unanswered-comment', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && d.ok && d.comment && d.replies?.length) setUnansweredComment(d) })
      .catch(() => {})

    // Load Top Search Terms: backend hits YouTube Analytics for the
    // queries viewers actually typed to find this channel's videos in
    // the last 28 days. Cached per-channel for 24h. Card hides when
    // there's no search traffic to surface.
    fetch('/dashboard/top-search-terms', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && d.ok && d.items?.length) setTopSearchTerms(d) })
      .catch(() => {})

    // Load Related Traffic: YouTube Analytics detail of which OTHER
    // videos are sending us suggested-video traffic. Store EVERY response
    // shape (200 with items, 200 with reason, 401 auth-fail, network
    // failure) so the card always paints something instead of vanishing.
    fetch('/dashboard/related-traffic', { credentials: 'include' })
      .then(async r => {
        let body = null
        try { body = await r.json() } catch {}
        if (r.ok && body) return body
        if (r.status === 401) return { ok: false, reason: 'not_authenticated', items: [] }
        return { ok: false, reason: 'request_failed', items: [], status: r.status }
      })
      .then(d => { if (d) setRelatedTraffic(d) })
      .catch(() => { setRelatedTraffic({ ok: false, reason: 'network_error', items: [] }) })

    // Load plan + per-feature gate state (for free-tier gating on child pages).
    fetch('/auth/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return
        if (d.plan) setBillingPlan(d.plan)
        setFreeTierFeatures(d.free_tier_features || {})
      })
      .catch(() => {})

    // ?nav=<Tab> deep link — used by share links like /feedback to land users
    // on a specific tab. Settings reads its own ?focus param to scroll into view.
    try {
      const params = new URLSearchParams(window.location.search)
      const navTarget = params.get('nav')
      const VALID_NAV = ['Overview','Videos','Autopsy','Weekly Report','SEO Studio','Thumbnail Score','Video Ideas','Outliers','Keywords','Competitors','Settings','Referrals','Admin']
      if (navTarget && VALID_NAV.includes(navTarget)) {
        setNav(navTarget)
        // Don't strip ?focus — Settings reads it on mount.
        params.delete('nav')
        const qs = params.toString()
        window.history.replaceState({}, '', window.location.pathname + (qs ? `?${qs}` : ''))
      }
    } catch {}

    // DEV: ?preview_milestone=subs:1000 fires the celebration modal for testing. Safe to remove.
    try {
      const params = new URLSearchParams(window.location.search)
      const raw = params.get('preview_milestone')
      if (raw) {
        const [category, tierStr] = raw.split(':')
        const tier = parseInt(tierStr, 10)
        if (category && !isNaN(tier)) {
          setCelebrateQueue([{ category, tier, achieved_at: new Date().toISOString() }])
        }
        params.delete('preview_milestone')
        const qs = params.toString()
        window.history.replaceState({}, '', window.location.pathname + (qs ? `?${qs}` : ''))
      }
    } catch {}
  }, [])

  // Track score delta across audits
  useEffect(() => {
    if (data?.insights?.channelScore == null || !data?.channel?.channel_id) return
    const key = `ytg_prev_score_${data.channel.channel_id}`
    const stored = localStorage.getItem(key)
    if (stored !== null) setPrevScore(+stored)
    localStorage.setItem(key, data.insights.channelScore)
  }, [data?.insights?.channelScore, data?.channel?.channel_id])

  // Load tracked SEO optimizations for the Videos tab. Refetches on window focus so
  // deltas update when the user returns from YouTube.
  useEffect(() => {
    let cancelled = false
    const load = () => {
      fetch('/seo/optimizations', { credentials: 'include' })
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d && !cancelled) setOptimizations(d.optimizations || []) })
        .catch(() => {})
    }
    load()
    const onFocus = () => load()
    window.addEventListener('focus', onFocus)
    return () => { cancelled = true; window.removeEventListener('focus', onFocus) }
  }, [])

  // Poll for AI analysis completion when insights are still pending.
  // When insights arrive we flip auditFinishing=true so AuditProgress can
  // play its "Almost ready" outro before we tear it down via onDone.
  const [auditFinishing, setAuditFinishing] = useState(false)
  useEffect(() => {
    if (!analyzingAI) return
    let polledData = null
    const interval = setInterval(() => {
      fetch('/auth/data', { credentials: 'include' })
        .then(r => r.json())
        .then(d => {
          if (d.insights !== null) {
            polledData = d
            setData(d)
            setAuditFinishing(true)
            clearInterval(interval)
          }
        })
        .catch(() => {})
    }, 4000)
    return () => clearInterval(interval)
  }, [analyzingAI])

  function handleVideoUpdated(videoId, changes) {
    setVideos(prev => prev.map(v => v.video_id === videoId ? { ...v, ...changes } : v))
  }

  function handleToggleCheck(key) {
    const next = { ...checked, [key]: !checked[key] }
    setChecked(next)
    if (data?.channel?.channel_id) {
      localStorage.setItem(`ytg_checked_${data.channel.channel_id}`, JSON.stringify(next))
    }
  }

  function handleDelete(key) {
    const nextDel = { ...deleted, [key]: true }
    const nextChk = { ...checked }
    delete nextChk[key]
    setDeleted(nextDel)
    setChecked(nextChk)
    if (data?.channel?.channel_id) {
      localStorage.setItem(`ytg_deleted_${data.channel.channel_id}`, JSON.stringify(nextDel))
      localStorage.setItem(`ytg_checked_${data.channel.channel_id}`, JSON.stringify(nextChk))
    }
  }

  const score    = data?.insights?.channelScore ?? 0
  const avgViews = data ? Math.round(data.channel.total_views / Math.max(data.channel.video_count, 1)) : 0

  const patterns = data ? (() => {
    const vids = data.videos || []
    const dur  = v => { const m = (v.duration||'').match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/); return m ? (+m[1]||0)*3600+(+m[2]||0)*60+(+m[3]||0) : 0 }
    const shorts = vids.filter(v => dur(v) <= 60)
    const longs  = vids.filter(v => dur(v) >  60)
    const avg    = a  => a.length ? Math.round(a.reduce((s,v) => s+v.views, 0) / a.length) : 0
    const totL   = vids.reduce((s,v) => s+v.likes,  0)
    const totV   = vids.reduce((s,v) => s+v.views,  0)
    return {
      shortAvg:    avg(shorts),
      longAvg:     avg(longs),
      shortsCount: shorts.length,
      longsCount:  longs.length,
      likeRate:    totV > 0 ? (totL / totV * 100).toFixed(2) : 0,
      bestVideo:   [...vids].sort((a,b) => b.views-a.views)[0],
      worstVideo:  [...vids].sort((a,b) => a.views-b.views)[0],
    }
  })() : null

  const mainNavItems = [
    { label: 'Overview' },
    { label: 'Videos' },
    { label: 'SEO Studio' },
    { label: 'Keywords' },
    { label: 'Competitors' },
  ]

  // Sidebar live signals — derived, not stored.
  const openPriorityCount = (() => {
    const all = data?.insights?.priorityActions || []
    if (!all.length) return 0
    let open = 0
    for (let i = 0; i < all.length; i++) {
      const a = all[i]
      const rank = a.rank ?? (i + 1)
      const k = `rank_${rank}`
      if (!checked[k] && !deleted[k]) open += 1
    }
    return open
  })()

  // Wrap setNav so navigating to Outliers also clears the "new" dot. We
  // mark the current outlier's refresh as seen in localStorage so the
  // next true refresh of the niche cache re-triggers the dot.
  const navigateTo = (target) => {
    if (target === 'Outliers' && freshOutlier) {
      try {
        const d = outlierBundleSeed
        if (d?.ok) {
          const channelId = d.outlier?.channel_id || data?.channel?.channel_id || 'unknown'
          const refreshed = d.bundle?.refreshed_at || d.outlier?.refreshed_at || ''
          const seenKey = `ytg_outlier_seen:${channelId}:${refreshed || d.bundle?.videos?.[0]?.video_id || d.outlier?.video_id || 'unknown'}`
          try { localStorage.setItem(seenKey, '1') } catch {}
        }
      } catch {}
      setFreshOutlier(false)
    }
    setNav(target)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Geist', 'Inter', system-ui, sans-serif", background: C.bg }}>

      {/* ══ SIDEBAR ══════════════════════════════════════════════════════ */}
      <aside style={{
        width: 320, flexShrink: 0,
        background: SHELL.bg,
        borderRight: `1px solid ${SHELL.hair}`,
        position: 'sticky', top: 0, height: '100vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        zIndex: 10,
      }}>

        {/* Brand */}
        <a href="/" style={{ padding: '22px 22px 18px', display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0, borderBottom: `1px solid ${SHELL.hair}` }}>
          <Logo size={30} />
          {(() => { const pb = planBadge(billingPlan); return (
            <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 600, color: pb.color, background: pb.bg, border: `1px solid ${pb.bdr}`, padding: '2px 8px', borderRadius: 20, letterSpacing: '0.07em', textTransform: 'uppercase', flexShrink: 0 }}>{pb.label}</span>
          ) })()}
        </a>

        {/* Channel profile block */}
        {data && (
          <div style={{ padding: '16px 22px', flexShrink: 0 }}>
           <div style={{
             background: SHELL.cardBg,
             border: `1px solid ${SHELL.hair}`,
             borderRadius: 12,
             padding: '15px 16px 14px',
             boxShadow: SHELL.cardShadow,
           }}>
            {/* Avatar + name */}
            {channels.length >= 2
              ? <div style={{ marginBottom: 14 }}>
                  <ChannelSwitcher
                    channels={channels}
                    channelsAllowed={channelsAllowed}
                    canAddMore={canAddMore}
                    currentChannelId={data.channel.channel_id}
                  />
                </div>
              : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 16 }}>
                  {data.channel.thumbnail
                    ? <img src={data.channel.thumbnail} alt="" style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, boxShadow: `0 0 0 2px ${SHELL.hair}` }}/>
                    : <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(251,106,96,0.13)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600, color: '#fb6a60', flexShrink: 0, boxShadow: `0 0 0 2px ${SHELL.hair}` }}>{data.channel.channel_name[0].toUpperCase()}</div>
                  }
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: 14.5, fontWeight: 600, color: SHELL.text1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.25px', lineHeight: 1.2 }}>{data.channel.channel_name}</p>
                    <p style={{ fontSize: 12, color: SHELL.text2, marginTop: 3, fontVariantNumeric: 'tabular-nums' }}>{fmtNum(data.channel.subscribers)} subs</p>
                  </div>
                </div>
              )
            }
            {/* Health score bar. Uses on-dark color variants so the score
                and bar fill stop reading muddy against the dark profile
                card (the imported scoreColor returns the light-page red /
                amber / green which lose contrast here). */}
            {(() => {
              const onDarkScoreColor = score >= 75 ? '#34d27b'
                : score >= 50 ? '#f0a23b'
                : '#fb6a60'
              return (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                    <span style={{ fontSize: 10.5, fontWeight: 600, color: SHELL.text2, letterSpacing: '0.09em', textTransform: 'uppercase' }}>Channel health</span>
                    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 2, fontVariantNumeric: 'tabular-nums' }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: onDarkScoreColor, letterSpacing: '-0.4px', lineHeight: 1 }}>{score}</span>
                      <span style={{ fontSize: 10.5, fontWeight: 600, color: SHELL.text3 }}>/100</span>
                    </span>
                  </div>
                  <div style={{ background: SHELL.track, borderRadius: 99, height: 6, overflow: 'hidden' }}>
                    <div style={{
                      width: `${score}%`, height: '100%', background: onDarkScoreColor, borderRadius: 99,
                      transition: 'width 1.2s cubic-bezier(0.34,1.56,0.64,1)',
                    }}/>
                  </div>
                </div>
              )
            })()}
           </div>
          </div>
        )}

        {/* Nav — verbs first, features nested. Down from 14 flat items to
            4 primary verbs + Settings. Optimize and Research expand to
            show the existing feature pages; the verb itself is just the
            group toggle for now (verb landing pages come in a later
            commit). The 'nav' state values are unchanged so every
            existing page render below still works. */}
        <nav style={{ overflowY: 'auto', flex: 1, paddingTop: 12, paddingBottom: 8 }}>

          <NavBtn
            label="Feed"
            active={nav === 'Overview'}
            onClick={() => setNav('Overview')}
            badge={openPriorityCount}
          />

          <NavGroup
            label="Optimize"
            anyChildActive={['SEO Studio','Thumbnail Score','Video Ideas','Videos','Autopsy','Weekly Report'].includes(nav)}
          >
            <NavSubBtn label="SEO Studio"    active={nav === 'SEO Studio'}       onClick={() => setNav('SEO Studio')} />
            <NavSubBtn label="Thumbnails"    active={nav === 'Thumbnail Score'}  onClick={() => setNav('Thumbnail Score')} />
            <NavSubBtn label="Video Ideas"   active={nav === 'Video Ideas'}      onClick={() => setNav('Video Ideas')} />
            <NavSubBtn label="My Videos"     active={nav === 'Videos'}           onClick={() => setNav('Videos')} />
            <NavSubBtn label="Video Review"  active={nav === 'Autopsy'}          onClick={() => setNav('Autopsy')} />
            <NavSubBtn label="Weekly Report" active={nav === 'Weekly Report'}    onClick={() => setNav('Weekly Report')} />
          </NavGroup>

          <NavGroup
            label="Research"
            anyChildActive={['Outliers','Keywords','Competitors'].includes(nav)}
            dot={freshOutlier}
          >
            <NavSubBtn label="Outliers"    active={nav === 'Outliers'}    onClick={() => navigateTo('Outliers')} />
            <NavSubBtn label="Keywords"    active={nav === 'Keywords'}    onClick={() => setNav('Keywords')} />
            <NavSubBtn label="Competitors" active={nav === 'Competitors'} onClick={() => setNav('Competitors')} />
          </NavGroup>

          <ChatNav
            nav={nav}
            recent={recentChats}
            activeId={chatActiveId}
            onNew={startNewChat}
            onOpen={openChatConversation}
          />

          <div style={{ height: 18 }}/>

          {isAdmin && <NavBtn label="Admin" active={nav === 'Admin'} onClick={() => setNav('Admin')} />}
          <NavBtn label="Settings" active={nav === 'Settings'} onClick={() => setNav('Settings')} />

        </nav>

        {/* Sidebar footer — one tight block. Single divider, then a
            What's-new promo card, then UsageBar, then Refer | Sign out. */}
        {data && (
          <div style={{
            padding: '14px 16px 12px',
            borderTop: `1px solid ${SHELL.hair}`,
            flexShrink: 0,
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <WhatsNewCard
              channelId={data.channel?.channel_id}
              onNavigate={(target) => setNav(target)}
            />
            <UsageBar
              channelId={data.channel?.channel_id}
              email={data.channel?.email}
              dark={true}
              onPlan={setBillingPlan}
              onUsage={setUsagePct}
            />
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontFamily: "'Geist', 'Inter', system-ui, sans-serif",
              marginTop: 2,
            }}>
              <button
                onClick={() => setNav('Referrals')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 9px', borderRadius: 7,
                  background: nav === 'Referrals' ? SHELL.activeBg : 'transparent',
                  border: 'none', cursor: 'pointer',
                  color: nav === 'Referrals' ? C.red : SHELL.text2,
                  fontSize: 12, fontWeight: 500, letterSpacing: '-0.01em',
                  fontFamily: 'inherit',
                  transition: 'color 0.14s ease, background 0.14s ease',
                }}
                onMouseEnter={e => { if (nav !== 'Referrals') { e.currentTarget.style.color = SHELL.text1; e.currentTarget.style.background = SHELL.hoverBg } }}
                onMouseLeave={e => { if (nav !== 'Referrals') { e.currentTarget.style.color = SHELL.text2; e.currentTarget.style.background = 'transparent' } }}
              >
                <Gift size={13} strokeWidth={1.75} />
                <span>Refer & earn</span>
              </button>
              <a
                href="/auth/logout"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 9px', borderRadius: 7,
                  color: SHELL.text2, fontSize: 12, fontWeight: 500, letterSpacing: '-0.01em',
                  textDecoration: 'none',
                  transition: 'color 0.14s ease, background 0.14s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = SHELL.text1; e.currentTarget.style.background = SHELL.hoverBg }}
                onMouseLeave={e => { e.currentTarget.style.color = SHELL.text2; e.currentTarget.style.background = 'transparent' }}
              >
                <span>Sign out</span>
                <LogOut size={13} strokeWidth={1.75} />
              </a>
            </div>
          </div>
        )}
      </aside>

      {/* ══ MAIN ═════════════════════════════════════════════════════════ */}
      {/* Dark routes: pages already on the dark design system. The main
          column ground + topbar go dark for these so a dark page never
          sits on a light gutter / under a white topbar band. Add a route
          here as it is converted to dark. */}
      {(() => {
      const darkRoute = nav === 'Chat' || nav === 'Competitors' || nav === 'Keywords' || nav === 'Outliers' || nav === 'Weekly Report' || nav === 'Overview' || nav === 'Autopsy' || nav === 'Videos' || nav === 'Video Ideas' || nav === 'Thumbnail Score' || nav === 'SEO Studio' || nav === 'Settings'
      // The dark topbar is #0e0e10. For non-Chat dark pages the page
      // ground is the SAME #0e0e10 so the topbar is seamless (no lighter
      // band), matching how Chat reads. Chat keeps its own tuned ground
      // (#0a0a0c) because ChatCoach paints its own surface on top.
      const darkGround = nav === 'Chat' ? '#0a0a0c' : '#0e0e10'
      return (
      <div className={darkRoute ? 'ytg-dark' : undefined} style={{ flex: 1, overflow: 'auto', background: darkRoute ? darkGround : C.bg }}>

        {/* Topbar — light everywhere; dark on dark routes, using the
            locked shell shade so it does not sit as a white band over a
            dark page. Other pages are untouched. */}
        {(() => {
          const darkBar = darkRoute
          return (
        <div style={{
          borderBottom: darkBar ? 'none' : `1px solid ${C.border}`,
          background: darkBar ? '#0e0e10' : 'rgba(241,241,246,0.95)',
          backdropFilter: darkBar ? 'none' : 'blur(20px)',
          WebkitBackdropFilter: darkBar ? 'none' : 'blur(20px)',
          padding: '0 32px', height: 52,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: darkBar ? '#f4f4f5' : C.text1, letterSpacing: '-0.3px' }}>{nav}</span>
            {data && <>
              <span style={{ color: darkBar ? 'rgba(255,255,255,0.18)' : C.border, fontSize: 14 }}>·</span>
              <span style={{ fontSize: 13, fontWeight: 400, color: darkBar ? '#b2b3bb' : C.text3, letterSpacing: '-0.1px' }}>{data.channel?.channel_name}</span>
            </>}
          </div>
          <div style={{
            background: darkBar ? 'transparent' : C.surface,
            border: darkBar ? '1px solid rgba(255,255,255,0.08)' : `1px solid ${C.border}`,
            borderRadius: 100, padding: '5px 14px',
            display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: darkBar ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }}/>
            <span style={{ fontSize: 12, color: darkBar ? '#b2b3bb' : C.text3, fontWeight: 600 }}>Connected</span>
          </div>
        </div>
          )
        })()}

        {/* Page */}
        <div style={{ padding: '36px 40px 72px', animation: 'fadeUp 0.25s ease' }}>

          {/* Loading — skeleton placeholders matching the real Feed layout
              so the page doesn't feel like a blank spinner while data loads. */}
          {loading && (
            <div style={{ maxWidth: 1040, margin: '0 auto' }}>
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                  <div className="ytg-skel" style={{ width: 280, height: 26, borderRadius: 6, marginBottom: 10 }}/>
                  <div className="ytg-skel" style={{ width: 180, height: 14, borderRadius: 4 }}/>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div className="ytg-skel" style={{ width: 130, height: 34, borderRadius: 100 }}/>
                  <div className="ytg-skel" style={{ width: 130, height: 34, borderRadius: 100 }}/>
                </div>
              </div>
              {/* Hero tiles */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                <div className="ytg-skel" style={{ height: 140, borderRadius: 12 }}/>
                <div className="ytg-skel" style={{ height: 140, borderRadius: 12 }}/>
              </div>
              {/* Filter pills */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="ytg-skel" style={{ width: 90, height: 32, borderRadius: 100 }}/>
                ))}
              </div>
              {/* Card stream */}
              {[0, 1, 2].map(i => (
                <div key={i} className="ytg-skel" style={{ height: 140, borderRadius: 12, marginBottom: 12 }}/>
              ))}
              <p style={{
                textAlign: 'center', color: C.text3, fontSize: 12, fontWeight: 500,
                marginTop: 18, letterSpacing: '0.04em',
              }}>Analyzing your channel…</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12, textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 13, background: C.redBg, border: `1px solid ${C.redBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚠</div>
              <p style={{ fontSize: 18, fontWeight: 600, color: C.text1, letterSpacing: '-0.4px' }}>No channel data</p>
              <p style={{ fontSize: 14, color: C.text2, maxWidth: 280, lineHeight: 1.7 }}>Connect your YouTube channel to see your analytics.</p>
              <a href="/auth/login" className="ytg-dash-btn-primary" style={{ textDecoration: 'none', marginTop: 8 }}>Connect channel →</a>
            </div>
          )}

          {/* ── OVERVIEW ─────────────────────────────────────────────── */}
          {/* Feed lives in a centered 720px column inside the main area. The
              column stops cards from stretching edge to edge on wide screens
              and gives the page the focused, scannable feel of VidIQ. The
              sidebar is untouched; the whitespace either side of the column
              is just the main area minus 720px. */}
          {data && nav === 'Overview' && (
            <div className="ov-page" style={{ maxWidth: 1040, margin: '0 auto' }}>
              {(() => {
                const cid     = data.channel?.channel_id
                const forceOb = new URLSearchParams(window.location.search).get('onboarding') === 'preview'
                const ls      = (k) => { try { return cid && localStorage.getItem(`ytg_ob_${k}_${cid}`) === '1' } catch { return false } }
                const showOnboarding = !ls('dismissed') && (forceOb || ls('started'))

                const runFirstAudit = () => {
                  setReAuditError('')
                  setAnalyzingAI(true)
                  fetch('/auth/refresh-analysis', { method: 'POST', credentials: 'include' })
                    .then(async r => {
                      if (r.ok) { window.dispatchEvent(new CustomEvent('ytg:credits-changed')); return }
                      setAnalyzingAI(false)
                      if (r.status === 401) { window.location = '/'; return }
                      if (r.status === 402) { setCreditsOut(true); return }
                      const d = await r.json().catch(() => ({}))
                      setReAuditError(d.error || "Something went wrong on our end. Email support@ytgrowth.io and we'll sort it out.")
                      setTimeout(() => setReAuditError(''), 8000)
                    })
                    .catch(() => {
                      setAnalyzingAI(false)
                      setReAuditError("Couldn't reach our servers. Check your connection and try again.")
                      setTimeout(() => setReAuditError(''), 8000)
                    })
                }

                if (showOnboarding) {
                  return (
                    <OnboardingCard
                      channelName={data.channel?.channel_name}
                      trackedCompetitor={forceOb ? false : ls('comp')}
                      optimized={forceOb ? false : ls('seo')}
                      exploredIdeas={forceOb ? false : ls('idea')}
                      onNavigate={(t) => setNav(t)}
                      onDismiss={() => {
                        try { if (cid) localStorage.setItem(`ytg_ob_dismissed_${cid}`, '1') } catch {}
                        setObVer(v => v + 1)
                      }}
                    />
                  )
                }
                if (!analyzingAI && !data.insights) {
                  return (
                    <div className="ytg-card" style={{ padding: '28px 32px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 24 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: SHELL.text3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Start here</p>
                        <h2 style={{ fontSize: 22, fontWeight: 700, color: SHELL.text1, letterSpacing: '-0.5px', marginBottom: 6 }}>Run your first audit</h2>
                        <p style={{ fontSize: 13.5, color: SHELL.text2, lineHeight: 1.55, maxWidth: 520 }}>
                          We need to analyse your channel before we can show Priority Actions, growth patterns, and milestone tracking. Costs 1 credit and takes about 30 seconds.
                        </p>
                      </div>
                      <button className="ytg-dash-btn-primary" disabled={analyzingAI} onClick={runFirstAudit} style={{ flexShrink: 0 }}>
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                          <path d="M11.5 2A6 6 0 1 0 12 6.5"/><path d="M11.5 2v3h-3"/>
                        </svg>
                        <span>Run audit</span><span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginLeft: 2 }}>· 1 credit</span>
                      </button>
                    </div>
                  )
                }
                return null
              })()}
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <h1 style={{ fontSize: 26, fontWeight: 600, color: SHELL.text1, letterSpacing: '-0.7px', marginBottom: 6, lineHeight: 1.1 }}>
                    Good to see you{data.channel.channel_name ? <>, <span style={{ color: SHELL.text1, fontWeight: 600 }}>{data.channel.channel_name}</span></> : ''}.</h1>
                  <p style={{ fontSize: 13.5, color: SHELL.text2, fontWeight: 500, display: 'flex', gap: 0, flexWrap: 'wrap', letterSpacing: '-0.05px' }}>
                    {data.stats_fetched_at && (
                      <span>Stats from {relTime(data.stats_fetched_at)}</span>
                    )}
                    {data.analyzed_at && (
                      <span style={{ marginLeft: 8 }}>· Audited {relTime(data.analyzed_at)}</span>
                    )}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, marginBottom: 2 }}>
                  {/* Stale nudge — inline, only when credits available */}
                  {(() => {
                    const auditDate = parseUTC(data.analyzed_at)
                    const daysOld = auditDate ? (Date.now() - auditDate.getTime()) / 86400000 : 0
                    return daysOld > 7 && usagePct < 100 ? (
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#f0a23b' }}>Audit may be outdated</span>
                    ) : null
                  })()}

                  {/* Re-Audit */}
                  <button
                    className="ytg-dash-btn-primary"
                    disabled={analyzingAI}
                    onClick={() => {
                      const prevInsights = data?.insights
                      setReAuditError('')
                      setAnalyzingAI(true)
                      setData(prev => ({ ...prev, insights: null }))
                      fetch('/auth/refresh-analysis', { method: 'POST', credentials: 'include' })
                        .then(async r => {
                          if (r.ok) {
                            window.dispatchEvent(new CustomEvent('ytg:credits-changed'))
                            return
                          }
                          // Failure: restore prior insights, surface a clear message
                          setData(prev => ({ ...prev, insights: prevInsights }))
                          setAnalyzingAI(false)
                          if (r.status === 401) {
                            // Auth expired — bounce back to login.
                            window.location = '/'
                            return
                          }
                          if (r.status === 402) { setCreditsOut(true); return }
                          const d = await r.json().catch(() => ({}))
                          setReAuditError(d.error || "Something went wrong on our end. Email support@ytgrowth.io and we'll sort it out.")
                          setTimeout(() => setReAuditError(''), 8000)
                        })
                        .catch(() => {
                          setData(prev => ({ ...prev, insights: prevInsights }))
                          setAnalyzingAI(false)
                          setReAuditError("Couldn't reach our servers. Check your connection and try again.")
                          setTimeout(() => setReAuditError(''), 8000)
                        })
                    }}
                    style={{ opacity: analyzingAI ? 0.65 : 1 }}
                  >
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <path d="M11.5 2A6 6 0 1 0 12 6.5"/><path d="M11.5 2v3h-3"/>
                    </svg>
                    {analyzingAI ? 'Auditing…' : <><span>Re-Audit</span><span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginLeft: 2 }}>· 1 credit</span></>}
                  </button>

                  {/* Refresh stats — with flash feedback */}
                  <button
                    className="ytg-dash-btn"
                    disabled={refreshingStats}
                    onClick={() => {
                      setRefreshingStats(true)
                      setStatsFlash(null)
                      fetch('/auth/refresh-stats', { method: 'POST', credentials: 'include' })
                        .then(r => r.json())
                        .then(d => {
                          if (!d.error) {
                            setData(prev => ({
                              ...prev,
                              channel: d.channel,
                              videos: d.videos,
                              stats_fetched_at: d.stats_fetched_at,
                            }))
                            setVideos(d.videos || [])
                            setStatsFlash('ok')
                            if (d.new_milestones && d.new_milestones.length > 0) {
                              const nowIso = new Date().toISOString()
                              setCelebrateQueue(d.new_milestones.map(m => ({ ...m, achieved_at: nowIso })))
                              fetch('/auth/milestones', { credentials: 'include' })
                                .then(r => r.ok ? r.json() : null)
                                .then(m => { if (m && !m.error) setMilestones(m) })
                                .catch(() => {})
                            }
                          } else {
                            setStatsFlash('err')
                          }
                        })
                        .catch(() => setStatsFlash('err'))
                        .finally(() => {
                          setRefreshingStats(false)
                          setTimeout(() => setStatsFlash(null), 3000)
                        })
                    }}
                    style={{ position: 'relative' }}
                  >
                    {refreshingStats ? 'Refreshing…'
                      : statsFlash === 'ok'  ? <span style={{ color: '#34d27b' }}>Updated ✓</span>
                      : statsFlash === 'err' ? <span style={{ color: '#fb6a60' }}>Failed ✕</span>
                      : 'Refresh stats'}
                  </button>
                </div>
              </div>

              {/* Re-Audit error message — surfaces backend errors / network drops so the user
                  isn't left wondering why nothing happened after clicking Re-Audit. */}
              {reAuditError && (
                <div style={{
                  marginBottom: 14,
                  display: 'flex', alignItems: 'center', gap: 9,
                  fontSize: 13, color: '#fb6a60',
                  background: 'rgba(229,37,27,0.06)',
                  border: '1px solid rgba(229,37,27,0.18)',
                  borderRadius: 9, padding: '9px 13px',
                }}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="6.5" cy="6.5" r="5"/><path d="M6.5 4v3M6.5 9v.5"/>
                  </svg>
                  {reAuditError}
                </div>
              )}

              {/* ── HERO STRIP — 4 inline tiles separated by hairlines, no
                    per-tile card border. One unified surface that reads as
                    a scoreboard. Replaces the 2 fat HeroStatCards. ───── */}
              {(() => {
                const subs = data.channel.subscribers || 0
                const tv   = data.channel.total_views || 0
                const subTarget = nextSubMilestone(subs)
                const viewTarget = nextViewMilestone(tv)
                const subPct  = subTarget > 0 ? Math.max(2, Math.min(100, (subs / subTarget) * 100)) : 0
                const viewPct = viewTarget > 0 ? Math.max(2, Math.min(100, (tv / viewTarget) * 100)) : 0
                const subDelta  = data.analytics?.net_subscribers_90d
                const viewDelta = data.analytics?.views_90d
                const subsSeries = data.analytics?.subs_series_28d
                const channelScore = data.insights?.channelScore
                const haveScore = typeof channelScore === 'number'
                // On-dark variants so the score reads with weight against
                // the Channel Snapshot card instead of muddy red-on-red /
                // dim green-on-green.
                const scoreColor = !haveScore ? SHELL.text3
                  : channelScore >= 70 ? '#34d27b'
                  : channelScore >= 50 ? SHELL.text1
                  : '#fb6a60'
                const scoreLabel = !haveScore ? 'Awaiting audit'
                  : channelScore >= 70 ? 'Strong'
                  : channelScore >= 50 ? 'Steady'
                  : 'Needs work'

                const eyebrow = {
                  fontSize: 11, fontWeight: 600, color: SHELL.text3,
                  letterSpacing: '0.10em', textTransform: 'uppercase', margin: 0,
                }
                const bigNum = {
                  fontSize: 30, fontWeight: 600, color: SHELL.text1,
                  letterSpacing: '-1.0px', lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                }
                const subMeta = {
                  fontSize: 11.5, fontWeight: 500, color: SHELL.text2,
                  letterSpacing: '-0.05px', fontVariantNumeric: 'tabular-nums',
                  margin: 0,
                }
                const renderDeltaChip = (d) => {
                  if (d === null || d === undefined || Number.isNaN(Number(d))) return null
                  const n = Number(d)
                  const pos = n >= 0
                  // Brighter on-dark variants so the chip pops against the
                  // dark Channel Snapshot card instead of looking muddy red
                  // on red-tinted background.
                  const color = pos ? '#34d27b' : '#fb6a60'
                  const bg    = pos ? 'rgba(52,210,123,0.14)' : 'rgba(251,106,96,0.13)'
                  const bdr   = pos ? 'rgba(52,210,123,0.34)' : 'rgba(251,106,96,0.32)'
                  return (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 3,
                      fontSize: 10.5, fontWeight: 600, color,
                      background: bg, border: `1px solid ${bdr}`,
                      padding: '1px 7px', borderRadius: 100,
                      letterSpacing: '-0.05px', fontVariantNumeric: 'tabular-nums',
                    }}>
                      <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ transform: pos ? 'none' : 'rotate(180deg)' }}>
                        <path d="M5 8V2M2.5 4.5 5 2l2.5 2.5"/>
                      </svg>
                      {pos ? '+' : ''}{fmtNum(Math.abs(n))}
                    </span>
                  )
                }
                const renderMilestoneBar = (pct) => {
                  // Nearing the next milestone (>= 70%) reads as a positive
                  // status, so the bar switches to a vivid green gradient.
                  // Below that, it stays the brand red gradient.
                  const nearing = pct >= 70
                  const gradient = nearing
                    ? 'linear-gradient(90deg, rgba(52,210,123,0.55) 0%, #34d27b 100%)'
                    : 'linear-gradient(90deg, rgba(229,37,27,0.55) 0%, #e5251b 100%)'
                  return (
                    <div style={{
                      height: 3, background: 'rgba(255,255,255,0.10)', borderRadius: 99, overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${pct}%`, height: '100%',
                        background: gradient,
                        borderRadius: 99,
                        transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)',
                      }}/>
                    </div>
                  )
                }

                return (
                  <article style={{
                    background: SHELL.cardFlat,
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 14,
                    padding: '14px 18px 16px 18px',
                    boxShadow: '0 1px 2px rgba(255,255,255,0.04), 0 6px 18px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.7)',
                    marginBottom: 28,
                  }}>
                    {/* Uniform 16/600 title inside the card — matches Add
                        Description / Title Suggestion chassis. */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                      <h3 style={{
                        fontSize: 16, fontWeight: 600, color: SHELL.text1,
                        letterSpacing: '-0.2px', lineHeight: 1.3, margin: 0,
                      }}>Channel Snapshot</h3>
                      <span style={{
                        fontSize: 12.5, fontWeight: 450, color: SHELL.text3,
                        letterSpacing: '-0.01em',
                      }}>· {data.channel.channel_name || 'your channel'}</span>
                    </div>

                    <div className="ov-hero-strip" style={{ marginBottom: 0 }}>

                    {/* Tile 1: Subscribers + 90d delta + milestone bar */}
                    <div className="ov-hero-tile">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <p style={eyebrow}>Subscribers</p>
                        {renderDeltaChip(subDelta)}
                      </div>
                      <p style={bigNum}>{fmtNum(subs)}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 'auto' }}>
                        {renderMilestoneBar(subPct)}
                        <p style={subMeta}>Next <span style={{ color: SHELL.text1, fontWeight: 600 }}>{fmtNum(subTarget)}</span></p>
                      </div>
                    </div>

                    {/* Tile 2: Total views + 90d delta + milestone bar */}
                    <div className="ov-hero-tile">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <p style={eyebrow}>Total views</p>
                        {renderDeltaChip(viewDelta)}
                      </div>
                      <p style={bigNum}>{fmtNum(tv)}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 'auto' }}>
                        {renderMilestoneBar(viewPct)}
                        <p style={subMeta}>Next <span style={{ color: SHELL.text1, fontWeight: 600 }}>{fmtNum(viewTarget)}</span></p>
                      </div>
                    </div>

                    {/* Tile 3: 28-day momentum (real sparkline or analytics nudge) */}
                    <div className="ov-hero-tile">
                      <p style={eyebrow}>28-day momentum</p>
                      {subsSeries && subsSeries.length >= 2 ? (() => {
                        // Steadily rising = recent half outperforms the
                        // earlier half AND the final value beats the first.
                        // Both clauses guard against single-spike noise.
                        const half = Math.floor(subsSeries.length / 2)
                        const avg = (arr) => arr.reduce((s, v) => s + v, 0) / arr.length
                        const rising = avg(subsSeries.slice(half)) > avg(subsSeries.slice(0, half))
                          && subsSeries[subsSeries.length - 1] > subsSeries[0]
                        const stroke = rising ? '#34d27b' : '#e5251b'
                        const fill   = rising ? 'rgba(52,210,123,0.14)' : 'rgba(229,37,27,0.10)'
                        return (
                        <>
                          <div style={{ marginTop: -2 }}>
                            <Sparkline data={subsSeries} width={200} height={54} stroke={stroke} fill={fill} />
                          </div>
                          <p style={{ ...subMeta, marginTop: 'auto' }}>
                            Daily subscriber net since {new Date(Date.now() - 27 * 86400000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </p>
                        </>
                        )
                      })() : (
                        <>
                          <p style={{ fontSize: 13, fontWeight: 500, color: SHELL.text2, lineHeight: 1.4, margin: 0 }}>
                            Connect YouTube Analytics on your next reconnect to unlock the 28-day trend line.
                          </p>
                          <p style={{ ...subMeta, marginTop: 'auto', color: SHELL.text3 }}>Not connected</p>
                        </>
                      )}
                    </div>

                    {/* Tile 4: Channel health score */}
                    <div className="ov-hero-tile">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <p style={eyebrow}>Channel health</p>
                        {haveScore && (
                          <span style={{
                            fontSize: 10.5, fontWeight: 600, color: scoreColor,
                            background: channelScore >= 70 ? 'rgba(22,163,74,0.14)'
                                      : channelScore >= 50 ? 'rgba(255,255,255,0.06)'
                                      : 'rgba(229,37,27,0.07)',
                            border: `1px solid ${channelScore >= 70 ? 'rgba(22,163,74,0.34)' : channelScore >= 50 ? 'rgba(255,255,255,0.12)' : 'rgba(229,37,27,0.20)'}`,
                            padding: '1px 8px', borderRadius: 100, letterSpacing: '-0.05px',
                          }}>{scoreLabel}</span>
                        )}
                      </div>
                      <p style={{ ...bigNum, color: scoreColor }}>{haveScore ? channelScore : '—'}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 'auto' }}>
                        <div style={{ height: 3, background: 'rgba(255,255,255,0.10)', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{
                            width: haveScore ? `${channelScore}%` : '0%', height: '100%',
                            background: scoreColor, borderRadius: 99,
                            transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)',
                          }}/>
                        </div>
                        <p style={subMeta}>{haveScore ? <>Out of <span style={{ color: SHELL.text1, fontWeight: 600 }}>100</span></> : 'Run an audit'}</p>
                      </div>
                    </div>

                    </div>
                  </article>
                )
              })()}

              {/* Analytics-missing nudge — moved here from the quick-stats
                  strip (the strip is gone in the Feed redesign). */}
              {!data.analytics && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(217,119,6,0.14)', border: `1px solid rgba(217,119,6,0.34)`, borderLeft: `3px solid ${'#f0a23b'}`, borderRadius: '0 12px 12px 0', padding: '10px 16px', marginBottom: 18 }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={'#f0a23b'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <circle cx="8" cy="8" r="6.5"/><line x1="8" y1="5" x2="8" y2="8.5"/><circle cx="8" cy="11" r="0.7" fill={'#f0a23b'} stroke="none"/>
                  </svg>
                  <p style={{ fontSize: 12.5, color: SHELL.text2, lineHeight: 1.55 }}>
                    Grant <strong style={{ fontWeight: 600 }}>YouTube Analytics read access</strong> on the next reconnect to unlock retention, duration, and 90-day subscriber data.
                  </p>
                </div>
              )}

              {/* ── FEED CARD STREAM ──────────────────────────────────────
                  Restructured into 5 themed sections under H2 headers
                  ("What to do next", "Recent wins", "Your niche", "How
                  you publish", "Channel health"). Each card is rendered
                  inside the section that matches its purpose, instead of
                  one long mixed stream. Filter-pill behaviour is
                  preserved per card. */}

              {/* All the per-card render blocks are computed up-front into
                  variables so the JSX layout below can place them under
                  themed H2 sections without losing any conditional logic,
                  filter behaviour, or dismiss handlers. A `null` block
                  means that card has no data / was dismissed / is filtered
                  out — the section header only renders when at least one
                  block in the group will render. */}
              {(() => {
                // ── WHAT TO DO NEXT blocks ──
                // The 3 stacked PriorityActionCards (each rendering the full
                // AI `problem` diagnosis as a bold paragraph headline) are
                // replaced with ONE compact rail card holding 3 short rows.
                // Each row shows just the action verb (action.action, ~1
                // sentence) - the long analytical problem text is now only
                // visible when the row is expanded.
                const priorityActionsBlock = data.insights?.priorityActions ? (() => {
                  const all = data.insights.priorityActions
                  const open = []
                  for (let i = 0; i < all.length; i++) {
                    const a = all[i]
                    const rank = a.rank ?? (i + 1)
                    const k = `rank_${rank}`
                    if (!checked[k] && !deleted[k]) open.push({ a, rank, k, idx: i })
                    if (open.length >= 3) break
                  }
                  if (open.length === 0) return null
                  return (
                    <ActionsRailCard
                      key="actions-rail"
                      items={open.map(({ a, rank, k, idx }) => {
                        const impact = (a.impact || (idx === 0 ? 'high' : idx === 1 ? 'med' : 'low'))
                        const target = categoryToNav(a.category, a.problem)
                        const ctaLabel = target === 'SEO Studio' ? 'SEO Studio'
                          : target === 'Thumbnail Score' ? 'Thumbnails'
                          : target === 'Video Ideas' ? 'Video Ideas'
                          : target === 'Outliers' ? 'Outliers'
                          : target === 'Keywords' ? 'Keywords'
                          : target === 'Competitors' ? 'Competitors'
                          : 'Audit'
                        return {
                          rank, key: k, action: a, impact, ctaLabel,
                          onAct: () => target ? setNav(target) : setAuditOpen(true),
                          onDone: () => {
                            const next = { ...checked, [k]: true }
                            setChecked(next)
                            if (data?.channel?.channel_id) {
                              try { localStorage.setItem(`ytg_checked_${data.channel.channel_id}`, JSON.stringify(next)) } catch {}
                            }
                          },
                          onDismiss: () => {
                            const next = { ...deleted, [k]: true }
                            setDeleted(next)
                            if (data?.channel?.channel_id) {
                              try { localStorage.setItem(`ytg_deleted_${data.channel.channel_id}`, JSON.stringify(next)) } catch {}
                            }
                          },
                        }
                      })}
                    />
                  )
                })() : null

                const dailyIdeasBlock = dailyIdeas?.ideas?.length > 0 ? (() => {
                  const dismissKey = `ytg_daily_ideas_dismissed:${data?.channel?.channel_id || 'x'}`
                  try { if (localStorage.getItem(dismissKey)) return null } catch {}
                  return (
                    <DailyIdeasCard
                      ideas={dailyIdeas.ideas}
                      lastUpdated={dailyIdeas.last_updated}
                      isStale={dailyIdeas.stale}
                      isFree={dailyIdeas.free_capped}
                      refreshing={refreshingIdeas}
                      onUse={(idea) => {
                        try {
                          if (idea.title) sessionStorage.setItem('seoOptimizer_prefilledTitle', idea.title)
                          if (idea.targetKeyword) sessionStorage.setItem('seoOptimizer_prefilledKeyword', idea.targetKeyword)
                        } catch {}
                        setNav('SEO Studio')
                      }}
                      onRefresh={() => {
                        if (refreshingIdeas) return
                        setRefreshingIdeas(true)
                        fetch('/video-ideas/refresh', { method: 'POST', credentials: 'include' })
                          .then(r => r.ok ? r.json() : null)
                          .then(d => { if (d && !d.error) setDailyIdeas(d) })
                          .catch(() => {})
                          .finally(() => setRefreshingIdeas(false))
                      }}
                      onOpenAll={() => setNav('Video Ideas')}
                      onDismiss={() => {
                        try { localStorage.setItem(dismissKey, '1') } catch {}
                        setChecked(prev => ({ ...prev }))
                      }}
                    />
                  )
                })() : null

                // ── RECENT WINS blocks ──
                const milestoneBlock = milestones?.earned?.[0] ? (() => {
                  const m = milestones.earned[0]
                  const earnedAt = m.earned_at ? new Date(m.earned_at).getTime() : 0
                  const ageMs = Date.now() - earnedAt
                  const SHOW_FOR = 30 * 24 * 60 * 60 * 1000
                  if (!earnedAt || ageMs > SHOW_FOR) return null
                  const dismissKey = `ytg_milestone_dismissed:${data.channel?.channel_id || 'x'}:${m.category}:${m.tier}`
                  try { if (localStorage.getItem(dismissKey)) return null } catch {}
                  const labelCat = m.category === 'subs' ? 'subscribers'
                    : m.category === 'views' ? 'total views'
                    : m.category === 'watch_hours' ? 'watch hours'
                    : m.category
                  const headline = `${fmtNum(m.threshold || m.value)} ${labelCat}`
                  const days = Math.floor(ageMs / 86400000)
                  return (
                    <MilestoneFeedCard
                      milestone={{
                        headline,
                        body: m.celebration || `You crossed ${fmtNum(m.threshold || m.value)} ${labelCat}. Worth a screenshot.`,
                        earned_age: days === 0 ? 'today' : days === 1 ? 'yesterday' : `${days}d ago`,
                      }}
                      onShare={() => setShareMilestone(m)}
                      onDismiss={() => {
                        try { localStorage.setItem(dismissKey, '1') } catch {}
                        setChecked(prev => ({ ...prev }))
                      }}
                    />
                  )
                })() : null

                const trackedLiftBlock = trackedLift && trackedLift.top ? (() => {
                  const w = trackedLift.top
                  const dismissKey = `ytg_tracked_lift_dismissed:${data?.channel?.channel_id || 'x'}:${w.video_id}:${w.optimized_at}`
                  try { if (localStorage.getItem(dismissKey)) return null } catch {}
                  return (
                    <TrackedLiftCard
                      win={w}
                      moreCount={trackedLift.count > 1 ? trackedLift.count - 1 : 0}
                      onOpenAll={() => setNav('SEO Studio')}
                      onDismiss={() => {
                        try { localStorage.setItem(dismissKey, '1') } catch {}
                        setChecked(prev => ({ ...prev }))
                      }}
                    />
                  )
                })() : null

                // ── YOUR NICHE blocks ──
                const nicheHeroBlock = (
                  <NicheHeroCard
                    key="nichehero"
                    channelId={data?.channel?.channel_id}
                    onNavigate={(target) => setNav(target)}
                    onBundleLoaded={handleOutlierBundleLoaded}
                    onOpenSeoStudio={(title, keyword) => {
                      try {
                        if (title) {
                          sessionStorage.setItem('seoOptimizer_prefilledTitle', title)
                          if (keyword) sessionStorage.setItem('seoOptimizer_prefilledKeyword', keyword)
                        }
                      } catch {}
                      setNav('SEO Studio')
                    }}
                  />
                )

                const titleSuggestionBlock = titleSuggestion?.video && titleSuggestion?.suggestions?.length ? (() => {
                  const dismissKey = `ytg_title_suggestion_dismissed_v5:${data?.channel?.channel_id || 'x'}:${titleSuggestion.video.video_id || 'x'}`
                  try { if (localStorage.getItem(dismissKey)) return null } catch {}
                  return (
                    <TitleSuggestionCard
                      key="title-suggestion"
                      video={titleSuggestion.video}
                      suggestions={titleSuggestion.suggestions}
                      ageLabel={titleSuggestion.age_label || ''}
                      applyingIdx={titleApplyingIdx}
                      appliedIdx={titleAppliedIdx}
                      applyError={titleApplyError}
                      onApply={async (s, i, vid) => {
                        if (!s?.title || !vid?.video_id) return
                        setTitleApplyingIdx(i)
                        setTitleApplyError('')
                        try {
                          const res = await fetch('/seo/update-video', {
                            method: 'POST',
                            credentials: 'include',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ video_id: vid.video_id, title: s.title }),
                          })
                          const d = await res.json().catch(() => ({}))
                          if (!res.ok || d?.error) {
                            setTitleApplyError(d?.error || 'Update failed. Try again.')
                          } else {
                            setTitleAppliedIdx(i)
                          }
                        } catch {
                          setTitleApplyError('Could not reach the server.')
                        } finally {
                          setTitleApplyingIdx(null)
                        }
                      }}
                      onOpenStudio={() => {
                        try {
                          if (titleSuggestion.video?.title) sessionStorage.setItem('seoOptimizer_prefilledTitle', titleSuggestion.video.title)
                        } catch {}
                        setNav('SEO Studio')
                      }}
                      onDismiss={() => {
                        try { localStorage.setItem(dismissKey, '1') } catch {}
                        setChecked(prev => ({ ...prev }))
                      }}
                    />
                  )
                })() : null

                const unansweredCommentBlock = unansweredComment?.comment && unansweredComment?.replies?.length ? (() => {
                  const dismissKey = `ytg_unanswered_comment_dismissed:${data?.channel?.channel_id || 'x'}:${unansweredComment.comment.comment_id || 'x'}`
                  try { if (localStorage.getItem(dismissKey)) return null } catch {}
                  return (
                    <UnansweredCommentCard
                      key="unanswered-comment"
                      video={unansweredComment.video}
                      comment={unansweredComment.comment}
                      replies={unansweredComment.replies}
                      posting={replyPosting}
                      posted={replyPosted}
                      postError={replyPostError}
                      onPost={async (replyText, c) => {
                        const parentId = c?.thread_id || c?.comment_id
                        if (!parentId || !replyText) return
                        setReplyPosting(true)
                        setReplyPostError('')
                        try {
                          const res = await fetch('/dashboard/post-comment-reply', {
                            method: 'POST',
                            credentials: 'include',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ parent_id: parentId, reply_text: replyText }),
                          })
                          const d = await res.json().catch(() => ({}))
                          if (!res.ok || d?.ok === false) {
                            setReplyPostError(d?.error || 'Could not post reply. Try again.')
                          } else {
                            setReplyPosted(true)
                          }
                        } catch {
                          setReplyPostError('Could not reach the server.')
                        } finally {
                          setReplyPosting(false)
                        }
                      }}
                      onDismiss={() => {
                        try { localStorage.setItem(dismissKey, '1') } catch {}
                        setChecked(prev => ({ ...prev }))
                      }}
                    />
                  )
                })() : null

                const missingTagsBlock = missingTags?.video && missingTags?.tag_sets?.length ? (() => {
                  const dismissKey = `ytg_missing_tags_dismissed:${data?.channel?.channel_id || 'x'}:${missingTags.video.video_id || 'x'}`
                  try { if (localStorage.getItem(dismissKey)) return null } catch {}
                  return (
                    <MissingTagsCard
                      key="missing-tags"
                      video={missingTags.video}
                      tagSets={missingTags.tag_sets}
                      ageLabel={missingTags.age_label || ''}
                      publishing={tagsPublishing}
                      published={tagsPublished}
                      publishError={tagsPublishError}
                      onPublish={async (tags, vid) => {
                        if (!tags?.length || !vid?.video_id) return
                        setTagsPublishing(true)
                        setTagsPublishError('')
                        try {
                          const res = await fetch('/seo/update-video', {
                            method: 'POST',
                            credentials: 'include',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ video_id: vid.video_id, tags }),
                          })
                          const d = await res.json().catch(() => ({}))
                          if (!res.ok || d?.error) {
                            setTagsPublishError(d?.error || 'Update failed. Try again.')
                          } else {
                            setTagsPublished(true)
                          }
                        } catch {
                          setTagsPublishError('Could not reach the server.')
                        } finally {
                          setTagsPublishing(false)
                        }
                      }}
                      onDismiss={() => {
                        try { localStorage.setItem(dismissKey, '1') } catch {}
                        setChecked(prev => ({ ...prev }))
                      }}
                    />
                  )
                })() : null

                const missingDescriptionBlock = missingDescription?.video && missingDescription?.drafts?.length ? (() => {
                  const dismissKey = `ytg_missing_description_dismissed:${data?.channel?.channel_id || 'x'}:${missingDescription.video.video_id || 'x'}`
                  try { if (localStorage.getItem(dismissKey)) return null } catch {}
                  return (
                    <MissingDescriptionCard
                      key="missing-description"
                      video={missingDescription.video}
                      drafts={missingDescription.drafts}
                      ageLabel={missingDescription.age_label || ''}
                      publishing={descPublishing}
                      published={descPublished}
                      publishError={descPublishError}
                      onPublish={async (draft, vid) => {
                        if (!draft || !vid?.video_id) return
                        setDescPublishing(true)
                        setDescPublishError('')
                        try {
                          const res = await fetch('/seo/update-video', {
                            method: 'POST',
                            credentials: 'include',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ video_id: vid.video_id, description: draft }),
                          })
                          const d = await res.json().catch(() => ({}))
                          if (!res.ok || d?.error) {
                            setDescPublishError(d?.error || 'Update failed. Try again.')
                          } else {
                            setDescPublished(true)
                          }
                        } catch {
                          setDescPublishError('Could not reach the server.')
                        } finally {
                          setDescPublishing(false)
                        }
                      }}
                      onDismiss={() => {
                        try { localStorage.setItem(dismissKey, '1') } catch {}
                        setChecked(prev => ({ ...prev }))
                      }}
                    />
                  )
                })() : null

                const suggestedCompetitorsBlock = suggestedCompetitors?.suggestions?.length >= 2 ? (() => {
                  const dismissKey = `ytg_suggested_competitors_dismissed:${data?.channel?.channel_id || 'x'}`
                  try { if (localStorage.getItem(dismissKey)) return null } catch {}
                  return (
                    <SuggestedCompetitorsCard
                      key="suggested-competitors"
                      suggestions={suggestedCompetitors.suggestions}
                      category={suggestedCompetitors.category}
                      onTrack={(c) => {
                        // Stash the channel name and land the user on the
                        // Competitors page's Search tab with that query
                        // pre-run. They hit the actual Track (analyze)
                        // button there — keeps the credit-spend explicit.
                        try {
                          const q = c.channel_name || c.handle || ''
                          if (q) sessionStorage.setItem('competitors_prefilledQuery', q)
                        } catch {}
                        setNav('Competitors')
                      }}
                      onOpenAll={() => setNav('Competitors')}
                      onDismiss={() => {
                        try { localStorage.setItem(dismissKey, '1') } catch {}
                        setChecked(prev => ({ ...prev }))
                      }}
                    />
                  )
                })() : null

                const topSearchTermsBlock = topSearchTerms?.items?.length ? (() => {
                  const dismissKey = `ytg_top_search_terms_dismissed:${data?.channel?.channel_id || 'x'}`
                  try { if (localStorage.getItem(dismissKey)) return null } catch {}
                  return (
                    <TopSearchTermsCard
                      key="top-search-terms"
                      items={topSearchTerms.items}
                      refreshedAt={topSearchTerms.refreshed_at}
                      onResearch={(kw) => {
                        // Land user on Keyword Research with the term
                        // pre-filled, same pattern as Suggested Competitors.
                        try { if (kw) sessionStorage.setItem('keywords_prefilledQuery', kw) } catch {}
                        setNav('Keywords')
                      }}
                      onDismiss={() => {
                        try { localStorage.setItem(dismissKey, '1') } catch {}
                        setChecked(prev => ({ ...prev }))
                      }}
                    />
                  )
                })() : null

                const relatedTrafficBlock = relatedTraffic ? (() => {
                  // Dismiss key bumped to v2 so any leftover dismissals
                  // from the previous render-only-when-populated version
                  // don't keep the new card hidden.
                  const dismissKey = `ytg_related_traffic_dismissed_v2:${data?.channel?.channel_id || 'x'}`
                  try { if (localStorage.getItem(dismissKey)) return null } catch {}
                  // Relative age from refreshed_at — soft "Nd ago" label.
                  let ageLabel = ''
                  try {
                    if (relatedTraffic.refreshed_at) {
                      const ts = new Date(relatedTraffic.refreshed_at).getTime()
                      const days = Math.max(0, Math.floor((Date.now() - ts) / 86400000))
                      ageLabel = days === 0 ? 'today' : days === 1 ? '1d ago' : `${days}d ago`
                    }
                  } catch {}
                  return (
                    <RelatedTrafficCard
                      key="related-traffic"
                      items={relatedTraffic.items || []}
                      ageLabel={ageLabel}
                      reason={relatedTraffic.reason || ''}
                      rawSourceCount={relatedTraffic.raw_source_count || 0}
                      onOpen={(it) => {
                        if (!it?.video_id) return
                        try { window.open(`https://www.youtube.com/watch?v=${it.video_id}`, '_blank', 'noopener,noreferrer') } catch {}
                      }}
                      onDismiss={() => {
                        try { localStorage.setItem(dismissKey, '1') } catch {}
                        setChecked(prev => ({ ...prev }))
                      }}
                    />
                  )
                })() : null

                const competitorActivityBlock = ((competitorActivity?.items?.length || 0) > 0 || (competitorActivity?.competitor_count || 0) > 0) ? (() => {
                  const dismissKey = `ytg_competitor_activity_dismissed:${data?.channel?.channel_id || 'x'}`
                  try { if (localStorage.getItem(dismissKey)) return null } catch {}
                  return (
                    <CompetitorActivityCard
                      items={competitorActivity.items}
                      competitorCount={competitorActivity.competitor_count}
                      refreshing={refreshingCompActivity}
                      onRefresh={() => {
                        if (refreshingCompActivity) return
                        setRefreshingCompActivity(true)
                        fetch('/dashboard/competitor-activity?force=1', { credentials: 'include' })
                          .then(r => r.ok ? r.json() : null)
                          .then(d => { if (d && !d.error) setCompetitorActivity(d) })
                          .catch(() => {})
                          .finally(() => setRefreshingCompActivity(false))
                      }}
                      onOpenAll={() => setNav('Competitors')}
                      onDismiss={() => {
                        try { localStorage.setItem(dismissKey, '1') } catch {}
                        setChecked(prev => ({ ...prev }))
                      }}
                    />
                  )
                })() : null

                // ── HOW YOU PUBLISH blocks ──
                const postingConsistencyBlock = videos && videos.length > 0 ? (() => {
                  const dismissKey = `ytg_posting_consistency_dismissed:${data?.channel?.channel_id || 'x'}`
                  try { if (localStorage.getItem(dismissKey)) return null } catch {}
                  return (
                    <PostingConsistencyCard
                      videos={videos}
                      onDismiss={() => {
                        try { localStorage.setItem(dismissKey, '1') } catch {}
                        setChecked(prev => ({ ...prev }))
                      }}
                    />
                  )
                })() : null

                const bestTimeBlock = videos && videos.length >= 5 ? (() => {
                  const dismissKey = `ytg_best_time_dismissed:${data?.channel?.channel_id || 'x'}`
                  try { if (localStorage.getItem(dismissKey)) return null } catch {}
                  return (
                    <BestTimeCard
                      videos={videos}
                      onDismiss={() => {
                        try { localStorage.setItem(dismissKey, '1') } catch {}
                        setChecked(prev => ({ ...prev }))
                      }}
                    />
                  )
                })() : null

                // ── CHANNEL HEALTH block (full row) ──
                const channelHealthBlock = (patterns || data.insights) ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'stretch' }}>
                    {patterns && (
                      <ContentMixFeedCard
                        patterns={{
                          headline: patterns.headline || (
                            patterns.shortAvg > patterns.longAvg
                              ? 'Shorts beat your long-form'
                              : patterns.longAvg > patterns.shortAvg
                                ? 'Long-form beats your Shorts'
                                : 'Your content mix'
                          ),
                          body: patterns.body || patterns.text || patterns.summary || (
                            patterns.shortAvg > patterns.longAvg
                              ? `Shorts outperform long-form by ${fmtNum(patterns.shortAvg - patterns.longAvg)} views on average. Lean into Shorts for discovery.`
                              : patterns.longAvg > patterns.shortAvg
                                ? `Long-form outperforms Shorts by ${fmtNum(patterns.longAvg - patterns.shortAvg)} views. Your audience wants depth.`
                                : 'Both formats are performing similarly on your channel.'
                          ),
                          shortAvg: patterns.shortAvg,
                          longAvg: patterns.longAvg,
                        }}
                        mix={{
                          shortsCount: patterns.shortsCount,
                          longsCount: patterns.longsCount,
                        }}
                        fillHeight
                      />
                    )}

                    {data.insights && (() => {
                      const cs = data.insights.categoryScores || {}
                      const surfaced = [
                        ['CTR',         cs.ctrHealth],
                        ['Retention',   cs.audienceRetention],
                        ['Strategy',    cs.contentStrategy],
                        ['Consistency', cs.postingConsistency],
                        ['Engagement',  cs.engagementQuality],
                      ].filter(([, v]) => typeof v === 'number')
                      const fullEntries = [
                        ['CTR health', cs.ctrHealth],
                        ['Audience retention', cs.audienceRetention],
                        ['Content strategy', cs.contentStrategy],
                        ['Posting consistency', cs.postingConsistency],
                        ['Engagement quality', cs.engagementQuality],
                        ['SEO discoverability', cs.seoDiscoverability],
                        ['Video length', cs.videoLength],
                        ['Traffic source intel', cs.trafficSourceIntelligence],
                      ].filter(([, v]) => typeof v === 'number')
                      const weakest = fullEntries
                        .filter(([, v]) => v != null && v < 50)
                        .sort((a, b) => a[1] - b[1])
                        .slice(0, 2)
                        .map(([k]) => k)
                      return (
                        <ChannelHealthFeedCard
                          score={score}
                          categories={surfaced}
                          weakest={weakest}
                          open={auditOpen}
                          onToggle={() => setAuditOpen(o => !o)}
                          fillHeight
                        />
                      )
                    })()}
                  </div>
                ) : null

                // ── FEED REGISTRY ──────────────────────────────────
                // Single source of truth for which category each card
                // belongs to. The render order below is also the All
                // tab's visual order. Filtering by tab is a pure
                // projection of this list — Insights tab = entries
                // with category 'insights' that have data, Actions
                // tab = category 'actions' with data, etc. Add a new
                // card by appending one line.
                const FEED = [
                  // Title Suggestion already shows the top-performing video
                  // (thumb + view count) inline, so no standalone Top
                  // Performer card. Lead with the merged card directly
                  // after the stat strip.
                  { category: 'actions',      block: titleSuggestionBlock },
                  { category: 'actions',      block: priorityActionsBlock },
                  { category: 'actions',      block: missingDescriptionBlock },
                  { category: 'insights',     block: nicheHeroBlock },
                  { category: 'actions',      block: missingTagsBlock },
                  { category: 'insights',     block: postingConsistencyBlock },
                  { category: 'actions',      block: unansweredCommentBlock },
                  { category: 'insights',     block: suggestedCompetitorsBlock },
                  { category: 'insights',     block: topSearchTermsBlock },
                  { category: 'insights',     block: relatedTrafficBlock },
                  { category: 'actions',      block: dailyIdeasBlock },
                  { category: 'insights',     block: bestTimeBlock },
                  { category: 'insights',     block: competitorActivityBlock },
                  { category: 'achievements', block: trackedLiftBlock },
                  { category: 'achievements', block: milestoneBlock },
                  { category: 'insights',     block: channelHealthBlock },
                ]

                const counts = {
                  all: null,
                  actions:      FEED.filter(i => i.category === 'actions'      && i.block).length,
                  insights:     FEED.filter(i => i.category === 'insights'     && i.block).length,
                  achievements: FEED.filter(i => i.category === 'achievements' && i.block).length,
                }

                const visible = FEED.filter(i => i.block && (feedFilter === 'all' || i.category === feedFilter))

                return (
                  <>
                    <FeedFilterPills
                      value={feedFilter}
                      counts={counts}
                      onChange={setFeedFilterPersist}
                    />

                    <div className="ov-stack">
                      {visible.map((item, idx) => (
                        <Fragment key={idx}>{item.block}</Fragment>
                      ))}
                    </div>

                    {/* Pinned AI input — sticky-bottom shortcut into ChatCoach.
                        Always visible on the Feed regardless of filter so the
                        user can ask the coach anything without leaving. */}
                    <PinnedAIInput
                      onAsk={(q) => {
                        try { sessionStorage.setItem('chat_prefilledQuery', q) } catch {}
                        setNav('Chat')
                      }}
                    />
                  </>
                )
              })()}

            </div>
          )}

          {/* ── MILESTONES (legacy grid) ────────────────────────────────
              Hidden by default in the new Feed pattern. Recent milestone
              now surfaces as a Feed card up above; the full grid (every
              tier per category) only renders when the user expands the
              Channel Health audit collapse. */}
          {data && nav === 'Overview' && milestones && auditOpen && (() => {
            const cats = [
              { key: 'subs',        Title: 'Subscribers' },
              { key: 'views',       Title: 'Total Views' },
              { key: 'watch_hours', Title: 'Watch Hours' },
            ]
            const perCat = cats.map(c => {
              const earnedForCat = milestones.earned.filter(e => e.category === c.key)
              const latestTier = earnedForCat.length ? Math.max(...earnedForCat.map(e => e.tier)) : null
              const latestRecord = latestTier != null
                ? earnedForCat.find(e => e.tier === latestTier)
                : null
              const upcoming = milestones.upcoming.find(u => u.category === c.key) || null
              return { ...c, latestTier, latestAchievedAt: latestRecord?.achieved_at || null, upcoming }
            })
            const totalEarned = perCat.filter(p => p.latestTier !== null).length
            return (
              <div style={{ maxWidth: 1040, margin: '40px auto 0' }}>
                <div style={{ marginBottom: 20 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: SHELL.text1, letterSpacing: '-0.5px', marginBottom: 4 }}>Milestones</h2>
                  <p style={{ fontSize: 13, color: SHELL.text3 }}>
                    {totalEarned} of 3 categories started{perCat.some(p => p.upcoming) ? ' · progress to next tier below' : ''}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
                  {perCat.map(p => {
                    const cat = CATEGORY_GRADIENT[p.key]
                    const displayTier = p.latestTier ?? (p.upcoming ? p.upcoming.tier : 0)
                    const hasEarned = p.latestTier !== null
                    const current = p.upcoming ? p.upcoming.current : (p.latestTier || 0)
                    return (
                      <div key={p.key} className="ytg-card" style={{
                        padding: '26px 24px 22px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        background: `linear-gradient(180deg, ${cat.h1}26 0%, #1c1c21 45%, #1c1c21 100%)`,
                        position: 'relative', overflow: 'hidden',
                      }}>
                        {/* Top category banner */}
                        <div style={{
                          alignSelf: 'stretch', textAlign: 'center', marginBottom: 14,
                          fontSize: 10.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
                          color: cat.h3,
                        }}>{p.Title}</div>

                        {/* Star badge */}
                        <div style={{ opacity: hasEarned ? 1 : 0.38 }}>
                          <StarBadge category={p.key} tier={displayTier} size={124}/>
                        </div>

                        {/* Tier value */}
                        <p style={{
                          fontSize: 38, fontWeight: 700, color: SHELL.text1,
                          letterSpacing: '-1.5px', lineHeight: 1,
                          marginTop: 18, marginBottom: 6,
                          fontVariantNumeric: 'tabular-nums',
                        }}>{hasEarned ? fmtNum(p.latestTier) : '—'}</p>
                        <p style={{ fontSize: 13, fontWeight: 600, color: SHELL.text3, letterSpacing: '-0.1px' }}>
                          {hasEarned ? p.Title : 'Not yet earned'}
                        </p>

                        {/* Progress toward next */}
                        {p.upcoming && (
                          <div style={{ alignSelf: 'stretch', marginTop: 22 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
                              <span style={{ fontSize: 11, fontWeight: 600, color: SHELL.text3, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                Next: {fmtNum(p.upcoming.tier)}
                              </span>
                              <span style={{ fontSize: 11.5, fontWeight: 600, color: cat.h3, fontVariantNumeric: 'tabular-nums' }}>
                                {fmtNum(current)} / {fmtNum(p.upcoming.tier)}
                              </span>
                            </div>
                            <div style={{ height: 6, background: '#f1f2f6', borderRadius: 99, overflow: 'hidden' }}>
                              <div style={{
                                width: `${Math.max(p.upcoming.pct, 2)}%`, height: '100%',
                                background: `linear-gradient(90deg, ${cat.h2} 0%, ${cat.h3} 100%)`,
                                borderRadius: 99,
                                transition: 'width 0.8s ease',
                              }}/>
                            </div>
                          </div>
                        )}

                        {/* Share button (earned only) — full pill with gradient */}
                        {hasEarned ? (
                          <button
                            onClick={() => setShareMilestone({
                              category: p.key,
                              tier: p.latestTier,
                              achieved_at: p.latestAchievedAt,
                            })}
                            style={{
                              alignSelf: 'stretch', marginTop: 24,
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                              background: `linear-gradient(180deg, ${cat.h2} 0%, ${cat.h3} 100%)`,
                              color: '#ffffff',
                              fontSize: 13.5, fontWeight: 600,
                              padding: '13px 20px', borderRadius: 999,
                              border: 'none', cursor: 'pointer',
                              letterSpacing: '-0.1px',
                              boxShadow: `0 4px 14px ${cat.h2}40, inset 0 1px 0 rgba(255,255,255,0.22)`,
                              transition: 'transform 0.15s, box-shadow 0.15s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1.5px)'; e.currentTarget.style.boxShadow = `0 8px 20px ${cat.h2}55, inset 0 1px 0 rgba(255,255,255,0.22)` }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 14px ${cat.h2}40, inset 0 1px 0 rgba(255,255,255,0.22)` }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                            </svg>
                            Share milestone
                          </button>
                        ) : (
                          /* Brand footer for unearned cards only */
                          <div style={{
                            alignSelf: 'stretch', marginTop: 22, paddingTop: 14,
                            borderTop: `1px solid #eeeef3`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          }}>
                            <YTGLogo size={18}/>
                            <span style={{ fontSize: 14, fontWeight: 700, color: SHELL.text1, letterSpacing: '-0.3px' }}>
                              YTGrowth<span style={{ color: '#fb6a60' }}>.io</span>
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })()}

          {/* ── INSIGHTS ─────────────────────────────────────────────── */}
          {data && nav === 'Overview' && analyzingAI && (
            <div style={{ padding: '24px 0 36px' }}>
              <AuditProgress
                done={auditFinishing}
                onDone={() => {
                  setAnalyzingAI(false)
                  setAuditFinishing(false)
                }}
              />
            </div>
          )}


          {/* ── AUDIT DETAIL (legacy block) ─────────────────────────────
              Hidden by default. Renders only when the user expands the
              new Channel Health Feed card's "See full audit" collapse.
              The new PriorityActionCards on the Feed read from the same
              checked/deleted state, so ticking either updates both. */}
          {data && nav === 'Overview' && data.insights && auditOpen && (
            <div style={{ maxWidth: 1040, margin: '0 auto' }}>
              <div style={{ marginBottom: 20, marginTop: 44 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: SHELL.text1, letterSpacing: '-0.5px', marginBottom: 4 }}>Channel audit</h2>
                <p style={{ fontSize: 13, color: SHELL.text3 }}>{data.insights.priorityActions?.length ?? 0} priority actions{data.analyzed_at ? ` · Audited ${parseUTC(data.analyzed_at)?.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) ?? ''}` : ''}</p>
              </div>

              {/* Summary + overall score */}
              {data.insights.channelSummary && (
                <div className="ytg-card" style={{ padding: '28px 32px', marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
                    {/* Score ring — left */}
                    <div style={{ flexShrink: 0, textAlign: 'center' }}>
                      <ScoreRing score={score} />
                      <p style={{ fontSize: 11, color: SHELL.text3, fontWeight: 500, marginTop: 4, letterSpacing: '0.03em', textTransform: 'uppercase' }}>Overall</p>
                      {prevScore != null && prevScore !== score && (
                        <p style={{ fontSize: 11, fontWeight: 600, color: score > prevScore ? '#34d27b' : C.red, marginTop: 3 }}>
                          {score > prevScore ? '▲' : '▼'} {Math.abs(score - prevScore)} from last audit
                        </p>
                      )}
                    </div>
                    {/* Divider */}
                    <div style={{ width: 1, alignSelf: 'stretch', background: SHELL.hair, flexShrink: 0 }}/>
                    {/* Summary text */}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: SHELL.text3, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>AI assessment</p>
                      <p style={{ fontSize: 14, color: SHELL.text1, lineHeight: 1.85 }}>{data.insights.channelSummary}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Category scores */}
              {data.insights.categoryScores && (
                <div className="ytg-card" style={{ padding: '24px 32px', marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: SHELL.text3, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Score breakdown</p>
                    <p style={{ fontSize: 11, color: SHELL.text3 }}>Weighted formula · CTR &amp; retention count most</p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 40px' }}>
                    {[
                      ['CTR health',                data.insights.categoryScores.ctrHealth,                '20%'],
                      ['Audience retention',        data.insights.categoryScores.audienceRetention,        '20%'],
                      ['Content strategy',          data.insights.categoryScores.contentStrategy,          '15%'],
                      ['Posting consistency',       data.insights.categoryScores.postingConsistency,       '15%'],
                      ['Engagement quality',        data.insights.categoryScores.engagementQuality,        '10%'],
                      ['SEO discoverability',       data.insights.categoryScores.seoDiscoverability,       '10%'],
                      ['Video length',              data.insights.categoryScores.videoLength,               '5%'],
                      ['Traffic source intel',      data.insights.categoryScores.trafficSourceIntelligence,'5%'],
                    ].map(([label, val, weight]) => {
                      const col = scoreColor(val)
                      return (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 11, fontWeight: 500, color: SHELL.text3, flexShrink: 0, width: 36, textAlign: 'right' }}>{weight}</span>
                          <span style={{ fontSize: 13, color: SHELL.text2, fontWeight: 400, flexShrink: 0, width: 148 }}>{label}</span>
                          <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{ width: `${val ?? 0}%`, height: '100%', background: col, borderRadius: 99, transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)' }}/>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: col, fontVariantNumeric: 'tabular-nums', minWidth: 26, textAlign: 'right' }}>{val ?? '—'}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Priority actions — same visual language as the Feed.
                  Renders ALL open actions here (Feed only shows top 3).
                  Mark done / Dismiss share state with the Feed cards via
                  the same localStorage keys, so ticking either updates
                  both surfaces. */}
              {data.insights.priorityActions?.length > 0 && (() => {
                const allActions = data.insights.priorityActions
                const openActions = []
                for (let i = 0; i < allActions.length; i++) {
                  const a = allActions[i]
                  const rank = a.rank ?? (i + 1)
                  const k = `rank_${rank}`
                  if (!checked[k] && !deleted[k]) openActions.push({ a, rank, k, idx: i })
                }
                const total = allActions.length
                const doneCount = total - openActions.length

                if (openActions.length === 0) {
                  return (
                    <div style={{ marginBottom: 24 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <p style={{ fontSize: 20, fontWeight: 700, color: SHELL.text1, letterSpacing: '-0.5px' }}>Priority actions</p>
                          <span style={{ fontSize: 10, fontWeight: 600, color: '#34d27b', background: 'rgba(22,163,74,0.14)', padding: '3px 9px', borderRadius: 100, border: `1px solid ${'rgba(22,163,74,0.34)'}`, letterSpacing: '0.08em', textTransform: 'uppercase' }}>All clear</span>
                        </div>
                      </div>
                      <div style={{
                        background: 'rgba(22,163,74,0.14)',
                        border: `1px solid ${'rgba(22,163,74,0.34)'}`,
                        borderLeft: `3px solid ${'#34d27b'}`,
                        borderRadius: '0 12px 12px 0',
                        padding: '14px 18px',
                      }}>
                        <p style={{ fontSize: 13, color: SHELL.text1, fontWeight: 600, marginBottom: 2 }}>You've handled every priority action.</p>
                        <p style={{ fontSize: 12.5, color: SHELL.text3 }}>Re-audit to surface new ones, or come back next month.</p>
                      </div>
                    </div>
                  )
                }

                return (
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <p style={{ fontSize: 20, fontWeight: 700, color: SHELL.text1, letterSpacing: '-0.5px' }}>Priority actions</p>
                        <span style={{ fontSize: 11, fontWeight: 600, color: SHELL.text3, background: '#f1f1f6', padding: '3px 9px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.08)', fontVariantNumeric: 'tabular-nums' }}>{openActions.length} open</span>
                      </div>
                      {doneCount > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontVariantNumeric: 'tabular-nums' }}>
                          <div style={{ width: 72, height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{ width: `${(doneCount / total) * 100}%`, height: '100%', background: '#34d27b', borderRadius: 99, transition: 'width 0.6s ease' }}/>
                          </div>
                          <span style={{ fontSize: 11.5, fontWeight: 600, color: SHELL.text3 }}>
                            {doneCount} of {total} done
                          </span>
                        </div>
                      )}
                    </div>

                    {openActions.map(({ a, rank, k }, i) => {
                      const impact = a.impact || (i === 0 ? 'high' : i === 1 ? 'med' : 'low')
                      const target = categoryToNav(a.category, a.problem)
                      const ctaLabel = target === 'SEO Studio' ? 'Open SEO Studio'
                        : target === 'Thumbnail Score' ? 'Open Thumbnails'
                        : target === 'Video Ideas' ? 'Open Video Ideas'
                        : target === 'Outliers' ? 'Open Outliers'
                        : target === 'Keywords' ? 'Open Keywords'
                        : target === 'Competitors' ? 'Open Competitors'
                        : 'Open tool'
                      return (
                        <PriorityActionCard
                          key={`audit-pa-${rank}`}
                          action={a}
                          rank={i + 1}
                          total={openActions.length}
                          impact={impact}
                          ctaLabel={ctaLabel}
                          onAct={() => target ? setNav(target) : null}
                          onDone={() => {
                            const next = { ...checked, [k]: true }
                            setChecked(next)
                            if (data?.channel?.channel_id) {
                              try { localStorage.setItem(`ytg_checked_${data.channel.channel_id}`, JSON.stringify(next)) } catch {}
                            }
                          }}
                          onDismiss={() => {
                            const next = { ...deleted, [k]: true }
                            setDeleted(next)
                            if (data?.channel?.channel_id) {
                              try { localStorage.setItem(`ytg_deleted_${data.channel.channel_id}`, JSON.stringify(next)) } catch {}
                            }
                          }}
                        />
                      )
                    })}
                  </div>
                )
              })()}

              {/* Quick wins + big risk */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                {data.insights.quickWins?.length > 0 && (() => {
                  const wins = data.insights.quickWins.filter((_, i) => !deleted[`qw_${i}`])
                  return (
                    <div className="ytg-card" style={{ padding: '20px 22px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: '#34d27b', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Quick wins</p>
                        <span style={{ fontSize: 11, fontWeight: 600, color: SHELL.text3, background: '#f1f1f6', padding: '2px 7px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)' }}>{wins.length} left</span>
                      </div>
                      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {data.insights.quickWins.map((w, i) => {
                          if (deleted[`qw_${i}`]) return null
                          const key = `qw_${i}`
                          const isDone = !!checked[key]
                          return (
                            <li key={i} className="ytg-qw-row" style={{ opacity: isDone ? 0.5 : 1 }}>
                              <input
                                type="checkbox"
                                checked={isDone}
                                onChange={() => handleToggleCheck(key)}
                                style={{ width: 14, height: 14, accentColor: '#34d27b', cursor: 'pointer', flexShrink: 0, marginTop: 3 }}
                              />
                              <p style={{ fontSize: 14, color: isDone ? SHELL.text3 : SHELL.text2, lineHeight: 1.6, flex: 1, textDecoration: isDone ? 'line-through' : 'none' }}>{w}</p>
                              {isDone && (
                                <button className="ytg-del-btn" onClick={() => handleDelete(key)} title="Remove">
                                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="#e5251b" strokeWidth="1.8" strokeLinecap="round">
                                    <line x1="2" y1="2" x2="8" y2="8"/><line x1="8" y1="2" x2="2" y2="8"/>
                                  </svg>
                                </button>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )
                })()}
                <div className="ytg-card" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {data.insights.biggestRisk && (
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 600, color: '#fb6a60', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>Biggest risk</p>
                      <p style={{ fontSize: 14, color: SHELL.text1, lineHeight: 1.7 }}>{data.insights.biggestRisk}</p>
                    </div>
                  )}
                  {data.insights.topPerformingPattern && (
                    <div style={{ paddingTop: data.insights.biggestRisk ? 16 : 0, borderTop: data.insights.biggestRisk ? `1px solid ${SHELL.hair}` : 'none' }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: '#34d27b', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>What's working</p>
                      <p style={{ fontSize: 14, color: SHELL.text1, lineHeight: 1.7 }}>{data.insights.topPerformingPattern}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── VIDEOS ───────────────────────────────────────────────── */}
          {data && nav === 'Videos' && videos && (
            <div style={{ maxWidth: 1040, margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <h1 style={{ fontSize: 26, fontWeight: 600, color: SHELL.text1, letterSpacing: '-0.7px', marginBottom: 6, lineHeight: 1.1 }}>My Videos</h1>
                  <p style={{ fontSize: 14, color: SHELL.text2, fontWeight: 500, letterSpacing: '-0.005em', lineHeight: 1.45 }}>
                    Every video on your channel · {videos.length.toLocaleString()} total · {fmtNum(videos.reduce((s, v) => s + (v.views || 0), 0))} views
                  </p>
                </div>
                {videosTab === 'all' && (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
                  <div className="ytg-myvid-sort-grp">
                    {[
                      { k: 'date',  label: 'Newest' },
                      { k: 'views', label: 'Most views' },
                      { k: 'likes', label: 'Most likes' },
                    ].map(opt => {
                      const active = videoSort === opt.k
                      return (
                        <button
                          key={opt.k}
                          onClick={() => setVideoSort(opt.k)}
                          className={`ytg-myvid-sort-btn${active ? ' active' : ''}`}
                        >
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                  <button
                    className="ytg-dash-btn-primary"
                    disabled={refreshingStats}
                    onClick={() => {
                      setRefreshingStats(true)
                      setVideoFlash(null)
                      fetch('/auth/refresh-stats', { method: 'POST', credentials: 'include' })
                        .then(r => r.json())
                        .then(d => {
                          if (!d.error) {
                            setData(prev => ({ ...prev, channel: d.channel, videos: d.videos, stats_fetched_at: d.stats_fetched_at }))
                            setVideos(d.videos || [])
                            setVideoFlash('ok')
                            if (d.new_milestones && d.new_milestones.length > 0) {
                              const nowIso = new Date().toISOString()
                              setCelebrateQueue(d.new_milestones.map(m => ({ ...m, achieved_at: nowIso })))
                              fetch('/auth/milestones', { credentials: 'include' })
                                .then(r => r.ok ? r.json() : null)
                                .then(m => { if (m && !m.error) setMilestones(m) })
                                .catch(() => {})
                            }
                          } else {
                            setVideoFlash('err')
                          }
                        })
                        .catch(() => setVideoFlash('err'))
                        .finally(() => {
                          setRefreshingStats(false)
                          setTimeout(() => setVideoFlash(null), 3000)
                        })
                    }}
                    style={{ flexShrink: 0 }}
                  >
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <path d="M11.5 2A6 6 0 1 0 12 6.5"/><path d="M11.5 2v3h-3"/>
                    </svg>
                    {refreshingStats ? 'Refreshing…'
                      : videoFlash === 'ok'  ? 'Updated ✓'
                      : videoFlash === 'err' ? 'Failed ✕'
                      : 'Refresh'}
                  </button>
                </div>
                )}
              </div>

              {/* ── Tabs — All videos vs. Tracked optimisations ─────────────────
                  Mirrors the SEO Studio New/Reports tab pattern verbatim — same
                  pill button, red-on-active, white-with-border-on-inactive. */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {[
                  { key: 'all',     label: 'All videos' },
                  { key: 'tracked', label: optimizations.length > 0 ? `Tracked optimisations (${optimizations.length})` : 'Tracked optimisations' },
                ].map(({ key, label }) => {
                  const active = videosTab === key
                  return (
                    <button key={key}
                      onClick={() => setVideosTab(key)}
                      style={{
                        fontSize: 13, fontWeight: active ? 600 : 500, padding: '8px 16px',
                        borderRadius: 100,
                        border: active ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent',
                        background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                        color: active ? SHELL.text1 : SHELL.text2,
                        cursor: 'pointer', fontFamily: 'inherit',
                        letterSpacing: '-0.01em',
                        transition: 'background 180ms cubic-bezier(0.32,0.72,0,1), color 180ms cubic-bezier(0.32,0.72,0,1), border-color 180ms cubic-bezier(0.32,0.72,0,1)',
                      }}
                      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = SHELL.text1 } }}
                      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = SHELL.text2 } }}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>

              {/* ── Your optimizations — each row is its own ytg-insight-card (same pattern as Overview's Priority Actions).
                    Green top border + green rank badge = "tracked/active", 3-col body grid with tinted views/likes/comments deltas. ── */}
              {videosTab === 'tracked' && optimizations.length > 0 && (() => {
                const daysSince = (iso) => {
                  if (!iso) return null
                  const d = new Date(iso)
                  if (isNaN(d.getTime())) return null
                  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000))
                }
                const pct = (before, after) => {
                  if (before <= 0) return null
                  return Math.round(((after - before) / before) * 100)
                }

                // Tinted delta cell — palette is brand-only now: charcoal/white+green/green.
                // Views=charcoal (info), Likes=white+green-bar (action), Comments=green (outcome).
                const DeltaCell = ({ label, before, current, pctVal, tint }) => {
                  const tintMap = {
                    blue:  { bg: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', labelColor: SHELL.text2 },
                    white: { bg: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderLeft: '3px solid #34d27b', borderRadius: '0 10px 10px 0', boxShadow: 'none', labelColor: '#34d27b' },
                    green: { bg: 'rgba(22,163,74,0.14)', border: '1px solid rgba(22,163,74,0.34)', labelColor: '#34d27b' },
                  }[tint]
                  // Hide the delta label entirely when nothing has changed (pct is 0 or null).
                  // 0% everywhere is noise — we only show the badge when there's a real move.
                  const showDelta = pctVal != null && pctVal !== 0
                  const col  = showDelta && pctVal > 0 ? '#34d27b' : showDelta && pctVal < 0 ? '#fb6a60' : SHELL.text3
                  const sign = showDelta ? (pctVal > 0 ? `+${pctVal}%` : `${pctVal}%`) : null
                  return (
                    <div style={{
                      background: tintMap.bg,
                      border: tintMap.border,
                      borderLeft: tintMap.borderLeft,
                      borderRadius: tintMap.borderRadius || 10,
                      padding: '12px 14px',
                      boxShadow: tintMap.boxShadow,
                    }}>
                      <p style={{ fontSize: 10.5, fontWeight: 600, color: tintMap.labelColor, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</p>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <p style={{ fontSize: 18, fontWeight: 600, color: SHELL.text1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.4px', lineHeight: 1 }}>{fmtNum(current)}</p>
                        {showDelta && <p style={{ fontSize: 12, fontWeight: 600, color: col, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{sign}</p>}
                      </div>
                      <p style={{ fontSize: 11, color: SHELL.text3, marginTop: 4, fontWeight: 500, letterSpacing: '-0.005em' }}>was {fmtNum(before)}</p>
                    </div>
                  )
                }

                return (
                  <div style={{ marginBottom: 28 }}>
                    {/* Subtler secondary eyebrow — lets "My Videos" keep its H1 identity at the top */}
                    <p style={{ fontSize: 11, fontWeight: 600, color: SHELL.text3, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 12 }}>
                      Tracked updates · {optimizations.length} video{optimizations.length === 1 ? '' : 's'}
                    </p>

                    {optimizations.map((o, i) => {
                      const days         = daysSince(o.optimized_at)
                      const vPct         = pct(o.before_views,    o.current_views)
                      const lPct         = pct(o.before_likes,    o.current_likes)
                      const cPct         = pct(o.before_comments, o.current_comments)
                      const titleChanged = o.before_title && o.after_title && o.before_title !== o.after_title
                      const daysLabel    = days === 0 ? 'Today' : days === 1 ? '1 day ago' : `${days} days ago`
                      return (
                        <div key={`${o.video_id}-${o.optimized_at}`} className="ytg-insight-card" style={{ marginBottom: 12, borderTop: `3px solid ${C.amber}` }}>
                          <div style={{ padding: '18px 22px 20px' }}>

                            {/* Header — thumbnail + eyebrow + title diff + days pill.
                                Dropped the filled amber 26x26 rank-badge tile (was carrying
                                visual weight that the amber top stripe already provides).
                                Cleaner: just the thumbnail + content + pill. */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
                              {o.thumbnail_url && (
                                <a href={`https://www.youtube.com/watch?v=${o.video_id}`} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0, lineHeight: 0, textDecoration: 'none', alignSelf: 'center' }}>
                                  <img src={o.thumbnail_url} alt="" style={{ width: 100, height: 56, borderRadius: 8, objectFit: 'cover', display: 'block', border: '1px solid rgba(255,255,255,0.08)' }}/>
                                </a>
                              )}

                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: 11, fontWeight: 600, color: '#34d27b', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 5 }}>Tracked update</p>
                                {titleChanged ? (
                                  <>
                                    <p style={{ fontSize: 12, color: SHELL.text3, fontWeight: 500, lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: 'line-through', marginBottom: 4, letterSpacing: '-0.005em' }}>{o.before_title}</p>
                                    <p style={{ fontSize: 14.5, fontWeight: 600, color: SHELL.text1, lineHeight: 1.45, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.15px' }}>{o.after_title}</p>
                                  </>
                                ) : (
                                  <p style={{ fontSize: 14.5, fontWeight: 600, color: SHELL.text1, lineHeight: 1.45, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.15px' }}>{o.after_title || o.before_title}</p>
                                )}
                              </div>

                              <span style={{ fontSize: 11, fontWeight: 600, color: '#34d27b', padding: '3px 11px', borderRadius: 100, letterSpacing: '0.10em', textTransform: 'uppercase', border: `1px solid ${'rgba(22,163,74,0.34)'}`, background: 'rgba(22,163,74,0.14)', flexShrink: 0 }}>
                                {daysLabel}
                              </span>
                            </div>

                            {/* Hairline divider — aligned with the thumbnail edge (100 + 14 gap = 114) */}
                            <div style={{ height: 1, background: 'rgba(255,255,255,0.10)', marginBottom: 14, marginLeft: 114 }}/>

                            {/* 3-col body — Views / Likes (amber bar centre) / Comments. Brand-only palette. */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: 8, marginLeft: 114 }}>
                              <DeltaCell label="Views"    before={o.before_views}    current={o.current_views}    pctVal={vPct} tint="blue"/>
                              <DeltaCell label="Likes"    before={o.before_likes}    current={o.current_likes}    pctVal={lPct} tint="white"/>
                              <DeltaCell label="Comments" before={o.before_comments} current={o.current_comments} pctVal={cPct} tint="green"/>
                            </div>

                            {/* Cross-link to Video Review — different lens on the same video. */}
                            <div style={{ marginTop: 14, marginLeft: 114, display: 'flex', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => setNav('Autopsy')}
                                style={{
                                  fontSize: 12, fontWeight: 500, color: SHELL.text3,
                                  background: 'transparent', border: 'none', cursor: 'pointer',
                                  fontFamily: 'inherit', padding: 0, letterSpacing: '-0.005em',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.color = SHELL.text1 }}
                                onMouseLeave={e => { e.currentTarget.style.color = SHELL.text3 }}
                              >
                                Run video review on this one →
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}

              {/* Empty state for the Tracked tab when nothing's been optimised yet. */}
              {videosTab === 'tracked' && optimizations.length === 0 && (
                <div className="ytg-card" style={{ padding: '40px 32px', textAlign: 'center' }}>
                  <p style={{ fontSize: 16, fontWeight: 600, color: SHELL.text1, letterSpacing: '-0.2px', marginBottom: 8 }}>
                    No tracked optimisations yet
                  </p>
                  <p style={{ fontSize: 13.5, color: SHELL.text2, fontWeight: 500, lineHeight: 1.6, maxWidth: 420, margin: '0 auto', letterSpacing: '-0.005em' }}>
                    Open any video below and run an SEO optimisation. Once you publish the new title or description, the lift in views, likes, and comments shows up here.
                  </p>
                </div>
              )}

              {/* Card grid — All Videos tab only */}
              {videosTab === 'all' && (
              <div className="ytg-videos-grid">
                {[...videos].sort((a, b) => {
                  if (videoSort === 'views') return (b.views || 0) - (a.views || 0)
                  if (videoSort === 'likes') return (b.likes || 0) - (a.likes || 0)
                  return (parseUTC(b.published_at) || 0) - (parseUTC(a.published_at) || 0)
                }).map((v, i) => {
                  const lr      = v.views > 0 ? (v.likes / v.views * 100).toFixed(1) : null
                  const lrN     = lr !== null ? parseFloat(lr) : null
                  const lrColor = lrN === null ? C.text3 : lrN >= 3 ? C.green : lrN >= 1 ? C.amber : C.red
                  const wtSecs    = typeof v.avg_duration_seconds === 'number' ? v.avg_duration_seconds : null
                  const wtDisplay = wtSecs !== null ? `${Math.floor(wtSecs / 60)}:${String(wtSecs % 60).padStart(2, '0')}` : '—'
                  const retN      = typeof v.avg_view_percent === 'number' ? v.avg_view_percent : null
                  const isSelected = selectedVideoId === v.video_id
                  const ytUrl   = v.video_id ? `https://www.youtube.com/watch?v=${v.video_id}` : null
                  const durMatch = (v.duration || '').match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
                  const durSecs  = durMatch ? (+durMatch[1]||0)*3600 + (+durMatch[2]||0)*60 + (+durMatch[3]||0) : 0
                  const durLabel = durSecs > 0 ? (durSecs <= 60 ? `${durSecs}s` : `${Math.floor(durSecs/60)}:${String(durSecs%60).padStart(2,'0')}`) : null
                  const isShort  = durSecs > 0 && durSecs <= 60
                  return (
                    <div key={v.video_id || i} className="ytg-card" style={{ display: 'flex', flexDirection: 'column' }}>
                      {/* Thumbnail */}
                      <a href={ytUrl || '#'} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'block', position: 'relative', textDecoration: 'none', flexShrink: 0, borderRadius: '16px 16px 0 0', overflow: 'hidden' }}>
                        {v.thumbnail || v.video_id
                          ? <img
                              src={v.video_id ? ytMaxThumbUrl(v.video_id) : v.thumbnail}
                              alt=""
                              style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }}
                              onError={makeThumbOnError(v.video_id, v.thumbnail)}
                              onLoad={makeThumbOnLoad(v.video_id, v.thumbnail)}
                            />
                          : <div style={{ width: '100%', aspectRatio: '16/9', background: '#ebebef' }}/>
                        }
                        {isShort && (
                          <span style={{ position: 'absolute', top: 8, left: 8, background: '#111', color: '#fff', fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4, letterSpacing: '0.10em' }}>SHORT</span>
                        )}
                        {durLabel && (
                          <span style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.82)', color: '#fff', fontSize: 11.5, fontWeight: 600, padding: '3px 7px', borderRadius: 5, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.05px' }}>{durLabel}</span>
                        )}
                      </a>

                      {/* Body */}
                      <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        {/* Title — 14.5/600 (was 16/700, too heavy at this card width) */}
                        <p style={{
                          fontSize: 14.5, fontWeight: 600, color: SHELL.text1, lineHeight: 1.4, marginBottom: 8, letterSpacing: '-0.15px',
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 41,
                        }}>{v.title}</p>

                        {/* Meta line — uniform 12/500 muted, no mid-weight spikes */}
                        <p style={{ fontSize: 12, fontWeight: 500, color: SHELL.text3, marginBottom: 14, lineHeight: 1.4, letterSpacing: '-0.005em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {fmtNum(v.views)} views · {fmtNum(v.likes)} likes · {relTimeLong(v.published_at) || '—'}
                        </p>

                        {/* Footer: Watch · Retention · Eng + Optimise */}
                        <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.10)' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
                            {[
                              { label: 'Watch',     display: wtDisplay,                                             color: SHELL.text1,  tip: 'Average watch time per view (mm:ss). Longer is better relative to video length.' },
                              { label: 'Retention', display: retN !== null ? `${retN.toFixed(0)}%` : '—',           color: SHELL.text1,  tip: 'Average % of video watched. 50%+ strong, 30–50% avg, <30% weak.' },
                              { label: 'Eng',       display: lrN !== null ? `${lr}%` : '—',                         color: lrColor,  tip: 'Engagement rate = likes ÷ views. 3%+ strong, 1–3% avg, <1% weak.' },
                            ].map(m => (
                              <div key={m.label} title={m.tip} style={{ cursor: 'help', textAlign: 'left' }}>
                                <p style={{ fontSize: 10.5, fontWeight: 600, color: SHELL.text3, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 5, lineHeight: 1 }}>{m.label}</p>
                                <p style={{ fontSize: 16, fontWeight: 600, color: m.color, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.3px', lineHeight: 1 }}>{m.display}</p>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={() => setSelectedVideoId(v.video_id)}
                            className="ytg-optimise-btn"
                            style={{ width: '100%', justifyContent: 'center', padding: '10px 16px', fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em' }}>
                            Optimise
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              )}

              {/* Optimise panel — modal overlay */}
              {selectedVideoId && (() => {
                const sv = videos.find(v => v.video_id === selectedVideoId)
                return sv ? (
                  <div
                    onClick={e => { if (e.target === e.currentTarget) setSelectedVideoId(null) }}
                    style={{
                      position: 'fixed', inset: 0, zIndex: 200,
                      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: '32px 24px',
                    }}
                  >
                    <div style={{ width: '100%', maxWidth: 1280, maxHeight: 'calc(100vh - 64px)', overflowY: 'auto', borderRadius: 22, flexShrink: 0 }}>
                      <VideoOptimizePanel
                        video={sv}
                        onClose={() => setSelectedVideoId(null)}
                        onVideoUpdated={handleVideoUpdated}
                        plan={billingPlan}
                        freeTierFeatures={freeTierFeatures}
                      />
                    </div>
                  </div>
                ) : null
              })()}
            </div>
          )}

          {/* ── PATTERNS (legacy block) ─────────────────────────────────
              Hidden by default. The Content Mix insight surfaces as a
              Feed card above; this detailed Shorts vs long-form breakdown
              only renders when the user expands the audit collapse. */}
          {data && nav === 'Overview' && patterns && auditOpen && (
            <div style={{ maxWidth: 1040, margin: '0 auto' }}>
              <div style={{ marginBottom: 20, marginTop: 44 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: SHELL.text1, letterSpacing: '-0.5px', marginBottom: 4 }}>Content patterns</h2>
                <p style={{ fontSize: 13, color: SHELL.text3 }}>What's working and what isn't</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 16, marginBottom: 16 }}>
                {[
                  { label: 'Shorts avg views',    value: fmtNum(patterns.shortAvg), verdict: patterns.shortAvg > patterns.longAvg ? 'Beats long-form' : 'Below long-form', good: patterns.shortAvg > patterns.longAvg },
                  { label: 'Long-form avg views', value: fmtNum(patterns.longAvg),  verdict: patterns.longAvg > patterns.shortAvg ? 'Beats Shorts'     : 'Below Shorts',    good: patterns.longAvg  > patterns.shortAvg },
                  { label: 'Avg engagement rate', value: `${patterns.likeRate}%`,   verdict: patterns.likeRate >= 3 ? 'Healthy' : patterns.likeRate >= 1 ? 'Average' : 'Below average', good: patterns.likeRate >= 3, hint: 'likes ÷ views — 3%+ is strong' },
                ].map(p => (
                  <div key={p.label} className="ytg-card" title={p.hint || undefined} style={{ padding: '20px 22px', cursor: p.hint ? 'help' : 'default' }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: SHELL.text3, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>{p.label}</p>
                    <p style={{ fontSize: 26, fontWeight: 700, color: SHELL.text1, letterSpacing: '-0.8px', marginBottom: 10, fontVariantNumeric: 'tabular-nums' }}>{p.value}</p>
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      color:   p.good ? '#34d27b'  : '#f0a23b',
                      background: 'transparent',
                      padding: '3px 10px', borderRadius: 20,
                      border: `1.5px solid ${p.good ? 'rgba(22,163,74,0.34)' : 'rgba(217,119,6,0.34)'}`,
                    }}>{p.verdict}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                {[
                  { label: 'Best performing',  video: patterns.bestVideo,  isGood: true  },
                  { label: 'Worst performing', video: patterns.worstVideo, isGood: false },
                ].map(({ label, video, isGood }) => (
                  <div key={label} className="ytg-card" style={{ padding: '20px 22px' }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: isGood ? '#34d27b' : C.red, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 14 }}>{label}</p>
                    {video && (
                      <>
                        <div style={{ display: 'flex', gap: 11, marginBottom: 13, alignItems: 'flex-start' }}>
                          {video.thumbnail && <img src={video.thumbnail} alt="" style={{ width: 68, height: 43, borderRadius: 7, objectFit: 'cover', flexShrink: 0 }}/>}
                          <p style={{ fontSize: 14, fontWeight: 600, color: SHELL.text1, lineHeight: 1.5 }}>{video.title}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
                          {[['Views', fmtNum(video.views), isGood ? '#34d27b' : C.red], ['Likes', fmtNum(video.likes), SHELL.text1]].map(([lbl, val, col]) => (
                            <div key={lbl}>
                              <p style={{ fontSize: 12, color: SHELL.text3, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>{lbl}</p>
                              <p style={{ fontSize: 21, fontWeight: 700, color: col, letterSpacing: '-0.8px', fontVariantNumeric: 'tabular-nums' }}>{val}</p>
                            </div>
                          ))}
                        </div>
                        <div style={{
                          background: isGood ? 'rgba(22,163,74,0.14)' : 'rgba(229,37,27,0.13)',
                          border: `1px solid ${isGood ? 'rgba(22,163,74,0.34)' : 'rgba(229,37,27,0.32)'}`,
                          borderRadius: 10, padding: '9px 12px',
                        }}>
                          <p style={{ fontSize: 12, color: isGood ? '#34d27b' : '#fb6a60', lineHeight: 1.7 }}>
                            {isGood ? 'Study this — replicate its title style, length, and topic angle.' : 'Avoid this format or topic — it isn\'t connecting with your audience.'}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="ytg-card" style={{ padding: '20px 22px' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: SHELL.text3, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 16 }}>Content mix</p>
                <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
                  {[{ l: 'Shorts', v: patterns.shortsCount, s: '≤60s' }, { l: 'Long-form', v: patterns.longsCount, s: '>60s' }].map(p => (
                    <div key={p.l}>
                      <p style={{ fontSize: 12, color: SHELL.text3, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>{p.l}</p>
                      <p style={{ fontSize: 26, fontWeight: 700, color: SHELL.text1, letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums' }}>{p.v}</p>
                      <p style={{ fontSize: 12, color: SHELL.text3, marginTop: 2 }}>{p.s}</p>
                    </div>
                  ))}
                  <div style={{ flex: 1, paddingLeft: 28, borderLeft: `1px solid #26262b` }}>
                    <p style={{ fontSize: 14, color: SHELL.text2, lineHeight: 1.85 }}>
                      {patterns.shortAvg > patterns.longAvg
                        ? `Shorts outperform long-form by ${fmtNum(patterns.shortAvg - patterns.longAvg)} views on average. Lean into Shorts for discovery.`
                        : patterns.longAvg > patterns.shortAvg
                        ? `Long-form outperforms Shorts by ${fmtNum(patterns.longAvg - patterns.shortAvg)} views. Your audience wants depth.`
                        : 'Both formats are performing similarly on your channel.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {nav === 'Competitors' && <Competitors plan={billingPlan} freeTierFeatures={freeTierFeatures} />}

          {nav === 'Keywords' && <Keywords plan={billingPlan} freeTierFeatures={freeTierFeatures} />}

          {nav === 'Weekly Report' && (
            <WeeklyReport
              channelId={data?.channel?.channel_id}
              channelEmail={data?.email}
              plan={billingPlan}
              channelStats={data?.channel}
              analytics={data?.analytics}
              healthScore={score}
            />
          )}

          {nav === 'SEO Studio' && <SeoOptimizer onNavigate={setNav} plan={billingPlan} freeTierFeatures={freeTierFeatures} videos={videos} />}

          {nav === 'Thumbnail Score' && <ThumbnailScore channelData={data} onNavigate={setNav} plan={billingPlan} freeTierFeatures={freeTierFeatures} />}

          {nav === 'Video Ideas' && <VideoIdeas onNavigate={setNav} plan={billingPlan} freeTierFeatures={freeTierFeatures} />}

          {nav === 'Outliers' && <Outliers channelData={data} onNavigate={setNav} plan={billingPlan} freeTierFeatures={freeTierFeatures} />}

          {nav === 'Autopsy' && <Autopsy videos={videos} channelId={data?.channel?.channel_id} optimizations={optimizations} goToTracked={() => { setNav('Videos'); setVideosTab('tracked') }} />}

          {/* ── REFERRALS ────────────────────────────────────────────── */}
          {nav === 'Referrals' && <Referrals />}

          {/* ── ADMIN ────────────────────────────────────────────────── */}
          {nav === 'Admin' && isAdmin && <Admin />}

          {/* ── CHAT — AI Coach ──────────────────────────────────────── */}
          {nav === 'Chat' && (
            <ChatCoach
              onNavigate={setNav}
              billingPlan={billingPlan}
              chatMode={chatMode}
              chatTargetId={chatTargetId}
              chatNonce={chatNonce}
              onChatState={onChatState}
            />
          )}

          {/* ── SETTINGS ─────────────────────────────────────────────── */}
          {nav === 'Settings' && <Settings channelData={data} />}

        </div>
      </div>
      ) })()}

      {/* ── Milestone unlocked celebration (only when share modal isn't open) ── */}
      {celebrateQueue.length > 0 && !shareMilestone && (
        <MilestoneCelebrationModal
          milestone={celebrateQueue[0]}
          channelName={data?.channel?.channel_name}
          channelThumbnail={data?.channel?.thumbnail}
          onShare={() => {
            setShareMilestone(celebrateQueue[0])
            setCelebrateQueue(q => q.slice(1))
          }}
          onClose={() => setCelebrateQueue(q => q.slice(1))}
        />
      )}

      {/* ── Milestone share modal ─────────────────────────────────────── */}
      {shareMilestone && (
        <MilestoneShareModal
          milestone={shareMilestone}
          channelName={data?.channel?.channel_name}
          channelThumbnail={data?.channel?.thumbnail}
          onClose={() => setShareMilestone(null)}
        />
      )}

      <CreditsEmptyModal
        open={creditsOut}
        onClose={() => setCreditsOut(false)}
        featureName="channel audits"
      />
    </div>
  )
}
