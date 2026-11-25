let S;
try { S = JSON.parse(localStorage.kaskas || "null"); } catch (e) { S = null; }
S = Object.assign({ owned: [], cat: "Dining", merch: "", amts: [], guide: 0, mileVal: 0.5, conds: {}, picks: {} }, S || {});
S.picks = S.picks || {};
S.owned = S.owned.filter(id => CARDS.some(c => c.id == id));   // drop cards from older versions
if (!CATS.includes(S.cat)) S.cat = "Dining";
S.merch = "";   // shop input removed for now; merchant bonuses stay in the data for later

const $ = id => document.getElementById(id);
const save = () => { try { localStorage.kaskas = JSON.stringify(S); } catch (e) {} };
const peso0 = n => "₱" + Math.round(n).toLocaleString("en-PH");
const peso = n => "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct = (v, a) => (v / a * 100).toFixed(2) + "%";
const num = n => (+n.toFixed(2)).toLocaleString("en-PH");
const esc = s => String(s).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));

const MAXAMT = 100000;
const toAmt = v => { const a = (v / 1000) ** 2 * MAXAMT; return a < 1000 ? Math.round(a / 10) * 10 : a < 10000 ? Math.round(a / 50) * 50 : Math.round(a / 500) * 500; };
const toSlider = a => Math.min(1000, Math.round(Math.sqrt(a / MAXAMT) * 1000));
function slid() { $("amt").value = toAmt(+$("slider").value) || ""; compare(false); }
function amtTyped() { $("slider").value = toSlider(+$("amt").value || 0); compare(false); }
function setAmt(a) { $("amt").value = a; $("slider").value = toSlider(a); compare(true); }


// ── Navigation ──
const TITLES = { compare: ["Kaskas!", "Which card should you swipe?"], cards: ["My cards", "Turn on the cards in your wallet"], settings: ["Settings", ""] };
let tab = "compare";
function go(t) {
  if (t == tab) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
  tab = t;
  for (const v of ["compare", "cards", "settings"]) { $("v-" + v).classList.toggle("active", v == t); $("t-" + v).classList.toggle("on", v == t); }
  document.body.classList.toggle("c", t == "compare");
  $("title").textContent = TITLES[t][0]; $("title").classList.toggle("brand", t == "compare");
  $("subtitle").textContent = t == "cards" ? `${S.owned.length} of ${CARDS.length} cards on` : TITLES[t][1];
  if (t == "compare") { compare(false); }
  if (t == "cards") renderCards();
  if (t == "settings") $("mileVal").value = S.mileVal;
  window.scrollTo(0, 0);
  sizeDock();
}
function sizeDock() { document.documentElement.style.setProperty("--dock-h", $("dock").offsetHeight + "px"); }
let toastT;
function toast(t) { const el = $("toast"); el.textContent = t; el.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove("show"), 2600); }

// ── Compare dock ──
const ICON = { Dining: "🍽️", Groceries: "🛒", Drugstore: "💊", Fuel: "⛽", Shopping: "🛍️", Online: "📦", Transport: "🚕", Travel: "✈️", Overseas: "🌏", Bills: "🧾", Other: "💳" };
function setCat(c) { S.cat = c; save(); renderCats(); compare(false); }
function renderCats() {
  $("cats").innerHTML = CATS.map(c => `<button class="chip ${c == S.cat ? "on" : ""}" onclick="setCat('${c}')">${ICON[c] || ""} ${c}</button>`).join("");
  const on = $("cats").querySelector(".on"); if (on) on.scrollIntoView({ block: "nearest", inline: "nearest" });
}
function renderQuick() {
  $("quick").innerHTML = S.amts.map(a => `<button class="chip" onclick="setAmt(${a})">${peso0(a)}</button>`).join("");
}

// ── My cards ──
const BANK_COLOR = { BPI: "#b11116", BDO: "#0033a0", UnionBank: "#f37021", Metrobank: "#1f4eae", Maya: "#00a76f", MariBank: "#ff7a1a", PNB: "#00296b", EastWest: "#6c2d82", RCBC: "#0072bc" };
const sw = (on, fn, sm) => `<label class="switch ${sm ? "sm" : ""}" onclick="event.stopPropagation()"><input type="checkbox" ${on ? "checked" : ""} onchange="${fn}"><i></i></label>`;
function cardOptions(c) {
  let h = "";
  if (c.choose) h += `<div class="ol">Your ${c.choose.n} bonus categories (${c.choose.mult}x points)</div><div class="chips">${Object.keys(c.choose.options).map(o =>
    `<button class="chip ${picks(c).includes(o) ? "on" : ""}" onclick="togglePick('${c.id}','${o}')">${esc(o)}</button>`).join("")}</div>`;
  if (c.cond) h += `<div class="orow"><span>${esc(c.cond.label)}</span>${sw(S.conds[c.id], `toggleCond('${c.id}')`, 1)}</div>`;
  return h ? `<div class="opts">${h}</div>` : "";
}
function cardRow(c, withOpts) {
  const on = S.owned.includes(c.id);
  return `<div class="item"><div class="row"><span class="dot" style="background:${BANK_COLOR[c.bank] || "#999"}"></span>
    <div class="lbl">${esc(c.name)}<small>${esc(c.bank)} · ${c.type == "cash" ? "Cashback" : c.type == "miles" ? "Airline miles" : "Points"}</small></div>
    ${sw(on, `toggle('${c.id}')`)}</div>${withOpts && on ? cardOptions(c) : ""}</div>`;
}
function renderCards() {
  const q = $("q").value.trim().toLowerCase();
  const match = c => !q || (c.name + " " + c.bank).toLowerCase().includes(q);
  const mine = CARDS.filter(c => S.owned.includes(c.id) && match(c));
  let h = "";
  if (mine.length) h += `<div class="sect">In your wallet</div><div class="group">${mine.map(c => cardRow(c, true)).join("")}</div>`;
  for (const b of BANKS) {
    const list = CARDS.filter(c => c.bank == b && !S.owned.includes(c.id) && match(c));
    if (list.length) h += `<div class="sect">${b}</div><div class="group">${list.map(c => cardRow(c, false)).join("")}</div>`;
  }
  if (!h) h = `<div class="empty"><div class="big">🔍</div><h2>No cards found</h2><p class="small">Try a bank name like "BPI" or a card like "Platinum".</p></div>`;
  $("cardsList").innerHTML = h;
  $("ownedCount").textContent = S.owned.length || "";
  if (tab == "cards") $("subtitle").textContent = `${S.owned.length} of ${CARDS.length} cards on`;
}
function toggle(id) {
  const on = !S.owned.includes(id);
  S.owned = on ? [...S.owned, id] : S.owned.filter(x => x != id); save();
  // let the switch animate before the card moves between sections
  setTimeout(renderCards, 220);
  toast(on ? "Added to your wallet" : "Removed from your wallet");
}
function picks(c) { return S.picks[c.id] || c.choose.def; }
function togglePick(id, opt) {
  const c = CARDS.find(x => x.id == id), cur = picks(c);
  if (cur.includes(opt)) S.picks[id] = cur.filter(x => x != opt);
  else if (cur.length >= c.choose.n) return toast(`You can pick ${c.choose.n}. Tap one to remove it first.`);
  else S.picks[id] = [...cur, opt];
  save(); renderCards();
}
function toggleCond(id) { S.conds[id] = !S.conds[id]; save(); }
function setMileVal() { const v = +$("mileVal").value; if (v >= 0) { S.mileVal = v; save(); toast("Saved"); } }
function resetCards() {
  if (!confirm("Remove all cards from your wallet?")) return;
  S.owned = []; S.conds = {}; S.picks = {}; save(); renderCards(); toast("Cleared");
}

// ── The engine: earn → conversion → redemption value ──
// Returns the value plus the three layers, notes for the breakdown, and short badges for caps and conditions.
function calc(c, cat, a, m) {
  const cond = c.cond && S.conds[c.id] ? c.cond : null;
  const notes = [], badges = [];
  if (c.note) notes.push(c.note);
  if (c.cap) badges.push({ t: `Cap ${peso0(c.cap)}/cycle`, d: `Rewards are capped at ${c.capNote || peso0(c.cap) + " per cycle"}.` });
  else if (c.capNote) badges.push({ t: /year/.test(c.capNote) ? "Annual cap" : /month/.test(c.capNote) ? "Monthly cap" : "Cap", d: `Capped at ${c.capNote}.` });
  if (c.minTxn) badges.push({ t: `${peso0(c.minTxn)} min receipt`, warn: a < c.minTxn, d: `Earns only on single receipts of ${peso0(c.minTxn)} or more.` });
  if (c.cond) badges.push(cond ? { t: "✓ Spend condition on", d: `Using the higher rate because you ticked: "${c.cond.label}". Change it in My cards.` }
                              : { t: "Needs min. spend", warn: true, d: `Top rate needs: "${c.cond.label}". If you usually do, tick it in My cards.` });
  if (c.minTxn && a < c.minTxn) {
    return { earned: `Nothing below ${peso0(c.minTxn)} per receipt`, conv: "—", redeem: "—", value: 0, notes, badges };
  }
  if (c.type == "cash") {
    const rates = Object.assign({}, c.rates, cond && cond.rates);
    const merch = Object.assign({}, c.merch, cond && cond.merch);
    let r = rates[cat] ?? rates.Other ?? 0;
    if (m && merch[m] != null) r = merch[m];
    if (m && c.merchTiers && c.merchTiers[m]) { const t = c.merchTiers[m].find(([min]) => a >= min); if (t) r = t[1]; }
    let v = a * r;
    if (c.cap && v > c.cap) { v = c.cap; badges.unshift({ t: "Capped", warn: true, d: `This purchase would earn more, but the cap limits it to ${peso0(c.cap)}.` }); }
    return { earned: `${peso(v)} cashback (${(r * 100).toFixed(1)}%)`, conv: "None — goes straight to your bill",
      redeem: "Credited to your statement", value: v, notes, badges };
  }
  // points / miles
  const per = (m && c.perMerch && c.perMerch[m]) || (c.perCat && c.perCat[cat]) || c.per;
  let mult = (c.mult && c.mult[cat]) || 1;
  if (c.choose && picks(c).some(o => c.choose.options[o].includes(cat))) mult = c.choose.mult;
  const units = Math.floor(a / per) * mult;
  const unit = c.type == "miles" ? "mile" : "point";
  const opts = c.redeem.map(o => o.kind == "cash"
    ? { o, v: units * o.val, conv: `1 ${unit} = ₱${num(o.val)}`, how: o.label }
    : { o, v: units / o.ppm * S.mileVal, conv: o.ppm == 1 ? (unit == "mile" ? "None — earned as miles directly" : `1 ${unit} = 1 mile`) : `${num(o.ppm)} ${unit}s = 1 ${o.prog.split(" (")[0]} mile`,
        how: `${num(units / o.ppm)} ${o.prog} at ₱${num(S.mileVal)}/mile` });
  const best = opts.reduce((x, y) => (y.v > x.v ? y : x));
  let v = best.v;
  if (c.cap && v > c.cap) { v = c.cap; badges.unshift({ t: "Capped", warn: true, d: `This purchase would earn more, but the cap limits it to ${peso0(c.cap)}.` }); }
  if (best.o.kind == "miles") badges.push({ t: `Miles at ${peso(S.mileVal)}`, d: `Value assumes 1 airline mile = ${peso(S.mileVal)}. Change it in My cards.` });
  if (mult > 1) badges.push({ t: `${mult}x ${cat}`, good: true, d: `This card earns ${mult}x points on ${cat}.` });
  const other = opts.filter(x => x !== best).map(x => `${x.how}: ${peso(x.v)}`);
  if (other.length) notes.push("Other option — " + other.join("; ") + ".");
  return { earned: `${num(units)} ${unit}s (₱${per} per ${unit}${mult > 1 ? `, ${mult}x on ${cat}` : ""})`,
    conv: best.conv, redeem: best.how, value: v, notes, badges };
}

const badgeHtml = x => x.badges.length ? `<div class="badges">${x.badges.map(b =>
  `<button class="tag ${b.warn ? "warn" : b.good ? "good" : ""}" data-d="${esc(b.d)}" onclick="tagTap(event,this)">${b.warn ? "⚠ " : ""}${esc(b.t)}</button>`).join("")}</div><div class="tagnote" hidden></div>` : "";
function tagTap(e, el) {
  e.preventDefault(); e.stopPropagation();
  const n = el.parentElement.nextElementSibling, same = !n.hidden && n.dataset.src == el.dataset.d;
  n.textContent = el.dataset.d; n.dataset.src = el.dataset.d; n.hidden = same;
}
const breakdown = (x, a) => `<table><tr><td>Earn</td><td>${esc(x.earned)}</td></tr><tr><td>Conversion</td><td>${esc(x.conv)}</td></tr>
  <tr><td>Redemption</td><td>${esc(x.redeem)}</td></tr><tr><td>Value</td><td>${peso(x.value)} (${pct(x.value, a)} back)</td></tr></table>
  ${x.notes.length ? `<p class="small">${x.notes.map(esc).join("<br>")}</p>` : ""}
  <p class="small"><a href="${x.c.src}" target="_blank" rel="noopener">Source: ${esc(x.c.bank)} terms</a></p>`;


// final = true when the user lets go of the slider, finishes typing or picks a recent amount (saves it to recents).
function compare(final) {
  const a = +$("amt").value;
  const mine = CARDS.filter(c => S.owned.includes(c.id));
  cheatSheet(mine, !a); renderPromos();
  if (!mine.length) {
    $("results").innerHTML = `<div class="card empty"><div class="big">💳</div><h2>Add your cards first</h2>
      <p class="small">Turn on the cards in your wallet. They stay saved on this phone.</p><button class="btn primary" onclick="go('cards')">Choose my cards</button></div>`;
    return;
  }
  if (!a) {
    $("results").innerHTML = `<div class="card empty"><div class="big">👇</div><h2>How much are you paying?</h2>
      <p class="small">Pick a category, then slide or type the amount. Your best card shows up here.</p></div>`;
    return;
  }
  if (final) { S.amts = [a, ...S.amts.filter(x => x != a)].slice(0, 5); save(); renderQuick(); }
  const r = mine.map(c => ({ c, ...calc(c, S.cat, a, S.merch) })).sort((x, y) => y.value - x.value);
  const w = r[0], open = $("results").querySelector("details.how[open]") && window._last && window._last.r[0].c.id == w.c.id;
  let h = `<div class="card win hero">
    <span class="badge">USE THIS ONE 🔥</span>
    <div class="bank">${esc(w.c.bank)}</div><div class="hname">${esc(w.c.name)}</div>
    <div class="hval">${peso(w.value)} <span>back</span></div><div class="hpct">${pct(w.value, a)} on ${peso0(a)} · ${ICON[S.cat] || ""} ${esc(S.cat)}</div>
    ${badgeHtml(w)}
    <details class="how" ${open ? "open" : ""}><summary>How is this calculated?</summary>${breakdown(w, a)}</details>
    <button class="btn plain" onclick="shareResult()">Share this result</button></div>`;
  if (r.length > 1) h += `<div class="sect">Your other cards</div><div class="card">${r.slice(1).map(x => {
    const diff = w.value - x.value;
    return `<details class="rowd"><summary><div class="rtop"><span class="rname">${esc(x.c.name)}</span><span class="rpct">${x.value ? pct(x.value, a) : "0%"}</span></div>
      <div class="rsub">${x.value ? peso(x.value) + " back" : "Earns nothing here"}${diff > 0.005 ? ` · <b>${peso(diff)} less</b>` : " · same as top"}</div>${badgeHtml(x)}</summary>${breakdown(x, a)}</details>`;
  }).join("")}</div>`;
  $("results").innerHTML = h;
  window._last = { r, a };
}
function cheatSheet(mine, openIt) {
  if (!mine.length) { $("cheatWrap").innerHTML = ""; return; }
  const wasOpen = $("cheatWrap").querySelector("details[open]");
  $("cheatWrap").innerHTML = `<details class="card cheat" ${openIt || wasOpen ? "open" : ""}><summary>🧾 Cheat sheet</summary>
    <p class="small" style="margin:6px 0 0">Your best card per category, for a ₱5,000 purchase.</p><table>${CATS.map(cat => {
    const b = mine.map(c => ({ c, v: calc(c, cat, 5000, "").value })).sort((x, y) => y.v - x.v)[0];
    return `<tr><td>${ICON[cat] || ""} ${cat}</td><td><b>${esc(b.c.name)}</b> · ${pct(b.v, 5000)}</td></tr>`;
  }).join("")}</table></details>`;
}
function baseUrl() { return location.href.split(/[?#]/)[0]; }
function doShare(d) {
  if (navigator.share) navigator.share(d).catch(() => {});
  else navigator.clipboard.writeText(`${d.text} ${d.url}`).then(() => toast("Link copied"));
}
function shareApp() { doShare({ title: "Kaskas!", text: "Find out which of your cards earns the most on every purchase:", url: baseUrl() }); }
function shareResult() {
  const { r, a } = window._last, w = r[0];
  doShare({ title: "Kaskas!", text: `${w.c.name} got me ${pct(w.value, a)} back on ${S.cat.toLowerCase()}. Which of your cards wins?`,
    url: `${baseUrl()}?cat=${encodeURIComponent(S.cat)}&amt=${a}` });
}
function showGuide(force) {
  const installed = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  if (!force && (S.guide || installed)) { $("guide").innerHTML = ""; return; }
  if (force && installed) return toast("Kaskas! is already on your home screen 🎉");
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  $("guide").innerHTML = `<div class="card"><b>📲 Add Kaskas! to your home screen</b><p class="small">${ios
    ? "In Safari, tap the Share button (the square with an arrow), then choose “Add to Home Screen”."
    : "In Chrome, tap the ⋮ menu, then “Add to Home screen” or “Install app”."}</p><button class="btn plain" onclick="dismissGuide()">Got it</button></div>`;
  if (force) go("compare");
}
function dismissGuide() { S.guide = 1; save(); $("guide").innerHTML = ""; }


// ── Promos ── promos.json is refreshed daily by a scheduled job (scripts/fetch-promos.mjs).
let PROMOS = [];
const todayPH = () => new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10);
const GENERIC = /^(view details|learn more|read more|details|see more)$/i;
// Some scrapers save the link text ("View details") as the title; fall back to the page's address.
const promoTitle = p => !p.title || GENERIC.test(p.title.trim())
  ? decodeURIComponent(p.url.split(/[?#]/)[0].replace(/\/+$/, "").split("/").pop()).replace(/[-_]+/g, " ").replace(/\b\w/g, ch => ch.toUpperCase())
  : p.title;
function renderPromos() {
  const el = $("promos"), banks = new Set(CARDS.filter(c => S.owned.includes(c.id)).map(c => c.bank)), t = todayPH();
  const live = PROMOS.filter(p => banks.has(p.bank) && (!p.validUntil || p.validUntil >= t));
  const here = live.filter(p => p.category == S.cat);
  if (!live.length) { el.innerHTML = ""; return; }
  const row = p => {
    const days = p.validUntil ? Math.round((new Date(p.validUntil) - new Date(t)) / 864e5) : null;
    const when = days == null ? "" : days <= 7 ? ` · <b>${days ? `ends in ${days} day${days > 1 ? "s" : ""}` : "ends today"}</b>`
      : ` · until ${new Date(p.validUntil).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}`;
    return `<a class="promo" href="${esc(p.url)}" target="_blank" rel="noopener"><b>${esc(promoTitle(p))}</b><span class="small">${esc(p.bank)}${p.cards == "credit+debit" ? " credit &amp; debit" : " credit cards"}${when}</span></a>`;
  };
  // Ending soonest first (undated last); show 5, the rest behind a tap.
  el.innerHTML = `<div class="sect">🎁 Promos for your cards</div><div class="card">
    ${here.length ? `<p class="small" style="margin-top:0">${here.length} ${esc(S.cat.toLowerCase())} promo${here.length > 1 ? "s" : ""} from your banks. These can beat the points above, so check the terms.</p>${here.slice(0, 5).map(row).join("")}
      ${here.length > 5 ? `<details class="allp"><summary>Show ${here.length - 5} more ›</summary>${here.slice(5).map(row).join("")}</details>` : ""}`
      : `<p class="small" style="margin:0">No ${esc(S.cat.toLowerCase())} promos from your banks right now. Try another category.</p>`}
    <p class="small" style="margin-bottom:0">${PROMOS_UPDATED ? `Checked ${esc(PROMOS_UPDATED)} from bank websites. ` : ""}Not covered yet: BDO, UnionBank, PNB and MariBank.</p></div>`;
}
let PROMOS_UPDATED = "";
fetch("promos.json").then(r => r.json()).then(d => {
  PROMOS = d.promos || [];
  PROMOS_UPDATED = d.updated ? new Date(d.updated).toLocaleDateString("en-PH", { month: "short", day: "numeric" }) : "";
  renderPromos();
}).catch(() => {});

const q = new URLSearchParams(location.search);
if (q.get("cat") && CATS.includes(q.get("cat"))) S.cat = q.get("cat");
if (q.get("amt")) { $("amt").value = q.get("amt"); $("slider").value = toSlider(+q.get("amt")); }
renderCats(); renderQuick(); renderCards(); showGuide(false); compare(false); sizeDock();
addEventListener("resize", sizeDock);
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
