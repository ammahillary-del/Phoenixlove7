// Service worker minimal pour PhoenixLove
// Objectif : rendre l'app installable et lui donner un comportement correct
// hors-ligne pour les fichiers statiques (pas pour les appels API dynamiques,
// qui nécessitent toujours une connexion).

const CACHE_NAME = "phoenixlove-cache-v1";
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Ne pas intercepter les appels vers l'API (traduction, etc.) : ils doivent
  // toujours passer par le réseau, jamais par le cache.
  if (event.request.url.includes("api.anthropic.com")) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).catch(() => {
          // Hors-ligne et pas en cache : on ne bloque pas silencieusement,
          // le navigateur affichera son message d'erreur réseau standard.
          return new Response("Hors ligne. Reconnectez-vous pour continuer.", {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        })
      );
    })
  );
});
