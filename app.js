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

function show(v) {
  $("pos").style.display = v == "pos" ? "" : "none";
  $("setup").style.display = v == "setup" ? "block" : "none";
  if (v == "pos") cheatSheet();
  window.scrollTo(0, 0);
}
function setCat(c) { S.cat = c; save(); renderCats(); compare(false); }
function renderCats() {
  $("cats").innerHTML = CATS.map(c => `<button class="${c == S.cat ? "on" : ""}" onclick="setCat('${c}')">${c}</button>`).join("");
}
function renderQuick() {
  $("quick").innerHTML = S.amts.map(a => `<button onclick="setAmt(${a})">${peso(a)}</button>`).join("");
}
function renderList() {
  $("cardlist").innerHTML = BANKS.map(b => {
    const cards = CARDS.filter(c => c.bank == b);
    const n = cards.filter(c => S.owned.includes(c.id)).length;
    return `<details ${n ? "open" : ""}><summary>${b}${n ? ` · ${n} selected` : ""}</summary>` + cards.map(c => `
      <label class="row"><input type="checkbox" ${S.owned.includes(c.id) ? "checked" : ""} onchange="toggle('${c.id}')"> <span>${esc(c.name)}</span></label>
      ${c.choose ? `<div class="cond" id="pick_${c.id}" style="display:${S.owned.includes(c.id) ? "block" : "none"}">Your ${c.choose.n} bonus categories (${c.choose.mult}x):<br>${Object.keys(c.choose.options).map(o => `<label style="display:inline-block;margin:4px 10px 0 0"><input type="checkbox" ${picks(c).includes(o) ? "checked" : ""} onchange="togglePick('${c.id}','${o}',this)">${esc(o)}</label>`).join("")}</div>` : ""}
      ${c.cond ? `<label class="cond" id="cond_${c.id}" style="display:${S.owned.includes(c.id) ? "block" : "none"}"><input type="checkbox" ${S.conds[c.id] ? "checked" : ""} onchange="toggleCond('${c.id}')">${esc(c.cond.label)}</label>` : ""}`).join("") + "</details>";
  }).join("");
  $("mileVal").value = S.mileVal;
}
function toggle(id) {
  S.owned = S.owned.includes(id) ? S.owned.filter(x => x != id) : [...S.owned, id]; save();
  for (const p of ["cond_", "pick_"]) { const el = $(p + id); if (el) el.style.display = S.owned.includes(id) ? "block" : "none"; }
}
function picks(c) { return S.picks[c.id] || c.choose.def; }
function togglePick(id, opt, box) {
  const c = CARDS.find(x => x.id == id), cur = picks(c);
  if (box.checked) {
    if (cur.length >= c.choose.n) { box.checked = false; return alert(`You can pick ${c.choose.n}. Untick one first.`); }
    S.picks[id] = [...cur, opt];
  } else S.picks[id] = cur.filter(x => x != opt);
  save();
}
function toggleCond(id) { S.conds[id] = !S.conds[id]; save(); }
function setMileVal() { const v = +$("mileVal").value; if (v >= 0) { S.mileVal = v; save(); } }

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

// final = true when the user taps the button, lets go of the slider or picks a recent amount.
// Live updates (dragging, typing, changing category) skip saving and scrolling.
function compare(final) {
  const a = +$("amt").value;
  if (!a) { if (!final) $("results").innerHTML = ""; return; }
  if (final) { S.amts = [a, ...S.amts.filter(x => x != a)].slice(0, 4); save(); renderQuick(); }
  const mine = CARDS.filter(c => S.owned.includes(c.id));
  if (!mine.length) { $("results").innerHTML = '<div class="card">Pick your cards first under 💳 My cards.</div>'; return; }
  const r = mine.map(c => ({ c, ...calc(c, S.cat, a, S.merch) })).sort((x, y) => y.value - x.value);
  const w = r[0], open = $("results").querySelector("details.how[open]") && window._last && window._last.r[0].c.id == w.c.id;
  let h = `<div class="card win hero">
    <span class="badge">USE THIS ONE 🔥</span>
    <div class="bank">${esc(w.c.bank)}</div><div class="hname">${esc(w.c.name)}</div>
    <div class="hval">${peso(w.value)} <span>back</span></div><div class="hpct">${pct(w.value, a)} on ${peso0(a)} · ${esc(S.cat)}</div>
    ${badgeHtml(w)}
    <details class="how" ${open ? "open" : ""}><summary>How is this calculated?</summary>${breakdown(w, a)}</details>
    <button class="ghost" onclick="shareResult()">Share this result</button></div>`;
  if (r.length > 1) h += `<div class="card"><b>Your other cards</b>${r.slice(1).map(x => {
    const diff = w.value - x.value;
    return `<details class="rowd"><summary><div class="rtop"><span class="rname">${esc(x.c.name)}</span><span class="rpct">${x.value ? pct(x.value, a) : "0%"}</span></div>
      <div class="rsub">${x.value ? peso(x.value) + " back" : "Earns nothing here"}${diff > 0.005 ? ` · <b>${peso(diff)} less</b>` : " · same as top"}</div>${badgeHtml(x)}</summary>${breakdown(x, a)}</details>`;
  }).join("")}</div>`;
  $("results").innerHTML = h;
  window._last = { r, a };
  if (final) $("results").scrollIntoView({ behavior: "smooth" });
}
function cheatSheet() {
  const mine = CARDS.filter(c => S.owned.includes(c.id));
  $("cheat").innerHTML = mine.length ? "<table>" + CATS.map(cat => {
    const b = mine.map(c => ({ c, v: calc(c, cat, 5000, "").value })).sort((x, y) => y.v - x.v)[0];
    return `<tr><td>${cat}</td><td><b>${esc(b.c.name)}</b> · ${pct(b.v, 5000)}</td></tr>`;
  }).join("") + "</table>" : '<p class="small">Pick your cards to see your cheat sheet.</p>';
}
function toast(t) { const d = document.createElement("div"); d.className = "card small"; d.textContent = t; $("results").prepend(d); setTimeout(() => d.remove(), 4000); }
function baseUrl() { return location.href.split(/[?#]/)[0]; }
function doShare(d) {
  if (navigator.share) navigator.share(d).catch(() => {});
  else navigator.clipboard.writeText(`${d.text} ${d.url}`).then(() => toast("Link copied!"));
}
function shareApp() { doShare({ title: "Kaskas!", text: "Find out which of your cards earns the most on every purchase:", url: baseUrl() }); }
function shareResult() {
  const { r, a } = window._last, w = r[0];
  const where = S.cat.toLowerCase();
  doShare({ title: "Kaskas!", text: `${w.c.name} got me ${pct(w.value, a)} back on ${where}. Which of your cards wins?`,
    url: `${baseUrl()}?cat=${encodeURIComponent(S.cat)}&amt=${a}` });
}
function guide() {
  if (S.guide || matchMedia("(display-mode: standalone)").matches || navigator.standalone) return;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  $("gtext").textContent = ios
    ? "In Safari, tap the Share button (the square with an arrow), then choose \"Add to Home Screen\"."
    : "In Chrome, tap the ⋮ menu at the top, then \"Add to Home screen\" or \"Install app\".";
  $("guide").style.display = "block";
}
function dismissGuide() { S.guide = 1; save(); $("guide").style.display = "none"; }

const q = new URLSearchParams(location.search);
if (q.get("cat") && CATS.includes(q.get("cat"))) S.cat = q.get("cat");
if (q.get("amt")) { $("amt").value = q.get("amt"); $("slider").value = toSlider(+q.get("amt")); }
renderCats(); renderQuick(); renderList(); cheatSheet(); guide();
if (!S.owned.length) show("setup"); else if ($("amt").value) compare(false);
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
