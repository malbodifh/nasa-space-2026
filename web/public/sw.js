// Service worker mínimo: permite mostrar avisos también en celulares y abrir la app al tocarlos.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
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
