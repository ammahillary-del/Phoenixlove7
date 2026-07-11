// src/lib/supabaseClient.js
//
// Point de connexion unique entre l'app et Supabase.
// Les deux valeurs ci-dessous viennent de : Supabase → Settings → API
// Elles sont "publiques" côté client (contrairement à la clé "service role",
// qui elle ne doit JAMAIS apparaître dans le code du site).

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Variables VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY manquantes. " +
    "Ajoutez-les dans un fichier .env.local à la racine du projet."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
