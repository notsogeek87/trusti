/**
 * Outils opérés par l'État (DINUM, ministères), signalés par un badge
 * « Service de l'État » dans l'évaluation d'une organisation : un argument
 * de confiance pour une mairie ou une administration. Ids de la table
 * applications ; un id absent du catalogue est simplement ignoré.
 * Ce badge ne dit rien de l'accès : certains sont réservés aux agents publics.
 */
export const PUBLIC_SERVICE_IDS = new Set([
  'tchap',
  'la-suite-docs',
  'la-suite-fichiers',
  'la-suite-visio',
  'grist-la-suite',
  'demarches-simplifiees',
  'chorus-pro',
  'france-transfert',
]);

export const isPublicService = app => Boolean(app && PUBLIC_SERVICE_IDS.has(String(app.id)));
