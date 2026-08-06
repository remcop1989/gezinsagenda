/* Service worker voor de Gezinsagenda.
   Zorgt dat de app (en het laatst-gesyncte scherm) ook opent zonder internet.
   Live Firestore/Auth-verkeer wordt hier bewust NIET onderschept — dat regelt
   de Firestore SDK zelf (incl. eigen offline-cache en automatische sync). */

const CACHE_NAME = 'gezinsagenda-cache-v3';
const APP_SHELL = ['./', './index.html'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = req.url;
  // Laat live Firestore- en Auth-verkeer altijd rechtstreeks over het netwerk lopen.
  if (
    url.includes('firestore.googleapis.com') ||
    url.includes('identitytoolkit.googleapis.com') ||
    url.includes('securetoken.googleapis.com')
  ) {
    return;
  }

  // Firebase SDK-bestanden staan met versienummer in de URL (gstatic.com/firebasejs/<versie>/...):
  // die veranderen nooit stiekem, dus die mogen we gerust cache-eerst serveren.
  const isPinnedAsset = url.includes('gstatic.com/firebasejs/');
  if (isPinnedAsset) {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).then((res) => {
        if (res && res.status === 200) {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        }
        return res;
      }))
    );
    return;
  }

  // Alles van onszelf (de app zelf, lettertypen, iconen): eerst het netwerk proberen,
  // zodat updates na een nieuwe deploy meteen zichtbaar zijn. Alleen bij écht geen
  // internet valt dit terug op de laatst opgeslagen versie.
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200) {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});

// Klik op een melding -> open (of focus) de app.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientsArr) => {
      if (clientsArr.length > 0) return clientsArr[0].focus();
      return self.clients.openWindow('./');
    })
  );
});
