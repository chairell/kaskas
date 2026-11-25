// Maya: server-rendered featured deals (class "featured_deals_card") covering the whole Maya app.
// Keep the ones tagged "Maya Credit Card" or about the Landers credit card.
import { cards, link, pick, lastDate } from "../lib.mjs";
export const bank = "Maya";
export const listUrls = ["https://www.maya.ph/deals"];
export function parse(html, pageUrl = listUrls[0]) {
  const out = [];
  for (const c of cards(html, /<div class="[^"]*featured_deals_card/)) {
    const l = link(c, /^\/deals\/([a-z0-9.-]+)$/i, pageUrl);
    const title = pick(c, /<p class="[^"]*text_size_20[^"]*">([\s\S]*?)<\/p>/);
    const tags = [...c.matchAll(/<span class="tag[^"]*">([^<]+)<\/span>/g)].map(m => m[1].trim());
    if (!l || l.slug == "archive" || !(tags.includes("Maya Credit Card") || /credit card|landers|maya black/i.test(title))) continue;
    out.push({ id: "maya-" + l.slug, bank, title: title || l.slug, url: l.url,
      validUntil: lastDate(pick(c, /<small[^>]*>([\s\S]*?)<\/small>/)), cards: "credit" });
  }
  return out;
}
