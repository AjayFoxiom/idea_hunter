const ALL_SOURCES = [
  'reddit',
  'twitter',
  'linkedin',
  'facebook',
  'quora',
  'youtube',
  'g2',
  'hackernews',
  'indiehackers',
];

function buildHarvestPrompt(date) {
  return `You are helping harvest raw pain points for a micro-SaaS idea hunt.
Date: ${date}
Sources to check today: ${ALL_SOURCES.join(', ')}

For every distinct pain point you find (aim for 5-8 per source), extract:
pain, who, source_platform, source_link, current_workaround, est_reach.

Return ONLY a JSON array, no preamble, no markdown fences, in this shape:
[{"date":"${date}","pain":"","who":"","source_platform":"","source_link":"","current_workaround":"","est_reach":""}]

If you can't find anything relevant on a source today, omit it rather than inventing a filler entry.`;
}


module.exports = { ALL_SOURCES, buildHarvestPrompt };