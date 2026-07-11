// src/lib/matching.js
//
// Remplace le tableau PROFILES codé en dur par de vrais profils venant de
// la base de données, et remplace la fonction like() simulée par un vrai
// like enregistré — avec création automatique du match en base si mutuel
// (géré par le trigger SQL check_mutual_like).

import { supabase } from "./supabaseClient";

// Récupère les profils à afficher dans Découvrir : exclut soi-même, les
// profils déjà likés, et les profils bloqués (dans les deux sens).
export async function fetchDiscoverProfiles(myId, interestedIn) {
  let query = supabase.from("profiles").select("*").neq("id", myId);

  if (interestedIn === "hommes") query = query.eq("gender", "homme");
  if (interestedIn === "femmes") query = query.eq("gender", "femme");

  const { data: profiles, error } = await query;
  if (error) return { error: error.message };

  const { data: myLikes } = await supabase.from("likes").select("to_user").eq("from_user", myId);
  const likedIds = (myLikes || []).map((l) => l.to_user);

  const { data: myBlocks } = await supabase.from("blocks").select("blocked_id").eq("user_id", myId);
  const blockedIds = (myBlocks || []).map((b) => b.blocked_id);

  const filtered = profiles.filter((p) => !likedIds.includes(p.id) && !blockedIds.includes(p.id));
  return { profiles: filtered };
}

// Enregistre un like. Si l'autre personne vous a déjà aimé·e, le trigger SQL
// crée automatiquement le match — on vérifie juste après si c'est le cas.
export async function likeProfile(myId, targetId) {
  const { error } = await supabase.from("likes").insert({ from_user: myId, to_user: targetId });
  if (error) return { error: error.message };

  const { data: match } = await supabase
    .from("matches")
    .select("*")
    .or(`and(user_a.eq.${myId},user_b.eq.${targetId}),and(user_a.eq.${targetId},user_b.eq.${myId})`)
    .maybeSingle();

  return { matched: !!match, match };
}

export async function fetchMyMatches(myId) {
  const { data, error } = await supabase
    .from("matches")
    .select("*, user_a_profile:profiles!matches_user_a_fkey(*), user_b_profile:profiles!matches_user_b_fkey(*)")
    .or(`user_a.eq.${myId},user_b.eq.${myId}`);

  if (error) return { error: error.message };

  // Normalise pour toujours renvoyer "le profil de l'autre personne"
  const matches = data.map((m) => ({
    matchId: m.id,
    profile: m.user_a === myId ? m.user_b_profile : m.user_a_profile,
    createdAt: m.created_at,
  }));
  return { matches };
}

export async function blockProfile(myId, targetId) {
  return supabase.from("blocks").insert({ user_id: myId, blocked_id: targetId });
}

export async function reportProfile(myId, targetId, reason) {
  return supabase.from("reports").insert({ reporter_id: myId, reported_id: targetId, reason });
}
