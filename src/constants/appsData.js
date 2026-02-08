/**
 * Base de données des applications
 * Contient les données de toutes les applications évaluées
 */
export const APPS_DATA = [
  { 
    id: 1, 
    name: "ChatGPT", 
    category: "IA", 
    grade: "B", 
    color: "bg-slate-800", 
    icon: "🤖", 
    reason: "Hébergé aux USA mais propose des options de confidentialité avancées.", 
    alternative: "Mistral (Le Chat)", 
    altIcon: "🐈" 
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
    altIcon: "🇫🇷" 
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
    altIcon: "🐘" 
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
    altIcon: "🔵" 
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
    altIcon: "🖼️" 
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
    altIcon: "🦊" 
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
    altIcon: "🧬" 
  },
  { 
    id: 1001, 
    name: "Signal", 
    category: "Communication", 
    grade: "A", 
    color: "bg-blue-600", 
    icon: "💬", 
    reason: "Fondation à but non lucratif, code 100% open-source." 
  },
  { 
    id: 1002, 
    name: "Proton Mail", 
    category: "Communication", 
    grade: "A", 
    color: "bg-purple-700", 
    icon: "📧", 
    reason: "Juridiction Suisse, chiffrement zero-knowledge." 
  },
  { 
    id: 1003, 
    name: "Brave", 
    category: "Navigateur", 
    grade: "A", 
    color: "bg-orange-500", 
    icon: "🦁", 
    reason: "Bloqueur natif de pubs et trackers. Respect strict de la vie privée." 
  },
  { 
    id: 1004, 
    name: "Firefox", 
    category: "Navigateur", 
    grade: "A", 
    color: "bg-orange-600", 
    icon: "🦊", 
    reason: "Navigateur open-source centré sur la vie privée. Protection forte contre le suivi." 
  },
  { 
    id: 1010, 
    name: "Mistral (Le Chat)", 
    category: "IA / Productivité", 
    grade: "A", 
    color: "bg-orange-200", 
    icon: "🐈", 
    reason: "IA Française performante, alternative directe à OpenAI." 
  }
];
