// src/lib/auth.js
//
// Remplace les fonctions handleAuthSubmit/socialLogin/logout simulées
// de App.jsx par de vraies opérations Supabase : mots de passe réellement
// hashés côté serveur, vraies sessions, vrai "se souvenir de moi".

import { supabase } from "./supabaseClient";

export async function signUp({ email, password, gender, interestedIn, ageConfirmed }) {
  if (!ageConfirmed) return { error: "Vous devez confirmer avoir 18 ans ou plus." };

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: error.message };

  // Crée la ligne de profil correspondante
  const { error: profileError } = await supabase.from("profiles").insert({
    id: data.user.id,
    display_name: email.split("@")[0],
    gender,
    interested_in: interestedIn,
  });
  if (profileError) return { error: profileError.message };

  return { user: data.user };
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  return { user: data.user, session: data.session };
}

export async function signInWithGoogle() {
  // Nécessite d'activer le fournisseur Google dans Supabase → Authentication → Providers
  const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
  if (error) return { error: error.message };
  return { ok: true };
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}

// Écoute les changements de connexion (utile pour garder l'état à jour
// automatiquement, y compris la vraie mémorisation de session Supabase)
export function onAuthChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });
  return () => data.subscription.unsubscribe();
}
