import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PRIORITY,
  eventPriority,
  isCriticalEvent,
  buildInboxItems,
  buildMonthlyDigest,
  isDigestEmpty,
  initialInboxState,
  unreadItems,
  markRead,
  buildMigrationSync,
  MIGRATION_REMINDER_DAYS,
} from '../../src/utils/notificationInbox.js';

const NOW = Date.parse('2026-11-19T12:00:00Z');
const DAY = 24 * 60 * 60 * 1000;

const event = (over = {}) => ({
  id: '1', appId: 'w', appName: 'WhatsApp', type: 'incident', impact: 'negative', severity: 'high',
  title: 'Fuite', summary: null, sourceUrl: 'https://x.fr', date: '2026-11-17', publishedAt: '2026-11-18',
  ...over,
});

test('priorités : fuite grave critique, puis négatif, puis positif, neutre', () => {
  assert.equal(eventPriority(event()), PRIORITY.EVENT_CRITICAL);
  assert.equal(isCriticalEvent(event()), true);
  assert.equal(isCriticalEvent(event({ severity: 'medium' })), false);
  assert.equal(eventPriority(event({ severity: 'medium' })), PRIORITY.EVENT_NEGATIVE);
  assert.equal(eventPriority(event({ severity: 'low' })), PRIORITY.EVENT_NEGATIVE_LOW);
  assert.equal(eventPriority(event({ impact: 'positive' })), PRIORITY.EVENT_POSITIVE);
  assert.equal(eventPriority(event({ impact: 'neutral' })), PRIORITY.EVENT_NEUTRAL);
  assert.ok(PRIORITY.GRADE_DOWN > PRIORITY.MIGRATION_REMINDER && PRIORITY.MIGRATION_REMINDER > PRIORITY.NUDGE);
});

test('buildInboxItems : seulement mes apps, du plus récent au plus ancien', () => {
  const items = buildInboxItems({
    events: [event(), event({ id: '2', appId: 'autre' })],
    gradeChanges: [
      { appId: 'g', name: 'Gmail', previousGrade: 'C', grade: 'D', date: '2026-11-10' },
      { appId: 's', name: 'Signal', previousGrade: 'B', grade: 'A', date: '2026-11-12' },
      { appId: 'w', name: 'WhatsApp', previousGrade: 'C', grade: 'C', date: '2026-11-13' },
    ],
    myAppIds: new Set(['w', 'g', 's']),
    now: NOW,
  });
  assert.deepEqual(items.map(i => i.key), ['event:1', 'grade:s:2026-11-12:A', 'grade:g:2026-11-10:D']);
  assert.equal(items[1].impact, 'positive');
  assert.equal(items[2].impact, 'negative');
  assert.equal(items[2].priority, PRIORITY.GRADE_DOWN);
});

test('buildInboxItems : relance de migration seulement après le délai, clé liée au progrès', () => {
  const migration = { appId: 'w', appName: 'WhatsApp', altName: 'Signal', completed: 2, total: 4 };
  const fresh = buildInboxItems({ myAppIds: ['w'], migrations: [{ ...migration, updatedAt: NOW - 2 * DAY }], now: NOW });
  assert.equal(fresh.length, 0);
  const stale = buildInboxItems({ myAppIds: ['w'], migrations: [{ ...migration, updatedAt: NOW - (MIGRATION_REMINDER_DAYS + 1) * DAY }], now: NOW });
  assert.equal(stale.length, 1);
  assert.equal(stale[0].key, 'rem:w:2'); // même clé que la relance du téléphone
  assert.equal(stale[0].kind, 'migration');
  // Ancien parcours sans date : pas de relance (on ne sait pas depuis quand il est arrêté)
  assert.equal(buildInboxItems({ myAppIds: ['w'], migrations: [migration], now: NOW }).length, 0);
});

test('buildInboxItems : historique natif repris, types inconnus ignorés, doublons retirés', () => {
  const nativeHistory = [
    { key: 'install:tiktok:1', kind: 'install', appId: 'tiktok', appName: 'TikTok', at: NOW - DAY, title: 'TikTok est noté E', text: 'x', priority: 60 },
    { key: 'install:tiktok:1', kind: 'install', appId: 'tiktok', appName: 'TikTok', at: NOW - DAY, title: 'dup', text: 'x' },
    { key: 'bizarre', kind: 'autre', at: NOW },
  ];
  const items = buildInboxItems({ myAppIds: [], nativeHistory, now: NOW });
  assert.equal(items.length, 1);
  assert.equal(items[0].key, 'install:tiktok:1');
  assert.equal(items[0].native, true);
  assert.equal(items[0].impact, 'negative');
  assert.equal(items[0].data.title, 'TikTok est noté E');
});

test('buildMonthlyDigest : compte les 30 derniers jours', () => {
  const items = [
    { kind: 'grade', impact: 'negative', date: '2026-11-10' },
    { kind: 'grade', impact: 'positive', date: '2026-11-11' },
    { kind: 'event', impact: 'negative', date: '2026-11-12' },
    { kind: 'event', impact: 'neutral', date: '2026-11-12' },
    { kind: 'migrationDone', impact: 'positive', date: '2026-11-15' },
    { kind: 'grade', impact: 'negative', date: '2026-09-01' }, // trop ancien
  ];
  const digest = buildMonthlyDigest(items, NOW);
  assert.deepEqual(digest, { gradeDown: 1, gradeUp: 1, eventsNegative: 1, eventsPositive: 0, risky: 0, migrationsDone: 1 });
  assert.equal(isDigestEmpty(digest), false);
  assert.equal(isDigestEmpty(buildMonthlyDigest([], NOW)), true);
});

test('état lu : premier passage tout lu, puis seuls les nouveaux sont non lus', () => {
  const before = [{ key: 'a' }, { key: 'b' }];
  const state = initialInboxState(before);
  assert.deepEqual(unreadItems(before, state), []);
  const after = [{ key: 'c' }, ...before];
  assert.deepEqual(unreadItems(after, state).map(i => i.key), ['c']);
  assert.deepEqual(unreadItems(after, markRead(state, after)), []);
  assert.deepEqual(unreadItems(after, null), []); // état pas encore chargé : rien à signaler
});

test('buildMigrationSync : paquets de l\'app et de l\'alternative choisie', () => {
  const app = {
    id: 'w', name: 'WhatsApp', playStoreUrl: 'https://play.google.com/store/apps/details?id=com.whatsapp',
    alternative: 'Signal', altPlayStoreUrl: 'https://play.google.com/store/apps/details?id=org.thoughtcrime.securesms',
  };
  const catalog = [{ id: 'olvid', name: 'Olvid', playStoreUrl: 'https://play.google.com/store/apps/details?id=io.olvid.messenger' }];

  const [chosen] = buildMigrationSync([{ app, altId: 'olvid', altName: 'Olvid', completed: 1, total: 4, updatedAt: 5 }], catalog);
  assert.deepEqual(chosen, {
    appId: 'w', appName: 'WhatsApp', altName: 'Olvid', appPackage: 'com.whatsapp',
    altPackage: 'io.olvid.messenger', completed: 1, total: 4, updatedAt: 5,
  });

  // Alternative choisie absente du catalogue chargé et différente de la carte : paquet inconnu
  const [unknown] = buildMigrationSync([{ app, altId: 'autre', altName: 'Autre', completed: 1, total: 4 }], catalog);
  assert.equal(unknown.altPackage, null);

  // Sans choix explicite : l'alternative de la carte
  const [fallback] = buildMigrationSync([{ app, altId: null, altName: null, completed: 1, total: 4 }], catalog);
  assert.equal(fallback.altPackage, 'org.thoughtcrime.securesms');
  assert.equal(fallback.altName, 'Signal');
});

test('buildInboxItems : la cloche reprend chaque notification reçue, sans doublon', () => {
  const nativeHistory = [
    // suggestion d'alternative : reçue, donc listée avec son texte
    { key: 'nudge:w:2026-11-19', kind: 'nudge', appId: 'w', appName: 'WhatsApp', at: NOW, title: 'WhatsApp est noté D', text: 'Signal (A) fait la même chose', priority: PRIORITY.NUDGE },
    // relance d'un parcours sans date côté web : seul le téléphone la connaît
    { key: 'rem:g:1', kind: 'migration', appId: 'g', appName: 'Gmail', at: NOW, title: 'Migration Gmail → Proton Mail', text: 'Étape 1 sur 4', priority: PRIORITY.MIGRATION_REMINDER },
    // changement de note aussi calculé côté web : une seule ligne (version web)
    { key: 'grade:s:2026-11-12:A', kind: 'grade', appId: 's', appName: 'Signal', at: NOW, title: 'Signal progresse', text: 'x', priority: PRIORITY.GRADE_UP },
    // résumé de plusieurs notes : non repris, chaque changement est déjà listé
    { key: 'grades:2026-11-19:2', kind: 'grade', at: NOW, title: '2 de tes apps ont changé de note', text: 'x', priority: PRIORITY.GRADE_DOWN },
  ];
  const items = buildInboxItems({
    gradeChanges: [{ appId: 's', name: 'Signal', previousGrade: 'B', grade: 'A', date: '2026-11-12' }],
    myAppIds: ['w', 'g', 's'],
    nativeHistory,
    now: NOW,
  });
  const keys = items.map(i => i.key);
  assert.deepEqual(keys.sort(), ['grade:s:2026-11-12:A', 'nudge:w:2026-11-19', 'rem:g:1'].sort());
  const nudge = items.find(i => i.kind === 'nudge');
  assert.equal(nudge.native, true);
  assert.equal(nudge.data.title, 'WhatsApp est noté D');
  assert.equal(items.find(i => i.key === 'grade:s:2026-11-12:A').native, undefined); // version web, plus riche
});
