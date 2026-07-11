# Mise en place du vrai backend (Supabase) — étape par étape

Cette étape est celle qui transforme PhoenixLove d'une démo en une vraie
application où de vraies personnes peuvent se rencontrer entre elles.
C'est aussi la partie la plus technique — allez-y calmement, une étape à la fois.

## 1. Créer votre projet Supabase (5 minutes)
1. Allez sur [supabase.com](https://supabase.com), créez un compte gratuit
2. "New Project" → donnez un nom (ex: `phoenixlove`) → choisissez un mot de
   passe de base de données (notez-le quelque part) → région proche de vous
3. Attendez 1-2 minutes que le projet soit prêt

## 2. Créer les tables (copier-coller, une fois)
1. Dans votre projet Supabase → **SQL Editor** → **New query**
2. Ouvrez le fichier `supabase/schema.sql` fourni dans ce projet
3. Copiez tout son contenu, collez-le dans l'éditeur SQL de Supabase
4. Cliquez **Run** — toutes vos tables sont créées d'un coup, avec la
   sécurité (chaque personne ne voit que ce qu'elle a le droit de voir)

## 3. Créer le stockage pour les photos/vidéos
1. Dans Supabase → **Storage** → **New bucket**
2. Nom : `media` → cochez **Public bucket** → Create

## 4. Activer la connexion Google (optionnel mais recommandé)
1. Supabase → **Authentication** → **Providers** → activez **Google**
2. Suivez le lien fourni par Supabase pour créer les identifiants Google
   (nécessite un compte Google Cloud, gratuit)

## 5. Récupérer vos clés
1. Supabase → **Settings** → **API**
2. Notez : **Project URL** et la clé **anon public**

## 6. Ajouter ces clés à votre projet
Créez un fichier `.env.local` à la racine du projet (à côté de `package.json`) :
```
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anon-ici
```
Sur Vercel, ajoutez aussi ces deux mêmes variables dans
**Settings → Environment Variables**, puis redéployez.

## 7. Ce qu'il reste à faire dans le code
Les fichiers `src/lib/*.js` fournis contiennent toutes les fonctions prêtes
(inscription, connexion, likes, matchs, messages en temps réel, photos).
Il reste à les **brancher** dans `src/App.jsx` à la place des fonctions
simulées actuelles (le tableau `PROFILES`, `handleAuthSubmit`, `sendMessage`,
etc.). C'est un travail de connexion précis — revenez me voir avec ce projet
et je fais ce branchement avec vous, fonction par fonction, en testant à
chaque étape avec votre vrai projet Supabase.

## Pourquoi je ne l'ai pas déjà fait automatiquement
Parce que je n'ai pas accès à votre projet Supabase réel pour tester que
chaque connexion fonctionne vraiment — livrer 1800 lignes de code
réécrites sans jamais les tester contre votre vraie base de données
risquerait de vous laisser avec des bugs invisibles. Le bon ordre est :
projet Supabase créé → on branche et on teste ensemble, morceau par morceau.
