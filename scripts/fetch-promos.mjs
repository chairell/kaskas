// Fetches active credit card promos from each bank's site and writes promos.json.
// Run: node scripts/fetch-promos.mjs   (Node 20+, no dependencies)
//
// If a bank's pages fail or yield zero promos, its previous promos are kept (minus expired ones)
// and the run exits with code 1 so the scheduled job flags it, after promos.json is still written.
import { readFile, writeFile } from "node:fs/promises";
import { categorize, todayPH } from "./lib.mjs";
import * as bpi from "./sources/bpi.mjs";
import * as rcbc from "./sources/rcbc.mjs";
import * as eastwest from "./sources/eastwest.mjs";
import * as maya from "./sources/maya.mjs";
import * as metrobank from "./sources/metrobank.mjs";

const SOURCES = [bpi, metrobank, rcbc, eastwest, maya];
// Not covered: BDO (its deals app loads promos through a login-gated API), PNB and UnionBank
// (their sites refuse automated requests), MariBank (no promo page).
const OUT = new URL("../promos.json", import.meta.url);
const UA = "Mozilla/5.0 (compatible; KaskasPromoBot/1.0; +https://github.com/chairell/kaskas)";

async function get(url) {
  const r = await fetch(url, { headers: { "user-agent": UA, "accept": "text/html" }, signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(`${url} -> HTTP ${r.status}`);
  return r.text();
}

const today = todayPH();
let prev = { promos: [] };
try { prev = JSON.parse(await readFile(OUT, "utf8")); } catch {}

const promos = [], status = {};
let failed = false;
for (const src of SOURCES) {
  const found = new Map(), errors = [];
  for (const url of src.listUrls) {
    let added = 0;
    try { for (const p of src.parse(await get(url), url)) if (!found.has(p.id)) { found.set(p.id, p); added++; } }
    catch (e) { errors.push(String(e.message || e)); }
    if (src.stopWhenNoNew && !added) break;          // ran past the last page
    await new Promise(r => setTimeout(r, 1000));     // be gentle with the bank's server
  }
  let list = [...found.values()].filter(p => !p.validUntil || p.validUntil >= today);
  if (!list.length) {
    failed = true;
    list = prev.promos.filter(p => p.bank == src.bank && (!p.validUntil || p.validUntil >= today));
    status[src.bank] = { ok: false, count: list.length, note: "No promos found this run; kept the previous list.", errors };
    console.error(`✗ ${src.bank}: no promos found. ${errors.join("; ")}`);
  } else {
    status[src.bank] = { ok: true, count: list.length };
    console.log(`✓ ${src.bank}: ${list.length} active promos`);
  }
  for (const p of list) promos.push({ ...p, category: p.category || categorize(p.title) });
}

promos.sort((a, b) => (a.validUntil || "9999").localeCompare(b.validUntil || "9999"));
const next = { updated: today, sources: status, promos };
// Only rewrite when something other than the date changed, so the job doesn't commit every day for nothing.
const same = JSON.stringify({ ...prev, updated: 0 }) == JSON.stringify({ ...next, updated: 0 });
// One promo per line keeps the file small and the daily diffs readable.
const text = `{"updated":${JSON.stringify(today)},"sources":${JSON.stringify(status)},"promos":[\n${promos.map(p => JSON.stringify(p)).join(",\n")}\n]}\n`;
if (!same) await writeFile(OUT, text);
console.log(same ? "No changes." : `Wrote ${promos.length} promos.`);
process.exit(failed ? 1 : 0);
