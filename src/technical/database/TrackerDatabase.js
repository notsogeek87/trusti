import { SignatureDatabase } from './SignatureDatabase.js';
import { ALL_SIGNATURES } from './signatures/index.js';

/**
 * Façade interrogeant uniquement les signatures classées comme trackers
 * (publicité, mesure d'audience, attribution, engagement).
 */
export const TrackerDatabase = new SignatureDatabase(
  ALL_SIGNATURES.filter((s) => !!s.trackerCategory)
);

export default TrackerDatabase;
