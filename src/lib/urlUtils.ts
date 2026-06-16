// Extracts the first http(s) URL from a string. Ignores markdown image URLs.
const URL_RE = /\bhttps?:\/\/[^\s<>()]+[^\s<>().,;:!?'"]/i;

export function extractFirstUrl(text: string): string | null {
  if (!text) return null;
  // Strip markdown images so we don't preview embedded image URLs
  const stripped = text.replace(/!\[[^\]]*\]\([^)]+\)/g, '');
  const m = stripped.match(URL_RE);
  return m ? m[0] : null;
}
