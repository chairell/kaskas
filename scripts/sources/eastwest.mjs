// EastWest: server-rendered, paginated grid (?page=0, 1, ...), 9 cards a page (class "card promo-card").
// Each card has an h3 title, a date line ("June 1 to November 30, 2026") and category pills.
import { cards, link, pick, lastDate } from "../lib.mjs";
export const bank = "EastWest";
export const listUrls = Array.from({ length: 40 }, (_, i) => `https://www.eastwestbanker.com/promos?page=${i}`);
export const stopWhenNoNew = true;   // stop paging once a page adds nothing new
const PILLS = { dining: "Dining", travel: "Travel", shopping: "Shopping", online: "Online", groceries: "Groceries", fuel: "Fuel" };
export function parse(html, pageUrl = listUrls[0]) {
  const out = [];
  for (const c of cards(html, /<div class="card promo-card"/)) {
    const l = link(c, /^\/promos\/([a-z0-9-]+)$/i, pageUrl);
    const pills = [...c.matchAll(/pill-category pill-([a-z-]+)/g)].map(m => m[1]);
    if (!l || !pills.includes("credit-cards")) continue;
    const cat = pills.map(p => PILLS[p]).find(Boolean);
    out.push({ id: "ew-" + l.slug, bank, title: pick(c, /<h3[^>]*>([\s\S]*?)<\/h3>/) || l.slug, url: l.url,
      validUntil: lastDate(pick(c, /<\/h3>[\s\S]*?<p>([\s\S]*?)<\/p>/)),
      cards: pills.includes("debit-cards") ? "credit+debit" : "credit", ...(cat && { category: cat }) });
  }
  return out;
}
