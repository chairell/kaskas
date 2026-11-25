// BPI promo listing parser.
// The listing page renders each promo as a link to /rewards-and-promotions/promos/<slug>
// followed by a "Valid until <date>" line and an eligibility label ("Credit cards", "Credit + Debit", "Debit cards").
import { parseDate, stripTags, decode } from "../lib.mjs";

export const bank = "BPI";
export const listUrls = [
  "https://www.bpi.com.ph/personal/rewards-and-promotions/promos.html",
  "https://www.bpi.com.ph/creditcards/promos"
];
const BASE = "https://www.bpi.com.ph/personal/rewards-and-promotions/promos/";

export function parse(html) {
  const out = new Map();
  const re = /<a\b[^>]*href="([^"]*\/rewards-and-promotions\/promos\/([a-z0-9-]+)(?:\.html)?)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    const slug = m[2];
    if (out.has(slug)) continue;
    // Look at the text around the link for the title, date and eligibility.
    const after = html.slice(m.index, m.index + 2500);
    const nextLink = after.slice(1).search(/<a\b[^>]*href="[^"]*\/rewards-and-promotions\/promos\/[a-z0-9-]+/i);
    const block = stripTags(nextLink > 0 ? after.slice(0, nextLink + 1) : after);
    const valid = block.match(/valid\s+(?:until|till|through)\s*:?\s*([A-Za-z]{3,9}\.?\s+\d{1,2},?\s+\d{4})/i);
    let title = decode(stripTags(m[3])).trim();
    if (!title || /^(learn more|see details|view|more)$/i.test(title)) {
      // Heading just before the link (same card), else the next heading after it, else the slug.
      const before = [...html.slice(Math.max(0, m.index - 600), m.index).matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi)].pop();
      const h = before || after.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i);
      title = h ? decode(stripTags(h[1])).trim() : slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    }
    const elig = /credit\s*\+\s*debit/i.test(block) ? "credit+debit" : /debit cards?/i.test(block) && !/credit/i.test(block) ? "debit" : "credit";
    if (elig == "debit") continue;   // Kaskas! is about credit cards
    out.set(slug, {
      id: "bpi-" + slug, bank, title,
      url: BASE + slug,
      validUntil: valid ? parseDate(valid[1]) : null,
      cards: elig
    });
  }
  return [...out.values()];
}
