// Metrobank: the promo page is a Next.js app that embeds every promo as JSON in <script id="__NEXT_DATA__">,
// with start/end dates, categories and the eligible cards. Keep promos with at least one credit card.
import { clean } from "../lib.mjs";
export const bank = "Metrobank";
export const listUrls = ["https://www.metrobank.com.ph/promos"];
const CATS = { Dining: "Dining", Travel: "Travel", Shopping: "Shopping", Online: "Online" };
export function parse(html) {
  const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!m) return [];
  const recs = new Map();
  (function walk(o) {
    if (Array.isArray(o)) return o.forEach(walk);
    if (!o || typeof o != "object") return;
    if (o.__typename == "PromosDetailsPageV2Record" && o.slug) recs.set(o.id, o);
    Object.values(o).forEach(walk);
  })(JSON.parse(m[1]));
  return [...recs.values()]
    .filter(r => (r.cards || []).some(c => c.__typename == "PromoCreditCardRecord"))
    .map(r => {
      const cat = (r.categories || []).map(c => CATS[c.category]).find(Boolean);
      const slug = r.slug.replace(/^\/(promos\/)?/, "");
      return { id: "mb-" + slug, bank, title: clean(r.title || r.pageName || slug),
        url: "https://www.metrobank.com.ph/promos/" + slug,
        validUntil: r.expirationDate ? r.expirationDate.slice(0, 10) : null, cards: "credit",
        cardNames: [...new Set(r.cards.filter(c => c.__typename == "PromoCreditCardRecord").map(c => c.title))],
        ...(cat && { category: cat }) };
    });
}
