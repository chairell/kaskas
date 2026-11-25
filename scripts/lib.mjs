// Shared helpers for the promo scrapers.

const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12 };

// "Nov 30, 2026" / "November 30 2026" -> "2026-11-30"
export function parseDate(s) {
  const m = String(s).match(/([A-Za-z]+)\.?\s+(\d{1,2}),?\s+(\d{4})/);
  if (!m) return null;
  const mo = MONTHS[m[1].toLowerCase().slice(0, 4)] || MONTHS[m[1].toLowerCase().slice(0, 3)];
  if (!mo) return null;
  return `${m[3]}-${String(mo).padStart(2, "0")}-${String(m[2]).padStart(2, "0")}`;
}

export const stripTags = s => String(s).replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

export const decode = s => String(s).replace(/&amp;/g, "&").replace(/&#39;|&rsquo;|&apos;/g, "'").replace(/&quot;/g, '"')
  .replace(/&nbsp;/g, " ").replace(/&ndash;|&mdash;/g, "-").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

// Today in Manila as YYYY-MM-DD.
export const todayPH = () => new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10);

// Map a promo title to one of the app's categories (same list as cards.js CATS).
const CAT_WORDS = [
  ["Online", /lazada|shopee|zalora|tiktok|online|e-?commerce|cross-border|app store|google play|netflix|spotify/i],
  ["Travel", /hotel|resort|airline|air ?asia|cebu pacific|philippine airlines|\bpal\b|klook|agoda|booking\.com|travel|flight|trip|tour|cruise|staycation/i],
  ["Overseas", /overseas|abroad|foreign|japan|korea|singapore|hong kong|australia|europe|usa|international/i],
  ["Dining", /restaurant|dining|cafe|coffee|starbucks|food|grill|kitchen|bistro|bar\b|buffet|pizza|burger|ramen|bakery|grabfood|foodpanda/i],
  ["Groceries", /grocery|supermarket|landers|s&r|puregold|savemore|rustan|market/i],
  ["Drugstore", /drugstore|pharmacy|watsons|mercury|southstar/i],
  ["Fuel", /petron|shell|caltex|seaoil|fuel|gas station/i],
  ["Transport", /grab\b|angkas|joyride|autosweep|easytrip|rfid/i],
  ["Bills", /meralco|maynilad|manila water|globe|smart|pldt|converge|bills? ?pay|utility/i]
];
export function categorize(title) {
  for (const [cat, re] of CAT_WORDS) if (re.test(title)) return cat;
  return "Shopping";
}

// Latest full date in a block of text, e.g. "June 1 to November 30, 2026" -> "2026-11-30".
const DATE_RE = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sept?|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4}\b/gi;
export function lastDate(text) {
  const ds = (String(text).match(DATE_RE) || []).map(parseDate).filter(Boolean).sort();
  return ds.length ? ds[ds.length - 1] : null;
}

// Split a listing page into one chunk per promo card. `marker` matches the start of each card.
export function cards(html, marker) {
  const idx = [...html.matchAll(new RegExp(marker.source, marker.flags.replace("g", "") + "g"))].map(m => m.index);
  return idx.map((start, k) => html.slice(start, idx[k + 1] ?? start + 6000));
}

// First link in a chunk whose path matches `re` (group 1 = slug). Returns { url, slug, text } or null.
export function link(chunk, re, pageUrl) {
  for (const m of chunk.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    let u; try { u = new URL(decode(m[1]), pageUrl); } catch { continue; }
    const path = u.pathname.replace(/\.html$/, "").replace(/\/$/, "");
    const s = path.match(re);
    if (s && !u.search) return { url: u.origin + path, slug: s[1], text: clean(m[2]) };
  }
  return null;
}

// Text of the first element matching `re` (group 1), tags stripped.
export const pick = (chunk, re) => { const m = chunk.match(re); return m ? clean(m[1]) : ""; };
export const clean = s => decode(stripTags(s)).replace(/\u200b/g, "").replace(/\s+/g, " ").trim();
