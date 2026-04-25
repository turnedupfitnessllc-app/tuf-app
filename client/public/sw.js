/**
 * TUF PANTHER SERVICE WORKER v3.0 — PWA Edition
 * Handles push notifications, background sync, offline caching, and Panther alarms.
 */

const CACHE_NAME = "tuf-v3";
const PANTHER_ICON = "/icon-192.png";
const PANTHER_BADGE = "/icon-192.png";

const PRECACHE_ASSETS = [
  "/",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];

// ── Install ───────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => clients.claim())
  );
});

// ── Fetch (cache-first for static assets) ────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok && url.pathname.match(/\.(png|ico|webp|svg|json)$/)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});

// ── Push Notification Handler ─────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: "PANTHER", body: event.data ? event.data.text() : "Time to train." };
  }

  const title = data.title || "🐾 PANTHER";
  const options = {
    body: data.body || "Your training session is waiting.",
    icon: data.icon || PANTHER_ICON,
    badge: PANTHER_BADGE,
    tag: data.tag || "tuf-notification",
    renotify: true,
    requireInteraction: data.requireInteraction || false,
    data: {
      url: data.url || "/",
      type: data.type || "general",
    },
    actions: data.actions || [
      { action: "open", title: "LET'S GO" },
      { action: "snooze", title: "30 min" },
    ],
    vibrate: [200, 100, 200, 100, 400],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ── Notification Click Handler ────────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "snooze") {
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        for (const client of clientList) {
          client.postMessage({ type: "SNOOZE_NOTIFICATION", minutes: 30, originalData: event.notification.data });
        }
      })
    );
    return;
  }

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.focus();
          client.postMessage({ type: "NOTIFICATION_CLICK", data: event.notification.data });
          return;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// ── Message Handler (from app) ────────────────────────────────────────────────
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }

  if (event.data?.type === "SCHEDULE_ALARM") {
    const { delay_ms, title, body, alarm_type, tag } = event.data.payload || {};
    if (delay_ms > 0 && delay_ms < 24 * 60 * 60 * 1000) {
      setTimeout(() => {
        self.registration.showNotification(title || "THE PANTHER", {
          body: body || "It's time.",
          icon: PANTHER_ICON,
          badge: PANTHER_BADGE,
          tag: tag || alarm_type || "tuf-alarm",
          vibrate: [200, 100, 200, 100, 400],
          requireInteraction: true,
          data: { type: alarm_type, url: "/schedule" },
          actions: [
            { action: "open", title: "OPEN APP" },
            { action: "snooze", title: "Snooze 10 min" },
          ],
        });
      }, delay_ms);
    }
    return;
  }

  if (event.data?.type === "TEST_NOTIFICATION") {
    self.registration.showNotification("🐾 PANTHER ALARM", {
      body: "Your alarm system is working. The Panther is watching.",
      icon: PANTHER_ICON,
      badge: PANTHER_BADGE,
      tag: "test",
      vibrate: [200, 100, 400],
      requireInteraction: false,
    });
    return;
  }
});

// ── Background Sync ───────────────────────────────────────────────────────────
self.addEventListener("sync", (event) => {
  if (event.tag === "panther-alarm-sync") {
    // Future: sync alarm schedules with server when back online
  }
});
