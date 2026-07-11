import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  Heart, X, Sparkles, ArrowRight, MessageCircle, Send, RotateCcw,
  Compass, User, Image as ImageIcon, Video as VideoIcon, Mic, Square,
  ShieldCheck, MoreVertical, Flag, Ban, CheckCircle2, ChevronLeft,
  Info, BadgeCheck, Phone, PhoneOff, Globe, MapPin, Clock,
  Mail, Lock, Eye, EyeOff, LogOut, Trash2, ShieldAlert
} from "lucide-react";

/* =========================================================
   AFFINITÉ v3 — MVP structuré
   Nouveautés : appels audio/vidéo (démo locale), traduction
   automatique des messages (via l'API Claude), heure locale
   des deux personnes en temps réel, partage de position
   avec consentement explicite.

   IMPORTANT — prototype front-end :
   - Les "appels" affichent votre propre caméra/micro pour la
     démo, mais il n'y a pas de vraie connexion à une autre
     personne : ça demande un serveur de signalisation (WebRTC)
     qui n'existe pas ici.
   - La traduction, elle, est réelle : chaque clic appelle l'API
     Claude et renvoie une vraie traduction.
   - La position n'est utilisée que localement, jamais envoyée
     à un serveur, et seulement après action explicite.
========================================================= */

const QUESTIONS = [
  { q: "Un dimanche parfait ressemble à...", opts: [
    { label: "Randonnée et grand air", tag: "Nature" },
    { label: "Brunch puis expo", tag: "Culture" },
    { label: "Canapé, film, rien d'autre", tag: "Casanier" },
    { label: "Sport puis sortie entre amis", tag: "Sport" },
  ]},
  { q: "Dans 5 ans, tu te vois plutôt...", opts: [
    { label: "À construire un projet ambitieux", tag: "Ambitieux" },
    { label: "Établi·e, entouré·e de proches", tag: "Famille" },
    { label: "Libre de partir n'importe où", tag: "Liberté" },
    { label: "Serein·e, peu importe où", tag: "Zen" },
  ]},
  { q: "Ce qui te fait vraiment rire...", opts: [
    { label: "L'humour absurde", tag: "Humour" },
    { label: "Les private jokes qui durent des années", tag: "Humour" },
    { label: "Rien, je suis très sérieux·se", tag: "Discipline" },
    { label: "L'auto-dérision", tag: "Humour" },
  ]},
  { q: "Ton rapport à la nourriture...", opts: [
    { label: "Je cuisine, je teste, j'explore", tag: "Gastronomie" },
    { label: "Un bon resto = un bon rencard", tag: "Gastronomie" },
    { label: "Fonctionnel, je mange pour vivre", tag: "Discipline" },
    { label: "Peu importe si la compagnie est bonne", tag: "Zen" },
  ]},
  { q: "Face à un imprévu de voyage...", opts: [
    { label: "J'adore, ça fait l'aventure", tag: "Aventurier" },
    { label: "Je gère, tableau Excel en tête", tag: "Analytique" },
    { label: "Ça me stresse un peu", tag: "Discipline" },
    { label: "Je rentre, j'ai besoin de repères", tag: "Casanier" },
  ]},
  { q: "Ton énergie créative sort par...", opts: [
    { label: "La musique, l'écriture, l'image", tag: "Créatif" },
    { label: "Résoudre des problèmes complexes", tag: "Analytique" },
    { label: "Le sport et le mouvement", tag: "Sport" },
    { label: "Elle ne sort pas beaucoup, et alors", tag: "Zen" },
  ]},
  { q: "Le week-end, ta ville idéale c'est...", opts: [
    { label: "Une grande ville qui bouge", tag: "Urbain" },
    { label: "Un coin paumé sans réseau", tag: "Nature" },
    { label: "Peu importe, avec les bonnes personnes", tag: "Famille" },
    { label: "Une capitale culturelle", tag: "Culture" },
  ]},
  { q: "Ta relation à la spiritualité / au sens...", opts: [
    { label: "Ça compte beaucoup pour moi", tag: "Spiritualité" },
    { label: "Je préfère la raison aux croyances", tag: "Analytique" },
    { label: "En recherche, sans certitude", tag: "Spiritualité" },
    { label: "Pas vraiment un sujet pour moi", tag: "Zen" },
  ]},
];

const PROFILES = [
  { id: 1, name: "Camille", age: 29, gradient: "from-amber-400 to-rose-500", verified: true, gender: "femme",
    tags: ["Nature", "Créatif", "Zen", "Culture", "Aventurier"], lang: "en", langLabel: "anglais",
    city: "Lisbonne", timezone: "Europe/Lisbon", lat: 38.72, lon: -9.14,
    bio: "Céramiste le week-end, toujours partante pour un sentier sans nom.", mutual: true,
    greeting: "Hey! So happy we matched 😊 What's the story behind your love of nature?" },
  { id: 2, name: "Younes", age: 32, gradient: "from-teal-400 to-emerald-600", verified: false, gender: "homme",
    tags: ["Analytique", "Ambitieux", "Urbain", "Discipline", "Sport"], lang: "ar", langLabel: "arabe",
    city: "Dubaï", timezone: "Asia/Dubai", lat: 25.2, lon: 55.27,
    bio: "Ingénieur le jour, coureur de fond à l'aube. J'aime les plans qui tiennent.", mutual: false,
    greeting: "مرحباً! سعيد جداً بهذا التطابق 😊 حدثني عن نفسك؟" },
  { id: 3, name: "Léa", age: 27, gradient: "from-fuchsia-400 to-purple-600", verified: true, gender: "femme",
    tags: ["Humour", "Gastronomie", "Culture", "Créatif", "Aventurier"], lang: "es", langLabel: "espagnol",
    city: "Madrid", timezone: "Europe/Madrid", lat: 40.42, lon: -3.70,
    bio: "Je juge un premier date à la qualité du dessert partagé.", mutual: true,
    greeting: "¡Hola! Qué alegría este match 😊 ¿Cuál fue tu último buen postre?" },
  { id: 4, name: "Nadia", age: 31, gradient: "from-sky-400 to-indigo-600", verified: false, gender: "femme",
    tags: ["Spiritualité", "Zen", "Nature", "Famille", "Humour"], lang: "en", langLabel: "anglais",
    city: "Toronto", timezone: "America/Toronto", lat: 43.65, lon: -79.38,
    bio: "Prof de yoga, grande sœur de trois enfants, jamais pressée.", mutual: false,
    greeting: "Hi! So glad we matched. What's been keeping you grounded lately?" },
  { id: 5, name: "Thomas", age: 30, gradient: "from-orange-400 to-red-500", verified: true, gender: "homme",
    tags: ["Ambitieux", "Sport", "Discipline", "Urbain", "Analytique"], lang: "de", langLabel: "allemand",
    city: "Berlin", timezone: "Europe/Berlin", lat: 52.52, lon: 13.40,
    bio: "Startup le jour, escalade le soir. J'aime qu'on me challenge.", mutual: true,
    greeting: "Hallo! Freut mich, dass wir gematcht haben 😊 Was war dein letztes Abenteuer?" },
];

const REPLIES = {
  en: (t) => `Haha I love that! We both like ${t} by the way 😊`,
  ar: (t) => `هذا رائع! نتشارك في ${t} أيضاً 😊`,
  es: (t) => `¡Me encanta! Por cierto, a los dos nos gusta ${t} 😊`,
  de: (t) => `Das liebe ich! Wir mögen beide ${t} übrigens 😊`,
  fr: () => "Raconte-moi en plus !",
};

// Traductions françaises précalculées : garantissent que "Traduire" fonctionne
// toujours pour le contenu simulé, même sans réseau ou si l'API est indisponible.
const REPLIES_FR = {
  en: (t) => `Haha j'adore ! On aime tous les deux ${t} au fait 😊`,
  ar: (t) => `C'est génial ! On partage aussi ${t} 😊`,
  es: (t) => `J'adore ! Au fait, on aime tous les deux ${t} 😊`,
  de: (t) => `J'aime beaucoup ! On aime tous les deux ${t}, au fait 😊`,
  fr: () => "Raconte-moi en plus !",
};

const GREETINGS_FR = {
  1: "Hey ! Trop content·e qu'on ait matché 😊 Raconte-moi, d'où vient ton amour de la nature ?",
  2: "Salut ! Très content de ce match 😊 Parle-moi un peu de toi ?",
  3: "Salut ! Quelle joie ce match 😊 C'était quoi ton dernier bon dessert ?",
  4: "Salut ! Ravie qu'on ait matché. Qu'est-ce qui t'apaise en ce moment ?",
  5: "Salut ! Content qu'on ait matché 😊 C'était quoi ta dernière aventure ?",
};

// Anglais précalculé aussi : seule une traduction ar/es/de -> en a du sens ici,
// puisque les profils déjà en anglais (Camille, Nadia) n'affichent pas de
// bouton "traduire en anglais" (langue source = langue cible).
const GREETINGS_EN = {
  2: "Hi! Really happy about this match 😊 Tell me about yourself?",
  3: "Hi! What a joy this match is 😊 What was your last good dessert?",
  5: "Hi! Glad we matched 😊 What was your last adventure?",
};
const REPLIES_EN = {
  ar: (t) => `That's great! We both like ${t} too 😊`,
  es: (t) => `I love it! By the way, we both like ${t} 😊`,
  de: (t) => `I love that! We both like ${t} too, by the way 😊`,
  fr: () => "Tell me more!",
};

const DARK = {
  bg: "#1C1620", panel: "#241B29", card: "#2E2335", border: "#3A2E42",
  text: "#F3ECE4", muted: "#A99BA8", faint: "#8A7C92", gold: "#C99A3E", teal: "#4F8A82", onGold: "#1C1620",
};
const LIGHT = {
  bg: "#FBF7F0", panel: "#FFFFFF", card: "#F4EDE1", border: "#E6D9C4",
  text: "#2A2030", muted: "#6B5D71", faint: "#9C8FA0", gold: "#B4791F", teal: "#2F6259", onGold: "#241B29",
};
// eslint-disable-next-line prefer-const
let COLORS = { ...DARK };
function applyTheme(theme) {
  const src = theme === "light" ? LIGHT : DARK;
  Object.keys(src).forEach((k) => { COLORS[k] = src[k]; });
}

const LANGUAGES = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
  { code: "ar", label: "العربية" },
  { code: "pt", label: "Português" },
  { code: "it", label: "Italiano" },
];

function passwordStrength(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

function ConfirmModal({ title, message, confirmLabel, danger, onClose, onConfirm }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div className="w-full rounded-2xl p-5" style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}` }} onClick={(e) => e.stopPropagation()}>
        <p className="font-display text-lg mb-2" style={{ color: COLORS.text }}>{title}</p>
        <p className="text-sm mb-5" style={{ color: COLORS.muted }}>{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-full text-sm" style={{ background: COLORS.card, color: COLORS.muted, border: `1px solid ${COLORS.border}` }}>Annuler</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-full text-sm font-medium" style={{ background: danger ? "#C05B4E" : COLORS.gold, color: danger ? "#fff" : COLORS.bg }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function compressImage(dataUrl, maxWidth = 900, quality = 0.72) {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

// Génère un court son (mélodie à deux notes) encodé en WAV/base64, sans avoir
// besoin du micro. Utilisé comme repli fiable quand l'accès au microphone
// est refusé ou indisponible, pour que la fonction "message vocal" ne
// tombe jamais en erreur pure dans cette démo.
function generateSimulatedVoiceNote(seconds = 1.6) {
  const sampleRate = 8000;
  const length = Math.floor(sampleRate * seconds);
  const samples = new Int16Array(length);
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const freq = t < seconds / 2 ? 440 : 550;
    samples[i] = Math.round(Math.sin(2 * Math.PI * freq * t) * 0.3 * 32767 * Math.exp(-t * 0.6));
  }
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeStr = (offset, str) => { for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i)); };
  writeStr(0, "RIFF"); view.setUint32(4, 36 + samples.length * 2, true); writeStr(8, "WAVE");
  writeStr(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  writeStr(36, "data"); view.setUint32(40, samples.length * 2, true);
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) view.setInt16(offset, samples[i], true);
  const blob = new Blob([view], { type: "audio/wav" });
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

function localTime(tz) {
  try { return new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: tz }); }
  catch { return "--:--"; }
}

function hourDiff(tz) {
  try {
    const now = new Date();
    const mine = parseInt(now.toLocaleTimeString("en-GB", { hour: "2-digit", hour12: false }), 10);
    const theirs = parseInt(now.toLocaleTimeString("en-GB", { hour: "2-digit", hour12: false, timeZone: tz }), 10);
    let d = theirs - mine;
    if (d > 12) d -= 24; if (d < -12) d += 24;
    return d;
  } catch { return null; }
}

function distanceKm(a, b) {
  if (!a || !b) return null;
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLon = (b.lon - a.lon) * Math.PI / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s)));
}

// Traduction gratuite, sans clé ni compte : l'API publique MyMemory.
// Qualité correcte pour des messages courts, largement suffisante ici.
async function translateViaFreeService(text, sourceLangCode, targetLangCode) {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLangCode}|${targetLangCode}`;
    const res = await fetch(url);
    const data = await res.json();
    const out = data?.responseData?.translatedText;
    if (!out || /MYMEMORY WARNING|INVALID/i.test(out)) {
      return { ok: false, error: "Service gratuit temporairement indisponible" };
    }
    return { ok: true, text: out };
  } catch {
    return { ok: false, error: "Réseau indisponible" };
  }
}

async function translateText(text, sourceLangCode, targetLangCode, targetLabel = "français") {
  // 1) Gratuit, sans configuration, fonctionne dès que le site est déployé.
  const free = await translateViaFreeService(text, sourceLangCode, targetLangCode);
  if (free.ok) return free;

  // 2) Si vous avez configuré votre propre clé Anthropic sur le serveur
  //    (meilleure qualité, payant), ce relais prend le relais automatiquement.
  try {
    const serverRes = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, targetLabel }),
    });
    if (serverRes.ok) {
      const serverData = await serverRes.json();
      if (serverData.ok) return { ok: true, text: serverData.text };
    }
  } catch { /* pas de serveur de traduction payant configuré, on continue */ }

  // 3) Dernier repli : appel direct, qui ne fonctionne que dans l'aperçu Claude.ai.
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: `Traduis ce message en ${targetLabel}. Réponds uniquement avec la traduction, sans guillemets ni texte additionnel:\n\n${text}`,
        }],
      }),
    });
    let data;
    try { data = await res.json(); } catch { return { ok: false, error: `Réponse illisible (HTTP ${res.status})` }; }
    if (!res.ok) return { ok: false, error: data?.error?.message ? `${data.error.message}` : `Erreur HTTP ${res.status}` };
    if (data?.error) return { ok: false, error: data.error.message || "Erreur API" };
    const out = (data?.content || []).map((c) => c.text || "").join("").trim();
    if (!out) return { ok: false, error: "Réponse vide du service" };
    return { ok: true, text: out };
  } catch (e) {
    return { ok: false, error: free.error || `Réseau indisponible (${e?.message || "inconnu"})` };
  }
}

function Avatar({ p, blurred, size = 96 }) {
  return (
    <div className={`relative rounded-2xl bg-gradient-to-br ${p.gradient} flex items-center justify-center overflow-hidden`}
      style={{ width: size, height: size }}>
      <span className="font-display text-3xl text-white/90">{p.name[0]}</span>
      {blurred && <div className="absolute inset-0 backdrop-blur-md bg-black/20" />}
      {p.verified && !blurred && (
        <div className="absolute bottom-1 right-1 rounded-full" style={{ background: COLORS.panel }}>
          <BadgeCheck size={16} color={COLORS.gold} />
        </div>
      )}
    </div>
  );
}

function Constellation({ userTags, profileTags, size = 200 }) {
  const shared = profileTags.filter((t) => userTags.includes(t));
  const others = profileTags.filter((t) => !userTags.includes(t));
  const nodes = [...shared, ...others];
  const center = size / 2;
  const radius = size / 2 - 32;
  return (
    <svg width={size} height={size} className="mx-auto">
      <circle cx={center} cy={center} r={radius} fill="none" stroke={COLORS.border} strokeWidth="1" strokeDasharray="2 4" />
      {nodes.map((tag, i) => {
        const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        const isShared = shared.includes(tag);
        return (
          <g key={tag}>
            <line x1={center} y1={center} x2={x} y2={y} stroke={isShared ? COLORS.gold : COLORS.border} strokeWidth={isShared ? 1.5 : 1} />
            <circle cx={x} cy={y} r={isShared ? 5 : 3.5} fill={isShared ? COLORS.gold : "#5A4C63"} />
            <text x={x} y={y + (y > center ? 15 : -9)} textAnchor="middle" fontSize="9"
              fill={isShared ? COLORS.text : COLORS.faint} fontFamily="Inter, sans-serif">{tag}</text>
          </g>
        );
      })}
      <circle cx={center} cy={center} r={9} fill={COLORS.gold} />
    </svg>
  );
}

function Toast({ text }) {
  if (!text) return null;
  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-xs z-50 shadow-lg"
      style={{ background: COLORS.text, color: COLORS.bg }}>{text}</div>
  );
}

function SafetyModal({ onClose }) {
  const tips = [
    "Rencontrez-vous d'abord dans un lieu public, en journée si possible.",
    "Ne partagez jamais vos coordonnées bancaires ou codes de vérification.",
    "Parlez au téléphone ou en visio avant un premier rendez-vous.",
    "Ne partagez votre position exacte qu'avec des personnes de confiance.",
    "Signalez tout comportement suspect — on traite chaque signalement.",
  ];
  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div className="w-full rounded-t-3xl p-6" style={{ background: COLORS.panel }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck size={20} color={COLORS.gold} />
          <p className="font-display text-lg" style={{ color: COLORS.text }}>Centre de sécurité</p>
        </div>
        <ul className="space-y-3 mb-5">
          {tips.map((t, i) => (
            <li key={i} className="text-sm flex gap-2" style={{ color: COLORS.muted }}><span style={{ color: COLORS.gold }}>•</span>{t}</li>
          ))}
        </ul>
        <button onClick={onClose} className="w-full py-3 rounded-full text-sm font-medium" style={{ background: COLORS.gold, color: COLORS.onGold }}>J'ai compris</button>
      </div>
    </div>
  );
}

function ReportModal({ profile, kind, onClose, onConfirm }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div className="w-full rounded-2xl p-5" style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}` }} onClick={(e) => e.stopPropagation()}>
        <p className="font-display text-lg mb-2" style={{ color: COLORS.text }}>{kind === "report" ? `Signaler ${profile.name} ?` : `Bloquer ${profile.name} ?`}</p>
        <p className="text-sm mb-5" style={{ color: COLORS.muted }}>
          {kind === "report" ? "Notre équipe examine chaque signalement. La personne ne sera pas informée." : "Vous ne verrez plus ce profil et la conversation sera fermée."}
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-full text-sm" style={{ background: COLORS.card, color: COLORS.muted, border: `1px solid ${COLORS.border}` }}>Annuler</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-full text-sm font-medium" style={{ background: "#C05B4E", color: "#fff" }}>Confirmer</button>
        </div>
      </div>
    </div>
  );
}

function SupportModal({ draft, setDraft, onClose, onSend }) {
  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div className="w-full rounded-t-3xl p-6" style={{ background: COLORS.panel }} onClick={(e) => e.stopPropagation()}>
        <p className="font-display text-lg mb-2" style={{ color: COLORS.text }}>Contacter le support</p>
        <p className="text-sm mb-3" style={{ color: COLORS.muted }}>Décrivez votre problème ou votre question — notre équipe vous répondrait par email.</p>
        <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={4} placeholder="Écrivez votre message..."
          className="w-full p-3 rounded-xl text-sm outline-none mb-3" style={{ background: COLORS.card, color: COLORS.text, border: `1px solid ${COLORS.border}` }} />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-full text-sm" style={{ background: COLORS.card, color: COLORS.muted, border: `1px solid ${COLORS.border}` }}>Annuler</button>
          <button onClick={onSend} disabled={!draft.trim()} className="flex-1 py-2.5 rounded-full text-sm font-medium" style={{ background: COLORS.gold, color: COLORS.onGold, opacity: draft.trim() ? 1 : 0.5 }}>Envoyer</button>
        </div>
        <p className="text-[10px] mt-3" style={{ color: COLORS.faint }}>Démo : ce message reste stocké localement, il n'est pas envoyé à une vraie équipe de support.</p>
      </div>
    </div>
  );
}

function LimitModal({ onClose, onUpgrade }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div className="w-full rounded-2xl p-5 text-center" style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}` }} onClick={(e) => e.stopPropagation()}>
        <Heart size={28} color={COLORS.gold} className="mx-auto mb-2" />
        <p className="font-display text-lg mb-2" style={{ color: COLORS.text }}>Limite quotidienne atteinte</p>
        <p className="text-sm mb-5" style={{ color: COLORS.muted }}>Vous avez utilisé vos j'aime gratuits pour aujourd'hui. Revenez demain, ou passez en illimité.</p>
        <button onClick={onUpgrade} className="w-full py-3 rounded-full text-sm font-medium mb-2" style={{ background: COLORS.gold, color: COLORS.onGold }}>Passer en illimité (démo)</button>
        <button onClick={onClose} className="w-full py-2.5 rounded-full text-sm" style={{ background: COLORS.card, color: COLORS.muted, border: `1px solid ${COLORS.border}` }}>Revenir demain</button>
      </div>
    </div>
  );
}

function PaymentModal({ payRef, setPayRef, pending, onClose, onSubmit }) {
  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div className="w-full rounded-t-3xl p-6" style={{ background: COLORS.panel }} onClick={(e) => e.stopPropagation()}>
        <p className="font-display text-lg mb-2" style={{ color: COLORS.text }}>Devenir VIP+</p>
        {pending ? (
          <>
            <p className="text-sm mb-4" style={{ color: COLORS.muted }}>
              Votre demande a été envoyée. Un administrateur valide manuellement chaque paiement, généralement sous 24 à 48h.
            </p>
            <button onClick={onClose} className="w-full py-3 rounded-full text-sm font-medium" style={{ background: COLORS.card, color: COLORS.text, border: `1px solid ${COLORS.border}` }}>Fermer</button>
          </>
        ) : (
          <>
            <p className="text-sm mb-3" style={{ color: COLORS.muted }}>
              Effectuez un virement de 4,99€ avec la référence <strong style={{ color: COLORS.gold }}>AFF-{uid().slice(-6).toUpperCase()}</strong>, puis collez votre référence de transaction ci-dessous.
            </p>
            <textarea value={payRef} onChange={(e) => setPayRef(e.target.value)} rows={2} placeholder="Référence de virement / capture de paiement..."
              className="w-full p-3 rounded-xl text-sm outline-none mb-3" style={{ background: COLORS.card, color: COLORS.text, border: `1px solid ${COLORS.border}` }} />
            <button onClick={onSubmit} disabled={!payRef.trim()} className="w-full py-3 rounded-full text-sm font-medium mb-2" style={{ background: COLORS.gold, color: COLORS.onGold, opacity: payRef.trim() ? 1 : 0.5 }}>
              J'ai effectué le paiement
            </button>
            <button onClick={onClose} className="w-full py-2.5 rounded-full text-sm" style={{ background: COLORS.card, color: COLORS.muted, border: `1px solid ${COLORS.border}` }}>Annuler</button>
            <p className="text-[10px] mt-3" style={{ color: COLORS.faint }}>Démo : aucun vrai paiement n'est traité ici.</p>
          </>
        )}
      </div>
    </div>
  );
}

function AdminModal({ pending, onClose, onApprove, onReject }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div className="w-full rounded-2xl p-5 max-h-[80%] overflow-y-auto" style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}` }} onClick={(e) => e.stopPropagation()}>
        <p className="font-display text-lg mb-1" style={{ color: COLORS.text }}>Panneau interne (démo)</p>
        <p className="text-[11px] mb-3" style={{ color: COLORS.faint }}>
          À ne jamais exposer dans une vraie app grand public — ceci illustre juste le principe d'une file de validation.
        </p>
        {pending.length === 0 ? (
          <p className="text-sm" style={{ color: COLORS.muted }}>Aucune demande en attente.</p>
        ) : pending.map((p, i) => (
          <div key={i} className="p-3 rounded-xl mb-2" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
            <p className="text-xs" style={{ color: COLORS.text }}>{p.email}</p>
            <p className="text-xs mb-2" style={{ color: COLORS.muted }}>Réf : {p.reference}</p>
            <div className="flex gap-2">
              <button onClick={() => onApprove(i)} className="flex-1 py-1.5 rounded-full text-xs" style={{ background: COLORS.gold, color: COLORS.onGold }}>Valider</button>
              <button onClick={() => onReject(i)} className="flex-1 py-1.5 rounded-full text-xs" style={{ background: "#C05B4E", color: "#fff" }}>Refuser</button>
            </div>
          </div>
        ))}
        <button onClick={onClose} className="w-full py-2.5 rounded-full text-sm mt-2" style={{ background: COLORS.card, color: COLORS.muted, border: `1px solid ${COLORS.border}` }}>Fermer</button>
      </div>
    </div>
  );
}

function CallScreen({ profile, revealed, isVideo, onEnd }) {
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [camOn, setCamOn] = useState(true);
  const [camError, setCamError] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    if (isVideo && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => { streamRef.current = stream; if (videoRef.current) videoRef.current.srcObject = stream; })
        .catch(() => setCamError("Caméra indisponible dans cet aperçu."));
    }
    return () => { clearInterval(t); streamRef.current?.getTracks().forEach((tr) => tr.stop()); };
  }, [isVideo]);

  useEffect(() => {
    streamRef.current?.getVideoTracks().forEach((tr) => { tr.enabled = camOn; });
    streamRef.current?.getAudioTracks().forEach((tr) => { tr.enabled = !muted; });
  }, [camOn, muted]);

  function fmt(s) { const m = Math.floor(s / 60); const ss = s % 60; return `${m}:${ss.toString().padStart(2, "0")}`; }

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-between py-10 px-6" style={{ background: "#0F0C12" }}>
      <div className="text-center mt-6">
        <Avatar p={profile} blurred={!revealed} size={120} />
        <p className="font-display text-xl mt-4" style={{ color: COLORS.text }}>{profile.name}</p>
        <p className="text-sm" style={{ color: COLORS.muted }}>{isVideo ? "Appel vidéo" : "Appel audio"} · {fmt(seconds)}</p>
        {camError && <p className="text-xs mt-2" style={{ color: "#C05B4E" }}>{camError}</p>}
        <p className="text-[10px] mt-3 max-w-[220px]" style={{ color: COLORS.faint }}>Démonstration locale — pas de vraie connexion à distance dans ce prototype.</p>
      </div>

      {isVideo && !camError && (
        <video ref={videoRef} autoPlay muted playsInline
          className="absolute top-6 right-6 w-24 h-32 rounded-xl object-cover"
          style={{ border: `1px solid ${COLORS.border}`, opacity: camOn ? 1 : 0.15 }} />
      )}

      <div className="flex items-center gap-5">
        <button onClick={() => setMuted((v) => !v)} className="p-4 rounded-full" style={{ background: muted ? "#C05B4E" : COLORS.card }}>
          <Mic size={20} color={COLORS.text} />
        </button>
        {isVideo && (
          <button onClick={() => setCamOn((v) => !v)} className="p-4 rounded-full" style={{ background: !camOn ? "#C05B4E" : COLORS.card }}>
            <VideoIcon size={20} color={COLORS.text} />
          </button>
        )}
        <button onClick={() => onEnd(seconds)} className="p-4 rounded-full" style={{ background: "#C05B4E" }}>
          <PhoneOff size={20} color="#fff" />
        </button>
      </div>
    </div>
  );
}

function ChatScreen({ profile, messages, revealed, myCoords, typing, onSend, onBack, onOpenReport, onEditMessage, onDeleteMessage }) {
  const [draft, setDraft] = useState("");
  const [pendingWarn, setPendingWarn] = useState(null);
  const [recording, setRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const [micError, setMicError] = useState("");
  const [localNotice, setLocalNotice] = useState("");
  const [menuMsgId, setMenuMsgId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState("");
  function submitEdit(m) {
    if (editDraft.trim()) onEditMessage(m.id, editDraft.trim());
    setEditingId(null);
  }
  function flashLocal(text) { setLocalNotice(text); setTimeout(() => setLocalNotice(""), 2500); }
  const [menuOpen, setMenuOpen] = useState(false);
  const [preview, setPreview] = useState(null);
  const [callMode, setCallMode] = useState(null); // null | 'audio' | 'video'
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [targetLang, setTargetLang] = useState("fr");
  const [translations, setTranslations] = useState({});
  const [revealedT, setRevealedT] = useState({});
  const [translating, setTranslating] = useState({});
  const [now, setNow] = useState(Date.now());
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(t); }, []);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  const targetLabel = LANGUAGES.find((l) => l.code === targetLang)?.label || "Français";

  useEffect(() => {
    // la langue cible a changé : le cache de traductions précédent n'est plus valide
    setTranslations({});
    setRevealedT({});
  }, [targetLang]);

  const [translateErrors, setTranslateErrors] = useState({});
  useEffect(() => { setTranslateErrors({}); }, [targetLang]);

  useEffect(() => {
    if (!autoTranslate) return;
    messages.forEach((m) => {
      if (m.from === "them" && m.type === "text" && m.lang && m.lang !== targetLang && !translations[m.id] && !translating[m.id]) {
        const precomputed = targetLang === "fr" ? m.contentFr : targetLang === "en" ? m.contentEn : null;
        if (precomputed) {
          setTranslations((s) => ({ ...s, [m.id]: precomputed }));
          setRevealedT((s) => ({ ...s, [m.id]: true }));
          return;
        }
        setTranslating((s) => ({ ...s, [m.id]: true }));
        translateText(m.content, m.lang, targetLang, targetLabel).then((res) => {
          setTranslating((s) => ({ ...s, [m.id]: false }));
          if (res.ok) {
            setTranslations((s) => ({ ...s, [m.id]: res.text }));
            setRevealedT((s) => ({ ...s, [m.id]: true }));
          } else {
            setTranslateErrors((s) => ({ ...s, [m.id]: res.error }));
          }
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, autoTranslate, targetLang]);

  async function handleTranslateClick(m) {
    if (translations[m.id]) { setRevealedT((s) => ({ ...s, [m.id]: !s[m.id] })); return; }
    setTranslateErrors((s) => { const n = { ...s }; delete n[m.id]; return n; });
    // traduction précalculée (français/anglais) : fiable, instantanée, sans dépendre du réseau
    const precomputed = targetLang === "fr" ? m.contentFr : targetLang === "en" ? m.contentEn : null;
    if (precomputed) {
      setTranslations((s) => ({ ...s, [m.id]: precomputed }));
      setRevealedT((s) => ({ ...s, [m.id]: true }));
      return;
    }
    setTranslating((s) => ({ ...s, [m.id]: true }));
    const res = await translateText(m.content, m.lang, targetLang, targetLabel);
    setTranslating((s) => ({ ...s, [m.id]: false }));
    if (res.ok) {
      setTranslations((s) => ({ ...s, [m.id]: res.text }));
      setRevealedT((s) => ({ ...s, [m.id]: true }));
    } else {
      setTranslateErrors((s) => ({ ...s, [m.id]: res.error }));
    }
  }

  async function handleFile(e, kind) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (kind === "image") {
      const raw = await readFileAsDataURL(file);
      const compressed = await compressImage(raw);
      onSend({ id: uid(), type: "image", content: compressed, lang: "fr" });
    } else {
      if (file.size > 8 * 1024 * 1024) {
        flashLocal("Vidéo trop volumineuse pour cette démo (max 8 Mo).");
        return;
      }
      const raw = await readFileAsDataURL(file);
      onSend({ id: uid(), type: "video", content: raw, lang: "fr" });
    }
  }

  async function toggleRecording() {
    if (recording) { mediaRecorderRef.current?.stop(); return; }
    if (!(navigator.mediaDevices && window.MediaRecorder)) {
      const tone = await generateSimulatedVoiceNote();
      onSend({ id: uid(), type: "audio", content: tone, audioDuration: 2, simulated: true, lang: "fr" });
      flashLocal("Micro indisponible ici — message vocal simulé envoyé pour la démo.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => chunksRef.current.push(e.data);
      rec.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        clearInterval(timerRef.current);
        const duration = recSeconds;
        setRecording(false); setRecSeconds(0);
        if (blob.size > 3 * 1024 * 1024) {
          flashLocal("Message vocal trop long pour cette démo (max ~60s).");
          return;
        }
        const dataUrl = await readFileAsDataURL(blob);
        onSend({ id: uid(), type: "audio", content: dataUrl, audioDuration: duration, lang: "fr" });
      };
      mediaRecorderRef.current = rec; rec.start(); setRecording(true); setRecSeconds(0);
      timerRef.current = setInterval(() => {
        setRecSeconds((s) => {
          if (s + 1 >= 60) { rec.stop(); }
          return s + 1;
        });
      }, 1000);
    } catch {
      const tone = await generateSimulatedVoiceNote();
      onSend({ id: uid(), type: "audio", content: tone, audioDuration: 2, simulated: true, lang: "fr" });
      flashLocal("Autorisation micro refusée — message vocal simulé envoyé pour la démo.");
    }
  }

  function looksSensitive(text) {
    const phone = /(\+?\d[\d\s.-]{7,}\d)/.test(text);
    const addr = /\b(rue|avenue|boulevard|adresse|code postal|domicile)\b/i.test(text);
    return phone || addr;
  }

  function sendText() {
    if (!draft.trim()) return;
    if (looksSensitive(draft) && pendingWarn !== draft) { setPendingWarn(draft); return; }
    onSend({ id: uid(), type: "text", content: draft, lang: "fr" });
    setDraft(""); setPendingWarn(null);
  }

  const diff = hourDiff(profile.timezone);
  const km = distanceKm(myCoords, { lat: profile.lat, lon: profile.lon });

  return (
    <div className="flex flex-col h-full relative">
      <div className="px-4 py-3" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} aria-label="Retour"><ChevronLeft size={20} color={COLORS.muted} /></button>
          <Avatar p={profile} blurred={!revealed} size={40} />
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-1">
              <p className="text-sm font-medium" style={{ color: COLORS.text }}>{profile.name}</p>
              {profile.verified && <BadgeCheck size={13} color={COLORS.gold} />}
            </div>
            <div className="flex items-center gap-1 text-[10px]" style={{ color: COLORS.faint }}>
              <Clock size={10} />
              <span>Vous {localTime(Intl.DateTimeFormat().resolvedOptions().timeZone)} · {profile.name} {localTime(profile.timezone)} ({diff > 0 ? "+" : ""}{diff}h)</span>
            </div>
            {km != null && (
              <div className="flex items-center gap-1 text-[10px]" style={{ color: COLORS.faint }}>
                <MapPin size={10} /><span>{km} km · {profile.city}</span>
              </div>
            )}
          </div>
          <button onClick={() => setCallMode("audio")} className="p-1.5 rounded-full" style={{ background: COLORS.card }} aria-label="Démarrer un appel audio"><Phone size={15} color={COLORS.muted} /></button>
          <button onClick={() => setCallMode("video")} className="p-1.5 rounded-full" style={{ background: COLORS.card }} aria-label="Démarrer un appel vidéo"><VideoIcon size={15} color={COLORS.muted} /></button>
          <button onClick={() => setAutoTranslate((v) => !v)} className="p-1.5 rounded-full" style={{ background: autoTranslate ? COLORS.gold : COLORS.card }}
            aria-label={autoTranslate ? "Désactiver la traduction automatique" : "Activer la traduction automatique"} aria-pressed={autoTranslate}>
            <Globe size={15} color={autoTranslate ? COLORS.bg : COLORS.muted} />
          </button>
          <div className="relative">
            <button onClick={() => setMenuOpen((v) => !v)} aria-label="Plus d'options" aria-haspopup="true"><MoreVertical size={18} color={COLORS.muted} /></button>
            {menuOpen && (
              <div className="absolute right-0 top-6 rounded-xl overflow-hidden z-10 w-44" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
                <div className="px-3 py-2 text-[10px] uppercase tracking-wide" style={{ color: COLORS.faint }}>Traduire vers</div>
                {LANGUAGES.map((l) => (
                  <button key={l.code} onClick={() => { setTargetLang(l.code); setMenuOpen(false); }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs" style={{ color: l.code === targetLang ? COLORS.gold : COLORS.muted }}>
                    {l.label} {l.code === targetLang && "✓"}
                  </button>
                ))}
                <div style={{ borderTop: `1px solid ${COLORS.border}` }} />
                <button onClick={() => { setMenuOpen(false); onOpenReport("report"); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs" style={{ color: COLORS.muted }}><Flag size={13} /> Signaler</button>
                <button onClick={() => { setMenuOpen(false); onOpenReport("block"); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs" style={{ color: "#C05B4E" }}><Ban size={13} /> Bloquer</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[75%]">
              {m.type === "text" && m.deleted && (
                <div className="px-3 py-2 rounded-2xl text-sm italic" style={{ background: COLORS.card, color: COLORS.faint }}>
                  Message supprimé
                </div>
              )}
              {m.type === "text" && !m.deleted && editingId === m.id ? (
                <div className="flex items-center gap-1">
                  <input value={editDraft} onChange={(e) => setEditDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submitEdit(m)}
                    className="px-3 py-2 rounded-2xl text-sm outline-none" style={{ background: COLORS.gold, color: COLORS.onGold }} autoFocus />
                  <button onClick={() => submitEdit(m)} aria-label="Valider la modification"><CheckCircle2 size={16} color={COLORS.gold} /></button>
                  <button onClick={() => setEditingId(null)} aria-label="Annuler la modification"><X size={16} color={COLORS.muted} /></button>
                </div>
              ) : (m.type === "text" && !m.deleted && (
                <>
                  <div onClick={() => m.from === "me" && setMenuMsgId(menuMsgId === m.id ? null : m.id)}
                    className="px-3 py-2 rounded-2xl text-sm" dir={m.lang === "ar" && !(revealedT[m.id] && translations[m.id]) ? "rtl" : "ltr"}
                    style={{ background: m.from === "me" ? COLORS.gold : COLORS.card, color: m.from === "me" ? COLORS.bg : COLORS.text, cursor: m.from === "me" ? "pointer" : "default" }}>
                    {revealedT[m.id] && translations[m.id] ? translations[m.id] : m.content}
                    {m.edited && <span className="text-[10px] opacity-70"> (modifié)</span>}
                  </div>
                  {menuMsgId === m.id && (
                    <div className="flex gap-3 mt-1 justify-end text-[10px]" style={{ color: COLORS.gold }}>
                      <button onClick={() => { setEditingId(m.id); setEditDraft(m.content); setMenuMsgId(null); }}>Modifier</button>
                      <button onClick={() => { onDeleteMessage(m.id); setMenuMsgId(null); }} style={{ color: "#C05B4E" }}>Supprimer pour tout le monde</button>
                    </div>
                  )}
                  {m.from === "them" && m.lang && m.lang !== targetLang && (
                    <>
                      <button onClick={() => handleTranslateClick(m)} className="text-[10px] mt-0.5" style={{ color: COLORS.gold }} aria-label={`Traduire ce message en ${targetLabel}`}>
                        {translating[m.id] ? "Traduction…" : translations[m.id] ? (revealedT[m.id] ? "Voir l'original" : `Voir en ${targetLabel}`) : `Traduire en ${targetLabel}`}
                      </button>
                      {translateErrors[m.id] && (
                        <p className="text-[10px] mt-0.5" style={{ color: "#C05B4E" }}>
                          {translateErrors[m.id]} — <button onClick={() => handleTranslateClick(m)} className="underline">réessayer</button>
                        </p>
                      )}
                    </>
                  )}
                </>
              ))}
              {m.type === "image" && (
                <img src={m.content} alt="photo partagée" onClick={() => setPreview(m.content)} className="rounded-xl max-h-48 object-cover cursor-pointer" style={{ border: `1px solid ${COLORS.border}` }} />
              )}
              {m.type === "video" && (
                <video src={m.content} controls className="rounded-xl max-h-56" style={{ border: `1px solid ${COLORS.border}` }} />
              )}
              {m.type === "audio" && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-2xl" style={{ background: m.from === "me" ? COLORS.gold : COLORS.card }}>
                  <audio src={m.content} controls style={{ height: 28, width: 190 }} />
                </div>
              )}
              {m.simulated && <p className="text-[9px] mt-0.5" style={{ color: COLORS.faint }}>Message vocal simulé (démo)</p>}
              {m.type === "call" && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-2xl text-xs" style={{
                  background: COLORS.card, color: m.status === "missed" ? "#C05B4E" : COLORS.text,
                  border: `1px solid ${COLORS.border}`,
                }}>
                  {m.callKind === "video" ? <VideoIcon size={13} /> : <Phone size={13} />}
                  {m.status === "missed"
                    ? `Appel ${m.callKind === "video" ? "vidéo" : "audio"} manqué`
                    : `Appel ${m.callKind === "video" ? "vidéo" : "audio"} · ${Math.floor(m.duration / 60)}:${(m.duration % 60).toString().padStart(2, "0")}`}
                </div>
              )}
              {m.from === "me" && !m.deleted && (
                <p className="text-[10px] mt-0.5 text-right" style={{ color: m.read ? COLORS.gold : COLORS.faint }} aria-label={m.read ? "Lu" : "Envoyé, non lu"}>
                  {m.read ? "✓✓ Lu" : "✓ Envoyé"}
                </p>
              )}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="px-3 py-2 rounded-2xl text-xs flex items-center gap-1" style={{ background: COLORS.card, color: COLORS.faint }}>
              <span className="italic">{profile.name} est en train d'écrire…</span>
            </div>
          </div>
        )}
      </div>

      {pendingWarn && (
        <div className="mx-3 mb-1 px-3 py-2 rounded-xl flex items-center gap-2 text-xs" style={{ background: "rgba(201,154,62,0.15)", color: COLORS.gold }}>
          <ShieldAlert size={14} className="flex-shrink-0" />
          <span className="flex-1">Ce message semble contenir un numéro ou une adresse. Restez prudent·e.</span>
          <button onClick={sendText} className="underline whitespace-nowrap">Envoyer quand même</button>
          <button onClick={() => setPendingWarn(null)} aria-label="Annuler l'envoi"><X size={13} /></button>
        </div>
      )}
      {micError && <p className="text-xs text-center pb-1" style={{ color: "#C05B4E" }}>{micError}</p>}
      {localNotice && <p className="text-xs text-center pb-1" style={{ color: "#C05B4E" }}>{localNotice}</p>}

      <div className="px-3 py-3 flex items-center gap-2" style={{ borderTop: `1px solid ${COLORS.border}` }}>
        <input type="file" accept="image/*" hidden onChange={(e) => handleFile(e, "image")} id="img-input" />
        <input type="file" accept="video/*" hidden onChange={(e) => handleFile(e, "video")} id="vid-input" />
        <label htmlFor="img-input" className="p-2 rounded-full cursor-pointer" style={{ background: COLORS.card }} aria-label="Envoyer une photo"><ImageIcon size={17} color={COLORS.muted} /></label>
        <label htmlFor="vid-input" className="p-2 rounded-full cursor-pointer" style={{ background: COLORS.card }} aria-label="Envoyer une vidéo"><VideoIcon size={17} color={COLORS.muted} /></label>
        <button onClick={toggleRecording} className="p-2 rounded-full" style={{ background: recording ? "#C05B4E" : COLORS.card }}
          aria-label={recording ? "Arrêter l'enregistrement audio" : "Enregistrer un message audio"} aria-pressed={recording}>
          {recording ? <Square size={17} color="#fff" /> : <Mic size={17} color={COLORS.muted} />}
        </button>
        {recording && <span className="text-xs" style={{ color: "#C05B4E" }} role="status">{recSeconds}s</span>}
        <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendText()}
          placeholder="Écrire un message..." aria-label="Écrire un message" className="flex-1 px-4 py-2 rounded-full text-sm outline-none"
          style={{ background: COLORS.card, color: COLORS.text, border: `1px solid ${COLORS.border}` }} />
        <button onClick={sendText} className="p-2.5 rounded-full" style={{ background: COLORS.gold }} aria-label="Envoyer le message"><Send size={16} color={COLORS.bg} /></button>
      </div>

      {preview && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={() => setPreview(null)} role="dialog" aria-label="Aperçu de la photo, cliquez pour fermer">
          <img src={preview} alt="Photo partagée en aperçu plein écran" className="max-h-full max-w-full rounded-lg" />
        </div>
      )}
      {callMode && (
        <CallScreen profile={profile} revealed={revealed} isVideo={callMode === "video"}
          onEnd={(seconds) => {
            onSend({ id: uid(), type: "call", callKind: callMode, status: seconds < 3 ? "missed" : "completed", duration: seconds, lang: "fr" });
            setCallMode(null);
          }} />
      )}
    </div>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [authMode, setAuthMode] = useState("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [authError, setAuthError] = useState("");
  const [twoFactor, setTwoFactor] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [remembered, setRemembered] = useState(null);
  const [remLoaded, setRemLoaded] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportDraft, setSupportDraft] = useState("");
  const [loginHistory, setLoginHistory] = useState([]);
  const [likesToday, setLikesToday] = useState(0);
  const [likeDate, setLikeDate] = useState(new Date().toDateString());
  const [premium, setPremium] = useState(false);
  const [limitModal, setLimitModal] = useState(false);
  const [stats, setStats] = useState({ likesTotal: 0, matchesTotal: 0, messagesTotal: 0, byDay: {} });
  const [dataLoaded, setDataLoaded] = useState(false);
  const [notifOn, setNotifOn] = useState(false);
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [myGender, setMyGender] = useState(null);
  const [interestedIn, setInterestedIn] = useState("les_deux");
  const [seenIds, setSeenIds] = useState([]);
  const [blockedIds, setBlockedIds] = useState([]);
  const [vip, setVip] = useState(false);
  const [myPhoto, setMyPhoto] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [payModal, setPayModal] = useState(false);
  const [payRef, setPayRef] = useState("");
  const [payPending, setPayPending] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [pendingPayments, setPendingPayments] = useState([]);
  const LIKE_LIMIT = 10;
  applyTheme(theme);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [screen, setScreen] = useState("auth");
  const [tab, setTab] = useState("discover");
  const [qIndex, setQIndex] = useState(0);
  const [userTags, setUserTags] = useState([]);
  const [queue, setQueue] = useState(PROFILES);
  const [matches, setMatches] = useState([]);
  const [matchOverlay, setMatchOverlay] = useState(null);
  const [activeChatId, setActiveChatId] = useState(null);
  const [showSafety, setShowSafety] = useState(true);
  const [safetyModal, setSafetyModal] = useState(false);
  const [reportState, setReportState] = useState(null);
  const [toast, setToast] = useState("");
  const [bio, setBio] = useState("Toujours prêt·e pour une bonne conversation et un mauvais jeu de mots.");
  const [locationSharing, setLocationSharing] = useState(false);
  const [myCoords, setMyCoords] = useState(null);

  const current = queue[0];

  const score = useMemo(() => {
    if (!current) return 0;
    const shared = current.tags.filter((t) => userTags.includes(t)).length;
    return Math.round((shared / current.tags.length) * 100);
  }, [current, userTags]);

  function flash(text) { setToast(text); setTimeout(() => setToast(""), 2200); }

  function matchesPreference(p) {
    if (interestedIn === "les_deux") return true;
    if (interestedIn === "hommes") return p.gender === "homme";
    if (interestedIn === "femmes") return p.gender === "femme";
    return true;
  }

  useEffect(() => {
    function goOnline() { setOnline(true); }
    function goOffline() { setOnline(false); flash("Vous êtes hors ligne — certaines fonctions sont indisponibles."); }
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => { window.removeEventListener("online", goOnline); window.removeEventListener("offline", goOffline); };
  }, []);

  useEffect(() => {
    setQueue(PROFILES.filter((p) => !seenIds.includes(p.id) && !blockedIds.includes(p.id) && matchesPreference(p)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interestedIn, blockedIds]);

  async function enableNotifications() {
    if (!("Notification" in window)) { flash("Notifications non supportées sur cet appareil"); return; }
    const perm = await Notification.requestPermission();
    setNotifOn(perm === "granted");
    flash(perm === "granted" ? "Notifications activées" : "Autorisation refusée");
  }

  function notifyNewMessage(name, text) {
    if (notifOn && document.hidden && "Notification" in window) {
      try { new Notification(`${name} sur PhoenixLove`, { body: text, icon: "/icons/icon-192.png" }); } catch {}
    }
  }

  async function pushLoginHistory(method) {
    const entry = { method, time: new Date().toLocaleString("fr-FR"), tz: Intl.DateTimeFormat().resolvedOptions().timeZone };
    const next = [entry, ...loginHistory].slice(0, 6);
    setLoginHistory(next);
    try { await window.storage.set("phoenixlove_history", JSON.stringify(next), false); } catch {}
  }

  function recordStat(type) {
    setStats((s) => {
      const day = new Date().toDateString();
      const byDay = { ...s.byDay, [day]: { ...(s.byDay[day] || { matches: 0, messages: 0, likes: 0 }) } };
      byDay[day][type] = (byDay[day][type] || 0) + 1;
      return {
        ...s,
        likesTotal: type === "likes" ? s.likesTotal + 1 : s.likesTotal,
        matchesTotal: type === "matches" ? s.matchesTotal + 1 : s.matchesTotal,
        messagesTotal: type === "messages" ? s.messagesTotal + 1 : s.messagesTotal,
        byDay,
      };
    });
  }

  function answerQuiz(tag) {
    const next = [...userTags, tag];
    setUserTags(next);
    if (qIndex + 1 < QUESTIONS.length) setQIndex(qIndex + 1);
    else { setScreen("app"); setTab("discover"); }
  }

  function pass() { if (current) setSeenIds((s) => [...s, current.id]); setQueue((q) => q.slice(1)); }

  function like() {
    if (current) setSeenIds((s) => [...s, current.id]);
    const today = new Date().toDateString();
    const isNewDay = likeDate !== today;
    const currentCount = isNewDay ? 0 : likesToday;
    if (!premium && !vip && currentCount >= LIKE_LIMIT) { setLimitModal(true); return; }
    const nextCount = currentCount + 1;
    setLikesToday(nextCount); setLikeDate(today);
    window.storage.set("phoenixlove_likes", JSON.stringify({ date: today, count: nextCount }), false).catch(() => {});
    recordStat("likes");
    if (current?.mutual) {
      const entry = { profile: current, revealed: false, messages: [], unread: 0 };
      setMatches((m) => [...m, entry]);
      setMatchOverlay(entry);
      recordStat("matches");
    } else flash(`Vous avez aimé ${current.name}`);
    setQueue((q) => q.slice(1));
  }

  function upgradeToPremium() {
    setPremium(true); setLimitModal(false);
    window.storage.set("phoenixlove_premium", "true", false).catch(() => {});
    flash("Vous êtes en illimité (démo) ✨");
  }

  function openChat(profileId) {
    setMatches((m) => m.map((x) => {
      if (x.profile.id !== profileId) return x;
      const messages = x.messages.length ? x.messages : [{ id: uid(), from: "them", type: "text", content: x.profile.greeting, contentFr: GREETINGS_FR[x.profile.id], contentEn: GREETINGS_EN[x.profile.id], lang: x.profile.lang }];
      return { ...x, revealed: true, messages, unread: 0 };
    }));
    setActiveChatId(profileId);
    setTab("messages");
    setMatchOverlay(null);
  }

  function sendMessage(profileId, msg) {
    setMatches((m) => m.map((x) => x.profile.id === profileId ? { ...x, typing: msg.type === "text" ? true : x.typing, messages: [...x.messages, { from: "me", read: false, ...msg }] } : x));
    if (msg.type !== "call") recordStat("messages");
    if (msg.type === "text") {
      setTimeout(() => {
        setMatches((m) => m.map((x) => {
          if (x.profile.id !== profileId) return x;
          const shared = x.profile.tags.filter((t) => userTags.includes(t));
          const replyFn = REPLIES[x.profile.lang] || REPLIES.fr;
          const replyFnFr = REPLIES_FR[x.profile.lang] || REPLIES_FR.fr;
          const replyFnEn = REPLIES_EN[x.profile.lang] || REPLIES_EN.fr;
          const reply = shared.length ? replyFn(shared[0]) : (REPLIES.fr)();
          const replyFr = shared.length ? replyFnFr(shared[0]) : (REPLIES_FR.fr)();
          const replyEn = shared.length ? replyFnEn(shared[0]) : (REPLIES_EN.fr)();
          notifyNewMessage(x.profile.name, reply);
          const readMessages = x.messages.map((mm) => (mm.from === "me" ? { ...mm, read: true } : mm));
          return {
            ...x,
            typing: false,
            messages: [...readMessages, { id: uid(), from: "them", type: "text", content: reply, contentFr: replyFr, contentEn: replyEn, lang: x.profile.lang }],
            unread: activeChatId === profileId ? 0 : (x.unread || 0) + 1,
          };
        }));
      }, 1400);
    } else if (msg.type === "call") {
      // rien de plus : l'appel apparaît déjà comme un message dans la conversation
      setTimeout(() => {
        setMatches((m) => m.map((x) => x.profile.id !== profileId ? x : { ...x, messages: x.messages.map((mm) => mm.id === msg.id ? { ...mm, read: true } : mm) }));
      }, 1500);
    } else {
      setTimeout(() => {
        setMatches((m) => m.map((x) => x.profile.id !== profileId ? x : { ...x, messages: x.messages.map((mm) => mm.id === msg.id ? { ...mm, read: true } : mm) }));
      }, 1500);
      flash(`${msg.type === "image" ? "Photo" : msg.type === "video" ? "Vidéo" : "Message vocal"} envoyé·e`);
    }
  }

  function editMessage(profileId, id, content) {
    setMatches((m) => m.map((x) => x.profile.id !== profileId ? x : {
      ...x, messages: x.messages.map((msg) => msg.id === id ? { ...msg, content, edited: true } : msg),
    }));
  }

  function deleteMessage(profileId, id) {
    setMatches((m) => m.map((x) => x.profile.id !== profileId ? x : {
      ...x, messages: x.messages.map((msg) => msg.id === id ? { ...msg, deleted: true, content: "" } : msg),
    }));
  }

  function confirmModeration() {
    const { profile, kind } = reportState;
    setMatches((m) => m.filter((x) => x.profile.id !== profile.id));
    if (kind === "block") {
      setBlockedIds((b) => [...b, profile.id]);
      setQueue((q) => q.filter((p) => p.id !== profile.id));
    }
    if (activeChatId === profile.id) setActiveChatId(null);
    setReportState(null);
    flash(kind === "report" ? "Signalement envoyé — merci" : `${profile.name} a été bloqué·e`);
  }

  function toggleLocation() {
    if (locationSharing) { setLocationSharing(false); setMyCoords(null); flash("Position retirée"); return; }
    if (!navigator.geolocation) { flash("Localisation indisponible sur cet appareil"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => { setMyCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }); setLocationSharing(true); flash("Position partagée avec vos matchs"); },
      () => flash("Autorisation de localisation refusée"),
    );
  }

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("phoenixlove_remembered", false);
        if (res && res.value) setRemembered(JSON.parse(res.value));
      } catch {
        // rien de mémorisé pour l'instant, c'est normal
      } finally {
        setRemLoaded(true);
      }
    })();
    (async () => {
      try { const r = await window.storage.get("phoenixlove_theme", false); if (r?.value) setTheme(r.value); } catch {}
      try { const r = await window.storage.get("phoenixlove_tags", false); if (r?.value) setUserTags(JSON.parse(r.value)); } catch {}
      try { const r = await window.storage.get("phoenixlove_conversations", false); if (r?.value) setMatches(JSON.parse(r.value)); } catch {}
      try { const r = await window.storage.get("phoenixlove_stats", false); if (r?.value) setStats(JSON.parse(r.value)); } catch {}
      try {
        const r = await window.storage.get("phoenixlove_likes", false);
        if (r?.value) {
          const d = JSON.parse(r.value);
          const today = new Date().toDateString();
          if (d.date === today) { setLikesToday(d.count); setLikeDate(d.date); }
        }
      } catch {}
      try { const r = await window.storage.get("phoenixlove_history", false); if (r?.value) setLoginHistory(JSON.parse(r.value)); } catch {}
      try { const r = await window.storage.get("phoenixlove_premium", false); if (r?.value === "true") setPremium(true); } catch {}
      try { const r = await window.storage.get("phoenixlove_vip", false); if (r?.value === "true") setVip(true); } catch {}
      try { const r = await window.storage.get("phoenixlove_myphoto", false); if (r?.value) setMyPhoto(r.value); } catch {}
      try { const r = await window.storage.get("phoenixlove_gender", false); if (r?.value) setMyGender(r.value); } catch {}
      try { const r = await window.storage.get("phoenixlove_interested", false); if (r?.value) setInterestedIn(r.value); } catch {}
      try { const r = await window.storage.get("phoenixlove_seen", false); if (r?.value) setSeenIds(JSON.parse(r.value)); } catch {}
      try { const r = await window.storage.get("phoenixlove_blocked", false); if (r?.value) setBlockedIds(JSON.parse(r.value)); } catch {}
      setDataLoaded(true);
    })();
  }, []);

  // sauvegarde automatique des conversations et des statistiques dès qu'elles changent
  useEffect(() => {
    if (!dataLoaded) return;
    window.storage.set("phoenixlove_conversations", JSON.stringify(matches), false).catch(() => {});
  }, [matches, dataLoaded]);
  useEffect(() => {
    if (!dataLoaded) return;
    window.storage.set("phoenixlove_stats", JSON.stringify(stats), false).catch(() => {});
  }, [stats, dataLoaded]);
  useEffect(() => {
    if (!dataLoaded) return;
    window.storage.set("phoenixlove_tags", JSON.stringify(userTags), false).catch(() => {});
  }, [userTags, dataLoaded]);
  useEffect(() => {
    window.storage.set("phoenixlove_theme", theme, false).catch(() => {});
  }, [theme]);
  useEffect(() => {
    if (!dataLoaded) return;
    window.storage.set("phoenixlove_seen", JSON.stringify(seenIds), false).catch(() => {});
  }, [seenIds, dataLoaded]);
  useEffect(() => {
    if (!dataLoaded) return;
    window.storage.set("phoenixlove_blocked", JSON.stringify(blockedIds), false).catch(() => {});
  }, [blockedIds, dataLoaded]);
  useEffect(() => {
    if (myGender) window.storage.set("phoenixlove_gender", myGender, false).catch(() => {});
  }, [myGender]);
  useEffect(() => {
    window.storage.set("phoenixlove_interested", interestedIn, false).catch(() => {});
  }, [interestedIn]);

  async function saveRemembered(data) {
    setRemembered(data);
    try { await window.storage.set("phoenixlove_remembered", JSON.stringify(data), false); } catch { /* stockage indisponible, on continue sans bloquer */ }
  }

  async function forgetDevice() {
    setRemembered(null);
    try { await window.storage.delete("phoenixlove_remembered", false); } catch { /* déjà absent */ }
    flash("Cet appareil a été oublié");
  }

  function quickLogin() {
    if (!remembered) return;
    setEmail(remembered.email);
    setAuthed(true);
    setScreen("intro");
    pushLoginHistory(remembered.method === "email" ? "Email (mémorisé)" : remembered.method === "google" ? "Google (mémorisé)" : "Apple (mémorisé)");
    flash("Connecté·e automatiquement");
  }

  function socialLogin(provider) {
    const label = provider === "google" ? "Google" : "Apple";
    const mockEmail = provider === "google" ? "vous@gmail.com" : "vous@icloud.com";
    setEmail(mockEmail);
    setAuthed(true);
    setScreen("intro");
    if (rememberMe) saveRemembered({ email: mockEmail, method: provider });
    pushLoginHistory(label);
    flash(`Connecté·e avec ${label} (démo)`);
  }

  function handleAuthSubmit() {
    setAuthError("");
    const emailOk = /\S+@\S+\.\S+/.test(email);
    if (!emailOk) { setAuthError("Adresse email invalide."); return; }
    if (password.length < 8) { setAuthError("Le mot de passe doit contenir au moins 8 caractères."); return; }
    if (authMode === "signup") {
      if (password !== confirmPassword) { setAuthError("Les mots de passe ne correspondent pas."); return; }
      if (!ageConfirmed) { setAuthError("Vous devez confirmer avoir 18 ans ou plus."); return; }
      if (!termsAccepted) { setAuthError("Vous devez accepter les conditions d'utilisation."); return; }
    }
    setAuthed(true);
    setScreen("intro");
    if (authMode === "signup") setShowWelcome(true);
    if (rememberMe) saveRemembered({ email, method: "email" });
    pushLoginHistory(authMode === "signup" ? "Nouveau compte (email)" : "Email");
  }

  function logout() {
    setAuthed(false); setScreen("auth"); setLogoutConfirm(false);
    setEmail(""); setPassword(""); setConfirmPassword("");
  }

  function deleteAccount() {
    setDeleteConfirm(false);
    restart();
    setAuthed(false); setScreen("auth");
    setEmail(""); setPassword(""); setConfirmPassword("");
    setLoginHistory([]); setPremium(false); setLikesToday(0);
    ["phoenixlove_conversations", "phoenixlove_tags", "phoenixlove_stats", "phoenixlove_history", "phoenixlove_premium", "phoenixlove_likes"].forEach((k) => {
      window.storage.delete(k, false).catch(() => {});
    });
    forgetDevice();
    flash("Compte supprimé (démo)");
  }

  async function sendSupportMessage() {
    if (!supportDraft.trim()) return;
    try {
      const prev = await window.storage.get("phoenixlove_support_messages", false).catch(() => null);
      const list = prev?.value ? JSON.parse(prev.value) : [];
      list.push({ text: supportDraft, time: new Date().toLocaleString("fr-FR"), from: email || "invité·e" });
      await window.storage.set("phoenixlove_support_messages", JSON.stringify(list), false);
    } catch { /* stockage indisponible, on continue sans bloquer l'utilisateur */ }
    setSupportOpen(false); setSupportDraft("");
    flash("Message envoyé — merci !");
  }

  async function submitPayment() {
    if (!payRef.trim()) return;
    const entry = { email: email || "invité·e", reference: payRef.trim(), time: new Date().toLocaleString("fr-FR") };
    try {
      const prev = await window.storage.get("phoenixlove_payment_requests", false).catch(() => null);
      const list = prev?.value ? JSON.parse(prev.value) : [];
      list.push(entry);
      await window.storage.set("phoenixlove_payment_requests", JSON.stringify(list), false);
      setPendingPayments(list);
    } catch {}
    // Alerte réelle à l'administrateur via Telegram, une fois le backend déployé.
    // Tant que /api/notify-admin n'existe pas (prototype actuel), l'appel échoue
    // silencieusement et n'interrompt jamais le parcours de l'utilisateur.
    fetch("/api/notify-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    }).catch(() => {});
    if (notifOn && "Notification" in window) {
      try { new Notification("Nouvelle demande VIP+ à valider", { body: `${entry.email} — réf. ${entry.reference}`, icon: "/icons/icon-192.png" }); } catch {}
    }
    setPayPending(true); setPayRef("");
  }

  async function openAdmin() {
    try {
      const r = await window.storage.get("phoenixlove_payment_requests", false);
      setPendingPayments(r?.value ? JSON.parse(r.value) : []);
    } catch { setPendingPayments([]); }
    setAdminOpen(true);
  }

  async function approvePayment(i) {
    const next = pendingPayments.filter((_, idx) => idx !== i);
    setPendingPayments(next);
    await window.storage.set("phoenixlove_payment_requests", JSON.stringify(next), false).catch(() => {});
    setVip(true); setPremium(true);
    window.storage.set("phoenixlove_vip", "true", false).catch(() => {});
    flash("Paiement validé — VIP+ activé");
  }

  async function rejectPayment(i) {
    const next = pendingPayments.filter((_, idx) => idx !== i);
    setPendingPayments(next);
    await window.storage.set("phoenixlove_payment_requests", JSON.stringify(next), false).catch(() => {});
    flash("Demande refusée");
  }

  function restart() {
    setScreen("intro"); setTab("discover"); setQIndex(0); setUserTags([]);
    setQueue(PROFILES); setMatches([]); setMatchOverlay(null); setActiveChatId(null);
  }

  const activeMatch = matches.find((x) => x.profile.id === activeChatId);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4" lang="fr" style={{ background: COLORS.bg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300..900;1,300..900&family=Inter:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
        .font-body { font-family: 'Inter', sans-serif; }
      `}</style>

      <div className="relative w-full max-w-md h-[720px] rounded-3xl overflow-hidden shadow-2xl font-body flex flex-col" style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}` }}>
        <div className="px-5 pt-5 pb-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
          <div className="flex items-center gap-2"><Sparkles size={17} color={COLORS.gold} /><span className="font-display text-lg" style={{ color: COLORS.text }}>PhoenixLove</span></div>
          {screen !== "intro" && screen !== "auth" && <button onClick={restart} className="text-xs flex items-center gap-1" style={{ color: COLORS.muted }}><RotateCcw size={12} /> recommencer</button>}
        </div>

        <div className="flex-1 overflow-hidden relative">
          {screen === "auth" && (
            <div className="p-6 h-full overflow-y-auto">
              {remLoaded && remembered && (
                <div className="mb-5 p-3 rounded-xl flex items-center gap-3" style={{ background: "rgba(201,154,62,0.12)", border: `1px solid ${COLORS.border}` }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: COLORS.gold, color: COLORS.onGold }}>
                    <Mail size={16} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs" style={{ color: COLORS.muted }}>Content de vous revoir</p>
                    <p className="text-sm truncate" style={{ color: COLORS.text }}>{remembered.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <button onClick={quickLogin} className="px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: COLORS.gold, color: COLORS.onGold }}>Continuer</button>
                    <button onClick={forgetDevice} className="text-[10px]" style={{ color: COLORS.faint }}>Oublier</button>
                  </div>
                </div>
              )}
              <div className="flex gap-2 mb-6">
                <button onClick={() => { setAuthMode("signup"); setAuthError(""); }}
                  className="flex-1 py-2 rounded-full text-sm font-medium"
                  style={{ background: authMode === "signup" ? COLORS.gold : COLORS.card, color: authMode === "signup" ? COLORS.bg : COLORS.muted }}>
                  Créer un compte
                </button>
                <button onClick={() => { setAuthMode("login"); setAuthError(""); }}
                  className="flex-1 py-2 rounded-full text-sm font-medium"
                  style={{ background: authMode === "login" ? COLORS.gold : COLORS.card, color: authMode === "login" ? COLORS.bg : COLORS.muted }}>
                  Se connecter
                </button>
              </div>

              <p className="font-display text-xl mb-1" style={{ color: COLORS.text }}>
                {authMode === "signup" ? "Bienvenue sur PhoenixLove" : "Ravi de vous revoir"}
              </p>
              <p className="text-sm mb-5" style={{ color: COLORS.muted }}>
                {authMode === "signup" ? "Créez votre compte pour commencer à découvrir des affinités." : "Connectez-vous pour retrouver vos matchs."}
              </p>

              <label className="text-xs uppercase tracking-widest" style={{ color: COLORS.faint }}>Email</label>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-3 mt-1" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
                <Mail size={15} color={COLORS.faint} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com"
                  aria-label="Adresse email" className="flex-1 bg-transparent outline-none text-sm" style={{ color: COLORS.text }} />
              </div>

              <label className="text-xs uppercase tracking-widest" style={{ color: COLORS.faint }}>Mot de passe</label>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-1 mt-1" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
                <Lock size={15} color={COLORS.faint} />
                <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="8 caractères minimum" aria-label="Mot de passe" className="flex-1 bg-transparent outline-none text-sm" style={{ color: COLORS.text }} />
                <button onClick={() => setShowPw((v) => !v)} aria-label={showPw ? "Masquer le mot de passe" : "Afficher le mot de passe"}>
                  {showPw ? <EyeOff size={15} color={COLORS.faint} /> : <Eye size={15} color={COLORS.faint} />}
                </button>
              </div>

              {authMode === "signup" && (
                <>
                  <div className="flex gap-1 mb-3 mt-2">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="h-1 flex-1 rounded-full" style={{ background: passwordStrength(password) > i ? (passwordStrength(password) >= 3 ? COLORS.teal : COLORS.gold) : COLORS.border }} />
                    ))}
                  </div>
                  <label className="text-xs uppercase tracking-widest" style={{ color: COLORS.faint }}>Confirmer le mot de passe</label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-3 mt-1" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
                    <Lock size={15} color={COLORS.faint} />
                    <input type={showPw ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Retapez le mot de passe" aria-label="Confirmer le mot de passe" className="flex-1 bg-transparent outline-none text-sm" style={{ color: COLORS.text }} />
                  </div>

                  <label className="flex items-start gap-2 mb-2 cursor-pointer">
                    <input type="checkbox" checked={ageConfirmed} onChange={(e) => setAgeConfirmed(e.target.checked)} className="mt-0.5" />
                    <span className="text-xs" style={{ color: COLORS.muted }}>Je confirme avoir 18 ans ou plus.</span>
                  </label>
                  <label className="flex items-start gap-2 mb-3 cursor-pointer">
                    <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-0.5" />
                    <span className="text-xs" style={{ color: COLORS.muted }}>J'accepte les conditions d'utilisation et la politique de confidentialité.</span>
                  </label>
                </>
              )}

              {authError && <p className="text-xs mb-3" style={{ color: "#C05B4E" }} role="alert">{authError}</p>}

              <label className="flex items-center gap-2 mb-4 cursor-pointer">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                <span className="text-xs" style={{ color: COLORS.muted }}>Se souvenir de moi sur cet appareil</span>
              </label>

              <button onClick={handleAuthSubmit} className="w-full py-3 rounded-full text-sm font-medium mb-3" style={{ background: COLORS.gold, color: COLORS.onGold }}>
                {authMode === "signup" ? "Créer mon compte" : "Se connecter"}
              </button>

              {authMode === "login" && (
                <button onClick={() => flash("Fonction non disponible dans cette démo")} className="w-full text-xs text-center mb-4" style={{ color: COLORS.faint }}>
                  Mot de passe oublié ?
                </button>
              )}

              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 h-px" style={{ background: COLORS.border }} />
                <span className="text-[10px]" style={{ color: COLORS.faint }}>ou</span>
                <div className="flex-1 h-px" style={{ background: COLORS.border }} />
              </div>
              <button onClick={() => socialLogin("google")} className="w-full py-2.5 rounded-full text-sm mb-2" style={{ background: COLORS.card, color: COLORS.text, border: `1px solid ${COLORS.border}` }}>
                Continuer avec Google
              </button>
              <button onClick={() => socialLogin("apple")} className="w-full py-2.5 rounded-full text-sm mb-4" style={{ background: COLORS.card, color: COLORS.text, border: `1px solid ${COLORS.border}` }}>
                Continuer avec Apple
              </button>

              <p className="text-[11px] text-center" style={{ color: COLORS.faint }}>
                <Info size={11} className="inline mr-1" />
                Prototype : vos identifiants restent dans votre navigateur et ne sont envoyés à aucun serveur.
              </p>
            </div>
          )}

          {screen === "intro" && (
            <div className="text-center py-10 px-6">
              <p className="font-display italic text-2xl leading-snug mb-3" style={{ color: COLORS.text }}>Le swipe vous fatigue.<br />La superficialité aussi.</p>
              <p className="text-sm mb-8" style={{ color: COLORS.muted }}>
                PhoenixLove classe les profils par compatibilité de valeurs, traduit vos conversations en temps réel,
                et affiche l'heure et la distance de la personne — pour des rencontres plus sûres et plus vraies.
              </p>
              <button onClick={() => setScreen("quiz")} className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm" style={{ background: COLORS.gold, color: COLORS.onGold }}>
                Commencer le quiz <ArrowRight size={16} />
              </button>
            </div>
          )}

          {screen === "quiz" && (
            <div className="p-6">
              <div className="flex gap-1 mb-6">{QUESTIONS.map((_, i) => <div key={i} className="h-1 flex-1 rounded-full" style={{ background: i <= qIndex ? COLORS.gold : COLORS.border }} />)}</div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: COLORS.faint }}>Question {qIndex + 1} / {QUESTIONS.length}</p>
              <p className="font-display text-xl mb-5" style={{ color: COLORS.text }}>{QUESTIONS[qIndex].q}</p>
              <div className="space-y-2">
                {QUESTIONS[qIndex].opts.map((o) => (
                  <button key={o.label} onClick={() => answerQuiz(o.tag)} className="w-full text-left px-4 py-3 rounded-xl text-sm" style={{ background: COLORS.card, color: COLORS.text, border: `1px solid ${COLORS.border}` }}>{o.label}</button>
                ))}
              </div>
            </div>
          )}

          {screen === "app" && tab === "discover" && (
            <div className="p-5 h-full flex flex-col">
              {showSafety && (
                <div className="mb-3 px-3 py-2 rounded-xl flex items-start gap-2 text-xs" style={{ background: "rgba(201,154,62,0.12)", color: COLORS.gold }}>
                  <ShieldCheck size={14} className="mt-0.5 flex-shrink-0" />
                  <span className="flex-1">Les photos sont visibles par tous jusqu'à 10 matchs par jour, puis floutées jusqu'au lendemain (sauf VIP+). Rencontrez-vous en lieu public.</span>
                  <button onClick={() => setShowSafety(false)}><X size={13} /></button>
                </div>
              )}
              {current ? (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs uppercase tracking-widest" style={{ color: COLORS.faint }}>{queue.length} profils</p>
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(201,154,62,0.15)", color: COLORS.gold }}>{score}% affinité</div>
                      <button onClick={() => setReportState({ profile: current, kind: "block" })} aria-label="Bloquer ce profil" className="p-1.5 rounded-full" style={{ background: COLORS.card }}>
                        <Ban size={13} color={COLORS.faint} />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-center mb-4">
                    <Avatar p={current} blurred={!premium && !vip && (stats.byDay[new Date().toDateString()]?.matches || 0) >= 10} size={110} />
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <p className="font-display text-2xl" style={{ color: COLORS.text }}>{current.name}</p>
                    <p className="text-sm" style={{ color: COLORS.muted }}>{current.age} ans</p>
                    {current.verified && <BadgeCheck size={15} color={COLORS.gold} />}
                  </div>
                  <p className="text-xs text-center mb-1" style={{ color: COLORS.faint }}>
                    {current.city} · {localTime(current.timezone)} {locationSharing && myCoords ? `· ${distanceKm(myCoords, { lat: current.lat, lon: current.lon })} km` : ""}
                  </p>
                  <p className="text-sm text-center mb-3" style={{ color: COLORS.muted }}>{current.bio}</p>
                  <Constellation userTags={userTags} profileTags={current.tags} size={160} />
                  <div className="flex gap-3 mt-auto pt-3">
                    <button onClick={pass} className="flex-1 py-3 rounded-full flex items-center justify-center gap-2 text-sm font-medium" style={{ background: COLORS.card, color: COLORS.muted, border: `1px solid ${COLORS.border}` }}><X size={16} /> Passer</button>
                    <button onClick={like} className="flex-1 py-3 rounded-full flex items-center justify-center gap-2 text-sm font-medium" style={{ background: COLORS.gold, color: COLORS.onGold }}><Heart size={16} /> Aimer</button>
                  </div>
                </>
              ) : (
                <div className="text-center py-16"><p className="font-display text-xl mb-2" style={{ color: COLORS.text }}>Plus de profils pour l'instant</p><p className="text-sm" style={{ color: COLORS.muted }}>Revenez plus tard pour de nouvelles affinités.</p></div>
              )}
            </div>
          )}

          {screen === "app" && tab === "matches" && (
            <div className="p-5 h-full overflow-y-auto">
              <p className="font-display text-xl mb-3" style={{ color: COLORS.text }}>Vos matchs</p>

              {(() => {
                const likedYou = PROFILES.filter((p) => p.mutual && !seenIds.includes(p.id) && !blockedIds.includes(p.id) && matchesPreference(p));
                if (likedYou.length === 0) return null;
                return (
                  <div className="mb-5 p-3 rounded-xl" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
                    <div className="flex items-center gap-2 mb-2"><Sparkles size={14} color={COLORS.gold} /><p className="text-sm font-medium" style={{ color: COLORS.text }}>Qui vous a aimé ({likedYou.length})</p></div>
                    {vip ? (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {likedYou.map((p) => (
                          <button key={p.id} onClick={() => { setQueue((q) => [p, ...q.filter((x) => x.id !== p.id)]); setTab("discover"); }} className="text-center flex-shrink-0">
                            <Avatar p={p} size={64} />
                            <p className="text-[10px] mt-1" style={{ color: COLORS.text }}>{p.name}</p>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {likedYou.map((p) => <div key={p.id} className="flex-shrink-0"><Avatar p={p} blurred size={64} /></div>)}
                        </div>
                        <button onClick={() => { setPayPending(false); setPayModal(true); }} className="mt-2 text-xs underline" style={{ color: COLORS.gold }}>Passez en VIP+ pour voir qui c'est</button>
                      </>
                    )}
                  </div>
                );
              })()}

              {matches.length === 0 ? <p className="text-sm" style={{ color: COLORS.muted }}>Aucun match pour l'instant — allez découvrir des profils !</p> : (
                <div className="grid grid-cols-3 gap-3">
                  {matches.map((m) => (
                    <button key={m.profile.id} onClick={() => openChat(m.profile.id)} className="text-center relative">
                      <Avatar p={m.profile} blurred={!m.revealed} size={90} />
                      {m.unread > 0 && <span className="absolute top-0 right-2 w-4 h-4 rounded-full flex items-center justify-center text-[9px]" style={{ background: "#C05B4E", color: "#fff" }}>{m.unread}</span>}
                      <p className="text-xs mt-1" style={{ color: COLORS.text }}>{m.profile.name}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {screen === "app" && tab === "messages" && !activeChatId && (
            <div className="p-5 h-full overflow-y-auto">
              <p className="font-display text-xl mb-4" style={{ color: COLORS.text }}>Messages</p>
              {matches.length === 0 ? <p className="text-sm" style={{ color: COLORS.muted }}>Vos conversations apparaîtront ici après un match.</p> : (
                <div className="space-y-1">
                  {matches.map((m) => {
                    const last = m.messages[m.messages.length - 1];
                    return (
                      <button key={m.profile.id} onClick={() => openChat(m.profile.id)} className="w-full flex items-center gap-3 p-2 rounded-xl text-left" style={{ background: COLORS.card }}>
                        <Avatar p={m.profile} blurred={!m.revealed} size={46} />
                        <div className="flex-1 overflow-hidden">
                          <div className="flex items-center gap-1"><p className="text-sm" style={{ color: COLORS.text }}>{m.profile.name}</p>{m.profile.verified && <BadgeCheck size={12} color={COLORS.gold} />}</div>
                          <p className="text-xs truncate" style={{ color: COLORS.faint }}>
                            {last ? (
                              last.type === "text" ? last.content
                              : last.type === "image" ? "📷 Photo"
                              : last.type === "video" ? "🎬 Vidéo"
                              : last.type === "audio" ? "🎙️ Message vocal"
                              : last.type === "call" ? (last.status === "missed" ? `📵 Appel ${last.callKind === "video" ? "vidéo" : "audio"} manqué` : `📞 Appel ${last.callKind === "video" ? "vidéo" : "audio"}`)
                              : ""
                            ) : "Dites bonjour 👋"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {screen === "app" && tab === "messages" && activeChatId && activeMatch && (
            <ChatScreen
              profile={activeMatch.profile}
              messages={activeMatch.messages}
              revealed={activeMatch.revealed}
              myCoords={locationSharing ? myCoords : null}
              typing={activeMatch.typing}
              onSend={(msg) => sendMessage(activeChatId, msg)}
              onBack={() => setActiveChatId(null)}
              onOpenReport={(kind) => setReportState({ profile: activeMatch.profile, kind })}
              onEditMessage={(id, content) => editMessage(activeChatId, id, content)}
              onDeleteMessage={(id) => deleteMessage(activeChatId, id)}
            />
          )}

          {screen === "app" && tab === "profile" && (
            <div className="p-5 h-full overflow-y-auto">
              <p className="font-display text-xl mb-4" style={{ color: COLORS.text }}>Votre profil</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  {myPhoto ? (
                    <img src={myPhoto} alt="Votre photo de profil" className="w-16 h-16 rounded-2xl object-cover"
                      style={{ filter: (!premium && !vip && (stats.byDay[new Date().toDateString()]?.matches || 0) >= 10) ? "blur(4px)" : "none" }} />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-display text-2xl" style={{ background: COLORS.gold, color: COLORS.onGold }}>Moi</div>
                  )}
                  {vip && <span className="absolute -bottom-1 -right-1 rounded-full px-1" style={{ background: COLORS.gold }}>👑</span>}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: COLORS.text }}>{userTags.length} valeurs identifiées</p>
                  <label htmlFor="my-photo-input" className="text-xs flex items-center gap-1 mt-1 cursor-pointer" style={{ color: COLORS.gold }}>
                    <ImageIcon size={12} /> {myPhoto ? "Changer ma photo" : "Ajouter une photo de profil"}
                  </label>
                  <input id="my-photo-input" type="file" accept="image/*" hidden onChange={async (e) => {
                    const file = e.target.files?.[0]; e.target.value = "";
                    if (!file) return;
                    const raw = await readFileAsDataURL(file);
                    const compressed = await compressImage(raw, 500, 0.75);
                    setMyPhoto(compressed);
                    window.storage.set("phoenixlove_myphoto", compressed, false).catch(() => {});
                    flash("Photo de profil mise à jour");
                  }} />
                </div>
              </div>
              {!premium && !vip && (stats.byDay[new Date().toDateString()]?.matches || 0) >= 10 && (
                <p className="text-[11px] mb-4" style={{ color: COLORS.faint }}>
                  Votre photo est floutée pour les nouveaux profils après 10 matchs aujourd'hui — elle redevient visible demain, ou avec VIP+.
                </p>
              )}

              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: COLORS.faint }}>Vos statistiques</p>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="p-3 rounded-xl" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
                  <p className="text-xl font-display" style={{ color: COLORS.gold }}>{stats.matchesTotal}</p>
                  <p className="text-[11px]" style={{ color: COLORS.muted }}>Matchs au total</p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
                  <p className="text-xl font-display" style={{ color: COLORS.gold }}>{stats.likesTotal}</p>
                  <p className="text-[11px]" style={{ color: COLORS.muted }}>J'aime envoyés</p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
                  <p className="text-xl font-display" style={{ color: COLORS.gold }}>{matches.length}</p>
                  <p className="text-[11px]" style={{ color: COLORS.muted }}>Conversations actives</p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
                  <p className="text-xl font-display" style={{ color: COLORS.gold }}>{stats.byDay[new Date().toDateString()]?.matches || 0}</p>
                  <p className="text-[11px]" style={{ color: COLORS.muted }}>Matchs aujourd'hui</p>
                </div>
              </div>
              <p className="text-[11px] mb-5" style={{ color: COLORS.faint }}>
                {premium ? "J'aime illimités activés ✨" : `${likeDate === new Date().toDateString() ? likesToday : 0}/${LIKE_LIMIT} j'aime utilisés aujourd'hui`}
              </p>
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: COLORS.faint }}>Bio</p>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full p-3 rounded-xl text-sm outline-none mb-4" style={{ background: COLORS.card, color: COLORS.text, border: `1px solid ${COLORS.border}` }} />

              <div className="flex items-center justify-between p-3 rounded-xl mb-2" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
                <div className="flex items-center gap-2"><MapPin size={15} color={COLORS.gold} /><span className="text-sm" style={{ color: COLORS.text }}>Partager ma position</span></div>
                <button onClick={toggleLocation} className="w-10 h-6 rounded-full relative" style={{ background: locationSharing ? COLORS.gold : COLORS.border }}>
                  <span className="absolute top-0.5 rounded-full w-5 h-5 transition-all" style={{ background: COLORS.text, left: locationSharing ? 18 : 2 }} />
                </button>
              </div>
              <p className="text-[11px] mb-4" style={{ color: COLORS.faint }}>
                {locationSharing ? "Activée — utilisée uniquement pour calculer une distance approximative, jamais transmise à un serveur." : "Désactivée par défaut. Vous devez l'activer explicitement pour voir la distance avec vos matchs."}
              </p>

              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: COLORS.faint }}>Vos valeurs</p>
              <div className="flex flex-wrap gap-2 mb-5">{userTags.map((t) => <span key={t} className="px-3 py-1 rounded-full text-xs" style={{ background: COLORS.card, color: COLORS.muted }}>{t}</span>)}</div>

              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: COLORS.faint }}>Préférences de rencontre</p>
              <div className="rounded-xl mb-2 p-3" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
                <p className="text-xs mb-1.5" style={{ color: COLORS.muted }}>Je suis</p>
                <div className="flex gap-2 mb-3">
                  {[{ v: "homme", l: "Un homme" }, { v: "femme", l: "Une femme" }].map((o) => (
                    <button key={o.v} onClick={() => setMyGender(o.v)} className="flex-1 py-2 rounded-full text-xs"
                      style={{ background: myGender === o.v ? COLORS.gold : COLORS.panel, color: myGender === o.v ? COLORS.bg : COLORS.muted, border: `1px solid ${COLORS.border}` }}>
                      {o.l}
                    </button>
                  ))}
                </div>
                <p className="text-xs mb-1.5" style={{ color: COLORS.muted }}>Je veux rencontrer</p>
                <div className="flex gap-2">
                  {[{ v: "hommes", l: "Hommes" }, { v: "femmes", l: "Femmes" }, { v: "les_deux", l: "Les deux" }].map((o) => (
                    <button key={o.v} onClick={() => setInterestedIn(o.v)} className="flex-1 py-2 rounded-full text-xs"
                      style={{ background: interestedIn === o.v ? COLORS.gold : COLORS.panel, color: interestedIn === o.v ? COLORS.bg : COLORS.muted, border: `1px solid ${COLORS.border}` }}>
                      {o.l}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-xs uppercase tracking-widest mb-2 mt-3" style={{ color: COLORS.faint }}>Notifications</p>
              <div className="flex items-center justify-between p-3 rounded-xl mb-5" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
                <span className="text-sm" style={{ color: COLORS.text }}>Notifications en temps réel</span>
                <button onClick={() => (notifOn ? setNotifOn(false) : enableNotifications())} aria-label={notifOn ? "Désactiver les notifications" : "Activer les notifications"} aria-pressed={notifOn}
                  className="w-10 h-6 rounded-full relative" style={{ background: notifOn ? COLORS.gold : COLORS.border }}>
                  <span className="absolute top-0.5 rounded-full w-5 h-5" style={{ background: COLORS.text, left: notifOn ? 18 : 2 }} />
                </button>
              </div>

              <div className="rounded-xl mb-5 p-4" style={{ background: vip ? "rgba(201,154,62,0.15)" : COLORS.card, border: `1px solid ${vip ? COLORS.gold : COLORS.border}` }}>
                <p className="font-display text-lg mb-1" style={{ color: COLORS.text }}>{vip ? "👑 Vous êtes VIP+" : "Passer VIP+"}</p>
                {!vip ? (
                  <>
                    <ul className="text-xs mb-3 space-y-1" style={{ color: COLORS.muted }}>
                      <li>• J'aime illimités</li>
                      <li>• Photo de profil jamais floutée</li>
                      <li>• Voir qui vous a déjà aimé·e</li>
                      <li>• Badge VIP visible sur votre profil</li>
                    </ul>
                    <button onClick={() => { setPayPending(false); setPayModal(true); }} className="w-full py-3 rounded-full text-sm font-medium" style={{ background: COLORS.gold, color: COLORS.onGold }}>Devenir VIP+ — 4,99€/mois</button>
                  </>
                ) : (
                  <p className="text-xs" style={{ color: COLORS.muted }}>Merci pour votre soutien ✨ Tous les avantages VIP+ sont actifs.</p>
                )}
              </div>

              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: COLORS.faint }}>Sécurité du compte</p>

              <div className="rounded-xl mb-2 overflow-hidden" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
                <div className="flex items-center justify-between p-3" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  <div className="flex items-center gap-2"><ShieldAlert size={15} color={COLORS.gold} /><span className="text-sm" style={{ color: COLORS.text }}>Authentification à deux facteurs</span></div>
                  <button onClick={() => { setTwoFactor((v) => !v); flash(twoFactor ? "2FA désactivée" : "2FA activée (démo)"); }}
                    aria-label={twoFactor ? "Désactiver la double authentification" : "Activer la double authentification"} aria-pressed={twoFactor}
                    className="w-10 h-6 rounded-full relative" style={{ background: twoFactor ? COLORS.gold : COLORS.border }}>
                    <span className="absolute top-0.5 rounded-full w-5 h-5" style={{ background: COLORS.text, left: twoFactor ? 18 : 2 }} />
                  </button>
                </div>
                <button onClick={() => flash("Email de changement de mot de passe envoyé (démo)")} className="w-full flex items-center gap-2 p-3 text-sm text-left" style={{ color: COLORS.text, borderBottom: `1px solid ${COLORS.border}` }}>
                  <Lock size={15} color={COLORS.muted} /> Changer le mot de passe
                </button>
                <button onClick={() => setLogoutConfirm(true)} className="w-full flex items-center gap-2 p-3 text-sm text-left" style={{ color: COLORS.text, borderBottom: `1px solid ${COLORS.border}` }}>
                  <LogOut size={15} color={COLORS.muted} /> Se déconnecter
                </button>
                <button onClick={() => setDeleteConfirm(true)} className="w-full flex items-center gap-2 p-3 text-sm text-left" style={{ color: "#C05B4E" }}>
                  <Trash2 size={15} /> Supprimer mon compte
                </button>
              </div>
              <p className="text-[11px] mb-1" style={{ color: COLORS.faint }}>Connecté·e en tant que {email || "invité·e"}.</p>
              {remembered && (
                <p className="text-[11px] mb-4 flex items-center gap-1" style={{ color: COLORS.faint }}>
                  Appareil mémorisé ({remembered.method === "email" ? "email" : remembered.method === "google" ? "Google" : "Apple"}) ·
                  <button onClick={forgetDevice} className="underline" style={{ color: COLORS.gold }}>oublier</button>
                </p>
              )}

              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: COLORS.faint }}>Apparence</p>
              <div className="flex items-center justify-between p-3 rounded-xl mb-5" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
                <span className="text-sm" style={{ color: COLORS.text }}>Thème {theme === "dark" ? "sombre" : "clair"}</span>
                <button onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} aria-label="Changer de thème"
                  className="px-3 py-1.5 rounded-full text-xs" style={{ background: COLORS.gold, color: COLORS.onGold }}>
                  Passer en {theme === "dark" ? "clair" : "sombre"}
                </button>
              </div>

              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: COLORS.faint }}>Aide</p>
              <button onClick={() => setSupportOpen(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-medium mb-2" style={{ background: COLORS.card, color: COLORS.text, border: `1px solid ${COLORS.border}` }}>
                <MessageCircle size={15} color={COLORS.gold} /> Contacter le support
              </button>

              {loginHistory.length > 0 && (
                <>
                  <p className="text-xs uppercase tracking-widest mb-2 mt-3" style={{ color: COLORS.faint }}>Historique de connexion</p>
                  <div className="rounded-xl mb-5 overflow-hidden" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
                    {loginHistory.map((h, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 text-xs" style={{ borderBottom: i < loginHistory.length - 1 ? `1px solid ${COLORS.border}` : "none" }}>
                        <span style={{ color: COLORS.text }}>{h.method}</span>
                        <span style={{ color: COLORS.faint }}>{h.time}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <button onClick={() => setSafetyModal(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-medium mb-2" style={{ background: COLORS.card, color: COLORS.text, border: `1px solid ${COLORS.border}` }}>
                <ShieldCheck size={15} color={COLORS.gold} /> Centre de sécurité
              </button>
              <p className="text-[11px] text-center"><Info size={11} className="inline mr-1" style={{ color: COLORS.faint }} /><span style={{ color: COLORS.faint }}>Prototype : aucune donnée n'est envoyée à un serveur.</span></p>
              <button onClick={openAdmin} className="text-[10px] w-full text-center mt-3" style={{ color: COLORS.faint }}>Panneau interne (démo)</button>
            </div>
          )}

          {matchOverlay && (
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center p-6 text-center" style={{ background: "rgba(28,22,32,0.97)" }}>
              <p className="font-display italic text-2xl mb-1" style={{ color: COLORS.gold }}>C'est une affinité !</p>
              <p className="text-sm mb-5" style={{ color: COLORS.muted }}>Vous et {matchOverlay.profile.name} avez {matchOverlay.profile.tags.filter((t) => userTags.includes(t)).length} valeurs en commun.</p>
              <Constellation userTags={userTags} profileTags={matchOverlay.profile.tags} />
              <button onClick={() => openChat(matchOverlay.profile.id)} className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm" style={{ background: COLORS.gold, color: COLORS.onGold }}><MessageCircle size={16} /> Démarrer la conversation</button>
              <button onClick={() => setMatchOverlay(null)} className="mt-3 text-xs" style={{ color: COLORS.faint }}>Continuer à découvrir</button>
            </div>
          )}

          {safetyModal && <SafetyModal onClose={() => setSafetyModal(false)} />}
          {reportState && <ReportModal profile={reportState.profile} kind={reportState.kind} onClose={() => setReportState(null)} onConfirm={confirmModeration} />}
          {logoutConfirm && <ConfirmModal title="Se déconnecter ?" message="Vous devrez vous reconnecter pour retrouver vos matchs et vos conversations." confirmLabel="Se déconnecter" onClose={() => setLogoutConfirm(false)} onConfirm={logout} />}
          {deleteConfirm && <ConfirmModal title="Supprimer votre compte ?" message="Cette action est irréversible : profil, matchs et conversations seront définitivement supprimés." confirmLabel="Supprimer" danger onClose={() => setDeleteConfirm(false)} onConfirm={deleteAccount} />}
          {supportOpen && <SupportModal draft={supportDraft} setDraft={setSupportDraft} onClose={() => setSupportOpen(false)} onSend={sendSupportMessage} />}
          {limitModal && <LimitModal onClose={() => setLimitModal(false)} onUpgrade={upgradeToPremium} />}
          {payModal && <PaymentModal payRef={payRef} setPayRef={setPayRef} pending={payPending} onClose={() => setPayModal(false)} onSubmit={submitPayment} />}
          {adminOpen && <AdminModal pending={pendingPayments} onClose={() => setAdminOpen(false)} onApprove={approvePayment} onReject={rejectPayment} />}
          {showWelcome && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-8 text-center" style={{ background: "rgba(28,22,32,0.98)" }}>
              <Sparkles size={32} color={COLORS.gold} className="mb-3" />
              <p className="font-display italic text-2xl mb-2" style={{ color: COLORS.text }}>Bienvenue sur PhoenixLove{email ? `, ${email.split("@")[0]}` : ""} !</p>
              <p className="text-sm mb-6 max-w-xs" style={{ color: COLORS.muted }}>
                Un email de confirmation a été envoyé à {email || "votre adresse"} (démo — aucun email réel n'est envoyé sans serveur connecté).
                Répondez au petit quiz pour trouver vos premières affinités.
              </p>
              <button onClick={() => { setShowWelcome(false); setScreen("quiz"); }} className="px-6 py-3 rounded-full text-sm font-medium" style={{ background: COLORS.gold, color: COLORS.onGold }}>
                Commencer
              </button>
            </div>
          )}
          <Toast text={toast} />
        </div>

        {screen === "app" && (
          <div className="flex items-center justify-around py-3" role="navigation" aria-label="Navigation principale" style={{ borderTop: `1px solid ${COLORS.border}`, background: COLORS.panel }}>
            {[
              { key: "discover", label: "Découvrir", icon: Compass },
              { key: "matches", label: "Matchs", icon: Heart },
              { key: "messages", label: "Messages", icon: MessageCircle },
              { key: "profile", label: "Profil", icon: User },
            ].map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => { setTab(key); if (key !== "messages") setActiveChatId(null); }}
                className="flex flex-col items-center gap-1 relative" aria-label={label} aria-current={tab === key ? "page" : undefined}>
                <div className="relative">
                  <Icon size={19} color={tab === key ? COLORS.gold : COLORS.faint} />
                  {key === "messages" && matches.reduce((a, m) => a + (m.unread || 0), 0) > 0 && (
                    <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full flex items-center justify-center text-[9px]" style={{ background: "#C05B4E", color: "#fff" }}>
                      {matches.reduce((a, m) => a + (m.unread || 0), 0)}
                    </span>
                  )}
                </div>
                <span className="text-[10px]" style={{ color: tab === key ? COLORS.gold : COLORS.faint }}>{label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
