/**
 * Service API pour récupérer les données des applications
 */

/**
 * Simule un appel API pour récupérer le top des apps en France
 * TODO: Remplacer par une vraie API (Google Play Store, App Store, etc.)
 * 
 * APIs possibles :
 * - Google Play Store API
 * - App Store Connect API
 * - API tierces : data.ai, Sensor Tower, etc.
 */
export const fetchTopAppsInFrance = async () => {
  // Simulation d'un délai réseau
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Données simulées - À remplacer par un vrai appel API
  // Exemple avec fetch vers une API :
  // const response = await fetch('https://api.example.com/top-apps/france');
  // return await response.json();
  
  return [
    { 
      id: 1, 
      name: "ChatGPT", 
      category: "IA / Productivité", 
      grade: "B", 
      color: "bg-slate-800", 
      icon: "🤖", 
      reason: "Hébergé aux USA mais propose des options de confidentialité avancées.", 
      alternative: "Mistral (Le Chat)", 
      altIcon: "🐈",
      rank: 1,
      downloads: "10M+"
    },
    { 
      id: 2, 
      name: "Temu", 
      category: "E-commerce", 
      grade: "E", 
      color: "bg-orange-600", 
      icon: "🛍️", 
      reason: "Collecte massive de données et opacité totale sur les métadonnées.", 
      alternative: "Leboncoin", 
      altIcon: "🇫🇷",
      rank: 2,
      downloads: "50M+"
    },
    { 
      id: 4, 
      name: "TikTok", 
      category: "Réseaux Sociaux", 
      grade: "E", 
      color: "bg-black", 
      icon: "📱", 
      reason: "Transfert de données vers des juridictions non-équivalentes RGPD.", 
      alternative: "Mastodon", 
      altIcon: "🐘",
      rank: 3,
      downloads: "100M+"
    },
    { 
      id: 5, 
      name: "WhatsApp", 
      category: "Communication", 
      grade: "C", 
      color: "bg-green-500", 
      icon: "💬", 
      reason: "Chiffrement de bout en bout mais partage de métadonnées avec Meta.", 
      alternative: "Signal", 
      altIcon: "🔵",
      rank: 4,
      downloads: "500M+"
    },
    { 
      id: 7, 
      name: "Instagram", 
      category: "Réseaux Sociaux", 
      grade: "D", 
      color: "bg-pink-600", 
      icon: "📸", 
      reason: "Exploitation commerciale des données visuelles pour ciblage publicitaire.", 
      alternative: "Pixelfed", 
      altIcon: "🖼️",
      rank: 5,
      downloads: "200M+"
    },
    { 
      id: 8, 
      name: "Google Chrome", 
      category: "Navigateur", 
      grade: "D", 
      color: "bg-white", 
      icon: "🌐", 
      reason: "Suivi intensif de l'historique et des habitudes par Google.", 
      alternative: "Firefox", 
      altIcon: "🦊",
      rank: 6,
      downloads: "1B+"
    },
    { 
      id: 9, 
      name: "OneDrive", 
      category: "Cloud / Stockage", 
      grade: "D", 
      color: "bg-blue-600", 
      icon: "☁️", 
      reason: "Soumis au Cloud Act américain, lecture possible des fichiers.", 
      alternative: "Proton Drive", 
      altIcon: "🧬",
      rank: 7,
      downloads: "100M+"
    },
    {
      id: 10,
      name: "Facebook",
      category: "Réseaux Sociaux",
      grade: "D",
      color: "bg-blue-700",
      icon: "📘",
      reason: "Collecte massive de données personnelles et profilage publicitaire.",
      alternative: "Mastodon",
      altIcon: "🐘",
      rank: 8,
      downloads: "500M+"
    },
    {
      id: 11,
      name: "Snapchat",
      category: "Réseaux Sociaux",
      grade: "D",
      color: "bg-yellow-400",
      icon: "👻",
      reason: "Collecte de données de localisation et partage avec des tiers.",
      alternative: "Signal",
      altIcon: "🔵",
      rank: 9,
      downloads: "100M+"
    },
    {
      id: 12,
      name: "Spotify",
      category: "Musique",
      grade: "C",
      color: "bg-green-600",
      icon: "🎵",
      reason: "Collecte de données d'écoute pour publicité ciblée.",
      alternative: "Deezer",
      altIcon: "🎶",
      rank: 10,
      downloads: "500M+"
    }
  ];
};

/**
 * Rafraîchit les données périodiquement
 */
export const setupAutoRefresh = (callback, intervalMinutes = 60) => {
  const intervalId = setInterval(async () => {
    const data = await fetchTopAppsInFrance();
    callback(data);
  }, intervalMinutes * 60 * 1000);
  
  return () => clearInterval(intervalId);
};
