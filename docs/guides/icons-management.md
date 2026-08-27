# 🎨 Gestion automatique des icônes

## Comment ça marche ?

Le système récupère **automatiquement** les icônes officielles depuis le Google Play Store en utilisant le package ID.

## Pour l'admin

### Ajouter une nouvelle app

Quand vous ajoutez une app via l'interface admin, indiquez simplement :
- Le **lien Play Store** complet : `https://play.google.com/store/apps/details?id=com.example.app`

Le système va extraire le package ID (`com.example.app`) et récupérer automatiquement l'icône officielle.

### Mettre à jour toutes les icônes

Si certaines icônes ne s'affichent pas correctement, exécutez :

```bash
npm run icons:fetch
```

Ce script va :
1. ✅ Détecter les icônes manquantes ou problématiques
2. 🔍 Récupérer les package IDs depuis les URLs Play Store
3. 📥 Télécharger les icônes officielles depuis le Play Store
4. 💾 Mettre à jour automatiquement les fichiers JSON

## Avantages

✅ **Automatique** : Pas besoin de chercher et copier les URLs d'icônes  
✅ **Officielles** : Les icônes viennent directement du Play Store  
✅ **Fiables** : Pas de problèmes CORS ou de liens brisés  
✅ **Simple** : Juste le lien Play Store suffit  

## Pour les développeurs

Le script est dans : `server/database/fetch-icons-playstore.js`

Il utilise `google-play-scraper` pour récupérer les métadonnées des apps depuis le Play Store.
