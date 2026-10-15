/* Llevu · service worker
   Solo sirve para las notificaciones de la versión web: con él, el aviso
   de "nueva solicitud" o "conductor asignado" queda fijo en la pantalla,
   vibra aunque la pestaña esté atrás y al tocarlo trae la app al frente.
   No guarda nada en caché (la app siempre se carga fresca). Tiene que
   estar publicado en la misma carpeta que index.html. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil((async () => {
    const lista = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of lista) {
      if ('focus' in c) return c.focus();
    }
    if (self.clients.openWindow) return self.clients.openWindow(self.registration.scope);
  })());
});
