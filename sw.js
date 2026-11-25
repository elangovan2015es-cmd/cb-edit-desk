// CB Edit Desk service worker — offline cache. Bump VERSION on every release.
const VERSION = "cb-edit-desk-20261125-1215";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("message", e => {
  if (e.data === "skipWaiting") self.skipWaiting();
});

// Same-origin GET only. Network first for the page (so updates arrive), cache first for the rest.
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  const isPage = req.mode === "navigate" || req.url.endsWith("/index.html");
  if (isPage) {
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put("./index.html", copy)); return r; })
      .catch(() => caches.match("./index.html")));
  } else {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
  }
});
