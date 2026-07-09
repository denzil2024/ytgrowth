/* Shared category metadata for /youtube-stats hub + /youtube-stats/:slug
   drilldown pages. The hub uses { id, label, blurb }. The drilldown pages
   use the rest (seoTitle, seoDescription, intro, highlights, faqs) for
   per-category landing-page content.

   Keep the order here in sync with the order shown on the hub. */

export const CATEGORY_META = [
  {
    id:    'gaming',
    label: 'Gaming',
    blurb: 'The biggest gaming channels on YouTube. Esports, Let’s Plays, walkthroughs, and reaction streams.',
    seoTitle:       'Top 50 Gaming YouTube Channels 2026: Live Subscriber Rankings',
    seoDescription: "The top 50 gaming YouTube channels, ranked by live subscriber count from YouTube's API. Esports, Let's Plays, speedruns, reaction streams.",
    intro: [
      "Gaming is YouTube's largest single category by hours watched. The biggest gaming channels routinely cross 50 million subscribers and post billions of lifetime views, fuelled by an audience that watches streams, Let's Plays, walkthroughs, esports highlights, and reaction content for hours at a time.",
      "What separates the top channels is volume and consistency. The leaders ship multiple videos per week, lean into long-form (often 20+ minutes), and build their identity around a specific game franchise or play-style before branching out. Mid-rolls on long videos make gaming one of the better RPM categories despite the per-view CPMs being lower than tier-1 niches like finance.",
    ],
    highlights: [
      'Long-form dominates: 20+ minute Let’s Plays and walkthroughs out-earn shorter videos thanks to multiple mid-roll slots per view.',
      'Series and franchises matter: viewers subscribe to a Minecraft channel for Minecraft, not to its random vlog uploads.',
      'Live streaming is the second engine: watch-hours from streams compound on top of VOD revenue and grow the algorithm’s confidence in the channel.',
    ],
    faqs: [
      { q: 'How much do top gaming YouTubers actually make?',
        a: 'Top gaming channels with 5–20 million monthly views typically earn $15K–$80K/month from YouTube ads alone, depending on watch time, mid-roll placement, and audience country mix. Brand sponsorships from gaming peripherals, energy drinks, and game launches usually add another 2–4x on top of ad revenue. The very top channels (50M+ subs) routinely clear seven figures per month from the platform plus brands.' },
      { q: 'What is the best gaming YouTube channel size to break in at?',
        a: "There's no minimum. The Partner Program threshold is 1,000 subs + 4,000 watch hours, which a focused new creator can clear in 3–6 months by posting 2–3 videos a week on a single game with a clear hook. The harder gate is consistency: most creators quit before they hit 1,000 subs, not because the threshold is too high, but because they shipped 8 videos and gave up." },
      { q: 'Why do some gaming channels grow faster than others in the same niche?',
        a: "Two things: thumbnail/title craft and series structure. Channels that win the click war on the same game routinely 3–5x channels with identical content quality. The other compounder is series: a channel running an obvious 'episode 1, 2, 3' format gets binge-watched, and binge-watching is the single strongest signal YouTube uses to rank a channel inside its category." },
      { q: 'Do gaming channels need to face-cam to grow?',
        a: "No. Many of the largest gaming channels are faceless or use minimal facecam. What matters is voice energy and reaction beats, not whether the camera is on. That said, facecam tends to lift CTR by 10–20% on thumbnails because human faces draw the eye. Worth A/B testing per video, not committing to one mode forever." },
      { q: 'How do gaming channels handle copyright on game footage?',
        a: 'Game publishers generally allow gameplay footage on YouTube under their content-creator policies, though some (Nintendo most famously) have stricter rules and may claim revenue on certain titles. The safe path: check each publisher\'s policy before building a channel around a single franchise, and add transformative commentary or facecam reactions so your videos qualify for fair use protections beyond what the publisher\'s policy alone covers.' },
    ],
    sections: [
      { kind: 'prose', eyebrow: 'Reach vs pay', heading: 'The most-watched niche pays among the least per view.',
        paras: [
          "Gaming leads YouTube in watch time and trails it in RPM. The audience is vast and loyal, yet the biggest-paying advertisers spend elsewhere. A gaming view is worth a fraction of a finance or tech view.",
          "The leaderboard splits into two clear tiers. A handful of personalities and studios hold tens of millions of subscribers, and beneath them a long tail of faceless channels, mobile compilations, and kids' content scales on volume alone.",
          "Durability comes from the game, not the creator. Viewers subscribe to a Minecraft channel for Minecraft, so the strongest channels anchor to one or two titles first. They branch out only once the identity is set.",
        ] },
      { kind: 'table', eyebrow: 'Where the money comes from', heading: 'Ads are the smallest line at the top.',
        columns: ['Source', 'Priced on', 'Scale'],
        rows: [
          ['Long-form ads', 'CPM per 1,000 views', 'Low but steady'],
          ['Shorts ads', 'Shared pool, ~$0.03–0.10 / 1K', 'Negligible'],
          ['Channel memberships', 'Monthly, per member', 'Grows with loyalty'],
          ['Twitch subs & bits', 'Monthly plus live tips', 'Often beats YouTube ads'],
          ['Sponsorships', 'Flat fee per integration', 'Largest line at scale'],
          ['Merchandise', 'Margin per unit', 'Tracks community size'],
        ] },
      { kind: 'breakdown', eyebrow: 'How the channels win', heading: 'The footage matters least.',
        items: [
          { h: 'The thumbnail is the whole game', p: "Gameplay footage looks alike across a niche, so the click comes down to the thumbnail and title. Winning channels test packaging constantly and re-thumbnail anything that stalls. The image is the product; the footage only delivers it." },
          { h: 'Clips are the front door', p: "The fastest-growing channels cut their long videos and streams into vertical clips. The clips pull in new viewers cheaply. Those viewers then move to long-form and live, where the watch time and revenue sit." },
          { h: 'Mind the made-for-kids switch', p: "Content aimed at children falls under COPPA. That strips personalized ads and disables comments, end screens, and notifications, cutting both RPM and reach. Channels serving kids plan for it early and lean on memberships and merch." },
        ] },
    ],
  },

  {
    id:    'tech',
    label: 'Tech & Reviews',
    blurb: 'Reviewers, tear-downs, and software/hardware explainers. The channels brand sponsorships fight over.',
    seoTitle:       'Top 50 Tech YouTube Channels 2026: Reviewers, Explainers, Tear-Downs',
    seoDescription: "The top 50 tech YouTube channels, ranked by live subscriber count from YouTube's API. Hardware reviews, software explainers, tear-downs.",
    intro: [
      "Tech is one of YouTube's most lucrative niches. Top tech reviewers routinely command $30+ RPMs because the audience skews towards high-income tier-1 markets and the topics overlap with high-CPM ad categories: software, gadgets, financial tools, learning platforms.",
      "The category divides into three lanes: consumer reviews (phones, laptops, headphones), enthusiast deep-dives (custom PCs, dev tools, server setups), and explainer journalism (how does this work, why this happened). The biggest channels operate at production-studio scale, but solo creators with a sharp angle still break through every year.",
    ],
    highlights: [
      'High RPM: tech audiences trigger premium ad inventory; expected RPMs are 2–3x the YouTube average.',
      'Sponsorship-heavy: most full-time tech creators earn more from brand integrations than from AdSense.',
      'Production quality matters more than in any other category: poor audio or jittery shots cap a channel below 100K subs.',
    ],
    faqs: [
      { q: 'Why is the tech niche so profitable for YouTubers?',
        a: 'Three reasons: (1) the audience is concentrated in tier-1 countries (US, UK, Canada, Australia, Germany) where ad spend is highest; (2) the topics map to expensive product categories where advertisers will outbid each other for attention; (3) tech viewers are early adopters with above-average disposable income, which makes them attractive targets for affiliate, sponsorship, and product partnerships beyond AdSense.' },
      { q: 'Do tech YouTubers buy the gear they review or get sent it free?',
        a: "Both. The biggest channels usually buy the gear themselves to maintain editorial independence, then sell or donate it after the review. Smaller channels often work with brand programs that send units in exchange for review coverage (without requiring a positive verdict, in most reputable cases). Channels that take cash for positive reviews lose audience trust quickly and almost never sustain growth past 200K subs." },
      { q: "What's the typical CPM for a tech YouTube channel?",
        a: 'CPMs in tech tend to land in the $8–$25 range, with RPMs (after YouTube\'s 45% cut and unmonetized views) of $4–$15 per 1,000 views. Software-adjacent niches (productivity tools, cloud platforms, AI tooling) skew higher. Pure consumer-electronics review channels skew towards the middle. Software-tutorial channels in B2B niches (SaaS, dev tools, security) can clear $30 RPM during budget season.' },
      { q: 'How long should a tech review video be?',
        a: 'For full reviews: 12–25 minutes. Anything shorter struggles to qualify for multiple mid-rolls; anything longer than 25 minutes typically loses retention curve advantage unless the topic genuinely warrants depth. For tutorials and explainers: 8–15 minutes hits the sweet spot. For news pieces and reactions: 6–10 minutes. The mid-roll math (videos over 8 minutes can run multiple ad slots) is the single biggest RPM lever in this category.' },
      { q: 'Is the tech niche too saturated for new creators?',
        a: 'No, but the angle matters. Generic phone reviews are saturated. Niches inside tech are wide open: enterprise SaaS reviews, dev tooling, AI workflow explainers, retro hardware restoration, smart-home integration, accessibility tech. The pattern: pick a sub-niche specific enough that you can be the obvious answer for that topic, then expand outward once you have a base.' },
    ],
  },

  {
    id:    'beauty',
    label: 'Beauty & Makeup',
    blurb: 'Tutorials, reviews, GRWMs, and brand collabs. Some of YouTube\'s longest-running creator empires.',
    seoTitle:       'Top 50 Beauty YouTube Channels 2026: Makeup, Skincare, GRWM Rankings',
    seoDescription: "The top 50 beauty and makeup YouTube channels, ranked by live subscriber count from YouTube's API. Tutorials, reviews, GRWMs.",
    intro: [
      "Beauty is one of YouTube's foundational creator categories. The biggest channels were built over a decade and have evolved from tutorials into multi-platform brand empires, often launching successful makeup or skincare lines that dwarf their YouTube ad revenue.",
      "What still works in 2026: tutorials with actual technique (not just product showcases), brutally honest reviews, get-ready-with-me long-form, and luxury-brand deep-dives that double as aspirational content. The category has shifted from 'how to apply' towards 'what's actually worth your money', which has favoured reviewers with clear taste and spending power over pure demo channels.",
    ],
    highlights: [
      'Long careers: top beauty channels often span 8–12 years on the platform, much longer than most other niches.',
      'Product-business synergy: AdSense is rarely the main revenue line; brand deals and owned product lines are.',
      'Luxury skincare > drugstore for RPM: ad demand from high-end brands lifts the category\'s effective CPMs above the YouTube average.',
    ],
    faqs: [
      { q: 'How do beauty YouTubers actually make money?',
        a: "Most full-time beauty creators have four income streams: (1) AdSense, usually a smaller slice; (2) brand sponsorships and PR partnerships; (3) affiliate commission from product links (Sephora, Ulta, Amazon); (4) their own product line, which over time becomes the largest line for top channels. The biggest beauty creators on YouTube earn 70–90% of their income outside YouTube ads." },
      { q: 'Is beauty too saturated for new creators?',
        a: "It's saturated for generic 'apply makeup' content. It is wide open for specific angles: skincare for a particular skin condition, makeup for a particular skin tone, technique tutorials for under-served features, niche brand-history deep-dives, or budget-only product reviews. The top new entrants in the past 3 years have all picked a sub-niche specific enough to own, then expanded." },
      { q: 'Do beauty channels need professional lighting and cameras?',
        a: "Better than the niche average, yes. Beauty is one of the few niches where image quality directly affects credibility, because viewers need to see exact colours and finishes. A solid ring light, a good front-facing camera (even a recent phone), and a controlled background are non-negotiable. Studio-grade gear is not, especially in the first 12 months." },
      { q: 'What is GRWM and why is it so popular on YouTube right now?',
        a: 'Get-Ready-With-Me (GRWM) videos let creators do hair, skincare, and makeup while talking about their day, recent events, or product opinions. The format works because it combines tutorial value with parasocial connection: viewers feel like they\'re hanging out, not watching a lesson. GRWMs typically hit higher watch-time than equivalent tutorial videos because the conversational element keeps viewers around even when the technique has finished.' },
      { q: 'How important are PR packages and brand partnerships for growth?',
        a: 'Less than they used to be. PR unboxings still work for established channels, but new beauty creators grow faster by reviewing what real consumers actually buy (drugstore, mid-tier, viral TikTok products) than by chasing PR send-outs. Brand partnerships matter more for revenue than discovery, and they tend to follow audience size rather than create it.' },
    ],
  },

  {
    id:    'finance',
    label: 'Finance & Investing',
    blurb: 'Personal finance, markets, real estate, and side-hustle channels. The highest-RPM corner of YouTube.',
    seoTitle:       'Top 50 Finance YouTube Channels 2026: Investing, Markets, Money',
    seoDescription: "The top 50 personal finance and investing YouTube channels, ranked by live subscriber count from YouTube's API. Markets, real estate, side hustles.",
    intro: [
      "Finance has the highest RPM of any major YouTube category. Brokerages, neobanks, credit cards, tax software, and online business platforms all bid heavily for finance audiences, which pushes effective RPMs into the $20–$50 range against a YouTube average of $3–$8.",
      "The audience splits into personal finance (budgeting, debt, retirement), active investing (markets, options, crypto), real estate, entrepreneurship and side hustles. The top channels in each lane have been at it for 5–10 years and have built credibility through consistency and through being correct (or at least useful) when many of their peers were not.",
    ],
    highlights: [
      'Highest RPMs on the platform: 4–6x the YouTube average for tier-1 audiences.',
      'Sponsorship demand exceeds inventory: top finance creators routinely turn away brand deals.',
      'Trust compounds: viewers who trust a finance creator stay subscribed for years and convert at high rates on affiliate offers and own products.',
    ],
    faqs: [
      { q: 'Why does finance have such high RPMs on YouTube?',
        a: "Because the advertisers are willing to pay a lot per viewer. Brokerages, banks, credit-card issuers, and tax-software companies all earn $200–$2,000+ per acquired customer, which lets them outbid almost every other ad category. A finance YouTube viewer is the kind of viewer those advertisers most want to reach, and YouTube's auction passes that demand back to the creator as RPM." },
      { q: 'Do you need credentials to run a finance YouTube channel?',
        a: 'You do not need credentials, but you do need to be careful with what you say. Channels that give specific investment advice without a license are running real legal risk, especially in the US under SEC rules. The safer path is education ("here is how index funds work", "here is how a Roth IRA works"), commentary on news, and personal experience ("here is what I do") rather than direct advice ("you should buy this stock").' },
      { q: 'How do finance YouTubers actually make money beyond ads?',
        a: 'Affiliate income is the largest line for many. Brokerage referrals can pay $50–$300 per funded account; credit-card affiliates pay $50–$500 per approval; tax-software partners pay $20–$50 per signup. Combined with above-average AdSense and brand deals from fintech companies, a 100K-sub finance channel can clear what a 1M-sub gaming channel earns just on YouTube ads.' },
      { q: 'What size finance channel actually moves markets or matters?',
        a: 'For market commentary: even small channels (5K–50K subs) can build a tight, engaged audience that takes their analysis seriously. For acquiring affiliate revenue: the curve really opens up around 50K subs, when audiences are large enough that affiliate-link clicks generate meaningful income. For brand deals: 100K+ subs is where finance brands start cold-outreaching for partnerships.' },
      { q: 'Is the finance niche oversaturated now?',
        a: 'Generic personal-finance is saturated. Specific niches inside finance are not: small-business accounting, freelance taxes, real-estate sub-categories (Section 8, mobile-home parks, short-term rentals), retirement for specific careers, geo-specific finance (UK ISAs, Canadian TFSAs, Australian super). The bar to break in is higher than 5 years ago, but the affiliate and ad economics are still better than every other YouTube category.' },
    ],
    sections: [
      { kind: 'prose', eyebrow: 'Subs vs income', heading: 'The biggest finance channel is rarely the richest.',
        paras: [
          "Finance is the rare YouTube category where subscriber count is a poor proxy for income. A channel with a few hundred thousand subscribers regularly out-earns one several times its size. The value of a finance viewer comes from intent, not volume.",
          "A viewer watching a Roth IRA or index-fund tutorial is minutes from opening a brokerage account. That single action pays the creator $50 to $300, and more over the viewer's lifetime. A viewer watching a market-crash reaction carries almost none of that value.",
          "That gap pushes the durable channels toward the steadier lanes. Budgeting, debt payoff, and instructional investing never go out of date. Creators like Dave Ramsey and Graham Stephan built back catalogues that keep earning for years.",
          "Crypto and active-trading channels sit at the opposite end. Their audiences swell in a bull market and vanish when the cycle turns. The top of the finance leaderboard looks nothing alike in a hype year and a flat one.",
          "Production quality matters less here than in almost any other category. The audience is cautious with money and alert to a sales pitch. A screen recording of a real spreadsheet beats a polished studio set, as long as the reasoning holds up.",
          "Credibility, not reach, is the currency of the niche. Creators who show their real numbers and name the risks are the ones whose audience acts: opening the account, buying the course, booking the call. That conversion is where most finance income is made.",
        ] },
      { kind: 'breakdown', eyebrow: 'The discipline', heading: 'In finance, discipline out-earns reach.',
        items: [
          { h: 'Specificity is the cheat code', p: "A narrow angle, freelance taxes, one country's retirement accounts, a single real-estate strategy, out-ranks and out-earns generic 'how to invest.' It matches exactly what a searcher typed and exactly the audience an advertiser pays to reach, so both the algorithm and the RPM reward it." },
          { h: 'Evergreen compounds, news decays', p: "An index-fund explainer earns for five years; a 'market crash incoming' video earns for a week and then ages badly. The durable channels build a library of evergreen explainers as the product and treat timely news as top-of-funnel, not the thing they sell." },
          { h: 'The disclaimer is the business model', p: "Finance is one of the few niches where restraint pays. Staying in education and personal experience, rather than direct advice, keeps advertisers comfortable and regulators uninterested, which is exactly what lets a channel run the high-value affiliate and sponsor deals underneath." },
          { h: 'Every video points to one link', p: "The strongest finance channels do not treat ads as the goal. Each video answers a single question and funnels to one relevant tool, a broker, a budgeting app, a course, where the real money is. One clear call to action converts far better than five competing ones." },
        ] },
    ],
  },

  {
    id:    'cooking',
    label: 'Cooking & Food',
    blurb: 'Recipes, restaurant reviews, food science, and pro-chef teaching channels.',
    seoTitle:       'Top 50 Cooking YouTube Channels 2026: Recipes, Chefs, Food Science',
    seoDescription: "The top 50 cooking and food YouTube channels, ranked by live subscriber count from YouTube's API. Recipes, restaurant reviews, pro chefs.",
    intro: [
      "Cooking is one of the most evergreen categories on YouTube. People search for specific recipes year after year, and a single high-quality recipe video can bring in views for a decade. The biggest cooking channels combine that long-tail SEO benefit with personality-driven content: trips to markets, technique deep-dives, restaurant reviews, and chef-vs-chef showdowns.",
      "The most successful new cooking creators of the last few years have leaned into specificity (regional cuisines, single ingredients, single techniques) rather than trying to be a general recipe channel. The general lane is occupied by 5–10 entrenched giants. The niches around them are still wide open.",
    ],
    highlights: [
      'Recipe videos have the longest tails on YouTube: a 2018 recipe still ranks and earns in 2026.',
      'Production-light: a phone, a tripod, and clean lighting beats most early-career cooking channels.',
      'Cookbook and product extensions: top cooking channels almost always launch books, sauces, or kitchen gear within 3 years.',
    ],
    faqs: [
      { q: 'How long should a cooking video be on YouTube?',
        a: 'Recipe videos hit a sweet spot at 6–12 minutes: enough room for ingredients, technique, and a bit of personality without padding. Pure technique deep-dives can stretch to 15–25 minutes if the topic warrants it (e.g. bread, BBQ, knife skills). Avoid hitting 8 minutes artificially just for mid-rolls, viewers feel padded videos and bounce, which kills the algorithm signal that funds the next upload.' },
      { q: 'Do cooking YouTubers buy their own ingredients?',
        a: 'Most do. Brand sponsorships are usually for kitchen tools, appliances, or grocery delivery services rather than ingredients themselves. Some channels work with farms or speciality ingredient suppliers for paid integrations, but the biggest cooking creators usually pay for ingredients out of pocket so editorial independence is obvious.' },
      { q: "What's the typical RPM for a cooking channel?",
        a: 'Cooking is mid-tier on RPM, usually $3–$8 per 1,000 views in the US, lower internationally. The category sits below finance and tech but above gaming and entertainment. Sponsorships for kitchen gear, knife brands, meal-kit services, and cookware push effective income well above the AdSense rate, especially for channels with strong editorial trust.' },
      { q: 'Should new cooking creators use a face-cam or stay anonymous?',
        a: 'Either works. The biggest cooking channels include both face-front personality channels (Joshua Weissman, Matty Matheson) and faceless top-down channels (Tasty, Bon Appetit\'s legacy edits). Face-cam tends to grow faster on personality and reaction; faceless top-down tends to grow faster on pure recipe SEO. Pick what you are comfortable shipping for the next 5 years.' },
      { q: 'What is the easiest sub-niche to break into in cooking?',
        a: 'Highly specific cuisines or techniques have the lowest competition. Single-ingredient channels (sourdough, hot sauce, pickling), regional cuisines beyond the top 5 (Filipino, Trinidadian, Nigerian), or technique channels (knife skills, butchery, fermentation) all have audiences that are large enough to support a full-time channel and competition that is small enough to win quickly.' },
    ],
  },

  {
    id:    'fitness',
    label: 'Fitness & Health',
    blurb: 'Workouts, nutrition, mobility, and physique transformations across every training style.',
    seoTitle:       'Top 50 Fitness YouTube Channels 2026: Workouts, Nutrition, Training',
    seoDescription: "The top 50 fitness and health YouTube channels, ranked by live subscriber count from YouTube's API. Workouts, nutrition, training plans.",
    intro: [
      "Fitness on YouTube has split into two camps. One camp is workout-along videos: bodyweight, yoga, HIIT, low-impact, anything a viewer can press play and follow in their living room. The other is education and entertainment: technique, programming, nutrition science, and athlete-following content that viewers consume but do not necessarily train along to.",
      "The workout-along camp is dominated by a handful of long-running channels with massive subscriber bases. The education camp has had more turnover and is where most new full-time creators have broken through in the past 5 years, often by combining specific expertise (a sport, a body part, a population) with evidence-based commentary.",
    ],
    highlights: [
      'Workout-along videos compound: a single 30-minute workout can earn for years as viewers replay it.',
      'Supplement and apparel sponsorships dominate revenue for top channels.',
      'Niches inside fitness still open: women-specific strength, older-adult mobility, sport-specific conditioning, post-injury rehab.',
    ],
    faqs: [
      { q: 'What workout video format performs best on YouTube?',
        a: 'Two formats dominate: 20–30 minute follow-along workouts that viewers replay, and 8–15 minute educational videos that explain technique, programming, or muscle groups. The follow-along earns watch-time and replays. The educational format earns shares and search rankings. Top fitness channels run both formats in parallel rather than picking one.' },
      { q: 'Do fitness YouTubers need to be visibly fit to grow?',
        a: 'Helps but not required. Some of the highest-trust fitness channels are run by coaches who look fit but not extreme; they frame themselves as the practical guide for people who want results without becoming athletes. Pure aesthetics channels (bodybuilding, physique) do require the look, because the content is implicitly a demo of what the methods produce.' },
      { q: 'How do fitness YouTubers make money beyond ads?',
        a: 'Three main lines: (1) supplement and equipment sponsorships, (2) coaching and programming sales (PDF programs, app-based programming, in-person coaching), (3) affiliate revenue from gear and supplement brands. The largest channels usually launch their own apparel, supplement line, or training app within 2–3 years of going full-time.' },
      { q: 'Is workout YouTube oversaturated?',
        a: 'Generic workout content is saturated. Specific populations are wide open: post-pregnancy training, training over 50, training with chronic conditions (diabetes, joint issues, autoimmune), training for specific sports outside the mainstream (climbing, surfing, racquet sports), and training in specific equipment-constrained settings (apartment workouts, hotel workouts, single-dumbbell programs).' },
      { q: 'How long does it take a new fitness channel to hit monetization?',
        a: 'Three to nine months for a focused creator who ships consistently. The Partner Program threshold is 1,000 subs + 4,000 watch hours. Workout-along videos rack up watch hours quickly because viewers stay for the full session. Educational videos earn subs faster but build watch hours more slowly. Most successful new fitness channels run both formats from day one.' },
    ],
  },

  {
    id:    'music',
    label: 'Music',
    blurb: 'Artists, labels, music video channels, and instrument-teaching channels with the biggest reach.',
    seoTitle:       'Top 50 Music YouTube Channels 2026: Artists, Videos, Lessons',
    seoDescription: "The top 50 music YouTube channels, ranked by live subscriber count from YouTube's API. Artists, music videos, instrument lessons.",
    intro: [
      "Music dominates YouTube subscriber rankings. Major label channels (T-Series, Vevo-distributed artist channels, label-owned imprints) routinely sit in the platform's top 20, fuelled by music video premieres that pull billions of views.",
      "Beyond the labels, music YouTube includes instrument tutorial channels, music theory and production education, reaction channels, and independent artists building direct-to-fan careers. The economics are very different from other niches: per-view RPMs are low, but the content has long tails (a music video earns for years) and music feeds into Spotify streams, merch, ticket sales, and royalties.",
    ],
    highlights: [
      'Per-view RPM is below most categories, but volume is enormous.',
      'Catalog earns for years: a 2016 music video can still drive seven-figure annual streams in 2026.',
      'YouTube is the discovery layer for Spotify and ticket sales, which is where most artists actually monetize.',
    ],
    faqs: [
      { q: 'How much do music YouTubers earn from views?',
        a: "Per-view RPMs in music are low (typically $1–$3 per 1,000 views) because much of the audience is mobile, much of it is muted background play, and much of the inventory is short-form. But volume compensates: a music video with 100M views earns roughly $100K–$300K from YouTube ads, plus another $50K–$150K from Content ID matches across user-generated uploads, plus the long-tail flow into streaming royalties and tour ticket sales." },
      { q: 'Do independent musicians need a label to grow on YouTube?',
        a: 'No. Many of the largest music channels of the past decade started independent and either stayed independent or signed distribution-only deals later. What they did need: a clear sound, consistent output (a release every 4–8 weeks), strong thumbnail/title craft on each upload, and integration with TikTok and Reels for new-music discovery.' },
      { q: 'What is Content ID and how does it pay artists?',
        a: 'Content ID is YouTube\'s system for detecting copyrighted music inside other people\'s videos. When a creator uses your song, Content ID can either block the upload, monetize it on your behalf, or split revenue. For musicians, this is often a larger income line than their own channel\'s views, because user-generated content (covers, edits, vlogs using your song) accumulates billions of views over years.' },
      { q: 'How do music tutorial channels (guitar, piano) make money?',
        a: 'Three lines: (1) AdSense from the lessons themselves (mid-tier RPM, around the YouTube average); (2) course sales (the largest line for established channels); (3) affiliate income from instrument gear, software, and learning platforms. Top guitar and piano YouTube channels routinely earn 5–10x their AdSense from selling their own structured course programs.' },
      { q: 'Is music YouTube oversaturated for new artists?',
        a: 'Major-label competition for genre-pop categories is overwhelming. Independent music in specific niches is wide open: non-English languages, underrepresented genres (modern blues, neo-soul, instrumental electronic), production tutorials, music history, and music theory. Tutorial and education channels are a much faster path to revenue than original music for most new creators.' },
    ],
  },

  {
    id:    'education',
    label: 'Education & Science',
    blurb: 'Explainers, lectures, and visualised science. The format that makes "edutainment" a real category.',
    seoTitle:       'Top 50 Education YouTube Channels 2026: Science, Explainers, Lectures',
    seoDescription: "The top 50 education and science YouTube channels, ranked by live subscriber count from YouTube's API. Explainers, lectures, edutainment.",
    intro: [
      "Education on YouTube has matured from textbook lectures into genuinely cinematic explainer content. The biggest channels in the category use 3D animation, original photography, and tightly-scripted narration to make subjects (physics, biology, history, mathematics) feel like documentaries.",
      "What separates the top channels from the long tail is production discipline: they ship less frequently (often once a month for the highest-end channels) but each upload is a multi-week project with research, scripting, and animation work that compounds across the channel's identity. RPMs in education skew above the YouTube average because the audience is older and more affluent than the platform mean.",
    ],
    highlights: [
      'Long lifetimes per video: the best explainers earn for 5–10 years on the search-driven long tail.',
      'Higher RPMs than entertainment: educational topics overlap with high-CPM advertiser categories (software, finance, learning platforms).',
      'Production-heavy: cinematic animation and original research are the moat that keeps competition out.',
    ],
    faqs: [
      { q: 'Why do education channels post so infrequently?',
        a: 'Because the format is research-heavy and animation-heavy. A single 15-minute explainer from a top science channel typically takes 4–8 weeks of research, scripting, voice work, and animation. The channels that try to ship weekly without that depth tend to plateau quickly because the audience has been trained to expect documentary-grade quality from the category.' },
      { q: 'How do education channels make money if they post once a month?',
        a: 'Each upload generates a long-tail income that runs for years. A single high-quality explainer can earn $10K–$100K over 5 years from AdSense alone, plus large brand-sponsorship rates from learning platforms (Brilliant, MasterClass, Skillshare) and software companies. Patreon and direct-fan support are also disproportionately strong in this category because the audience values the depth of the work.' },
      { q: 'What software do education YouTubers use for animations?',
        a: "After Effects is still the workhorse for 2D motion graphics. For 3D, Blender (free) has taken over from Cinema 4D at most channels. For data visualisation, custom Python or Manim (originally built by 3Blue1Brown) is common. The biggest channels also commission custom illustrators and animators rather than relying on a single tool. There's no single 'right' stack, the consistent thread is putting genuine production effort into each upload." },
      { q: 'Can a solo creator compete with cinematic-quality education channels?',
        a: 'Yes, on angle and clarity rather than production budget. The most successful new education channels of the last 5 years have been solo creators who picked a specific corner of a subject (a particular era of history, a particular subdomain of biology, a particular piece of mathematics) and made the clearest possible explainer of it, accepting lower production quality than the category leaders in exchange for ship velocity.' },
      { q: 'Is education YouTube saturated?',
        a: 'Genericeducational content is saturated. Specific subjects taught by specific people are not. Niches like astrophysics-for-laypeople, modern biology, financial mathematics, ancient history, modern engineering, and applied mathematics still have wide-open ranges of topics that no top channel has covered with proper depth.' },
    ],
  },

  {
    id:    'vlogs',
    label: 'Vlogs',
    blurb: 'Daily vlogs, family channels, and lifestyle creators with audiences that show up for every upload.',
    seoTitle:       'Top 50 Vlog YouTube Channels 2026: Daily Vlogs, Family, Lifestyle',
    seoDescription: "The top 50 vlog YouTube channels, ranked by live subscriber count from YouTube's API. Daily vlogs, family channels, lifestyle creators.",
    intro: [
      "Vlogs are the original YouTube format. The category includes daily vlogs (life as it happens), family channels (multi-person, often multi-generational), and lifestyle creators who build narrative around a specific lifestyle aesthetic.",
      "What sustains a top vlog channel is parasocial connection: viewers follow the creators across years and genuinely care about the people on screen. The format is high-volume (the best channels ship 3–7 videos per week) and high-burn, many top vloggers have stepped back from daily uploads after multi-year runs because the cadence is unsustainable. The ones still at it run small production teams that handle editing and post-production.",
    ],
    highlights: [
      'Highest upload cadence on the platform: top channels post 3–7 days per week.',
      'Brand-deal heavy: lifestyle products, hotels, and travel partnerships dominate revenue.',
      'Career arc: most major vloggers eventually slow down, branch into other formats, or hand off to a team.',
    ],
    faqs: [
      { q: 'How long should a vlog be on YouTube?',
        a: '10–18 minutes hits the sweet spot for daily vlogs: enough length to qualify for multiple mid-rolls, short enough to ship daily without losing retention. Family channel vlogs and weekly lifestyle uploads can stretch to 20–30 minutes when the content warrants it. Anything below 8 minutes leaves significant ad revenue on the table.' },
      { q: 'How do vlog YouTubers make money beyond ads?',
        a: 'Brand sponsorships are usually the largest line: lifestyle brands, beauty products, food brands, travel partners, and apps all pay vloggers for in-video integrations. Merchandise is another major line for personality-driven channels. Some top vloggers also earn through Patreon-style direct fan support, course sales, or owned product lines.' },
      { q: 'Is daily vlogging sustainable as a long-term career?',
        a: 'Hard. Most creators who started daily vlogging in the 2014–2018 wave have since either stopped, slowed to weekly, or built teams around themselves to share the editing load. The format demands constant content from your real life, which is psychologically expensive. Most successful long-term vloggers eventually transition into less frequent, more polished uploads or branch into adjacent formats like long-form documentary-style episodes.' },
      { q: 'Do family vlog channels need to feature their kids?',
        a: 'There is no platform requirement, and a growing number of family channels are deliberately keeping kids off-camera while still framing the content around parenting and family life. Channels that do feature kids face increasing scrutiny around child-creator labour laws and platform safeguards. The decision is more an ethical and legal one than a growth one, both approaches can build large audiences.' },
      { q: 'Can new vloggers still break through in 2026?',
        a: 'Yes, but the bar has risen. The most successful new vlog channels in the past 3 years have all combined a clear identity (a specific city, a specific career, a specific lifestyle) with high production quality and consistent uploads. Generic personal vlogs without a clear hook rarely break out of the long tail. Niche-specific vlogs (small-business vlogs, residency-doctor vlogs, single-parent vlogs, tradie vlogs) still have plenty of room.' },
    ],
  },

  {
    id:    'travel',
    label: 'Travel',
    blurb: 'Trip vlogs, destination guides, gear reviews, and budget-travel channels for every type of traveller.',
    seoTitle:       'Top 50 Travel YouTube Channels 2026: Destinations, Vlogs, Guides',
    seoDescription: "The top 50 travel YouTube channels, ranked by live subscriber count from YouTube's API. Destination guides, trip vlogs, budget travel.",
    intro: [
      "Travel on YouTube splits into two formats. Destination videos (city guides, country overviews, hotel reviews) earn through search: viewers planning a trip find the video and watch through. Trip vlogs earn through follow: viewers keep up with a creator across countries and cultures.",
      "The destination format has long lifetimes per video (a Tokyo guide from 2019 still earns in 2026), but takes substantial production effort. The vlog format earns faster but burns out the creator. Top travel channels usually run both formats in parallel, plus occasional gear reviews and budget-tip content for SEO.",
    ],
    highlights: [
      'Long-tail SEO is enormous: destination guide videos can earn for 5+ years.',
      'Tourism-board and hotel sponsorships are the dominant revenue line for top channels.',
      'Production realities: shooting while travelling means light gear, fast edits, and accepting some quality compromises.',
    ],
    faqs: [
      { q: 'How do travel YouTubers afford to travel constantly?',
        a: 'Income usually catches up before the bills do, but in different proportions. Tourism boards and hotels often comp travel for established channels in exchange for coverage. Brand sponsorships from luggage, camera, credit-card and travel-app companies fund flights and gear. AdSense from long-tail destination videos covers ongoing costs. New travel YouTubers typically self-fund their first 12–18 months of trips before brand revenue starts to cover travel.' },
      { q: 'Should new travel channels focus on destinations or vlogs?',
        a: 'Destination videos for SEO and long-tail income; vlogs for audience-building. Most successful travel channels run both, weighted heavier towards destination content in the first 18 months (when audience is small and SEO is the main growth lever) and shifting towards vlog content as the audience grows large enough that follower-driven views start to dominate.' },
      { q: 'Do tourism boards actually pay travel creators?',
        a: 'Yes, but usually not until you have meaningful audience size (50K+ subs typically). Compensation can include flights, hotels, comped activities, and a flat fee for each video. Smaller channels can often negotiate trip-comping in exchange for coverage even before tourism boards start paying cash. The trade-off: sponsored content has to be disclosed, which can affect viewer trust if not handled well.' },
      { q: 'What gear do travel YouTubers actually carry?',
        a: 'Modern travel YouTubers typically carry a mirrorless camera (Sony A7 series, Canon R6 are the most common), a small gimbal or stabilizer, a wireless mic kit, and increasingly a recent flagship phone (used for B-roll and quick shots). The trend over the past 3 years has been towards lighter kits with more reliance on phones, because the quality gap has narrowed and the logistics gap has not.' },
      { q: 'Is travel YouTube saturated?',
        a: "It depends on the angle. Generic 'top 10 things to do in Paris' content is saturated. Niche angles (slow travel, train travel, micro-budget travel, accessible travel, family travel, culinary travel, off-season travel) still have plenty of room. Country-specific travel channels for under-covered destinations are particularly open." },
    ],
  },

  {
    id:    'comedy',
    label: 'Comedy',
    blurb: 'Sketches, parodies, stand-up, and reaction comedy. High velocity, high subscriber retention.',
    seoTitle:       'Top 50 Comedy YouTube Channels 2026: Sketches, Parodies, Reactions',
    seoDescription: "The top 50 comedy YouTube channels, ranked by live subscriber count from YouTube's API. Sketches, parodies, stand-up, reaction comedy.",
    intro: [
      "Comedy on YouTube ranges from high-production sketch teams (Smosh, Try Guys, Rhett & Link) to single-creator parody and impressions channels to reaction-and-commentary channels. The category retains audiences extraordinarily well, once viewers find a creator they think is funny, they follow that creator across years and platforms.",
      "What does not work as well in 2026: pure prank content (platform crackdowns and audience fatigue), low-effort meme reactions, and overly long sketch episodes. What does work: tightly-edited sketches under 8 minutes, character-based recurring formats, and original short-form comedy that translates between YouTube proper and Shorts.",
    ],
    highlights: [
      'Strong subscriber retention: comedy audiences stay subscribed for years.',
      'Sub-format diversity: sketch teams, single-creator characters, parody channels, reaction comedy.',
      'Mid-tier RPM but high engagement: brand deals from snack, beverage, and entertainment categories dominate revenue.',
    ],
    faqs: [
      { q: "What's the typical RPM for a comedy YouTube channel?",
        a: 'Comedy sits in the mid-range, $2–$5 per 1,000 views. Below tech and finance, above pure entertainment. Sponsorships from snack brands, beverages, gaming companies, dating apps, and streaming services usually dwarf AdSense for established channels.' },
      { q: 'Do comedy channels need writers and producers?',
        a: 'For sketch teams operating at the top tier (multi-person ensemble, weekly upload schedule), yes. For single-creator comedy (impressions, character work, parody, reactions), most run solo or with a single editor. The cost-benefit depends on cadence: high-frequency uploads (daily, multi-weekly) usually require team support. Lower-frequency, higher-production uploads can stay solo.' },
      { q: 'How long should comedy videos be?',
        a: 'For sketches: 4–8 minutes is the sweet spot. Longer than 10 minutes and the joke density drops below where the audience expects. For commentary and reaction comedy: 12–20 minutes works well because the format supports longer arcs. For Shorts: 30–60 seconds with a clear payoff structure (setup, escalation, button).' },
      { q: 'Is prank content still viable on YouTube?',
        a: 'Mostly no, in its 2014–2018 form. Platform policies tightened around prank content that involves bystanders, public spaces, or anything that could be perceived as harmful or distressing. Scripted sketch comedy and consensual prank-among-friends content is fine. Cold-prank-on-strangers content is a takedown risk and not recommended.' },
      { q: 'Can solo comedy creators compete with team-based sketch channels?',
        a: 'Yes, on a different format. Solo creators tend to win on character work, parody, impressions, and topical commentary, where one performer can carry the upload. Teams tend to win on sketch comedy with multiple speaking parts and high-production set pieces. Pick the format that matches the resources you actually have.' },
    ],
  },

  {
    id:    'sports',
    label: 'Sports',
    blurb: 'Highlights, analysis, athlete channels, and league-owned channels that pull seven-figure views per upload.',
    seoTitle:       'Top 50 Sports YouTube Channels 2026: Highlights, Analysis, Athletes',
    seoDescription: "The top 50 sports YouTube channels, ranked by live subscriber count from YouTube's API. Highlights, analysis, athlete and league channels.",
    intro: [
      "Sports on YouTube is dominated by two types of channels. League-owned and team-owned channels (NBA, NFL clubs, Premier League clubs) post highlights, behind-the-scenes content, and full-game replays. Independent creator channels handle analysis, commentary, history deep-dives, and athlete-following content.",
      "The independent lane has produced some of the fastest-growing channels of the past 5 years, because the audience for sports is gigantic and the official channels are often slow, formulaic, or constrained by league media rules. Channels that move quickly with sharper editorial angles routinely outperform official accounts in engagement per upload.",
    ],
    highlights: [
      'Massive total audience but copyright-constrained: original commentary outperforms reposts.',
      'Live content is risky to host on YouTube but archived analysis and history compound for years.',
      'Athletes building personal channels often grow faster than the leagues that employ them.',
    ],
    faqs: [
      { q: 'Can I use clips from professional sports games on my YouTube channel?',
        a: "Carefully. Most leagues (NBA, NFL, Premier League, F1) actively claim copyrighted footage through Content ID, and their tolerance for clip usage varies year to year. The safe approach: use short clips with substantial original commentary and analysis on top so your videos qualify for fair use, accept that some uploads will be claimed and revenue will go to the league rather than you, and focus your channel's identity on the analysis rather than the clips themselves." },
      { q: 'How much do sports YouTube channels make?',
        a: "Sports has mid-tier RPMs ($2–$6 per 1,000 views in the US), so the largest channels making seven-figure views per upload are earning substantial AdSense plus often even more from sponsorships in betting, fantasy, gear, and apparel. Athlete-personal channels often earn more than league analysis channels because they can layer brand partnerships from sports apparel, supplements, and lifestyle brands on top of the platform's ad revenue." },
      { q: 'Is starting a sports analysis channel viable for new creators?',
        a: 'Yes, especially for sports that are not over-covered by major media. Football, basketball, F1, and soccer have heavy coverage. Niches in those sports (lower-league football, women\'s basketball, junior racing series, regional leagues) have less coverage. Sports outside the major five (cricket, rugby, hockey, baseball, MMA, esports) all have growing English-language audiences and less mature creator landscapes.' },
      { q: 'Should sports YouTubers go live during games?',
        a: "Live commentary during games is platform-risky because of broadcast-rights protections. Post-game analysis videos uploaded within 24 hours of the event capture most of the same audience interest with much less rights exposure. Live content works better for creator-led commentary on news, transfers, drafts, and off-season events where there's no live broadcast to compete with." },
      { q: 'Can athletes build YouTube channels around their own training and lifestyle?',
        a: "Yes, and many of the fastest-growing sports channels of the past 3 years have been athlete-led. Training breakdowns, behind-the-scenes content, technique deep-dives, and athlete vlogs all perform well, especially for athletes whose sports don't get heavy mainstream media coverage. The cross-promotion from existing fans on Instagram or TikTok accelerates these channels' early growth." },
    ],
  },

  {
    id:    'entertainment',
    label: 'Entertainment',
    blurb: 'Pop culture, TV, film, celebrity, and reaction channels. Where YouTube and traditional media collide.',
    seoTitle:       'Top 50 Entertainment YouTube Channels 2026: Pop Culture, TV, Film',
    seoDescription: "The top 50 entertainment YouTube channels, ranked by live subscriber count from YouTube's API. Pop culture, TV, film, reactions.",
    intro: [
      "Entertainment is YouTube's broadest and busiest category. It includes TV-show recaps, film analysis, celebrity news, reaction channels, late-night-style commentary, pop-culture deep-dives, and the long tail of clip-aggregation channels that chop and re-edit other media.",
      "The category is highly competitive: established media companies and traditional TV networks all run YouTube channels here, and individual creators have to find specific angles that those institutions can't or don't cover. The independent channels that do well usually combine fast turnaround on news with editorial taste, a perspective viewers can't get from the official sources.",
    ],
    highlights: [
      'Highest competition density on the platform: media companies and creators fight for the same topics.',
      'RPMs are mid-low because much of the audience is mobile and ad-blocked.',
      'Niche angles (genre-specific film analysis, era-specific TV recaps) outperform generic celebrity-news content.',
    ],
    faqs: [
      { q: "What's the typical RPM for an entertainment YouTube channel?",
        a: 'Entertainment is one of the lower-RPM major categories, usually $1.50–$4 per 1,000 views. The audience skews younger, more mobile, more ad-blocked, and the topics map to less premium ad inventory than tech or finance. Volume compensates for some channels: a celebrity-news channel pulling 50M monthly views can still earn substantial income, just not at the per-view rate of niche financial-analysis channels.' },
      { q: 'How do entertainment channels handle copyright on TV and film clips?',
        a: 'Same playbook as sports: short clips, substantial original commentary, accept that some uploads will be claimed by the rights holder. Reaction channels and analysis channels operate in a more established fair-use lane than pure clip-reupload channels, which routinely get shut down. Most established entertainment channels work within Content ID claims as a fact of life rather than fighting them.' },
      { q: 'Is celebrity-news content viable for new creators?',
        a: 'Hard. The category is dominated by established gossip outlets and clip-aggregation channels with years of platform credit. New entrants usually have to specialise (one specific celebrity, one specific cultural niche, one specific era) to break through. Generic celebrity-news channels tend to plateau in the long tail.' },
      { q: 'Are reaction channels still worth starting?',
        a: 'Yes, in specific niches. Generic music or trailer reactions are saturated. Specific reaction angles are not: film-school reactions to classic films, musician reactions to genres they have never heard, technique-specific reactions (editor reacts to the editing of X, designer reacts to the typography of X). Reactions paired with deep expertise in another field is a much wider lane than pure reaction channels.' },
      { q: 'How fast does new entertainment content need to ship after an event?',
        a: "Within 24 hours for breaking news, within 72 hours for most cultural events. Speed is the main competitive advantage independent entertainment creators have over traditional media outlets, which often take longer. Channels that consistently ship within 6–12 hours of major events tend to outperform slower channels with similar production quality, because YouTube's recommendation system favours fresh content on trending topics." },
    ],
  },

  {
    id:    'news',
    label: 'News & Politics',
    blurb: 'Daily news, talk shows, and political commentary. Some of the most-watched live streams on the platform.',
    seoTitle:       'Top 50 News YouTube Channels 2026: Politics, Daily News, Commentary',
    seoDescription: "The top 50 news and politics YouTube channels, ranked by live subscriber count from YouTube's API. Daily news, commentary, talk shows.",
    intro: [
      "News and politics on YouTube has become one of the most-watched categories, dominated by traditional news networks (CNN, Fox News, MSNBC, BBC) running parallel YouTube channels alongside their broadcast operations, and by independent commentary channels that have built audiences larger than many cable shows.",
      "The independent commentary lane has been one of YouTube's biggest growth stories of the past 5 years. Channels that combine clear editorial perspective with fast turnaround and live-streaming during major events routinely match or exceed the viewership of established cable news on the same topics.",
    ],
    highlights: [
      'Live streaming during major events drives the largest spikes in viewership and subscribers.',
      'RPM is volatile: news and politics often trigger advertiser-friendliness flags that limit monetization.',
      'Trust and consistency over years matters more than virality for the most successful channels.',
    ],
    faqs: [
      { q: 'Can a YouTube news channel be a primary career for a creator?',
        a: 'Yes, and many independent news and commentary creators have built audiences of millions and revenue lines that exceed traditional cable salaries. The challenge is monetization volatility: news topics frequently trigger YouTube\'s advertiser-friendly flags, which can demonetize individual videos or entire channels. Creators usually mitigate this with Patreon-style direct fan support and merch alongside ad revenue.' },
      { q: 'Why do news YouTube channels get demonetized so often?',
        a: 'YouTube\'s advertiser-friendliness rules limit ads on content involving conflict, tragedy, breaking news, controversial topics, and graphic events. News content frequently overlaps with these categories. The channels that handle this best build alternative revenue lines (membership, Patreon, merch, sponsorships from political-and-policy-friendly advertisers) so they aren\'t entirely dependent on AdSense.' },
      { q: 'How important is live streaming for a news channel?',
        a: 'Critically important during major events (elections, breaking news, debates). Live streams can pull viewership that exceeds the channel\'s normal video views by 10–50x. After the event, the live stream archives also continue to earn watch-time on the platform. Most independent news channels run regular live streams (daily, weekly, or event-driven) as a core part of their format.' },
      { q: 'Can a new political commentary channel break in against established voices?',
        a: 'Yes, but the bar is high. The most successful new political channels of the past 3 years have all combined a specific editorial niche (a specific ideology, a specific issue area, a specific country focus) with fast event-driven uploads and high production discipline. Generic centrist commentary tends to plateau because the audience for it is small and the algorithm rarely surfaces it.' },
      { q: 'Are news YouTube channels regulated like traditional broadcasters?',
        a: 'Generally less so, depending on country. In the US, YouTube channels are not subject to FCC broadcast rules. In some EU countries, large YouTube creators may fall under media-regulation thresholds once they cross a certain audience size. Defamation, hate-speech, and election-misinformation laws apply to YouTube creators in most countries, though enforcement is uneven.' },
    ],
  },
]

export const CATEGORY_LOOKUP = Object.fromEntries(CATEGORY_META.map(c => [c.id, c]))

export function getCategory(slug) {
  return CATEGORY_LOOKUP[slug] || null
}

/* Just the slugs, used by the prerender pipeline + sitemap generation. */
export const CATEGORY_SLUGS = CATEGORY_META.map(c => c.id)
