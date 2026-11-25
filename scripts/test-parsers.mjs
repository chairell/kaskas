// Parser tests against trimmed copies of each bank's real promo page. Run: node scripts/test-parsers.mjs
// If a bank redesigns its page and the daily job starts failing, refresh its fixture with the
// "Snapshot promo pages" workflow (it pushes raw pages to the `snapshots` branch) and update the parser.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import * as bpi from "./sources/bpi.mjs";
import * as metrobank from "./sources/metrobank.mjs";
import * as rcbc from "./sources/rcbc.mjs";
import * as eastwest from "./sources/eastwest.mjs";
import * as maya from "./sources/maya.mjs";
import { categorize, parseDate, lastDate } from "./lib.mjs";

const load = f => readFile(new URL(`./fixtures/${f}-promos.html`, import.meta.url), "utf8");
const row = p => [p.id, p.title, p.validUntil, p.cards, p.category ?? null];

assert.equal(parseDate("Nov 30, 2026"), "2026-11-30");
assert.equal(parseDate("Sept. 5, 2027"), "2027-09-05");
assert.equal(lastDate("June 1 to November 30, 2026"), "2026-11-30");
assert.equal(lastDate("no date here"), null);

// BPI: title from the card heading (link text is "View details"), date from "Valid until", credit+debit tags
const b = await load("bpi");
assert.deepEqual(bpi.parse(b).map(row), [
  ["bpi-leblanc-hotel-and-resort-promo", "LeBlanc Hotel and Resort Promo", "2027-01-14", "credit+debit", null],
  ["bpi-jewelmer-promo", "Jewelmer Promo", "2027-02-28", "credit+debit", null],
  ["bpi-linden-teak-promo", "Linden Teak Promo", "2026-12-31", "credit+debit", null]
]);
assert.equal(bpi.parse(b)[0].url, "https://www.bpi.com.ph/personal/rewards-and-promotions/promos/leblanc-hotel-and-resort-promo");
assert.equal(bpi.parse(b.replace(/Credit cards/, "Loans")).length, 2, "BPI: non-credit-card promos dropped");

// Metrobank: embedded JSON; promos without credit cards dropped; category from Metrobank's own tags
const m = metrobank.parse(await load("metrobank"));
assert.deepEqual(m.map(row), [
  ["mb-discounts-at-club-haven-boracay-inc", "Up to 45% OFF at Club Haven Boracay Inc.", "2027-04-30", "credit", "Travel"],
  ["mb-discounts-cashback-at-samsung-q4-2026", "7% OFF + 7% CASHBACK at Samsung", "2026-11-29", "credit", "Shopping"]
]);
assert.equal(m[1].url, "https://www.metrobank.com.ph/promos/discounts-cashback-at-samsung-q4-2026");
assert.ok(m[1].cardNames.includes("Titanium Mastercard"));

// RCBC: no dates on the listing
const r = rcbc.parse(await load("rcbc"));
assert.deepEqual(r.map(row)[2], ["rcbc-300mcmsmstore-1126", "Mastercard Mondays at SM Store", null, "credit", null]);
assert.equal(r[0].url, "https://rcbccredit.com/promos/THPPMCTheLoop-1126");

// EastWest: end date (not start date), category from pills
assert.deepEqual(eastwest.parse(await load("eastwest")).map(row)[0],
  ["ew-save-php-200-waltermartcom", "Save Php 200 at WalterMart.com", "2027-06-01", "credit", "Shopping"]);

// Maya: only credit card deals out of the 9 featured ones
const y = maya.parse(await load("maya"));
assert.equal(y.length, 5);
assert.ok(y.every(p => !/crypto|personal loan|smart or tnt/i.test(p.title)));
assert.equal(y[1].validUntil, "2026-12-20");

assert.equal(categorize("Lazada: Payday Sale Promo"), "Online");
assert.equal(categorize("LeBlanc Hotel and Resort Promo"), "Travel");
assert.equal(categorize("GAP Promo"), "Shopping");
console.log("All parser tests passed.");
