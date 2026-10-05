// Tukar versi ini untuk paksa semua peranti muat turun semula app shell.
const CACHE_NAME = "qudani-v2";
const APP_SHELL = [
  "/",
  "/closing",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

const putInCache = (request, response) => {
  if (response.ok) {
    const copy = response.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
  }
  return response;
};

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;

  // Fail statik (nama berhash) — cache dahulu, sangat laju.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request).then((res) => putInCache(event.request, res))),
    );
    return;
  }

  // Halaman & data lain — rangkaian dahulu supaya sentiasa terkini, cache bila offline.
  event.respondWith(
    fetch(event.request)
      .then((res) => putInCache(event.request, res))
      .catch(() =>
        caches.match(event.request).then(
          (cached) => cached || (event.request.mode === "navigate" ? caches.match("/") : Response.error()),
        ),
      ),
  );
});
