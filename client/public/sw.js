/**
 * TUF PANTHER SERVICE WORKER v2.0
 * Handles push notifications, background sync, and Panther alarms.
 *
 * Alarm types:
 *   - morning_check_in: Daily morning motivation from Panther
 *   - pre_workout: X minutes before a scheduled session
 *   - streak_milestone: 7/14/21/30-day streak achievements
 *   - missed_session: Panther accountability message
 */

const CACHE_NAME = "tuf-v2";
const PANTHER_ICON = "/favicon.ico";

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

// ── Push Notification Handler ────────────────────────────────────────────────
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
    icon: data.icon || "/favicon.ico",
    badge: "/favicon.ico",
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
    // Reschedule for 30 minutes later — post message to client
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
      // Focus existing window if open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.focus();
          client.postMessage({ type: "NOTIFICATION_CLICK", data: event.notification.data });
          return;
        }
      }
      // Open new window
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

  // Schedule a local alarm (short-term, < 24h)
  if (event.data?.type === "SCHEDULE_ALARM") {
    const { delay_ms, title, body, alarm_type, tag } = event.data.payload || {};
    if (delay_ms > 0 && delay_ms < 24 * 60 * 60 * 1000) {
      setTimeout(() => {
        self.registration.showNotification(title || "THE PANTHER", {
          body: body || "It's time.",
          icon: PANTHER_ICON,
          badge: PANTHER_ICON,
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

  // Test notification
  if (event.data?.type === "TEST_NOTIFICATION") {
    self.registration.showNotification("PANTHER ALARM TEST", {
      body: "Your alarm system is working. The Panther is watching.",
      icon: PANTHER_ICON,
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
