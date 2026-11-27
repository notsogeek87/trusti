/**
 * Service de base de données PostgreSQL.
 *
 * Façade : le code est réparti par domaine dans server/database/postgres/
 * (lecture, écriture, relations, données associées, mise en forme).
 */
import { initDatabase } from './postgres/schema-init.js';
import { getAllApps, getAppsByType, getAppsByGrade, getAwardsApps, getOnboardingApps, getProApps, getAppById, getAppsByIds, getAlternativesForApp, searchApps, getStats } from './postgres/apps-read.js';
import { saveToolSuggestion, getAssessmentForApp, getGradeHistoryForApp, getGradeChangesSince, getMigrationGuide, getProfileIndex } from './postgres/app-insights.js';
import { createApp, updateApp, deleteApp } from './postgres/apps-write.js';
import { getEventsSince, getEventsForApp, getProposedEvents, proposeAppEvent, setAppEventStatus } from './postgres/app-events.js';

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
  getProfileIndex,
  getGradeHistoryForApp,
  getGradeChangesSince,
  getMigrationGuide,
  getEventsSince,
  getEventsForApp,
  getProposedEvents,
  proposeAppEvent,
  setAppEventStatus,
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
  getProfileIndex,
  getGradeHistoryForApp,
  getGradeChangesSince,
  getMigrationGuide,
  getEventsSince,
  getEventsForApp,
  getProposedEvents,
  proposeAppEvent,
  setAppEventStatus,
  createApp,
  updateApp,
  deleteApp,
  searchApps,
  getStats,
};
