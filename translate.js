// api/translate.js
// Fonction serverless Vercel pour la traduction en direct une fois le site
// déployé. Dans l'aperçu Claude.ai, l'app appelle l'API Anthropic
// directement — cela ne fonctionne plus une fois hors de Claude.ai (pas de
// clé API disponible côté navigateur, et pour cause : elle doit rester
// secrète). Cette fonction sert de relais sécurisé.
//
// Prérequis : un compte sur console.anthropic.com, une clé API, ajoutée
// comme variable d'environnement ANTHROPIC_API_KEY sur Vercel.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { text, targetLabel } = req.body || {};
  if (!text) {
    return res.status(400).json({ error: "Texte manquant" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(200).json({ ok: false, error: "Clé API non configurée sur le serveur" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 500,
        messages: [{
          role: "user",
          content: `Traduis ce message en ${targetLabel || "français"}. Réponds uniquement avec la traduction, sans guillemets ni texte additionnel:\n\n${text}`,
        }],
      }),
    });
    const data = await response.json();
    if (!response.ok || data?.error) {
      return res.status(200).json({ ok: false, error: data?.error?.message || `Erreur HTTP ${response.status}` });
    }
    const out = (data?.content || []).map((c) => c.text || "").join("").trim();
    if (!out) return res.status(200).json({ ok: false, error: "Réponse vide" });
    return res.status(200).json({ ok: true, text: out });
  } catch (err) {
    return res.status(200).json({ ok: false, error: "Erreur réseau côté serveur" });
  }
}
