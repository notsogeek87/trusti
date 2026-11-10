/**
 * Service de base de données PostgreSQL via Neon pour Vercel.
 *
 * Façade : le code est réparti par domaine dans server/database/postgres/
 * (lecture, écriture, relations, données associées, mise en forme).
 */
import { initDatabase } from './postgres/schema-init.js';
import { getAllApps, getAppsByType, getAppsByGrade, getAwardsApps, getOnboardingApps, getProApps, getAppById, getAppsByIds, getAlternativesForApp, searchApps, getStats } from './postgres/apps-read.js';
import { saveToolSuggestion, getAssessmentForApp, getGradeHistoryForApp, getGradeChangesSince, getMigrationGuide } from './postgres/app-insights.js';
import { createApp, updateApp, deleteApp } from './postgres/apps-write.js';

export {
  initDatabase,
  getAllApps,
  getAppsByType,
  getAppsByGrade,
  getAwardsApps,
  getOnboardingApps,
  getProApps,
  saveToolSuggestion,
  getAppById,
  getAppsByIds,
  getAlternativesForApp,
  getAssessmentForApp,
  getGradeHistoryForApp,
  getGradeChangesSince,
  getMigrationGuide,
  createApp,
  updateApp,
  deleteApp,
  searchApps,
  getStats,
};

export default {
  initDatabase,
  getAllApps,
  getAppsByType,
  getAppsByGrade,
  getAwardsApps,
  getOnboardingApps,
  getProApps,
  saveToolSuggestion,
  getAppById,
  getAppsByIds,
  getAlternativesForApp,
  getAssessmentForApp,
  getGradeHistoryForApp,
  getGradeChangesSince,
  getMigrationGuide,
  createApp,
  updateApp,
  deleteApp,
  searchApps,
  getStats,
};
