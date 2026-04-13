const DEFAULT_TIMEOUT_MS = 20000;

export async function fetchPolicyPage(source, options = {}) {
  const timeoutMs = Number.isFinite(options.timeoutMs) ? options.timeoutMs : DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(source.url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "PolicyRadarBot/1.0 (+https://github.com)"
      }
    });

    if (!response.ok) {
      throw new Error(`抓取失败 ${source.url}: HTTP ${response.status}`);
    }

    const html = await response.text();
    const text = extractText(html);
    return {
      title: extractTitle(html) || source.name,
      sourceName: source.name,
      sourceUrl: source.url,
      publishDate: new Date().toISOString().slice(0, 10),
      region: source.level,
      text,
      businessTags: source.tags || []
    };
  } finally {
    clearTimeout(timeout);
  }
}

export function extractTitle(html) {
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/is);
  if (!titleMatch) return "";
  return decodeHtml(titleMatch[1]).replace(/\s+/g, " ").trim();
}

export function extractText(html) {
  return decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  ).slice(0, 12000);
}

function decodeHtml(value) {
  return value
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'");
}
