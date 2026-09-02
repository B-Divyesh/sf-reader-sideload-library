const CACHE = "rsl-shell-v6";
const ROUTES = ["/", "/demo/", "/demo/?demo=1", "/privacy/", "/terms/", "/404.html"];
const BUILD_ASSETS = ["__RSL_BUILD_ASSETS__"];
const SHELL = [...ROUTES, ...BUILD_ASSETS];

function fallbackFor(pathname) {
  if (pathname === "/demo" || pathname.startsWith("/demo/")) return "/demo/";
  if (pathname === "/privacy" || pathname.startsWith("/privacy/")) return "/privacy/";
  if (pathname === "/terms" || pathname.startsWith("/terms/")) return "/terms/";
  if (pathname === "/") return "/";
  return "/404.html";
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
});

self.addEventListener("activate", (event) => event.waitUntil(Promise.all([
  caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))),
  self.clients.claim()
])));

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    try {
      const response = await fetch(event.request);
      if (response.ok) {
        const cache = await caches.open(CACHE);
        await cache.put(event.request, response.clone());
      }
      return response;
    } catch (error) {
      if (event.request.mode === "navigate") {
        const fallback = await caches.match(fallbackFor(url.pathname));
        if (fallback) return fallback;
      }
      const asset = await caches.match(url.pathname, { ignoreSearch: true });
      if (asset) return asset;
      throw error;
    }
  })());
});
