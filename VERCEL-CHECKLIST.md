# Checklist Vercel — tout ce qu'il faut faire, dans l'ordre

## Étape 1 — Mettre le projet sur GitHub
1. [github.com](https://github.com) → créer un compte gratuit si pas déjà fait
2. "+" en haut → **New repository** → nom : `phoenixlove` → **Create repository**
3. Sur la page qui suit, cliquez le lien **"uploading an existing file"**
4. Glissez tout le contenu du dossier dézippé (`src`, `public`, `api`, `docs`,
   `supabase`, et les fichiers à la racine comme `package.json`)
5. En bas de page : **Commit changes**

## Étape 2 — Créer le projet sur Vercel
1. [vercel.com](https://vercel.com) → **Continue with GitHub**
2. **Add New** → **Project**
3. Sélectionnez le dépôt `phoenixlove` → **Import**
4. Laissez les réglages par défaut (Vercel détecte Vite automatiquement)
5. **Ne cliquez pas encore sur Deploy** — allez d'abord à l'étape 3 ci-dessous
   pour ajouter les variables d'environnement (sinon il faudra redéployer après)

## Étape 3 — Ajouter les variables d'environnement
Toujours sur cette page d'import (section **"Environment Variables"**), ou
plus tard dans **Settings → Environment Variables**, ajoutez celles-ci une par une :

| Nom exact | Valeur | Obligatoire ? |
|---|---|---|
| `VITE_SUPABASE_URL` | votre URL de projet Supabase | Oui, dès que Supabase est prêt |
| `VITE_SUPABASE_ANON_KEY` | votre clé "anon public" Supabase | Oui, dès que Supabase est prêt |
| `TELEGRAM_BOT_TOKEN` | token reçu de @BotFather | Optionnel (alertes VIP+) |
| `TELEGRAM_CHAT_ID` | votre chat ID Telegram | Optionnel (alertes VIP+) |
| `ANTHROPIC_API_KEY` | clé depuis console.anthropic.com | Optionnel (traduction multilingue) |

Si vous n'avez pas encore fait Supabase, sautez ces deux-là pour l'instant —
le site fonctionnera quand même en mode démo, vous les ajouterez après.

## Étape 4 — Déployer
1. Cliquez **Deploy**
2. Attendez 1-2 minutes → une adresse `https://phoenixlove-xxxx.vercel.app` apparaît
3. Ouvrez-la, testez que l'app se charge correctement

## Étape 5 — Ajouter votre nom de domaine (une fois acheté)
1. Projet Vercel → **Settings** → **Domains**
2. Entrez votre domaine (ex: `phoenixlove.com`) → **Add**
3. Vercel affiche 1 ou 2 lignes à copier chez votre registrar (Namecheap, OVH...)
4. Collez-les dans les réglages DNS de votre registrar
5. Patientez de quelques minutes à quelques heures

## Étape 6 — À chaque fois que vous ajoutez/changez une variable
Les variables ne sont prises en compte qu'au moment du déploiement. Après en
avoir ajouté une nouvelle :
1. Onglet **Deployments**
2. Les trois points "···" sur le déploiement le plus récent
3. **Redeploy**

## Étape 7 — Vérifier que tout fonctionne (dans l'ordre)
- [ ] Le site s'ouvre sur l'adresse Vercel, puis sur votre domaine
- [ ] Inscription/connexion fonctionne
- [ ] Le quiz et Découvrir s'affichent
- [ ] Si Supabase est branché : un like entre deux comptes différents crée un vrai match
- [ ] Si Telegram est configuré : une demande VIP+ envoie bien une alerte
- [ ] Le site est soumis sur Google Search Console (sitemap déjà inclus)

## À retenir
- Chaque fois que vous modifiez le code sur GitHub, Vercel republie le site automatiquement — vous n'avez rien à refaire manuellement
- Les variables d'environnement (le tableau de l'étape 3) sont les seules "clés secrètes" à gérer ; tout le reste est déjà dans le code fourni
