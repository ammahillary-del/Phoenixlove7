# Guide de déploiement — d'un prototype à un vrai site en ligne

Ce dossier contient les fichiers nécessaires pour qu'PhoenixLove devienne un vrai
site accessible sur Google et installable sur téléphone (sans passer par
l'App Store ni le Play Store). Voici comment les utiliser, dans l'ordre.

## Ce que vous avez déjà
- `phoenixlove-mvp-v7.jsx` — le composant React de l'application
- `manifest.json` — rend le site installable comme une app
- `sw.js` — service worker (fonctionnement hors-ligne basique)
- `index.html` — page principale avec toutes les balises SEO
- `robots.txt` / `sitemap.xml` — pour que Google indexe le site
- `icons/` — toutes les icônes aux bonnes tailles

## Étape 1 — Transformer le prototype en vrai projet
Le fichier `.jsx` doit être intégré dans un vrai projet buildable. Le plus
simple aujourd'hui est **Vite** :

```bash
npm create vite@latest phoenixlove -- --template react
cd phoenixlove
npm install lucide-react
```

Puis :
- Remplacez le contenu de `src/App.jsx` par `phoenixlove-mvp-v7.jsx`
- Remplacez `index.html` à la racine par celui fourni ici
- Copiez `manifest.json`, `sw.js`, `robots.txt`, `sitemap.xml` et le dossier
  `icons/` dans le dossier `public/` de votre projet Vite

## Étape 2 — Remplacer les domaines d'exemple
Dans `index.html`, `robots.txt` et `sitemap.xml`, remplacez
`https://www.exemple-phoenixlove.com` par votre vrai nom de domaine une fois que
vous l'aurez acheté (étape 4).

## Étape 3 — Tester en local
```bash
npm run dev
```
Ouvrez l'adresse indiquée dans le terminal et vérifiez que tout fonctionne.

## Étape 4 — Nom de domaine et hébergement
- **Nom de domaine** : Namecheap, OVH, ou Google Domains (~10€/an)
- **Hébergement** : Vercel ou Netlify (gratuit pour démarrer)
  - Connectez votre compte GitHub, poussez le projet, puis "Import Project"
  - Le site est en ligne en quelques minutes, avec HTTPS automatique
- Reliez ensuite votre nom de domaine à l'hébergeur (les deux ont un guide
  pas-à-pas intégré pour configurer les DNS)

## Étape 5 — Rendre le site trouvable sur Google
1. Créez un compte sur **Google Search Console** (gratuit)
2. Ajoutez votre domaine et vérifiez la propriété
3. Soumettez votre `sitemap.xml`
4. Patientez quelques jours à quelques semaines — Google indexe progressivement

## Étape 6 — Rendre l'app "installable"
Une fois en ligne avec HTTPS, sur téléphone :
- **Android/Chrome** : un bandeau "Ajouter à l'écran d'accueil" apparaît automatiquement
- **iPhone/Safari** : partager → "Sur l'écran d'accueil" (l'utilisateur doit le faire manuellement, Apple ne propose pas de bandeau automatique)

## Ce qui manque encore pour une vraie app de rencontre en production
Ce guide couvre la partie "site visible et installable". Il ne remplace pas :
- Un vrai backend (comptes, base de données, modération de contenu)
- La conformité légale (CGU, politique de confidentialité, RGPD)
- La vérification d'âge réelle
- Le hachage sécurisé des mots de passe côté serveur

Ces points restent nécessaires avant un vrai lancement public.
