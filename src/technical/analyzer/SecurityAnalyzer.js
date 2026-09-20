import { createSecurityInfo } from '../model/SecurityInfo.js';

/**
 * Normalise les paramètres de sécurité bruts en SecurityInfo. N'émet jamais de
 * verdict ("sécurisée"/"non sécurisée") — uniquement des caractéristiques
 * factuelles, avec leurs limites documentées dans le modèle lui-même.
 * @param {import('../source/RawPackageData').RawPackageData} rawData
 * @returns {import('../model/SecurityInfo').SecurityInfo}
 */
export function analyzeSecurity(rawData) {
  return createSecurityInfo(rawData.security, rawData.appInfo, rawData.componentCounts);
}

export default analyzeSecurity;
