// src/lib/messages.js
//
// Remplace la messagerie simulée (stockée localement) par de vrais messages
// partagés en base de données, avec réception instantanée grâce à
// Supabase Realtime — c'est ce qui permet à deux vraies personnes sur deux
// appareils différents de se parler pour de vrai.

import { supabase } from "./supabaseClient";

export async function fetchMessages(matchId) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("match_id", matchId)
    .order("created_at", { ascending: true });
  if (error) return { error: error.message };
  return { messages: data };
}

export async function sendMessage(matchId, senderId, { type, content, callKind, callStatus, callDuration }) {
  const { data, error } = await supabase.from("messages").insert({
    match_id: matchId,
    sender_id: senderId,
    type,
    content,
    call_kind: callKind || null,
    call_status: callStatus || null,
    call_duration: callDuration || null,
  }).select().single();
  if (error) return { error: error.message };
  return { message: data };
}

export async function editMessage(messageId, newContent) {
  return supabase.from("messages").update({ content: newContent, edited: true }).eq("id", messageId);
}

export async function deleteMessage(messageId) {
  return supabase.from("messages").update({ deleted: true, content: "" }).eq("id", messageId);
}

export async function markAsRead(messageId) {
  return supabase.from("messages").update({ read_at: new Date().toISOString() }).eq("id", messageId);
}

// S'abonne aux nouveaux messages d'un match en temps réel.
// Utilisation dans un composant React :
//   useEffect(() => {
//     const unsubscribe = subscribeToMessages(matchId, (newMsg) => { ... });
//     return unsubscribe;
//   }, [matchId]);
export function subscribeToMessages(matchId, onNewMessage) {
  const channel = supabase
    .channel(`messages:${matchId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `match_id=eq.${matchId}` },
      (payload) => onNewMessage(payload.new)
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "messages", filter: `match_id=eq.${matchId}` },
      (payload) => onNewMessage(payload.new)
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}
