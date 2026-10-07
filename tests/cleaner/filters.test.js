import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CLEANER_FILTERS, matchesFilter } from '../../src/cleaner/filters.js';

const NOW = Date.UTC(2026, 9, 7);
const daysAgo = (d) => NOW - d * 24 * 60 * 60 * 1000;
const filter = (id) => CLEANER_FILTERS.find((f) => f.id === id);
const hit = (id, path, info) => matchesFilter(filter(id), path, { nowMs: NOW, modifiedMs: daysAgo(100), ...info });

test('les identifiants de filtres sont uniques et chaque règle est exploitable', () => {
  const ids = CLEANER_FILTERS.map((f) => f.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const f of CLEANER_FILTERS) {
    for (const r of f.rules) {
      assert.ok(r.exts || r.nameRegex || r.anyFile || r.emptyDirs, `${f.id}: règle sans critère`);
      if (r.under) assert.ok(r.under.endsWith('/') && r.under === r.under.toLowerCase(), `${f.id}: under mal formé`);
    }
  }
});

test('téléchargements incomplets : extension et ancienneté minimale', () => {
  assert.ok(hit('incomplete-downloads', 'Download/film.mp4.crdownload', { modifiedMs: daysAgo(3) }));
  assert.ok(!hit('incomplete-downloads', 'Download/film.mp4.crdownload', { modifiedMs: daysAgo(0.1) }));
  assert.ok(!hit('incomplete-downloads', 'Download/film.mp4'));
});

test('les règles globales ignorent android/ mais pas les dossiers utilisateur', () => {
  assert.ok(hit('temp-files', 'Documents/x.TMP'));
  assert.ok(!hit('temp-files', 'Android/media/foo/x.tmp'));
  assert.ok(!hit('logs-and-reports', 'Android/data/foo/app.log'));
});

test('miniatures et statuts WhatsApp', () => {
  assert.ok(hit('orphan-thumbnails', 'DCIM/.thumbnails/123.jpg'));
  assert.ok(!hit('orphan-thumbnails', 'DCIM/Camera/123.jpg'));
  assert.ok(hit('whatsapp-statuses', 'Android/media/com.whatsapp/WhatsApp/Media/.Statuses/a.mp4'));
  assert.ok(!hit('whatsapp-statuses', 'Android/media/com.whatsapp/WhatsApp/Media/.Statuses/a.mp4', { modifiedMs: daysAgo(2) }));
  assert.ok(!hit('whatsapp-statuses', 'Android/media/com.whatsapp/WhatsApp/Media/WhatsApp Images/a.jpg'));
});

test('APK et OTA : uniquement dans Download, et OTA par nom', () => {
  assert.ok(hit('old-apks', 'Download/app.apk'));
  assert.ok(!hit('old-apks', 'Documents/app.apk'));
  assert.ok(hit('ota-leftovers', 'Download/OTA-update-12.zip'));
  assert.ok(!hit('ota-leftovers', 'Download/photos.zip'));
});

test('dossiers vides : seulement les dossiers, vides et anciens', () => {
  assert.ok(hit('empty-directories', 'Old/Stuff', { isDir: true, isEmpty: true }));
  assert.ok(!hit('empty-directories', 'Old/Stuff', { isDir: true, isEmpty: false }));
  assert.ok(!hit('empty-directories', 'Old/Stuff', { isDir: true, isEmpty: true, modifiedMs: daysAgo(2) }));
  assert.ok(!hit('empty-directories', 'Old/file.txt'));
  assert.ok(!hit('temp-files', 'Old/tmp.tmp', { isDir: true, isEmpty: true }));
});
