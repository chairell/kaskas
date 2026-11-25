let S;
try { S = JSON.parse(localStorage.kaskas || "null"); } catch (e) { S = null; }
S = Object.assign({ owned: [], cat: "Kainan", amts: [], guide: 0 }, S || {});
const $ = id => document.getElementById(id);
const save = () => { try { localStorage.kaskas = JSON.stringify(S); } catch (e) {} };
const peso = n => "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function show(v) {
  $("pos").style.display = v == "pos" ? "" : "none";
  $("setup").style.display = v == "setup" ? "block" : "none";
  if (v == "pos") cheatSheet();
}
function setCat(c) { S.cat = c; save(); renderCats(); }
function renderCats() {
  $("cats").innerHTML = CATS.map(c => `<button class="${c == S.cat ? "on" : ""}" onclick="setCat('${c}')">${c}</button>`).join("");
}
function renderQuick() {
  $("quick").innerHTML = S.amts.map(a => `<button onclick="amt.value=${a}">${peso(a)}</button>`).join("");
}
function renderList() {
  $("cardlist").innerHTML = CARDS.map(c => `<label style="display:flex;gap:10px;align-items:center;margin:10px 0;font-weight:500">
    <input type="checkbox" style="width:22px;height:22px;margin:0" ${S.owned.includes(c.id) ? "checked" : ""} onchange="toggle('${c.id}')"> ${c.name}</label>`).join("");
}
function toggle(id) { S.owned = S.owned.includes(id) ? S.owned.filter(x => x != id) : [...S.owned, id]; save(); }

// Three layers: earn → conversion → redemption value
function calc(c, cat, a) {
  if (c.unit == "cashback") {
    const r = c.cash[cat] ?? c.cash["Iba pa"];
    return { earned: `${peso(a * r)} cashback (${(r * 100).toFixed(1)}%)`, conv: "Wala na, diretso sa bill", redeem: "Credited sa bill", value: a * r };
  }
  const m = c.mult[cat] || 1, units = Math.floor(a / c.earn) * m, red = units * c.conv;
  return {
    earned: `${units.toLocaleString()} ${c.unit}s (₱${c.earn}/${c.unit}${m > 1 ? `, ${m}x sa ${cat}` : ""})`,
    conv: c.conv == 1 ? "1:1" : `${red.toLocaleString()} miles (${c.conv} per ${c.unit})`,
    redeem: `${c.redeem} · ~₱${c.val}/unit`,
    value: red * c.val
  };
}
function compare() {
  const a = +$("amt").value; if (!a) return;
  S.amts = [a, ...S.amts.filter(x => x != a)].slice(0, 4); save(); renderQuick();
  const mine = CARDS.filter(c => S.owned.includes(c.id));
  if (!mine.length) { $("results").innerHTML = '<div class="card">Pili ka muna ng cards mo sa 💳 Cards ko.</div>'; return; }
  const r = mine.map(c => ({ c, ...calc(c, S.cat, a) })).sort((x, y) => y.value - x.value);
  $("results").innerHTML = r.map((x, i) => {
    const pct = (x.value / a * 100).toFixed(2);
    return `<div class="card ${i == 0 ? "win" : ""}">${i == 0 ? '<span class="badge">ITO ANG I-KASKAS MO! 🔥</span><br>' : ""}<b>${x.c.name}</b>
    <table><tr><td>Earn</td><td>${x.earned}</td></tr><tr><td>Conversion</td><td>${x.conv}</td></tr>
    <tr><td>Redemption</td><td>${x.redeem}</td></tr><tr><td><b>Sulit value</b></td><td><b>${peso(x.value)} (${pct}%)</b></td></tr></table>
    ${i == 0 ? `<button class="ghost" onclick="shareResult(${i})">I-flex ang result</button>` : ""}</div>`;
  }).join("");
  window._last = { r, a };
}
function cheatSheet() {
  const mine = CARDS.filter(c => S.owned.includes(c.id));
  $("cheat").innerHTML = mine.length ? "<table>" + CATS.map(cat => {
    const b = mine.map(c => ({ c, v: calc(c, cat, 10000).value })).sort((x, y) => y.v - x.v)[0];
    return `<tr><td>${cat}</td><td><b>${b.c.name}</b> · ${(b.v / 100).toFixed(2)}%</td></tr>`;
  }).join("") + "</table>" : '<p class="small">Pili ka muna ng cards mo para lumabas ang kodigo.</p>';
}
function merchantHint() {
  const k = $("merchant").value.toLowerCase().replace(/[^a-z]/g, "");
  for (const m in MERCH) if (k && k.startsWith(m)) { setCat(MERCH[m]); return; }
}
function locHint() {
  if (!navigator.geolocation) return toast("Walang location sa device na 'to.");
  navigator.geolocation.getCurrentPosition(
    () => toast("Nakuha ang location! Darating pa ang shop matching — i-type muna ang merchant."),
    () => toast("Okay lang, hindi na natin gagamitin ang location."));
}
function toast(t) { const d = document.createElement("div"); d.className = "card small"; d.textContent = t; $("results").prepend(d); setTimeout(() => d.remove(), 4000); }
function baseUrl() { return location.href.split(/[?#]/)[0]; }
function doShare(d) {
  if (navigator.share) navigator.share(d).catch(() => {});
  else navigator.clipboard.writeText(`${d.text} ${d.url}`).then(() => toast("Na-copy ang link!"));
}
function shareApp() { doShare({ title: "Kaskas!", text: "Alamin kung aling card mo ang pinaka-sulit i-kaskas:", url: baseUrl() }); }
function shareResult() {
  const { r, a } = window._last, w = r[0];
  doShare({ title: "Kaskas!", text: `${w.c.name} ang winner ko sa ${S.cat}: ${(w.value / a * 100).toFixed(2)}% back! Ikaw, saan ka kakaskas?`,
    url: `${baseUrl()}?cat=${encodeURIComponent(S.cat)}&amt=${a}` });
}
function guide() {
  if (S.guide || matchMedia("(display-mode: standalone)").matches || navigator.standalone) return;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  $("gtext").textContent = ios
    ? "Sa Safari, i-tap ang Share button (kahon na may arrow), tapos piliin ang 'Add to Home Screen'."
    : "Sa Chrome, i-tap ang ⋮ menu sa taas, tapos 'Add to Home screen' o 'Install app'.";
  $("guide").style.display = "block";
}
function dismissGuide() { S.guide = 1; save(); $("guide").style.display = "none"; }

const q = new URLSearchParams(location.search);
if (q.get("cat") && CATS.includes(q.get("cat"))) S.cat = q.get("cat");
if (q.get("amt")) $("amt").value = q.get("amt");
renderCats(); renderQuick(); renderList(); cheatSheet(); guide();
if (!S.owned.length) show("setup");
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
