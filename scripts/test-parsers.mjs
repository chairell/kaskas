// Parser tests against saved sample markup. Run: node scripts/test-parsers.mjs
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import * as bpi from "./sources/bpi.mjs";
import { categorize, parseDate } from "./lib.mjs";

assert.equal(parseDate("Nov 30, 2026"), "2026-11-30");
assert.equal(parseDate("September 5 2027"), "2027-09-05");
assert.equal(parseDate("Sept. 5, 2027"), "2027-09-05");

const html = await readFile(new URL("./fixtures/bpi-promos.html", import.meta.url), "utf8");
const p = bpi.parse(html);
const by = Object.fromEntries(p.map(x => [x.id, x]));
assert.equal(p.length, 4, "4 credit promos (debit-only one skipped, duplicate link merged)");
assert.deepEqual(by["bpi-lazada-payday-sale-promo"], {
  id: "bpi-lazada-payday-sale-promo", bank: "BPI", title: "Lazada: Payday Sale Promo",
  url: "https://www.bpi.com.ph/personal/rewards-and-promotions/promos/lazada-payday-sale-promo",
  validUntil: "2026-11-30", cards: "credit"
});
assert.equal(by["bpi-leblanc-hotel-and-resort-promo"].cards, "credit+debit");
assert.equal(by["bpi-leblanc-hotel-and-resort-promo"].title, "LeBlanc Hotel and Resort Promo");
assert.equal(by["bpi-gap-promo"].title, "GAP Promo", "title from heading when link text is 'Learn more'");
assert.equal(by["bpi-new-year-travel-cashback"].validUntil, "2027-01-31");
assert.ok(!by["bpi-debit-only-promo"]);

assert.equal(categorize("Lazada: Payday Sale Promo"), "Online");
assert.equal(categorize("LeBlanc Hotel and Resort Promo"), "Travel");
assert.equal(categorize("GAP Promo"), "Shopping");
console.log("All parser tests passed.");
