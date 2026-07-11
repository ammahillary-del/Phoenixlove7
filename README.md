# PhoenixLove — projet complet

Ceci est un projet **Vite + React** prêt à être lancé en local, puis déployé
sur Vercel ou Netlify. Il contient l'application complète (prototype avancé)
ainsi que tous les fichiers nécessaires pour la mettre en ligne un jour comme
un vrai site web.

## Ce que contient ce dossier

```
phoenixlove-project/
├── src/
│   ├── App.jsx          → l'application complète (tout le prototype)
│   ├── main.jsx          → point d'entrée React
│   └── index.css         → styles Tailwind
├── public/
│   ├── manifest.json      → rend le site installable (PWA)
│   ├── sw.js              → service worker (fonctionnement hors-ligne basique)
│   ├── robots.txt         → pour que Google puisse indexer le site
│   ├── sitemap.xml        → pour Google Search Console
│   └── icons/             → toutes les icônes (favicon, PWA, Apple)
├── api/
│   └── notify-admin.js    → fonction serveur pour les alertes Telegram (VIP+)
├── docs/
│   ├── GUIDE-DEPLOIEMENT.md      → comment publier le site étape par étape
│   ├── ARCHITECTURE-BACKEND.md   → comment ajouter un vrai backend plus tard
│   └── TELEGRAM-BOT-SETUP.md     → comment configurer les alertes admin
├── package.json
├── vite.config.js
├── tailwind.config.js
└── index.html
```

## Étape 1 — Installer les outils nécessaires (une seule fois)
Vous avez besoin de **Node.js** installé sur votre ordinateur (gratuit) :
téléchargez-le sur [nodejs.org](https://nodejs.org) (choisissez la version "LTS").

## Étape 2 — Installer le projet
Ouvrez un terminal dans ce dossier, puis :

```bash
npm install
```

Cela télécharge toutes les briques nécessaires (React, Tailwind, les icônes...).

## Étape 3 — Tester en local
```bash
npm run dev
```
Une adresse comme `http://localhost:5173` s'affiche — ouvrez-la dans votre
navigateur pour voir et tester l'application, exactement comme dans nos
échanges, mais chez vous.

## Étape 4 — Mettre en ligne (quand vous êtes prêt)
1. Créez un compte gratuit sur [vercel.com](https://vercel.com) (utilisez votre
   compte GitHub pour vous connecter, c'est le plus simple)
2. Mettez ce dossier sur GitHub (créez un nouveau dépôt, poussez le code)
3. Sur Vercel : "Add New Project" → sélectionnez votre dépôt → "Deploy"
4. Votre site est en ligne en 2 minutes, avec une adresse `https://....vercel.app`
5. Achetez ensuite votre nom de domaine et reliez-le depuis les réglages Vercel

Le détail complet de cette étape est dans `docs/GUIDE-DEPLOIEMENT.md`.

## Étape 5 — Avant de remplacer par votre vrai domaine
Une fois que vous avez acheté votre nom de domaine, remplacez
`phoenixlove.com` par votre vrai domaine dans ces fichiers :
- `index.html` (balises `canonical` et `og:url`)
- `public/robots.txt`
- `public/sitemap.xml`

## Deux points techniques importants à connaître

**`window.storage` → remplacé automatiquement.** L'app utilise à l'origine une
fonction propre à l'aperçu Claude.ai pour mémoriser les données. Le fichier
`src/storage-shim.js` la remplace automatiquement par une version basée sur
`localStorage` dès que le site tourne en dehors de Claude.ai — vous n'avez
rien à faire, c'est déjà en place.

**Traduction en direct → nécessite votre propre clé API.** Le français et
l'anglais fonctionnent toujours, sans réseau. Pour que les autres langues
fonctionnent une fois déployé, créez un compte sur
[console.anthropic.com](https://console.anthropic.com), récupérez une clé API,
ajoutez-la comme variable d'environnement `ANTHROPIC_API_KEY` sur Vercel, et
la fonction `api/translate.js` (déjà prête) prendra le relais automatiquement.

## Ce qui fonctionne déjà (prototype avancé)
- Inscription / connexion (email + boutons Google/Apple simulés)
- Quiz de compatibilité, découverte de profils, matchs
- Messagerie avec photos, vidéos, messages vocaux, appels simulés
- Traduction (français et anglais garantis, autres langues via l'API)
- Mode VIP+, limite de likes quotidienne, statistiques
- Mode sombre/clair, sécurité (signalement, blocage, historique de connexion)

## Ce qui reste à faire pour une vraie mise en production
Ce prototype n'a pas de vrai serveur : les comptes, mots de passe et messages
ne sont pas partagés entre plusieurs vrais utilisateurs sur des appareils
différents (ils restent dans le navigateur de chaque personne). Pour une vraie
app multi-utilisateurs, suivez `docs/ARCHITECTURE-BACKEND.md`.

## Besoin d'aide ?
Revenez avec ce projet dans notre conversation à tout moment — je peux
continuer à corriger, ajouter des fonctionnalités, ou vous aider à connecter
le vrai backend quand vous serez prêt.
