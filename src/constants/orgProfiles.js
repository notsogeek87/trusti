/**
 * Profils d'organisation de la page « Évaluer mon organisation ».
 *
 * Chaque profil liste les outils les plus courants dans ce type de structure
 * (ids de la table applications, apps « usage pro »), affichés en tête pour
 * cocher plus vite. Ce sont des outils fréquemment utilisés, pas des
 * recommandations. Un id absent du catalogue est simplement ignoré.
 */
export const ORG_PROFILES = [
  {
    id: 'association',
    label: 'Association',
    appIds: [
      '1769803097037', '1769879213451', '1769805796367', 'google-docs', '71a420ff-f3fd-4dac-8ab0-76047e4fd8aa',
      'dedf893d-f0d2-4abf-b7e5-e8e0de70696d', 'app_1770825788594_sat7dxsru', 'doodle', 'zoom', 'mailchimp', 'brevo',
      'wordpress-com', 'qonto', '1780761664182', 'microsoft-excel', '1769540367871', '1769805620267', '1770752284146',
    ],
  },
  {
    id: 'collectivite',
    label: 'Collectivité, administration',
    appIds: [
      'outlook', 'microsoft-teams', '1780761664182', 'microsoft-excel', 'microsoft-powerpoint', 'microsoft-sharepoint',
      'onedrive', 'tchap', 'webex', 'zoom', 'libreoffice', 'yousign', 'universign', 'glpi', 'doodle',
      '1769805919501', 'firefox', '1769805620267', 'app_1770825764543_wf8m0sp37', '1770752284146',
    ],
  },
  {
    id: 'entreprise',
    label: 'Entreprise, PME',
    appIds: [
      'outlook', 'microsoft-teams', '1780761664182', 'microsoft-excel', 'microsoft-powerpoint', 'onedrive',
      '1769803097037', '1769805796367', 'google-docs', 'slack', 'zoom', 'salesforce', 'hubspot', 'pipedrive',
      'payfit-rh', 'lucca', 'swile', 'pennylane', 'sage', 'qonto', 'docusign', 'yousign',
      'app_1770825762747_0vzkh4zmk', 'trello', 'dropbox', 'linkedin', '1password', 'teamviewer', '1769805620267', 'app_1770825764543_wf8m0sp37', '1770752284146',
    ],
  },
  {
    id: 'sante',
    label: 'Santé, médico-social',
    appIds: [
      'outlook', '1769803097037', '1769879213451', 'microsoft-teams', 'zoom', '1780761664182', 'microsoft-excel',
      '1769805796367', 'dropbox', '1769540367871', '0678b7ca-7f61-43f9-ba27-c93d800166d5', 'yousign', 'docusign',
      'alan', 'silae', '1769804898711', '1769805620267', '1770752284146',
    ],
  },
  {
    id: 'enseignement',
    label: 'Enseignement, formation',
    appIds: [
      'moodle', 'microsoft-teams', 'zoom', 'bigbluebutton', 'google-docs', '1769805796367', '1769803097037',
      'outlook', '1780761664182', 'microsoft-powerpoint', 'app_1770825788594_sat7dxsru', '1769805620267',
      'dendreo', 'ypareo', 'libreoffice', 'jitsi-meet', '1770752284146',
    ],
  },
];

/** Apps du catalogue suggérées pour un profil, dans l'ordre du profil. */
export function profileApps(profileId, appsById) {
  const profile = ORG_PROFILES.find(p => p.id === profileId);
  if (!profile) return [];
  return profile.appIds.map(id => appsById.get(String(id))).filter(Boolean);
}
