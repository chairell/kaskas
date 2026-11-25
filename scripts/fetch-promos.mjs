// Fetches active credit card promos from each bank's site and writes promos.json.
// Run: node scripts/fetch-promos.mjs   (Node 20+, no dependencies)
//
// If a bank's pages fail or yield zero promos, its previous promos are kept (minus expired ones)
// and the run exits with code 1 so the scheduled job flags it, after promos.json is still written.
import { readFile, writeFile } from "node:fs/promises";
import { categorize, todayPH } from "./lib.mjs";
import * as bpi from "./sources/bpi.mjs";

const SOURCES = [bpi];   // add more banks here: bdo, unionbank, metrobank, ...
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
    try { for (const p of src.parse(await get(url))) if (!found.has(p.id)) found.set(p.id, p); }
    catch (e) { errors.push(String(e.message || e)); }
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
if (!same) await writeFile(OUT, JSON.stringify(next, null, 1) + "\n");
console.log(same ? "No changes." : `Wrote ${promos.length} promos.`);
process.exit(failed ? 1 : 0);
