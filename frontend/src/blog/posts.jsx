/**
 * Blog posts data file.
 *
 * To add a new post, add an object to the `posts` array below. Required
 * fields: slug, title, excerpt, date, category, cover, readTime, content.
 *
 * The `content` field is a JSX render function — write the body of the
 * post as React/JSX. Inside it you can use:
 *   - <p>, <h2>, <h3>, <ul>, <ol>, <li>, <strong>, <em>, <blockquote>
 *   - <a href="/internal/path">internal link</a>     (uses React Router)
 *   - <a href="https://external.com" target="_blank">external link</a>
 *   - <img src="/blog/your-image.jpg" alt="..." />   (drop image in frontend/public/blog/)
 *
 * Styling for these tags lives in BlogPost.jsx — write semantic HTML and
 * it'll look right automatically.
 */

export const CATEGORIES = {
  growth:    { slug: 'growth',    label: 'Growth' },
  seo:       { slug: 'seo',       label: 'SEO' },
  thumbnails:{ slug: 'thumbnails',label: 'Thumbnails' },
  strategy:  { slug: 'strategy',  label: 'Strategy' },
  analytics: { slug: 'analytics', label: 'Analytics' },
}

export const posts = [
  {
    slug: 'how-to-get-first-1000-youtube-subscribers',
    title: 'How to get your first 1,000 YouTube subscribers',
    excerpt: 'Most creators give up before they hit 1,000. Not because they make bad videos — because they don\'t know what to optimize first.',
    date: '2026-05-07',
    category: CATEGORIES.growth,
    cover: '/blog/first-1000-cover.jpg',
    author: 'Denzil',
    readTime: '6 min read',
    content: () => (
      <>
        <p>Most creators give up before they hit 1,000 subscribers. That's not because they make bad videos. It's because they don't know what to optimize first, so they end up changing everything at once and learning nothing.</p>

        <p>Here's the playbook that actually works for new channels — the one we built YTGrowth around after watching thousands of channels cross the threshold.</p>

        <h2>1. Pick one niche and stick to it for 90 days</h2>

        <p>YouTube's recommendation system rewards channels that send a clear topic signal. If your last five videos are scattered across cooking, gaming, and personal vlogs, the algorithm has nothing to anchor on, so it shows your videos to nobody in particular.</p>

        <p>The fix isn't complicated: pick one topic and publish ten videos in a row about it. That's it. Don't worry about being boring — your first 1,000 subscribers care more about consistency than variety.</p>

        <p>If you're not sure which topic to commit to, run your existing videos through <a href="/features/seo-studio">SEO Studio</a> and see which ones already have the most YouTube traction. Double down on whatever's working, even slightly.</p>

        <h2>2. Get the title and thumbnail right before you film</h2>

        <p>The single biggest mistake new creators make is filming the video first and figuring out the title afterwards. By then it's too late — the video you made doesn't quite match any title that would actually get clicks.</p>

        <p>Reverse the order. Start with the title and thumbnail. Make sure they'd make <em>you</em> click. Then film a video that delivers exactly what the title and thumbnail promised.</p>

        <p>Two free tools that help here:</p>

        <ul>
          <li><a href="/tools/youtube-thumbnail-downloader">YouTube Thumbnail Downloader</a> — pull the thumbnails of the top videos in your niche and study what they have in common.</li>
          <li><a href="/features/thumbnail-iq">Thumbnail IQ</a> — score your own thumbnail against the top performers before you publish.</li>
        </ul>

        <h2>3. Stop checking analytics every hour</h2>

        <p>For your first 1,000 subscribers, the number that matters is <strong>average view duration</strong>, not subscribers. Subscribers are a trailing indicator — they show up after you've already nailed retention.</p>

        <blockquote>If you can keep a viewer watching for 60% of your video, the algorithm will find more viewers for you. If you can't, no amount of subscriber-bait will save the channel.</blockquote>

        <p>Check your retention graph after each video. Find the spot where viewers drop off. Cut that part out of your next video. Repeat ten times.</p>

        <h2>The boring truth</h2>

        <p>There's no shortcut. The creators who hit 1,000 subscribers in 90 days didn't get lucky — they picked a clear niche, optimized titles and thumbnails before filming, and treated retention as the only metric worth obsessing over.</p>

        <p>Everything else is noise. If you want a tool that handles the optimization side so you can focus on the filming, <a href="/">YTGrowth</a> was built for exactly this.</p>
      </>
    ),
  },
]

export function getPostBySlug(slug) {
  return posts.find(p => p.slug === slug) || null
}

export function getRelatedPosts(currentSlug, max = 3) {
  return posts.filter(p => p.slug !== currentSlug).slice(0, max)
}

export function formatPostDate(isoDate) {
  const d = new Date(isoDate)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}
