# Configuration de l'API

## Intégration d'une vraie API

Pour alimenter l'onglet Classement avec de vraies données en live, vous pouvez utiliser l'une des APIs suivantes :

### 1. Google Play Store API (Android)
```javascript
// Dans src/utils/apiService.js
export const fetchTopAppsInFrance = async () => {
  const response = await fetch('https://play.google.com/store/apps/collection/topselling_free?hl=fr&gl=FR');
  // Parser le HTML ou utiliser une API tierce
  return data;
};
```

### 2. App Store Connect API (iOS)
```javascript
// Nécessite une clé API Apple
const response = await fetch('https://api.appstoreconnect.apple.com/v1/apps', {
  headers: {
    'Authorization': `Bearer ${YOUR_API_KEY}`
  }
});
```

### 3. APIs tierces (recommandé)

#### data.ai (anciennement App Annie)
- https://www.data.ai/en/product/intelligence/
- Fournit des données de classement d'apps
- Payant mais très complet

#### 42matters
- https://42matters.com/
- API gratuite limitée disponible
- Données App Store et Play Store

#### Sensor Tower
- https://sensortower.com/
- Données de marché d'applications mobiles

### 4. Scraping (utiliser avec précaution)
```javascript
// Exemple avec un service de scraping
const response = await fetch('https://api.scraperapi.com/?api_key=YOUR_KEY&url=https://play.google.com/store/apps/collection/topselling_free?hl=fr&gl=FR');
```

## Configuration actuelle

Le fichier `src/utils/apiService.js` contient actuellement une simulation d'API.
Pour passer en production :

1. Choisissez une API
2. Obtenez vos clés d'accès
3. Remplacez la fonction `fetchTopAppsInFrance` dans `src/utils/apiService.js`
4. Ajoutez vos clés API dans un fichier `.env` :
   ```
   VITE_API_KEY=votre_clé_api
   VITE_API_URL=https://api.example.com
   ```
5. Utilisez les variables d'environnement dans le code :
   ```javascript
   const apiKey = import.meta.env.VITE_API_KEY;
   ```

## Rafraîchissement automatique

Le système rafraîchit automatiquement les données toutes les heures.
Pour modifier l'intervalle, changez le paramètre dans `useAppManagement.js` :

```javascript
setupAutoRefresh((data) => {
  setTopApps(data);
  setLastUpdate(new Date());
}, 30); // 30 minutes au lieu de 60
```
