// src/storage-shim.js
//
// Dans l'aperçu Claude.ai, `window.storage` existe déjà et gère la
// persistance. Une fois ce projet déployé comme vrai site web, cette API
// n'existe plus — sans ce fichier, toute la mémorisation (comptes,
// conversations, préférences) s'arrêterait de fonctionner silencieusement.
//
// Ce fichier ajoute une version compatible de `window.storage`, basée sur
// `localStorage` (disponible nativement dans tous les navigateurs), mais
// UNIQUEMENT si `window.storage` n'existe pas déjà — donc sans effet dans
// l'aperçu Claude.ai lui-même.

if (typeof window !== "undefined" && !window.storage) {
  window.storage = {
    async get(key) {
      const raw = localStorage.getItem(key);
      if (raw === null) {
        // Comportement identique à l'API Claude.ai : une clé absente lève une erreur.
        throw new Error("Clé introuvable");
      }
      return { key, value: raw };
    },
    async set(key, value) {
      localStorage.setItem(key, String(value));
      return { key, value };
    },
    async delete(key) {
      localStorage.removeItem(key);
      return { key, deleted: true };
    },
    async list(prefix = "") {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith(prefix));
      return { keys };
    },
  };
}
