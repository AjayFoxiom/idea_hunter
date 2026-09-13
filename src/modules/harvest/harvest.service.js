const { OpenAI } = require('openai');
const axios = require('axios');
const { ALL_SOURCES, buildHarvestPrompt } = require('../../constants/sources');
const parseJsonSafe = require('../../utils/parseJsonSafe');
const logger = require('../../utils/logger');

const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

const MODEL_CHAIN = [
  'nvidia/nemotron-3-super-120b-a12b:free',
  'z-ai/glm-4.5-air:free',
  'google/gemma-4-26b-a4b-it:free',
];

// Reduced from 25s — models hanging beyond 15s always fall to the next in chain anyway.
const EXTRACT_TIMEOUT_MS = 15000;

async function tavilySearch(source) {
  const start = Date.now();
  try {
    const { data } = await axios.post('https://api.tavily.com/search', {
      api_key: process.env.TAVILY_API_KEY,
      query: `${source} pain point complaint "wish there was a tool" OR "any recommendations for"`,
      max_results: 5,
    });
    logger.info({ source, ms: Date.now() - start, count: data.results?.length || 0 }, 'Tavily search done');
    return { source, results: data.results || [] };
  } catch (err) {
    logger.error({ source, ms: Date.now() - start, err: err.message }, 'Tavily search failed');
    return { source, results: [] };
  }
}

function extractIdeasArray(parsed) {
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed?.ideas)) return parsed.ideas;
  return [];
}

async function extractWithFallback(date, source, results) {
  const context = results
    .map(r => `Title: ${r.title}\nURL: ${r.url}\nContent: ${(r.content || '').slice(0, 600)}`)
    .join('\n\n');
  const prompt = buildHarvestPrompt(date, source, context);

  for (const model of MODEL_CHAIN) {
    const start = Date.now();
    try {
      const response = await openrouter.chat.completions.create(
        {
          model,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
        },
        { timeout: EXTRACT_TIMEOUT_MS }
      );

      const raw = response.choices[0].message.content.trim();

      // TEMP DEBUG — remove once we confirm the response shape
      logger.info({ source, model, raw: raw.slice(0, 300) }, 'Raw model output');

      const parsed = parseJsonSafe(raw);
      const ideas = extractIdeasArray(parsed);

      logger.info({ source, model, ms: Date.now() - start, extracted: ideas.length }, 'Extraction call done');
      return ideas;
    } catch (err) {
      logger.warn({ source, model, ms: Date.now() - start, err: err.message }, 'Model failed, trying next in chain');
    }
  }

  logger.error({ source }, 'All models in fallback chain failed — skipping source');
  return [];
}

// Pipeline: each source chains search → extract as one promise.
// All 9 run fully in parallel — no two-phase barrier waiting for all searches
// before any extraction can start, and no artificial concurrency cap on I/O-bound calls.
async function harvestSource(date, source) {
  const { results } = await tavilySearch(source);
  if (!results.length) return [];
  return extractWithFallback(date, source, results);
}

async function harvestIdeas(date) {
  const harvestStart = Date.now();

  const extractions = await Promise.all(
    ALL_SOURCES.map(source => harvestSource(date, source))
  );

  const allCandidates = extractions.flat().filter(Boolean);

  logger.info({ ms: Date.now() - harvestStart, total: allCandidates.length }, 'Harvest complete');
  return allCandidates;
}

module.exports = { harvestIdeas };