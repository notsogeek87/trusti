import * as dotenv from 'dotenv';
// Charger les variables d'environnement EN PREMIER
dotenv.config();

import express from 'express';

// Serveur de dev local : monte directement les fonctions serverless Vercel
// (api/*.js) comme routes Express. Elles sont l'unique source de vérité :
// dupliquer leur logique ici ferait diverger dev et prod à chaque évolution
// (c'est déjà arrivé — le rate-limiting OTP n'existait que d'un côté).
import appsHandler from '../api/apps.js';
import customTrustiAppsHandler from '../api/custom-trusti-apps.js';
import starAppsHandler from '../api/star-apps.js';
import trustiAppsHandler from '../api/trusti-apps.js';
import topAppsHandler from '../api/top-apps.js';
import cleanDuplicatesHandler from '../api/clean-duplicates.js';
import lookupPlayStoreHandler from '../api/lookup-playstore.js';

const app = express();
const PORT = 3001;

app.use(express.json());

app.all('/api/apps', appsHandler);
app.all('/api/custom-trusti-apps', customTrustiAppsHandler);
app.all('/api/star-apps', starAppsHandler);
app.all('/api/trusti-apps', trustiAppsHandler);
app.all('/api/top-apps', topAppsHandler);
app.all('/api/clean-duplicates', cleanDuplicatesHandler);
app.all('/api/lookup-playstore', lookupPlayStoreHandler);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Trusti API running on http://localhost:${PORT}`);
});
