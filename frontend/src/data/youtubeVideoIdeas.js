/* Single source of truth for the /youtube-video-ideas/:niche pages.

   Keyword-validated 2026-08-13 from a real Google Keyword Planner pull on the
   seed "youtube video ideas" (2,232 rows, keyword-exports/Keyword Stats
   2026-08-13 at 00_05_13.csv). Only niches with genuine CREATOR intent and
   enough collective long-tail volume are here. The per-niche demand sits in
   the 50/mo long tail, not head terms, which is exactly the ground the DR-90
   generic idea-listicles do not cover with a dedicated page.

   Niches deliberately EXCLUDED, with the reason, so they don't get re-added:
   - vlogs (8,250/mo, the biggest): already covered by the live blog post
     /blog/youtube-vlog-ideas (published 2026-08-08). A page here would
     cannibalize it. Same trap logged in FOUNDATION.md for "youtube video
     ideas for beginners".
   - diy / crafts (4,200/mo): WATCH intent, not creator intent. Its three
     500/mo terms are "youtube diy crafts", "diy five minute crafts",
     "you tube arts and crafts", people looking for craft videos to watch.
     Same failure mode logged for youtube playlist / merch / live stream.
   - beauty (450), fashion (450), fitness (350), education (350), sports (200),
     car (200), travel (150), pets (150): too thin to carry a page.

   Slugs match the CATEGORY_META ids in youtubeStatsCategories.js and the
   NICHES keys in youtubeEarnings.js so the three surfaces cross-link cleanly.
   Zero YouTube quota (static data). */

export const IDEA_NICHES = [
  { key: 'gaming',  label: 'Gaming',          demand: 2850 },
  { key: 'comedy',  label: 'Comedy',          demand: 1650 },
  { key: 'cooking', label: 'Cooking & Food',  demand: 1550 },
  { key: 'tech',    label: 'Tech & Reviews',  demand: 1300 },
  { key: 'music',   label: 'Music',           demand: 950  },
]

export const IDEA_NICHE_LOOKUP = Object.fromEntries(IDEA_NICHES.map(n => [n.key, n]))

/* Each idea carries a format tag so the page can group them, plus the reason
   it works. The reason is the whole point: a bare list of 20 titles is the
   thin content every competitor already publishes. */
export const IDEA_META = {
  gaming: {
    intro: [
      "Gaming is the most crowded category on YouTube, which means the idea matters more here than in any other niche. A generic playthrough of a game a thousand channels are covering competes on production quality and personality alone, and a new channel loses that fight every time.",
      "What works instead is an angle the search results do not already have: a specific question about a specific game, a format the big channels are too large to bother with, or a take that only makes sense coming from someone at your size. The ideas below are grouped by that logic, not by game.",
    ],
    whyHeading: 'Why most gaming video ideas fail',
    why: [
      "The obvious idea is already saturated. \"[Popular game] gameplay\" is covered by channels with a decade of head start and full-time editors, so competing on the same idea means competing on the one axis where you are weakest.",
      "Search-driven gaming content is the opening most new channels miss. Players search for specific problems (a boss they cannot beat, a build that stopped working, a setting that tanks their frame rate) and those searches are answered badly or not at all, because big channels chase broad entertainment views instead.",
      "Format beats game selection. A channel known for one repeatable format (a ranking series, a challenge run, a myth-testing series) accumulates returning viewers, while a channel that jumps between whatever is trending has to re-earn its audience every upload.",
    ],
    ideas: [
      { format: 'Search-driven', title: 'The specific-boss guide', detail: 'Pick the boss or level players genuinely get stuck on and make the definitive guide for it. Search volume for a single hard boss in a popular game can outlast the game\'s launch hype by years, and the searcher has a problem they need solved right now.' },
      { format: 'Search-driven', title: 'Settings and performance fixes', detail: 'Best settings for a specific GPU, how to fix stuttering in a named game, how to raise frame rate on older hardware. These pull steady search traffic and almost no large gaming channel bothers to make them.' },
      { format: 'Search-driven', title: 'Is it worth buying in 2026?', detail: 'Players search this before every purchase, especially for older games with a sale price and an uncertain player count. Answer honestly, including when the answer is no, and the video keeps earning as the game ages.' },
      { format: 'Search-driven', title: 'The build or loadout that still works', detail: 'Metas shift with every patch, and guides go stale fast. A dated, patch-specific build guide beats an evergreen one because the searcher is explicitly checking whether their information is current.' },
      { format: 'Challenge run', title: 'The self-imposed restriction run', detail: 'Beating a game without a core mechanic (no healing, no upgrades, lowest level) turns familiar content into something with visible stakes. The restriction does the entertainment work, so you do not need a large personality to carry it.' },
      { format: 'Challenge run', title: 'The randomizer', detail: 'Randomizing item or enemy placement makes a game every viewer knows feel unpredictable again, and generates genuine reactions you cannot script. Works especially well for games with a nostalgic audience.' },
      { format: 'Challenge run', title: 'Speedrun learning series', detail: 'Not a world-record attempt, but the process of learning to run a game: the first attempt, the wall, the improvement. The arc is the content, and it gives an ongoing reason to return.' },
      { format: 'Ranking', title: 'Ranking every entry in a series', detail: 'A repeatable, argument-generating format that reliably pulls comments, and comments feed distribution. Works for games, weapons, levels, characters, or updates.' },
      { format: 'Ranking', title: 'The tier list with reasoning', detail: 'Tier lists are everywhere, so the differentiator is showing the reasoning rather than the placements. A tier list that explains why the consensus pick is wrong gets shared into the arguments already happening.' },
      { format: 'Testing', title: 'Testing a community myth', detail: 'Every game has claims players repeat without evidence. Testing one properly, with the method shown, produces a genuinely original video in a category where almost nothing is original.' },
      { format: 'Testing', title: 'The hardware comparison', detail: 'Running the same game across two setups, settings tiers, or platforms answers a purchase question a lot of players have, and pairs naturally with the settings-fix content above.' },
      { format: 'Testing', title: 'How long does it really take?', detail: 'Timing an actual completion against the advertised or crowd-sourced figure gives a concrete, citable answer that other creators and forums link back to.' },
      { format: 'Commentary', title: 'Why this game failed', detail: 'Post-mortems on a game that underperformed pull viewers well beyond that game\'s own player base, because the story travels further than the gameplay ever did.' },
      { format: 'Commentary', title: 'The update breakdown', detail: 'Fast, clear coverage of a patch or announcement, published quickly. Timeliness is the entire advantage here, so this rewards small channels that can turn around a video in hours.' },
      { format: 'Commentary', title: 'Revisiting a game years later', detail: 'Returning to a game after its community, patches, or reputation have changed gives a natural hook and an audience that already searches for exactly this.' },
      { format: 'Beginner', title: 'The first-hour guide', detail: 'What a new player should do first, what to avoid, and the mistakes that cost time later. New players arrive continuously, so this earns for as long as the game has a playerbase.' },
      { format: 'Beginner', title: 'Everything the tutorial does not tell you', detail: 'Games teach their basics badly. Collecting the unstated mechanics into one video answers a frustration players feel but rarely search for directly, so it spreads through recommendation more than search.' },
      { format: 'Beginner', title: 'Which version should you buy?', detail: 'Editions, platforms, and bundles confuse buyers, and the official pages do not compare them honestly. A clear answer captures high-intent traffic right before a purchase.' },
    ],
    faqs: [
      { q: 'What kind of gaming videos get the most views?',
        a: 'Broad entertainment content (reactions, funny moments, big-game playthroughs) has the highest ceiling but the most competition, and it is largely won by established channels with production budgets. Search-driven content (guides, fixes, comparisons, is-it-worth-it videos) has a lower ceiling per video but is far more reachable for a new channel, because you are competing on how well you answer a specific question rather than on personality and edit quality.' },
      { q: 'How do I come up with gaming video ideas when everything is taken?',
        a: 'Stop starting from the game and start from the player\'s problem. Search the game name plus words like "how to", "best", "fix", "worth it", or "stuck" and read what comes back, including the questions with weak or outdated answers. Reddit and Steam discussions for a game are full of specific frustrations that have no video answering them. That gap is your idea, and it comes with the search demand already attached.' },
      { q: 'Should I focus on one game or cover many?',
        a: 'One game builds a returning audience faster because viewers subscribe for a specific thing and YouTube learns exactly who to show you to. The risk is that your channel rises and falls with that game\'s popularity. A common middle path is anchoring on one game for the majority of uploads while establishing a repeatable format that can survive a move to another game, so the format keeps the audience when the game fades.' },
      { q: 'Do I need expensive equipment for a gaming channel?',
        a: 'Not to start. Modern consoles and PCs capture footage natively, and a clear microphone matters far more than a camera or a capture card, because gaming audiences listen more than they watch. Commentary quality, editing pace, and idea selection all outrank hardware. Upgrade when a specific limitation is visibly costing you, not before.' },
      { q: 'How long should gaming videos be?',
        a: 'It depends on the format, not on a universal rule. Search-driven guides should be as short as the answer allows, since the viewer wants a solution and rewards you for delivering it fast. Challenge runs, rankings, and commentary reward length, because the audience arrived to watch rather than to solve something, and longer watch time on those formats feeds distribution. Match the length to why the viewer clicked.' },
      { q: 'Is gaming still a good niche to start in 2026?',
        a: 'It is viable but it is the hardest category to break into on general content, and the ad rate is among the lowest on the platform (roughly $2 to $6 RPM for a tier-1 audience). What makes it work is that the audience is enormous and highly engaged, and sponsorship money in gaming (peripherals, energy drinks, game launches) is well above what the ad rate suggests. Going in with a specific angle rather than general gameplay is close to mandatory now.' },
      { q: 'How often should a gaming channel upload?',
        a: 'Consistency matters more than raw frequency, but gaming rewards volume more than most niches because so much of the content is timely. If you are covering updates and news, speed is the advantage and a slower schedule wastes it. If you are making guides and evergreen content, a steady weekly or twice-weekly cadence you can sustain beats an aggressive schedule that collapses after a month.' },
      { q: 'What gaming content works best for a brand new channel?',
        a: 'Specific, searchable, and unglamorous. The definitive guide to a hard boss, a settings fix for a common hardware problem, or an honest is-it-worth-it on an older game will all outperform a general playthrough from a channel nobody knows yet. These videos bring in viewers who have a problem, and a viewer with a problem does not care how big your channel is, only whether you solved it.' },
    ],
  },
}
