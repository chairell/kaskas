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
