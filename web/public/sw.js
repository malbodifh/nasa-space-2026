// Service worker: recibe avisos push aunque la página esté cerrada y abre la app al tocarlos.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Memoria de Fuego", body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "Memoria de Fuego";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "",
      tag: data.tag || undefined,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      lang: data.lang || "es",
      renotify: Boolean(data.tag),
      data: { href: data.href || "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const href = (event.notification.data && event.notification.data.href) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ("focus" in client) {
          client.focus();
          if (href !== "/" && "navigate" in client) client.navigate(href);
          return;
        }
      }
      return self.clients.openWindow(href);
    }),
  );
});
