// AvaRamp Service Worker — v1
// Strategy:
//   • Static assets (JS/CSS/fonts/images) → Cache First
//   • API calls (/api/*) → Network First with 5s timeout
//   • Pages → Stale While Revalidate

const CACHE_NAME     = "avaramp-v1";
const API_CACHE      = "avaramp-api-v1";
const OFFLINE_URL    = "/offline.html";

const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg",
];

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(STATIC_ASSETS).catch(() => {/* ignore individual failures */})
    )
  );
  self.skipWaiting();
});

// ── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== API_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, chrome-extension, and dev HMR requests
  if (request.method !== "GET") return;
  if (!url.protocol.startsWith("http")) return;
  if (url.pathname.startsWith("/_next/webpack-hmr")) return;

  // API calls — network first, short cache as fallback
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirstWithTimeout(request, API_CACHE, 5000));
    return;
  }

  // Next.js static chunks — cache first
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, CACHE_NAME));
    return;
  }

  // Everything else (pages, public assets) — stale while revalidate
  event.respondWith(staleWhileRevalidate(request, CACHE_NAME));
});

// ── Strategies ───────────────────────────────────────────────────────────────

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);
  return cached || (await fetchPromise) || new Response("Offline", { status: 503 });
}

async function networkFirstWithTimeout(request, cacheName, timeoutMs) {
  const cache = await caches.open(cacheName);
  try {
    const controller = new AbortController();
    const timeout    = setTimeout(() => controller.abort(), timeoutMs);
    const response   = await fetch(request, { signal: controller.signal });
    clearTimeout(timeout);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || new Response(JSON.stringify({ error: "Offline" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// ── Push notifications (future) ───────────────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || "AvaRamp", {
      body:    data.body || "You have a new payment update.",
      icon:    "/icons/icon-192.svg",
      badge:   "/icons/icon-192.svg",
      tag:     data.tag || "avaramp",
      data:    { url: data.url || "/dashboard" },
      vibrate: [200, 100, 200],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/dashboard";
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
