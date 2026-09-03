# AI-Citation Fitness Sweep

Maintenance backlog for the 73 posts that shipped before bolding and FAQ
schema became standard. This is NOT the content run order: that is
`CONTENT-PLAN.md`, and a sweep pass never replaces writing the next entry.

Cadence: one post per pass, after a new article ships, never instead of one.


Audited 2026-09-02. Two gaps per post, checked independently: bold
coverage (% of `<p>` with zero `<strong>`; target the recent articles'
~85-95%) and whether a real `faqs` array exists (feeds FAQPage JSON-LD).
Fix one post per pass, after each new article ships, never instead of one:
bold pass (real claims only), false-"free"-claim check, British-spelling
normalize to American, and if FAQ:NO, a real Serper-PAA-sourced FAQ array.
Verify with `check-drift.mjs` + `check-blog-paragraphs.mjs`.

Ordered worst-first by bold %. ~~Struck~~ once done.

- ~~video-tagging~~ done 2026-09-02 (bold 0%→93%, free-claim fixed, British
  spellings fixed; still needs a real FAQ array)
- youtube-competitor-analysis: 100% unbolded, no FAQ
- youtube-thumbnail-size: 100% unbolded, no FAQ
- youtube-as-a-business: 100% unbolded, no FAQ
- youtube-channel-optimization: 100% unbolded, no FAQ
- free-subs-on-youtube: 100% unbolded, no FAQ
- youtube-niche: 97% unbolded, no FAQ
- vidiq-review: 97% unbolded, has FAQ
- youtube-tag-finder: 96% unbolded, no FAQ
- youtube-channel-audit: 95% unbolded, no FAQ
- more-views-on-youtube: 95% unbolded, no FAQ
- youtube-partner-program: 93% unbolded, no FAQ
- youtube-maker: 92% unbolded, has FAQ
- youtube-analytics: 91% unbolded, has FAQ
- youtube-analytics-tools: 90% unbolded, has FAQ
- youtube-algorithm: 89% unbolded, no FAQ
- youtube-seo-best-practices: 89% unbolded, has FAQ
- tubebuddy-vs-vidiq: 88% unbolded, has FAQ
- thumbnail-tester: 88% unbolded, no FAQ
- youtube-title: 88% unbolded, no FAQ
- youtube-channel-not-growing: 86% unbolded, no FAQ
- youtube-thumbnail-ideas: 86% unbolded, no FAQ
- google-adsense-youtube: 85% unbolded, has FAQ
- what-is-youtube-seo: 85% unbolded, has FAQ
- youtube-data-studies: 83% unbolded, no FAQ
- seo-tools-for-youtube: 83% unbolded, no FAQ
- youtube-watch-hours: 83% unbolded, has FAQ
- youtube-cpm: 82% unbolded, has FAQ
- comedy-video-ideas: 80% unbolded, has FAQ
- shorts-tagging: 79% unbolded, has FAQ
- grow-youtube-channel: 78% unbolded, no FAQ
- youtube-description-template: 78% unbolded, has FAQ
- youtube-vlog-ideas: 76% unbolded, has FAQ
- youtube-tags: 75% unbolded, has FAQ
- youtube-shorts-algorithm: 74% unbolded, has FAQ
- youtube-sponsorships: 74% unbolded, has FAQ
- cooking-video-ideas: 73% unbolded, has FAQ
- youtube-trends: 69% unbolded, has FAQ
- youtube-keyword-research-tools: 65% unbolded, has FAQ
- youtube-rpm: 65% unbolded, has FAQ
- youtube-title-length: 62% unbolded, has FAQ
- youtube-ctr: 50% unbolded, has FAQ
- youtube-shorts-pay: 49% unbolded, no FAQ
- youtube-challenge-ideas: 48% unbolded, has FAQ
- tech-video-ideas: 47% unbolded, has FAQ
- gaming-youtube-channel: 47% unbolded, has FAQ
- best-time-to-post: 44% unbolded, has FAQ
- gaming-video-ideas: 42% unbolded, has FAQ
- youtube-channel-phone: 41% unbolded, has FAQ
- youtube-shorts-ideas: 41% unbolded, has FAQ
- copyright-free-music: 41% unbolded, has FAQ
- youtube-monetization-beyond-ads: 38% unbolded, has FAQ (pillar, gets
  touch-ups from spoke work)
- youtube-1-million-views: 34% unbolded, has FAQ
- faceless-youtube-channel-ideas: 33% unbolded, no FAQ
- youtube-video-ideas: 32% unbolded, has FAQ
- youtube-banner-size: 27% unbolded, has FAQ
- start-youtube-channel: 23% unbolded, has FAQ
- youtube-brand-account: 22% unbolded, has FAQ
- chrome-extensions-for-youtube: 22% unbolded, no FAQ
- how-to-start-a-youtube-video: 13% unbolded, has FAQ
- youtube-demonetization: 14% unbolded, has FAQ
- too-late-to-start: 14% unbolded, has FAQ
- cash-cow-youtube-channels: 7% unbolded, has FAQ
- restart-youtube-channel: 6% unbolded, has FAQ
- youtube-ai-policy: 6% unbolded, has FAQ
- best-youtube-mic: 3% unbolded, has FAQ

Already clean, skip: youtube-super-thanks, youtube-channel-memberships,
video-length-by-niche, shorts-vs-long-form, youtube-view-growth-curve,
youtube-engagement-rate, music-video-ideas.
