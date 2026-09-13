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
  return `You are extracting pain points for a micro-SaaS idea hunt from search results.
Date: ${date}
Source: ${source}

Search results:
${context}

For every distinct pain point found, extract ALL of the following fields:

Raw sourcing fields:
- pain          : the core problem or complaint (string)
- who           : who experiences this pain (string)
- source_platform: always "${source}"
- source_link   : direct URL to the post/thread (string, or "" if unavailable)
- current_workaround: how people cope today (string, or "" if unknown)
- est_reach     : rough estimate of affected users (string, or "" if unknown)

Project-card fields (infer from context):
- title         : short, punchy product name / idea title (string, required)
- description   : 1-2 sentence product description solving the pain (string, required)
- category      : product category, e.g. "Productivity", "Dev Tools", "Finance", "Health", "Education", "Marketing", "HR", "E-commerce", "Analytics", "Other" (string)
- priority      : one of "Low" | "Medium" | "High"
- effort        : one of "Low" | "Medium" | "High"
- estimated_impact : one of "Low" | "Medium" | "High"
- revenue_potential: one of "Low" | "Medium" | "High"

Return ONLY a JSON object in this exact shape, no preamble, no markdown fences:
{"ideas": [{"date":"${date}","pain":"","who":"","source_platform":"${source}","source_link":"","current_workaround":"","est_reach":"","title":"","description":"","category":"","priority":"Medium","effort":"Medium","estimated_impact":"Medium","revenue_potential":"Medium"}]}

If nothing relevant is in the results, return {"ideas": []}.`;
}

module.exports = { ALL_SOURCES, buildHarvestPrompt };