# Configurer le bot Telegram — étape par étape

## 1. Créer le bot (2 minutes)
1. Ouvrez Telegram, cherchez **@BotFather**
2. Envoyez `/newbot`, choisissez un nom (ex: "PhoenixLove Admin") puis un nom d'utilisateur se terminant par "bot" (ex: `phoenixlove_admin_bot`)
3. BotFather vous donne un **token** — ressemble à `123456789:AAExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
4. Gardez-le secret, ne le partagez jamais publiquement

## 2. Récupérer votre chat ID
1. Cherchez votre bot par son nom sur Telegram et cliquez "Démarrer" / envoyez-lui n'importe quel message
2. Ouvrez cette adresse dans un navigateur (remplacez TOKEN par le vôtre) :
   `https://api.telegram.org/botTOKEN/getUpdates`
3. Cherchez `"chat":{"id":123456789` dans la réponse — ce nombre est votre **chat ID**

## 3. Ajouter les deux secrets sur Vercel
1. Dans votre projet Vercel → Settings → Environment Variables
2. Ajoutez :
   - `TELEGRAM_BOT_TOKEN` = le token de l'étape 1
   - `TELEGRAM_CHAT_ID` = le chat ID de l'étape 2
3. Redéployez le projet pour que les variables soient prises en compte

## 4. Placer le fichier serveur
Copiez `api-notify-admin.js` dans un dossier `/api/notify-admin.js` à la racine
de votre projet Vite (Vercel le transforme automatiquement en vraie route).

## 5. Tester
Une fois déployé, faites une demande VIP+ sur votre site — vous devriez recevoir
un message Telegram en quelques secondes.

## Ce qui se passe en attendant (dans le prototype actuel)
Tant que ce serveur n'existe pas, l'app essaie silencieusement d'appeler
`/api/notify-admin`, échoue sans bloquer l'utilisateur, et continue à
fonctionner comme avant (stockage local + notification navigateur si activée).
Rien à changer de votre côté avant d'avoir un vrai déploiement.
