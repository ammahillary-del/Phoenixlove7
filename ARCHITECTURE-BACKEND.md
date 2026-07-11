# Architecture backend — passer du prototype à une vraie app

## Le choix le plus important : ne codez pas tout à la main

Pour une personne seule (ou une petite équipe) qui lance une app de rencontre,
construire un backend "from scratch" (serveur Node.js + base de données +
authentification + stockage) est le chemin le plus long et le plus risqué en
sécurité. La bonne pratique aujourd'hui est d'utiliser un **BaaS**
(Backend-as-a-Service) qui gère déjà, de façon sécurisée et testée par
des milliers d'apps :

**Recommandation : Supabase** (open source, gratuit pour démarrer)
- Authentification réelle (email/mot de passe hashé, Google, Apple)
- Base de données PostgreSQL réelle
- Stockage de fichiers (photos, vidéos, audio) avec règles d'accès
- Temps réel (pour que les messages arrivent instantanément)
- Fonctions serveur ("Edge Functions") pour appeler l'API Claude côté serveur

Alternative équivalente : **Firebase** (Google). Les deux conviennent très
bien à une app de rencontre en phase de lancement.

## Pourquoi pas l'API Claude directement depuis le navigateur en production
Dans le prototype actuel, la traduction appelle l'API depuis le navigateur —
c'est très bien pour une démo, mais en production il faut que cet appel passe
par **votre serveur** (une Edge Function Supabase, par exemple), qui garde la
clé API secrète et peut appliquer des limites (éviter qu'une personne
malveillante épuise votre quota).

## Schéma de base de données (simplifié)

```
users
  id, email, password_hash, created_at, age_verified, is_verified

profiles
  user_id, display_name, bio, birthdate, gender, tags (liste de valeurs)

photos
  id, user_id, url, is_primary, moderation_status

likes
  id, from_user_id, to_user_id, created_at

matches
  id, user_a_id, user_b_id, created_at, is_active

messages
  id, match_id, sender_id, type (text/image/video/audio/call), content, created_at, read_at

reports
  id, reporter_id, reported_id, reason, created_at, status

blocks
  id, user_id, blocked_user_id, created_at
```

## Sécurité — non négociable pour une app de rencontre
- Mots de passe : **jamais stockés en clair**, toujours hashés (Supabase/Firebase le font automatiquement avec bcrypt/argon2)
- Photos : modération automatique avant publication (détection de nudité/violence) — des services comme AWS Rekognition ou Sightengine font ça pour quelques centimes par image
- Vérification d'âge : a minima une case à cocher + date de naissance vérifiée ; certains pays demandent plus (vérification d'identité) pour les apps de rencontre
- Chiffrement en transit : HTTPS partout (automatique avec Vercel/Netlify/Supabase)
- Limitation de débit (rate limiting) sur les tentatives de connexion, pour empêcher le brute-force

## Plan par phases (réaliste, dans l'ordre)

**Phase 1 — Fondations (2-4 semaines pour une personne)**
- Authentification réelle (Supabase Auth)
- Profils + quiz + affichage des matchs
- Messages texte en base de données (persistants pour de vrai, pour tout le monde)

**Phase 2 — Médias**
- Upload de photos/vidéos vers Supabase Storage
- Modération automatique des photos avant affichage

**Phase 3 — Temps réel**
- Messages instantanés (Supabase Realtime ou WebSocket)
- Notifications push (nouveau match, nouveau message)

**Phase 4 — Confiance et sécurité**
- Signalement/blocage connectés à une vraie file de modération (même basique : un tableau que vous consultez à la main au début)
- Historique de connexion réel, alertes de connexion suspecte

**Phase 5 — Appels et monétisation (si vous allez jusque-là)**
- Vrais appels audio/vidéo : un service comme Daily.co ou Twilio Video gère la partie WebRTC compliquée pour vous
- Abonnement "illimité" avec un vrai système de paiement (Stripe)

## Budget indicatif pour démarrer
- Supabase : gratuit jusqu'à ~50 000 utilisateurs actifs/mois dans la plupart des cas
- Hébergement (Vercel/Netlify) : gratuit au départ
- Nom de domaine : ~10€/an
- Modération photo : quelques centimes par image, donc négligeable au démarrage
- Total réaliste pour lancer : **quasiment 0€**, jusqu'à ce que vous ayez une vraie base d'utilisateurs

## Ce que je ne peux pas faire à votre place
Je peux vous aider à écrire le code de chaque étape (par exemple, connecter
Supabase à ce prototype React), mais la création de comptes (Supabase,
Vercel, nom de domaine), les décisions légales, et les tests avec de vrais
utilisateurs restent des actions que vous devez faire vous-même.
