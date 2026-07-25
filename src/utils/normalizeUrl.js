// Two source_links pointing at the same post can differ in ways that
// defeat a naive unique index: trailing slash, http vs https, or
// tracking params like ?utm_source=... tacked on by whatever surfaced
// the link. Normalizing before save closes that gap.
function normalizeUrl(rawUrl) {
  try {
    const url = new URL(rawUrl.trim());

    // Drop common tracking params.
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref', 'igshid'];
    trackingParams.forEach((p) => url.searchParams.delete(p));

    url.hostname = url.hostname.toLowerCase();
    url.pathname = url.pathname.replace(/\/+$/, '') || '/';

    return url.toString();
  } catch {
    // Not a parseable URL — return trimmed as-is rather than throwing,
    // validation on the schema will catch anything truly malformed.
    return rawUrl.trim();
  }
}

module.exports = normalizeUrl;