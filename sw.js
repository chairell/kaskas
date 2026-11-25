// Offline support: cache the app shell so it works at the counter even with weak signal.
const CACHE = "kaskas-v3";
const FILES = ["./", "index.html", "app.js", "cards.js", "manifest.json", "icon.svg", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))));
self.addEventListener("activate", e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k != CACHE).map(k => caches.delete(k))))));
self.addEventListener("fetch", e => e.respondWith(
  fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true }))));
