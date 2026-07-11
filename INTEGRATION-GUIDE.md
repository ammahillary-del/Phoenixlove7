# Intégration réelle — remplacer les fonctions simulées par les vraies

Ce guide donne le code exact à coller dans `src/App.jsx`, fonction par
fonction. Faites-le dans l'ordre — chaque section peut être testée
séparément avant de passer à la suivante.

**Prérequis** : avoir terminé `docs/SUPABASE-SETUP.md` jusqu'à l'étape 6
(projet créé, schéma collé, clés ajoutées dans `.env.local` et sur Vercel).

---

## 1. Importer les nouveaux modules

En haut de `src/App.jsx`, ajoutez :

```jsx
import { supabase } from "./lib/supabaseClient";
import { signUp, signIn, signOut, getCurrentUser, onAuthChange } from "./lib/auth";
import { fetchDiscoverProfiles, likeProfile, fetchMyMatches, blockProfile, reportProfile } from "./lib/matching";
import { fetchMessages, sendMessage as sendMessageReal, editMessage as editMessageReal, deleteMessage as deleteMessageReal, markAsRead, subscribeToMessages } from "./lib/messages";
import { uploadMedia, uploadProfilePhoto } from "./lib/mediaStorage";
```

## 2. Détecter la session au chargement de l'app

Ajoutez cet effet tout en haut du composant `App()`, juste après les
déclarations de state existantes :

```jsx
const [currentUser, setCurrentUser] = useState(null);

useEffect(() => {
  getCurrentUser().then((user) => {
    if (user) { setCurrentUser(user); setAuthed(true); setScreen("app"); }
  });
  const unsubscribe = onAuthChange((user) => {
    setCurrentUser(user);
    if (!user) { setAuthed(false); setScreen("auth"); }
  });
  return unsubscribe;
}, []);
```

Ceci remplace la logique de "remember me" maison : Supabase gère maintenant
une vraie session sécurisée automatiquement.

## 3. Remplacer `handleAuthSubmit`

```jsx
async function handleAuthSubmit() {
  setAuthError("");
  const emailOk = /\S+@\S+\.\S+/.test(email);
  if (!emailOk) { setAuthError("Adresse email invalide."); return; }
  if (password.length < 8) { setAuthError("Le mot de passe doit contenir au moins 8 caractères."); return; }

  if (authMode === "signup") {
    if (password !== confirmPassword) { setAuthError("Les mots de passe ne correspondent pas."); return; }
    if (!ageConfirmed) { setAuthError("Vous devez confirmer avoir 18 ans ou plus."); return; }
    if (!termsAccepted) { setAuthError("Vous devez accepter les conditions d'utilisation."); return; }
    if (!myGender) { setAuthError("Merci d'indiquer votre genre."); return; }

    const { error, user } = await signUp({ email, password, gender: myGender, interestedIn, ageConfirmed });
    if (error) { setAuthError(error); return; }
    setCurrentUser(user);
    setAuthed(true);
    setScreen("intro");
    setShowWelcome(true);
    pushLoginHistory("Nouveau compte (email)");
  } else {
    const { error, user } = await signIn({ email, password });
    if (error) { setAuthError(error); return; }
    setCurrentUser(user);
    setAuthed(true);
    setScreen("intro");
    pushLoginHistory("Email");
  }
}
```

## 4. Remplacer `logout`

```jsx
async function logout() {
  await signOut();
  setAuthed(false); setScreen("auth"); setLogoutConfirm(false);
  setEmail(""); setPassword(""); setConfirmPassword("");
}
```

## 5. Charger les vrais profils dans Découvrir

Remplacez `const [queue, setQueue] = useState(PROFILES);` par :

```jsx
const [queue, setQueue] = useState([]);

useEffect(() => {
  if (!currentUser) return;
  fetchDiscoverProfiles(currentUser.id, interestedIn).then(({ profiles, error }) => {
    if (!error) setQueue(profiles || []);
  });
}, [currentUser, interestedIn]);
```

**Note importante** : les vrais profils venant de la base n'ont pas les
champs `timezone`, `lat`, `lon`, `lang`, `greeting` utilisés par les
fonctionnalités de démo (heure locale, distance, traduction de bienvenue).
Pour l'instant, désactivez ces affichages pour les vrais profils (un simple
`profile.timezone && (...)` autour de chaque bloc concerné évite les erreurs),
ou ajoutez ces colonnes à la table `profiles` si vous voulez les garder.

## 6. Remplacer `like()`

```jsx
async function like() {
  if (!current) return;
  const { matched, error } = await likeProfile(currentUser.id, current.id);
  if (error) { flash("Erreur : " + error); return; }
  recordStat("likes");
  if (matched) {
    const entry = { profile: current, revealed: false, messages: [], unread: 0 };
    setMatches((m) => [...m, entry]);
    setMatchOverlay(entry);
    recordStat("matches");
  } else {
    flash(`Vous avez aimé ${current.display_name}`);
  }
  setQueue((q) => q.slice(1));
}
```

## 7. Charger les vrais matchs

```jsx
useEffect(() => {
  if (!currentUser) return;
  fetchMyMatches(currentUser.id).then(({ matches: real, error }) => {
    if (!error) {
      setMatches(real.map((m) => ({
        matchId: m.matchId,
        profile: m.profile,
        revealed: true,
        messages: [],
        unread: 0,
      })));
    }
  });
}, [currentUser]);
```

## 8. Charger + écouter les messages en temps réel dans le chat

Dans `ChatScreen`, remplacez le chargement local par :

```jsx
useEffect(() => {
  fetchMessages(activeMatch.matchId).then(({ messages: real }) => setLocalMessages(real || []));
  const unsubscribe = subscribeToMessages(activeMatch.matchId, (newMsg) => {
    setLocalMessages((prev) => {
      const exists = prev.some((m) => m.id === newMsg.id);
      return exists ? prev.map((m) => (m.id === newMsg.id ? newMsg : m)) : [...prev, newMsg];
    });
  });
  return unsubscribe;
}, [activeMatch.matchId]);
```

## 9. Remplacer `sendMessage`

```jsx
async function handleSend(msg) {
  const { error } = await sendMessageReal(activeMatch.matchId, currentUser.id, msg);
  if (error) flash("Erreur d'envoi : " + error);
  // Pas besoin de mettre à jour l'état manuellement : l'abonnement temps réel
  // (étape 8) reçoit automatiquement le message que vous venez d'envoyer.
}
```

## 10. Remplacer l'upload de photo de profil

```jsx
const file = e.target.files?.[0];
if (!file) return;
const { url, error } = await uploadProfilePhoto(file, currentUser.id);
if (error) { flash("Erreur d'upload : " + error); return; }
setMyPhoto(url);
```

Et pour les photos/vidéos envoyées dans le chat, remplacez la conversion
base64 par :
```jsx
const { url, error } = await uploadMedia(file, "chat");
if (!error) onSend({ type: "image", content: url });
```

---

## Testez dans cet ordre précis
1. Créez deux comptes différents (deux emails différents, ou deux navigateurs)
2. Compte A like le profil du compte B, et inversement → un match doit apparaître pour les deux
3. Envoyez un message depuis le compte A → il doit apparaître **instantanément** côté compte B, sans recharger la page

Si une étape ne fonctionne pas comme prévu, revenez avec le message d'erreur
exact affiché (regardez la console du navigateur : clic droit → Inspecter →
onglet Console) et je vous aide à corriger précisément ce point.
