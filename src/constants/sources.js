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

function buildHarvestPrompt(date, source, context) {
  return `You are extracting raw pain points for a micro-SaaS idea hunt from search results.
Date: ${date}
Source: ${source}

Search results:
${context}

For every distinct pain point in the above results, extract:
pain, who, source_platform, source_link, current_workaround, est_reach.

Return ONLY a JSON object in this exact shape, no preamble, no markdown fences:
{"ideas": [{"date":"${date}","pain":"","who":"","source_platform":"${source}","source_link":"","current_workaround":"","est_reach":""}]}

If nothing relevant is in the results, return {"ideas": []}.`;
}

module.exports = { ALL_SOURCES, buildHarvestPrompt };