// src/lib/mediaStorage.js
//
// Remplace le stockage en base64 (limité et non partagé entre appareils)
// par un vrai stockage de fichiers Supabase Storage — nécessaire pour que
// les photos/vidéos/messages vocaux soient visibles par l'autre personne,
// sur son propre appareil.
//
// Prérequis : dans Supabase → Storage, créez un bucket nommé "media"
// (bouton "New bucket"), cochez "Public bucket".

import { supabase } from "./supabaseClient";

export async function uploadMedia(file, folder = "chat") {
  const ext = file.name?.split(".").pop() || "bin";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) return { error: error.message };

  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return { url: data.publicUrl };
}

export async function uploadProfilePhoto(file, userId) {
  const ext = file.name?.split(".").pop() || "jpg";
  const path = `profiles/${userId}.${ext}`;

  const { error } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "3600",
    upsert: true, // écrase l'ancienne photo si l'utilisateur en change
  });
  if (error) return { error: error.message };

  const { data } = supabase.storage.from("media").getPublicUrl(path);

  await supabase.from("profiles").update({ photo_url: data.publicUrl }).eq("id", userId);

  return { url: data.publicUrl };
}
