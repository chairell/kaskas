let S;
try { S = JSON.parse(localStorage.kaskas || "null"); } catch (e) { S = null; }
S = Object.assign({ owned: [], cat: "Dining", merch: "", amts: [], guide: 0, mileVal: 0.5, conds: {}, picks: {} }, S || {});
S.picks = S.picks || {};
S.owned = S.owned.filter(id => CARDS.some(c => c.id == id));   // drop cards from older versions
if (!CATS.includes(S.cat)) S.cat = "Dining";
if (S.merch && !MERCHANTS[S.merch]) S.merch = "";

const $ = id => document.getElementById(id);
const save = () => { try { localStorage.kaskas = JSON.stringify(S); } catch (e) {} };
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
function setCat(c) { S.cat = c; S.merch = ""; save(); renderCats(); renderMerch(); compare(false); }
function renderCats() {
  $("cats").innerHTML = CATS.map(c => `<button class="${c == S.cat ? "on" : ""}" onclick="setCat('${c}')">${c}</button>`).join("");
}
function renderMerch() {
  $("merchTag").innerHTML = S.merch ? `<span class="merch">🏪 ${esc(MERCHANTS[S.merch].name)} bonus applies <a href="#" onclick="S.merch='';save();renderMerch();compare(false);return false">✕</a></span>` : "";
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
function calc(c, cat, a, m) {
  const cond = c.cond && S.conds[c.id] ? c.cond : null;
  const notes = [];
  if (c.note) notes.push(c.note);
  if (c.capNote) notes.push("Cap: " + c.capNote + ".");
  if (c.minTxn && a < c.minTxn) {
    return { earned: `Nothing (minimum ₱${c.minTxn.toLocaleString()} per receipt)`, conv: "—", redeem: "—", value: 0, notes };
  }
  if (c.type == "cash") {
    const rates = Object.assign({}, c.rates, cond && cond.rates);
    const merch = Object.assign({}, c.merch, cond && cond.merch);
    let r = rates[cat] ?? rates.Other ?? 0;
    if (m && merch[m] != null) r = merch[m];
    if (m && c.merchTiers && c.merchTiers[m]) { const t = c.merchTiers[m].find(([min]) => a >= min); if (t) r = t[1]; }
    let v = a * r, capped = false;
    if (c.cap && v > c.cap) { v = c.cap; capped = true; }
    if (c.cond && !cond) notes.push("Higher rate needs: " + c.cond.label.replace(/^I /, "you ") + " (tick it in My cards).");
    return { earned: `${peso(v)} cashback (${(r * 100).toFixed(1)}%)${capped ? ", capped" : ""}`, conv: "None — goes straight to your bill",
      redeem: "Credited to your statement", value: v, notes };
  }
  // points / miles
  const per = (m && c.perMerch && c.perMerch[m]) || (c.perCat && c.perCat[cat]) || c.per;
  let mult = (c.mult && c.mult[cat]) || 1;
  if (c.choose && picks(c).some(o => c.choose.options[o].includes(cat))) mult = c.choose.mult;
  const units = Math.floor(a / per) * mult;
  const unit = c.type == "miles" ? "mile" : "point";
  const opts = c.redeem.map(o => o.kind == "cash"
    ? { o, v: units * o.val, conv: `1 ${unit} = ₱${num(o.val)}`, how: o.label }
    : { o, v: units / o.ppm * S.mileVal, conv: o.ppm == 1 ? `1 ${unit} = 1 mile` : `${num(o.ppm)} ${unit}s = 1 ${o.prog.split(" (")[0]} mile`,
        how: `${num(units / o.ppm)} ${o.prog} at ₱${num(S.mileVal)}/mile` });
  const best = opts.reduce((x, y) => (y.v > x.v ? y : x));
  let v = best.v;
  if (c.cap && v > c.cap) v = c.cap;
  const other = opts.filter(x => x !== best).map(x => `${x.how}: ${peso(x.v)}`);
  if (other.length) notes.push("Other option — " + other.join("; ") + ".");
  return { earned: `${num(units)} ${unit}s (₱${per} per ${unit}${mult > 1 ? `, ${mult}x on ${cat}` : ""})`,
    conv: best.conv, redeem: best.how, value: v, notes };
}

// final = true when the user taps the button, lets go of the slider or picks a recent amount.
// Live updates (dragging, typing, changing category) skip saving and scrolling.
function compare(final) {
  const a = +$("amt").value;
  if (!a) { if (!final) $("results").innerHTML = ""; return; }
  if (final) { S.amts = [a, ...S.amts.filter(x => x != a)].slice(0, 4); save(); renderQuick(); }
  const mine = CARDS.filter(c => S.owned.includes(c.id));
  if (!mine.length) { $("results").innerHTML = '<div class="card">Pick your cards first under 💳 My cards.</div>'; return; }
  const r = mine.map(c => ({ c, ...calc(c, S.cat, a, S.merch) })).sort((x, y) => y.value - x.value);
  $("results").innerHTML = r.map((x, i) => `<div class="card ${i == 0 ? "win" : ""}">${i == 0 ? '<span class="badge">USE THIS ONE 🔥</span><br>' : ""}<b>${esc(x.c.name)}</b>
    <table><tr><td>Earn</td><td>${x.earned}</td></tr><tr><td>Conversion</td><td>${esc(x.conv)}</td></tr>
    <tr><td>Redemption</td><td>${esc(x.redeem)}</td></tr><tr><td><b>Value</b></td><td><b>${peso(x.value)} (${pct(x.value, a)} back)</b></td></tr></table>
    ${x.notes.length ? `<p class="small">${x.notes.map(esc).join("<br>")}</p>` : ""}
    <p class="small"><a href="${x.c.src}" target="_blank" rel="noopener">Source</a></p>
    ${i == 0 ? `<button class="ghost" onclick="shareResult()">Share this result</button>` : ""}</div>`).join("");
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
function merchantHint() {
  const k = $("merchant").value.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!k) return;
  const words = Object.keys(MERCH_WORDS).sort((x, y) => y.length - x.length);   // longest first: "smart" before "sm"
  for (const w of words) if (k.startsWith(w) || (w.length > 3 && k.includes(w))) {
    const t = MERCH_WORDS[w];
    if (MERCHANTS[t]) { S.cat = MERCHANTS[t].cat; S.merch = t; } else { S.cat = t; S.merch = ""; }
    save(); renderCats(); renderMerch(); compare(false); return;
  }
}
function locHint() {
  if (!navigator.geolocation) return toast("Location isn't available on this device.");
  navigator.geolocation.getCurrentPosition(
    () => toast("Got your location. Shop matching is coming in a later version — type the shop name for now."),
    () => toast("No problem — location stays off."));
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
  const where = S.merch ? MERCHANTS[S.merch].name : S.cat.toLowerCase();
  doShare({ title: "Kaskas!", text: `${w.c.name} got me ${pct(w.value, a)} back on ${where}. Which of your cards wins?`,
    url: `${baseUrl()}?cat=${encodeURIComponent(S.cat)}&amt=${a}${S.merch ? "&m=" + S.merch : ""}` });
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

$("merchlist").innerHTML = Object.values(MERCHANTS).map(m => `<option value="${esc(m.name)}">`).join("");
const q = new URLSearchParams(location.search);
if (q.get("cat") && CATS.includes(q.get("cat"))) S.cat = q.get("cat");
if (q.get("m") && MERCHANTS[q.get("m")]) S.merch = q.get("m");
if (q.get("amt")) { $("amt").value = q.get("amt"); $("slider").value = toSlider(+q.get("amt")); }
renderCats(); renderMerch(); renderQuick(); renderList(); cheatSheet(); guide();
if (!S.owned.length) show("setup"); else if ($("amt").value) compare(false);
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
