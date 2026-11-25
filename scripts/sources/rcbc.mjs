// RCBC: server-rendered list at rcbccredit.com/promos (class "promolistdv"). Cards show no end date,
// so a promo stays listed until it disappears from RCBC's page.
import { cards, link, pick, lastDate } from "../lib.mjs";
export const bank = "RCBC";
export const listUrls = ["https://rcbccredit.com/promos"];
export function parse(html, pageUrl = listUrls[0]) {
  const out = [];
  for (const c of cards(html, /<div class="promolistdv"/)) {
    const l = link(c, /^\/promos\/([A-Za-z0-9-]+)$/, pageUrl);
    if (!l || /^(all|visa|mastercard|jcb|unionpay)$/i.test(l.slug)) continue;
    const title = pick(c, /<div class="title">([\s\S]*?)<\/div>/) || l.slug;
    out.push({ id: "rcbc-" + l.slug.toLowerCase(), bank, title, url: l.url,
      validUntil: lastDate(pick(c, /<div class="desc">([\s\S]*?)<\/div>/)), cards: "credit" });
  }
  return out;
}
