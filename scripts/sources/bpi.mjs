// BPI: server-rendered list of cards (class "article-page-cont"). Each card has a tag line
// ("Credit cards + Debit cards", "Digital + ...", "Loans"), "Valid until <date>", a title and a "View details" link.
import { cards, link, pick, lastDate, clean } from "../lib.mjs";
export const bank = "BPI";
export const listUrls = ["https://www.bpi.com.ph/personal/rewards-and-promotions/promos.html"];
export function parse(html, pageUrl = listUrls[0]) {
  const out = [];
  for (const c of cards(html, /<div class="article-page-cont/)) {
    const l = link(c, /\/rewards-and-promotions\/promos\/([a-z0-9-]+)$/i, pageUrl);
    const tags = pick(c, /<p class="tab-name-cont">([\s\S]*?)<\/p>/);
    if (!l || !/credit cards?/i.test(tags)) continue;   // credit card promos only
    const title = pick(c, /<p class="tab-head-cont">([\s\S]*?)<\/p>/) || (c.match(/data-og-title="([^"]+)"/) || [])[1] || l.slug;
    out.push({ id: "bpi-" + l.slug, bank, title: clean(title), url: l.url,
      validUntil: lastDate(pick(c, /<p class="tab-date-cont">([\s\S]*?)<\/p>/)),
      cards: /debit/i.test(tags) ? "credit+debit" : "credit" });
  }
  return out;
}
