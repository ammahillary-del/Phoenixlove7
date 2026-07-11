// api/notify-admin.js
// Fonction serverless Vercel — reçoit une demande de paiement VIP+ côté client
// et la relaie vers votre Telegram, sans jamais exposer le token du bot.
//
// Déploiement : placez ce fichier dans un dossier /api à la racine de votre
// projet Vite. Vercel le transforme automatiquement en endpoint réel.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { email, reference } = req.body || {};
  if (!reference) {
    return res.status(400).json({ error: "Référence de paiement manquante" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    // Variables d'environnement non configurées : on ne bloque pas
    // l'utilisateur, mais on log l'info côté serveur pour debug.
    console.error("TELEGRAM_BOT_TOKEN ou TELEGRAM_CHAT_ID manquant");
    return res.status(200).json({ ok: false, reason: "not_configured" });
  }

  const text = `🔔 Nouvelle demande VIP+\nEmail : ${email || "non renseigné"}\nRéférence : ${reference}\nHeure : ${new Date().toLocaleString("fr-FR")}`;

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    const data = await tgRes.json();
    if (!data.ok) {
      console.error("Erreur Telegram:", data);
      return res.status(200).json({ ok: false, reason: "telegram_error" });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Erreur réseau Telegram:", err);
    return res.status(200).json({ ok: false, reason: "network_error" });
  }
}
